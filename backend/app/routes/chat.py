from flask import Blueprint, request, jsonify
from datetime import datetime
from .. import db, limiter
from ..models import Conversation, Message, Memory, UserPreference
from ..auth import token_required
from ..ai_service import chat_with_ai, check_safety

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/conversations", methods=["GET"])
@token_required
def get_conversations(current_user):
    search = request.args.get("search", "").strip()
    query = Conversation.query.filter_by(user_id=current_user.id)

    if search:
        query = query.filter(Conversation.title.ilike(f"%{search}%"))

    conversations = query.order_by(Conversation.updated_at.desc()).all()
    return jsonify({"conversations": [c.to_dict() for c in conversations]}), 200


@chat_bp.route("/conversations", methods=["POST"])
@token_required
def create_conversation(current_user):
    data = request.get_json() or {}
    title = data.get("title", "New Conversation")

    conv = Conversation(user_id=current_user.id, title=title)
    db.session.add(conv)
    db.session.commit()

    return jsonify({"conversation": conv.to_dict()}), 201


@chat_bp.route("/conversations/<int:conv_id>", methods=["GET"])
@token_required
def get_conversation(current_user, conv_id):
    conv = Conversation.query.filter_by(id=conv_id, user_id=current_user.id).first()
    if not conv:
        return jsonify({"error": "Conversation not found"}), 404

    messages = [m.to_dict() for m in conv.messages if not m.is_deleted]
    return jsonify({
        "conversation": conv.to_dict(),
        "messages": messages,
    }), 200


@chat_bp.route("/conversations/<int:conv_id>", methods=["PUT"])
@token_required
def update_conversation(current_user, conv_id):
    conv = Conversation.query.filter_by(id=conv_id, user_id=current_user.id).first()
    if not conv:
        return jsonify({"error": "Conversation not found"}), 404

    data = request.get_json() or {}
    if "title" in data:
        conv.title = data["title"][:255]
    if "is_favorite" in data:
        conv.is_favorite = bool(data["is_favorite"])

    db.session.commit()
    return jsonify({"conversation": conv.to_dict()}), 200


@chat_bp.route("/conversations/<int:conv_id>", methods=["DELETE"])
@token_required
def delete_conversation(current_user, conv_id):
    conv = Conversation.query.filter_by(id=conv_id, user_id=current_user.id).first()
    if not conv:
        return jsonify({"error": "Conversation not found"}), 404

    db.session.delete(conv)
    db.session.commit()
    return jsonify({"message": "Conversation deleted"}), 200


@chat_bp.route("/chat/history", methods=["GET"])
@token_required
def get_chat_history(current_user):
    latest_conv = Conversation.query.filter_by(user_id=current_user.id).order_by(Conversation.updated_at.desc()).first()
    if not latest_conv:
        return jsonify({"messages": []}), 200
    messages = [m.to_dict() for m in latest_conv.messages if not m.is_deleted]
    return jsonify({"messages": messages, "conversation_id": latest_conv.id}), 200


@chat_bp.route("/chat/history", methods=["DELETE"])
@token_required
def clear_chat_history(current_user):
    convs = Conversation.query.filter_by(user_id=current_user.id).all()
    for conv in convs:
        for msg in conv.messages:
            msg.is_deleted = True
    db.session.commit()
    return jsonify({"message": "History cleared"}), 200


@chat_bp.route("/chat", methods=["POST"])
@token_required
@limiter.limit("60 per hour")
def send_message(current_user):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    content = data.get("message", "").strip()
    conversation_id = data.get("conversation_id")

    if not content:
        return jsonify({"error": "Message cannot be empty"}), 400

    if len(content) > 5000:
        return jsonify({"error": "Message too long (max 5000 characters)"}), 400

    # Safety check
    safety_result = check_safety(content)
    if safety_result:
        return jsonify({
            "response": safety_result["message"],
            "safety_type": safety_result["type"],
            "conversation_id": conversation_id,
        }), 200

    try:
        # Get or create conversation
        if conversation_id:
            conv = Conversation.query.filter_by(id=conversation_id, user_id=current_user.id).first()
            if not conv:
                return jsonify({"error": "Conversation not found"}), 404
        else:
            # Auto-generate title from first message
            title = content[:50] + ("..." if len(content) > 50 else "")
            conv = Conversation(user_id=current_user.id, title=title)
            db.session.add(conv)
            db.session.flush()

        # Get conversation history (last 20 messages for context)
        history = [
            {"role": m.role, "content": m.content}
            for m in conv.messages[-20:]
            if not m.is_deleted
        ]

        # Add current message to history
        history.append({"role": "user", "content": content})

        # Get user preferences for response style
        pref = current_user.preferences[0] if current_user.preferences else None
        response_style = pref.ai_response_style if pref else "balanced"

        # Get memories
        memories = Memory.query.filter_by(user_id=current_user.id).all()

        # Call AI
        ai_response = chat_with_ai(
            messages=history,
            profile=current_user.profile,
            memories=memories,
            response_style=response_style,
        )

        # Save messages
        user_msg = Message(
            conversation_id=conv.id,
            role="user",
            content=content,
        )
        ai_msg = Message(
            conversation_id=conv.id,
            role="assistant",
            content=ai_response,
        )
        db.session.add(user_msg)
        db.session.add(ai_msg)

        # Update conversation timestamp
        conv.updated_at = datetime.utcnow()
        db.session.commit()

        # Award XP for first message of day
        current_user.xp_points = (current_user.xp_points or 0) + 2
        db.session.commit()

        return jsonify({
            "response": ai_response,
            "reply": ai_response,
            "conversation_id": conv.id,
            "user_message_id": user_msg.id,
            "ai_message_id": ai_msg.id,
        }), 200

    except (ValueError, ConnectionError, TimeoutError, RuntimeError) as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 503
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to process your message. Please try again."}), 500


@chat_bp.route("/chat/regenerate", methods=["POST"])
@token_required
@limiter.limit("20 per hour")
def regenerate_response(current_user):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    conversation_id = data.get("conversation_id")
    message_id = data.get("message_id")

    if not conversation_id:
        return jsonify({"error": "conversation_id is required"}), 400

    conv = Conversation.query.filter_by(id=conversation_id, user_id=current_user.id).first()
    if not conv:
        return jsonify({"error": "Conversation not found"}), 404

    try:
        # Get history up to last user message
        messages = [m for m in conv.messages if not m.is_deleted]
        if not messages:
            return jsonify({"error": "No messages to regenerate"}), 400

        # Find last user message
        history = []
        for m in messages:
            if m.id == message_id and m.role == "assistant":
                break
            history.append({"role": m.role, "content": m.content})

        if not history:
            history = [{"role": m.role, "content": m.content} for m in messages[:-1]]

        memories = Memory.query.filter_by(user_id=current_user.id).all()
        pref = current_user.preferences[0] if current_user.preferences else None
        response_style = pref.ai_response_style if pref else "balanced"

        ai_response = chat_with_ai(
            messages=history,
            profile=current_user.profile,
            memories=memories,
            response_style=response_style,
        )

        # Update the AI message if provided
        if message_id:
            msg = Message.query.filter_by(id=message_id, conversation_id=conv.id).first()
            if msg and msg.role == "assistant":
                msg.content = ai_response
                msg.timestamp = datetime.utcnow()
                db.session.commit()

        return jsonify({"response": ai_response}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 503


@chat_bp.route("/messages/<int:msg_id>", methods=["DELETE"])
@token_required
def delete_message(current_user, msg_id):
    msg = Message.query.get(msg_id)
    if not msg:
        return jsonify({"error": "Message not found"}), 404

    # Verify ownership
    conv = Conversation.query.filter_by(id=msg.conversation_id, user_id=current_user.id).first()
    if not conv:
        return jsonify({"error": "Unauthorized"}), 403

    msg.is_deleted = True
    db.session.commit()
    return jsonify({"message": "Message deleted"}), 200

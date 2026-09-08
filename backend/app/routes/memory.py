from flask import Blueprint, request, jsonify
from .. import db
from ..models import Memory, UserPreference, User, Conversation, HealthProfile
from ..auth import token_required, hash_password, verify_password, validate_password_strength

memory_bp = Blueprint("memory", __name__)


@memory_bp.route("", methods=["GET"])
@token_required
def get_memories(current_user):
    memories = Memory.query.filter_by(user_id=current_user.id).order_by(
        Memory.updated_at.desc()
    ).all()
    return jsonify({"memories": [m.to_dict() for m in memories]}), 200


@memory_bp.route("", methods=["POST"])
@token_required
def add_memory(current_user):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    key = data.get("key", "").strip()
    value = data.get("value", "").strip()

    if not key or not value:
        return jsonify({"error": "Key and value are required"}), 400

    # Update existing or create
    existing = Memory.query.filter_by(user_id=current_user.id, key=key).first()
    if existing:
        existing.value = value[:500]
        existing.category = data.get("category", existing.category)
    else:
        memory = Memory(
            user_id=current_user.id,
            key=key[:100],
            value=value[:500],
            category=data.get("category", "preference"),
        )
        db.session.add(memory)

    db.session.commit()
    return jsonify({"message": "Memory saved"}), 200


@memory_bp.route("/<int:memory_id>", methods=["DELETE"])
@token_required
def delete_memory(current_user, memory_id):
    memory = Memory.query.filter_by(id=memory_id, user_id=current_user.id).first()
    if not memory:
        return jsonify({"error": "Memory not found"}), 404

    db.session.delete(memory)
    db.session.commit()
    return jsonify({"message": "Memory deleted"}), 200


@memory_bp.route("/preferences", methods=["GET"])
@token_required
def get_preferences(current_user):
    pref = current_user.preferences[0] if current_user.preferences else None
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.session.add(pref)
        db.session.commit()
    return jsonify({"preferences": pref.to_dict()}), 200


@memory_bp.route("/preferences", methods=["PUT"])
@token_required
def update_preferences(current_user):
    data = request.get_json() or {}

    pref = current_user.preferences[0] if current_user.preferences else None
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.session.add(pref)

    valid_themes = ["light", "dark", "system"]
    valid_styles = ["concise", "balanced", "detailed"]

    if "theme" in data and data["theme"] in valid_themes:
        pref.theme = data["theme"]
    if "ai_response_style" in data and data["ai_response_style"] in valid_styles:
        pref.ai_response_style = data["ai_response_style"]
    if "notifications_enabled" in data:
        pref.notifications_enabled = bool(data["notifications_enabled"])
    if "evidence_mode" in data:
        pref.evidence_mode = bool(data["evidence_mode"])
    if "tts_enabled" in data:
        pref.tts_enabled = bool(data["tts_enabled"])

    db.session.commit()
    return jsonify({"preferences": pref.to_dict()}), 200


@memory_bp.route("/account/update", methods=["PUT"])
@token_required
def update_account(current_user):
    data = request.get_json() or {}

    if "full_name" in data:
        name = data["full_name"].strip()
        if len(name) < 2:
            return jsonify({"error": "Name must be at least 2 characters"}), 400
        current_user.full_name = name

    if "password" in data:
        old_password = data.get("old_password", "")
        new_password = data["password"]

        if not verify_password(old_password, current_user.password_hash):
            return jsonify({"error": "Current password is incorrect"}), 400

        is_strong, msg = validate_password_strength(new_password)
        if not is_strong:
            return jsonify({"error": msg}), 400

        current_user.password_hash = hash_password(new_password)

    db.session.commit()
    return jsonify({"message": "Account updated", "user": current_user.to_dict()}), 200


@memory_bp.route("/account/delete", methods=["DELETE"])
@token_required
def delete_account(current_user):
    data = request.get_json() or {}
    password = data.get("password", "")

    if not verify_password(password, current_user.password_hash):
        return jsonify({"error": "Incorrect password. Account deletion cancelled."}), 400

    db.session.delete(current_user)
    db.session.commit()
    return jsonify({"message": "Account deleted successfully"}), 200


@memory_bp.route("/conversations/clear", methods=["DELETE"])
@token_required
def clear_conversations(current_user):
    Conversation.query.filter_by(user_id=current_user.id).delete()
    db.session.commit()
    return jsonify({"message": "All conversations cleared"}), 200

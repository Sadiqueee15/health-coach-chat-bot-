import json
import base64
from flask import Blueprint, request, jsonify
from datetime import datetime
from .. import db, limiter
from ..models import FoodLog
from ..auth import token_required
from ..ai_service import analyze_food_image

food_bp = Blueprint("food", __name__)

ALLOWED_MIME_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"}


@food_bp.route("/analyze", methods=["POST"])
@token_required
@limiter.limit("20 per hour")
def analyze_food(current_user):
    if "image" not in request.files and "image_data" not in request.json if request.is_json else True:
        # Check for file upload
        if "image" not in request.files:
            return jsonify({"error": "No image provided"}), 400

    try:
        if request.files and "image" in request.files:
            file = request.files["image"]
            if file.filename == "":
                return jsonify({"error": "No file selected"}), 400

            mime_type = file.content_type
            if mime_type not in ALLOWED_MIME_TYPES:
                return jsonify({"error": "Unsupported image format. Please use JPEG, PNG, or WebP."}), 400

            image_data = file.read()
            if len(image_data) > 10 * 1024 * 1024:  # 10MB
                return jsonify({"error": "Image too large. Maximum 10MB."}), 400

        elif request.is_json:
            data = request.get_json()
            image_b64 = data.get("image_data", "")
            mime_type = data.get("mime_type", "image/jpeg")

            if not image_b64:
                return jsonify({"error": "No image data provided"}), 400

            if mime_type not in ALLOWED_MIME_TYPES:
                return jsonify({"error": "Unsupported image format"}), 400

            # Decode base64
            if "," in image_b64:
                image_b64 = image_b64.split(",")[1]
            image_data = base64.b64decode(image_b64)
        else:
            return jsonify({"error": "No image provided"}), 400

        result = analyze_food_image(image_data, mime_type)

        return jsonify({
            "analysis": result,
            "disclaimer": "Nutrition values are estimates and may vary significantly based on portion size, ingredients, preparation method, and image quality."
        }), 200

    except RuntimeError as e:
        return jsonify({"error": str(e)}), 503
    except Exception as e:
        return jsonify({"error": "Image analysis failed. Please try again with a clearer image."}), 500


@food_bp.route("/log", methods=["POST"])
@token_required
def log_food(current_user):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    try:
        food_items = data.get("food_items", [])
        log = FoodLog(
            user_id=current_user.id,
            meal_type=data.get("meal_type", "snack"),
            food_items=json.dumps(food_items),
            calories=float(data.get("calories", 0)),
            protein_g=float(data.get("protein_g", 0)),
            carbs_g=float(data.get("carbs_g", 0)),
            fat_g=float(data.get("fat_g", 0)),
            notes=data.get("notes", ""),
        )
        db.session.add(log)
        db.session.commit()

        return jsonify({"message": "Food logged successfully", "log": log.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to log food. Please try again."}), 500


@food_bp.route("/history", methods=["GET"])
@token_required
def get_food_history(current_user):
    days = request.args.get("days", 7, type=int)
    days = min(max(days, 1), 90)

    from datetime import timedelta
    cutoff = datetime.utcnow() - timedelta(days=days)

    logs = FoodLog.query.filter(
        FoodLog.user_id == current_user.id,
        FoodLog.logged_at >= cutoff
    ).order_by(FoodLog.logged_at.desc()).all()

    return jsonify({"logs": [log.to_dict() for log in logs]}), 200

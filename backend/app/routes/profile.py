import json
from flask import Blueprint, request, jsonify
from .. import db
from ..models import HealthProfile, Habit
from ..auth import token_required

profile_bp = Blueprint("profile", __name__)

DEFAULT_HABITS = [
    {"name": "Drink enough water", "icon": "💧", "target": "As per daily goal"},
    {"name": "Exercise", "icon": "🏃", "target": "As per workout plan"},
    {"name": "Walk 7000+ steps", "icon": "👟", "target": "7000 steps"},
    {"name": "Sleep target", "icon": "😴", "target": "As per sleep goal"},
    {"name": "Eat healthy meals", "icon": "🥗", "target": "3 healthy meals"},
]


@profile_bp.route("", methods=["GET"])
@token_required
def get_profile(current_user):
    if not current_user.profile:
        return jsonify({"profile": None}), 200
    return jsonify({"profile": current_user.profile.to_dict()}), 200


@profile_bp.route("", methods=["PUT"])
@token_required
def update_profile(current_user):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request body"}), 400

    try:
        profile = current_user.profile
        is_new = False

        if not profile:
            profile = HealthProfile(user_id=current_user.id)
            db.session.add(profile)
            is_new = True

        # Update fields
        if "age" in data:
            age = data["age"]
            if age and (int(age) < 10 or int(age) > 120):
                return jsonify({"error": "Please enter a valid age (10-120)"}), 400
            profile.age = int(age) if age else None

        if "gender" in data:
            profile.gender = data["gender"]

        if "height_cm" in data:
            h = data["height_cm"]
            if h and (float(h) < 50 or float(h) > 300):
                return jsonify({"error": "Please enter a valid height (50-300 cm)"}), 400
            profile.height_cm = float(h) if h else None

        if "weight_kg" in data:
            w = data["weight_kg"]
            if w and (float(w) < 20 or float(w) > 500):
                return jsonify({"error": "Please enter a valid weight (20-500 kg)"}), 400
            profile.weight_kg = float(w) if w else None

        if "fitness_goal" in data:
            profile.fitness_goal = data["fitness_goal"]

        if "activity_level" in data:
            profile.activity_level = data["activity_level"]

        if "dietary_preference" in data:
            profile.dietary_preference = data["dietary_preference"]

        if "allergies" in data:
            allergies = data["allergies"]
            profile.allergies = json.dumps(allergies if isinstance(allergies, list) else [])

        if "sleep_target_hours" in data:
            profile.sleep_target_hours = float(data["sleep_target_hours"]) if data["sleep_target_hours"] else 8.0

        if "water_target_liters" in data:
            profile.water_target_liters = float(data["water_target_liters"]) if data["water_target_liters"] else 2.5

        if "workout_duration_min" in data:
            profile.workout_duration_min = int(data["workout_duration_min"]) if data["workout_duration_min"] else 45

        if "available_equipment" in data:
            eq = data["available_equipment"]
            profile.available_equipment = json.dumps(eq if isinstance(eq, list) else [])

        if "preferred_workout_type" in data:
            profile.preferred_workout_type = data["preferred_workout_type"]

        db.session.commit()

        # Create default habits for new profiles
        if is_new and not current_user.habits:
            for habit_data in DEFAULT_HABITS:
                habit = Habit(
                    user_id=current_user.id,
                    name=habit_data["name"],
                    icon=habit_data["icon"],
                    target=habit_data["target"],
                    is_default=True,
                )
                db.session.add(habit)
            db.session.commit()

        # Award XP for completing profile
        if is_new:
            current_user.xp_points = (current_user.xp_points or 0) + 100
            db.session.commit()

        return jsonify({
            "message": "Profile updated successfully",
            "profile": profile.to_dict(),
        }), 200

    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Invalid data: {str(e)}"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update profile. Please try again."}), 500

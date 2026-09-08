import json
from flask import Blueprint, request, jsonify
from .. import db, limiter
from ..models import MealPlan
from ..auth import token_required
from ..ai_service import generate_meal_plan

meal_bp = Blueprint("meal", __name__)


@meal_bp.route("/generate", methods=["POST"])
@token_required
@limiter.limit("10 per hour")
def generate_meal(current_user):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    # Merge allergies from profile
    allergies = data.get("allergies", [])
    if current_user.profile and current_user.profile.allergies:
        profile_allergies = json.loads(current_user.profile.allergies) if isinstance(current_user.profile.allergies, str) else []
        allergies = list(set(allergies + profile_allergies))

    params = {
        "goal": data.get("goal", "Healthy eating"),
        "dietary_preference": data.get("dietary_preference") or (
            current_user.profile.dietary_preference if current_user.profile else "No preference"
        ),
        "allergies": allergies,
        "num_meals": min(max(int(data.get("num_meals", 3)), 2), 6),
        "budget": data.get("budget", "Moderate"),
        "cuisine": data.get("cuisine", "Any"),
    }

    try:
        plan_data = generate_meal_plan(params, current_user.profile)

        total_calories = plan_data.get("daily_totals", {}).get("calories", 0)

        meal_plan = MealPlan(
            user_id=current_user.id,
            title=plan_data.get("title", "My Meal Plan"),
            goal=params["goal"],
            dietary_preference=params["dietary_preference"],
            num_meals=params["num_meals"],
            plan_data=json.dumps(plan_data),
            total_calories=total_calories,
            is_saved=False,
        )
        db.session.add(meal_plan)
        db.session.commit()

        return jsonify({
            "meal_plan": meal_plan.to_dict(),
            "plan": plan_data,
        }), 200

    except (ValueError, RuntimeError) as e:
        return jsonify({"error": str(e)}), 503


@meal_bp.route("/plans", methods=["GET"])
@token_required
def get_meal_plans(current_user):
    plans = MealPlan.query.filter_by(
        user_id=current_user.id, is_saved=True
    ).order_by(MealPlan.created_at.desc()).all()

    return jsonify({"meal_plans": [p.to_dict() for p in plans]}), 200


@meal_bp.route("/plans/<int:plan_id>/save", methods=["PUT"])
@token_required
def save_meal_plan(current_user, plan_id):
    plan = MealPlan.query.filter_by(id=plan_id, user_id=current_user.id).first()
    if not plan:
        return jsonify({"error": "Meal plan not found"}), 404

    plan.is_saved = True
    db.session.commit()

    return jsonify({"message": "Meal plan saved!", "meal_plan": plan.to_dict()}), 200

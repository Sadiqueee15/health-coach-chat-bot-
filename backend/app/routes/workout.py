import json
from flask import Blueprint, request, jsonify
from .. import db, limiter
from ..models import Workout, WorkoutSession
from ..auth import token_required
from ..ai_service import generate_workout_plan, generate_seven_day_plan

workout_bp = Blueprint("workout", __name__)


@workout_bp.route("/generate", methods=["POST"])
@token_required
@limiter.limit("10 per hour")
def generate_workout(current_user):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    params = {
        "goal": data.get("goal", "General fitness"),
        "experience_level": data.get("experience_level", "Beginner"),
        "days_per_week": min(max(int(data.get("days_per_week", 3)), 1), 7),
        "duration_min": min(max(int(data.get("duration_min", 45)), 10), 120),
        "equipment": data.get("equipment", ["No equipment"]),
        "workout_type": data.get("workout_type", "Mixed"),
    }

    try:
        plan = generate_workout_plan(params, current_user.profile)

        workout = Workout(
            user_id=current_user.id,
            title=plan.get("title", "My Workout Plan"),
            goal=params["goal"],
            experience_level=params["experience_level"],
            days_per_week=params["days_per_week"],
            duration_min=params["duration_min"],
            equipment=json.dumps(params["equipment"]),
            workout_type=params["workout_type"],
            plan_data=json.dumps(plan),
            is_saved=False,
        )
        db.session.add(workout)
        db.session.commit()

        return jsonify({
            "workout": workout.to_dict(),
            "plan": plan,
        }), 200

    except (ValueError, RuntimeError) as e:
        return jsonify({"error": str(e)}), 503


@workout_bp.route("/save/<int:workout_id>", methods=["PUT"])
@token_required
def save_workout(current_user, workout_id):
    workout = Workout.query.filter_by(id=workout_id, user_id=current_user.id).first()
    if not workout:
        return jsonify({"error": "Workout not found"}), 404

    workout.is_saved = True
    db.session.commit()

    # Award XP
    current_user.xp_points = (current_user.xp_points or 0) + 20
    db.session.commit()

    return jsonify({"message": "Workout saved!", "workout": workout.to_dict()}), 200


@workout_bp.route("", methods=["GET"])
@token_required
def get_workouts(current_user):
    saved_only = request.args.get("saved", "false").lower() == "true"
    query = Workout.query.filter_by(user_id=current_user.id)
    if saved_only:
        query = query.filter_by(is_saved=True)

    workouts = query.order_by(Workout.created_at.desc()).all()
    return jsonify({"workouts": [w.to_dict() for w in workouts]}), 200


@workout_bp.route("/session", methods=["POST"])
@token_required
def log_session(current_user):
    data = request.get_json() or {}
    workout_id = data.get("workout_id")

    if workout_id:
        workout = Workout.query.filter_by(id=workout_id, user_id=current_user.id).first()
        if not workout:
            return jsonify({"error": "Workout not found"}), 404

    session = WorkoutSession(
        workout_id=workout_id,
        user_id=current_user.id,
        duration_min=data.get("duration_min"),
        notes=data.get("notes", ""),
    )
    db.session.add(session)

    # Award XP for completing workout
    current_user.xp_points = (current_user.xp_points or 0) + 50
    db.session.commit()

    return jsonify({"message": "Workout session logged!", "session": session.to_dict()}), 201


@workout_bp.route("/seven-day-plan", methods=["POST"])
@token_required
@limiter.limit("5 per hour")
def generate_week_plan(current_user):
    data = request.get_json() or {}
    try:
        plan = generate_seven_day_plan(data, current_user.profile)
        return jsonify({"plan": plan}), 200
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 503

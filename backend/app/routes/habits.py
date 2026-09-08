from flask import Blueprint, request, jsonify
from datetime import datetime, date, timedelta
from .. import db
from ..models import Habit, HabitCompletion, UserBadge
from ..auth import token_required

habits_bp = Blueprint("habits", __name__)

BADGES = {
    "first_habit": {"name": "First Steps", "description": "Completed your first habit"},
    "streak_7": {"name": "7-Day Streak", "description": "Maintained a 7-day habit streak"},
    "streak_30": {"name": "Consistency Champion", "description": "Maintained a 30-day habit streak"},
    "hydration_hero": {"name": "Hydration Hero", "description": "Completed hydration habits 10 times"},
    "workout_10": {"name": "Fitness Enthusiast", "description": "Completed 10 workout habits"},
}


def award_badge(user, badge_key: str):
    """Award a badge if user doesn't already have it."""
    existing = UserBadge.query.filter_by(user_id=user.id, badge_key=badge_key).first()
    if not existing and badge_key in BADGES:
        badge_info = BADGES[badge_key]
        badge = UserBadge(
            user_id=user.id,
            badge_key=badge_key,
            badge_name=badge_info["name"],
            badge_description=badge_info["description"],
        )
        db.session.add(badge)
        user.xp_points = (user.xp_points or 0) + 50
        return True
    return False


def calculate_streak(habit_id: int, user_id: int) -> int:
    """Calculate the current streak for a habit."""
    completions = HabitCompletion.query.filter_by(
        habit_id=habit_id, user_id=user_id
    ).order_by(HabitCompletion.completed_date.desc()).all()

    if not completions:
        return 0

    streak = 0
    today = date.today()
    expected_date = today

    for completion in completions:
        if completion.completed_date == expected_date:
            streak += 1
            expected_date -= timedelta(days=1)
        elif completion.completed_date == expected_date - timedelta(days=1):
            # Allow yesterday's completion
            continue
        else:
            break

    return streak


@habits_bp.route("", methods=["GET"])
@token_required
def get_habits(current_user):
    habits = Habit.query.filter_by(user_id=current_user.id, is_active=True).all()
    today = date.today()

    result = []
    for habit in habits:
        # Check if completed today
        completion = HabitCompletion.query.filter_by(
            habit_id=habit.id,
            user_id=current_user.id,
            completed_date=today
        ).first()

        habit_dict = habit.to_dict()
        habit_dict["completed_today"] = completion is not None
        habit_dict["streak"] = calculate_streak(habit.id, current_user.id)
        result.append(habit_dict)

    return jsonify({"habits": result}), 200


@habits_bp.route("", methods=["POST"])
@token_required
def create_habit(current_user):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Habit name is required"}), 400

    # Limit habits per user
    count = Habit.query.filter_by(user_id=current_user.id, is_active=True).count()
    if count >= 20:
        return jsonify({"error": "Maximum 20 active habits allowed"}), 400

    habit = Habit(
        user_id=current_user.id,
        name=name[:100],
        icon=data.get("icon", "⭐"),
        target=data.get("target", ""),
    )
    db.session.add(habit)
    db.session.commit()

    return jsonify({"message": "Habit created!", "habit": habit.to_dict()}), 201


@habits_bp.route("/<int:habit_id>", methods=["PUT"])
@token_required
def update_habit(current_user, habit_id):
    habit = Habit.query.filter_by(id=habit_id, user_id=current_user.id).first()
    if not habit:
        return jsonify({"error": "Habit not found"}), 404

    data = request.get_json() or {}

    if "name" in data:
        habit.name = data["name"][:100]
    if "icon" in data:
        habit.icon = data["icon"]
    if "target" in data:
        habit.target = data["target"]
    if "is_active" in data:
        habit.is_active = bool(data["is_active"])

    db.session.commit()
    return jsonify({"habit": habit.to_dict()}), 200


@habits_bp.route("/<int:habit_id>", methods=["DELETE"])
@token_required
def delete_habit(current_user, habit_id):
    habit = Habit.query.filter_by(id=habit_id, user_id=current_user.id).first()
    if not habit:
        return jsonify({"error": "Habit not found"}), 404

    habit.is_active = False
    db.session.commit()
    return jsonify({"message": "Habit removed"}), 200


@habits_bp.route("/<int:habit_id>/complete", methods=["POST"])
@token_required
def complete_habit(current_user, habit_id):
    habit = Habit.query.filter_by(id=habit_id, user_id=current_user.id).first()
    if not habit:
        return jsonify({"error": "Habit not found"}), 404

    today = date.today()

    # Check if already completed
    existing = HabitCompletion.query.filter_by(
        habit_id=habit_id, user_id=current_user.id, completed_date=today
    ).first()

    data = request.get_json() or {}
    uncomplete = data.get("uncomplete", False)

    if uncomplete:
        if existing:
            db.session.delete(existing)
            db.session.commit()
        return jsonify({"message": "Habit uncompleted", "completed": False}), 200

    if existing:
        return jsonify({"message": "Already completed today", "completed": True}), 200

    completion = HabitCompletion(
        habit_id=habit_id,
        user_id=current_user.id,
        completed_date=today,
    )
    db.session.add(completion)

    # Calculate and update streak
    streak = calculate_streak(habit_id, current_user.id) + 1
    habit.streak = streak

    # Award XP
    current_user.xp_points = (current_user.xp_points or 0) + 10
    db.session.commit()

    # Check badges
    badges_earned = []

    # First habit badge
    total_completions = HabitCompletion.query.filter_by(user_id=current_user.id).count()
    if total_completions == 1:
        if award_badge(current_user, "first_habit"):
            badges_earned.append("first_habit")

    # Streak badges
    if streak >= 7:
        if award_badge(current_user, "streak_7"):
            badges_earned.append("streak_7")
    if streak >= 30:
        if award_badge(current_user, "streak_30"):
            badges_earned.append("streak_30")

    if badges_earned:
        db.session.commit()

    return jsonify({
        "message": "Habit completed! +10 XP",
        "completed": True,
        "streak": streak,
        "badges_earned": badges_earned,
    }), 200


@habits_bp.route("/summary", methods=["GET"])
@token_required
def get_habit_summary(current_user):
    """Get weekly habit completion summary."""
    today = date.today()
    week_start = today - timedelta(days=6)

    habits = Habit.query.filter_by(user_id=current_user.id, is_active=True).all()
    if not habits:
        return jsonify({"summary": [], "total_habits": 0, "completion_rate": 0}), 200

    summary = []
    for habit in habits:
        week_completions = HabitCompletion.query.filter(
            HabitCompletion.habit_id == habit.id,
            HabitCompletion.user_id == current_user.id,
            HabitCompletion.completed_date >= week_start,
            HabitCompletion.completed_date <= today,
        ).count()

        summary.append({
            "habit_id": habit.id,
            "name": habit.name,
            "icon": habit.icon,
            "week_completions": week_completions,
            "completion_rate": round(week_completions / 7 * 100, 1),
            "streak": calculate_streak(habit.id, current_user.id),
        })

    # Overall completion rate
    total_possible = len(habits) * 7
    total_completed = sum(h["week_completions"] for h in summary)
    overall_rate = round(total_completed / total_possible * 100, 1) if total_possible > 0 else 0

    return jsonify({
        "summary": summary,
        "total_habits": len(habits),
        "completion_rate": overall_rate,
        "period": f"{week_start.isoformat()} to {today.isoformat()}",
    }), 200


@habits_bp.route("/badges", methods=["GET"])
@token_required
def get_badges(current_user):
    badges = UserBadge.query.filter_by(user_id=current_user.id).all()
    return jsonify({"badges": [b.to_dict() for b in badges], "xp": current_user.xp_points}), 200

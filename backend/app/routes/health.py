from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from .. import db
from ..models import HealthMetric
from ..auth import token_required

health_bp = Blueprint("health", __name__)

VALID_METRICS = {"weight", "water", "sleep", "steps", "calories", "heart_rate", "blood_pressure_systolic", "blood_pressure_diastolic"}
METRIC_UNITS = {
    "weight": "kg",
    "water": "liters",
    "sleep": "hours",
    "steps": "steps",
    "calories": "kcal",
    "heart_rate": "bpm",
    "blood_pressure_systolic": "mmHg",
    "blood_pressure_diastolic": "mmHg",
}


@health_bp.route("/metric", methods=["POST"])
@token_required
def log_metric(current_user):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    metric_type = data.get("metric_type", "").lower()
    value = data.get("value")

    if not metric_type:
        return jsonify({"error": "metric_type is required"}), 400

    if metric_type not in VALID_METRICS:
        return jsonify({"error": f"Invalid metric type. Valid: {', '.join(VALID_METRICS)}"}), 400

    try:
        value = float(value)
        if value < 0:
            return jsonify({"error": "Value must be positive"}), 400
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid value"}), 400

    metric = HealthMetric(
        user_id=current_user.id,
        metric_type=metric_type,
        value=value,
        unit=METRIC_UNITS.get(metric_type, ""),
    )
    db.session.add(metric)
    db.session.commit()

    return jsonify({"message": "Metric logged!", "metric": metric.to_dict()}), 201


@health_bp.route("/history", methods=["GET"])
@health_bp.route("/metrics", methods=["GET"])
@token_required
def get_history(current_user):
    metric_type = request.args.get("type")
    days = request.args.get("days", 30, type=int)
    days = min(max(days, 1), 365)

    cutoff = datetime.utcnow() - timedelta(days=days)
    query = HealthMetric.query.filter(
        HealthMetric.user_id == current_user.id,
        HealthMetric.recorded_at >= cutoff,
    )

    if metric_type:
        query = query.filter_by(metric_type=metric_type)

    metrics = query.order_by(HealthMetric.recorded_at.asc()).all()
    return jsonify({"metrics": [m.to_dict() for m in metrics]}), 200


@health_bp.route("/dashboard", methods=["GET"])
@token_required
def get_dashboard_data(current_user):
    """Get comprehensive dashboard data."""
    from ..models import Habit, HabitCompletion, Conversation
    from datetime import date
    from ..ai_service import generate_daily_insight

    today = date.today()

    # Today's habits
    habits = Habit.query.filter_by(user_id=current_user.id, is_active=True).all()
    habits_today = []
    habits_done = 0
    for h in habits:
        completed = HabitCompletion.query.filter_by(
            habit_id=h.id, user_id=current_user.id, completed_date=today
        ).first()
        if completed:
            habits_done += 1
        habits_today.append({**h.to_dict(), "completed_today": completed is not None})

    # Recent conversations
    recent_convs = Conversation.query.filter_by(user_id=current_user.id).order_by(
        Conversation.updated_at.desc()
    ).limit(5).all()

    # Recent metrics (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_metrics = HealthMetric.query.filter(
        HealthMetric.user_id == current_user.id,
        HealthMetric.recorded_at >= week_ago,
    ).all()

    # Group metrics by type
    metrics_by_type = {}
    for m in recent_metrics:
        if m.metric_type not in metrics_by_type:
            metrics_by_type[m.metric_type] = []
        metrics_by_type[m.metric_type].append(m.to_dict())

    # Generate daily insight
    insight = generate_daily_insight(current_user, {
        "goal": current_user.profile.fitness_goal if current_user.profile else "General fitness",
        "habits_done": habits_done,
        "habits_total": len(habits),
    })

    # Badges
    from ..models import UserBadge
    badges = UserBadge.query.filter_by(user_id=current_user.id).order_by(
        UserBadge.earned_at.desc()
    ).limit(5).all()

    return jsonify({
        "user": current_user.to_dict(),
        "profile": current_user.profile.to_dict() if current_user.profile else None,
        "habits": {
            "list": habits_today,
            "done": habits_done,
            "total": len(habits),
        },
        "recent_conversations": [c.to_dict() for c in recent_convs],
        "metrics": metrics_by_type,
        "daily_insight": insight,
        "badges": [b.to_dict() for b in badges],
        "xp_points": current_user.xp_points,
    }), 200

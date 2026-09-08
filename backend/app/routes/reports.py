import json
import io
from flask import Blueprint, request, jsonify, send_file
from datetime import date, timedelta, datetime
from .. import db
from ..models import WeeklyReport, Habit, HabitCompletion, WorkoutSession, HealthMetric, JournalEntry
from ..auth import token_required
from ..ai_service import generate_weekly_report

reports_bp = Blueprint("reports", __name__)


def collect_weekly_data(user, week_start: date, week_end: date) -> dict:
    """Collect all weekly data for report generation."""

    # Habit completion
    habits = Habit.query.filter_by(user_id=user.id, is_active=True).all()
    total_possible_habits = len(habits) * 7
    completed_habits = HabitCompletion.query.filter(
        HabitCompletion.user_id == user.id,
        HabitCompletion.completed_date >= week_start,
        HabitCompletion.completed_date <= week_end,
    ).count()
    habit_completion = (completed_habits / total_possible_habits * 100) if total_possible_habits > 0 else 0

    # Workouts
    workouts_completed = WorkoutSession.query.filter(
        WorkoutSession.user_id == user.id,
        WorkoutSession.completed_at >= datetime.combine(week_start, datetime.min.time()),
        WorkoutSession.completed_at <= datetime.combine(week_end, datetime.max.time()),
    ).count()

    # Sleep average
    sleep_metrics = HealthMetric.query.filter(
        HealthMetric.user_id == user.id,
        HealthMetric.metric_type == "sleep",
        HealthMetric.recorded_at >= datetime.combine(week_start, datetime.min.time()),
        HealthMetric.recorded_at <= datetime.combine(week_end, datetime.max.time()),
    ).all()
    avg_sleep = sum(m.value for m in sleep_metrics) / len(sleep_metrics) if sleep_metrics else 0

    # Hydration consistency (water logs)
    water_days = HealthMetric.query.filter(
        HealthMetric.user_id == user.id,
        HealthMetric.metric_type == "water",
        HealthMetric.recorded_at >= datetime.combine(week_start, datetime.min.time()),
        HealthMetric.recorded_at <= datetime.combine(week_end, datetime.max.time()),
    ).count()
    hydration_consistency = (water_days / 7 * 100) if water_days <= 7 else 100

    # Journal entries
    journal_count = JournalEntry.query.filter(
        JournalEntry.user_id == user.id,
        JournalEntry.entry_date >= week_start,
        JournalEntry.entry_date <= week_end,
    ).count()

    return {
        "habit_completion": round(habit_completion, 1),
        "workouts_completed": workouts_completed,
        "avg_sleep": round(avg_sleep, 1),
        "hydration_consistency": round(hydration_consistency, 1),
        "journal_count": journal_count,
    }


@reports_bp.route("/weekly", methods=["GET"])
@token_required
def get_weekly_report(current_user):
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    # Check for existing report this week
    existing = WeeklyReport.query.filter_by(
        user_id=current_user.id,
        week_start=week_start,
    ).first()

    if existing:
        return jsonify({"report": existing.to_dict()}), 200

    # Generate new report
    metrics_data = collect_weekly_data(current_user, week_start, week_end)
    ai_insights = generate_weekly_report(current_user, metrics_data)

    report = WeeklyReport(
        user_id=current_user.id,
        week_start=week_start,
        week_end=week_end,
        report_data=json.dumps(metrics_data),
        ai_insights=ai_insights,
    )
    db.session.add(report)
    db.session.commit()

    return jsonify({"report": report.to_dict()}), 200


@reports_bp.route("/weekly/refresh", methods=["POST"])
@token_required
def refresh_weekly_report(current_user):
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    metrics_data = collect_weekly_data(current_user, week_start, week_end)
    ai_insights = generate_weekly_report(current_user, metrics_data)

    # Update or create
    report = WeeklyReport.query.filter_by(
        user_id=current_user.id, week_start=week_start
    ).first()

    if report:
        report.report_data = json.dumps(metrics_data)
        report.ai_insights = ai_insights
    else:
        report = WeeklyReport(
            user_id=current_user.id,
            week_start=week_start,
            week_end=week_end,
            report_data=json.dumps(metrics_data),
            ai_insights=ai_insights,
        )
        db.session.add(report)

    db.session.commit()
    return jsonify({"report": report.to_dict()}), 200


@reports_bp.route("/weekly/pdf", methods=["GET"])
@token_required
def download_weekly_pdf(current_user):
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib import colors
        from reportlab.lib.units import inch

        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)

        metrics_data = collect_weekly_data(current_user, week_start, week_end)
        ai_insights = generate_weekly_report(current_user, metrics_data)

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.75*inch)

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle("title", parent=styles["Title"], fontSize=24, textColor=colors.HexColor("#059669"))
        heading_style = ParagraphStyle("heading", parent=styles["Heading2"], fontSize=14, textColor=colors.HexColor("#065f46"))
        body_style = styles["Normal"]

        story = []

        # Header
        story.append(Paragraph("HealthMate AI", title_style))
        story.append(Paragraph("Weekly Wellness Report", styles["Heading2"]))
        story.append(Paragraph(f"{week_start.strftime('%B %d')} – {week_end.strftime('%B %d, %Y')}", body_style))
        story.append(Spacer(1, 0.3*inch))

        # User info
        story.append(Paragraph(f"Report for: {current_user.full_name}", body_style))
        story.append(Spacer(1, 0.2*inch))

        # Metrics table
        story.append(Paragraph("Weekly Metrics", heading_style))
        table_data = [
            ["Metric", "Value"],
            ["Habit Completion", f"{metrics_data['habit_completion']:.0f}%"],
            ["Workout Sessions", str(metrics_data['workouts_completed'])],
            ["Average Sleep", f"{metrics_data['avg_sleep']:.1f} hours/night" if metrics_data['avg_sleep'] > 0 else "Not logged"],
            ["Hydration Consistency", f"{metrics_data['hydration_consistency']:.0f}%"],
            ["Journal Entries", str(metrics_data['journal_count'])],
        ]

        table = Table(table_data, colWidths=[3*inch, 3*inch])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#059669")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 1, colors.HexColor("#d1fae5")),
            ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f0fdf4")),
            ("PADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(table)
        story.append(Spacer(1, 0.3*inch))

        # AI Insights
        story.append(Paragraph("AI Insights", heading_style))
        for line in ai_insights.split("\n"):
            if line.strip():
                story.append(Paragraph(line.strip(), body_style))
                story.append(Spacer(1, 0.05*inch))

        story.append(Spacer(1, 0.3*inch))
        story.append(Paragraph(
            "Disclaimer: This report is for informational purposes only and is not a substitute for professional medical advice.",
            ParagraphStyle("disclaimer", parent=body_style, fontSize=8, textColor=colors.gray)
        ))

        doc.build(story)
        buffer.seek(0)

        return send_file(
            buffer,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=f"healthmate_report_{week_start.isoformat()}.pdf"
        )

    except ImportError:
        return jsonify({"error": "PDF generation is not available. Please install reportlab."}), 503
    except Exception as e:
        return jsonify({"error": "Failed to generate PDF report."}), 500

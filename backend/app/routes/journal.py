from flask import Blueprint, request, jsonify
from datetime import date, datetime
from .. import db
from ..models import JournalEntry
from ..auth import token_required

journal_bp = Blueprint("journal", __name__)


@journal_bp.route("", methods=["GET"])
@token_required
def get_entries(current_user):
    days = request.args.get("days", 30, type=int)
    days = min(max(days, 1), 365)

    from datetime import timedelta
    cutoff = date.today() - timedelta(days=days)

    entries = JournalEntry.query.filter(
        JournalEntry.user_id == current_user.id,
        JournalEntry.entry_date >= cutoff,
    ).order_by(JournalEntry.entry_date.desc()).all()

    return jsonify({"entries": [e.to_dict() for e in entries]}), 200


@journal_bp.route("", methods=["POST"])
@token_required
def create_entry(current_user):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    entry_date_str = data.get("entry_date")
    try:
        entry_date = date.fromisoformat(entry_date_str) if entry_date_str else date.today()
    except ValueError:
        entry_date = date.today()

    # Check for existing entry today
    existing = JournalEntry.query.filter_by(
        user_id=current_user.id, entry_date=entry_date
    ).first()

    if existing:
        # Update existing entry
        existing.mood = data.get("mood", existing.mood)
        existing.energy_level = data.get("energy_level", existing.energy_level)
        existing.sleep_hours = data.get("sleep_hours", existing.sleep_hours)
        existing.notes = data.get("notes", existing.notes)
        existing.wellness_rating = data.get("wellness_rating", existing.wellness_rating)
        db.session.commit()
        return jsonify({"message": "Journal entry updated", "entry": existing.to_dict()}), 200

    entry = JournalEntry(
        user_id=current_user.id,
        mood=data.get("mood"),
        energy_level=data.get("energy_level"),
        sleep_hours=data.get("sleep_hours"),
        notes=data.get("notes", ""),
        wellness_rating=data.get("wellness_rating"),
        entry_date=entry_date,
    )
    db.session.add(entry)
    db.session.commit()

    return jsonify({"message": "Journal entry saved!", "entry": entry.to_dict()}), 201


@journal_bp.route("/<int:entry_id>", methods=["DELETE"])
@token_required
def delete_entry(current_user, entry_id):
    entry = JournalEntry.query.filter_by(id=entry_id, user_id=current_user.id).first()
    if not entry:
        return jsonify({"error": "Entry not found"}), 404

    db.session.delete(entry)
    db.session.commit()
    return jsonify({"message": "Entry deleted"}), 200

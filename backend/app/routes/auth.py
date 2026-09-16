import re
import secrets
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from .. import db, limiter
from ..models import User, HealthProfile, UserPreference
from ..auth import hash_password, verify_password, generate_token, validate_password_strength, get_or_create_demo_user

auth_bp = Blueprint("auth", __name__)


def is_valid_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


@auth_bp.route("/register", methods=["POST"])
@limiter.limit("10 per hour")
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request body"}), 400

    full_name = data.get("full_name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    confirm_password = data.get("confirm_password", "")

    # Validation
    if not full_name:
        return jsonify({"error": "Full name is required"}), 400
    if len(full_name) < 2:
        return jsonify({"error": "Full name must be at least 2 characters"}), 400
    if not email:
        return jsonify({"error": "Email is required"}), 400
    if not is_valid_email(email):
        return jsonify({"error": "Please enter a valid email address"}), 400
    if not password:
        return jsonify({"error": "Password is required"}), 400

    is_strong, msg = validate_password_strength(password)
    if not is_strong:
        return jsonify({"error": msg}), 400

    if password != confirm_password:
        return jsonify({"error": "Passwords do not match"}), 400

    # Check existing user
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists"}), 409

    try:
        user = User(
            full_name=full_name,
            email=email,
            password_hash=hash_password(password),
        )
        db.session.add(user)
        db.session.flush()

        # Create default preferences
        pref = UserPreference(user_id=user.id)
        db.session.add(pref)
        db.session.commit()

        token = generate_token(user.id)
        return jsonify({
            "message": "Account created successfully!",
            "token": token,
            "user": user.to_dict(),
            "has_profile": False,
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Registration failed. Please try again."}), 500


@auth_bp.route("/login", methods=["POST"])
@limiter.limit("20 per hour")
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request body"}), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not verify_password(password, user.password_hash):
        return jsonify({"error": "Invalid email or password"}), 401

    if not user.is_active:
        return jsonify({"error": "Account is deactivated. Please contact support."}), 403

    token = generate_token(user.id)
    has_profile = user.profile is not None

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user.to_dict(),
        "has_profile": has_profile,
    }), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    # JWT is stateless; client removes token
    return jsonify({"message": "Logged out successfully"}), 200


@auth_bp.route("/me", methods=["GET"])
def get_current_user():
    user = get_or_create_demo_user()
    token = generate_token(user.id)
    return jsonify({
        "user": user.to_dict(),
        "token": token,
        "has_profile": True,
    }), 200


@auth_bp.route("/forgot-password", methods=["POST"])
@limiter.limit("5 per hour")
def forgot_password():
    data = request.get_json()
    email = data.get("email", "").strip().lower() if data else ""

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()

    # Always return success to prevent email enumeration
    if user:
        reset_token = secrets.token_urlsafe(32)
        user.reset_token = reset_token
        user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()
        # In production, send email here
        # For demo, return token in response (remove in production)
        return jsonify({
            "message": "If an account exists with this email, a reset link has been sent.",
            "demo_token": reset_token  # Remove in production
        }), 200

    return jsonify({
        "message": "If an account exists with this email, a reset link has been sent."
    }), 200


@auth_bp.route("/reset-password", methods=["POST"])
@limiter.limit("10 per hour")
def reset_password():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    token = data.get("token", "")
    new_password = data.get("new_password", "")
    confirm_password = data.get("confirm_password", "")

    if not token:
        return jsonify({"error": "Reset token is required"}), 400

    user = User.query.filter_by(reset_token=token).first()
    if not user or not user.reset_token_expiry:
        return jsonify({"error": "Invalid or expired reset token"}), 400

    if datetime.utcnow() > user.reset_token_expiry:
        return jsonify({"error": "Reset token has expired. Please request a new one."}), 400

    is_strong, msg = validate_password_strength(new_password)
    if not is_strong:
        return jsonify({"error": msg}), 400

    if new_password != confirm_password:
        return jsonify({"error": "Passwords do not match"}), 400

    user.password_hash = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.session.commit()

    return jsonify({"message": "Password reset successfully. Please log in."}), 200

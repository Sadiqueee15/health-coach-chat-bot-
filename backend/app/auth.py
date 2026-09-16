import jwt
import bcrypt
from functools import wraps
from flask import request, jsonify, current_app
from datetime import datetime, timedelta
from .models import User


def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash."""
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def generate_token(user_id: int) -> str:
    """Generate JWT token."""
    expiry_hours = int(current_app.config.get("JWT_EXPIRY_HOURS", 24))
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=expiry_hours),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


def decode_token(token: str) -> dict:
    """Decode JWT token."""
    return jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])


def get_or_create_demo_user():
    """Get existing active user or initialize the default demo user."""
    from . import db
    from .models import HealthProfile, UserPreference

    try:
        user = User.query.first()
        if not user:
            user = User(
                full_name="Alex Morgan",
                email="alex.morgan@healthmate.ai",
                password_hash=hash_password("DemoPassword123!"),
                is_active=True,
                xp_points=120,
            )
            db.session.add(user)
            db.session.flush()

            profile = HealthProfile(
                user_id=user.id,
                age=28,
                gender="female",
                height_cm=168.0,
                weight_kg=62.0,
                target_weight_kg=58.0,
                activity_level="moderately_active",
                fitness_goal="improve_fitness",
                dietary_preference="balanced",
                target_calories=2100,
                target_water_ml=2500,
                target_steps=10000,
                target_sleep_hours=8.0,
            )
            db.session.add(profile)

            pref = UserPreference(
                user_id=user.id,
                theme="light",
                measurement_system="metric",
                ai_response_style="balanced",
            )
            db.session.add(pref)
            db.session.commit()
        return user
    except Exception:
        db.session.rollback()
        return User.query.first()


def token_required(f):
    """Decorator to protect routes with JWT authentication or fallback to default active user."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")

        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        current_user = None
        if token and token not in ("demo-guest-jwt-token", "null", "undefined"):
            try:
                data = decode_token(token)
                current_user = User.query.get(data.get("user_id"))
            except Exception:
                current_user = None

        if not current_user or not current_user.is_active:
            current_user = get_or_create_demo_user()

        if not current_user:
            return jsonify({"error": "Unable to initialize user session."}), 500

        return f(current_user, *args, **kwargs)

    return decorated


def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password strength."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter."
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter."
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number."
    return True, ""

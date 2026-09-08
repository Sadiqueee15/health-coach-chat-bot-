from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()
limiter = Limiter(key_func=get_remote_address, default_limits=["200 per day", "50 per hour"])


def create_app():
    app = Flask(__name__)

    # Configuration
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
    
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)
    else:
        if os.getenv("VERCEL"):
            db_url = "sqlite:////tmp/healthmate.db"
        else:
            db_url = "sqlite:///healthmate.db"
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max upload

    # Initialize extensions
    db.init_app(app)
    limiter.init_app(app)

    # CORS
    import re
    cors_origins = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]
    frontend_url = os.getenv("FRONTEND_URL")
    if frontend_url:
        cors_origins.extend([u.strip() for u in frontend_url.split(",") if u.strip()])
    cors_origins.append(re.compile(r"^https://.*\.vercel\.app$"))

    CORS(
        app,
        origins=cors_origins,
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.profile import profile_bp
    from .routes.chat import chat_bp
    from .routes.food import food_bp
    from .routes.workout import workout_bp
    from .routes.meal import meal_bp
    from .routes.habits import habits_bp
    from .routes.health import health_bp
    from .routes.reports import reports_bp
    from .routes.tools import tools_bp
    from .routes.journal import journal_bp
    from .routes.memory import memory_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(profile_bp, url_prefix="/api/profile")
    app.register_blueprint(chat_bp, url_prefix="/api")
    app.register_blueprint(food_bp, url_prefix="/api/food")
    app.register_blueprint(workout_bp, url_prefix="/api/workout")
    app.register_blueprint(meal_bp, url_prefix="/api/meal")
    app.register_blueprint(habits_bp, url_prefix="/api/habits")
    app.register_blueprint(health_bp, url_prefix="/api/health")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")
    app.register_blueprint(tools_bp, url_prefix="/api/tools")
    app.register_blueprint(journal_bp, url_prefix="/api/journal")
    app.register_blueprint(memory_bp, url_prefix="/api/memory")

    # Create tables
    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            app.logger.warning(f"Database table creation notice: {e}")

    # Health check
    @app.route("/api/health-check")
    def health_check():
        return {"status": "ok", "service": "HealthMate AI"}

    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return {"error": "Resource not found"}, 404

    @app.errorhandler(429)
    def rate_limit_exceeded(e):
        return {"error": "Too many requests. Please slow down."}, 429

    @app.errorhandler(413)
    def too_large(e):
        return {"error": "File too large. Maximum size is 16MB."}, 413

    @app.errorhandler(500)
    def internal_error(e):
        return {"error": "An internal server error occurred."}, 500

    return app

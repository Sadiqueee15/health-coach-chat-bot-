from datetime import datetime
from . import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    reset_token = db.Column(db.String(255), nullable=True)
    reset_token_expiry = db.Column(db.DateTime, nullable=True)
    xp_points = db.Column(db.Integer, default=0)

    # Relationships
    profile = db.relationship("HealthProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    conversations = db.relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    food_logs = db.relationship("FoodLog", back_populates="user", cascade="all, delete-orphan")
    workouts = db.relationship("Workout", back_populates="user", cascade="all, delete-orphan")
    meal_plans = db.relationship("MealPlan", back_populates="user", cascade="all, delete-orphan")
    habits = db.relationship("Habit", back_populates="user", cascade="all, delete-orphan")
    journal_entries = db.relationship("JournalEntry", back_populates="user", cascade="all, delete-orphan")
    health_metrics = db.relationship("HealthMetric", back_populates="user", cascade="all, delete-orphan")
    weekly_reports = db.relationship("WeeklyReport", back_populates="user", cascade="all, delete-orphan")
    memories = db.relationship("Memory", back_populates="user", cascade="all, delete-orphan")
    preferences = db.relationship("UserPreference", back_populates="user", cascade="all, delete-orphan")
    badges = db.relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "xp_points": self.xp_points,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class HealthProfile(db.Model):
    __tablename__ = "health_profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(20))
    height_cm = db.Column(db.Float)
    weight_kg = db.Column(db.Float)
    fitness_goal = db.Column(db.String(50))
    activity_level = db.Column(db.String(30))
    dietary_preference = db.Column(db.String(30))
    allergies = db.Column(db.Text)  # JSON string
    sleep_target_hours = db.Column(db.Float, default=8.0)
    water_target_liters = db.Column(db.Float, default=2.5)
    workout_duration_min = db.Column(db.Integer, default=45)
    available_equipment = db.Column(db.Text)  # JSON string
    preferred_workout_type = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("User", back_populates="profile")

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "user_id": self.user_id,
            "age": self.age,
            "gender": self.gender,
            "height_cm": self.height_cm,
            "weight_kg": self.weight_kg,
            "fitness_goal": self.fitness_goal,
            "activity_level": self.activity_level,
            "dietary_preference": self.dietary_preference,
            "allergies": json.loads(self.allergies) if self.allergies else [],
            "sleep_target_hours": self.sleep_target_hours,
            "water_target_liters": self.water_target_liters,
            "workout_duration_min": self.workout_duration_min,
            "available_equipment": json.loads(self.available_equipment) if self.available_equipment else [],
            "preferred_workout_type": self.preferred_workout_type,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Conversation(db.Model):
    __tablename__ = "conversations"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    title = db.Column(db.String(255), default="New Conversation")
    is_favorite = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("User", back_populates="conversations")
    messages = db.relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.timestamp")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "is_favorite": self.is_favorite,
            "message_count": len(self.messages),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey("conversations.id"), nullable=False, index=True)
    role = db.Column(db.String(10), nullable=False)  # 'user' or 'assistant'
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False)

    conversation = db.relationship("Conversation", back_populates="messages")

    def to_dict(self):
        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }


class FoodLog(db.Model):
    __tablename__ = "food_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    meal_type = db.Column(db.String(20))  # breakfast, lunch, dinner, snack
    food_items = db.Column(db.Text)  # JSON
    calories = db.Column(db.Float)
    protein_g = db.Column(db.Float)
    carbs_g = db.Column(db.Float)
    fat_g = db.Column(db.Float)
    notes = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    logged_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="food_logs")

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "meal_type": self.meal_type,
            "food_items": json.loads(self.food_items) if self.food_items else [],
            "calories": self.calories,
            "protein_g": self.protein_g,
            "carbs_g": self.carbs_g,
            "fat_g": self.fat_g,
            "notes": self.notes,
            "logged_at": self.logged_at.isoformat() if self.logged_at else None,
        }


class Workout(db.Model):
    __tablename__ = "workouts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    title = db.Column(db.String(255))
    goal = db.Column(db.String(50))
    experience_level = db.Column(db.String(20))
    days_per_week = db.Column(db.Integer)
    duration_min = db.Column(db.Integer)
    equipment = db.Column(db.Text)  # JSON
    workout_type = db.Column(db.String(50))
    plan_data = db.Column(db.Text)  # JSON - full workout plan
    is_saved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="workouts")
    sessions = db.relationship("WorkoutSession", back_populates="workout", cascade="all, delete-orphan")

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "title": self.title,
            "goal": self.goal,
            "experience_level": self.experience_level,
            "days_per_week": self.days_per_week,
            "duration_min": self.duration_min,
            "equipment": json.loads(self.equipment) if self.equipment else [],
            "workout_type": self.workout_type,
            "plan_data": json.loads(self.plan_data) if self.plan_data else {},
            "is_saved": self.is_saved,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class WorkoutSession(db.Model):
    __tablename__ = "workout_sessions"

    id = db.Column(db.Integer, primary_key=True)
    workout_id = db.Column(db.Integer, db.ForeignKey("workouts.id"), nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    duration_min = db.Column(db.Integer)
    notes = db.Column(db.Text)

    workout = db.relationship("Workout", back_populates="sessions")

    def to_dict(self):
        return {
            "id": self.id,
            "workout_id": self.workout_id,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "duration_min": self.duration_min,
        }


class MealPlan(db.Model):
    __tablename__ = "meal_plans"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    title = db.Column(db.String(255))
    goal = db.Column(db.String(50))
    dietary_preference = db.Column(db.String(30))
    num_meals = db.Column(db.Integer, default=3)
    plan_data = db.Column(db.Text)  # JSON
    total_calories = db.Column(db.Float)
    is_saved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="meal_plans")

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "title": self.title,
            "goal": self.goal,
            "dietary_preference": self.dietary_preference,
            "num_meals": self.num_meals,
            "plan_data": json.loads(self.plan_data) if self.plan_data else {},
            "total_calories": self.total_calories,
            "is_saved": self.is_saved,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Habit(db.Model):
    __tablename__ = "habits"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.String(50))
    target = db.Column(db.String(100))  # e.g., "8 glasses", "30 minutes"
    is_active = db.Column(db.Boolean, default=True)
    is_default = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    streak = db.Column(db.Integer, default=0)

    user = db.relationship("User", back_populates="habits")
    completions = db.relationship("HabitCompletion", back_populates="habit", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "icon": self.icon,
            "target": self.target,
            "is_active": self.is_active,
            "is_default": self.is_default,
            "streak": self.streak,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class HabitCompletion(db.Model):
    __tablename__ = "habit_completions"

    id = db.Column(db.Integer, primary_key=True)
    habit_id = db.Column(db.Integer, db.ForeignKey("habits.id"), nullable=False, index=True)
    user_id = db.Column(db.Integer, nullable=False)
    completed_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    habit = db.relationship("Habit", back_populates="completions")

    def to_dict(self):
        return {
            "id": self.id,
            "habit_id": self.habit_id,
            "completed_date": self.completed_date.isoformat() if self.completed_date else None,
        }


class JournalEntry(db.Model):
    __tablename__ = "journal_entries"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    mood = db.Column(db.String(20))
    energy_level = db.Column(db.Integer)  # 1-10
    sleep_hours = db.Column(db.Float)
    notes = db.Column(db.Text)
    wellness_rating = db.Column(db.Integer)  # 1-10
    entry_date = db.Column(db.Date, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="journal_entries")

    def to_dict(self):
        return {
            "id": self.id,
            "mood": self.mood,
            "energy_level": self.energy_level,
            "sleep_hours": self.sleep_hours,
            "notes": self.notes,
            "wellness_rating": self.wellness_rating,
            "entry_date": self.entry_date.isoformat() if self.entry_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class HealthMetric(db.Model):
    __tablename__ = "health_metrics"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    metric_type = db.Column(db.String(30), nullable=False)  # weight, water, sleep, steps
    value = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20))
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="health_metrics")

    def to_dict(self):
        return {
            "id": self.id,
            "metric_type": self.metric_type,
            "value": self.value,
            "unit": self.unit,
            "recorded_at": self.recorded_at.isoformat() if self.recorded_at else None,
        }


class WeeklyReport(db.Model):
    __tablename__ = "weekly_reports"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    week_start = db.Column(db.Date, nullable=False)
    week_end = db.Column(db.Date, nullable=False)
    report_data = db.Column(db.Text)  # JSON
    ai_insights = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="weekly_reports")

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "week_start": self.week_start.isoformat() if self.week_start else None,
            "week_end": self.week_end.isoformat() if self.week_end else None,
            "report_data": json.loads(self.report_data) if self.report_data else {},
            "ai_insights": self.ai_insights,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Memory(db.Model):
    __tablename__ = "memories"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    key = db.Column(db.String(100), nullable=False)
    value = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50))  # preference, goal, dislike, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("User", back_populates="memories")

    def to_dict(self):
        return {
            "id": self.id,
            "key": self.key,
            "value": self.value,
            "category": self.category,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class UserPreference(db.Model):
    __tablename__ = "user_preferences"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True)
    theme = db.Column(db.String(10), default="system")  # light, dark, system
    ai_response_style = db.Column(db.String(20), default="balanced")  # concise, balanced, detailed
    notifications_enabled = db.Column(db.Boolean, default=True)
    evidence_mode = db.Column(db.Boolean, default=False)
    tts_enabled = db.Column(db.Boolean, default=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("User", back_populates="preferences")

    def to_dict(self):
        return {
            "theme": self.theme,
            "ai_response_style": self.ai_response_style,
            "notifications_enabled": self.notifications_enabled,
            "evidence_mode": self.evidence_mode,
            "tts_enabled": self.tts_enabled,
        }


class UserBadge(db.Model):
    __tablename__ = "user_badges"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    badge_key = db.Column(db.String(50), nullable=False)
    badge_name = db.Column(db.String(100))
    badge_description = db.Column(db.String(255))
    earned_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="badges")

    def to_dict(self):
        return {
            "id": self.id,
            "badge_key": self.badge_key,
            "badge_name": self.badge_name,
            "badge_description": self.badge_description,
            "earned_at": self.earned_at.isoformat() if self.earned_at else None,
        }

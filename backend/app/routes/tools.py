import math
from flask import Blueprint, request, jsonify
from ..auth import token_required

tools_bp = Blueprint("tools", __name__)


def calculate_bmi(weight_kg: float, height_cm: float) -> dict:
    height_m = height_cm / 100
    bmi = weight_kg / (height_m ** 2)

    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25.0:
        category = "Normal weight"
    elif bmi < 30.0:
        category = "Overweight"
    else:
        category = "Obese"

    return {
        "bmi": round(bmi, 1),
        "category": category,
        "disclaimer": "BMI is a screening tool only and does not diagnose body fatness or health. Consult a healthcare professional for a complete assessment."
    }


def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> dict:
    """Mifflin-St Jeor equation."""
    if gender.lower() in ["male", "man", "m"]:
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    else:
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161

    return {
        "bmr": round(bmr),
        "unit": "kcal/day",
        "formula": "Mifflin-St Jeor",
        "disclaimer": "BMR is an estimate of calories burned at rest. Actual values vary based on individual factors."
    }


def calculate_tdee(bmr: float, activity_level: str) -> dict:
    """Calculate TDEE from BMR and activity level."""
    multipliers = {
        "sedentary": 1.2,
        "lightly active": 1.375,
        "moderately active": 1.55,
        "very active": 1.725,
        "extra active": 1.9,
    }

    activity_lower = activity_level.lower()
    multiplier = multipliers.get(activity_lower, 1.375)
    tdee = bmr * multiplier

    return {
        "tdee": round(tdee),
        "activity_level": activity_level,
        "multiplier": multiplier,
        "unit": "kcal/day",
        "disclaimer": "TDEE is an estimate. Monitor your actual weight changes to calibrate."
    }


def calculate_water(weight_kg: float, activity_level: str) -> dict:
    """Estimate daily water intake."""
    base = weight_kg * 0.033  # 33ml per kg body weight
    activity_additions = {
        "sedentary": 0,
        "lightly active": 0.3,
        "moderately active": 0.5,
        "very active": 0.7,
    }
    addition = activity_additions.get(activity_level.lower(), 0.3)
    total = base + addition

    return {
        "recommended_liters": round(total, 1),
        "recommended_glasses": round(total / 0.25),
        "disclaimer": "Water needs vary based on climate, sweat rate, diet, and health conditions. These are general estimates."
    }


def calculate_macros(tdee: float, goal: str) -> dict:
    """Calculate macro targets based on goal."""
    if goal in ["weight loss", "weight management"]:
        calories = tdee - 500
        protein_pct, carb_pct, fat_pct = 0.35, 0.40, 0.25
    elif goal in ["muscle gain", "muscle building"]:
        calories = tdee + 300
        protein_pct, carb_pct, fat_pct = 0.30, 0.45, 0.25
    else:  # maintenance
        calories = tdee
        protein_pct, carb_pct, fat_pct = 0.25, 0.50, 0.25

    return {
        "target_calories": round(calories),
        "protein_g": round(calories * protein_pct / 4),
        "carbs_g": round(calories * carb_pct / 4),
        "fat_g": round(calories * fat_pct / 9),
        "goal": goal,
        "disclaimer": "These are approximate estimates. Individual needs vary. Consult a registered dietitian for personalized guidance."
    }


@tools_bp.route("/bmi", methods=["POST"])
@token_required
def bmi_calculator(current_user):
    data = request.get_json() or {}

    # Use profile values if not provided
    weight = data.get("weight_kg") or (current_user.profile.weight_kg if current_user.profile else None)
    height = data.get("height_cm") or (current_user.profile.height_cm if current_user.profile else None)

    if not weight or not height:
        return jsonify({"error": "Weight (kg) and height (cm) are required"}), 400

    try:
        result = calculate_bmi(float(weight), float(height))
        return jsonify(result), 200
    except (ValueError, ZeroDivisionError):
        return jsonify({"error": "Invalid values provided"}), 400


@tools_bp.route("/bmr", methods=["POST"])
@token_required
def bmr_calculator(current_user):
    data = request.get_json() or {}
    profile = current_user.profile

    weight = float(data.get("weight_kg") or (profile.weight_kg if profile else 0))
    height = float(data.get("height_cm") or (profile.height_cm if profile else 0))
    age = int(data.get("age") or (profile.age if profile else 0))
    gender = data.get("gender") or (profile.gender if profile else "")

    if not all([weight, height, age, gender]):
        return jsonify({"error": "Weight, height, age, and gender are required"}), 400

    try:
        result = calculate_bmr(weight, height, age, gender)
        return jsonify(result), 200
    except Exception:
        return jsonify({"error": "Invalid values provided"}), 400


@tools_bp.route("/tdee", methods=["POST"])
@token_required
def tdee_calculator(current_user):
    data = request.get_json() or {}
    profile = current_user.profile

    weight = float(data.get("weight_kg") or (profile.weight_kg if profile else 0))
    height = float(data.get("height_cm") or (profile.height_cm if profile else 0))
    age = int(data.get("age") or (profile.age if profile else 0))
    gender = data.get("gender") or (profile.gender if profile else "")
    activity = data.get("activity_level") or (profile.activity_level if profile else "Moderately active")

    if not all([weight, height, age, gender]):
        return jsonify({"error": "Complete profile information is required"}), 400

    try:
        bmr_result = calculate_bmr(weight, height, age, gender)
        tdee_result = calculate_tdee(bmr_result["bmr"], activity)
        return jsonify({**bmr_result, **tdee_result}), 200
    except Exception:
        return jsonify({"error": "Invalid values provided"}), 400


@tools_bp.route("/water", methods=["POST"])
@token_required
def water_calculator(current_user):
    data = request.get_json() or {}
    profile = current_user.profile

    weight = float(data.get("weight_kg") or (profile.weight_kg if profile else 0))
    activity = data.get("activity_level") or (profile.activity_level if profile else "Moderately active")

    if not weight:
        return jsonify({"error": "Weight is required"}), 400

    try:
        result = calculate_water(weight, activity)
        return jsonify(result), 200
    except Exception:
        return jsonify({"error": "Invalid values"}), 400


@tools_bp.route("/macros", methods=["POST"])
@token_required
def macro_calculator(current_user):
    data = request.get_json() or {}
    profile = current_user.profile

    weight = float(data.get("weight_kg") or (profile.weight_kg if profile else 0))
    height = float(data.get("height_cm") or (profile.height_cm if profile else 0))
    age = int(data.get("age") or (profile.age if profile else 0))
    gender = data.get("gender") or (profile.gender if profile else "")
    activity = data.get("activity_level") or (profile.activity_level if profile else "Moderately active")
    goal = data.get("goal") or (profile.fitness_goal if profile else "General fitness")

    if not all([weight, height, age, gender]):
        return jsonify({"error": "Complete profile information is required"}), 400

    try:
        bmr_result = calculate_bmr(weight, height, age, gender)
        tdee_result = calculate_tdee(bmr_result["bmr"], activity)
        macro_result = calculate_macros(tdee_result["tdee"], goal)
        return jsonify({**tdee_result, **macro_result}), 200
    except Exception:
        return jsonify({"error": "Invalid values"}), 400

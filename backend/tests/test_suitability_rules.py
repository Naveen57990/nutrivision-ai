import pytest
from app.models import User, UserProfile, UserDietaryPreference, UserAllergy, UserHealthCondition, FoodItem
from app.services.suitability_engine import SuitabilityEngine

def test_allergy_warning_peanut():
    """Verify that reported peanut allergy flags peanut-containing dishes as restricted."""
    user = User(id=1, email="allergy@test.com", hashed_password="x", full_name="Test User")
    allergy = UserAllergy(user_id=1, allergen="peanuts", severity="severe")
    user.allergies = [allergy]
    user.dietary_preferences = []
    user.health_conditions = []
    user.profile = UserProfile(user_id=1, age=25, primary_goal="balanced_diet")

    peanut_item = FoodItem(
        name="Peanut Chikki / Poha with Peanuts",
        category="Snacks",
        allergens="peanuts,sesame",
        is_vegetarian=True,
        calories_per_100g=400.0,
        protein_per_100g=12.0,
        carbs_per_100g=50.0,
        fat_per_100g=18.0
    )

    assessment = SuitabilityEngine.evaluate_meal_suitability(
        user=user,
        food_items=[peanut_item],
        total_nutrients={"calories": 400.0, "protein": 12.0, "carbs": 50.0, "fat": 18.0, "fiber": 4.0, "sodium": 100.0},
        weights=[100.0]
    )

    assert assessment["overall_status"] == "restricted"
    assert len(assessment["allergy_warnings"]) > 0
    assert "PEANUTS" in assessment["allergy_warnings"][0]

def test_dietary_preference_vegetarian():
    """Verify that a vegetarian user receives strict flags for non-vegetarian dishes."""
    user = User(id=2, email="veg@test.com", hashed_password="x", full_name="Veg User")
    user.dietary_preferences = [UserDietaryPreference(user_id=2, preference="vegetarian")]
    user.allergies = []
    user.health_conditions = []
    user.profile = UserProfile(user_id=2, age=30, primary_goal="balanced_diet")

    chicken_item = FoodItem(
        name="Chicken Curry",
        category="Flesh Foods",
        allergens="",
        is_vegetarian=False,
        is_vegan=False,
        is_eggetarian=False,
        calories_per_100g=165.0,
        protein_per_100g=16.5,
        carbs_per_100g=4.0,
        fat_per_100g=9.0
    )

    assessment = SuitabilityEngine.evaluate_meal_suitability(
        user=user,
        food_items=[chicken_item],
        total_nutrients={"calories": 165.0, "protein": 16.5, "carbs": 4.0, "fat": 9.0, "fiber": 1.0, "sodium": 280.0},
        weights=[100.0]
    )

    assert assessment["overall_status"] == "restricted"
    assert any("Dietary Conflict" in c for c in assessment["dietary_compatibility"])

def test_hypertension_sodium_limit():
    """Verify that sodium > 700mg triggers a hypertension alert for hypertensive users."""
    user = User(id=3, email="bp@test.com", hashed_password="x", full_name="BP User")
    user.dietary_preferences = []
    user.allergies = []
    user.health_conditions = [UserHealthCondition(user_id=3, condition_name="hypertension")]
    user.profile = UserProfile(user_id=3, age=55, primary_goal="general_health")

    food_item = FoodItem(
        name="High Salt Dish",
        category="Pantry",
        allergens="",
        is_vegetarian=True,
        calories_per_100g=200.0,
        protein_per_100g=5.0,
        carbs_per_100g=20.0,
        fat_per_100g=8.0
    )

    assessment = SuitabilityEngine.evaluate_meal_suitability(
        user=user,
        food_items=[food_item],
        total_nutrients={"calories": 300.0, "protein": 10.0, "carbs": 30.0, "fat": 10.0, "fiber": 4.0, "sodium": 950.0},
        weights=[150.0]
    )

    assert any("Sodium Alert for Hypertension" in a for a in assessment["health_alerts"])

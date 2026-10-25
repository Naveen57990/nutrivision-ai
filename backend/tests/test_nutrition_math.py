import pytest
from app.models import FoodItem
from app.services.nutrition_calculator import NutritionCalculatorService

def test_nutrition_scaling_100g_formula():
    """Verify that nutrient calculations follow: (nutrient_per_100g * weight_grams) / 100."""
    food = FoodItem(
        name="Test Dal",
        category="Pulses",
        calories_per_100g=120.0,
        protein_per_100g=8.0,
        carbs_per_100g=18.0,
        fat_per_100g=2.0,
        fiber_per_100g=4.0,
        sugar_per_100g=1.0,
        sodium_mg_per_100g=200.0,
        potassium_mg_per_100g=150.0,
        calcium_mg_per_100g=30.0,
        iron_mg_per_100g=2.0,
        vitamin_c_mg_per_100g=1.0
    )

    # 150g portion (1.5x)
    nutrients = NutritionCalculatorService.calculate_item_nutrients(food, 150.0)
    assert nutrients["calories"] == 180.0
    assert nutrients["protein"] == 12.0
    assert nutrients["carbs"] == 27.0
    assert nutrients["fat"] == 3.0
    assert nutrients["fiber"] == 6.0
    assert nutrients["sodium"] == 300.0

def test_added_oil_and_sugar_adjustments():
    """Verify that added oil (4.5g fat/tsp) and added sugar (4g carb/tsp) are accurately computed."""
    food = FoodItem(
        name="Test Roti",
        category="Cereals",
        calories_per_100g=300.0,
        protein_per_100g=10.0,
        carbs_per_100g=60.0,
        fat_per_100g=2.0,
        fiber_per_100g=8.0,
        sugar_per_100g=1.0,
        sodium_mg_per_100g=100.0,
        potassium_mg_per_100g=100.0,
        calcium_mg_per_100g=20.0,
        iron_mg_per_100g=2.0,
        vitamin_c_mg_per_100g=0.0
    )

    # 100g with 1 tsp added ghee/oil and 1 tsp sugar
    nutrients = NutritionCalculatorService.calculate_item_nutrients(
        food, 100.0, added_oil_tsp=1.0, added_sugar_tsp=1.0
    )
    # Fat: 2.0 base + 4.5 added = 6.5g
    assert nutrients["fat"] == 6.5
    # Carbs: 60.0 base + 4.0 added = 64.0g
    assert nutrients["carbs"] == 64.0
    # Calories: 300 base + (4.5*9=40.5) + (4*4=16) = 356.5 kcal
    assert nutrients["calories"] == 356.5

def test_aggregate_meal_nutrients_percentages():
    """Verify macronutrient caloric contribution percentages."""
    items = [
        {"calories": 200.0, "protein": 10.0, "carbs": 30.0, "fat": 4.4, "fiber": 3.0, "sugar": 0.0, "sodium": 100.0, "potassium": 100.0, "calcium": 10.0, "iron": 1.0, "vitamin_c": 0.0},
        {"calories": 300.0, "protein": 20.0, "carbs": 20.0, "fat": 15.5, "fiber": 2.0, "sugar": 0.0, "sodium": 150.0, "potassium": 150.0, "calcium": 20.0, "iron": 2.0, "vitamin_c": 0.0}
    ]
    aggregate = NutritionCalculatorService.aggregate_meal_nutrients(items)
    assert aggregate["calories"] == 500.0
    assert aggregate["protein"] == 30.0
    assert aggregate["carbs"] == 50.0
    assert "protein_percent" in aggregate
    assert "carbs_percent" in aggregate
    assert "fat_percent" in aggregate

def test_icmr_pediatric_safeguards():
    """Verify that minors (<18) never receive aggressive caloric deficits."""
    targets_minor = NutritionCalculatorService.calculate_icmr_daily_targets(
        age=14,
        sex="male",
        weight_kg=48.0,
        height_cm=155.0,
        activity_level="moderate",
        goal="healthy_weight_loss"
    )
    # Under-18 must maintain adequate energy for growth (>= 1800 kcal baseline)
    assert targets_minor["target_calories"] >= 1800.0
    # Protein factor must be elevated for adolescent development (1.1g/kg)
    assert targets_minor["target_protein_g"] >= round(48.0 * 1.1, 1)

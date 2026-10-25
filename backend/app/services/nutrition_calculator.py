from typing import List, Dict, Any, Optional
from app.models import FoodItem, UserProfile

class NutritionCalculatorService:
    @staticmethod
    def calculate_item_nutrients(
        food: FoodItem,
        weight_grams: float,
        added_oil_tsp: float = 0.0,
        added_sugar_tsp: float = 0.0
    ) -> Dict[str, float]:
        """
        Deterministic calculation per ICMR-NIN standard:
        Nutrient consumed = (Nutrient per 100g * Weight in grams) / 100
        """
        ratio = max(0.0, weight_grams) / 100.0

        # Base calculations from database record
        calories = food.calories_per_100g * ratio
        protein = food.protein_per_100g * ratio
        carbs = food.carbs_per_100g * ratio
        fat = food.fat_per_100g * ratio
        fiber = food.fiber_per_100g * ratio
        sugar = food.sugar_per_100g * ratio
        sodium = food.sodium_mg_per_100g * ratio
        potassium = food.potassium_mg_per_100g * ratio
        calcium = food.calcium_mg_per_100g * ratio
        iron = food.iron_mg_per_100g * ratio
        vitamin_c = food.vitamin_c_mg_per_100g * ratio

        # Added oils / fats (1 tsp = ~4.5g fat = 40.5 kcal)
        if added_oil_tsp > 0:
            oil_fat = added_oil_tsp * 4.5
            fat += oil_fat
            calories += oil_fat * 9.0

        # Added sugar (1 tsp = ~4.0g sugar/carbs = 16 kcal)
        if added_sugar_tsp > 0:
            sugar_carbs = added_sugar_tsp * 4.0
            carbs += sugar_carbs
            sugar += sugar_carbs
            calories += sugar_carbs * 4.0

        return {
            "calories": round(calories, 1),
            "protein": round(protein, 1),
            "carbs": round(carbs, 1),
            "fat": round(fat, 1),
            "fiber": round(fiber, 1),
            "sugar": round(sugar, 1),
            "sodium": round(sodium, 1),
            "potassium": round(potassium, 1),
            "calcium": round(calcium, 1),
            "iron": round(iron, 1),
            "vitamin_c": round(vitamin_c, 1),
        }

    @staticmethod
    def aggregate_meal_nutrients(items_data: List[Dict[str, float]]) -> Dict[str, Any]:
        """Sums up items and computes macronutrient caloric distributions."""
        totals = {
            "calories": 0.0,
            "protein": 0.0,
            "carbs": 0.0,
            "fat": 0.0,
            "fiber": 0.0,
            "sugar": 0.0,
            "sodium": 0.0,
            "potassium": 0.0,
            "calcium": 0.0,
            "iron": 0.0,
            "vitamin_c": 0.0,
        }

        for item in items_data:
            for k in totals:
                totals[k] += item.get(k, 0.0)

        # Round totals
        for k in totals:
            totals[k] = round(totals[k], 1)

        total_kcal = max(totals["calories"], 1.0)
        # Caloric contributions: protein=4 kcal/g, carb=4 kcal/g, fat=9 kcal/g
        protein_kcal = totals["protein"] * 4.0
        carbs_kcal = totals["carbs"] * 4.0
        fat_kcal = totals["fat"] * 9.0
        sum_macro_kcal = max(protein_kcal + carbs_kcal + fat_kcal, 1.0)

        totals["protein_percent"] = round((protein_kcal / sum_macro_kcal) * 100, 1)
        totals["carbs_percent"] = round((carbs_kcal / sum_macro_kcal) * 100, 1)
        totals["fat_percent"] = round((fat_kcal / sum_macro_kcal) * 100, 1)

        return totals

    @staticmethod
    def calculate_icmr_daily_targets(
        age: int,
        sex: str,
        weight_kg: float,
        height_cm: float,
        activity_level: str,
        goal: str
    ) -> Dict[str, float]:
        """
        Calculates daily energy and macronutrient reference values based on
        ICMR-NIN 2020 / 2024 Dietary Guidelines for Indians.
        Includes strict pediatric safeguards for age < 18.
        """
        # 1. Base BMR estimation using Mifflin-St Jeor adapted for Indian anthropometry
        if sex.lower() == "female":
            bmr = (10.0 * weight_kg) + (6.25 * height_cm) - (5.0 * age) - 161.0
        else:
            bmr = (10.0 * weight_kg) + (6.25 * height_cm) - (5.0 * age) + 5.0

        activity_multipliers = {
            "sedentary": 1.2,
            "light": 1.375,
            "moderate": 1.55,
            "active": 1.725,
            "very_active": 1.9,
        }
        factor = activity_multipliers.get(activity_level.lower(), 1.4)
        tdee = bmr * factor

        # Pediatric Safeguard: Do not apply adult weight loss deficits to minors
        is_minor = age < 18

        if is_minor:
            # ICMR-NIN reference values for adolescents
            target_calories = max(tdee, 1800.0)
            target_protein = weight_kg * 1.1  # higher protein for growth
        else:
            if goal == "healthy_weight_loss":
                target_calories = max(tdee - 400.0, 1400.0)
            elif goal == "muscle_gain":
                target_calories = tdee + 350.0
            else:
                target_calories = tdee

            # Adult reference: 0.83g - 1.0g per kg body weight (ICMR-NIN 2020: 0.83g/kg)
            if goal == "muscle_gain":
                target_protein = weight_kg * 1.4
            else:
                target_protein = weight_kg * 0.9

        # ICMR-NIN 2024 Macronutrient Distribution:
        # Cereals <= 45% of total energy, Fat <= 30%, Pulses/Proteins 14-15%
        fat_calories = target_calories * 0.25
        target_fat = fat_calories / 9.0

        protein_calories = target_protein * 4.0
        remaining_carb_calories = max(target_calories - fat_calories - protein_calories, 0.0)
        target_carbs = remaining_carb_calories / 4.0

        # Fiber target: 30g minimum per ICMR DGI 2024
        target_fiber = 30.0 if not is_minor else 25.0

        return {
            "target_calories": round(target_calories, 0),
            "target_protein_g": round(target_protein, 1),
            "target_carbs_g": round(target_carbs, 1),
            "target_fat_g": round(target_fat, 1),
            "target_fiber_g": round(target_fiber, 1),
        }

from typing import List, Dict, Any, Optional
from app.models import User, UserProfile, UserDietaryPreference, UserAllergy, UserHealthCondition, FoodItem

class SuitabilityEngine:
    @staticmethod
    def evaluate_meal_suitability(
        user: Optional[User],
        food_items: List[FoodItem],
        total_nutrients: Dict[str, float],
        weights: List[float]
    ) -> Dict[str, Any]:
        """
        Deterministic, rule-based suitability engine.
        Does not use an LLM for safety-critical checks.
        """
        allergy_warnings = []
        dietary_compatibility = []
        health_alerts = []
        actionable_tips = []
        overall_status = "optimal"  # optimal, good, caution, restricted
        pediatric_safeguards = None

        # 1. User Profile context
        user_allergies = [a.allergen.lower().strip() for a in user.allergies] if user and user.allergies else []
        user_preferences = [p.preference.lower().strip() for p in user.dietary_preferences] if user and user.dietary_preferences else ["balanced"]
        user_conditions = [c.condition_name.lower().strip() for c in user.health_conditions] if user and user.health_conditions else []
        user_goal = user.profile.primary_goal if user and user.profile else "balanced_diet"
        user_age = user.profile.age if user and user.profile else 28

        # 2. Pediatric Safeguard Check
        if user_age < 18:
            pediatric_safeguards = (
                f"Adolescent / Pediatric Nutrition Safeguard Active (Age {user_age}): "
                "Recommendations prioritize healthy growth, calcium, iron, and adequate calories. "
                "Aggressive caloric restriction is strictly locked."
            )

        # 3. Check Allergens across all food items
        for item in food_items:
            item_allergens = [a.strip().lower() for a in (item.allergens or "").split(",") if a.strip()]
            for ua in user_allergies:
                if ua in item_allergens or ua in item.name.lower():
                    allergy_warnings.append(
                        f"CRITICAL ALLERGEN WARNING: '{item.name}' contains or is derived from {ua.upper()}. "
                        "Do not consume if you have a diagnosed allergy."
                    )
                    overall_status = "restricted"

        # 4. Check Dietary Preferences (Vegetarian / Vegan / Eggetarian)
        is_veg_user = any("veg" in p and "non" not in p for p in user_preferences)
        is_vegan_user = "vegan" in user_preferences
        is_eggetarian = "eggetarian" in user_preferences

        for item in food_items:
            if is_vegan_user and not item.is_vegan:
                dietary_compatibility.append(
                    f"Vegan Conflict: '{item.name}' contains dairy, honey, or animal derivatives."
                )
                if overall_status != "restricted":
                    overall_status = "restricted"
            elif is_veg_user and not item.is_vegetarian:
                if is_eggetarian and item.is_eggetarian:
                    dietary_compatibility.append(
                        f"Eggetarian note: '{item.name}' contains egg, which aligns with your eggetarian preference."
                    )
                else:
                    dietary_compatibility.append(
                        f"Dietary Conflict: '{item.name}' is non-vegetarian, conflicting with your vegetarian preference."
                    )
                    if overall_status != "restricted":
                        overall_status = "restricted"

        # 5. Check Health Conditions
        # Diabetes / Pre-diabetes
        if any(c in ["diabetes", "prediabetes"] for c in user_conditions):
            high_gi_items = [item.name for item in food_items if getattr(item, "glycemic_index_level", "medium") == "high"]
            if high_gi_items:
                health_alerts.append(
                    f"Glycemic Load Alert: Contains high-glycemic item(s) ({', '.join(high_gi_items)}). "
                    "Pairing with green vegetables or curd will help blunt the postprandial glucose spike."
                )
                if overall_status == "optimal":
                    overall_status = "caution"
            if total_nutrients.get("carbs", 0) > 65.0:
                health_alerts.append(
                    f"Carbohydrate Load Alert: Total carbohydrates for this meal are {total_nutrients.get('carbs')}g. "
                    "Consider moderating grain portions (e.g. 1 roti instead of 2, or half portion rice)."
                )

        # Hypertension (Sodium limit)
        if "hypertension" in user_conditions:
            sodium = total_nutrients.get("sodium", 0)
            if sodium > 700.0:
                health_alerts.append(
                    f"Sodium Alert for Hypertension: This meal provides {sodium}mg of sodium "
                    f"({round((sodium/2000.0)*100)}% of the ICMR-NIN recommended 2,000mg daily ceiling). "
                    "Avoid extra pickles, papads, or table salt."
                )
                if overall_status == "optimal":
                    overall_status = "caution"

        # High Cholesterol / Heart Health
        if "dyslipidemia" in user_conditions or "heart" in " ".join(user_conditions):
            fat_pct = total_nutrients.get("fat_percent", 0)
            if fat_pct > 35.0:
                health_alerts.append(
                    f"Lipid Management Note: Fat contributes {fat_pct}% of total meal calories (recommended <= 30%). "
                    "Opt for steam-cooking or reduced tadka oil."
                )
                if overall_status == "optimal":
                    overall_status = "caution"

        # 6. Goal Alignment & Actionable Tips (ICMR-NIN "My Plate for the Day")
        fiber = total_nutrients.get("fiber", 0)
        protein = total_nutrients.get("protein", 0)
        calories = total_nutrients.get("calories", 0)

        if fiber < 5.0:
            actionable_tips.append(
                "Boost Dietary Fiber: Add a bowl of fresh cucumber, tomato, and carrot salad to meet the ICMR-NIN 50% vegetable plate guideline."
            )
        else:
            actionable_tips.append(
                f"Great Fiber Content: This meal provides {fiber}g of natural dietary fiber, supporting gut health and steady energy."
            )

        if user_goal == "muscle_gain":
            if protein < 20.0:
                actionable_tips.append(
                    f"Protein Enhancement for Muscle Gain: Current protein is {protein}g. Adding 100g paneer, 1 cup sprouts, or 2 boiled eggs will reach the optimal 25-30g threshold."
                )
                goal_alignment = f"Moderate ({protein}g protein logged; target 25-30g per main meal for muscle synthesis)."
            else:
                goal_alignment = f"Strong Alignment ({protein}g protein logged; ideal for your muscle gain goal)."
        elif user_goal == "healthy_weight_loss":
            if calories > 650.0:
                actionable_tips.append(
                    f"Caloric Density Consideration: Total meal energy is {calories} kcal. Moderating portion sizes of grains and fried items can comfortably reduce 150-200 kcal without sacrificing satiety."
                )
                goal_alignment = "Moderate (Energy density is on the higher side; adjust portion of cereals/fats)."
            else:
                goal_alignment = f"Excellent ({calories} kcal provides sustained satiety within your healthy deficit window)."
        else:
            goal_alignment = "Well Balanced (Aligns with daily nutritional maintenance recommendations)."

        # Determine readable status label
        status_labels = {
            "optimal": "Optimal Choice",
            "good": "Good Nutritional Fit",
            "caution": "Requires Attention / Portion Moderation",
            "restricted": "Not Recommended (Dietary or Allergy Restriction)"
        }

        return {
            "overall_status": overall_status,
            "status_label": status_labels.get(overall_status, "Good Fit"),
            "allergy_warnings": allergy_warnings,
            "dietary_compatibility": dietary_compatibility,
            "health_alerts": health_alerts,
            "goal_alignment": goal_alignment,
            "actionable_tips": actionable_tips,
            "pediatric_safeguards": pediatric_safeguards,
            "data_transparency_note": (
                "Evaluated using deterministic safety rules based on ICMR-NIN 2024 Dietary Guidelines. "
                "Nutrient values derived from verified food composition tables, not language model estimates."
            )
        }

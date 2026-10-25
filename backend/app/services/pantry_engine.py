from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import Recipe, RecipeIngredient, User, FoodItem
from app.services.suitability_engine import SuitabilityEngine

class AvailableFoodEngine:
    @staticmethod
    def normalize_ingredient(name: str) -> str:
        """Normalizes ingredient strings by stripping whitespace and lowercasing."""
        return name.lower().strip()

    @classmethod
    def match_available_food(
        cls,
        db: Session,
        user: Optional[User],
        pantry_input: List[str],
        max_prep_time: Optional[int] = None,
        meal_type_filter: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Evaluates candidate dishes against user's actual ingredients in hand.
        Triage into 3 transparent tiers:
        - Tier 1: Best Available Options (100% ingredients available, safe, high goal alignment)
        - Tier 2: Other Reasonable Alternatives (missing 1-2 minor items or moderate goal fit)
        - Tier 3: Options Requiring Caution / Extra Steps (portion control needed or missing an essential item)
        """
        normalized_pantry = set(cls.normalize_ingredient(item) for item in pantry_input if item.strip())
        
        # User safety constraints
        user_allergies = [a.allergen.lower().strip() for a in user.allergies] if user and user.allergies else []
        user_preferences = [p.preference.lower().strip() for p in user.dietary_preferences] if user and user.dietary_preferences else ["balanced"]
        is_veg_user = any("veg" in p and "non" not in p for p in user_preferences)
        is_vegan_user = "vegan" in user_preferences
        is_eggetarian = "eggetarian" in user_preferences
        user_goal = user.profile.primary_goal if user and user.profile else "balanced_diet"

        # Query all candidate recipes
        recipes = db.query(Recipe).all()

        tier1_best = []
        tier2_reasonable = []
        tier3_caution = []

        for recipe in recipes:
            # 1. Dietary Preference Hard Check
            if is_vegan_user and not recipe.is_vegan:
                continue
            if is_veg_user and not recipe.is_vegetarian:
                if not (is_eggetarian and recipe.is_eggetarian):
                    continue

            # 2. Time & Meal Type Filters
            if max_prep_time and recipe.prep_time_minutes > max_prep_time:
                continue
            if meal_type_filter and meal_type_filter.lower() not in recipe.meal_types.lower():
                continue

            # 3. Allergen Check
            recipe_allergens = [a.strip().lower() for a in (recipe.allergens or "").split(",") if a.strip()]
            has_allergy_conflict = any(ua in recipe_allergens for ua in user_allergies)

            # 4. Ingredient Matching
            ingredients = recipe.ingredients
            if not ingredients:
                continue

            matched = []
            missing = []
            essential_missing = 0

            for ing in ingredients:
                ing_norm = cls.normalize_ingredient(ing.ingredient_name)
                # Check for direct or substring match
                is_present = False
                for p_item in normalized_pantry:
                    if p_item in ing_norm or ing_norm in p_item:
                        is_present = True
                        break
                
                if is_present:
                    matched.append(ing.ingredient_name)
                else:
                    missing.append(ing.ingredient_name)
                    if ing.is_essential:
                        essential_missing += 1

            total_ing_count = len(ingredients)
            match_pct = round((len(matched) / total_ing_count) * 100, 1)

            # 5. Explanations & Suitability Badges
            if has_allergy_conflict:
                tier = "Options Requiring Caution / Extra Steps"
                badge = "Allergen Caution"
                explanation = f"Caution: Contains potential allergen ({', '.join(recipe_allergens)})."
                portion_guidance = "Avoid unless prepared strictly without allergens."
                candidate = cls._format_candidate(recipe, tier, match_pct, matched, missing, badge, explanation, portion_guidance, allergy_warning="Reported Allergen Present")
                tier3_caution.append(candidate)
                continue

            # Scoring based on ingredients & user goal
            if essential_missing == 0:
                # All essential ingredients are in the user's pantry!
                tier = "Best Available Options"
                badge = "100% Available at Home"
                
                if user_goal == "muscle_gain":
                    explanation = f"Ready in {recipe.prep_time_minutes} min using what you have. Provides {recipe.protein_est}g protein to support your muscle gain goal."
                    portion_guidance = "Consume full portion; consider pairing with a glass of buttermilk or boiled eggs if extra protein is needed."
                elif user_goal == "healthy_weight_loss":
                    explanation = f"Cooks in {recipe.prep_time_minutes} min with zero grocery runs. High satiety at only ~{recipe.calories_est} kcal."
                    portion_guidance = "Enjoy a standard 1-plate serving with extra salad or water to maximize fullness."
                else:
                    explanation = f"Cookable immediately with ingredients in your kitchen. Nutritious, home-cooked {recipe.regional_cuisine} staple."
                    portion_guidance = "Standard home serving (1 katori / 1 plate)."

                candidate = cls._format_candidate(recipe, tier, match_pct, matched, missing, badge, explanation, portion_guidance)
                tier1_best.append(candidate)

            elif essential_missing == 1 and len(missing) <= 2:
                # Missing only 1 essential or 1-2 minor ingredients
                tier = "Other Reasonable Alternatives"
                badge = f"{match_pct}% Match (Minor Sub)"
                missing_str = ", ".join(missing)
                explanation = f"You have most items! Missing: {missing_str}. You can easily substitute or cook without it."
                portion_guidance = "Standard serving (1-2 katoris)."
                candidate = cls._format_candidate(recipe, tier, match_pct, matched, missing, badge, explanation, portion_guidance)
                tier2_reasonable.append(candidate)

            elif match_pct >= 40.0:
                tier = "Options Requiring Caution / Extra Steps"
                badge = "Requires Additional Items"
                missing_str = ", ".join(missing)
                explanation = f"Feasible meal idea, but requires picking up {missing_str}."
                portion_guidance = "Standard portion once ingredients are acquired."
                candidate = cls._format_candidate(recipe, tier, match_pct, matched, missing, badge, explanation, portion_guidance)
                tier3_caution.append(candidate)

        # Sort Tier 1 by match % then protein/prep time
        tier1_best.sort(key=lambda x: (x["match_percentage"], -x["protein_est"]), reverse=True)
        tier2_reasonable.sort(key=lambda x: x["match_percentage"], reverse=True)
        tier3_caution.sort(key=lambda x: x["match_percentage"], reverse=True)

        pantry_summary = (
            f"Evaluated {len(normalized_pantry)} ingredients against {len(recipes)} authentic regional recipes. "
            f"Found {len(tier1_best)} immediate zero-shopping meals, {len(tier2_reasonable)} near-match alternatives, "
            f"and {len(tier3_caution)} extensible recipe ideas."
        )

        return {
            "detected_pantry_count": len(normalized_pantry),
            "tier1_best_available": tier1_best,
            "tier2_reasonable_alternatives": tier2_reasonable,
            "tier3_requiring_caution": tier3_caution,
            "overall_pantry_insight": pantry_summary
        }

    @staticmethod
    def _format_candidate(recipe, tier, match_pct, matched, missing, badge, explanation, portion_guidance, allergy_warning=None):
        return {
            "recipe_id": recipe.id,
            "name": recipe.name,
            "regional_cuisine": recipe.regional_cuisine,
            "tier": tier,
            "match_percentage": match_pct,
            "matched_ingredients": matched,
            "missing_ingredients": missing,
            "prep_time_minutes": recipe.prep_time_minutes,
            "calories_est": recipe.calories_est,
            "protein_est": recipe.protein_est,
            "carbs_est": recipe.carbs_est,
            "fat_est": recipe.fat_est,
            "fiber_est": recipe.fiber_est,
            "suitability_badge": badge,
            "explanation": explanation,
            "portion_guidance": portion_guidance,
            "allergy_warning": allergy_warning,
            "image_url": recipe.image_url or ""
        }

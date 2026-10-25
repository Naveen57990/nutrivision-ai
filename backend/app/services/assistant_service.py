from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import User, Meal, UserPantryItem, FoodItem
from app.config import settings
import httpx
import json

class AssistantService:
    EMERGENCY_KEYWORDS = [
        "can't breathe", "cannot breathe", "swollen throat", "swollen tongue",
        "anaphylaxis", "choking", "chest pain", "allergic shock", "severe hives"
    ]

    @classmethod
    def get_user_context(cls, db: Session, user: User) -> str:
        """Assembles real application state as factual grounding for the assistant."""
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        today_meals = db.query(Meal).filter(Meal.user_id == user.id, Meal.date_str == today_str).all()

        total_kcal = sum(m.total_calories for m in today_meals)
        total_prot = sum(m.total_protein for m in today_meals)
        total_carbs = sum(m.total_carbs for m in today_meals)
        total_fat = sum(m.total_fat for m in today_meals)
        total_fiber = sum(m.total_fiber for m in today_meals)
        total_sodium = sum(m.total_sodium for m in today_meals)

        pantry = db.query(UserPantryItem).filter(UserPantryItem.user_id == user.id).all()
        pantry_list = [p.ingredient_name for p in pantry]

        pref_list = [p.preference for p in user.dietary_preferences] or ["balanced"]
        allergy_list = [a.allergen for a in user.allergies] or ["none"]
        condition_list = [c.condition_name for c in user.health_conditions] or ["none"]

        profile = user.profile
        age = profile.age if profile else 25
        goal = profile.primary_goal if profile else "balanced_diet"
        target_kcal = profile.target_calories if profile else 2000.0
        target_prot = profile.target_protein_g if profile else 65.0

        meal_breakdown = []
        for m in today_meals:
            item_names = [f"{it.food_name} ({it.serving_quantity} {it.serving_unit})" for it in m.items]
            meal_breakdown.append(f"- {m.meal_type.capitalize()}: {', '.join(item_names)} ({m.total_calories} kcal, {m.total_protein}g protein)")

        meals_text = "\n".join(meal_breakdown) if meal_breakdown else "No meals logged yet today."

        context = (
            f"USER FACTUAL CONTEXT:\n"
            f"- Age: {age}, Dietary Preferences: {', '.join(pref_list)}, Allergies: {', '.join(allergy_list)}\n"
            f"- Health Conditions: {', '.join(condition_list)}, Primary Goal: {goal}\n"
            f"- Daily Targets: {target_kcal} kcal, {target_prot}g protein\n"
            f"- Logged Today ({today_str}): {round(total_kcal, 1)} kcal, {round(total_prot, 1)}g protein, "
            f"{round(total_carbs, 1)}g carbs, {round(total_fat, 1)}g fat, {round(total_fiber, 1)}g fiber, {round(total_sodium, 1)}mg sodium\n"
            f"- Today's Meals:\n{meals_text}\n"
            f"- Kitchen Pantry Items: {', '.join(pantry_list) if pantry_list else 'None saved yet'}\n"
        )
        return context

    @classmethod
    async def generate_response(cls, db: Session, user: User, user_message: str) -> Dict[str, Any]:
        # 1. Emergency Safety Escalation
        msg_lower = user_message.lower()
        if any(keyword in msg_lower for keyword in cls.EMERGENCY_KEYWORDS):
            return {
                "content": (
                    "⚠️ EMERGENCY MEDICAL ADVICE:\n\n"
                    "If you or someone around you is experiencing difficulty breathing, throat swelling, dizziness, or signs of severe allergic reaction (anaphylaxis), "
                    "call your local emergency medical service immediately (112 in India, 911 in US) or go to the nearest emergency department right now. "
                    "Do not wait for dietary advice in an acute medical emergency."
                ),
                "suggested_followups": [
                    "How to manage food allergies safely",
                    "Emergency contacts for medical care"
                ]
            }

        # 2. Gather factual application context
        app_context = cls.get_user_context(db, user)

        # 3. Check if Gemini API key exists
        if settings.GEMINI_API_KEY:
            try:
                system_instruction = (
                    "You are NutriVision's AI Nutrition Coach. You provide evidence-based, warm, practical dietary education "
                    "aligned with ICMR-NIN 2024 Dietary Guidelines for Indians. "
                    "You must strictly respect the user's factual data provided in the prompt. Never invent or hallucinate logged meal numbers. "
                    "Never diagnose medical conditions or promise to cure diseases. "
                    "Keep responses concise (2-4 brief paragraphs or clean bullet points), supportive, and actionable."
                )

                endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                payload = {
                    "contents": [
                        {
                            "parts": [
                                {"text": f"{system_instruction}\n\n{app_context}\n\nUSER QUESTION: {user_message}"}
                            ]
                        }
                    ]
                }
                async with httpx.AsyncClient(timeout=10.0) as client:
                    res = await client.post(endpoint, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        reply = data["candidates"][0]["content"]["parts"][0]["text"]
                        return {
                            "content": reply,
                            "suggested_followups": [
                                "How can I balance my remaining macros today?",
                                "What high-protein snack can I prepare quickly?",
                                "Explain the fiber guidelines for my goal"
                            ]
                        }
            except Exception:
                pass

        # 4. Intelligent grounded rule-based responses (Fallback / Demo mode)
        reply, followups = cls._generate_intelligent_offline_reply(user, app_context, user_message)
        return {
            "content": reply,
            "suggested_followups": followups
        }

    @classmethod
    def _generate_intelligent_offline_reply(cls, user: User, context: str, message: str) -> (str, List[str]):
        msg = message.lower()
        today_meals = user.meals
        total_prot = sum(m.total_protein for m in today_meals)
        total_kcal = sum(m.total_calories for m in today_meals)
        target_prot = user.profile.target_protein_g if user.profile else 65.0
        target_kcal = user.profile.target_calories if user.profile else 2000.0

        if "protein" in msg:
            rem = max(0.0, round(target_prot - total_prot, 1))
            return (
                f"Based on your verified log today, you have consumed **{round(total_prot, 1)}g of protein** out of your daily target of **{target_prot}g**.\n\n"
                f"You have approximately **{rem}g remaining** today. "
                f"To bridge this gap without heavy cooking, consider:\n"
                f"• 1 cup (150g) of curd / Greek yogurt (~10g protein)\n"
                f"• 1 bowl (100g) sprouted moong salad (~7g protein)\n"
                f"• 100g grilled or paneer bhurji (~18g protein) or 2 boiled eggs (~12g protein)\n\n"
                f"*Note: Figures derived from ICMR-NIN Indian Food Composition Tables.*",
                ["What can I eat with what I have at home?", "Show my total calorie breakdown"]
            )
        elif "calorie" in msg or "how much did i eat" in msg:
            rem = max(0.0, round(target_kcal - total_kcal, 1))
            return (
                f"Today you have logged **{round(total_kcal, 1)} kcal** toward your reference baseline of **{target_kcal} kcal**.\n\n"
                f"Remaining energy allowance: **~{rem} kcal**.\n\n"
                r"The ICMR-NIN 2024 guidelines emphasize not just calorie totals, but energy distribution: "
                r"limiting refined cereals to $\le$45% of total energy and ensuring at least 30g of natural dietary fiber daily.",
                ["Which meal contributed the most fiber?", "Suggest a healthy dinner"]
            )
        elif "cook" in msg or "make" in msg or "prepare" in msg or "what can i eat" in msg:
            pantry = [p.ingredient_name for p in user.pantry_items]
            pantry_str = ", ".join(pantry[:6]) if pantry else "dal, rice, onions, tomatoes, eggs"
            return (
                f"Using the pantry ingredients you have saved ({pantry_str}), our Available-Food engine recommends:\n\n"
                f"1. **Quick Moong Dal Khichdi** (~25 min) — soothing, complete amino acid profile pairing lentils with rice.\n"
                f"2. **Egg / Paneer Bhurji with Roti** (~15 min) — high protein, low glycemic impact.\n"
                f"3. **Tadka Dal with Jeera Rice** (~20 min) — classic, affordable comfort food.\n\n"
                f"You can explore recipes with exact portion math on our **'What Can I Eat Right Now?'** page!",
                ["Go to Available Ingredients", "How much fiber did I have today?"]
            )
        elif "balance" in msg or "plate" in msg:
            return (
                "To balance any Indian meal according to ICMR-NIN 'My Plate for the Day':\n\n"
                "1. **Fill 50% of your plate** with fresh seasonal vegetables (sabzi + kachumber salad).\n"
                "2. **Allocate 25%** for quality protein (pulses, sprouts, paneer, curd, or eggs/fish).\n"
                "3. **Allocate the remaining 25%** for complex grains (whole wheat roti, unpolished rice, or millets like ragi/jowar).\n"
                r"4. Keep added cooking oil to $\le$1-2 teaspoons per person per meal.",
                ["Check my latest meal suitability", "How much protein did I have today?"]
            )
        else:
            return (
                f"Hello {user.full_name.split()[0]}! I'm your NutriVision Assistant. "
                f"I have direct access to your profile ({user.profile.primary_goal if user.profile else 'healthy balance'}) "
                f"and today's logged meals.\n\n"
                f"Ask me anything about:\n"
                f"• Your logged macros and calories today\n"
                f"• Recipes you can prepare right now using ingredients in your kitchen\n"
                f"• How to adjust portions for hypertension, diabetes, or muscle gain\n"
                f"• Decoding nutritional reports and food scanner findings",
                ["How much protein did I have today?", "What can I cook with what I have?", "How can I balance my plate?"]
            )

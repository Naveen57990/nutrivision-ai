from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import FoodItem, User
from app.auth import get_current_user_optional
from app.schemas import PortionCalculateRequest, NutritionReportOut, MealItemCreate
from app.services.nutrition_calculator import NutritionCalculatorService
from app.services.suitability_engine import SuitabilityEngine

router = APIRouter(prefix="/api/nutrition", tags=["Nutrition Calculations & Reports"])

@router.post("/calculate-portion")
def calculate_portion(req: PortionCalculateRequest, db: Session = Depends(get_db)):
    food = db.query(FoodItem).filter(FoodItem.id == req.food_item_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found.")

    weight = req.weight_grams
    if weight is None or weight <= 0:
        weight = food.default_serving_grams * (req.servings or 1.0)

    nutrients = NutritionCalculatorService.calculate_item_nutrients(
        food=food,
        weight_grams=weight,
        added_oil_tsp=req.added_oil_tsp or 0.0,
        added_sugar_tsp=req.added_sugar_tsp or 0.0
    )

    return {
        "food_id": food.id,
        "food_name": food.name,
        "weight_grams": round(weight, 1),
        "household_serving": f"{req.servings or 1.0:.1f} × {food.default_serving_name}",
        "data_source": food.data_source,
        "nutrients": nutrients
    }

@router.post("/evaluate-meal", response_model=NutritionReportOut)
def evaluate_meal(
    items: List[MealItemCreate],
    meal_type: str = "Meal",
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    if not items:
        raise HTTPException(status_code=400, detail="Cannot evaluate an empty meal.")

    calculated_items = []
    food_models = []
    weights = []
    data_sources = set()

    for it in items:
        food = None
        if it.food_item_id:
            food = db.query(FoodItem).filter(FoodItem.id == it.food_item_id).first()
        if not food:
            # Fallback by name lookup
            food = db.query(FoodItem).filter(FoodItem.name.ilike(f"%{it.food_name.split()[0]}%")).first()

        weight = it.weight_grams
        if not food:
            # Estimated generic entry if not in database
            item_nutrients = {
                "calories": round(weight * 1.5, 1),
                "protein": round(weight * 0.05, 1),
                "carbs": round(weight * 0.20, 1),
                "fat": round(weight * 0.05, 1),
                "fiber": round(weight * 0.02, 1),
                "sugar": round(weight * 0.02, 1),
                "sodium": round(weight * 1.5, 1),
                "potassium": round(weight * 1.2, 1),
                "calcium": 20.0,
                "iron": 1.0,
                "vitamin_c": 2.0
            }
            data_sources.add("Generic Nutritional Estimate (Item not indexed in IFCT)")
        else:
            food_models.append(food)
            data_sources.add(food.data_source)
            item_nutrients = NutritionCalculatorService.calculate_item_nutrients(food, weight)

        weights.append(weight)
        calculated_items.append({
            "food_name": it.food_name,
            "weight_grams": weight,
            "serving_quantity": it.serving_quantity,
            "serving_unit": it.serving_unit,
            "nutrients": item_nutrients
        })

    # Aggregate total nutrients
    item_nutrient_list = [c["nutrients"] for c in calculated_items]
    aggregate_nutrients = NutritionCalculatorService.aggregate_meal_nutrients(item_nutrient_list)

    # Deterministic Suitability Evaluation
    suitability = SuitabilityEngine.evaluate_meal_suitability(
        user=current_user,
        food_items=food_models,
        total_nutrients=aggregate_nutrients,
        weights=weights
    )

    household_summary = f"{len(items)} items logged ({sum(weights):.0f}g total weight)"

    uncertainties = []
    if len(food_models) < len(items):
        uncertainties.append("Some dishes were not found in the verified database and rely on standard regional approximations.")
    uncertainties.append("Calculations assume standard household oil/salt usage unless explicitly customized.")

    return {
        "meal_type": meal_type,
        "items": calculated_items,
        "nutrients": aggregate_nutrients,
        "suitability": suitability,
        "household_portion_summary": household_summary,
        "data_sources": list(data_sources),
        "uncertainties": uncertainties
    }

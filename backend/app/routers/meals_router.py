from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Meal, MealItem, FoodItem, User
from app.auth import get_current_user_optional, get_current_user
from app.schemas import MealCreate, MealOut
from app.services.nutrition_calculator import NutritionCalculatorService

router = APIRouter(prefix="/api/meals", tags=["Meal Logging & Daily Tracker"])

@router.post("", response_model=MealOut)
def log_meal(
    meal_in: MealCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not meal_in.items:
        raise HTTPException(status_code=400, detail="Cannot log a meal with zero items.")

    # Calculate nutrients for each item
    item_records = []
    tot_cal = 0.0
    tot_prot = 0.0
    tot_carb = 0.0
    tot_fat = 0.0
    tot_fib = 0.0
    tot_sod = 0.0

    meal = Meal(
        user_id=current_user.id,
        meal_type=meal_in.meal_type.lower(),
        date_str=meal_in.date_str,
        notes=meal_in.notes or "",
        image_url=meal_in.image_url or "",
        source_method=meal_in.source_method or "manual",
        total_calories=0.0,
        total_protein=0.0,
        total_carbs=0.0,
        total_fat=0.0,
        total_fiber=0.0,
        total_sodium=0.0
    )
    db.add(meal)
    db.flush()

    for it in meal_in.items:
        food = None
        if it.food_item_id:
            food = db.query(FoodItem).filter(FoodItem.id == it.food_item_id).first()
        if not food:
            food = db.query(FoodItem).filter(FoodItem.name.ilike(f"%{it.food_name.split()[0]}%")).first()

        weight = it.weight_grams
        if food:
            nutrients = NutritionCalculatorService.calculate_item_nutrients(food, weight)
        else:
            nutrients = {
                "calories": round(weight * 1.5, 1),
                "protein": round(weight * 0.05, 1),
                "carbs": round(weight * 0.20, 1),
                "fat": round(weight * 0.05, 1),
                "fiber": round(weight * 0.02, 1),
                "sodium": round(weight * 1.5, 1),
                "potassium": round(weight * 1.2, 1)
            }

        meal_item = MealItem(
            meal_id=meal.id,
            food_item_id=food.id if food else None,
            food_name=it.food_name,
            serving_quantity=it.serving_quantity,
            serving_unit=it.serving_unit,
            weight_grams=weight,
            calories=nutrients["calories"],
            protein=nutrients["protein"],
            carbs=nutrients["carbs"],
            fat=nutrients["fat"],
            fiber=nutrients["fiber"],
            sodium_mg=nutrients["sodium"],
            potassium_mg=nutrients.get("potassium", 0.0)
        )
        db.add(meal_item)
        tot_cal += nutrients["calories"]
        tot_prot += nutrients["protein"]
        tot_carb += nutrients["carbs"]
        tot_fat += nutrients["fat"]
        tot_fib += nutrients["fiber"]
        tot_sod += nutrients["sodium"]

    meal.total_calories = round(tot_cal, 1)
    meal.total_protein = round(tot_prot, 1)
    meal.total_carbs = round(tot_carb, 1)
    meal.total_fat = round(tot_fat, 1)
    meal.total_fiber = round(tot_fib, 1)
    meal.total_sodium = round(tot_sod, 1)

    db.commit()
    db.refresh(meal)
    return meal

@router.get("", response_model=List[MealOut])
def get_meals_for_date(
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format"),
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    if not current_user:
        return []

    date_str = date or datetime.utcnow().strftime("%Y-%m-%d")
    meals = db.query(Meal).filter(
        Meal.user_id == current_user.id,
        Meal.date_str == date_str
    ).order_by(Meal.logged_at.asc()).all()

    return meals

@router.delete("/{meal_id}")
def delete_meal(
    meal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meal = db.query(Meal).filter(
        Meal.id == meal_id,
        Meal.user_id == current_user.id
    ).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found.")

    db.delete(meal)
    db.commit()
    return {"message": "Meal successfully deleted."}

@router.get("/daily-summary")
def get_daily_summary(
    date: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    date_str = date or datetime.utcnow().strftime("%Y-%m-%d")
    
    if not current_user:
        return {
            "date": date_str,
            "logged_calories": 0.0,
            "logged_protein": 0.0,
            "logged_carbs": 0.0,
            "logged_fat": 0.0,
            "logged_fiber": 0.0,
            "logged_sodium": 0.0,
            "targets": {
                "calories": 2000.0,
                "protein": 65.0,
                "carbs": 260.0,
                "fat": 60.0,
                "fiber": 30.0
            },
            "meal_count": 0
        }

    meals = db.query(Meal).filter(
        Meal.user_id == current_user.id,
        Meal.date_str == date_str
    ).all()

    tot_cal = sum(m.total_calories for m in meals)
    tot_prot = sum(m.total_protein for m in meals)
    tot_carb = sum(m.total_carbs for m in meals)
    tot_fat = sum(m.total_fat for m in meals)
    tot_fib = sum(m.total_fiber for m in meals)
    tot_sod = sum(m.total_sodium for m in meals)

    profile = current_user.profile
    targets = {
        "calories": profile.target_calories if profile else 2000.0,
        "protein": profile.target_protein_g if profile else 65.0,
        "carbs": profile.target_carbs_g if profile else 260.0,
        "fat": profile.target_fat_g if profile else 60.0,
        "fiber": profile.target_fiber_g if profile else 30.0
    }

    return {
        "date": date_str,
        "logged_calories": round(tot_cal, 1),
        "logged_protein": round(tot_prot, 1),
        "logged_carbs": round(tot_carb, 1),
        "logged_fat": round(tot_fat, 1),
        "logged_fiber": round(tot_fib, 1),
        "logged_sodium": round(tot_sod, 1),
        "targets": targets,
        "meal_count": len(meals)
    }

@router.get("/history")
def get_nutrition_history(
    days: int = Query(7, ge=1, le=90),
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    if not current_user:
        return {"trends": []}

    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days - 1)

    all_meals = db.query(Meal).filter(
        Meal.user_id == current_user.id,
        Meal.date_str >= start_date.strftime("%Y-%m-%d"),
        Meal.date_str <= end_date.strftime("%Y-%m-%d")
    ).all()

    # Aggregate by date
    daily_map = {}
    for i in range(days):
        d_str = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
        daily_map[d_str] = {
            "date": d_str,
            "calories": 0.0,
            "protein": 0.0,
            "carbs": 0.0,
            "fat": 0.0,
            "fiber": 0.0,
            "sodium": 0.0,
            "meal_count": 0
        }

    for m in all_meals:
        if m.date_str in daily_map:
            daily_map[m.date_str]["calories"] += m.total_calories
            daily_map[m.date_str]["protein"] += m.total_protein
            daily_map[m.date_str]["carbs"] += m.total_carbs
            daily_map[m.date_str]["fat"] += m.total_fat
            daily_map[m.date_str]["fiber"] += m.total_fiber
            daily_map[m.date_str]["sodium"] += m.total_sodium
            daily_map[m.date_str]["meal_count"] += 1

    trends = sorted(daily_map.values(), key=lambda x: x["date"])
    for t in trends:
        for k in ["calories", "protein", "carbs", "fat", "fiber", "sodium"]:
            t[k] = round(t[k], 1)

    return {"trends": trends}

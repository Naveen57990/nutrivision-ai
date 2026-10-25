from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Meal, UserPantryItem, UserDietaryPreference, UserAllergy, UserHealthCondition
from app.auth import get_current_user
from app.schemas import UserDataExport

router = APIRouter(prefix="/api/data", tags=["Privacy, Data Sovereignty & Account Deletion"])

@router.get("/export", response_model=UserDataExport)
def export_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    prof_dict = None
    if profile:
        prof_dict = {
            "age": profile.age,
            "biological_sex": profile.biological_sex,
            "height_cm": profile.height_cm,
            "weight_kg": profile.weight_kg,
            "activity_level": profile.activity_level,
            "country": profile.country,
            "region": profile.region,
            "preferred_language": profile.preferred_language,
            "primary_goal": profile.primary_goal,
            "target_calories": profile.target_calories,
            "target_protein_g": profile.target_protein_g,
            "target_carbs_g": profile.target_carbs_g,
            "target_fat_g": profile.target_fat_g,
            "target_fiber_g": profile.target_fiber_g
        }

    meals = db.query(Meal).filter(Meal.user_id == current_user.id).all()
    meals_list = []
    for m in meals:
        items_data = [
            {
                "food_name": it.food_name,
                "serving_quantity": it.serving_quantity,
                "serving_unit": it.serving_unit,
                "weight_grams": it.weight_grams,
                "calories": it.calories,
                "protein": it.protein,
                "carbs": it.carbs,
                "fat": it.fat,
                "fiber": it.fiber,
                "sodium_mg": it.sodium_mg
            } for it in m.items
        ]
        meals_list.append({
            "meal_id": m.id,
            "meal_type": m.meal_type,
            "date": m.date_str,
            "logged_at": m.logged_at.isoformat(),
            "notes": m.notes,
            "source_method": m.source_method,
            "totals": {
                "calories": m.total_calories,
                "protein": m.total_protein,
                "carbs": m.total_carbs,
                "fat": m.total_fat,
                "fiber": m.total_fiber,
                "sodium": m.total_sodium
            },
            "items": items_data
        })

    pantry = db.query(UserPantryItem).filter(UserPantryItem.user_id == current_user.id).all()
    pantry_list = [
        {
            "ingredient_name": p.ingredient_name,
            "category": p.category,
            "quantity_description": p.quantity_description,
            "added_at": p.added_at.isoformat()
        } for p in pantry
    ]

    return {
        "export_generated_at": datetime.utcnow(),
        "user_info": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "created_at": current_user.created_at.isoformat()
        },
        "profile": prof_dict,
        "preferences": [p.preference for p in current_user.dietary_preferences],
        "allergies": [a.allergen for a in current_user.allergies],
        "health_conditions": [c.condition_name for c in current_user.health_conditions],
        "total_meals_logged": len(meals),
        "logged_meals": meals_list,
        "pantry_inventory": pantry_list
    }

@router.delete("/delete-account")
def delete_user_account(
    confirmation: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if confirmation != "DELETE_MY_ACCOUNT_PERMANENTLY":
        raise HTTPException(
            status_code=400,
            detail="To delete your account and all associated health records, supply confirmation: 'DELETE_MY_ACCOUNT_PERMANENTLY'."
        )

    user_id = current_user.id
    email = current_user.email

    # Cascade delete is handled by database foreign keys or explicit session delete
    db.delete(current_user)
    db.commit()

    return {
        "status": "success",
        "message": f"User account {email} (ID {user_id}) and all associated nutritional data have been permanently deleted."
    }

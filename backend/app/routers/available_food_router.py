from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserPantryItem
from app.auth import get_current_user_optional, get_current_user
from app.services.pantry_engine import AvailableFoodEngine
from app.schemas import AvailableFoodRequest, AvailableFoodResponse

router = APIRouter(prefix="/api/available-food", tags=["Available-Food-First Recommendation"])

@router.get("/pantry")
def get_pantry(current_user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    if not current_user:
        return {"pantry": []}
    items = db.query(UserPantryItem).filter(UserPantryItem.user_id == current_user.id).all()
    return {
        "pantry": [
            {
                "id": it.id,
                "ingredient_name": it.ingredient_name,
                "category": it.category,
                "quantity_description": it.quantity_description
            } for it in items
        ]
    }

@router.post("/pantry")
def add_pantry_item(
    ingredient_name: str,
    category: str = "Pantry",
    quantity: str = "Available",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not ingredient_name.strip():
        raise HTTPException(status_code=400, detail="Ingredient name cannot be empty.")

    item = UserPantryItem(
        user_id=current_user.id,
        ingredient_name=ingredient_name.strip(),
        category=category,
        quantity_description=quantity
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"message": "Ingredient added to kitchen inventory.", "id": item.id}

@router.delete("/pantry/{item_id}")
def delete_pantry_item(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(UserPantryItem).filter(
        UserPantryItem.id == item_id,
        UserPantryItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Pantry item not found.")
    db.delete(item)
    db.commit()
    return {"message": "Ingredient removed."}

@router.post("/recommend", response_model=AvailableFoodResponse)
def recommend_from_available_food(
    req: AvailableFoodRequest,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    if not req.available_ingredients:
        # If user passed empty list, try reading their saved pantry
        if current_user:
            saved = db.query(UserPantryItem).filter(UserPantryItem.user_id == current_user.id).all()
            req.available_ingredients = [s.ingredient_name for s in saved]

    if not req.available_ingredients:
        raise HTTPException(
            status_code=400,
            detail="Please provide at least one available ingredient (e.g. Rice, Dal, Potatoes)."
        )

    results = AvailableFoodEngine.match_available_food(
        db=db,
        user=current_user,
        pantry_input=req.available_ingredients,
        max_prep_time=req.max_prep_time_minutes,
        meal_type_filter=req.meal_type
    )

    return results

@router.get("/common-ingredients")
def get_common_ingredients():
    """Returns curated staples for quick one-tap ingredient selection."""
    return {
        "staples": [
            {"name": "Rice", "category": "Grains"},
            {"name": "Whole Wheat Atta / Roti", "category": "Grains"},
            {"name": "Toor Dal", "category": "Lentils"},
            {"name": "Moong Dal", "category": "Lentils"},
            {"name": "Potatoes", "category": "Vegetables"},
            {"name": "Onions", "category": "Vegetables"},
            {"name": "Tomatoes", "category": "Vegetables"},
            {"name": "Eggs", "category": "Proteins"},
            {"name": "Paneer", "category": "Dairy"},
            {"name": "Curd / Dahi", "category": "Dairy"},
            {"name": "Besan (Gram Flour)", "category": "Pantry"},
            {"name": "Ghee / Oil", "category": "Pantry"},
            {"name": "Cumin / Mustard Seeds", "category": "Spices"}
        ]
    }

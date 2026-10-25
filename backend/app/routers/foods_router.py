from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import FoodItem
from app.schemas import FoodItemOut

router = APIRouter(prefix="/api/foods", tags=["Food Database & Search"])

@router.get("", response_model=List[FoodItemOut])
def search_foods(
    q: Optional[str] = Query(None, description="Search term for food, alternate, or regional name"),
    category: Optional[str] = Query(None, description="Filter by food category"),
    preference: Optional[str] = Query(None, description="Filter by vegetarian/vegan/eggetarian"),
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(FoodItem)

    if q and q.strip():
        term = f"%{q.strip().lower()}%"
        query = query.filter(
            or_(
                FoodItem.name.ilike(term),
                FoodItem.alternate_names.ilike(term),
                FoodItem.regional_names.ilike(term),
                FoodItem.category.ilike(term)
            )
        )

    if category and category.strip():
        query = query.filter(FoodItem.category.ilike(f"%{category.strip()}%"))

    if preference:
        pref = preference.lower().strip()
        if pref == "vegetarian":
            query = query.filter(FoodItem.is_vegetarian == True)
        elif pref == "vegan":
            query = query.filter(FoodItem.is_vegan == True)
        elif pref == "eggetarian":
            query = query.filter(FoodItem.is_eggetarian == True)

    foods = query.offset(offset).limit(limit).all()
    return foods

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    results = db.query(FoodItem.category).distinct().all()
    categories = [r[0] for r in results if r[0]]
    return {"categories": sorted(categories)}

@router.get("/{food_id}", response_model=FoodItemOut)
def get_food(food_id: int, db: Session = Depends(get_db)):
    food = db.query(FoodItem).filter(FoodItem.id == food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found in verified database.")
    return food

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import FoodItem, User
from app.auth import get_current_user_optional
from app.services.vision_provider import get_vision_provider, MockVisionProvider
from app.schemas import ScanResponse

router = APIRouter(prefix="/api/scan", tags=["AI Food Scanner"])

@router.post("/upload", response_model=ScanResponse)
async def scan_food_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    # Validate file type
    valid_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format. Please upload JPEG, PNG, or WebP."
        )

    # Read bytes with file size validation (max 10MB)
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size exceeds 10MB limit.")

    provider = get_vision_provider()
    result = await provider.analyze_image(content, file.content_type)

    # Resolve detected items against verified FoodItems in database
    for candidate in result.get("candidates", []):
        dish_name = candidate["dish_name"].lower()
        # Find closest match
        match = db.query(FoodItem).filter(FoodItem.name.ilike(f"%{dish_name.split()[0]}%")).first()
        if match:
            candidate["matched_food_id"] = match.id

    return result

@router.get("/demo-scenarios")
def get_demo_scenarios():
    """Provides instant clickable sample thalis and mixed Indian meals for interactive testing."""
    return {
        "scenarios": [
            {
                "id": "thali_classic",
                "title": "North Indian Vegetarian Thali",
                "description": "2 Phulkas, Moong Dal Tadka, Bhindi Masala, Steamed Rice",
                "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
                "candidates": MockVisionProvider.PRESET_MEALS[0]["candidates"]
            },
            {
                "id": "south_breakfast",
                "title": "South Indian Steamed Idli & Sambar Plate",
                "description": "3 Steamed Idlis, 1 bowl Drumstick Sambar, Fresh Coconut Chutney",
                "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
                "candidates": MockVisionProvider.PRESET_MEALS[1]["candidates"]
            },
            {
                "id": "paneer_power",
                "title": "Palak Paneer & Whole Wheat Rotis",
                "description": "Iron & Protein dense meal with 180g Palak Paneer and 2 Tawa Rotis",
                "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
                "candidates": MockVisionProvider.PRESET_MEALS[2]["candidates"]
            }
        ]
    }

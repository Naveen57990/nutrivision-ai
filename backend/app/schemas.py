from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# --- Auth Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

# --- Profile Schemas ---
class ProfileUpdate(BaseModel):
    age: Optional[int] = Field(None, ge=1, le=120)
    biological_sex: Optional[str] = None  # male, female, other
    height_cm: Optional[float] = Field(None, ge=50, le=250)
    weight_kg: Optional[float] = Field(None, ge=10, le=300)
    activity_level: Optional[str] = None  # sedentary, light, moderate, active, very_active
    country: Optional[str] = "India"
    region: Optional[str] = "Pan-Indian"
    preferred_language: Optional[str] = "English"
    primary_goal: Optional[str] = None
    dietary_preferences: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    health_conditions: Optional[List[str]] = None

class ProfileOut(BaseModel):
    age: int
    biological_sex: str
    height_cm: float
    weight_kg: float
    activity_level: str
    country: str
    region: str
    preferred_language: str
    primary_goal: str
    target_calories: float
    target_protein_g: float
    target_carbs_g: float
    target_fat_g: float
    target_fiber_g: float

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    is_demo: bool
    profile: Optional[ProfileOut] = None
    dietary_preferences: List[str] = []
    allergies: List[str] = []
    health_conditions: List[str] = []

    class Config:
        from_attributes = True

# --- Food & Nutrient Schemas ---
class FoodItemOut(BaseModel):
    id: int
    name: str
    alternate_names: Optional[str] = ""
    regional_names: Optional[str] = ""
    category: str
    state: str
    default_serving_name: str
    default_serving_grams: float
    calories_per_100g: float
    protein_per_100g: float
    carbs_per_100g: float
    fat_per_100g: float
    fiber_per_100g: float
    sugar_per_100g: float
    sodium_mg_per_100g: float
    potassium_mg_per_100g: float
    calcium_mg_per_100g: float
    iron_mg_per_100g: float
    vitamin_c_mg_per_100g: float
    allergens: Optional[str] = ""
    is_vegetarian: bool
    is_vegan: bool
    is_eggetarian: bool
    glycemic_index_level: str
    data_source: str
    image_url: Optional[str] = ""

    class Config:
        from_attributes = True

# --- Meal Logging Schemas ---
class MealItemCreate(BaseModel):
    food_item_id: Optional[int] = None
    food_name: str
    serving_quantity: float = 1.0
    serving_unit: str = "serving"
    weight_grams: float

class MealCreate(BaseModel):
    meal_type: str  # breakfast, lunch, dinner, snack
    date_str: str   # YYYY-MM-DD
    notes: Optional[str] = ""
    image_url: Optional[str] = ""
    source_method: str = "manual"  # scan, manual, available_pantry
    items: List[MealItemCreate]

class MealItemOut(BaseModel):
    id: int
    food_item_id: Optional[int]
    food_name: str
    serving_quantity: float
    serving_unit: str
    weight_grams: float
    calories: float
    protein: float
    carbs: float
    fat: float
    fiber: float
    sodium_mg: float
    potassium_mg: float

    class Config:
        from_attributes = True

class MealOut(BaseModel):
    id: int
    meal_type: str
    date_str: str
    logged_at: datetime
    notes: Optional[str]
    image_url: Optional[str]
    source_method: str
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    total_fiber: float
    total_sodium: float
    items: List[MealItemOut] = []

    class Config:
        from_attributes = True

# --- Nutrition Calculation & Analysis Schemas ---
class PortionCalculateRequest(BaseModel):
    food_item_id: int
    weight_grams: Optional[float] = None
    servings: Optional[float] = 1.0
    added_oil_tsp: Optional[float] = 0.0
    added_sugar_tsp: Optional[float] = 0.0

class NutrientBreakdown(BaseModel):
    calories: float
    protein: float
    carbs: float
    fat: float
    fiber: float
    sugar: float
    sodium: float
    potassium: float
    calcium: float
    iron: float
    vitamin_c: float
    carbs_percent: float
    protein_percent: float
    fat_percent: float

class SuitabilityAssessment(BaseModel):
    overall_status: str  # optimal, good, caution, restricted
    status_label: str
    allergy_warnings: List[str] = []
    dietary_compatibility: List[str] = []
    health_alerts: List[str] = []
    goal_alignment: str
    actionable_tips: List[str] = []
    pediatric_safeguards: Optional[str] = None
    data_transparency_note: str

class NutritionReportOut(BaseModel):
    meal_type: Optional[str] = "Meal"
    items: List[dict]
    nutrients: NutrientBreakdown
    suitability: SuitabilityAssessment
    household_portion_summary: str
    data_sources: List[str]
    uncertainties: List[str] = []

# --- "What Can I Eat Right Now?" Pantry Schemas ---
class AvailableFoodRequest(BaseModel):
    available_ingredients: List[str]
    max_prep_time_minutes: Optional[int] = None
    meal_type: Optional[str] = None

class CandidateMealOut(BaseModel):
    recipe_id: int
    name: str
    regional_cuisine: str
    tier: str  # "Best Available Options", "Other Reasonable Alternatives", "Options Requiring Caution / Extra Steps"
    match_percentage: float
    matched_ingredients: List[str]
    missing_ingredients: List[str]
    prep_time_minutes: int
    calories_est: float
    protein_est: float
    carbs_est: float
    fat_est: float
    fiber_est: float
    suitability_badge: str
    explanation: str
    portion_guidance: str
    allergy_warning: Optional[str] = None
    image_url: Optional[str] = ""

class AvailableFoodResponse(BaseModel):
    detected_pantry_count: int
    tier1_best_available: List[CandidateMealOut]
    tier2_reasonable_alternatives: List[CandidateMealOut]
    tier3_requiring_caution: List[CandidateMealOut]
    overall_pantry_insight: str

# --- Scanner Schemas ---
class DetectedFoodCandidate(BaseModel):
    dish_name: str
    confidence: float
    matched_food_id: Optional[int] = None
    suggested_weight_grams: float
    household_measure: str
    calories_est: float
    protein_est: float
    carbs_est: float
    fat_est: float
    allergens: List[str] = []

class ScanResponse(BaseModel):
    image_url: Optional[str] = ""
    is_mock: bool = False
    candidates: List[DetectedFoodCandidate]
    multi_item_summary: str
    scan_uncertainty_note: str

# --- Assistant Chat Schemas ---
class ChatMessageIn(BaseModel):
    message: str

class ChatMessageOut(BaseModel):
    role: str
    content: str
    timestamp: datetime
    suggested_followups: List[str] = []

# --- Data Export Schema ---
class UserDataExport(BaseModel):
    export_generated_at: datetime
    user_info: dict
    profile: Optional[dict]
    preferences: List[str]
    allergies: List[str]
    health_conditions: List[str]
    total_meals_logged: int
    logged_meals: List[dict]
    pantry_inventory: List[dict]

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    dietary_preferences = relationship("UserDietaryPreference", back_populates="user", cascade="all, delete-orphan")
    allergies = relationship("UserAllergy", back_populates="user", cascade="all, delete-orphan")
    health_conditions = relationship("UserHealthCondition", back_populates="user", cascade="all, delete-orphan")
    meals = relationship("Meal", back_populates="user", cascade="all, delete-orphan")
    pantry_items = relationship("UserPantryItem", back_populates="user", cascade="all, delete-orphan")
    chats = relationship("AssistantMessage", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    age = Column(Integer, nullable=False, default=25)
    biological_sex = Column(String(20), nullable=False, default="male")  # male, female, other
    height_cm = Column(Float, nullable=False, default=170.0)
    weight_kg = Column(Float, nullable=False, default=68.0)
    activity_level = Column(String(30), nullable=False, default="moderate")  # sedentary, light, moderate, active, very_active
    country = Column(String(100), default="India")
    region = Column(String(100), default="Pan-Indian")
    preferred_language = Column(String(50), default="English")
    primary_goal = Column(String(50), default="balanced_diet")  # general_health, healthy_weight_loss, muscle_gain, balanced_diet, pediatric_growth
    
    # Target calculations
    target_calories = Column(Float, default=2000.0)
    target_protein_g = Column(Float, default=65.0)
    target_carbs_g = Column(Float, default=260.0)
    target_fat_g = Column(Float, default=60.0)
    target_fiber_g = Column(Float, default=30.0)

    user = relationship("User", back_populates="profile")


class UserDietaryPreference(Base):
    __tablename__ = "user_dietary_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    preference = Column(String(50), nullable=False)  # vegetarian, vegan, eggetarian, non_vegetarian, jain, halal

    user = relationship("User", back_populates="dietary_preferences")


class UserAllergy(Base):
    __tablename__ = "user_allergies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    allergen = Column(String(100), nullable=False)  # peanuts, tree_nuts, dairy, gluten, soy, eggs, shellfish, mustard, sesame
    severity = Column(String(30), default="moderate")  # mild, moderate, severe

    user = relationship("User", back_populates="allergies")


class UserHealthCondition(Base):
    __tablename__ = "user_health_conditions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    condition_name = Column(String(100), nullable=False)  # diabetes, prediabetes, hypertension, dyslipidemia, pediatric_growth, geriatric
    professional_notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="health_conditions")


class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), index=True, nullable=False)
    alternate_names = Column(String(300), default="")  # e.g. "dal tadka, yellow dal"
    regional_names = Column(String(300), default="")   # e.g. "Hindi: Dal Tadka, Tamil: Paruppu"
    category = Column(String(100), index=True, nullable=False)
    state = Column(String(50), default="cooked")  # cooked, raw
    default_serving_name = Column(String(100), default="1 katori (150g)")
    default_serving_grams = Column(Float, default=150.0)
    
    # Nutrients per 100g
    calories_per_100g = Column(Float, nullable=False)
    protein_per_100g = Column(Float, nullable=False)
    carbs_per_100g = Column(Float, nullable=False)
    fat_per_100g = Column(Float, nullable=False)
    fiber_per_100g = Column(Float, default=0.0)
    sugar_per_100g = Column(Float, default=0.0)
    sodium_mg_per_100g = Column(Float, default=0.0)
    potassium_mg_per_100g = Column(Float, default=0.0)
    calcium_mg_per_100g = Column(Float, default=0.0)
    iron_mg_per_100g = Column(Float, default=0.0)
    vitamin_c_mg_per_100g = Column(Float, default=0.0)

    # Classifications
    allergens = Column(String(200), default="")  # comma separated e.g. "dairy,gluten"
    is_vegetarian = Column(Boolean, default=True)
    is_vegan = Column(Boolean, default=True)
    is_eggetarian = Column(Boolean, default=True)
    glycemic_index_level = Column(String(30), default="medium")  # low, medium, high
    data_source = Column(String(150), default="ICMR-NIN IFCT 2024")
    image_url = Column(String(500), default="")


class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    meal_type = Column(String(30), nullable=False)  # breakfast, lunch, dinner, snack
    date_str = Column(String(10), index=True, nullable=False)  # YYYY-MM-DD
    logged_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    source_method = Column(String(50), default="manual")  # scan, manual, available_pantry

    # Computed totals
    total_calories = Column(Float, default=0.0)
    total_protein = Column(Float, default=0.0)
    total_carbs = Column(Float, default=0.0)
    total_fat = Column(Float, default=0.0)
    total_fiber = Column(Float, default=0.0)
    total_sodium = Column(Float, default=0.0)

    user = relationship("User", back_populates="meals")
    items = relationship("MealItem", back_populates="meal", cascade="all, delete-orphan")


class MealItem(Base):
    __tablename__ = "meal_items"

    id = Column(Integer, primary_key=True, index=True)
    meal_id = Column(Integer, ForeignKey("meals.id", ondelete="CASCADE"), nullable=False)
    food_item_id = Column(Integer, ForeignKey("food_items.id", ondelete="SET NULL"), nullable=True)
    food_name = Column(String(200), nullable=False)
    serving_quantity = Column(Float, default=1.0)
    serving_unit = Column(String(50), default="serving")
    weight_grams = Column(Float, nullable=False)

    # Calculated nutrition for this specific portion
    calories = Column(Float, default=0.0)
    protein = Column(Float, default=0.0)
    carbs = Column(Float, default=0.0)
    fat = Column(Float, default=0.0)
    fiber = Column(Float, default=0.0)
    sodium_mg = Column(Float, default=0.0)
    potassium_mg = Column(Float, default=0.0)

    meal = relationship("Meal", back_populates="items")


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), index=True, nullable=False)
    regional_cuisine = Column(String(100), default="Pan-Indian")
    meal_types = Column(String(100), default="lunch,dinner")
    prep_time_minutes = Column(Integer, default=25)
    description = Column(Text, default="")
    instructions = Column(Text, default="")
    is_vegetarian = Column(Boolean, default=True)
    is_vegan = Column(Boolean, default=True)
    is_eggetarian = Column(Boolean, default=True)
    allergens = Column(String(200), default="")
    
    # Nutrition estimates per serving
    calories_est = Column(Float, default=350.0)
    protein_est = Column(Float, default=12.0)
    carbs_est = Column(Float, default=55.0)
    fat_est = Column(Float, default=9.0)
    fiber_est = Column(Float, default=7.0)
    image_url = Column(String(500), default="")

    ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    ingredient_name = Column(String(150), nullable=False)
    matched_food_id = Column(Integer, ForeignKey("food_items.id", ondelete="SET NULL"), nullable=True)
    quantity_grams = Column(Float, default=100.0)
    is_essential = Column(Boolean, default=True)

    recipe = relationship("Recipe", back_populates="ingredients")


class UserPantryItem(Base):
    __tablename__ = "user_pantry_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ingredient_name = Column(String(150), nullable=False)
    category = Column(String(50), default="Pantry")
    quantity_description = Column(String(100), default="Available")
    added_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="pantry_items")


class AssistantMessage(Base):
    __tablename__ = "assistant_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chats")

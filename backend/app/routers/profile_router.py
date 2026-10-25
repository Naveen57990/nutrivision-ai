from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserProfile, UserDietaryPreference, UserAllergy, UserHealthCondition
from app.schemas import ProfileUpdate, UserOut
from app.auth import get_current_user
from app.services.nutrition_calculator import NutritionCalculatorService
from app.routers.auth_router import user_to_out

router = APIRouter(prefix="/api/profile", tags=["Profile & Personalization"])

@router.get("", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return user_to_out(current_user)

@router.put("", response_model=UserOut)
def update_profile(
    update_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.flush()

    # Update basic profile fields
    if update_in.age is not None:
        profile.age = update_in.age
    if update_in.biological_sex is not None:
        profile.biological_sex = update_in.biological_sex
    if update_in.height_cm is not None:
        profile.height_cm = update_in.height_cm
    if update_in.weight_kg is not None:
        profile.weight_kg = update_in.weight_kg
    if update_in.activity_level is not None:
        profile.activity_level = update_in.activity_level
    if update_in.country is not None:
        profile.country = update_in.country
    if update_in.region is not None:
        profile.region = update_in.region
    if update_in.preferred_language is not None:
        profile.preferred_language = update_in.preferred_language
    if update_in.primary_goal is not None:
        profile.primary_goal = update_in.primary_goal

    # Recalculate ICMR-NIN Targets with strict pediatric protections
    targets = NutritionCalculatorService.calculate_icmr_daily_targets(
        age=profile.age,
        sex=profile.biological_sex,
        weight_kg=profile.weight_kg,
        height_cm=profile.height_cm,
        activity_level=profile.activity_level,
        goal=profile.primary_goal
    )
    profile.target_calories = targets["target_calories"]
    profile.target_protein_g = targets["target_protein_g"]
    profile.target_carbs_g = targets["target_carbs_g"]
    profile.target_fat_g = targets["target_fat_g"]
    profile.target_fiber_g = targets["target_fiber_g"]

    # Update Dietary Preferences
    if update_in.dietary_preferences is not None:
        db.query(UserDietaryPreference).filter(UserDietaryPreference.user_id == current_user.id).delete()
        for pref in update_in.dietary_preferences:
            if pref.strip():
                db.add(UserDietaryPreference(user_id=current_user.id, preference=pref.strip().lower()))

    # Update Allergies
    if update_in.allergies is not None:
        db.query(UserAllergy).filter(UserAllergy.user_id == current_user.id).delete()
        for allergen in update_in.allergies:
            if allergen.strip():
                db.add(UserAllergy(user_id=current_user.id, allergen=allergen.strip().lower(), severity="moderate"))

    # Update Health Conditions
    if update_in.health_conditions is not None:
        db.query(UserHealthCondition).filter(UserHealthCondition.user_id == current_user.id).delete()
        for cond in update_in.health_conditions:
            if cond.strip():
                db.add(UserHealthCondition(user_id=current_user.id, condition_name=cond.strip().lower()))

    db.commit()
    db.refresh(current_user)
    return user_to_out(current_user)

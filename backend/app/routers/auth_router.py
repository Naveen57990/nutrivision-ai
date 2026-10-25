from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserProfile
from app.schemas import UserRegister, UserLogin, TokenResponse, UserOut
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_active=True
    )
    db.add(user)
    db.flush()

    # Create default profile
    profile = UserProfile(
        user_id=user.id,
        age=28,
        biological_sex="male",
        height_cm=170.0,
        weight_kg=68.0,
        activity_level="moderate",
        primary_goal="balanced_diet"
    )
    db.add(profile)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_to_out(user)
    }

@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_to_out(user)
    }

@router.post("/demo-login", response_model=TokenResponse)
def demo_login(db: Session = Depends(get_db)):
    demo = db.query(User).filter(User.is_demo == True).first()
    if not demo:
        # Fallback to first user
        demo = db.query(User).first()
    if not demo:
        raise HTTPException(status_code=404, detail="Demo account not found in database.")

    token = create_access_token(data={"sub": str(demo.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_to_out(demo)
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return user_to_out(current_user)

@router.post("/forgot-password")
def forgot_password(email: str):
    return {
        "message": f"If an account is associated with {email}, password recovery instructions have been dispatched."
    }

def user_to_out(user: User) -> dict:
    pref_list = [p.preference for p in user.dietary_preferences]
    all_list = [a.allergen for a in user.allergies]
    cond_list = [c.condition_name for c in user.health_conditions]
    
    prof_dict = None
    if user.profile:
        p = user.profile
        prof_dict = {
            "age": p.age,
            "biological_sex": p.biological_sex,
            "height_cm": p.height_cm,
            "weight_kg": p.weight_kg,
            "activity_level": p.activity_level,
            "country": p.country or "India",
            "region": p.region or "Pan-Indian",
            "preferred_language": p.preferred_language or "English",
            "primary_goal": p.primary_goal or "balanced_diet",
            "target_calories": p.target_calories,
            "target_protein_g": p.target_protein_g,
            "target_carbs_g": p.target_carbs_g,
            "target_fat_g": p.target_fat_g,
            "target_fiber_g": p.target_fiber_g,
        }

    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "is_active": user.is_active,
        "is_demo": user.is_demo,
        "profile": prof_dict,
        "dietary_preferences": pref_list,
        "allergies": all_list,
        "health_conditions": cond_list,
    }

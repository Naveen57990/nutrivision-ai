import pytest
from app.services.pantry_engine import AvailableFoodEngine
from app.models import User, UserProfile, UserDietaryPreference, UserAllergy

def test_available_food_tier1_match(db_session):
    """Verify that having rice and dal produces Tier 1 recommendation for Moong Dal Khichdi and Dal Tadka."""
    user = db_session.query(User).filter(User.is_demo == True).first()
    pantry_input = ["rice", "moong dal", "toor dal", "onions", "tomatoes"]

    results = AvailableFoodEngine.match_available_food(
        db=db_session,
        user=user,
        pantry_input=pantry_input
    )

    assert results["detected_pantry_count"] == 5
    assert len(results["tier1_best_available"]) > 0

    tier1_names = [r["name"] for r in results["tier1_best_available"]]
    assert any("Khichdi" in name or "Dal" in name for name in tier1_names)

def test_pantry_allergen_exclusion(db_session):
    """Verify that if a user has peanut allergy, recipes with peanuts are excluded from Tier 1."""
    user = User(email="peanut_free@test.com", hashed_password="x", full_name="No Peanuts")
    db_session.add(user)
    db_session.flush()
    db_session.add(UserAllergy(user_id=user.id, allergen="peanuts"))
    db_session.add(UserProfile(user_id=user.id, age=30))
    db_session.commit()

    results = AvailableFoodEngine.match_available_food(
        db=db_session,
        user=user,
        pantry_input=["poha", "peanuts", "mustard"]
    )

    # Any dish containing reported allergen must not be in Tier 1
    for item in results["tier1_best_available"]:
        assert item.get("allergy_warning") is None

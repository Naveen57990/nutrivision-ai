from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.services.seed_data import seed_database
from app.routers import (
    auth_router,
    profile_router,
    foods_router,
    scan_router,
    nutrition_router,
    available_food_router,
    meals_router,
    assistant_router,
    data_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and seed standard IFCT data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-grade AI-Powered Personalized Nutrition & Food Intelligence Platform",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local and remote web access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router.router)
app.include_router(profile_router.router)
app.include_router(foods_router.router)
app.include_router(scan_router.router)
app.include_router(nutrition_router.router)
app.include_router(available_food_router.router)
app.include_router(meals_router.router)
app.include_router(assistant_router.router)
app.include_router(data_router.router)

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "healthy",
        "demo_mode": settings.DEMO_MODE,
        "docs_url": "/docs"
    }

@app.get("/healthz")
def health_check():
    return {"status": "ok"}

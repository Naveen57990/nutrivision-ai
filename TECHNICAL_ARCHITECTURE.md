# TECHNICAL ARCHITECTURE

## NutriVision: AI-Powered Personalized Nutrition & Food Intelligence Platform

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|  Next.js 14+ (React 18 / TypeScript / Tailwind CSS / Lucide / Responsive Design) |
|                                                                                   |
|  +--------------------+  +---------------------+  +----------------------------+  |
|  | Landing & Auth     |  | Food Scanner & Cam  |  | "What Can I Eat Right Now"|  |
|  | Onboarding Wizard  |  | Manual Food Search  |  | Daily Tracker & Charts     |  |
|  +--------------------+  +---------------------+  +----------------------------+  |
|             |                       |                           |                 |
|             +-----------------------+---------------------------+                 |
|                                     | HTTPS / JSON REST APIs                      |
+-------------------------------------|---------------------------------------------+
                                      v
+-----------------------------------------------------------------------------------+
|                                 BACKEND TIER                                      |
|  Python 3.14 + FastAPI + Pydantic v2 + SQLAlchemy ORM                            |
|                                                                                   |
|  [ Routers ]                                                                      |
|  - /api/auth          : JWT Session Auth & Password Hashes                        |
|  - /api/profile       : Demographics, Allergies, Preferences, Health Restrictions  |
|  - /api/foods         : 100+ Indian Food Composition Items (ICMR-NIN IFCT)        |
|  - /api/scan          : Image Analysis & Multi-Dish Candidate Detection           |
|  - /api/nutrition     : Deterministic Calculations & Nutrition Reports             |
|  - /api/available-food: Pantry Matching & 3-Tier Available-First Recommendation  |
|  - /api/meals         : Daily Meal Logging, Macros & Historical Trend Storage     |
|  - /api/assistant     : Context-Grounded AI Nutrition Assistant                   |
|  - /api/data          : Data Portability (JSON Export) & Full Cascade Deletion     |
|                                                                                   |
|  [ Core Engines ]                                                                 |
|  +---------------------------+  +---------------------------+                     |
|  | Deterministic Calculation |  | Personalized Suitability  |                     |
|  | - 100g base scaling       |  | - Hard Allergen Filters   |                     |
|  | - Household conversions   |  | - Dietary Bounds (Veg)    |                     |
|  | - Unknown nutrient flags  |  | - Pediatric Safeguards    |                     |
|  +---------------------------+  +---------------------------+                     |
|  +---------------------------+  +---------------------------+                     |
|  | Available-Food Matcher    |  | Vision Provider Interface |                     |
|  | - Recipe inventory search |  | - Gemini / OpenAI Pluggable|                    |
|  | - 3-tier candidate triage |  | - Offline Demo Provider   |                     |
|  +---------------------------+  +---------------------------+                     |
+-----------------------------------------------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------------+
|                                 DATABASE TIER                                     |
|  SQLite (Local/Dev/Testing) / PostgreSQL (Production Compatible)                  |
|  - users, profiles, dietary_preferences, allergies, health_conditions            |
|  - foods, food_nutrients, food_aliases, food_sources                              |
|  - meals, meal_items, daily_summaries                                             |
|  - recipes, recipe_ingredients, available_pantry                                  |
|  - consent_logs, assistant_chats                                                  |
+-----------------------------------------------------------------------------------+
```

---

## 1. System Components

### 1.1 Frontend (Next.js & TypeScript)
* **Design System & Styling:** Tailwind CSS customized with our cool mint & teal palette (`#42BFA5`, `#177E75`, `#E9F8F3`, `#F0FBFA`, `#8BCBF0`, `#C5B9F5`, `#F7FAFC`, `#20312F`).
* **Navigation Architecture:** Responsive App Shell providing a persistent desktop navigation rail and an ergonomic mobile bottom navigation bar (`Home`, `Scan`, `Pantry`, `Tracker`, `Profile`).
* **Interactive State Management:** Lightweight, reactive React hooks with optimistic UI updates for logging and ingredient toggling.
* **Imagery Architecture:** High-resolution food asset catalog mapping to verified Indian meals with responsive picture tags, aspect-ratio bounding, and local image fallback resilience.

### 1.2 Backend (FastAPI & Pydantic v2)
* **Application Framework:** FastAPI with asynchronous request handling and OpenAPI (Swagger) schema autogeneration.
* **Authentication:** OAuth2 password bearer tokens with cryptographically secure JWT signatures and bcrypt password hashing.
* **Separation of Concerns:** Distinct domain service modules:
  * `NutritionCalculatorService`: Pure deterministic math.
  * `SuitabilityEngine`: Pure deterministic rules for safety and clinical safeguards.
  * `PantryRecommendationEngine`: Graph/set-matching algorithms for recipe candidate scoring.
  * `VisionService`: Provider abstraction (DemoProvider $\leftrightarrow$ GeminiVisionProvider).

### 1.3 Database Architecture & Models
* **Engine:** SQLAlchemy 2.0 declarative models with foreign key constraints, cascade deletes, and indexed query paths.
* **Schema Highlights:**
  * `users` & `user_profiles`: Stores demographic data (age, sex, height, weight, activity).
  * `dietary_preferences`: Multi-value dietary patterns (Vegetarian, Vegan, Eggetarian, etc.).
  * `allergies`: Standardized allergy classifications.
  * `health_conditions`: Voluntary health flags (Hypertension, Diabetes, High Cholesterol).
  * `foods`: Base record storing category, state (raw/cooked), household portion weights.
  * `food_nutrients`: Relational or embedded nutrient profile (calories, protein, carbs, fat, fiber, sodium, potassium, calcium, iron, vitamin C) with data source provenance (ICMR-NIN IFCT 2024).
  * `meals` & `meal_items`: Logged meals with timestamps, meal types (breakfast, lunch, dinner, snack), confirmed portions, and calculated totals.
  * `recipes`: Recipe templates for the "What Can I Eat Right Now?" engine with required and optional ingredients.

---

## 2. Deterministic Calculation & Safety Invariants

1. **Nutrient Formula:**
   $$N_{\text{meal}} = \sum_{i=1}^{k} \frac{N_{i, 100\text{g}} \times W_i}{100}$$
   Where $N_{i, 100\text{g}}$ is the nutrient value per 100g in the verified database, and $W_i$ is the verified gram weight.

2. **Safety Invariants:**
   * **Allergy Invariant:** If `Allergen in Food.Allergens` and `Allergen in User.Allergens`, the meal is flagged with `CRITICAL_ALLERGY_WARNING` and excluded from Tier 1 recommendations.
   * **Dietary Preference Invariant:** If `User.Preference == 'Vegetarian'` and `Food.IsNonVeg == True`, the meal is strictly flagged with `DIETARY_CONFLICT` and never recommended.
   * **Pediatric Invariant:** If `User.Age < 18`, caloric deficit recommendations are prohibited; recommendations focus exclusively on micronutrient density, calcium, iron, and protein for growth.
   * **Hypertension Invariant:** If `Hypertension in User.Conditions` and `Meal.Sodium > 800mg`, sodium warning and reduction tips are surfaced.

---

## 3. Deployment & Security Standards
* Environment variables isolated in server-side configuration (`.env`).
* No API keys or database credentials exposed to browser code.
* Strict CORS origin configuration.
* Private user data isolation (all DB queries scoped to `current_user.id`).
* Full GDPR/DPDP-compliant data export and deletion endpoints.

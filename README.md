# NutriVision: AI-Powered Personalized Nutrition & Food Intelligence Platform

> **Available-Food-First Nutrition Intelligence Grounded in the ICMR-NIN 2024 Dietary Guidelines for Indians.**

---

## 1. Project Overview

NutriVision is a production-oriented, full-stack nutrition platform engineered to answer the fundamental daily question: **"What can I eat right now with the food and ingredients I already have at home?"**

While conventional nutrition apps present idealized, rigid meal plans that assume a fully stocked pantry or constant grocery shopping, NutriVision evaluates the actual ingredients in the user's kitchen, runs deterministic safety checks against their dietary restrictions and allergies, and outputs practical, balanced, home-cooked meal recommendations.

### Key Differentiators:
1. **Available-Food-First Recommendation Engine:** Evaluates ingredients on hand against regional Indian recipes and sorts them into 3 transparent tiers: *Best Available (100% at home)*, *Reasonable Alternatives (minor subs)*, and *Caution / Extra Steps*.
2. **Deterministic Scientific Calculation:** Food nutrients are computed via strict mathematical formulas using verified **ICMR-NIN Indian Food Composition Tables (IFCT)**. A language model is **never** used to hallucinate nutrient numbers.
3. **Multi-Item Indian Food Scanning:** Optical recognition of complex mixed plates (e.g. traditional thalis with roti, dal, sabzi, and rice) with review, portion customization, and confidence scores.
4. **Context-Grounded AI Nutrition Assistant:** Conversational coach backed by real database facts (logged meals, macro targets, and pantry inventory) with automatic emergency escalation for acute allergic reactions.
5. **Data Sovereignty:** 1-click JSON export of all personal health records and permanent cascade account deletion.

---

## 2. HealthifyMe Retrospective Comparison

Before finalizing NutriVision, we analyzed the publicly observable workflows of **HealthifyMe (Healthify)**. Here is what was learned, what was developed independently, and where NutriVision offers an original experience:

| Dimension | HealthifyMe (Reference) | NutriVision Platform (Implemented) |
| :--- | :--- | :--- |
| **Recommendation Starting Point** | Recommends static meal plans, often suggesting groceries the user does not possess. | **"What can I eat right now?"** Starts with the user's available pantry and fridge inventory. |
| **Nutrient Calculations** | Opaque calculation pipeline mixing crowdsourced data and commercial databases. | **Deterministic IFCT 2024 Service:** 100% traceable to ICMR-NIN standards; zero LLM math. |
| **Multi-Item Plate Recognition** | Snap feature detects items on a plate. | Pluggable vision provider with confidence reporting, uncertainty disclosures, and offline demo scenarios. |
| **AI Assistant Grounding** | AI Coach Ria provides feedback, sometimes generating generic recipe ideas. | Grounded assistant with real-time awareness of user's logged meals today and kitchen inventory. |
| **Pediatric Safeguards** | Basic age collection. | Hard programmatic safeguards: users under 18 cannot receive caloric deficit plans. |
| **Visual Design** | Dark or heavily saturated commercial app interface with frequent subscription popups. | Light-first, calm aesthetic using soft mint green (`#42BFA5`), deep teal (`#177E75`), and editorial food photography. |

---

## 3. Technology Stack

* **Frontend:** Next.js 16.4 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts.
* **Backend:** Python 3.14, FastAPI, Pydantic v2, SQLAlchemy 2.0 ORM, PyJWT, Bcrypt, Python-Multipart.
* **Database:** SQLite (default for development/testing), PostgreSQL compatible.
* **Vision & AI Interface:** Replaceable provider architecture (`MockVisionProvider` for zero-credential demo simulation, `GeminiVisionProvider` for live image classification).

---

## 4. Setup & Running the Application

### Prerequisites:
* **Python 3.10+** (Tested on Python 3.14)
* **Node.js 18+** (Tested on Node.js v26.7.0)
* **npm**

### Step 1: Start the Backend API Server

```bash
# Navigate to the backend directory
cd backend

# Create virtual environment (if not already created)
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run automated tests to verify the installation
pytest -v

# Start the FastAPI server on port 8000
uvicorn app.main:app --reload --port 8000
```

The backend starts at `http://localhost:8000`.  
Interactive Swagger API documentation is available at `http://localhost:8000/docs`.

---

### Step 2: Start the Next.js Frontend

```bash
# In a new terminal window, navigate to the frontend directory
cd frontend

# Install npm dependencies (if not already installed)
npm install

# Start the Next.js development server
npm run dev
```

Open your browser at **`http://localhost:3000`**.

---

## 5. Instant 1-Click Demo Mode

For immediate evaluation without typing registration credentials:
1. Open `http://localhost:3000`.
2. Click **"Explore Live Demo"** on the landing page or on the login screen.
3. This automatically signs into the pre-configured demo user (**Aarav Sharma**, 29, North India, Goal: Healthy Weight Loss) with pre-logged meals for today and stocked pantry staples.

---

## 6. Project Architecture

```
beautiful-borg/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI entrypoint, lifespan & CORS
│   │   ├── config.py                  # Pydantic BaseSettings & env vars
│   │   ├── database.py                # SQLAlchemy engine & sessionmaker
│   │   ├── models.py                  # Relational database models
│   │   ├── schemas.py                 # Pydantic v2 validation schemas
│   │   ├── auth.py                    # JWT token signing & password hashing
│   │   ├── services/
│   │   │   ├── nutrition_calculator.py# Deterministic 100g scaling & ICMR targets
│   │   │   ├── suitability_engine.py  # Rule-based safety (allergies, diet, pediatrics)
│   │   │   ├── pantry_engine.py       # "What Can I Eat Right Now?" matcher
│   │   │   ├── vision_provider.py     # AI vision interface with demo fallback
│   │   │   ├── assistant_service.py   # Grounded coach with emergency escalation
│   │   │   └── seed_data.py           # 100+ ICMR-NIN food items & recipes
│   │   └── routers/                   # Modular REST API endpoints
│   ├── tests/                         # Pytest test suite (15 passed)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               # Landing page with editorial Hero
│   │   │   ├── auth/                  # Login & registration flows
│   │   │   ├── onboarding/            # 5-step interactive profile wizard
│   │   │   ├── dashboard/             # Home dashboard with daily summary
│   │   │   ├── scan/                  # AI food scanner & thali review
│   │   │   ├── available-food/        # "What Can I Eat Right Now?" pantry engine
│   │   │   ├── foods/                 # Manual food database & portion calculator
│   │   │   ├── tracker/               # Daily meal tracker & 7-day progress charts
│   │   │   ├── assistant/             # Grounded AI nutrition coach chat
│   │   │   └── settings/              # Settings, JSON export & account deletion
│   │   ├── components/                # Reusable design system components
│   │   └── lib/                       # API client & food photography catalog
│   ├── package.json
│   └── next.config.ts
├── PRODUCT_REQUIREMENTS.md            # Detailed PRD
├── TECHNICAL_ARCHITECTURE.md          # Architectural blueprints & invariants
├── REFERENCE_RESEARCH.md              # Competitive & ICMR-NIN research
├── IMPLEMENTATION_PLAN.md             # Execution milestones
├── TEST_REPORT.md                     # Pytest & build audit report
├── .env.example                       # Environment configuration template
└── README.md                          # Main project guide
```

---

## 7. Known Limitations & Future Roadmap

* **Continuous Glucose Monitor (CGM) Integration:** While the platform predicts glycemic responses based on food GI levels, direct Bluetooth CGM hardware syncing is planned for future iterations.
* **Regional Spoken Language Audio:** The assistant currently communicates via text; regional Indian voice input (Hindi, Tamil, Telugu speech-to-text) will be added in Phase 2.
* **Barcode Database Expansion:** While 100+ core whole foods and regional recipes are indexed, expanding packaged food barcode scanning will further enhance convenience.

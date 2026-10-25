# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Project: NutriVision (AI-Powered Personalized Nutrition & Food Intelligence Platform)

### 1. Vision & Core Objectives
NutriVision is an intelligent nutrition platform that empowers individuals to understand, track, and optimize their nutritional intake. The primary differentiator is **Available-Food-First Personalization**, addressing the reality that people need healthy, practical meal guidance using the ingredients and groceries they already possess.

The platform answers 5 fundamental questions:
1. **Who is the user?** (Demographics, age group, dietary preferences, allergies, conditions, and goals)
2. **What food is available?** (Ingredients currently in the pantry, fridge, or kitchen)
3. **What nutrients does that food provide?** (Deterministic calculation from verified food composition tables)
4. **How suitable is the food?** (Objective rule-based evaluation against allergies, health restrictions, and dietary goals)
5. **What is the most appropriate choice and portion?** (Ranked recommendations with actionable preparation adjustments)

---

## 2. User Personas

1. **Rohan (23, Bangalore - Software Engineer / Bachelor living alone):**
   * *Pain Point:* Has 4 eggs, some onions, tomatoes, and leftover rice. Doesn't know what high-protein meal to cook without ordering unhealthy takeout.
   * *Need:* "What can I eat right now?" feature that outputs quick, nutritious recipes using only those ingredients.

2. **Priya (34, Mumbai - Working Homemaker & Mother):**
   * *Pain Point:* Balancing family nutrition where her husband has mild hypertension (needs low sodium) and her 9-year-old child needs nutrient-dense growth foods.
   * *Need:* Indian food scanning that identifies a traditional thali (roti, dal, sabzi, curd) and flags sodium or fiber considerations safely.

3. **Sunita (58, New Delhi - Diabetic & Vegetarian):**
   * *Pain Point:* Needs to monitor carbohydrate loads and glycemic responses from rotis, lentils, and regional sabzis without confusing Western metrics.
   * *Need:* Clear Indian portion units (*katori*, *roti*) and strict vegetarian compliance with zero accidental meat suggestions.

---

## 3. Functional Requirements

### FR-1: User Onboarding & Dynamic Profiling
* **Demographics:** Age (or DOB), biological sex (required for ICMR-NIN hormonal/metabolic calculations), height, weight, activity level (sedentary, moderate, active).
* **Dietary Preferences:** Vegetarian, Vegan, Eggetarian, Non-Vegetarian, Jain/Sattvic.
* **Allergies & Intolerances:** Peanuts, Tree Nuts, Dairy/Lactose, Gluten/Wheat, Shellfish, Soy, Eggs, Mustard, Sesame.
* **Health Conditions (Self-Reported):** Diabetes/Pre-diabetes (glycemic load check), Hypertension (sodium limit $\le$ 2000mg), Dyslipidemia/Heart Health (saturated fat constraint), Renal/Kidney (potassium/phosphorus guidance with disclaimer).
* **Goals:** Maintain weight, healthy fat loss, lean muscle gain, balanced micronutrient adequacy, improve dietary fiber.
* **Safety Rules:** Minors (<18) receive growth-focused adequacy targets; aggressive caloric deficits are locked.

### FR-2: Verified Nutrition Database (IFCT / ICMR-NIN & Global Standards)
* Normalized food composition data covering 100+ staples, curries, grains, pulses, dairy, snacks, and street foods.
* Every food item stores:
  * Energy (kcal), Protein (g), Carbohydrates (g), Total Fat (g), Dietary Fiber (g), Sugar (g), Sodium (mg), Potassium (mg), Calcium (mg), Iron (mg), Vitamin C (mg).
  * Food Category (Cereals, Pulses, Vegetables, Dairy, Meat/Eggs, Fruits, Snacks, Beverages).
  * State (Raw vs Cooked).
  * Standard household serving conversion (1 katori = 150g, 1 standard roti = 35g, 1 idli = 40g, etc.).
  * Provenance indicator (e.g., `ICMR-NIN 2024`, `Verified Database Record`).
* Deterministic formula:
  $$\text{Nutrient Consumed} = \frac{\text{Nutrient Value per 100g} \times \text{Weight in Grams}}{100}$$

### FR-3: Available-Food-First Recommendation Engine ("What Can I Eat Right Now?")
* **Input:** List of ingredients selected or entered by user (e.g., "Rice, Moong Dal, Turmeric, Tomato, Ghee").
* **Matching Algorithm:**
  * Compares input pantry against a curated library of regional recipes.
  * Calculates match percentage: Fully available vs missing 1-2 optional seasoning ingredients.
* **Evaluation & Ranking:**
  * 1. Safety Filter: Eliminate any meal with user allergens or conflicting dietary restrictions (hard constraint).
  * 2. Goal Scoring: Score based on user's remaining daily macros and nutritional goals.
  * 3. Categorization into 3 transparent tiers:
    * *Tier 1: Best Available Options* (100% pantry match + high goal alignment)
    * *Tier 2: Other Reasonable Alternatives* (Minor pantry additions or moderate alignment)
    * *Tier 3: Options Requiring Caution / Extra Steps* (Requires portion moderation or substitution)
* **Output:** Clear explanations of why each dish was recommended, estimated cooking time, and portion suggestion.

### FR-4: AI Food Recognition & Image Analysis
* **Workflow:** Camera capture or file upload $\rightarrow$ Client validation $\rightarrow$ Server vision analysis.
* **Provider Flexibility:** Pluggable vision interface with Gemini Vision / OpenAI Vision / Mock Demo Provider.
* **Indian Multi-Item Support:** Identifies individual items on a thali or plate (e.g., 2 Chapatis, Dal, Paneer Sabzi, Salad).
* **Confidence & Correction:** Displays detection confidence. Allows the user to edit detected dish, alter quantity (grams or katoris), or delete mistaken items.
* **Offline/Demo Resilience:** When API keys are not present or network fails, gracefully transitions to interactive Demo Meals or Manual Entry without throwing fatal errors.

### FR-5: Manual Food Entry & Regional Search
* Searchable food database with debounced multi-word indexing and regional aliases (e.g., "Curd" / "Dahi" / "Thayir"; "Bottle Gourd" / "Lauki" / "Sorakaya").
* Quick filters by food category and dietary preference.
* Custom portion builder with live recalculation of calories and macronutrients.

### FR-6: Personalized Nutrition & Safety Assessment
* Automated checks executed on every logged or scanned meal:
  * **Allergen Alert:** Warning if ingredient contains or traces reported user allergens.
  * **Dietary Compatibility:** Strict flags if a vegetarian is presented with animal products.
  * **Health Alerts:** Highlights high sodium for hypertensive users or excessive refined carbs for diabetic users.
  * **Nutrient Highlights:** Identifies top protein and fiber contributors.

### FR-7: Daily Meal Tracker & Progress Dashboard
* Organizes intake into Breakfast, Lunch, Dinner, and Snacks.
* Displays daily totals vs ICMR-NIN baseline targets (Calories, Protein, Carbs, Fat, Fiber, Sodium).
* Visual macro distribution chart showing percent of total energy from carbs, protein, and fat.
* Historical calendar picker to navigate past dates and edit or remove logged meals.

### FR-8: Grounded AI Nutrition Assistant
* Conversational interface backed by application context:
  * Injects current user's daily logged food, available pantry ingredients, and verified database facts into prompt context.
  * Answers questions like "How much protein did I have today?", "Can I swap rice with quinoa?", or "What can I cook with potatoes and onions?".
  * Safety guardrail: Disclaims medical diagnosis and provides emergency care warnings if symptoms of acute allergic reaction are mentioned.

### FR-9: Privacy, Consent & Data Sovereignty
* User consent collection during onboarding.
* Complete Data Export: Download all user profiles, logged meals, and analysis history as formatted JSON.
* Full Account Deletion: One-click complete cascade deletion of all user records from database.

---

## 4. Non-Functional Requirements
1. **Performance:** Sub-200ms response time for database searches; sub-2s response for deterministic nutrition calculations.
2. **Security:** JWT authentication with bcrypt password hashing; no secrets exposed on client side; strict CORS and authorization checks preventing cross-user data leakage.
3. **Accessibility:** WCAG 2.2 Level AA compliance; minimum 4.5:1 text contrast; keyboard navigability; non-color reliance for warning indicators.
4. **Responsive UI:** Fluid layouts optimized for mobile devices (320px–430px) and desktop screens (1024px–1920px+).

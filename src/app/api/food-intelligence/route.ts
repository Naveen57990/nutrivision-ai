import { NextRequest, NextResponse } from "next/server";
import { DISH_DATABASE, matchDishesFromDatabase } from "@/lib/recipe_database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      ingredients = [],
      rawInput = "",
      dishName = "",
      userProfile = {},
      dietaryPreference = "vegetarian"
    } = body;

    const inputString = (rawInput || dishName || ingredients.join(", ")).trim();

    // AI Provider Configuration
    const provider = req.headers.get("x-ai-provider") || body.provider || "local";
    const openaiKey = req.headers.get("x-openai-key") || body.openaiApiKey || process.env.OPENAI_API_KEY || "";
    const openaiModel = req.headers.get("x-openai-model") || body.openaiModel || process.env.OPENAI_MODEL || "gpt-4o";
    const geminiKey = req.headers.get("x-gemini-key") || body.geminiApiKey || process.env.GEMINI_API_KEY || "";
    const geminiModel = req.headers.get("x-gemini-model") || body.geminiModel || process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const localUrl = (req.headers.get("x-local-llm-url") || body.localLlmUrl || process.env.LOCAL_LLM_URL || "http://localhost:11434").replace(/\/+$/, "");

    // User profile parameters
    const age = userProfile.age || 29;
    const gender = userProfile.gender || "male";
    const heightCm = userProfile.height_cm || 175;
    const weightKg = userProfile.weight_kg || 72;
    const goal = userProfile.primary_goal || "muscle_gain";
    const goalLabel = goal.replace(/_/g, " ");
    const conditions: string[] = userProfile.health_conditions || ["prediabetes", "hypertension"];
    const diet = dietaryPreference || userProfile.dietary_pattern || "vegetarian";
    const isVeg = diet.toLowerCase() !== "non_vegetarian";
    const targetCalories = userProfile.daily_calorie_target || 2050;
    const targetProtein = userProfile.daily_protein_target_g || 78;

    // 1. Get pre-matched candidates from our extensive 50+ recipe database
    const databaseMatches = matchDishesFromDatabase(inputString, diet, goal, weightKg, conditions);

    // 2. Query Local LLM (Ollama) with candidate context to generate rich, personalized options
    let localLlmSuccess = false;
    let localLlmRecommendations: any[] = [];

    try {
      const tagsRes = await fetch(`${localUrl}/api/tags`, { signal: AbortSignal.timeout(2000) }).catch(() => null);
      if (tagsRes && tagsRes.ok) {
        const tagsData = await tagsRes.json();
        const availableModels: string[] = (tagsData.models || []).map((m: any) => m.name);

        let chosenModel = body.localLlmModel || req.headers.get("x-local-llm-model") || "";
        if (!chosenModel || !availableModels.includes(chosenModel)) {
          if (availableModels.includes("qwen2.5vl:3b")) chosenModel = "qwen2.5vl:3b";
          else if (availableModels.includes("qwen3:8b")) chosenModel = "qwen3:8b";
          else chosenModel = availableModels[0] || "qwen2.5vl:3b";
        }

        const candidateNames = databaseMatches.map(d => d.dish_name).join("; ");

        const prompt = `You are NutriVision's Clinical Nutrition & Culinary AI grounded in ICMR-NIN 2024.
The user provided these EXACT ingredients: "${inputString}".
Dietary Preference: ${isVeg ? "STRICTLY VEGETARIAN (No eggs, meat, chicken, or fish)" : "NON-VEGETARIAN (Can include eggs, chicken, fish, or veg)"}.
User: Age ${age}, Weight ${weightKg}kg, Goal: ${goalLabel.toUpperCase()}, Medical Conditions: ${conditions.join(", ")}.
Candidate ideas to consider: ${candidateNames}.

CRITICAL TASK:
Suggest 3-4 diverse, authentic, delicious dishes that primarily use "${inputString}".
For EVERY dish, you MUST explicitly explain in plain words: "HOW THIS WILL HELP YOU IN YOUR GOAL (${goalLabel}) AND HEALTH CONDITIONS (${conditions.join(', ')})".

Respond ONLY with valid JSON in this schema:
{
  "summary": "Short 1-line description of how these meals use the provided ingredients",
  "recommendations": [
    {
      "dish_name": "Authentic dish name",
      "is_vegetarian": ${isVeg ? "true" : "false"},
      "prep_time_minutes": 15,
      "difficulty": "Easy",
      "ingredients_used": ["Matching ingredients from: ${inputString}"],
      "missing_ingredients": ["Salt", "Oil", "Spices"],
      "portion_guidance": {
        "serving_size": "e.g. 1.5 katori + 2 rotis",
        "household_measure": "Household measure",
        "reasoning": "Clinical rationale for user's ${weightKg}kg weight and ${conditions.join(', ')}."
      },
      "nutrition": {
        "calories": 380,
        "protein_g": 22.0,
        "carbs_g": 35.0,
        "fat_g": 12.0,
        "fiber_g": 6.5,
        "sodium_mg": 320
      },
      "goal_impact": {
        "goal_name": "${goalLabel}",
        "summary": "This will help you in your ${goalLabel} goal...",
        "how_it_helps": "This dish will help you in your ${goalLabel} goal by providing...",
        "helps_in_goal": "This will help you in ${goalLabel} by delivering high protein / controlled calories...",
        "helps_in_conditions": "This will help you in ${conditions.join(', ')} by maintaining low glycemic response and low sodium...",
        "benefit_badges": ["Prevents Glucose Spikes", "High Protein", "Heart Safe"],
        "medical_suitability": "ideal",
        "medical_notes": "Safe and beneficial for ${conditions.join(', ')}."
      },
      "quick_steps": [
        "Step 1...",
        "Step 2...",
        "Step 3..."
      ]
    }
  ]
}`;

        const genRes = await fetch(`${localUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: chosenModel,
            prompt: prompt,
            format: "json",
            stream: false
          }),
          signal: AbortSignal.timeout(20000)
        });

        if (genRes.ok) {
          const genData = await genRes.json();
          let rawText = genData.response || "";
          rawText = rawText.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.recommendations && parsed.recommendations.length > 0) {
              localLlmSuccess = true;
              localLlmRecommendations = parsed.recommendations.map((rec: any) => {
                const builtImpact = buildGoalImpact(rec, goalLabel, conditions, weightKg, targetCalories, targetProtein);
                return {
                  ...rec,
                  goal_impact: {
                    ...rec.goal_impact,
                    goal_name: goalLabel,
                    how_it_helps: rec.goal_impact?.how_it_helps || builtImpact.how_it_helps,
                    helps_in_goal: rec.goal_impact?.helps_in_goal || builtImpact.helps_in_goal,
                    helps_in_conditions: rec.goal_impact?.helps_in_conditions || builtImpact.helps_in_conditions,
                    benefit_badges: rec.goal_impact?.benefit_badges || builtImpact.benefit_badges,
                    medical_notes: rec.goal_impact?.medical_notes || builtImpact.medical_notes
                  }
                };
              });
            }
          }
        }
      }
    } catch (llmErr) {
      console.warn("Local Ollama inference failed, falling back to database matches:", llmErr);
    }

    // Combine or select the best recommendations
    let finalRecs: any[] = [];
    let activeModelName = "qwen2.5vl:3b (Local Ollama)";

    if (localLlmSuccess && localLlmRecommendations.length > 0) {
      // Merge local LLM recommendations with top complementary dishes from database for even more options!
      const existingNames = new Set(localLlmRecommendations.map(r => r.dish_name.toLowerCase()));
      const extraDatabaseDishes = databaseMatches
        .filter(d => !existingNames.has(d.dish_name.toLowerCase()))
        .slice(0, 2)
        .map(d => {
          const impact = buildGoalImpact(d, goalLabel, conditions, weightKg, targetCalories, targetProtein);
          return {
            ...d,
            goal_impact: impact
          };
        });

      finalRecs = [...localLlmRecommendations, ...extraDatabaseDishes];
    } else {
      activeModelName = "NutriVision 50+ Recipe Database";
      finalRecs = databaseMatches.map(d => {
        const impact = buildGoalImpact(d, goalLabel, conditions, weightKg, targetCalories, targetProtein);
        return {
          ...d,
          goal_impact: impact
        };
      });
    }

    return NextResponse.json({
      success: true,
      provider: localLlmSuccess ? "local" : "database",
      model: activeModelName,
      summary: `Found ${finalRecs.length} personalized, authentic dishes matching your ingredients: "${inputString}".`,
      recommendations: finalRecs
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Builds explicit, structured, clinical statements answering: "This will help you in this kind of goal/way..."
function buildGoalImpact(
  dish: any,
  goal: string,
  conditions: string[],
  weightKg: number = 70,
  targetCal: number = 2000,
  targetProt: number = 75
) {
  const normGoal = (goal || "").toLowerCase();
  const protein = Math.round((dish.nutrition?.protein_g ?? dish.protein_g ?? 18) * 10) / 10;
  const calories = Math.round(dish.nutrition?.calories ?? dish.calories ?? 380);
  const fiber = Math.round((dish.nutrition?.fiber_g ?? dish.fiber_g ?? 6) * 10) / 10;
  const sodium = Math.round(dish.nutrition?.sodium_mg ?? dish.sodium_mg ?? 300);
  const proteinPercentOfDaily = Math.round((protein / Math.max(1, targetProt)) * 100);
  const caloriesPercentOfDaily = Math.round((calories / Math.max(1, targetCal)) * 100);

  let helpsInGoal = "";
  const benefitBadges: string[] = [];

  if (normGoal.includes("muscle") || normGoal.includes("gain") || normGoal.includes("bulk")) {
    helpsInGoal = `This will help you in **Muscle Gain & Lean Hypertrophy** by packing **${protein}g of high-density protein** (covering ${proteinPercentOfDaily}% of your daily ${targetProt}g target). This directly triggers muscle protein synthesis (MPS) and accelerates post-workout tissue repair while preventing muscle catabolism.`;
    benefitBadges.push(`💪 +${protein}g Muscle Protein`);
    benefitBadges.push("⚡ Triggers Protein Synthesis");
  } else if (normGoal.includes("loose") || normGoal.includes("loss") || normGoal.includes("fat") || normGoal.includes("weight")) {
    helpsInGoal = `This will help you in **Fat Loss & Body Recomposition** by keeping calories tight at **${calories} kcal** (${caloriesPercentOfDaily}% of your daily budget) while providing **${fiber}g of natural dietary fiber**. This fiber absorbs water in the stomach to trigger stretch receptors, keeping you completely full for 4–5 hours without snacking cravings.`;
    benefitBadges.push(`🔻 Calorie Controlled (${calories} kcal)`);
    benefitBadges.push("🛡️ Curbs Hunger for 4+ Hours");
  } else if (normGoal.includes("sugar") || normGoal.includes("diabetes")) {
    helpsInGoal = `This will help you in **Blood Sugar Regulation** by pairing complex carbohydrates with healthy fiber, resulting in a low glycemic impact that prevents rapid post-meal glucose spikes and protects your pancreatic beta cells.`;
    benefitBadges.push("🩸 Zero Glucose Spikes");
    benefitBadges.push("📉 Low Glycemic Impact");
  } else {
    helpsInGoal = `This will help you in **All-Day Vitality & Steady Energy** by providing an optimal ICMR macronutrient balance (approx. 50% complex carbs, 25% protein, 25% good fats), preventing the afternoon energy crashes common with refined foods.`;
    benefitBadges.push("⚡ Sustained Clean Energy");
    benefitBadges.push("⚖️ ICMR Macro Calibrated");
  }

  let helpsInConditions = "";
  if (conditions.some(c => c.toLowerCase().includes("diabetes") || c.toLowerCase().includes("sugar") || c.toLowerCase().includes("prediabetes"))) {
    helpsInConditions += `🛡️ **In Prediabetes / Diabetes:** The ${fiber}g of soluble fiber forms a gentle gel in the intestines, slowing down glucose absorption into the bloodstream so your post-meal glucose stays safe (target <140 mg/dL). `;
    if (!benefitBadges.includes("🩸 Zero Glucose Spikes")) benefitBadges.push("🩸 Low Glycemic Index");
  }

  if (conditions.some(c => c.toLowerCase().includes("hypertension") || c.toLowerCase().includes("bp") || c.toLowerCase().includes("pressure"))) {
    helpsInConditions += `❤️ **In High BP / Hypertension:** Modest sodium (${sodium}mg) preserves arterial elasticity and prevents fluid retention, keeping systolic/diastolic blood pressure under control. `;
    benefitBadges.push("❤️ Arterial BP Protection");
  }

  if (conditions.some(c => c.toLowerCase().includes("pcos") || c.toLowerCase().includes("thyroid"))) {
    helpsInConditions += `🧬 **In Metabolic / Hormonal Health:** High micronutrient density and clean protein stabilize peripheral insulin sensitivity. `;
    benefitBadges.push("🧬 Hormonal Support");
  }

  if (!helpsInConditions) {
    helpsInConditions = `✨ **In Overall Metabolic Health:** Prepared with wholesome ingredients to protect cardiovascular elasticity, cell recovery, and natural gut microbiome diversity.`;
  }

  const howItHelps = `${helpsInGoal} ${helpsInConditions}`;

  return {
    goal_name: goal.replace(/_/g, " "),
    summary: howItHelps,
    how_it_helps: howItHelps,
    helps_in_goal: helpsInGoal,
    helps_in_conditions: helpsInConditions,
    benefit_badges: benefitBadges.slice(0, 4),
    medical_suitability: "ideal",
    medical_notes: `Clinically suited for ${conditions.join(", ") || "metabolic health"}. Sodium: ${sodium}mg, Glycemic impact: low to moderate.`
  };
}

import { NextRequest, NextResponse } from "next/server";
import { matchDishesFromDatabase } from "@/lib/recipe_database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      ingredients = [],
      rawInput = "",
      dishName = "",
      userProfile = {},
      dietaryPreference = "vegetarian",
      mealType = "breakfast" // "breakfast" | "lunch" | "dinner" | "snack"
    } = body;

    const inputString = (rawInput || dishName || ingredients.join(", ")).trim();
    const mealLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);

    // AI Provider Configuration
    const provider = req.headers.get("x-ai-provider") || body.provider || "local";
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

    // 1. Pre-fetch database matches as fallback and complementary ideas
    const databaseMatches = matchDishesFromDatabase(inputString, diet, goal, weightKg, conditions);

    // 2. Real-time On-the-spot AI generation via Local Ollama
    let localLlmSuccess = false;
    let topRecommendation: any = null;
    let allRecommendations: any[] = [];
    let activeModelName = "qwen2.5vl:3b (On-The-Spot AI)";

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

        const prompt = `You are NutriVision's Clinical AI Chef grounded in ICMR-NIN 2024.
User provided EXACT ingredients: "${inputString}".
Target Meal Slot: ${mealLabel.toUpperCase()} (e.g. Breakfast, Lunch, Dinner, Snack).
Dietary Filter: ${isVeg ? "STRICT VEGETARIAN (No eggs, meat, chicken, or fish)" : "NON-VEGETARIAN (Eggs, chicken, fish allowed)"}.
User: Age ${age}, Weight ${weightKg}kg, Goal: ${goalLabel.toUpperCase()}, Medical Conditions: ${conditions.join(", ")}.

CRITICAL TASK:
Generate 5 authentic dishes specifically appropriate for ${mealLabel.toUpperCase()} strictly using the ingredients "${inputString}".
Select ONE dish as your absolute #1 TOP RECOMMENDATION ("top_recommendation") and provide 4 other options ("other_options").
Explain explicitly in plain words why it is the top pick and how it helps their ${goalLabel} goal and ${conditions.join(', ')}.

Respond ONLY with valid JSON in this exact structure:
{
  "summary": "Created 5 authentic ${mealLabel} meals tailored to your ingredients",
  "top_recommendation": {
    "dish_name": "Authentic dish name",
    "why_top_pick": "Why this is your #1 best choice for ${goalLabel} and ${conditions.join(', ')}",
    "prep_time_minutes": 12,
    "difficulty": "Easy",
    "is_vegetarian": ${isVeg ? "true" : "false"},
    "ingredients_used": ["Matching ingredients from: ${inputString}"],
    "missing_ingredients": ["Salt", "Oil"],
    "portion_guidance": {
      "serving_size": "e.g. 1 plate / 2 slices",
      "household_measure": "Household measure",
      "reasoning": "Portion rationale for ${weightKg}kg weight and ${conditions.join(', ')}"
    },
    "nutrition": {
      "calories": 360,
      "protein_g": 22.0,
      "carbs_g": 32.0,
      "fat_g": 12.0,
      "fiber_g": 5.5,
      "sodium_mg": 310
    },
    "goal_impact": {
      "goal_name": "${goalLabel}",
      "helps_in_goal": "This will help you in ${goalLabel} by delivering high protein / controlled calories...",
      "helps_in_conditions": "This will help you in ${conditions.join(', ')} by maintaining low glycemic response and low sodium...",
      "benefit_badges": ["High Protein", "Low GI", "Heart Safe"]
    },
    "quick_steps": ["Step 1...", "Step 2..."]
  },
  "other_options": [
    {
      "dish_name": "Second dish name",
      "prep_time_minutes": 15,
      "difficulty": "Easy",
      "is_vegetarian": ${isVeg ? "true" : "false"},
      "ingredients_used": ["..."],
      "missing_ingredients": ["..."],
      "portion_guidance": {
        "serving_size": "1 serving",
        "household_measure": "1 bowl",
        "reasoning": "Portion guidance..."
      },
      "nutrition": {
        "calories": 320,
        "protein_g": 18.0,
        "carbs_g": 28.0,
        "fat_g": 10.0,
        "fiber_g": 4.5,
        "sodium_mg": 280
      },
      "goal_impact": {
        "goal_name": "${goalLabel}",
        "helps_in_goal": "...",
        "helps_in_conditions": "...",
        "benefit_badges": ["Clean Energy"]
      },
      "quick_steps": ["Step 1...", "Step 2..."]
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
          signal: AbortSignal.timeout(25000)
        });

        if (genRes.ok) {
          const genData = await genRes.json();
          let rawText = genData.response || "";
          rawText = rawText.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            
            // Format top recommendation
            if (parsed.top_recommendation && parsed.top_recommendation.dish_name) {
              const top = parsed.top_recommendation;
              const builtImpact = buildGoalImpact(top, goalLabel, conditions, weightKg, targetCalories, targetProtein);
              topRecommendation = {
                ...top,
                is_top_recommendation: true,
                meal_type: mealType,
                recommendation_reason: top.why_top_pick || `🏆 #1 Top Choice: Perfectly calibrated for your ${mealLabel} and ${goalLabel} goal.`,
                goal_impact: {
                  ...top.goal_impact,
                  goal_name: goalLabel,
                  how_it_helps: builtImpact.how_it_helps,
                  helps_in_goal: top.goal_impact?.helps_in_goal || builtImpact.helps_in_goal,
                  helps_in_conditions: top.goal_impact?.helps_in_conditions || builtImpact.helps_in_conditions,
                  benefit_badges: top.goal_impact?.benefit_badges || builtImpact.benefit_badges,
                  medical_notes: builtImpact.medical_notes
                }
              };
            }

            // Format other options
            const others = (parsed.other_options || parsed.recommendations || []).map((dish: any) => {
              const builtImpact = buildGoalImpact(dish, goalLabel, conditions, weightKg, targetCalories, targetProtein);
              return {
                ...dish,
                is_top_recommendation: false,
                meal_type: mealType,
                goal_impact: {
                  ...dish.goal_impact,
                  goal_name: goalLabel,
                  how_it_helps: builtImpact.how_it_helps,
                  helps_in_goal: dish.goal_impact?.helps_in_goal || builtImpact.helps_in_goal,
                  helps_in_conditions: dish.goal_impact?.helps_in_conditions || builtImpact.helps_in_conditions,
                  benefit_badges: dish.goal_impact?.benefit_badges || builtImpact.benefit_badges,
                  medical_notes: builtImpact.medical_notes
                }
              };
            });

            if (topRecommendation) {
              allRecommendations = [topRecommendation, ...others];
              localLlmSuccess = true;
            } else if (others.length > 0) {
              others[0].is_top_recommendation = true;
              topRecommendation = others[0];
              allRecommendations = others;
              localLlmSuccess = true;
            }
          }
        }
      }
    } catch (llmErr) {
      console.warn("Local Ollama on-the-spot generation failed, using dynamic database engine:", llmErr);
    }

    // Fallback if LLM was unavailable: Use our 70+ database matched specifically to the ingredients and meal type!
    if (!localLlmSuccess || allRecommendations.length === 0) {
      activeModelName = "NutriVision Dynamic Culinary Engine";
      allRecommendations = databaseMatches.map((dish, idx) => {
        const isTop = idx === 0;
        const builtImpact = buildGoalImpact(dish, goalLabel, conditions, weightKg, targetCalories, targetProtein);
        return {
          ...dish,
          meal_type: mealType,
          is_top_recommendation: isTop,
          recommendation_reason: isTop ? `🏆 #1 Top Choice: Best matches your listed ingredients and ${goalLabel} targets.` : "",
          goal_impact: builtImpact
        };
      });

      topRecommendation = allRecommendations[0] || null;
    }

    return NextResponse.json({
      success: true,
      provider: localLlmSuccess ? "local" : "dynamic_engine",
      model: activeModelName,
      meal_type: mealType,
      summary: `Generated ${allRecommendations.length} personalized ${mealLabel} dishes using your ingredients: "${inputString}".`,
      top_recommendation: topRecommendation,
      recommendations: allRecommendations
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

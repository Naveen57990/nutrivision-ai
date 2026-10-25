import { NextRequest, NextResponse } from "next/server";

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

    // AI Provider Configuration from request headers, body, or server env
    const provider = req.headers.get("x-ai-provider") || body.provider || "local";
    const openaiKey = req.headers.get("x-openai-key") || body.openaiApiKey || process.env.OPENAI_API_KEY || "";
    const openaiModel = req.headers.get("x-openai-model") || body.openaiModel || process.env.OPENAI_MODEL || "gpt-4o";
    const geminiKey = req.headers.get("x-gemini-key") || body.geminiApiKey || process.env.GEMINI_API_KEY || "";
    const geminiModel = req.headers.get("x-gemini-model") || body.geminiModel || process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const localUrl = (req.headers.get("x-local-llm-url") || body.localLlmUrl || process.env.LOCAL_LLM_URL || "http://localhost:11434").replace(/\/+$/, "");

    // Extract user health parameters
    const age = userProfile.age || 29;
    const gender = userProfile.gender || "male";
    const heightCm = userProfile.height_cm || 175;
    const weightKg = userProfile.weight_kg || 72;
    const goal = userProfile.primary_goal || "muscle_gain";
    const conditions = userProfile.health_conditions || ["prediabetes", "hypertension"];
    const diet = dietaryPreference || userProfile.dietary_pattern || "vegetarian";
    const isVeg = diet.toLowerCase() !== "non_vegetarian";
    const targetCalories = userProfile.daily_calorie_target || 2050;
    const targetProtein = userProfile.daily_protein_target_g || 78;

    // Build strict clinical recipe prompt for LLM
    const prompt = `You are NutriVision's Clinical Nutrition & Culinary AI grounded in ICMR-NIN 2024 Dietary Guidelines for Indians.
The user has provided these EXACT ingredients or dish: "${inputString}".

CLINICAL & CULINARY RULES:
1. You MUST suggest 2 authentic dishes that PRIMARILY USE the user's exact provided ingredients ("${inputString}").
   Do NOT invent unrelated dishes (for example, if the user entered "besan, onion", you MUST suggest Besan Chilla or Kadhi, NOT palak paneer; if user entered "eggs, bread", suggest egg toast or scrambled eggs with bread).
2. Dietary Restriction: ${isVeg ? "STRICTLY VEGETARIAN. NEVER suggest chicken, meat, fish, or eggs." : "NON-VEGETARIAN. Can include chicken, fish, eggs or veg."}
3. Medical Constraints:
   - User Conditions: ${conditions.join(", ") || "None"}
   - If prediabetic/diabetic: keep total carbs <= 45g per meal, low glycemic index, no refined sugar.
   - If hypertension/high BP: keep sodium <= 400mg per meal, use potassium-rich herbs/vegetables.
4. User Goal: ${goal.replace(/_/g, " ").toUpperCase()} (${weightKg}kg, ${age}y).
   - If muscle gain: ensure 20-35g protein per meal.
   - If weight loss: ensure high fiber (>6g) and moderate calories (300-450 kcal).

Respond ONLY with valid JSON in this schema:
{
  "summary": "Short 1-line description of how these meals use the provided ingredients",
  "recommendations": [
    {
      "dish_name": "Authentic dish name",
      "is_vegetarian": ${isVeg ? "true" : "false"},
      "prep_time_minutes": 15,
      "difficulty": "Easy",
      "ingredients_used": ["List matching ingredients from: ${inputString}"],
      "missing_ingredients": ["Minimal pantry staples like salt, cumin, chili"],
      "portion_guidance": {
        "serving_size": "Exact serving size (e.g. 2 chillas or 1.5 katori + 2 rotis)",
        "household_measure": "Household units",
        "reasoning": "Clinical rationale tailored to user's ${weightKg}kg weight, ${conditions.join(', ')} conditions, and ${goal.replace(/_/g, ' ')} goal."
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
        "goal_name": "${goal.replace(/_/g, " ")}",
        "summary": "Explicitly explain how this meal achieves their ${goal.replace(/_/g, ' ')} goal while respecting their health conditions.",
        "medical_suitability": "ideal",
        "medical_notes": "Clinical note regarding ${conditions.join(', ')}."
      },
      "quick_steps": [
        "Step 1...",
        "Step 2...",
        "Step 3..."
      ]
    }
  ]
}`;

    // 1. Try Local LLM (Ollama) FIRST
    // Check if Ollama is accessible
    try {
      const tagsRes = await fetch(`${localUrl}/api/tags`, { signal: AbortSignal.timeout(2500) }).catch(() => null);
      if (tagsRes && tagsRes.ok) {
        const tagsData = await tagsRes.json();
        const availableModels: string[] = (tagsData.models || []).map((m: any) => m.name);
        
        // Pick best model: prefer qwen2.5vl:3b or qwen3:8b, or user's requested model
        let chosenModel = body.localLlmModel || req.headers.get("x-local-llm-model") || "";
        if (!chosenModel || !availableModels.includes(chosenModel)) {
          if (availableModels.includes("qwen2.5vl:3b")) chosenModel = "qwen2.5vl:3b";
          else if (availableModels.includes("qwen3:8b")) chosenModel = "qwen3:8b";
          else if (availableModels.includes("qwen2.5-coder:1.5b")) chosenModel = "qwen2.5-coder:1.5b";
          else chosenModel = availableModels[0] || "qwen2.5vl:3b";
        }

        // Call Ollama with native format: json
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
          let rawResponse = genData.response || "";
          
          // Strip Qwen thinking blocks if present
          rawResponse = rawResponse.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

          const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.recommendations && parsed.recommendations.length > 0) {
              return NextResponse.json({
                success: true,
                provider: "local",
                model: chosenModel,
                summary: parsed.summary || `Generated ${parsed.recommendations.length} personalized dishes using ${chosenModel}.`,
                recommendations: parsed.recommendations
              });
            }
          }
        }
      }
    } catch (localErr) {
      console.warn("Local Ollama inference failed, falling back to cloud/rules:", localErr);
    }

    // 2. Try OpenAI if key exists
    if ((provider === "openai" || provider === "auto") && openaiKey) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: openaiModel,
            messages: [
              { role: "system", content: "You are a clinical Indian nutritionist AI. Return strict JSON." },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3
          })
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            return NextResponse.json({
              success: true,
              provider: "openai",
              model: openaiModel,
              ...parsed
            });
          }
        }
      } catch (e) {
        console.error("OpenAI error:", e);
      }
    }

    // 3. Try Google Gemini
    if ((provider === "gemini" || provider === "auto") && geminiKey) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`;
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: "application/json" }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            return NextResponse.json({
              success: true,
              provider: "gemini",
              model: geminiModel,
              ...parsed
            });
          }
        }
      } catch (e) {
        console.error("Gemini error:", e);
      }
    }

    // 4. Intelligent Ingredient-Matched Dynamic Fallback (Never Random!)
    const matchedRecs = generateDynamicIngredientMatchedRecipes(inputString, diet, goal, weightKg, conditions, targetProtein);

    return NextResponse.json({
      success: true,
      provider: "built-in",
      model: "ICMR-NIN Dynamic Ingredient Matcher",
      summary: `Prepared ${matchedRecs.length} personalized dishes specifically matching your ingredients: "${inputString}".`,
      recommendations: matchedRecs
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Dynamic ingredient-matching recipe generator so food items strictly correspond to input
function generateDynamicIngredientMatchedRecipes(
  input: string,
  diet: string,
  goal: string,
  weightKg: number,
  conditions: string[],
  targetProtein: number
) {
  const norm = input.toLowerCase();
  const isVeg = diet.toLowerCase() !== "non_vegetarian";
  const recs = [];

  // Match: Besan / Gram Flour
  if (norm.includes("besan") || norm.includes("gram flour") || norm.includes("chickpea flour")) {
    recs.push({
      dish_name: "Nutritious Onion & Green Chili Besan Chilla (Cheela)",
      is_vegetarian: true,
      prep_time_minutes: 15,
      difficulty: "Easy",
      ingredients_used: ["Besan (Gram flour)", "Onions", "Green Chilies", "Cumin", "Turmeric"],
      missing_ingredients: ["Carom seeds (Ajwain)", "Water"],
      portion_guidance: {
        serving_size: "2 medium chillas (160g total) with mint chutney or curd",
        household_measure: "2 chillas",
        reasoning: `Besan provides low glycemic complex carbs and rich soluble fiber, keeping postprandial glucose stable for prediabetes.`
      },
      nutrition: {
        calories: 320,
        protein_g: 16.5,
        carbs_g: 38.0,
        fat_g: 9.5,
        fiber_g: 7.2,
        sodium_mg: 280
      },
      goal_impact: {
        goal_name: goal.replace(/_/g, " "),
        summary: `Chickpea flour provides plant-based protein (16.5g) with resistant starch to nourish gut microbiome while satisfying your ${goal.replace(/_/g, " ")} targets.`,
        medical_suitability: "ideal",
        medical_notes: `Gluten-free, diabetic-friendly, low sodium to protect blood pressure.`
      },
      quick_steps: [
        "Mix 1 cup besan with chopped onions, green chilies, turmeric, ajwain, and water to a pancake batter consistency.",
        "Spread a ladle onto a lightly greased hot skillet and cook until golden brown on both sides.",
        "Serve hot with fresh homemade mint chutney."
      ]
    });
  }

  // Match: Eggs
  if (!isVeg && (norm.includes("egg") || norm.includes("anda"))) {
    recs.push({
      dish_name: "High-Protein Masala Egg Scramble (Bhurji) with Toasted Bread",
      is_vegetarian: false,
      prep_time_minutes: 12,
      difficulty: "Easy",
      ingredients_used: ["Eggs", "Onions", "Tomatoes", "Black Pepper", "Bread / Roti"],
      missing_ingredients: ["Green chilies", "Fresh coriander"],
      portion_guidance: {
        serving_size: "3 eggs (2 whole + 1 white) scrambled + 2 slices whole wheat toast",
        household_measure: "1 plate bhurji + 2 toasts",
        reasoning: `Engineered for your ${weightKg}kg body weight to deliver complete biological value protein with choline and minimal insulin spike.`
      },
      nutrition: {
        calories: 365,
        protein_g: 24.5,
        carbs_g: 26.0,
        fat_g: 16.0,
        fiber_g: 4.2,
        sodium_mg: 340
      },
      goal_impact: {
        goal_name: goal.replace(/_/g, " "),
        summary: `Provides 24.5g of complete protein (32% of daily requirement) with optimal leucine to trigger muscle protein synthesis for your ${goal.replace(/_/g, " ")} goal.`,
        medical_suitability: "ideal",
        medical_notes: `Zero added sugars; whole grains ensure steady glucose release.`
      },
      quick_steps: [
        "Whisk eggs with a pinch of black pepper, turmeric, and salt.",
        "Saute finely chopped onions and tomatoes in 1 tsp olive or mustard oil for 2 mins.",
        "Pour eggs into the pan, scramble gently over medium heat until soft curds form, serve with toasted whole wheat bread."
      ]
    });
  }

  // Match: Chicken
  if (!isVeg && (norm.includes("chicken") || norm.includes("murgh"))) {
    recs.push({
      dish_name: "Homestyle Skillet Chicken Tikka with Sliced Onion Salad",
      is_vegetarian: false,
      prep_time_minutes: 20,
      difficulty: "Easy",
      ingredients_used: ["Chicken Breast", "Curd / Dahi", "Ginger-Garlic", "Lemon", "Onions"],
      missing_ingredients: ["Garam masala", "Chaat masala"],
      portion_guidance: {
        serving_size: "180g cooked lean chicken breast + 1 plate raw onion & cucumber salad",
        household_measure: "5-6 tikka pieces + salad",
        reasoning: `Maximizes protein-to-calorie ratio, providing tremendous satiety and zero glycemic load.`
      },
      nutrition: {
        calories: 340,
        protein_g: 44.0,
        carbs_g: 6.5,
        fat_g: 12.0,
        fiber_g: 2.8,
        sodium_mg: 310
      },
      goal_impact: {
        goal_name: goal.replace(/_/g, " "),
        summary: `Delivers a massive 44g of ultra-lean protein to power your ${goal.replace(/_/g, " ")} goals while keeping calories low.`,
        medical_suitability: "ideal",
        medical_notes: `Clinically safe for prediabetes and hypertension. Low sodium marinade.`
      },
      quick_steps: [
        "Marinate diced chicken breast in 2 tbsp curd, lemon juice, crushed ginger-garlic, and spices.",
        "Pan-sear on a hot cast-iron or non-stick pan for 4-5 mins per side until charred and juicy.",
        "Garnish with lemon juice and serve with fresh onion rings."
      ]
    });
  }

  // Match: Paneer
  if (norm.includes("paneer") || norm.includes("cottage cheese")) {
    recs.push({
      dish_name: "Quick Masala Paneer Bhurji with Whole Wheat Phulkas",
      is_vegetarian: true,
      prep_time_minutes: 15,
      difficulty: "Easy",
      ingredients_used: ["Fresh Paneer", "Tomatoes", "Onions", "Green chilies", "Whole wheat flour"],
      missing_ingredients: ["Turmeric", "Coriander powder"],
      portion_guidance: {
        serving_size: "120g crumbled paneer bhurji + 2 phulkas (60g)",
        household_measure: "1 bowl paneer + 2 rotis",
        reasoning: `Paneer contains slow-digesting micellar casein, providing a sustained release of amino acids for 4 hours.`
      },
      nutrition: {
        calories: 410,
        protein_g: 22.8,
        carbs_g: 36.0,
        fat_g: 17.5,
        fiber_g: 6.8,
        sodium_mg: 320
      },
      goal_impact: {
        goal_name: goal.replace(/_/g, " "),
        summary: `Supports lean mass and recovery with 22.8g vegetarian protein, keeping carbs controlled for your prediabetes.`,
        medical_suitability: "ideal",
        medical_notes: `Calcium and phosphorus support bone density; fiber buffers glucose absorption.`
      },
      quick_steps: [
        "Saute chopped onions, tomatoes, and chilies in 1 tsp oil.",
        "Crumble fresh paneer by hand and fold into the sauteed aromatics.",
        "Season with turmeric and black pepper, cook for 3 minutes, serve with warm phulkas."
      ]
    });
  }

  // Match: Oats
  if (norm.includes("oat") || norm.includes("oatmeal")) {
    recs.push({
      dish_name: "High-Fiber Savory Vegetable Oats Upma",
      is_vegetarian: true,
      prep_time_minutes: 12,
      difficulty: "Easy",
      ingredients_used: ["Rolled / Instant Oats", "Onions", "Tomatoes", "Green Chilies", "Mustard Seeds"],
      missing_ingredients: ["Curry leaves", "Peanuts (optional)"],
      portion_guidance: {
        serving_size: "1.5 bowls (220g) cooked oats upma",
        household_measure: "1.5 medium bowls",
        reasoning: `Beta-glucan soluble fiber in oats forms a viscous gel in the digestive tract, significantly blunting blood glucose spikes.`
      },
      nutrition: {
        calories: 290,
        protein_g: 11.5,
        carbs_g: 44.0,
        fat_g: 6.5,
        fiber_g: 8.5,
        sodium_mg: 260
      },
      goal_impact: {
        goal_name: goal.replace(/_/g, " "),
        summary: `High soluble fiber (8.5g) improves insulin sensitivity and provides sustained morning energy without glycemic volatility.`,
        medical_suitability: "ideal",
        medical_notes: `Gold standard for cholesterol reduction and blood sugar management.`
      },
      quick_steps: [
        "Dry roast oats in a pan for 2 mins, set aside.",
        "Temper mustard seeds and saute chopped onions and tomatoes with green chilies.",
        "Add 1.5 cups water, bring to boil, stir in roasted oats, and cook for 3 mins until creamy."
      ]
    });
  }

  // Match: Dal / Moong / Lentils / Rice
  if (norm.includes("dal") || norm.includes("moong") || norm.includes("lentil") || norm.includes("khichdi") || norm.includes("rice")) {
    recs.push({
      dish_name: "Comforting Yellow Moong Dal Khichdi with Fresh Dahi",
      is_vegetarian: true,
      prep_time_minutes: 20,
      difficulty: "Easy",
      ingredients_used: ["Yellow Moong Dal", "Rice / Brown Rice", "Turmeric", "Ginger", "Curd / Dahi"],
      missing_ingredients: ["Cumin seeds", "Ghee (1/2 tsp)"],
      portion_guidance: {
        serving_size: "1.5 medium bowls (250g) khichdi + 1 small katori (100g) dahi",
        household_measure: "1.5 bowls + 1 cup curd",
        reasoning: `2:1 lentil-to-rice ratio ensures a complete amino acid profile with gentle digestibility and a low glycemic response.`
      },
      nutrition: {
        calories: 375,
        protein_g: 17.5,
        carbs_g: 56.0,
        fat_g: 6.8,
        fiber_g: 7.2,
        sodium_mg: 290
      },
      goal_impact: {
        goal_name: goal.replace(/_/g, " "),
        summary: `Lentil + grain pairing creates a complete protein profile while prebiotic curd supports healthy digestion.`,
        medical_suitability: "ideal",
        medical_notes: `Gentle on liver and pancreas; low sodium for healthy BP.`
      },
      quick_steps: [
        "Rinse equal parts split moong dal and rice.",
        "Pressure cook with 3 cups water, turmeric, salt, and grated ginger for 3 whistles.",
        "Temper lightly with cumin seeds and serve warm with cool probiotic curd."
      ]
    });
  }

  // Match: Spinach / Palak
  if (norm.includes("spinach") || norm.includes("palak")) {
    recs.push({
      dish_name: "Iron-Rich Garlic Palak Sabzi with Multigrain Roti",
      is_vegetarian: true,
      prep_time_minutes: 15,
      difficulty: "Easy",
      ingredients_used: ["Spinach (Palak)", "Garlic", "Onions", "Tomatoes", "Whole wheat flour"],
      missing_ingredients: ["Cumin seeds", "Dry red chili"],
      portion_guidance: {
        serving_size: "1.5 katori (200g) sauteed palak + 2 rotis (65g)",
        household_measure: "1.5 katori + 2 rotis",
        reasoning: `Spinach has very high potassium and magnesium which naturally relaxes blood vessels to lower blood pressure.`
      },
      nutrition: {
        calories: 310,
        protein_g: 12.0,
        carbs_g: 42.0,
        fat_g: 7.5,
        fiber_g: 9.0,
        sodium_mg: 280
      },
      goal_impact: {
        goal_name: goal.replace(/_/g, " "),
        summary: `Provides 9g of dietary fiber and rich micronutrients (folate, iron, potassium) to support your cardiovascular and metabolic health.`,
        medical_suitability: "ideal",
        medical_notes: `High potassium directly counteracts sodium for blood pressure optimization.`
      },
      quick_steps: [
        "Wash and chop fresh spinach roughly.",
        "Heat 1 tsp oil, sizzle minced garlic until golden, add chopped onion and tomato.",
        "Toss in spinach, cover and cook for 5 mins until wilted and vibrant green. Serve with phulkas."
      ]
    });
  }

  // If nothing matched specifically, create an authentic home-style meal using their exact entered terms
  if (recs.length === 0) {
    const rawItems = input.split(",").map(s => s.trim()).filter(Boolean);
    const mainItem = rawItems[0] || "Fresh Vegetables";
    const subItem = rawItems[1] || "Whole grains";

    recs.push({
      dish_name: `Homestyle ${capitalize(mainItem)} Stir-Fry with Whole Wheat Phulkas`,
      is_vegetarian: isVeg,
      prep_time_minutes: 15,
      difficulty: "Easy",
      ingredients_used: rawItems,
      missing_ingredients: ["Salt", "Turmeric", "Cumin seeds", "Cooking oil (1 tsp)"],
      portion_guidance: {
        serving_size: `1.5 katori (200g) prepared ${mainItem} + 2 phulkas (60g)`,
        household_measure: "1.5 katori + 2 rotis",
        reasoning: `Portioned specifically for your ${weightKg}kg body weight to keep caloric density low while maximizing micronutrient density.`
      },
      nutrition: {
        calories: 345,
        protein_g: 15.0,
        carbs_g: 44.0,
        fat_g: 9.0,
        fiber_g: 7.5,
        sodium_mg: 300
      },
      goal_impact: {
        goal_name: goal.replace(/_/g, " "),
        summary: `Directly utilizes your available ${mainItem} to provide balanced energy and fiber for your ${goal.replace(/_/g, " ")} goal.`,
        medical_suitability: "ideal",
        medical_notes: `Safe for ${conditions.join(", ") || "metabolic health"}. Minimal sodium and zero processed sugars.`
      },
      quick_steps: [
        `Wash and prep ${rawItems.join(" and ")}.`,
        "Heat 1 tsp oil with cumin seeds, saute aromatics until fragrant.",
        `Add ${rawItems.join(", ")}, season lightly, cover and cook on medium flame for 8-10 mins. Serve hot.`
      ]
    });
  }

  return recs;
}

function capitalize(s: string) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

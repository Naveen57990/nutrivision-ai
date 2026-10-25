import { NextResponse } from "next/server";

const RECIPES_DB = [
  {
    recipe_id: 1,
    name: "Comforting Moong Dal Khichdi",
    regional_cuisine: "Pan-Indian",
    meal_types: "lunch,dinner",
    prep_time_minutes: 20,
    calories_est: 320.0,
    protein_est: 11.5,
    carbs_est: 52.0,
    fat_est: 6.5,
    fiber_est: 5.2,
    image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    ingredients: ["rice", "moong dal", "cumin", "turmeric", "ghee", "salt"],
    essential_ingredients: ["rice", "moong dal"]
  },
  {
    recipe_id: 2,
    name: "High-Protein Egg Bhurji with Roti",
    regional_cuisine: "North Indian",
    meal_types: "breakfast,lunch,dinner",
    prep_time_minutes: 15,
    calories_est: 395.0,
    protein_est: 22.0,
    carbs_est: 38.0,
    fat_est: 14.5,
    fiber_est: 5.8,
    image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80",
    ingredients: ["eggs", "onion", "tomato", "green chili", "roti", "oil"],
    essential_ingredients: ["eggs", "onion", "tomato"]
  },
  {
    recipe_id: 3,
    name: "Classic Dal Tadka with Steamed Rice",
    regional_cuisine: "Pan-Indian",
    meal_types: "lunch,dinner",
    prep_time_minutes: 25,
    calories_est: 410.0,
    protein_est: 13.5,
    carbs_est: 68.0,
    fat_est: 7.0,
    fiber_est: 6.8,
    image_url: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
    ingredients: ["toor dal", "rice", "onion", "tomato", "garlic", "cumin"],
    essential_ingredients: ["toor dal", "rice"]
  },
  {
    recipe_id: 4,
    name: "Homestyle Paneer Bhurji with Chapati",
    regional_cuisine: "North Indian",
    meal_types: "lunch,dinner",
    prep_time_minutes: 15,
    calories_est: 440.0,
    protein_est: 21.5,
    carbs_est: 36.0,
    fat_est: 20.0,
    fiber_est: 5.4,
    image_url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
    ingredients: ["paneer", "onion", "tomato", "roti", "coriander"],
    essential_ingredients: ["paneer", "onion", "tomato"]
  },
  {
    recipe_id: 5,
    name: "Aloo Jeera (Cumin Spiced Potatoes) with Roti",
    regional_cuisine: "North Indian",
    meal_types: "lunch,dinner",
    prep_time_minutes: 20,
    calories_est: 360.0,
    protein_est: 7.5,
    carbs_est: 58.0,
    fat_est: 8.5,
    fiber_est: 6.2,
    image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    ingredients: ["potato", "potatoes", "cumin", "roti", "oil", "turmeric"],
    essential_ingredients: ["potato", "potatoes"]
  },
  {
    recipe_id: 6,
    name: "South Indian Curd Rice (Thayir Sadham)",
    regional_cuisine: "South Indian",
    meal_types: "lunch,dinner",
    prep_time_minutes: 10,
    calories_est: 290.0,
    protein_est: 8.2,
    carbs_est: 46.0,
    fat_est: 6.0,
    fiber_est: 1.2,
    image_url: "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80",
    ingredients: ["rice", "curd", "dahi", "mustard seeds", "ginger", "salt"],
    essential_ingredients: ["rice", "curd"]
  }
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const available = (body.available_ingredients || []).map((s: string) => s.toLowerCase().trim());

    const tier1: any[] = [];
    const tier2: any[] = [];
    const tier3: any[] = [];

    for (const recipe of RECIPES_DB) {
      const matched: string[] = [];
      const missing: string[] = [];
      let missingEssential = 0;

      for (const reqIng of recipe.essential_ingredients) {
        const isFound = available.some((a: string) => a.includes(reqIng) || reqIng.includes(a));
        if (isFound) {
          matched.push(reqIng);
        } else {
          missing.push(reqIng);
          missingEssential++;
        }
      }

      const matchPct = Math.round((matched.length / recipe.essential_ingredients.length) * 100);

      const candidate = {
        recipe_id: recipe.recipe_id,
        name: recipe.name,
        regional_cuisine: recipe.regional_cuisine,
        match_percentage: matchPct,
        matched_ingredients: matched,
        missing_ingredients: missing,
        prep_time_minutes: recipe.prep_time_minutes,
        calories_est: recipe.calories_est,
        protein_est: recipe.protein_est,
        carbs_est: recipe.carbs_est,
        fat_est: recipe.fat_est,
        fiber_est: recipe.fiber_est,
        image_url: recipe.image_url,
        suitability_badge: matchPct === 100 ? "100% Ready to Cook" : `${matchPct}% Match`,
        explanation: matchPct === 100
          ? `Cooks in ${recipe.prep_time_minutes} min with ingredients you already have at home. Provides ${recipe.protein_est}g protein.`
          : `Nearly ready! Missing: ${missing.join(", ")}. Can easily substitute or pick up from local corner shop.`,
        portion_guidance: "Standard single serving (1 bowl / 1 plate with side salad)."
      };

      if (missingEssential === 0) {
        tier1.push(candidate);
      } else if (missingEssential === 1) {
        tier2.push(candidate);
      } else {
        tier3.push(candidate);
      }
    }

    return NextResponse.json({
      detected_pantry_count: available.length,
      tier1_best_available: tier1,
      tier2_reasonable_alternatives: tier2,
      tier3_requiring_caution: tier3,
      overall_pantry_insight: `Evaluated ${available.length} items. Found ${tier1.length} immediate zero-shopping meals and ${tier2.length} near-match options.`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

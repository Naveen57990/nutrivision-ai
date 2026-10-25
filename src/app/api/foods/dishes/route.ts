import { NextRequest, NextResponse } from "next/server";
import { DISH_DATABASE } from "@/lib/recipe_database";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();
  const diet = searchParams.get("diet") || "all";
  const mealType = searchParams.get("meal_type") || "all";

  let filtered = DISH_DATABASE;

  if (diet === "vegetarian") {
    filtered = filtered.filter(d => d.is_vegetarian);
  } else if (diet === "non_vegetarian") {
    filtered = filtered.filter(d => !d.is_vegetarian);
  }

  if (mealType !== "all") {
    filtered = filtered.filter(d => d.meal_types.includes(mealType as any));
  }

  if (q) {
    filtered = filtered.filter(d => 
      d.name.toLowerCase().includes(q) ||
      d.regional_cuisine.toLowerCase().includes(q) ||
      d.essential_ingredients.some(i => i.toLowerCase().includes(q)) ||
      d.description.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    total: filtered.length,
    dishes: filtered
  });
}

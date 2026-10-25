import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  
  // Return demo user profile if authenticated or as seamless fallback
  const demoUser = {
    id: 1,
    email: "demo@nutrivision.health",
    full_name: "Aarav Sharma",
    is_active: true,
    profile: {
      id: 1,
      age: 29,
      gender: "male",
      height_cm: 175,
      weight_kg: 72,
      activity_level: "moderate",
      dietary_pattern: "lacto_vegetarian",
      allergies: ["peanuts"],
      health_conditions: ["prediabetes"],
      primary_goal: "fat_loss",
      daily_calorie_target: 2050,
      daily_protein_target_g: 75,
      daily_carb_target_g: 260,
      daily_fat_target_g: 60,
      daily_fiber_target_g: 35
    }
  };

  return NextResponse.json(demoUser);
}

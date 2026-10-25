import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    return NextResponse.json({
      access_token: "mock-jwt-token-nutrivision-" + Date.now(),
      token_type: "bearer",
      user: {
        id: 1,
        email: email || "demo@nutrivision.health",
        full_name: email?.split("@")[0] || "Aarav Sharma",
        is_active: true
      }
    });
  } catch {
    return NextResponse.json(
      { detail: "Invalid request payload" },
      { status: 400 }
    );
  }
}

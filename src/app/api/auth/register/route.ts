import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, full_name } = body;

    return NextResponse.json({
      access_token: "mock-jwt-token-nutrivision-" + Date.now(),
      token_type: "bearer",
      user: {
        id: 2,
        email: email || "newuser@nutrivision.health",
        full_name: full_name || "New Member",
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

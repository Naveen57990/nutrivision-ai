import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const msg = (message || "").toLowerCase().trim();

    // 1. Emergency safety guardrail
    if (
      msg.includes("can't breathe") ||
      msg.includes("cannot breathe") ||
      msg.includes("throat swelling") ||
      msg.includes("anaphylaxis") ||
      msg.includes("choking")
    ) {
      return NextResponse.json({
        role: "assistant",
        content: `⚠️ EMERGENCY MEDICAL ADVICE:\n\nIf you or someone around you is having difficulty breathing, severe throat or tongue swelling, or acute allergic shock, immediately contact your local emergency services (112 in India, 911 in US) or proceed to the nearest emergency room. Do not rely on dietary advice during an acute allergic reaction.`,
        suggested_followups: ["Managing severe food allergies", "Emergency contacts"]
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const prompt = `You are NutriVision's AI Nutrition Coach grounded in ICMR-NIN 2024 Dietary Guidelines for Indians.
User says: "${message}".
Provide concise, warm, evidence-based nutrition advice. Emphasize home-cooked Indian foods, protein adequacy, and dietary fiber. Do not make unsupported medical diagnosis.`;

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.candidates[0].content.parts[0].text;
          return NextResponse.json({
            role: "assistant",
            content: reply,
            suggested_followups: [
              "What can I cook with what I have at home?",
              "How to increase fiber in an Indian diet?",
              "How to balance roti and rice portions?"
            ]
          });
        }
      } catch {}
    }

    // Intelligent factual replies
    if (msg.includes("protein")) {
      return NextResponse.json({
        role: "assistant",
        content: `Based on your profile and ICMR-NIN 2024 guidelines, your daily target is ~**65g to 72g of protein**.\n\nGreat affordable Indian protein sources you can add today:\n• **1 katori Curd / Dahi:** ~5g protein\n• **100g Fresh Paneer:** ~18g protein\n• **2 Boiled Eggs:** ~12g protein\n• **1 bowl Sprouted Moong:** ~7g protein\n• **1 katori Dal (Toor / Moong):** ~8g protein`,
        suggested_followups: ["What can I cook with what I have at home?", "Check my fiber guideline"]
      });
    }

    if (msg.includes("cook") || msg.includes("make") || msg.includes("pantry") || msg.includes("fridge") || msg.includes("eat")) {
      return NextResponse.json({
        role: "assistant",
        content: `With standard kitchen staples (Rice, Dal, Onions, Tomatoes, Potatoes, Eggs), you can cook immediately without grocery shopping:\n\n1. **Comforting Moong Dal Khichdi (20 min):** Complete amino acid profile pairing lentil with grain.\n2. **Egg / Paneer Bhurji with Roti (15 min):** High protein with high satiety.\n3. **Classic Dal Tadka with Steamed Rice (25 min):** Nutritious home-cooked comfort meal.\n\nUse our **'What Can I Eat Right Now?'** tab to see exact portion math!`,
        suggested_followups: ["Open Available Food Matcher", "How much protein in dal tadka?"]
      });
    }

    return NextResponse.json({
      role: "assistant",
      content: `Hello! I'm your NutriVision AI Coach. I help you understand the nutritional composition of your meals, balance Indian thalis per ICMR-NIN guidelines, and find delicious recipes using the ingredients you already have at home.\n\nWhat would you like to explore right now?`,
      suggested_followups: [
        "How much protein did I have today?",
        "What can I cook with what I have at home?",
        "Explain the ICMR plate guideline"
      ]
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

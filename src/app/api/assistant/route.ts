import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = body.message || "";
    const msgLower = (message || "").toLowerCase().trim();

    // 1. Mandatory Emergency Safety Guardrail
    if (
      msgLower.includes("can't breathe") ||
      msgLower.includes("cannot breathe") ||
      msgLower.includes("throat swelling") ||
      msgLower.includes("tongue swelling") ||
      msgLower.includes("anaphylaxis") ||
      msgLower.includes("choking") ||
      msgLower.includes("chest pain") ||
      msgLower.includes("allergic shock")
    ) {
      return NextResponse.json({
        role: "assistant",
        content: `⚠️ EMERGENCY MEDICAL ADVICE:\n\nIf you or someone around you is having difficulty breathing, severe throat or tongue swelling, or acute allergic shock, immediately contact your local emergency services (112 in India, 911 in US) or proceed to the nearest emergency room. Do not rely on dietary advice during an acute allergic reaction.`,
        suggested_followups: ["Managing severe food allergies", "Emergency contacts"]
      });
    }

    // AI Provider Configuration from headers, body, or server env
    const provider = req.headers.get("x-ai-provider") || body.provider || "auto";
    const openaiKey = req.headers.get("x-openai-key") || body.openaiApiKey || process.env.OPENAI_API_KEY || "";
    const openaiModel = req.headers.get("x-openai-model") || body.openaiModel || process.env.OPENAI_MODEL || "gpt-4o-mini";
    const geminiKey = req.headers.get("x-gemini-key") || body.geminiApiKey || process.env.GEMINI_API_KEY || "";
    const geminiModel = req.headers.get("x-gemini-model") || body.geminiModel || process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const localUrl = req.headers.get("x-local-llm-url") || body.localLlmUrl || process.env.LOCAL_LLM_URL || "http://localhost:11434";
    const localModel = req.headers.get("x-local-llm-model") || body.localLlmModel || process.env.LOCAL_LLM_MODEL || "llama3";

    const systemPrompt = `You are NutriVision's AI Nutrition Coach grounded in the ICMR-NIN 2024 Dietary Guidelines for Indians.
User Profile Reference:
- Daily Reference: ~2050 kcal, 65-75g protein, >=30g dietary fiber.
- Philosophy: Available-food-first. Prioritize home-cooked Indian foods (dal, roti, sabzi, curd, paneer, eggs, sprouts).
- Grounding: Never hallucinate medical diagnoses or promise cures. Give practical, warm, actionable portion and recipe advice.
- Tone: Professional, supportive, empathetic, and culturally respectful.`;

    // 2. Try OpenAI Chat Completions
    if ((provider === "openai" || provider === "auto") && openaiKey) {
      try {
        const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: openaiModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 800
          })
        });

        if (openAiRes.ok) {
          const openAiData = await openAiRes.json();
          const reply = openAiData.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({
              role: "assistant",
              content: reply,
              provider: "openai",
              model: openaiModel,
              suggested_followups: [
                "What can I cook with what I have at home?",
                "How do I balance roti and rice portions?",
                "Explain the ICMR fiber guidelines"
              ]
            });
          }
        }
      } catch (e) {
        console.error("OpenAI chat error:", e);
      }
    }

    // 3. Try Google Gemini
    if ((provider === "gemini" || provider === "auto") && geminiKey) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`;
        const geminiRes = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemPrompt}\n\nUser Question: ${message}` }
                ]
              }
            ]
          })
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return NextResponse.json({
              role: "assistant",
              content: reply,
              provider: "gemini",
              model: geminiModel,
              suggested_followups: [
                "What can I cook with what I have at home?",
                "How do I balance roti and rice portions?",
                "Show my remaining macros today"
              ]
            });
          }
        }
      } catch (e) {
        console.error("Gemini chat error:", e);
      }
    }

    // 4. Try Local LLM (Ollama / LocalAI / vLLM)
    if (provider === "local" && localUrl) {
      try {
        let cleanUrl = localUrl.trim().replace(/\/+$/, "");
        if (cleanUrl.endsWith("/v1")) {
          cleanUrl = cleanUrl.substring(0, cleanUrl.length - 3);
        }

        const localRes = await fetch(`${cleanUrl}/v1/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: localModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message }
            ],
            temperature: 0.7
          })
        });

        if (localRes.ok) {
          const localData = await localRes.json();
          const reply = localData.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({
              role: "assistant",
              content: reply,
              provider: "local",
              model: localModel,
              suggested_followups: [
                "What can I cook with what I have at home?",
                "How to increase fiber in an Indian diet?",
                "Explain ICMR daily salt limit"
              ]
            });
          }
        }
      } catch (e) {
        console.error("Local LLM chat error:", e);
      }
    }

    // 5. High-Fidelity Grounded ICMR-NIN Responses (Fallback)
    if (msgLower.includes("protein")) {
      return NextResponse.json({
        role: "assistant",
        provider: "built-in",
        content: `Based on your profile and ICMR-NIN 2024 guidelines, your daily target is ~**65g to 75g of protein** (0.83g - 1.0g per kg body weight).\n\nGreat affordable Indian protein sources you can add today:\n• **1 katori Curd / Dahi (150g):** ~5.5g protein\n• **100g Fresh Paneer:** ~18.3g protein\n• **2 Boiled Whole Eggs:** ~12.6g protein\n• **1 bowl Sprouted Moong:** ~7.2g protein\n• **1 katori Dal (Toor / Moong):** ~8.4g protein\n• **100g Soya Chunks (dry weight cooked):** ~52g protein\n\n*Tip: Combining lentils with grains (like Dal + Rice or Khichdi) yields a complete amino acid profile.*`,
        suggested_followups: ["What can I cook with what I have at home?", "Check my fiber guideline", "How to balance my plate?"]
      });
    }

    if (
      msgLower.includes("cook") ||
      msgLower.includes("make") ||
      msgLower.includes("pantry") ||
      msgLower.includes("fridge") ||
      msgLower.includes("eat right now")
    ) {
      return NextResponse.json({
        role: "assistant",
        provider: "built-in",
        content: `With standard kitchen staples (Rice, Dal, Onions, Tomatoes, Potatoes, Eggs, Spices), you can cook immediately without grocery shopping:\n\n1. **Comforting Moong Dal Khichdi (20 min):** Complete amino acid profile pairing lentil with grain.\n2. **Egg or Paneer Bhurji with Whole Wheat Roti (15 min):** High protein with high satiety and minimal glycemic spike.\n3. **Classic Dal Tadka with Steamed Rice (25 min):** Nutritious home-cooked comfort meal.\n4. **Sprouted Moong & Onion Salad (5 min):** Zero-cooking, high fiber snack.\n\nUse our **'What Can I Eat Right Now?'** tab to see your exact 3-tier ingredient match!`,
        suggested_followups: ["Open Available Food Matcher", "How much protein in dal tadka?", "Healthy dinner suggestions"]
      });
    }

    if (msgLower.includes("plate") || msgLower.includes("balance") || msgLower.includes("thali")) {
      return NextResponse.json({
        role: "assistant",
        provider: "built-in",
        content: `To balance any Indian meal according to ICMR-NIN **'My Plate for the Day'**:\n\n1. **50% of your plate:** Fresh vegetables and greens (cooked sabzi + raw kachumber cucumber/tomato salad).\n2. **25% of your plate:** Quality protein (dal, legumes, sprouts, paneer, curd, or eggs/fish).\n3. **25% of your plate:** Complex unrefined grains (whole wheat roti, unpolished brown/hand-pounded rice, or millets like ragi/jowar).\n4. **Oil:** Limit cooking oil to $\\le$1-2 teaspoons per person per meal.\n\nThis simple rule prevents post-meal insulin spikes and keeps you energized for 4-5 hours.`,
        suggested_followups: ["What can I cook with what I have at home?", "How much protein did I have today?"]
      });
    }

    return NextResponse.json({
      role: "assistant",
      provider: "built-in",
      content: `Hello! I'm your NutriVision AI Coach. I help you understand the nutritional composition of your meals, balance Indian thalis per ICMR-NIN guidelines, and find delicious recipes using the ingredients you already have at home.\n\n💡 *Tip: You can connect your OpenAI API Key, Gemini Key, or Local Ollama in the **AI Settings** panel to enable live streaming LLM responses.*\n\nWhat would you like to explore right now?`,
      suggested_followups: [
        "How much protein do I need daily?",
        "What can I cook with what I have in my kitchen?",
        "How do I balance an Indian thali?"
      ]
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

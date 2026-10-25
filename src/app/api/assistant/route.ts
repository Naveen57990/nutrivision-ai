import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = body.message || "";
    const msgLower = (message || "").toLowerCase().trim();
    const userProfile = body.userProfile || {};

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
    const provider = req.headers.get("x-ai-provider") || body.provider || "local";
    const openaiKey = req.headers.get("x-openai-key") || body.openaiApiKey || process.env.OPENAI_API_KEY || "";
    const openaiModel = req.headers.get("x-openai-model") || body.openaiModel || process.env.OPENAI_MODEL || "gpt-4o-mini";
    const geminiKey = req.headers.get("x-gemini-key") || body.geminiApiKey || process.env.GEMINI_API_KEY || "";
    const geminiModel = req.headers.get("x-gemini-model") || body.geminiModel || process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const localUrl = (req.headers.get("x-local-llm-url") || body.localLlmUrl || process.env.LOCAL_LLM_URL || "http://localhost:11434").replace(/\/+$/, "");

    const age = userProfile.age || 29;
    const weight = userProfile.weight_kg || 72;
    const goal = (userProfile.primary_goal || "muscle_gain").replace(/_/g, " ");
    const conditions = (userProfile.health_conditions || ["prediabetes", "hypertension"]).join(", ");

    const systemPrompt = `You are NutriBuddy, a warm, clinical AI Nutrition Coach grounded in ICMR-NIN 2024 Dietary Guidelines for Indians.
User Profile:
- Age: ${age}, Weight: ${weight}kg, Goal: ${goal}
- Health Conditions: ${conditions}
- Dietary Pattern: ${userProfile.dietary_pattern || "vegetarian"}
- Guidelines: Emphasize home-cooked Indian foods (dal, roti, sabzi, curd, paneer, eggs, sprouts). Never hallucinate medical diagnoses. Keep replies warm, concise (2-3 paragraphs or clean bullet points), and actionable.`;

    // 2. Try Local LLM (Ollama) FIRST
    try {
      const tagsRes = await fetch(`${localUrl}/api/tags`, { signal: AbortSignal.timeout(2000) }).catch(() => null);
      if (tagsRes && tagsRes.ok) {
        const tagsData = await tagsRes.json();
        const availableModels: string[] = (tagsData.models || []).map((m: any) => m.name);

        let chosenModel = body.localLlmModel || req.headers.get("x-local-llm-model") || "";
        if (!chosenModel || !availableModels.includes(chosenModel)) {
          if (availableModels.includes("qwen2.5vl:3b")) chosenModel = "qwen2.5vl:3b";
          else if (availableModels.includes("qwen3:8b")) chosenModel = "qwen3:8b";
          else if (availableModels.includes("qwen2.5-coder:1.5b")) chosenModel = "qwen2.5-coder:1.5b";
          else chosenModel = availableModels[0] || "qwen2.5vl:3b";
        }

        const genRes = await fetch(`${localUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: chosenModel,
            prompt: `${systemPrompt}\n\nUser Question: ${message}`,
            stream: false
          }),
          signal: AbortSignal.timeout(18000)
        });

        if (genRes.ok) {
          const genData = await genRes.json();
          let reply = genData.response || "";
          reply = reply.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

          if (reply) {
            return NextResponse.json({
              role: "assistant",
              content: reply,
              provider: "local",
              model: chosenModel,
              suggested_followups: [
                "What can I cook with what I have at home?",
                "How do I balance roti and rice portions?",
                "Explain the ICMR fiber guidelines"
              ]
            });
          }
        }
      }
    } catch (localErr) {
      console.warn("Local assistant error, checking other providers:", localErr);
    }

    // 3. Try OpenAI Chat Completions
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

    // 4. Try Google Gemini
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

    // 5. High-Fidelity Grounded ICMR-NIN Responses (Fallback)
    if (msgLower.includes("protein")) {
      return NextResponse.json({
        role: "assistant",
        provider: "built-in",
        content: `Based on your profile and ICMR-NIN 2024 guidelines, your daily target is ~**75g to 85g of protein** (optimized for ${goal}).\n\nGreat affordable Indian protein sources you can add today:\n• **1 katori Curd / Dahi (150g):** ~5.5g protein\n• **100g Fresh Paneer:** ~18.3g protein\n• **2 Boiled Whole Eggs:** ~12.6g protein\n• **1 bowl Sprouted Moong:** ~7.2g protein\n• **1 katori Dal (Toor / Moong):** ~8.4g protein\n• **100g Soya Chunks (dry weight cooked):** ~52g protein\n\n*Tip: Combining lentils with grains (like Dal + Rice or Khichdi) yields a complete amino acid profile.*`,
        suggested_followups: ["What can I cook with what I have at home?", "Check my fiber guideline", "How to balance my plate?"]
      });
    }

    if (
      msgLower.includes("cook") ||
      msgLower.includes("make") ||
      msgLower.includes("pantry") ||
      msgLower.includes("fridge") ||
      msgLower.includes("eat right now") ||
      msgLower.includes("dinner") ||
      msgLower.includes("lunch")
    ) {
      return NextResponse.json({
        role: "assistant",
        provider: "built-in",
        content: `Based on your ${goal} target and medical safeguards (${conditions}):\n\n1. **High-Protein Palak Paneer with 2 Multigrain Phulkas:** Rich in iron and micellar casein protein for steady recovery.\n2. **Moong Dal Khichdi with Dahi & Kachumber:** Easy to digest, complete essential amino acid profile.\n3. **Masala Egg or Paneer Bhurji:** High protein with high satiety and minimal glycemic spike.\n\nUse our **AI Food Studio** tab to type any ingredients in your fridge for exact portion math!`,
        suggested_followups: ["Open AI Food Studio", "How much protein in dal tadka?", "Healthy dinner suggestions"]
      });
    }

    return NextResponse.json({
      role: "assistant",
      provider: "built-in",
      content: `Hello Aarav! I'm your NutriBuddy AI Coach. I help you understand the nutritional composition of your meals, balance Indian plates per ICMR-NIN guidelines, and reach your ${goal} goal safely with your health records (${conditions}).\n\nWhat would you like to explore right now?`,
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

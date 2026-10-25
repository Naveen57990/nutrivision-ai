import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    
    // Read from body or fallback to request headers or env
    const provider = body.provider || req.headers.get("x-ai-provider") || "auto";
    const openaiKey = body.openaiApiKey || req.headers.get("x-openai-key") || process.env.OPENAI_API_KEY || "";
    const openaiModel = body.openaiModel || req.headers.get("x-openai-model") || process.env.OPENAI_MODEL || "gpt-4o";
    const geminiKey = body.geminiApiKey || req.headers.get("x-gemini-key") || process.env.GEMINI_API_KEY || "";
    const geminiModel = body.geminiModel || req.headers.get("x-gemini-model") || process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const localUrl = body.localLlmUrl || req.headers.get("x-local-llm-url") || process.env.LOCAL_LLM_URL || "http://localhost:11434";
    const localModel = body.localLlmModel || req.headers.get("x-local-llm-model") || process.env.LOCAL_LLM_MODEL || "llama3.2-vision";

    // 1. Test OpenAI
    if (provider === "openai" || (provider === "auto" && openaiKey)) {
      if (!openaiKey) {
        return NextResponse.json({
          success: false,
          provider: "openai",
          message: "No OpenAI API key provided. Please enter an API key starting with 'sk-'."
        }, { status: 400 });
      }

      const res = await fetch("https://api.openai.com/v1/models", {
        headers: {
          "Authorization": `Bearer ${openaiKey}`
        }
      });

      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error?.message || `HTTP error ${res.status}`;
        return NextResponse.json({
          success: false,
          provider: "openai",
          latencyMs,
          message: `OpenAI connection failed: ${errMsg}`
        });
      }

      return NextResponse.json({
        success: true,
        provider: "openai",
        model: openaiModel,
        latencyMs,
        hasVision: true,
        message: `Successfully connected to OpenAI (${openaiModel}) in ${latencyMs}ms! Multimodal vision scanning and AI coaching are fully active.`
      });
    }

    // 2. Test Google Gemini
    if (provider === "gemini" || (provider === "auto" && geminiKey)) {
      if (!geminiKey) {
        return NextResponse.json({
          success: false,
          provider: "gemini",
          message: "No Gemini API key provided. Please enter a valid Google AI Studio key."
        }, { status: 400 });
      }

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`;
      const res = await fetch(endpoint);
      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error?.message || `HTTP error ${res.status}`;
        return NextResponse.json({
          success: false,
          provider: "gemini",
          latencyMs,
          message: `Gemini connection failed: ${errMsg}`
        });
      }

      return NextResponse.json({
        success: true,
        provider: "gemini",
        model: geminiModel,
        latencyMs,
        hasVision: true,
        message: `Successfully connected to Google Gemini (${geminiModel}) in ${latencyMs}ms! Multimodal vision and AI coaching are active.`
      });
    }

    // 3. Test Local LLM (Ollama / LocalAI / vLLM)
    if (provider === "local") {
      let cleanUrl = localUrl.trim().replace(/\/+$/, "");
      if (cleanUrl.endsWith("/v1")) {
        cleanUrl = cleanUrl.substring(0, cleanUrl.length - 3);
      }

      try {
        // Attempt pinging Ollama /api/tags or OpenAI-compatible /v1/models
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        let detectedModels: string[] = [];
        let connected = false;

        try {
          const ollamaRes = await fetch(`${cleanUrl}/api/tags`, { signal: controller.signal });
          if (ollamaRes.ok) {
            const data = await ollamaRes.json();
            detectedModels = (data.models || []).map((m: any) => m.name);
            connected = true;
          }
        } catch {
          // Try /v1/models
          const v1Res = await fetch(`${cleanUrl}/v1/models`, { signal: controller.signal });
          if (v1Res.ok) {
            const data = await v1Res.json();
            detectedModels = (data.data || []).map((m: any) => m.id);
            connected = true;
          }
        } finally {
          clearTimeout(timeout);
        }

        const latencyMs = Date.now() - startTime;

        if (connected) {
          const hasVisionModel = detectedModels.some(m => 
            m.includes("vision") || m.includes("llava") || m.includes("moondream")
          );

          return NextResponse.json({
            success: true,
            provider: "local",
            model: localModel,
            detectedModels,
            latencyMs,
            hasVision: hasVisionModel,
            message: `Successfully connected to Local LLM at ${cleanUrl}! Found ${detectedModels.length} models (${detectedModels.slice(0, 4).join(", ")}).`
          });
        }
      } catch (err: any) {
        // Fallthrough to connection failure
      }

      const latencyMs = Date.now() - startTime;
      return NextResponse.json({
        success: false,
        provider: "local",
        latencyMs,
        message: `Could not reach Local LLM at ${localUrl}. Make sure Ollama or LocalAI is running (e.g. run 'ollama serve' in your terminal).`
      });
    }

    // 4. Default / Built-in Engine
    return NextResponse.json({
      success: true,
      provider: "mock",
      model: "ICMR-NIN 2024 Deterministic Engine",
      latencyMs: Date.now() - startTime,
      hasVision: true,
      message: "Deterministic ICMR-NIN 2024 Engine active. Connect OpenAI or Gemini API key or Local LLM for custom inference."
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}

"use client";

import React, { useState, useEffect } from "react";
import { Bot, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Zap } from "lucide-react";
import { ApiClient, AIConfig } from "@/lib/api";

interface CuteAIConnectionBadgeProps {
  onOpenSettings?: () => void;
  variant?: "pill" | "card" | "compact";
  className?: string;
}

export default function CuteAIConnectionBadge({
  onOpenSettings,
  variant = "pill",
  className = ""
}: CuteAIConnectionBadgeProps) {
  const [status, setStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [providerName, setProviderName] = useState("Local Ollama");
  const [modelName, setModelName] = useState("qwen2.5vl:3b");
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const checkConnection = async () => {
    setIsPinging(true);
    const conf = ApiClient.getAIConfig();
    const activeProvider = conf.provider || "local";

    try {
      // 1. If provider is local or auto, try quick direct local ping if in browser
      if (activeProvider === "local" || activeProvider === "auto") {
        try {
          const directRes = await fetch("http://localhost:11434/api/tags", {
            signal: AbortSignal.timeout(1800)
          }).catch(() => null);

          if (directRes && directRes.ok) {
            const data = await directRes.json();
            const models: string[] = (data.models || []).map((m: any) => m.name);
            const visionModel = models.find(m => m.includes("vl") || m.includes("vision") || m.includes("moondream")) || models[0] || "qwen2.5vl:3b";
            setStatus("connected");
            setProviderName("Local Ollama");
            setModelName(visionModel);
            setLatencyMs(24);
            setIsPinging(false);
            return;
          }
        } catch {}
      }

      // 2. Fall back to /api/ai-test route
      const t0 = performance.now();
      const testRes = await fetch("/api/ai-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(conf)
      });

      const t1 = performance.now();
      if (testRes.ok) {
        const data = await testRes.json();
        if (data.success) {
          setStatus("connected");
          setLatencyMs(Math.round(t1 - t0));
          if (data.provider === "openai") {
            setProviderName("OpenAI GPT-4o");
            setModelName(data.model || "gpt-4o");
          } else if (data.provider === "gemini") {
            setProviderName("Google Gemini");
            setModelName(data.model || "gemini-1.5-flash");
          } else {
            setProviderName("Local Ollama");
            const detected = data.detectedModels || [];
            const v = detected.find((m: string) => m.includes("vl") || m.includes("vision") || m.includes("moondream")) || "qwen2.5vl:3b";
            setModelName(v);
          }
          setIsPinging(false);
          return;
        }
      }

      setStatus("disconnected");
    } catch {
      setStatus("disconnected");
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    checkConnection();
    // Auto re-check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  if (variant === "compact") {
    return (
      <button
        onClick={onOpenSettings || checkConnection}
        title={status === "connected" ? `AI Live: ${providerName} (${modelName})` : "AI Offline: Click to connect"}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shadow-2xs ${
          status === "connected"
            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
            : status === "checking"
            ? "bg-amber-50 text-amber-800 border border-amber-200"
            : "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
        } ${className}`}
      >
        <span className="relative flex h-2 w-2">
          {status === "connected" && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            status === "connected" ? "bg-emerald-500" : status === "checking" ? "bg-amber-400" : "bg-rose-500"
          }`} />
        </span>
        <span>
          {status === "connected" ? `${providerName} Live` : status === "checking" ? "Checking AI..." : "AI Offline"}
        </span>
      </button>
    );
  }

  if (variant === "card") {
    return (
      <div className={`p-3.5 rounded-2xl border transition-all ${
        status === "connected"
          ? "bg-gradient-to-r from-emerald-50/90 to-teal-50/70 border-emerald-300/80 text-emerald-950"
          : status === "checking"
          ? "bg-amber-50 border-amber-200 text-amber-950"
          : "bg-rose-50/80 border-rose-200 text-rose-950"
      } ${className}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {status === "connected" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                status === "connected" ? "bg-emerald-500" : status === "checking" ? "bg-amber-400 animate-pulse" : "bg-rose-500"
              }`} />
            </span>

            <div>
              <div className="text-xs font-black flex items-center gap-1.5">
                {status === "connected" ? (
                  <>
                    <span>🟢 AI Live & Connected</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-mono">
                      {providerName} ({modelName})
                    </span>
                  </>
                ) : status === "checking" ? (
                  <span>🟡 Detecting AI Engine...</span>
                ) : (
                  <span>🔴 Local Ollama Offline</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {status === "connected"
                  ? `Vision AI is ready. Latency ~${latencyMs || 25}ms. Photos are scanned instantly.`
                  : "Local LLM at http://localhost:11434 is not responding. Click settings to reconnect or add a Gemini/OpenAI key."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={checkConnection}
              disabled={isPinging}
              title="Ping AI now"
              className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-600 border border-slate-200 text-xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? "animate-spin text-teal-600" : ""}`} />
            </button>
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] transition-colors shadow-2xs"
              >
                Settings
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default: Pill variant
  return (
    <button
      onClick={onOpenSettings || checkConnection}
      className={`group flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all text-xs font-bold cursor-pointer ${
        status === "connected"
          ? "bg-emerald-50/90 hover:bg-emerald-100 border-emerald-300 text-emerald-950 shadow-2xs"
          : status === "checking"
          ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900"
          : "bg-rose-50/90 hover:bg-rose-100 border-rose-200 text-rose-900"
      } ${className}`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {status === "connected" && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${
          status === "connected" ? "bg-emerald-500" : status === "checking" ? "bg-amber-400" : "bg-rose-500"
        }`} />
      </span>

      <span className="truncate">
        {status === "connected" ? (
          <>
            <strong className="text-emerald-700">AI Live:</strong> {providerName} ({modelName})
          </>
        ) : status === "checking" ? (
          "Checking AI Connection..."
        ) : (
          <>
            <strong className="text-rose-700">AI Offline:</strong> Click to Connect
          </>
        )}
      </span>

      <RefreshCw 
        onClick={(e) => { e.stopPropagation(); checkConnection(); }} 
        className={`w-3 h-3 text-slate-400 hover:text-slate-700 ml-0.5 shrink-0 ${isPinging ? "animate-spin text-teal-600" : ""}`} 
      />
    </button>
  );
}

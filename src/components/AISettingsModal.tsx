"use client";

import React, { useState, useEffect } from "react";
import { ApiClient, AIConfig } from "@/lib/api";
import { 
  Bot, 
  Sparkles, 
  Cpu, 
  Server, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  X,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: (config: AIConfig) => void;
}

export function AISettingsModal({ isOpen, onClose, onConfigSaved }: AISettingsModalProps) {
  const [config, setConfig] = useState<AIConfig>({
    provider: "auto",
    openaiApiKey: "",
    openaiModel: "gpt-4o",
    geminiApiKey: "",
    geminiModel: "gemini-1.5-flash",
    localLlmUrl: "http://localhost:11434",
    localLlmModel: "llama3.2-vision",
  });

  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    provider?: string;
    model?: string;
    latencyMs?: number;
    message?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const active = ApiClient.getAIConfig();
      setConfig(active);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await ApiClient.testAIConnection(config);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Failed to reach AI provider"
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    ApiClient.setAIConfig(config);
    if (onConfigSaved) onConfigSaved(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-teal-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-teal-900 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Model & Provider Settings</h2>
              <p className="text-xs text-teal-200">Connect OpenAI, Google Gemini, or Local LLM (Ollama)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          
          {/* Provider Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Primary AI Engine
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => { setConfig({ ...config, provider: "openai" }); setTestResult(null); }}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                  config.provider === "openai"
                    ? "border-emerald-500 bg-emerald-50/70 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Cloud</span>
                </div>
                <div className="font-bold text-sm">OpenAI</div>
                <div className="text-[11px] text-slate-500">GPT-4o Vision</div>
              </button>

              <button
                type="button"
                onClick={() => { setConfig({ ...config, provider: "gemini" }); setTestResult(null); }}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                  config.provider === "gemini"
                    ? "border-blue-500 bg-blue-50/70 text-blue-900 shadow-sm ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Cloud</span>
                </div>
                <div className="font-bold text-sm">Gemini</div>
                <div className="text-[11px] text-slate-500">1.5 Flash / Pro</div>
              </button>

              <button
                type="button"
                onClick={() => { setConfig({ ...config, provider: "local" }); setTestResult(null); }}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                  config.provider === "local"
                    ? "border-purple-500 bg-purple-50/70 text-purple-900 shadow-sm ring-2 ring-purple-500/20"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Server className="w-4 h-4 text-purple-600" />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">Local</span>
                </div>
                <div className="font-bold text-sm">Ollama</div>
                <div className="text-[11px] text-slate-500">Llama 3 / Llava</div>
              </button>

              <button
                type="button"
                onClick={() => { setConfig({ ...config, provider: "auto" }); setTestResult(null); }}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                  config.provider === "auto"
                    ? "border-teal-500 bg-teal-50/70 text-teal-900 shadow-sm ring-2 ring-teal-500/20"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700">Auto</span>
                </div>
                <div className="font-bold text-sm">Smart Auto</div>
                <div className="text-[11px] text-slate-500">Auto-detect</div>
              </button>
            </div>
          </div>

          {/* OpenAI Configuration Section */}
          {(config.provider === "openai" || config.provider === "auto") && (
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-600" /> OpenAI Configuration
                </span>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 hover:underline flex items-center gap-1"
                >
                  Get OpenAI Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">OpenAI API Key</label>
                <div className="relative">
                  <input
                    type={showOpenAIKey ? "text" : "password"}
                    value={config.openaiApiKey || ""}
                    onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
                    placeholder="sk-proj-..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showOpenAIKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Vision & Chat Model</label>
                  <select
                    value={config.openaiModel || "gpt-4o"}
                    onChange={(e) => setConfig({ ...config, openaiModel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-xs"
                  >
                    <option value="gpt-4o">gpt-4o (Flagship Vision & Chat)</option>
                    <option value="gpt-4o-mini">gpt-4o-mini (Fast & Efficient)</option>
                    <option value="gpt-4-turbo">gpt-4-turbo</option>
                  </select>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center">
                  Stored securely in your local browser storage.
                </div>
              </div>
            </div>
          )}

          {/* Google Gemini Configuration Section */}
          {(config.provider === "gemini" || config.provider === "auto") && (
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-blue-950 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600" /> Google Gemini Configuration
                </span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-700 hover:underline flex items-center gap-1"
                >
                  Get Gemini Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Gemini API Key</label>
                <div className="relative">
                  <input
                    type={showGeminiKey ? "text" : "password"}
                    value={config.geminiApiKey || ""}
                    onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Gemini Model</label>
                <select
                  value={config.geminiModel || "gemini-1.5-flash"}
                  onChange={(e) => setConfig({ ...config, geminiModel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs"
                >
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Fast multimodal)</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro (Deep reasoning)</option>
                  <option value="gemini-2.0-flash">gemini-2.0-flash (Next-gen)</option>
                </select>
              </div>
            </div>
          )}

          {/* Local LLM / Ollama Configuration Section */}
          {(config.provider === "local" || config.provider === "auto") && (
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-purple-950 flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-600" /> Local LLM (Ollama / LocalAI / vLLM)
                </span>
                <span className="text-xs text-purple-700 font-medium">100% On-Device & Private</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Local Server Endpoint</label>
                  <input
                    type="text"
                    value={config.localLlmUrl || ""}
                    onChange={(e) => setConfig({ ...config, localLlmUrl: e.target.value })}
                    placeholder="http://localhost:11434"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Local Vision/Text Model</label>
                  <input
                    type="text"
                    value={config.localLlmModel || ""}
                    onChange={(e) => setConfig({ ...config, localLlmModel: e.target.value })}
                    placeholder="llama3.2-vision or llama3"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="text-[11px] text-purple-800 bg-purple-100/60 p-2.5 rounded-xl">
                Run <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-purple-900">ollama run llama3.2-vision</code> or <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-purple-900">ollama run llama3</code> to enable private offline processing.
              </div>
            </div>
          )}

          {/* Test Diagnostic Result */}
          {testResult && (
            <div className={`p-4 rounded-2xl border text-sm flex items-start gap-3 animate-in fade-in ${
              testResult.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-bold flex items-center gap-2">
                  {testResult.success ? "AI Connection Verified" : "Connection Failed"}
                  {testResult.latencyMs !== undefined && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/70 font-mono font-normal">
                      {testResult.latencyMs}ms
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed">{testResult.message}</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                Testing Connection...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-teal-600" />
                Test Connection
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg"
            >
              Save & Apply Settings
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

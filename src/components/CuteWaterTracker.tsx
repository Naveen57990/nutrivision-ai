"use client";

import React, { useState, useEffect } from "react";
import { 
  Droplet, 
  Plus, 
  RotateCcw, 
  Sparkles, 
  Heart, 
  Award, 
  History, 
  Clock, 
  TrendingUp, 
  Trash2,
  CheckCircle2
} from "lucide-react";

interface WaterEntry {
  id: string;
  amountMl: number;
  timeStr: string;
  timestamp: number;
}

interface CuteWaterTrackerProps {
  userWeightKg?: number;
  dailyTargetMl?: number;
}

export default function CuteWaterTracker({ 
  userWeightKg = 70, 
  dailyTargetMl: propTarget 
}: CuteWaterTrackerProps) {
  // Calculate recommended target: 35ml per kg body weight
  const calculatedTarget = Math.round((userWeightKg * 35) / 50) * 50;
  const targetMl = propTarget || calculatedTarget || 2500;

  const [entries, setEntries] = useState<WaterEntry[]>([]);
  const [customAmount, setCustomAmount] = useState<string>("250");
  const [showHistory, setShowHistory] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  // Load records from localStorage on mount
  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const saved = localStorage.getItem(`nutrivision_water_${todayStr}`);
      if (saved) {
        setEntries(JSON.parse(saved));
      } else {
        // Sample starter records for a fresh day
        const initial = [
          { id: "w-1", amountMl: 300, timeStr: "08:15 AM", timestamp: Date.now() - 1000 * 60 * 180 },
          { id: "w-2", amountMl: 500, timeStr: "11:30 AM", timestamp: Date.now() - 1000 * 60 * 60 },
        ];
        setEntries(initial);
      }
    } catch {}
  }, []);

  // Save to localStorage on change
  const saveEntries = (newEntries: WaterEntry[]) => {
    setEntries(newEntries);
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      localStorage.setItem(`nutrivision_water_${todayStr}`, JSON.stringify(newEntries));
    } catch {}
  };

  const totalConsumedMl = entries.reduce((acc, curr) => acc + curr.amountMl, 0);
  const percentComplete = Math.min(100, Math.round((totalConsumedMl / targetMl) * 100));
  const remainingMl = Math.max(0, targetMl - totalConsumedMl);

  const addWater = (amount: number) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntry: WaterEntry = {
      id: `w-${Date.now()}`,
      amountMl: amount,
      timeStr,
      timestamp: Date.now()
    };
    const updated = [newEntry, ...entries];
    saveEntries(updated);

    if (totalConsumedMl + amount >= targetMl) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 4000);
    }
  };

  const removeEntry = (id: string) => {
    saveEntries(entries.filter(e => e.id !== id));
  };

  const resetToday = () => {
    if (confirm("Reset today's water records?")) {
      saveEntries([]);
    }
  };

  return (
    <div className="bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-teal-500/10 rounded-3xl p-6 border border-cyan-200/80 shadow-sm relative overflow-hidden backdrop-blur-sm">
      {/* Decorative background aura */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-600 shadow-sm">
            <Droplet className="w-5 h-5 fill-cyan-500 text-cyan-500 animate-bounce" style={{ animationDuration: "2s" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-lg">Pure Hydration Tracker</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-600" /> AquaBuddy
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Personalized target based on your {userWeightKg}kg body weight (35ml/kg)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              showHistory 
                ? "bg-cyan-600 text-white border-cyan-600 shadow-sm"
                : "bg-white/80 hover:bg-white text-cyan-900 border-cyan-200"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Records ({entries.length})
          </button>
        </div>
      </div>

      {/* Main Grid: Mascot & Progress Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10 mb-6">
        
        {/* Cute Animated AquaDrop Character */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-white/70 rounded-2xl border border-cyan-100 shadow-sm relative">
          {celebrate && (
            <div className="absolute inset-0 bg-cyan-500/10 rounded-2xl flex items-center justify-center animate-in zoom-in-50 z-20">
              <div className="bg-white px-4 py-2 rounded-2xl shadow-xl border border-cyan-200 text-center flex items-center gap-2 text-cyan-900 font-bold text-xs animate-bounce">
                <Award className="w-4 h-4 text-amber-500" />
                Goal Reached! You are beautifully hydrated! 🎉
              </div>
            </div>
          )}

          {/* SVG Cute Droplet Mascot */}
          <div className="relative w-32 h-36 flex items-center justify-center">
            {/* Animated Liquid Droplet Body */}
            <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-md">
              <defs>
                <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
                <clipPath id="dropClip">
                  <path d="M50,5 C50,5 92,60 92,85 C92,105 73,118 50,118 C27,118 8,105 8,85 C8,60 50,5 50,5 Z" />
                </clipPath>
              </defs>

              {/* Empty background shell */}
              <path 
                d="M50,5 C50,5 92,60 92,85 C92,105 73,118 50,118 C27,118 8,105 8,85 C8,60 50,5 50,5 Z" 
                fill="#e0f2fe" 
                stroke="#bae6fd" 
                strokeWidth="2.5" 
              />

              {/* Dynamic Filling Liquid */}
              <g clipPath="url(#dropClip)">
                <rect 
                  x="0" 
                  y={118 - (1.13 * percentComplete)} 
                  width="100" 
                  height="120" 
                  fill="url(#waterGrad)"
                  className="transition-all duration-700 ease-out"
                />
                {/* Surface shine wave */}
                <ellipse 
                  cx="50" 
                  cy={118 - (1.13 * percentComplete)} 
                  rx="45" 
                  ry="5" 
                  fill="#7dd3fc" 
                  opacity="0.6"
                />
              </g>

              {/* Cute Mascot Face */}
              <g className="transition-all duration-300">
                {/* Cheerful Blushing Cheeks */}
                <circle cx="34" cy="78" r="4.5" fill="#f472b6" opacity="0.6" />
                <circle cx="66" cy="78" r="4.5" fill="#f472b6" opacity="0.6" />

                {/* Expressive Eyes */}
                {percentComplete >= 100 ? (
                  // Happy curved smiling eyes
                  <g stroke="#0c4a6e" strokeWidth="2.5" strokeLinecap="round" fill="none">
                    <path d="M30,70 Q35,64 40,70" />
                    <path d="M60,70 Q65,64 70,70" />
                  </g>
                ) : (
                  // Shiny big round eyes
                  <g fill="#0c4a6e">
                    <circle cx="35" cy="68" r="4" />
                    <circle cx="65" cy="68" r="4" />
                    <circle cx="36.5" cy="66.5" r="1.5" fill="white" />
                    <circle cx="66.5" cy="66.5" r="1.5" fill="white" />
                  </g>
                )}

                {/* Sweet Smile */}
                <path 
                  d={percentComplete >= 100 ? "M42,78 Q50,88 58,78" : "M44,77 Q50,83 56,77"} 
                  stroke="#0c4a6e" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  fill={percentComplete >= 100 ? "#fda4af" : "none"} 
                />

                {/* Sparkle star on forehead */}
                <polygon points="50,42 52,48 58,50 52,52 50,58 48,52 42,50 48,48" fill="white" opacity="0.8" />
              </g>
            </svg>

            {/* Float Bubbles */}
            <div className="absolute top-2 right-2 text-xs animate-pulse text-cyan-400">💧</div>
            <div className="absolute bottom-4 left-2 text-xs animate-bounce text-pink-400" style={{ animationDuration: "1.5s" }}>
              <Heart className="w-3.5 h-3.5 fill-pink-400" />
            </div>
          </div>

          <div className="mt-3 text-center">
            <div className="text-xl font-extrabold text-cyan-950 font-mono">
              {totalConsumedMl.toLocaleString()} <span className="text-xs text-slate-500 font-sans font-medium">/ {targetMl.toLocaleString()} ml</span>
            </div>
            <p className="text-xs font-bold text-cyan-600 mt-0.5">
              {percentComplete >= 100 
                ? "✨ 100% Target Met! Outstanding Pure Hydration!"
                : `${percentComplete}% hydrated (${remainingMl} ml to goal)`}
            </p>
          </div>
        </div>

        {/* Progress Metrics & Action Buttons */}
        <div className="md:col-span-7 space-y-4">
          
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-600" /> Daily Hydration Level
              </span>
              <span className="font-mono text-cyan-700">{percentComplete}%</span>
            </div>
            <div className="h-3 w-full bg-cyan-100 rounded-full overflow-hidden p-0.5 border border-cyan-200">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 via-sky-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {/* Quick Add Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Quick Log Water
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => addWater(250)}
                className="p-2.5 rounded-2xl bg-white hover:bg-cyan-50 border border-cyan-200/80 hover:border-cyan-400 text-center transition-all shadow-sm hover:scale-105 active:scale-95 group"
              >
                <span className="text-lg block group-hover:scale-110 transition-transform">🥛</span>
                <span className="text-xs font-bold text-cyan-900 block mt-0.5">+250 ml</span>
                <span className="text-[10px] text-slate-400 block">1 Glass</span>
              </button>

              <button
                type="button"
                onClick={() => addWater(500)}
                className="p-2.5 rounded-2xl bg-white hover:bg-cyan-50 border border-cyan-200/80 hover:border-cyan-400 text-center transition-all shadow-sm hover:scale-105 active:scale-95 group"
              >
                <span className="text-lg block group-hover:scale-110 transition-transform">🍶</span>
                <span className="text-xs font-bold text-cyan-900 block mt-0.5">+500 ml</span>
                <span className="text-[10px] text-slate-400 block">1 Bottle</span>
              </button>

              <button
                type="button"
                onClick={() => addWater(750)}
                className="p-2.5 rounded-2xl bg-white hover:bg-cyan-50 border border-cyan-200/80 hover:border-cyan-400 text-center transition-all shadow-sm hover:scale-105 active:scale-95 group"
              >
                <span className="text-lg block group-hover:scale-110 transition-transform">🫖</span>
                <span className="text-xs font-bold text-cyan-900 block mt-0.5">+750 ml</span>
                <span className="text-[10px] text-slate-400 block">1 Flask</span>
              </button>

              <button
                type="button"
                onClick={() => addWater(100)}
                className="p-2.5 rounded-2xl bg-white hover:bg-cyan-50 border border-cyan-200/80 hover:border-cyan-400 text-center transition-all shadow-sm hover:scale-105 active:scale-95 group"
              >
                <span className="text-lg block group-hover:scale-110 transition-transform">💧</span>
                <span className="text-xs font-bold text-cyan-900 block mt-0.5">+100 ml</span>
                <span className="text-[10px] text-slate-400 block">Few Sips</span>
              </button>
            </div>
          </div>

          {/* Custom Amount Logger */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Custom ml"
              className="w-28 px-3 py-2 rounded-xl border border-cyan-200 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="button"
              onClick={() => {
                const val = parseInt(customAmount);
                if (!isNaN(val) && val > 0) addWater(val);
              }}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Log Custom Amount
            </button>
            {entries.length > 0 && (
              <button
                type="button"
                onClick={() => removeEntry(entries[0].id)}
                title="Undo last log"
                className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

      </div>

      {/* History and Records Modal / Drawer */}
      {showHistory && (
        <div className="mt-4 pt-4 border-t border-cyan-200/60 animate-in fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-600" /> Today&apos;s Water Log Records
            </span>
            {entries.length > 0 && (
              <button
                onClick={resetToday}
                className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear Today
              </button>
            )}
          </div>

          {entries.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No water intake logged yet today. Take a refreshing sip!</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
              {entries.map((entry) => (
                <div 
                  key={entry.id}
                  className="bg-white/90 p-2.5 rounded-xl border border-cyan-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    <div>
                      <div className="font-bold text-slate-800">{entry.amountMl} ml</div>
                      <div className="text-[10px] text-slate-400">{entry.timeStr}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Science hydration tip banner */}
      <div className="mt-3 p-2.5 rounded-2xl bg-cyan-100/60 border border-cyan-200/60 flex items-center gap-2 text-[11px] text-cyan-900">
        <CheckCircle2 className="w-4 h-4 text-cyan-700 shrink-0" />
        <span>
          <strong>Clinical Tip:</strong> Drinking water 20–30 mins before meals supports digestive stomach lining hydration and naturally prevents overeating without diluting gastric enzymes.
        </span>
      </div>

    </div>
  );
}

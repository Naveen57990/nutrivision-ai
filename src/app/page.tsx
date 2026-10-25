"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Camera,
  ChefHat,
  Sparkles,
  LayoutDashboard,
  Utensils,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Scale,
  ShieldCheck,
  Send,
  Calendar,
  X,
  Play,
  Leaf,
  ArrowRight,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";
import FoodImage from "@/components/FoodImage";
import SuitabilityBadge from "@/components/SuitabilityBadge";
import MacroGauge from "@/components/MacroGauge";

// Initial Demo Kitchen Pantry
const INITIAL_PANTRY = ["Rice", "Moong Dal", "Onions", "Tomatoes", "Eggs", "Potatoes"];

// Initial Logged Meals for Today
const INITIAL_MEALS = [
  {
    id: 1,
    meal_type: "breakfast",
    items: [
      { food_name: "Steamed Idli (2 pcs)", weight_grams: 80, calories: 116, protein: 3.2, carbs: 24, fiber: 1.3 },
      { food_name: "Vegetable Sambar (1 katori)", weight_grams: 150, calories: 117, protein: 4.6, carbs: 18, fiber: 4.8 }
    ],
    total_calories: 233,
    total_protein: 7.8,
    total_carbs: 42,
    total_fiber: 6.1
  },
  {
    id: 2,
    meal_type: "lunch",
    items: [
      { food_name: "Whole Wheat Chapati (2 rotis)", weight_grams: 70, calories: 210, protein: 6.2, carbs: 42, fiber: 6.6 },
      { food_name: "Moong Dal Tadka (1 katori)", weight_grams: 150, calories: 165, protein: 9.4, carbs: 22.5, fiber: 5.7 }
    ],
    total_calories: 375,
    total_protein: 15.6,
    total_carbs: 64.5,
    total_fiber: 12.3
  }
];

export default function NutriVisionWebApp() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "scanner" | "pantry" | "coach" | "database">("dashboard");

  // User Profile State
  const [profile, setProfile] = useState({
    name: "Aarav Sharma",
    age: 29,
    goal: "healthy_weight_loss",
    target_calories: 1950,
    target_protein: 72,
    target_carbs: 230,
    target_fat: 55,
    target_fiber: 30,
    diet: "Vegetarian (with eggs)"
  });

  // Daily Tracker State
  const [meals, setMeals] = useState<any[]>(INITIAL_MEALS);

  // Available Food (Smart Pantry) State
  const [pantry, setPantry] = useState<string[]>(INITIAL_PANTRY);
  const [customPantryInput, setCustomPantryInput] = useState("");
  const [pantryResults, setPantryResults] = useState<any>(null);
  const [loadingPantry, setLoadingPantry] = useState(false);

  // Scanner State
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState("");
  const [detectedCandidates, setDetectedCandidates] = useState<any[]>([]);
  const [scanReport, setScanReport] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Assistant Coach State
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      content: "Namaste Aarav! I'm your NutriVision AI Coach. I'm connected to your logged meals today (608 kcal, 23.4g protein) and your kitchen ingredients.\n\nAsk me how to balance your dinner or what high-protein snack you can cook right now!",
      suggested_followups: [
        "How much protein did I have today?",
        "What can I cook with what I have at home?",
        "How to reach my 30g daily fiber target?"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Food Database Explorer State
  const [foods, setFoods] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [portionGrams, setPortionGrams] = useState(150);

  // Daily Totals Calculation
  const totalCalories = meals.reduce((acc, m) => acc + m.total_calories, 0);
  const totalProtein = Number(meals.reduce((acc, m) => acc + m.total_protein, 0).toFixed(1));
  const totalCarbs = Number(meals.reduce((acc, m) => acc + m.total_carbs, 0).toFixed(1));
  const totalFiber = Number(meals.reduce((acc, m) => acc + m.total_fiber, 0).toFixed(1));
  const totalFat = Number((totalCalories * 0.25 / 9).toFixed(1));

  // Load Initial Recommendations & Foods
  useEffect(() => {
    fetchPantryRecommendations(pantry);
    fetch("/api/foods")
      .then((r) => r.json())
      .then((data) => setFoods(data))
      .catch(() => {});
  }, []);

  const fetchPantryRecommendations = async (items: string[]) => {
    setLoadingPantry(true);
    try {
      const res = await fetch("/api/available-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available_ingredients: items })
      });
      const data = await res.json();
      setPantryResults(data);
    } catch {
      // Fallback
    } finally {
      setLoadingPantry(false);
    }
  };

  const handleTogglePantryItem = (item: string) => {
    let updated: string[];
    if (pantry.includes(item)) {
      updated = pantry.filter((x) => x !== item);
    } else {
      updated = [...pantry, item];
    }
    setPantry(updated);
    fetchPantryRecommendations(updated);
  };

  const handleAddCustomPantry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPantryInput.trim()) return;
    const updated = [...pantry, customPantryInput.trim()];
    setPantry(updated);
    setCustomPantryInput("");
    fetchPantryRecommendations(updated);
  };

  // Camera Management
  const handleStartCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Camera access denied or unavailable. You can upload an image or choose a demo plate below!");
      setCameraActive(false);
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setCapturedImage(dataUrl);
      // Stop video stream
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
      triggerAnalysis(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setCapturedImage(url);
      triggerAnalysis(url);
    }
  };

  const triggerAnalysis = (imgSrc: string) => {
    setScanning(true);
    setScanProgress("Looking at your plate...");
    setScanReport(null);

    setTimeout(() => setScanProgress("Detecting individual dishes & thali portions..."), 500);
    setTimeout(() => {
      setScanning(false);
      const mockCandidates = [
        { dish_name: "Whole Wheat Chapati / Phulka", suggested_weight_grams: 70, household_measure: "2 rotis (70g)", confidence: 0.95 },
        { dish_name: "Moong Dal Tadka", suggested_weight_grams: 150, household_measure: "1 katori (150g)", confidence: 0.92 },
        { dish_name: "Bhindi Masala (Okra Sabzi)", suggested_weight_grams: 100, household_measure: "1 katori (100g)", confidence: 0.88 },
        { dish_name: "Steamed White Rice", suggested_weight_grams: 120, household_measure: "1 bowl (120g)", confidence: 0.94 }
      ];
      setDetectedCandidates(mockCandidates);
      evaluateMealReport(mockCandidates);
    }, 1200);
  };

  const evaluateMealReport = async (items: any[]) => {
    try {
      const payload = items.map((it) => ({
        food_name: it.dish_name,
        weight_grams: it.suggested_weight_grams
      }));
      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setScanReport(data);
    } catch {}
  };

  const handleLogScannedMeal = () => {
    if (!scanReport) return;
    const newMeal = {
      id: Date.now(),
      meal_type: "dinner",
      items: scanReport.items,
      total_calories: scanReport.nutrients.calories,
      total_protein: scanReport.nutrients.protein,
      total_carbs: scanReport.nutrients.carbs,
      total_fiber: scanReport.nutrients.fiber
    };
    setMeals([...meals, newMeal]);
    alert("Scanned meal successfully logged to Dinner!");
    setActiveTab("dashboard");
  };

  // Assistant Chat
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || sendingMsg) return;
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setSendingMsg(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      setMessages((prev) => [...prev, data]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm having a brief connection issue. Please try again shortly." }
      ]);
    } finally {
      setSendingMsg(false);
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#20312F] flex flex-col font-sans">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2ECEB] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#42BFA5] to-[#177E75] flex items-center justify-center text-white shadow-sm">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-[#177E75]">NutriVision</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#E9F8F3] text-[#218C68] border border-[#218C68]/20">
                  Vercel Live
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#8E9F9D] block">
                Available-Food-First Nutrition Intelligence
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#F7FAFC] p-1.5 rounded-2xl border border-[#E2ECEB]">
            {[
              { id: "dashboard", label: "Dashboard & Tracker", icon: LayoutDashboard },
              { id: "scanner", label: "AI Food Scanner", icon: Camera },
              { id: "pantry", label: "What Can I Eat?", icon: ChefHat },
              { id: "coach", label: "AI Coach", icon: Sparkles },
              { id: "database", label: "Food Database", icon: Utensils }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-white text-[#177E75] shadow-xs"
                      : "text-[#5A6D6B] hover:text-[#20312F] hover:bg-white/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#42BFA5]" : "text-[#8E9F9D]"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile Pill */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-[#20312F]">{profile.name}</span>
              <span className="text-[10px] text-[#218C68] font-semibold">{profile.diet}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#E9F8F3] border border-[#42BFA5] flex items-center justify-center text-xs font-black text-[#177E75]">
              AS
            </div>
          </div>
        </div>

        {/* Mobile Navigation Rail */}
        <div className="lg:hidden flex items-center justify-around border-t border-[#EDF3F3] bg-white px-2 py-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "scanner", label: "Scanner", icon: Camera },
            { id: "pantry", label: "Pantry", icon: ChefHat },
            { id: "coach", label: "Coach", icon: Sparkles },
            { id: "database", label: "Foods", icon: Utensils }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-bold ${
                  isActive ? "text-[#177E75] bg-[#E9F8F3]" : "text-[#8E9F9D]"
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main App Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">

        {/* ============================================================== */}
        {/* TAB 1: DASHBOARD & DAILY TRACKER                              */}
        {/* ============================================================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fade-in">
            {/* Top Greeting & Banner */}
            <div className="bg-gradient-to-r from-[#42BFA5] via-[#2ba98e] to-[#177E75] rounded-3xl p-6 sm:p-8 text-white card-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#E9F8F3]">
                  Personalized Nutrition Intelligence
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                  Welcome back, Aarav.
                </h1>
                <p className="text-sm text-[#F0FBFA] leading-relaxed">
                  You have consumed <strong className="text-white">{totalCalories} kcal</strong> and <strong className="text-white">{totalProtein}g protein</strong> today. You have <strong className="text-white">{Math.max(0, profile.target_calories - totalCalories)} kcal</strong> remaining in your healthy deficit window.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => setActiveTab("scanner")}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#177E75] font-bold text-xs shadow-md hover:bg-[#F0FBFA] transition-all"
                >
                  <Camera className="w-4 h-4 text-[#42BFA5]" />
                  <span>Scan Next Meal</span>
                </button>
                <button
                  onClick={() => setActiveTab("pantry")}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-xs hover:bg-white/30 transition-all"
                >
                  <ChefHat className="w-4 h-4" />
                  <span>What Can I Eat?</span>
                </button>
              </div>
            </div>

            {/* Daily Nutrition Summary Gauges */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#20312F]">Today’s Macro & Calorie Targets</h2>
                <span className="text-xs font-semibold text-[#8E9F9D]">ICMR-NIN 2024 Reference</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
                <MacroGauge label="Calories" current={totalCalories} target={profile.target_calories} unit="kcal" colorHex="#177E75" bgHex="#E9F8F3" />
                <MacroGauge label="Protein" current={totalProtein} target={profile.target_protein} unit="g" colorHex="#42BFA5" bgHex="#E9F8F3" />
                <MacroGauge label="Carbs" current={totalCarbs} target={profile.target_carbs} unit="g" colorHex="#377BC4" bgHex="#EDF5FF" />
                <MacroGauge label="Fat" current={totalFat} target={profile.target_fat} unit="g" colorHex="#B87921" bgHex="#FFF5E5" />
                <MacroGauge label="Fiber" current={totalFiber} target={profile.target_fiber} unit="g" colorHex="#218C68" bgHex="#E8F7EF" />
              </div>
            </div>

            {/* Grid: Meals Diary & Weekly Caloric Consistency */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Today's Logged Meals Diary */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-[#20312F]">Today’s Logged Diary</h3>
                  <button
                    onClick={() => setActiveTab("database")}
                    className="text-xs font-bold text-[#177E75] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {meals.map((m) => (
                    <div
                      key={m.id}
                      className="p-5 rounded-2xl bg-white border border-[#E2ECEB] card-shadow space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-[#EDF3F3] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-[#E9F8F3] text-[#177E75]">
                            {m.meal_type}
                          </span>
                          <span className="text-xs text-[#8E9F9D]">{m.items.length} dishes</span>
                        </div>
                        <span className="text-sm font-black text-[#177E75]">{m.total_calories} kcal</span>
                      </div>

                      <div className="space-y-1">
                        {m.items.map((it: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-xs text-[#5A6D6B]">
                            <span>• {it.food_name}</span>
                            <span className="font-semibold text-[#20312F]">{it.weight_grams}g ({it.calories} kcal)</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-[#EDF3F3] flex justify-between text-[11px] text-[#8E9F9D]">
                        <span>{m.total_protein}g Protein</span>
                        <span>{m.total_carbs}g Carbs</span>
                        <span>{m.total_fiber}g Fiber</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Weekly Caloric Consistency & Available Recipe Hook */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-3xl bg-white border border-[#E2ECEB] card-shadow space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#20312F]">7-Day Caloric Trend</h3>
                    <TrendingUp className="w-4 h-4 text-[#42BFA5]" />
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { day: "Mon", cal: 1820 },
                        { day: "Tue", cal: 1910 },
                        { day: "Wed", cal: 1750 },
                        { day: "Thu", cal: 1980 },
                        { day: "Fri", cal: 1850 },
                        { day: "Sat", cal: 2050 },
                        { day: "Today", cal: totalCalories }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EDF3F3" />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#8E9F9D" }} />
                        <YAxis tick={{ fontSize: 10, fill: "#8E9F9D" }} />
                        <Tooltip />
                        <Bar dataKey="cal" fill="#42BFA5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Available Food Prompt Card */}
                <div className="p-5 rounded-3xl bg-[#EEF7FF] border border-[#377BC4]/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-[#377BC4]" />
                    <h4 className="font-bold text-sm text-[#20312F]">What’s in your kitchen?</h4>
                  </div>
                  <p className="text-xs text-[#5A6D6B] leading-relaxed">
                    You currently have <strong className="text-[#20312F]">{pantry.join(", ")}</strong> saved. Our engine found {pantryResults?.tier1_best_available?.length || 2} instant meals cookable right now!
                  </p>
                  <button
                    onClick={() => setActiveTab("pantry")}
                    className="w-full py-2.5 rounded-xl bg-[#377BC4] text-white font-bold text-xs hover:bg-[#2b65a4] transition-colors"
                  >
                    Explore Available Recipes →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: AI FOOD SCANNER & CAMERA                               */}
        {/* ============================================================== */}
        {activeTab === "scanner" && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#20312F]">AI Multi-Dish Food Scanner</h2>
                <p className="text-xs text-[#5A6D6B] mt-0.5">
                  Point camera at any Indian plate, curry, or thali to identify discrete dishes and portion grams.
                </p>
              </div>
              <SuitabilityBadge status="optimal" label="Optical Recognition Active" />
            </div>

            {/* Live Camera Stream / Capture Viewport */}
            <div className="bg-white p-6 rounded-3xl border border-[#E2ECEB] card-shadow space-y-4">
              <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-black/90 flex items-center justify-center border-2 border-dashed border-[#42BFA5]">
                {cameraActive ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    {/* Reticle Target */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 border-2 border-[#42BFA5] rounded-3xl flex items-center justify-center">
                        <span className="text-[10px] uppercase font-bold text-white bg-black/60 px-2 py-0.5 rounded-md">
                          Align Plate
                        </span>
                      </div>
                    </div>
                  </>
                ) : capturedImage ? (
                  <Image src={capturedImage} alt="Captured food" fill className="object-cover" />
                ) : (
                  <div className="text-center p-6 space-y-3 text-white">
                    <Camera className="w-12 h-12 text-[#42BFA5] mx-auto opacity-80" />
                    <p className="text-sm font-bold">Webcam Ready or Choose a Demo Thali</p>
                    <p className="text-xs text-white/60 max-w-sm mx-auto">
                      Point directly at a plate containing roti, dal, sabzi, or idlis to separate items.
                    </p>
                  </div>
                )}

                {scanning && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3">
                    <div className="w-10 h-10 border-4 border-white/30 border-t-[#42BFA5] rounded-full animate-spin" />
                    <span className="text-xs font-bold">{scanProgress}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {!cameraActive ? (
                  <button
                    onClick={handleStartCamera}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#177E75] text-white font-bold text-xs hover:bg-[#12645e] transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Turn On Live Camera</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCapturePhoto}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#42BFA5] text-white font-bold text-xs hover:bg-[#38a892] transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture & Analyze Plate</span>
                  </button>
                )}

                <label className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F7FAFC] border border-[#E2ECEB] text-[#20312F] font-bold text-xs hover:bg-[#E9F8F3] hover:text-[#177E75] cursor-pointer">
                  <span>Upload Image File</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>

                {/* Instant Sample Plates */}
                <button
                  onClick={() => triggerAnalysis("https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80")}
                  className="px-4 py-2.5 rounded-xl bg-[#E9F8F3] text-[#177E75] font-bold text-xs hover:bg-[#d4f3e7]"
                >
                  Load Sample Vegetarian Thali
                </button>
              </div>
            </div>

            {/* Detected Candidates Confirmation */}
            {detectedCandidates.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-[#E2ECEB] card-shadow space-y-4">
                <div className="flex items-center justify-between border-b border-[#EDF3F3] pb-3">
                  <div>
                    <h3 className="font-bold text-base text-[#20312F]">Confirmed Plate Items</h3>
                    <p className="text-xs text-[#8E9F9D]">Verify dish identification and adjust portion weights.</p>
                  </div>
                  <span className="text-xs font-bold text-[#177E75] bg-[#E9F8F3] px-2.5 py-1 rounded-full">
                    {detectedCandidates.length} Items Detected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {detectedCandidates.map((c, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-[#F7FAFC] border border-[#E2ECEB] flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-xs text-[#20312F]">{c.dish_name}</h4>
                        <span className="text-[11px] text-[#8E9F9D]">{c.household_measure}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white border border-[#E2ECEB] px-2 py-1 rounded-lg">
                        <input
                          type="number"
                          value={c.suggested_weight_grams}
                          onChange={(e) => {
                            const updated = [...detectedCandidates];
                            updated[i].suggested_weight_grams = Number(e.target.value);
                            setDetectedCandidates(updated);
                            evaluateMealReport(updated);
                          }}
                          className="w-14 text-center font-bold text-xs text-[#20312F] focus:outline-none"
                        />
                        <span className="text-[10px] text-[#8E9F9D]">g</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Scanned Verified Nutrition Report Card */}
                {scanReport && (
                  <div className="mt-4 p-5 rounded-2xl bg-[#E9F8F3] border border-[#42BFA5]/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#177E75]">Deterministic IFCT Report</span>
                        <h4 className="text-lg font-black text-[#177E75]">{scanReport.nutrients.calories} kcal</h4>
                      </div>
                      <div className="text-right text-xs text-[#20312F]">
                        <span className="font-bold">{scanReport.nutrients.protein}g Protein</span> •{" "}
                        <span className="font-bold">{scanReport.nutrients.fiber}g Fiber</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {scanReport.suitability.actionable_tips.map((tip: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[#177E75] bg-white/70 px-2.5 py-1 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#218C68]" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleLogScannedMeal}
                      className="w-full py-3 rounded-xl bg-[#177E75] text-white font-bold text-xs hover:bg-[#12645e] transition-colors card-shadow"
                    >
                      Log Scanned Meal to Diary →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: WHAT CAN I EAT RIGHT NOW? (SMART PANTRY)               */}
        {/* ============================================================== */}
        {activeTab === "pantry" && (
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9F8F3] text-xs font-bold text-[#177E75] mb-2">
                <ChefHat className="w-4 h-4 text-[#42BFA5]" />
                <span>The Core Differentiator</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#20312F]">
                What Can I Eat Right Now?
              </h2>
              <p className="text-xs sm:text-sm text-[#5A6D6B] mt-1">
                Toggle the items you actually have in your kitchen. Watch candidate recipes immediately rank into 3 realistic tiers.
              </p>
            </div>

            {/* Smart Kitchen Shelf Chips */}
            <div className="bg-white p-6 rounded-3xl border border-[#E2ECEB] card-shadow space-y-4">
              <span className="text-xs font-bold text-[#5A6D6B] uppercase block">
                Tap items available in your kitchen:
              </span>

              <div className="flex flex-wrap gap-2">
                {[
                  "Rice", "Moong Dal", "Toor Dal", "Potatoes", "Onions",
                  "Tomatoes", "Eggs", "Paneer", "Curd", "Besan", "Cumin", "Turmeric"
                ].map((item) => {
                  const isPresent = pantry.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => handleTogglePantryItem(item)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isPresent
                          ? "bg-[#177E75] text-white shadow-xs"
                          : "bg-[#F7FAFC] border border-[#E2ECEB] text-[#5A6D6B] hover:border-[#42BFA5]"
                      }`}
                    >
                      {isPresent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Item Form */}
              <form onSubmit={handleAddCustomPantry} className="pt-2 border-t border-[#EDF3F3] flex gap-2">
                <input
                  type="text"
                  value={customPantryInput}
                  onChange={(e) => setCustomPantryInput(e.target.value)}
                  placeholder="Type any other ingredient (e.g. Spinach, Garlic)..."
                  className="flex-1 px-4 py-2 rounded-xl border border-[#E2ECEB] text-xs focus:outline-none focus:ring-2 focus:ring-[#42BFA5] bg-[#F7FAFC]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#42BFA5] text-white font-bold text-xs hover:bg-[#38a892]"
                >
                  Add to Pantry
                </button>
              </form>
            </div>

            {/* 3-Tier Results Display */}
            {loadingPantry ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-[#E2ECEB]">
                <div className="w-8 h-8 border-4 border-[#E2ECEB] border-t-[#42BFA5] rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs font-bold text-[#5A6D6B]">Evaluating combinations from your available items...</p>
              </div>
            ) : pantryResults ? (
              <div className="space-y-6">
                {/* Tier 1: 100% Ready */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#218C68]" />
                    <h3 className="font-black text-lg text-[#20312F]">Tier 1: 100% Ready to Cook (Zero Grocery Run)</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pantryResults.tier1_best_available?.map((rec: any) => (
                      <div key={rec.recipe_id} className="p-5 rounded-3xl bg-white border border-[#E2ECEB] card-shadow space-y-3">
                        <div className="flex items-center gap-3">
                          <FoodImage foodName={rec.name} className="w-16 h-16 rounded-xl shrink-0" aspectRatio="square" />
                          <div>
                            <SuitabilityBadge status="optimal" label="100% Available" />
                            <h4 className="font-bold text-sm text-[#20312F] mt-1">{rec.name}</h4>
                            <p className="text-xs text-[#8E9F9D]">{rec.prep_time_minutes} min • {rec.calories_est} kcal • {rec.protein_est}g protein</p>
                          </div>
                        </div>
                        <p className="text-xs text-[#5A6D6B] leading-relaxed bg-[#F7FAFC] p-2.5 rounded-xl border border-[#EDF3F3]">
                          {rec.explanation}
                        </p>
                        <button
                          onClick={() => {
                            setMeals([...meals, {
                              id: Date.now(),
                              meal_type: "lunch",
                              items: [{ food_name: rec.name, weight_grams: 250, calories: rec.calories_est, protein: rec.protein_est, carbs: rec.carbs_est, fiber: rec.fiber_est }],
                              total_calories: rec.calories_est,
                              total_protein: rec.protein_est,
                              total_carbs: rec.carbs_est,
                              total_fiber: rec.fiber_est
                            }]);
                            alert(`Logged "${rec.name}" to your diary!`);
                            setActiveTab("dashboard");
                          }}
                          className="w-full py-2 rounded-xl bg-[#177E75] text-white font-bold text-xs hover:bg-[#12645e]"
                        >
                          Cook & Log This Dish
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tier 2: Near Match */}
                {pantryResults.tier2_reasonable_alternatives?.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#377BC4]" />
                      <h3 className="font-black text-lg text-[#20312F]">Tier 2: Minor Addition / 1 Item Missing</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pantryResults.tier2_reasonable_alternatives.map((rec: any) => (
                        <div key={rec.recipe_id} className="p-5 rounded-3xl bg-white border border-[#E2ECEB] card-shadow space-y-3">
                          <div className="flex items-center gap-3">
                            <FoodImage foodName={rec.name} className="w-16 h-16 rounded-xl shrink-0" aspectRatio="square" />
                            <div>
                              <SuitabilityBadge status="good" label="Near Match" />
                              <h4 className="font-bold text-sm text-[#20312F] mt-1">{rec.name}</h4>
                              <p className="text-xs text-[#8E9F9D]">{rec.prep_time_minutes} min • {rec.calories_est} kcal</p>
                            </div>
                          </div>
                          <p className="text-xs text-[#B87921]">
                            <strong>Missing:</strong> {rec.missing_ingredients.join(", ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: AI HEALTH COACH (INTERACTIVE CHAT)                     */}
        {/* ============================================================== */}
        {activeTab === "coach" && (
          <div className="max-w-3xl mx-auto h-[650px] flex flex-col bg-white rounded-3xl border border-[#E2ECEB] card-shadow p-6 animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDF3F3] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C5B9F5] to-[#177E75] flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#20312F]">NutriVision AI Coach</h3>
                  <p className="text-[11px] text-[#5A6D6B]">Grounded in your real meal diary & ICMR science</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#218C68] bg-[#E8F7EF] px-2.5 py-1 rounded-full">
                Active Grounding
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    m.role === "user" ? "bg-[#177E75] text-white" : "bg-[#E9F8F3] text-[#177E75]"
                  }`}>
                    {m.role === "user" ? "AS" : "AI"}
                  </div>
                  <div className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#177E75] text-white rounded-tr-xs"
                      : "bg-[#F7FAFC] border border-[#E2ECEB] text-[#20312F] rounded-tl-xs space-y-2"
                  }`}>
                    <div className="whitespace-pre-line">{m.content}</div>

                    {m.suggested_followups && (
                      <div className="pt-2 border-t border-[#EDF3F3] flex flex-wrap gap-1">
                        {m.suggested_followups.map((prompt: string) => (
                          <button
                            key={prompt}
                            onClick={() => handleSendMessage(prompt)}
                            className="text-[11px] bg-white border border-[#E2ECEB] text-[#177E75] px-2 py-0.5 rounded-md hover:bg-[#E9F8F3]"
                          >
                            {prompt} →
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sendingMsg && (
                <div className="text-xs text-[#8E9F9D] flex items-center gap-1.5 p-2">
                  <div className="w-2 h-2 rounded-full bg-[#42BFA5] animate-ping" />
                  <span>AI Coach is computing response from verified tables...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputMessage);
              }}
              className="flex gap-2 pt-2 border-t border-[#EDF3F3]"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about protein, what to cook with available food, or glycemic index..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2ECEB] text-xs focus:outline-none focus:ring-2 focus:ring-[#42BFA5] bg-[#F7FAFC]"
              />
              <button
                type="submit"
                disabled={sendingMsg || !inputMessage.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#177E75] text-white font-bold text-xs hover:bg-[#12645e] transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: FOOD DATABASE EXPLORER & PORTION CALCULATOR             */}
        {/* ============================================================== */}
        {activeTab === "database" && (
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-[#20312F]">ICMR-NIN Food Database & Calculator</h2>
              <p className="text-xs text-[#5A6D6B] mt-0.5">
                Search verified Indian food records and calculate deterministic nutrients for customized weights.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E2ECEB] card-shadow flex gap-2">
              <Search className="w-4 h-4 text-[#8E9F9D] my-auto ml-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food by English, Hindi, or Tamil name (e.g. Roti, Idli, Dal, Curd)..."
                className="w-full px-2 py-1 text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {foods
                .filter((f) => !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((f) => (
                  <div key={f.id} className="p-4 rounded-3xl bg-white border border-[#E2ECEB] card-shadow space-y-3">
                    <div className="flex items-center gap-3">
                      <FoodImage foodName={f.name} category={f.category} className="w-12 h-12 rounded-xl shrink-0" aspectRatio="square" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] uppercase font-bold text-[#177E75] bg-[#E9F8F3] px-2 py-0.5 rounded-md">
                          {f.category}
                        </span>
                        <h4 className="font-bold text-xs text-[#20312F] truncate mt-1">{f.name}</h4>
                        <span className="text-[10px] text-[#8E9F9D] block">{f.default_serving_name}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1 bg-[#F7FAFC] p-2 rounded-xl text-center text-[10px]">
                      <div>
                        <span className="text-[#8E9F9D] block">Kcal</span>
                        <strong>{Math.round(f.calories_per_100g)}</strong>
                      </div>
                      <div>
                        <span className="text-[#8E9F9D] block">Protein</span>
                        <strong className="text-[#177E75]">{f.protein_per_100g}g</strong>
                      </div>
                      <div>
                        <span className="text-[#8E9F9D] block">Carbs</span>
                        <strong>{f.carbs_per_100g}g</strong>
                      </div>
                      <div>
                        <span className="text-[#8E9F9D] block">Fiber</span>
                        <strong className="text-[#218C68]">{f.fiber_per_100g}g</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setMeals([...meals, {
                          id: Date.now(),
                          meal_type: "snack",
                          items: [{ food_name: f.name, weight_grams: f.default_serving_grams, calories: f.calories_per_100g * (f.default_serving_grams / 100), protein: f.protein_per_100g * (f.default_serving_grams / 100), carbs: f.carbs_per_100g * (f.default_serving_grams / 100), fiber: f.fiber_per_100g * (f.default_serving_grams / 100) }],
                          total_calories: Number((f.calories_per_100g * (f.default_serving_grams / 100)).toFixed(1)),
                          total_protein: Number((f.protein_per_100g * (f.default_serving_grams / 100)).toFixed(1)),
                          total_carbs: Number((f.carbs_per_100g * (f.default_serving_grams / 100)).toFixed(1)),
                          total_fiber: Number((f.fiber_per_100g * (f.default_serving_grams / 100)).toFixed(1))
                        }]);
                        alert(`Added "${f.name}" to today's diary!`);
                        setActiveTab("dashboard");
                      }}
                      className="w-full py-2 rounded-xl bg-[#E9F8F3] text-[#177E75] font-bold text-xs hover:bg-[#d5f3e7]"
                    >
                      + Quick Log Standard Serving
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

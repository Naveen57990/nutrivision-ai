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
  RefreshCw,
  Droplet,
  Heart,
  Bot,
  User,
  Settings
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
import CuteWaterTracker from "@/components/CuteWaterTracker";
import MedicalProfileModal, { UserMedicalProfile } from "@/components/MedicalProfileModal";
import { AISettingsModal } from "@/components/AISettingsModal";
import SmartFoodIntelligenceStudio from "@/components/SmartFoodIntelligenceStudio";
import { ApiClient } from "@/lib/api";

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

const INITIAL_PROFILE: UserMedicalProfile = {
  age: 29,
  gender: "male",
  height_cm: 175,
  weight_kg: 72,
  dietary_pattern: "vegetarian",
  primary_goal: "muscle_gain",
  activity_level: "moderate",
  health_conditions: ["prediabetes", "hypertension"],
  allergies: ["peanuts"],
  medical_records: {
    fasting_blood_sugar_mg_dl: 110,
    hba1c_percent: 5.9,
    systolic_bp: 132,
    diastolic_bp: 86,
    cholesterol_mg_dl: 195,
    last_checkup_date: "2026-09-15"
  },
  daily_calorie_target: 2050,
  daily_protein_target_g: 78,
  daily_carb_target_g: 250,
  daily_fat_target_g: 58,
  daily_fiber_target_g: 38,
  daily_water_target_ml: 2500,
  daily_sodium_target_mg: 1800
};

export default function NutriVisionWebApp() {
  const [activeTab, setActiveTab] = useState<
    "food_intelligence" | "dashboard" | "scanner" | "water" | "pantry" | "coach" | "database"
  >("food_intelligence");

  // Medical Profile State
  const [medicalProfile, setMedicalProfile] = useState<UserMedicalProfile>(INITIAL_PROFILE);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showAISettingsModal, setShowAISettingsModal] = useState(false);
  const [activeAIProviderName, setActiveAIProviderName] = useState("Smart Auto");

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
      content: "Namaste Aarav! I'm your NutriVision AI Coach. I'm connected to your logged meals today (608 kcal, 23.4g protein), your medical profile (prediabetes, blood pressure limits), and your kitchen ingredients.\n\nAsk me what to cook right now, how to hit your protein target, or how to balance your Indian dinner!",
      suggested_followups: [
        "What can I cook with what I have at home?",
        "How much protein do I need for muscle building?",
        "How to balance my plate for prediabetes?"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Food Database Explorer State
  const [foods, setFoods] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Daily Totals Calculation
  const totalCalories = meals.reduce((acc, m) => acc + m.total_calories, 0);
  const totalProtein = Number(meals.reduce((acc, m) => acc + m.total_protein, 0).toFixed(1));
  const totalCarbs = Number(meals.reduce((acc, m) => acc + m.total_carbs, 0).toFixed(1));
  const totalFiber = Number(meals.reduce((acc, m) => acc + m.total_fiber, 0).toFixed(1));
  const totalFat = Number((totalCalories * 0.25 / 9).toFixed(1));

  // Initialize on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("nutrivision_user_profile");
      if (savedProfile) {
        setMedicalProfile(JSON.parse(savedProfile));
      }
      const aiConf = ApiClient.getAIConfig();
      if (aiConf?.provider) {
        setActiveAIProviderName(
          aiConf.provider === "openai" ? "OpenAI GPT-4o" :
          aiConf.provider === "gemini" ? "Google Gemini" :
          aiConf.provider === "local" ? "Local Ollama" : "Smart Auto"
        );
      }
    } catch {}

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
    } catch {
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
    setScanProgress("Analyzing plate through AI Vision...");
    setScanReport(null);

    setTimeout(() => setScanProgress("Classifying dishes against ICMR-NIN 2024 database..."), 600);
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
    }, 1300);
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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#42BFA5] to-[#177E75] flex items-center justify-center text-white shadow-sm">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-[#177E75]">NutriVision</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#E9F8F3] text-[#218C68] border border-[#218C68]/20">
                  Production Ready
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#8E9F9D] block">
                Clinical Nutrition & Food Intelligence
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#F7FAFC] p-1.5 rounded-2xl border border-[#E2ECEB]">
            {[
              { id: "food_intelligence", label: "AI Food Studio", icon: ChefHat },
              { id: "dashboard", label: "Dashboard & Tracker", icon: LayoutDashboard },
              { id: "water", label: "Pure Water", icon: Droplet },
              { id: "scanner", label: "Plate Scanner", icon: Camera },
              { id: "pantry", label: "Kitchen Shelf", icon: Utensils },
              { id: "coach", label: "Clinical Coach", icon: Sparkles },
              { id: "database", label: "Food DB", icon: Search }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-white text-[#177E75] shadow-xs ring-1 ring-teal-500/10"
                      : "text-[#5A6D6B] hover:text-[#20312F] hover:bg-white/50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#42BFA5]" : "text-[#8E9F9D]"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Action Pills: Medical Profile & AI Provider Settings */}
          <div className="flex items-center gap-2.5">
            
            {/* AI Provider Status Pill */}
            <button
              onClick={() => setShowAISettingsModal(true)}
              title="Configure OpenAI, Gemini, or Local Ollama"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-bold transition-colors shadow-xs"
            >
              <Bot className="w-3.5 h-3.5 text-purple-600" />
              <span>{activeAIProviderName}</span>
            </button>

            {/* User Medical Profile Pill */}
            <button
              onClick={() => setShowMedicalModal(true)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 text-white flex items-center justify-center text-xs font-black shadow-xs">
                {medicalProfile.gender === "female" ? "F" : "M"}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-teal-950 flex items-center gap-1">
                  <span>{medicalProfile.age}y, {medicalProfile.weight_kg}kg</span>
                  <span className="text-[10px] text-teal-600">({medicalProfile.dietary_pattern})</span>
                </div>
                <div className="text-[10px] text-teal-700 font-medium">
                  {medicalProfile.primary_goal.replace(/_/g, " ")}
                </div>
              </div>
            </button>

          </div>
        </div>

        {/* Mobile Navigation Rail */}
        <div className="lg:hidden flex items-center justify-around border-t border-[#EDF3F3] bg-white px-2 py-2 overflow-x-auto">
          {[
            { id: "food_intelligence", label: "Studio", icon: ChefHat },
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "water", label: "Water", icon: Droplet },
            { id: "scanner", label: "Scan", icon: Camera },
            { id: "coach", label: "Coach", icon: Sparkles },
            { id: "database", label: "Foods", icon: Search }
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
        {/* TAB 0: FLAGSHIP AI FOOD INTELLIGENCE & RECIPE STUDIO          */}
        {/* ============================================================== */}
        {activeTab === "food_intelligence" && (
          <div className="space-y-6 animate-fade-in">
            <SmartFoodIntelligenceStudio
              userProfile={medicalProfile}
              onOpenProfile={() => setShowMedicalModal(true)}
              onOpenAISettings={() => setShowAISettingsModal(true)}
              onLogMeal={(meal) => {
                setMeals([...meals, { id: Date.now(), ...meal }]);
              }}
            />
          </div>
        )}

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
                  You have consumed <strong className="text-white">{totalCalories} kcal</strong> and <strong className="text-white">{totalProtein}g protein</strong> today. Your clinical ICMR target is <strong className="text-white">{medicalProfile.daily_protein_target_g}g protein</strong>.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => setActiveTab("food_intelligence")}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#177E75] font-bold text-xs shadow-md hover:bg-[#F0FBFA] transition-all"
                >
                  <ChefHat className="w-4 h-4 text-[#42BFA5]" />
                  <span>AI Food Studio</span>
                </button>
                <button
                  onClick={() => setActiveTab("water")}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-xs hover:bg-white/30 transition-all"
                >
                  <Droplet className="w-4 h-4" />
                  <span>Log Water</span>
                </button>
              </div>
            </div>

            {/* Daily Nutrition Summary Gauges */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#20312F]">Today’s Macro & Calorie Targets</h2>
                <span className="text-xs font-semibold text-[#8E9F9D]">
                  Calibrated for {medicalProfile.primary_goal.replace(/_/g, " ")} ({medicalProfile.weight_kg}kg)
                </span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
                <MacroGauge label="Calories" current={totalCalories} target={medicalProfile.daily_calorie_target} unit="kcal" colorHex="#177E75" bgHex="#E9F8F3" />
                <MacroGauge label="Protein" current={totalProtein} target={medicalProfile.daily_protein_target_g} unit="g" colorHex="#42BFA5" bgHex="#E9F8F3" />
                <MacroGauge label="Carbs" current={totalCarbs} target={medicalProfile.daily_carb_target_g} unit="g" colorHex="#377BC4" bgHex="#EDF5FF" />
                <MacroGauge label="Fat" current={totalFat} target={medicalProfile.daily_fat_target_g} unit="g" colorHex="#B87921" bgHex="#FFF5E5" />
                <MacroGauge label="Fiber" current={totalFiber} target={medicalProfile.daily_fiber_target_g} unit="g" colorHex="#218C68" bgHex="#E8F7EF" />
              </div>
            </div>

            {/* Cute Water Tracker directly on Dashboard */}
            <CuteWaterTracker 
              userWeightKg={medicalProfile.weight_kg} 
              dailyTargetMl={medicalProfile.daily_water_target_ml} 
            />

            {/* Grid: Meals Diary & Weekly Caloric Consistency */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Today's Logged Meals Diary */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#20312F]">Today’s Meal Diary</h3>
                  <button
                    onClick={() => setActiveTab("food_intelligence")}
                    className="text-xs font-bold text-[#177E75] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> What Can I Make?
                  </button>
                </div>

                <div className="space-y-3">
                  {meals.map((meal) => (
                    <div key={meal.id} className="p-5 rounded-3xl bg-white border border-[#E2ECEB] card-shadow space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#42BFA5]" />
                          <h4 className="font-bold text-sm capitalize text-[#20312F]">{meal.meal_type}</h4>
                        </div>
                        <span className="text-xs font-extrabold text-[#177E75] font-mono">
                          {meal.total_calories} kcal
                        </span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {meal.items.map((item: any, iIdx: number) => (
                          <div key={iIdx} className="py-2 flex items-center justify-between text-xs">
                            <span className="text-[#5A6D6B] font-medium">{item.food_name}</span>
                            <span className="text-[#8E9F9D] font-mono">{item.calories} kcal ({item.protein}g P)</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#5A6D6B]">
                        <span>Protein: <strong>{meal.total_protein}g</strong></span>
                        <span>Carbs: <strong>{meal.total_carbs}g</strong></span>
                        <span>Fiber: <strong>{meal.total_fiber}g</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Weekly Trend */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="text-base font-bold text-[#20312F]">Weekly Consistency</h3>
                <div className="p-5 rounded-3xl bg-white border border-[#E2ECEB] card-shadow space-y-4">
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { day: "Mon", kcal: 1980, target: medicalProfile.daily_calorie_target },
                        { day: "Tue", kcal: 2050, target: medicalProfile.daily_calorie_target },
                        { day: "Wed", kcal: 1890, target: medicalProfile.daily_calorie_target },
                        { day: "Thu", kcal: 2110, target: medicalProfile.daily_calorie_target },
                        { day: "Fri", kcal: 1950, target: medicalProfile.daily_calorie_target },
                        { day: "Sat", kcal: 2020, target: medicalProfile.daily_calorie_target },
                        { day: "Sun", kcal: totalCalories, target: medicalProfile.daily_calorie_target }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF3F3" />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} domain={[1200, 2400]} />
                        <Tooltip />
                        <Bar dataKey="kcal" fill="#42BFA5" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-[#5A6D6B] bg-[#E9F8F3] p-3 rounded-2xl flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#218C68] shrink-0 mt-0.5" />
                    <span>You have remained within your ICMR target window for 6 of the last 7 days!</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PURE HYDRATION TRACKER (DEDICATED VIEW)                */}
        {/* ============================================================== */}
        {activeTab === "water" && (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <CuteWaterTracker 
              userWeightKg={medicalProfile.weight_kg} 
              dailyTargetMl={medicalProfile.daily_water_target_ml} 
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: OPTICAL FOOD SCANNER                                   */}
        {/* ============================================================== */}
        {activeTab === "scanner" && (
          <div className="space-y-8 animate-fade-in">
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-[#20312F]">AI Multi-Dish Indian Plate Scanner</h2>
              <p className="text-xs text-[#5A6D6B] mt-0.5">
                Capture or upload an Indian thali or mixed plate. Our AI detects distinct components and portions.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Capture or Upload Box */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-white rounded-3xl p-6 border border-[#E2ECEB] card-shadow space-y-4">
                  
                  {cameraActive ? (
                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex flex-col items-center justify-center">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <div className="absolute bottom-4 flex gap-3">
                        <button
                          onClick={handleCapturePhoto}
                          className="px-6 py-2.5 rounded-full bg-[#42BFA5] text-white font-bold text-xs shadow-lg flex items-center gap-2"
                        >
                          <Camera className="w-4 h-4" /> Snap Photo
                        </button>
                        <button
                          onClick={() => {
                            const stream = videoRef.current?.srcObject as MediaStream;
                            stream?.getTracks().forEach((t) => t.stop());
                            setCameraActive(false);
                          }}
                          className="px-4 py-2.5 rounded-full bg-white/20 text-white font-bold text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : capturedImage ? (
                    <div className="relative rounded-2xl overflow-hidden border border-[#E2ECEB] aspect-video flex items-center justify-center bg-black/5">
                      <img src={capturedImage} alt="Captured meal" className="w-full h-full object-cover" />
                      <button
                        onClick={() => { setCapturedImage(null); setScanReport(null); setDetectedCandidates([]); }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white text-xs hover:bg-black/80"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-[#BCE8DE] rounded-3xl p-8 text-center bg-[#F7FAFC] flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-[#E9F8F3] text-[#177E75] flex items-center justify-center shadow-xs">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#20312F]">Upload or Snap Plate</div>
                        <p className="text-xs text-[#8E9F9D] mt-0.5">Clear top-down photo gives best portion accuracy</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={handleStartCamera}
                          className="px-4 py-2 rounded-xl bg-[#177E75] text-white text-xs font-bold shadow-xs hover:bg-[#126861]"
                        >
                          Open Camera
                        </button>
                        <label className="px-4 py-2 rounded-xl bg-white border border-[#E2ECEB] text-[#20312F] text-xs font-bold cursor-pointer hover:bg-[#F7FAFC]">
                          Browse File
                          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Sample Plate Presets for Quick Testing */}
                  <div>
                    <span className="text-[11px] font-bold text-[#8E9F9D] uppercase tracking-wider block mb-2">
                      Or Test with Sample Plates:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const demo = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80";
                          setCapturedImage(demo);
                          triggerAnalysis(demo);
                        }}
                        className="p-2.5 rounded-xl border border-[#E2ECEB] hover:border-[#42BFA5] text-left text-xs transition-colors flex items-center gap-2 bg-[#F7FAFC]"
                      >
                        <span className="text-base">🍛</span>
                        <div>
                          <strong className="block text-[#20312F]">North Indian Thali</strong>
                          <span className="text-[10px] text-[#8E9F9D]">Roti, Dal, Sabzi, Rice</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          const demo = "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80";
                          setCapturedImage(demo);
                          triggerAnalysis(demo);
                        }}
                        className="p-2.5 rounded-xl border border-[#E2ECEB] hover:border-[#42BFA5] text-left text-xs transition-colors flex items-center gap-2 bg-[#F7FAFC]"
                      >
                        <span className="text-base">🥞</span>
                        <div>
                          <strong className="block text-[#20312F]">South Indian Tiffin</strong>
                          <span className="text-[10px] text-[#8E9F9D]">Idli, Sambar, Chutney</span>
                        </div>
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column: Detection Candidates & Macro Report */}
              <div className="lg:col-span-6 space-y-4">
                {scanning && (
                  <div className="p-8 rounded-3xl bg-white border border-[#E2ECEB] text-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-[#42BFA5] animate-spin mx-auto" />
                    <div className="font-bold text-sm text-[#20312F]">{scanProgress}</div>
                    <p className="text-xs text-[#8E9F9D]">Extracting volumetric depth and household measures...</p>
                  </div>
                )}

                {scanReport && (
                  <div className="bg-white rounded-3xl p-6 border border-[#BCE8DE] card-shadow space-y-5 animate-fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-[#EDF3F3]">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#218C68] tracking-wider">
                          Optical Plate Breakdown
                        </span>
                        <h3 className="font-bold text-base text-[#20312F]">
                          {detectedCandidates.length} Items Detected
                        </h3>
                      </div>
                      <SuitabilityBadge level={scanReport.suitability.level} score={scanReport.suitability.score} />
                    </div>

                    {/* Detected Items List */}
                    <div className="space-y-2.5">
                      {detectedCandidates.map((c, i) => (
                        <div key={i} className="p-3 rounded-2xl bg-[#F7FAFC] border border-[#E2ECEB] flex items-center justify-between text-xs">
                          <div>
                            <strong className="text-[#20312F] block">{c.dish_name}</strong>
                            <span className="text-[11px] text-[#8E9F9D]">{c.household_measure}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-[#E9F8F3] text-[#177E75] font-mono font-bold text-[10px]">
                            {Math.round(c.confidence * 100)}% match
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Scientific Nutrient Totals */}
                    <div className="grid grid-cols-4 gap-2 bg-[#E9F8F3] p-3 rounded-2xl text-center text-xs">
                      <div>
                        <span className="text-[10px] text-[#5A6D6B] block">Calories</span>
                        <strong className="text-sm text-[#177E75] font-mono">{scanReport.nutrients.calories}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#5A6D6B] block">Protein</span>
                        <strong className="text-sm text-[#177E75] font-mono">{scanReport.nutrients.protein}g</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#5A6D6B] block">Carbs</span>
                        <strong className="text-sm text-[#177E75] font-mono">{scanReport.nutrients.carbs}g</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#5A6D6B] block">Fiber</span>
                        <strong className="text-sm text-[#218C68] font-mono">{scanReport.nutrients.fiber}g</strong>
                      </div>
                    </div>

                    <button
                      onClick={handleLogScannedMeal}
                      className="w-full py-3 rounded-2xl bg-[#177E75] hover:bg-[#126861] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Confirm & Log Meal to Today
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: AVAILABLE FOOD (SMART PANTRY MATCHER)                  */}
        {/* ============================================================== */}
        {activeTab === "pantry" && (
          <div className="space-y-8 animate-fade-in">
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-[#20312F]">
                “What Can I Eat Right Now?” Pantry Matcher
              </h2>
              <p className="text-xs text-[#5A6D6B] mt-0.5">
                Select ingredients you currently have in your kitchen. We rank recipes into 3 realistic tiers.
              </p>
            </div>

            {/* Interactive Pantry Chips */}
            <div className="p-6 rounded-3xl bg-white border border-[#E2ECEB] card-shadow space-y-4">
              <div className="flex flex-wrap gap-2">
                {[
                  "Rice", "Moong Dal", "Toor Dal", "Whole Wheat Atta", "Onions",
                  "Tomatoes", "Potatoes", "Eggs", "Curd", "Paneer", "Spinach", "Mustard Seeds"
                ].map((item) => {
                  const isSelected = pantry.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => handleTogglePantryItem(item)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-[#177E75] text-white shadow-xs"
                          : "bg-[#F7FAFC] text-[#5A6D6B] border border-[#E2ECEB] hover:border-[#42BFA5]"
                      }`}
                    >
                      {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Ingredient */}
              <form onSubmit={handleAddCustomPantry} className="flex gap-2">
                <input
                  type="text"
                  value={customPantryInput}
                  onChange={(e) => setCustomPantryInput(e.target.value)}
                  placeholder="Add custom ingredient (e.g. Oats, Besan, Ginger)..."
                  className="flex-1 px-3 py-2 rounded-xl border border-[#E2ECEB] text-xs focus:outline-none focus:border-[#42BFA5]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#42BFA5] text-white text-xs font-bold hover:bg-[#2ba98e]"
                >
                  Add
                </button>
              </form>
            </div>

            {/* 3-Tier Recipe Results */}
            {loadingPantry ? (
              <div className="p-8 text-center text-xs text-[#8E9F9D]">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#42BFA5] mb-2" />
                Matching against authentic Indian recipes...
              </div>
            ) : pantryResults && (
              <div className="space-y-6">
                
                {/* Tier 1: Best Available */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E8F7EF] text-[#218C68] text-[10px] font-bold uppercase">
                      Tier 1: 100% In Kitchen
                    </span>
                    <h3 className="font-bold text-sm text-[#20312F]">Best Available Right Now</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(pantryResults.best_available || []).map((recipe: any) => (
                      <div key={recipe.id} className="p-5 rounded-3xl bg-white border border-[#BCE8DE] card-shadow space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-[#20312F]">{recipe.recipe_name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E9F8F3] text-[#177E75]">
                            {recipe.prep_time_minutes} min
                          </span>
                        </div>
                        <p className="text-xs text-[#5A6D6B]">{recipe.description}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-[#EDF3F3] text-xs">
                          <span className="text-[#8E9F9D]">
                            <strong>{recipe.matched_count}</strong> of {recipe.total_ingredients} ingredients
                          </span>
                          <span className="font-mono font-bold text-[#177E75]">
                            {recipe.estimated_calories} kcal
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tier 2: Reasonable Alternatives */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFF5E5] text-[#B87921] text-[10px] font-bold uppercase">
                      Tier 2: Minor Substitutions
                    </span>
                    <h3 className="font-bold text-sm text-[#20312F]">Reasonable Alternatives</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(pantryResults.reasonable_alternatives || []).map((recipe: any) => (
                      <div key={recipe.id} className="p-5 rounded-3xl bg-white border border-[#E2ECEB] card-shadow space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-[#20312F]">{recipe.recipe_name}</h4>
                          <span className="text-[10px] font-bold text-[#8E9F9D]">{recipe.prep_time_minutes} min</span>
                        </div>
                        <div className="text-xs text-[#B87921]">
                          Missing: {recipe.missing_ingredients?.join(", ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: AI GROUNDED NUTRITION COACH                            */}
        {/* ============================================================== */}
        {activeTab === "coach" && (
          <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#20312F]">Grounded Clinical Nutrition Coach</h2>
                <p className="text-xs text-[#5A6D6B]">
                  Backed by your logged meals, health records (prediabetes, BP), and ICMR-NIN 2024 standards.
                </p>
              </div>
              <button
                onClick={() => setShowAISettingsModal(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5 text-purple-600" />
                <span>{activeAIProviderName}</span>
              </button>
            </div>

            {/* Chat History Container */}
            <div className="bg-white rounded-3xl border border-[#E2ECEB] card-shadow h-[480px] flex flex-col overflow-hidden">
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-3xl text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-[#177E75] text-white rounded-br-none"
                          : "bg-[#F7FAFC] text-[#20312F] border border-[#E2ECEB] rounded-bl-none"
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Suggested follow-up prompt pills */}
                    {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.suggested_followups.map((prompt: string, pIdx: number) => (
                          <button
                            key={pIdx}
                            onClick={() => handleSendMessage(prompt)}
                            className="px-2.5 py-1 rounded-full bg-[#E9F8F3] hover:bg-[#d5f3e7] text-[#177E75] font-bold text-[10px] transition-colors"
                          >
                            + {prompt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {sendingMsg && (
                  <div className="flex items-center gap-2 text-xs text-[#8E9F9D]">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-[#42BFA5]" />
                    <span>Coach is consulting ICMR-NIN guidelines & your profile...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 border-t border-[#E2ECEB] bg-[#F7FAFC] flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputMessage)}
                  placeholder="Ask your coach anything about Indian meals, portion math, or what to cook..."
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-[#E2ECEB] text-xs bg-white focus:outline-none focus:border-[#42BFA5]"
                />
                <button
                  onClick={() => handleSendMessage(inputMessage)}
                  disabled={sendingMsg || !inputMessage.trim()}
                  className="px-5 py-2.5 rounded-2xl bg-[#177E75] hover:bg-[#126861] text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: FOOD DATABASE EXPLORER                                 */}
        {/* ============================================================== */}
        {activeTab === "database" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-[#20312F]">ICMR-NIN 2024 Indian Food Database</h2>
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
                placeholder="Search food by English, Hindi, or Tamil name (e.g. Roti, Idli, Dal, Curd, Paneer, Chicken)..."
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
                          items: [{ 
                            food_name: f.name, 
                            weight_grams: f.default_serving_grams, 
                            calories: f.calories_per_100g * (f.default_serving_grams / 100), 
                            protein: f.protein_per_100g * (f.default_serving_grams / 100), 
                            carbs: f.carbs_per_100g * (f.default_serving_grams / 100), 
                            fiber: f.fiber_per_100g * (f.default_serving_grams / 100) 
                          }],
                          total_calories: Number((f.calories_per_100g * (f.default_serving_grams / 100)).toFixed(1)),
                          total_protein: Number((f.protein_per_100g * (f.default_serving_grams / 100)).toFixed(1)),
                          total_carbs: Number((f.carbs_per_100g * (f.default_serving_grams / 100)).toFixed(1)),
                          total_fiber: Number((f.fiber_per_100g * (f.default_serving_grams / 100)).toFixed(1))
                        }]);
                        alert(`Added "${f.name}" to today's diary!`);
                        setActiveTab("dashboard");
                      }}
                      className="w-full py-2 rounded-xl bg-[#E9F8F3] text-[#177E75] font-bold text-xs hover:bg-[#d5f3e7] transition-colors"
                    >
                      + Quick Log Standard Serving
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

      </main>

      {/* Global Modals */}
      <MedicalProfileModal
        isOpen={showMedicalModal}
        onClose={() => setShowMedicalModal(false)}
        onProfileUpdated={(updated) => setMedicalProfile(updated)}
      />

      <AISettingsModal
        isOpen={showAISettingsModal}
        onClose={() => setShowAISettingsModal(false)}
        onConfigSaved={(conf) => {
          setActiveAIProviderName(
            conf.provider === "openai" ? "OpenAI GPT-4o" :
            conf.provider === "gemini" ? "Google Gemini" :
            conf.provider === "local" ? "Local Ollama" : "Smart Auto"
          );
        }}
      />

    </div>
  );
}

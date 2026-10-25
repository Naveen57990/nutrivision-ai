"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ChefHat,
  LayoutDashboard,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Leaf,
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
import MacroGauge from "@/components/MacroGauge";
import CuteWaterTracker from "@/components/CuteWaterTracker";
import MedicalProfileModal, { UserMedicalProfile } from "@/components/MedicalProfileModal";
import { AISettingsModal } from "@/components/AISettingsModal";
import SmartFoodIntelligenceStudio from "@/components/SmartFoodIntelligenceStudio";
import CuteFloatingCoachBuddy from "@/components/CuteFloatingCoachBuddy";
import { ApiClient } from "@/lib/api";
import { DISH_DATABASE } from "@/lib/recipe_database";

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
    "food_intelligence" | "dashboard" | "water" | "database"
  >("food_intelligence");

  // Medical Profile State
  const [medicalProfile, setMedicalProfile] = useState<UserMedicalProfile>(INITIAL_PROFILE);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showAISettingsModal, setShowAISettingsModal] = useState(false);
  const [activeAIProviderName, setActiveAIProviderName] = useState("Smart Auto");

  // Daily Tracker State
  const [meals, setMeals] = useState<any[]>(INITIAL_MEALS);

  // Food Database Explorer State
  const [foods, setFoods] = useState<any[]>([]);
  const [dishDatabase, setDishDatabase] = useState(DISH_DATABASE);
  const [dbView, setDbView] = useState<"dishes" | "raw">("dishes");
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

    fetch("/api/foods")
      .then((r) => r.json())
      .then((data) => setFoods(data))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#20312F] flex flex-col font-sans relative">
      
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
          <nav className="hidden md:flex items-center gap-1.5 bg-[#F7FAFC] p-1.5 rounded-2xl border border-[#E2ECEB]">
            {[
              { id: "food_intelligence", label: "AI Food Studio", icon: ChefHat },
              { id: "dashboard", label: "Dashboard & Tracker", icon: LayoutDashboard },
              { id: "water", label: "Pure Water", icon: Droplet },
              { id: "database", label: "Food Database", icon: Search }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-white text-[#177E75] shadow-xs ring-1 ring-teal-500/10"
                      : "text-[#5A6D6B] hover:text-[#20312F] hover:bg-white/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#42BFA5]" : "text-[#8E9F9D]"}`} />
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
        <div className="md:hidden flex items-center justify-around border-t border-[#EDF3F3] bg-white px-2 py-2">
          {[
            { id: "food_intelligence", label: "Studio", icon: ChefHat },
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "water", label: "Water", icon: Droplet },
            { id: "database", label: "Foods", icon: Search }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center py-1.5 px-3 rounded-xl text-[10px] font-bold ${
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
        {/* TAB 1: FLAGSHIP AI FOOD INTELLIGENCE & RECIPE STUDIO          */}
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
        {/* TAB 2: DASHBOARD & DAILY TRACKER                              */}
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
        {/* TAB 3: PURE HYDRATION TRACKER (DEDICATED VIEW)                */}
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
        {/* TAB 4: FOOD & DISHES DATABASE EXPLORER                        */}
        {/* ============================================================== */}
        {activeTab === "database" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#20312F]">ICMR-NIN 2024 Food & Dishes Database</h2>
                <p className="text-xs text-[#5A6D6B] mt-0.5">
                  Browse 50+ cooked dishes with authentic portion guidance and verified Indian whole food records.
                </p>
              </div>

              {/* View Switcher: Cooked Dishes vs Raw Ingredients */}
              <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-2xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setDbView("dishes")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dbView === "dishes"
                      ? "bg-white text-teal-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🍲 Cooked Dishes (50+)
                </button>
                <button
                  type="button"
                  onClick={() => setDbView("raw")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dbView === "raw"
                      ? "bg-white text-teal-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🌾 Raw Whole Foods
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#E2ECEB] card-shadow flex gap-2">
              <Search className="w-4 h-4 text-[#8E9F9D] my-auto ml-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  dbView === "dishes"
                    ? "Search dishes (e.g. Palak Paneer, Egg Bhurji, Chilla, Khichdi, Chicken Tikka, Oats)..."
                    : "Search whole food records (e.g. Roti, Rice, Curd, Paneer, Toor Dal, Apple)..."
                }
                className="w-full px-2 py-1 text-xs focus:outline-none"
              />
            </div>

            {/* Cooked Dishes View */}
            {dbView === "dishes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {dishDatabase
                  .filter((d) => 
                    !searchQuery ||
                    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    d.essential_ingredients.some((i: string) => i.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    d.regional_cuisine.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((dish) => (
                    <div key={dish.id} className="p-5 rounded-3xl bg-white border border-[#E2ECEB] card-shadow space-y-4 hover:shadow-lg transition-all flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            dish.is_vegetarian 
                              ? "bg-emerald-100 text-emerald-800" 
                              : "bg-rose-100 text-rose-800"
                          }`}>
                            {dish.is_vegetarian ? "🥬 Vegetarian" : "🍗 Non-Veg"}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {dish.regional_cuisine} • {dish.prep_time_minutes} min
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-[#20312F]">{dish.name}</h4>
                          <p className="text-[11px] text-[#5A6D6B] line-clamp-2 mt-1">{dish.description}</p>
                        </div>

                        {/* Macro Chips */}
                        <div className="grid grid-cols-4 gap-1 bg-[#F7FAFC] p-2 rounded-2xl text-center text-[10px]">
                          <div>
                            <span className="text-[#8E9F9D] block">Kcal</span>
                            <strong className="text-teal-900 font-mono">{dish.calories}</strong>
                          </div>
                          <div>
                            <span className="text-[#8E9F9D] block">Protein</span>
                            <strong className="text-blue-700 font-mono">{dish.protein_g}g</strong>
                          </div>
                          <div>
                            <span className="text-[#8E9F9D] block">Carbs</span>
                            <strong className="text-amber-700 font-mono">{dish.carbs_g}g</strong>
                          </div>
                          <div>
                            <span className="text-[#8E9F9D] block">Fiber</span>
                            <strong className="text-emerald-700 font-mono">{dish.fiber_g}g</strong>
                          </div>
                        </div>

                        {/* Serving guidance */}
                        <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <strong>Standard Portion:</strong> {dish.default_serving_size}
                        </div>

                        {/* "How this helps you" pill */}
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-white border border-emerald-200/70 text-[11px] text-emerald-950 space-y-1.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-[10px] uppercase text-emerald-900 tracking-wider flex items-center gap-1">
                              <span>💡</span> THIS WILL HELP YOU IN:
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {medicalProfile.primary_goal.replace(/_/g, " ")}
                            </span>
                          </div>
                          
                          <p className="text-slate-700 leading-relaxed text-[11px]">
                            {medicalProfile.primary_goal.includes("muscle") ? (
                              <span>Delivers <strong>{dish.protein_g}g protein</strong> ({Math.round((dish.protein_g / medicalProfile.daily_protein_target_g) * 100)}% of your daily {medicalProfile.daily_protein_target_g}g target) to support muscle repair and hypertrophy.</span>
                            ) : medicalProfile.primary_goal.includes("loss") || medicalProfile.primary_goal.includes("fat") ? (
                              <span>Controlled at <strong>{dish.calories} kcal</strong> with <strong>{dish.fiber_g}g fiber</strong> to promote satiety and fat loss without hunger pangs.</span>
                            ) : (
                              <span>Balanced ICMR nutrition with <strong>{dish.protein_g}g protein</strong> and <strong>{dish.fiber_g}g fiber</strong> for sustained vitality.</span>
                            )}
                          </p>

                          {medicalProfile.health_conditions.some((c: string) => c.includes("diabetes") || c.includes("prediabetes")) && (
                            <div className="pt-1 border-t border-emerald-200/50 text-[10px] text-teal-900 flex items-center gap-1">
                              <span>🩸</span> <span>Low-glycemic profile protects post-meal glucose stability.</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setMeals([...meals, {
                            id: Date.now(),
                            meal_type: dish.meal_types[0] || "lunch",
                            items: [{
                              food_name: dish.name,
                              weight_grams: dish.default_serving_grams,
                              calories: dish.calories,
                              protein: dish.protein_g,
                              carbs: dish.carbs_g,
                              fiber: dish.fiber_g
                            }],
                            total_calories: dish.calories,
                            total_protein: dish.protein_g,
                            total_carbs: dish.carbs_g,
                            total_fiber: dish.fiber_g
                          }]);
                          alert(`Added "${dish.name}" to today's diary!`);
                          setActiveTab("dashboard");
                        }}
                        className="w-full mt-3 py-2.5 rounded-xl bg-[#E9F8F3] hover:bg-[#d5f3e7] text-[#177E75] font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Log This Dish
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {/* Raw Whole Foods View */}
            {dbView === "raw" && (
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
            )}
          </div>
        )}

      </main>

      {/* Floating Cute Coach Buddy (Available across ALL tabs) */}
      <CuteFloatingCoachBuddy
        userProfile={medicalProfile}
        totalCalories={totalCalories}
        totalProtein={totalProtein}
        onOpenAISettings={() => setShowAISettingsModal(true)}
      />

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

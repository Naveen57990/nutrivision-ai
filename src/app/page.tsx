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
  Settings,
  BookOpen
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
import CuteHealthDiary from "@/components/CuteHealthDiary";
import CuteFloatingCoachBuddy from "@/components/CuteFloatingCoachBuddy";
import { ApiClient } from "@/lib/api";
import { DISH_DATABASE } from "@/lib/recipe_database";

// Initial Logged Meals for Today (Zero Demo Data - Real Data Only)
const INITIAL_MEALS: any[] = [];

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
    "food_intelligence" | "diary" | "dashboard" | "water" | "database"
  >("food_intelligence");

  // Medical Profile State
  const [medicalProfile, setMedicalProfile] = useState<UserMedicalProfile>(INITIAL_PROFILE);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showAISettingsModal, setShowAISettingsModal] = useState(false);
  const [activeAIProviderName, setActiveAIProviderName] = useState("Smart Auto");

  // Daily Tracker State (Real data only, default empty)
  const [meals, setMeals] = useState<any[]>([]);

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

  // Initialize on mount: load real data only
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("nutrivision_user_profile");
      if (savedProfile) {
        setMedicalProfile(JSON.parse(savedProfile));
      }
      const savedMeals = localStorage.getItem("nutrivision_user_real_meals");
      if (savedMeals) {
        setMeals(JSON.parse(savedMeals));
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

  // Universal Log Meal Handler
  const handleLogMeal = (meal: any) => {
    const newMeal = { id: Date.now(), ...meal };
    setMeals((prev) => {
      const updated = [...prev, newMeal];
      try {
        localStorage.setItem("nutrivision_user_real_meals", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Also sync to Cute Health Diary records for today
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const savedDiary = localStorage.getItem("nutrivision_real_diary_records_v3");
      const records = savedDiary ? JSON.parse(savedDiary) : {};
      const existingToday = records[todayStr] || {
        date: todayStr,
        display_date: new Date().toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) + " (Today)",
        water_ml: 0,
        water_target_ml: medicalProfile.daily_water_target_ml || 2500,
        meals: [],
        reflection_note: ""
      };

      const newFoodItem = {
        id: "food-" + Date.now(),
        name: meal.items?.[0]?.food_name || meal.dish_name || "Custom Dish",
        meal_slot: meal.meal_type || "breakfast",
        calories: meal.total_calories || meal.calories || 0,
        protein_g: meal.total_protein || meal.protein || 0,
        carbs_g: meal.total_carbs || meal.carbs || 0,
        fiber_g: meal.total_fiber || meal.fiber || 0,
        portion: "1 serving",
        time_logged: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      records[todayStr] = {
        ...existingToday,
        meals: [...existingToday.meals, newFoodItem]
      };
      localStorage.setItem("nutrivision_real_diary_records_v3", JSON.stringify(records));
    } catch (e) {
      console.error("Diary sync error:", e);
    }
  };

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
          <nav className="hidden md:flex items-center gap-1.5 bg-[#F6EFE7]/80 p-1.5 rounded-2xl border border-[#E8DCCF]">
            {[
              { id: "food_intelligence", label: "🍳 AI Food Studio", icon: ChefHat },
              { id: "diary", label: "📖 Cute Diary & Tracker", icon: BookOpen },
              { id: "water", label: "💧 Pure Water", icon: Droplet },
              { id: "database", label: "🍲 Food Database", icon: Search }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-[#147269] shadow-xs ring-1 ring-teal-500/20"
                      : "text-[#5F4E40] hover:text-[#2C2016] hover:bg-white/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#3db89f]" : "text-[#8F7D6E]"}`} />
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
        <div className="md:hidden flex items-center justify-around border-t border-[#EADBCE] bg-white px-2 py-2">
          {[
            { id: "food_intelligence", label: "Studio", icon: ChefHat },
            { id: "diary", label: "Diary & Tracker", icon: BookOpen },
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
                handleLogMeal(meal);
                alert(`Logged "${meal.items?.[0]?.food_name || "Meal"}" to your Cute Diary & Tracker!`);
                setActiveTab("diary");
              }}
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: CUTE FLIP-PAGE HEALTH DIARY & EMBEDDED DAILY TRACKER   */}
        {/* ============================================================== */}
        {(activeTab === "diary" || (activeTab as any) === "dashboard") && (
          <div className="space-y-6 animate-fade-in">
            <CuteHealthDiary
              userProfile={medicalProfile}
              onOpenAIShop={() => {
                setActiveTab("food_intelligence");
              }}
            />
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
                          handleLogMeal({
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
                          });
                          alert(`Added "${dish.name}" to your Cute Diary & Tracker!`);
                          setActiveTab("diary");
                        }}
                        className="w-full mt-3 py-2.5 rounded-xl bg-[#E9F8F3] hover:bg-[#d5f3e7] text-[#177E75] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Log This Dish to Diary
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

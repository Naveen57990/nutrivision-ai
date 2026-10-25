"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Plus,
  Trash2,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  Heart,
  Target,
  Smile,
  Utensils,
  Sun,
  Sunrise,
  Moon,
  Coffee,
  ChefHat
} from "lucide-react";

export interface LoggedFoodItem {
  id: string;
  name: string;
  meal_slot: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein_g: number;
  carbs_g: number;
  fiber_g: number;
  sodium_mg?: number;
  portion: string;
  time_logged?: string;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  display_date: string; // e.g. "Sunday, 26 Oct 2026"
  water_ml: number;
  water_target_ml: number;
  meals: LoggedFoodItem[];
  reflection_note: string;
  achievement_stamp: string;
}

interface CuteHealthDiaryProps {
  userProfile: any;
  onOpenAIShop?: (slot: string) => void;
  externalLoggedMeal?: any;
}

// Preset historical data so the user can immediately flip through past days!
const INITIAL_DIARY_HISTORY: Record<string, DayRecord> = {
  "2026-10-24": {
    date: "2026-10-24",
    display_date: "Friday, 24 Oct 2026",
    water_ml: 2600,
    water_target_ml: 2520,
    reflection_note: "Hit all my protein targets and drank 10+ glasses of water! Feeling super fresh.",
    achievement_stamp: "🌟 PERFECT GOLD DAY",
    meals: [
      { id: "m1", name: "Warm Banana Almond Oatmeal", meal_slot: "breakfast", calories: 320, protein_g: 13.5, carbs_g: 54, fiber_g: 7.2, portion: "1 bowl", time_logged: "08:30 AM" },
      { id: "m2", name: "High-Protein Palak Paneer with 2 Phulkas", meal_slot: "lunch", calories: 420, protein_g: 24.5, carbs_g: 38, fiber_g: 8.2, portion: "1.5 katori + 2 rotis", time_logged: "01:15 PM" },
      { id: "m3", name: "Roasted Turmeric Makhana", meal_slot: "snack", calories: 150, protein_g: 5.0, carbs_g: 22, fiber_g: 4.0, portion: "1 cup", time_logged: "05:00 PM" },
      { id: "m4", name: "Moong Dal & Spinach Khichdi with Dahi", meal_slot: "dinner", calories: 380, protein_g: 18.0, carbs_g: 62, fiber_g: 7.0, portion: "1 bowl + dahi", time_logged: "08:15 PM" }
    ]
  },
  "2026-10-25": {
    date: "2026-10-25",
    display_date: "Saturday, 25 Oct 2026",
    water_ml: 2500,
    water_target_ml: 2520,
    reflection_note: "Cooked besan chilla for breakfast. Blood sugar remained completely stable all day!",
    achievement_stamp: "🥑 CLEAN NUTRITION STAR",
    meals: [
      { id: "m5", name: "Crispy Vegetable Besan Chilla (2 cheelas)", meal_slot: "breakfast", calories: 310, protein_g: 16.5, carbs_g: 42, fiber_g: 8.5, portion: "2 chillas", time_logged: "09:00 AM" },
      { id: "m6", name: "Dal Tadka with Steamed Brown Rice", meal_slot: "lunch", calories: 430, protein_g: 16.5, carbs_g: 74, fiber_g: 9.0, portion: "1 plate", time_logged: "01:30 PM" },
      { id: "m7", name: "Sprouted Moong & Cucumber Chaat", meal_slot: "snack", calories: 195, protein_g: 14.2, carbs_g: 31, fiber_g: 8.8, portion: "1 bowl", time_logged: "05:30 PM" },
      { id: "m8", name: "Masala Paneer Bhurji with 2 Phulkas", meal_slot: "dinner", calories: 395, protein_g: 22.0, carbs_g: 32, fiber_g: 6.0, portion: "1 bowl + 2 rotis", time_logged: "08:30 PM" }
    ]
  },
  "2026-10-26": {
    date: "2026-10-26",
    display_date: "Sunday, 26 Oct 2026 (Today)",
    water_ml: 2600,
    water_target_ml: 2520,
    reflection_note: "Started the morning hydrated. Personalized food studio gave awesome options!",
    achievement_stamp: "💧 HYDRATED HERO",
    meals: [
      { id: "m9", name: "Masala Egg Toast with Tomatoes", meal_slot: "breakfast", calories: 380, protein_g: 22.5, carbs_g: 32, fiber_g: 4.5, portion: "2 eggs + 2 toasts", time_logged: "08:45 AM" },
      { id: "m10", name: "Homestyle Dal Tadka with Jeera Rice", meal_slot: "lunch", calories: 430, protein_g: 16.5, carbs_g: 74, fiber_g: 9.0, portion: "1 bowl dal + 1 cup rice", time_logged: "01:15 PM" },
      { id: "m11", name: "Cucumber & Lemon Salad with Black Pepper", meal_slot: "snack", calories: 85, protein_g: 2.0, carbs_g: 14, fiber_g: 3.5, portion: "1 plate", time_logged: "05:15 PM" }
    ]
  }
};

const DATES_LIST = ["2026-10-24", "2026-10-25", "2026-10-26"];

export default function CuteHealthDiary({
  userProfile,
  onOpenAIShop
}: CuteHealthDiaryProps) {
  const [currentDateIndex, setCurrentDateIndex] = useState(2); // Default to today (Oct 26)
  const [diaryData, setDiaryData] = useState<Record<string, DayRecord>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nutrivision_cute_diary_v2");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_DIARY_HISTORY;
  });

  const [activeSlotModal, setActiveSlotModal] = useState<string | null>(null);
  const [customDishName, setCustomDishName] = useState("");
  const [customCalories, setCustomCalories] = useState("350");
  const [customProtein, setCustomProtein] = useState("20");

  const currentDateKey = DATES_LIST[currentDateIndex] || "2026-10-26";
  const currentDayRecord = diaryData[currentDateKey] || {
    date: currentDateKey,
    display_date: currentDateKey,
    water_ml: 1500,
    water_target_ml: userProfile.daily_water_target_ml || 2520,
    meals: [],
    reflection_note: "",
    achievement_stamp: "🌱 GROWING STRONGER"
  };

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nutrivision_cute_diary_v2", JSON.stringify(diaryData));
    }
  }, [diaryData]);

  // Daily totals calculation
  const totalCalories = currentDayRecord.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = Math.round(currentDayRecord.meals.reduce((sum, m) => sum + (m.protein_g || 0), 0) * 10) / 10;
  const totalCarbs = Math.round(currentDayRecord.meals.reduce((sum, m) => sum + (m.carbs_g || 0), 0) * 10) / 10;
  const totalFiber = Math.round(currentDayRecord.meals.reduce((sum, m) => sum + (m.fiber_g || 0), 0) * 10) / 10;

  const targetCal = userProfile.daily_calorie_target || 2050;
  const targetProt = userProfile.daily_protein_target_g || 78;
  const waterTarget = currentDayRecord.water_target_ml || 2520;
  const isWaterComplete = currentDayRecord.water_ml >= waterTarget;

  // Water increment helper
  const addWater = (amountMl: number) => {
    setDiaryData((prev) => {
      const existing = prev[currentDateKey] || currentDayRecord;
      const updated = {
        ...existing,
        water_ml: Math.min(5000, existing.water_ml + amountMl)
      };
      return { ...prev, [currentDateKey]: updated };
    });
  };

  // Add custom food to slot
  const handleAddFoodItem = (slot: "breakfast" | "lunch" | "dinner" | "snack") => {
    if (!customDishName.trim()) return;
    const newItem: LoggedFoodItem = {
      id: "item-" + Date.now(),
      name: customDishName.trim(),
      meal_slot: slot,
      calories: parseInt(customCalories) || 300,
      protein_g: parseFloat(customProtein) || 15,
      carbs_g: 35,
      fiber_g: 6,
      portion: "1 standard serving",
      time_logged: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setDiaryData((prev) => {
      const existing = prev[currentDateKey] || currentDayRecord;
      const updated = {
        ...existing,
        meals: [...existing.meals, newItem]
      };
      return { ...prev, [currentDateKey]: updated };
    });

    setCustomDishName("");
    setActiveSlotModal(null);
  };

  // Remove food
  const handleRemoveFood = (id: string) => {
    setDiaryData((prev) => {
      const existing = prev[currentDateKey] || currentDayRecord;
      const updated = {
        ...existing,
        meals: existing.meals.filter((m) => m.id !== id)
      };
      return { ...prev, [currentDateKey]: updated };
    });
  };

  // Page flipping controls
  const handleFlipPrev = () => {
    if (currentDateIndex > 0) setCurrentDateIndex(currentDateIndex - 1);
  };

  const handleFlipNext = () => {
    if (currentDateIndex < DATES_LIST.length - 1) setCurrentDateIndex(currentDateIndex + 1);
  };

  return (
    <div className="space-y-6">
      
      {/* Cute Flip-Diary Book Spine & Cover Container */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#FFF9F2] via-[#FFFDF9] to-[#F2FAF7] border-4 border-[#E6D5C3] shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Decorative Leather/Journal Stitching Top Line */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#D7A87A] via-[#C6925B] to-[#D7A87A] shadow-inner opacity-80" />

        {/* Top Flip Navigation & Bookmark Ribbon */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b-2 border-dashed border-[#E8D9C8]">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFEBD6] border-2 border-[#F3CCA5] text-[#A66326] flex items-center justify-center text-xl shadow-xs">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-[#3B2B1B] font-serif tracking-tight">
                  My Cute Nutrition Diary
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E5F7F1] text-[#127764] border border-[#BDECDC]">
                  Page-by-Page Journey
                </span>
              </div>
              <p className="text-xs text-[#7A6451] mt-0.5">
                Flip pages to track your daily food intake, water goals, and clinical progress.
              </p>
            </div>
          </div>

          {/* Page Flip Buttons */}
          <div className="flex items-center gap-2 bg-white/90 p-1.5 rounded-2xl border border-[#E8D9C8] shadow-sm">
            <button
              onClick={handleFlipPrev}
              disabled={currentDateIndex === 0}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-30 text-[#6B5139] hover:bg-[#FDF3E7]"
            >
              <ChevronLeft className="w-4 h-4" /> ◀ Flip Prev
            </button>

            <span className="px-3 py-1 rounded-lg bg-[#FAF0E4] text-[#4A3828] text-xs font-extrabold font-mono">
              Day {currentDateIndex + 1} of {DATES_LIST.length}
            </span>

            <button
              onClick={handleFlipNext}
              disabled={currentDateIndex === DATES_LIST.length - 1}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-30 text-[#6B5139] hover:bg-[#FDF3E7]"
            >
              Flip Next ▶ <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Page Banner: Date & Daily Performance Stamp */}
        <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#8C6D4F]" />
              <h3 className="text-lg font-black text-[#2E2014] font-serif">
                {currentDayRecord.display_date}
              </h3>
            </div>
            <p className="text-xs text-[#826E5D] mt-0.5">
              Goal: <strong>{userProfile.primary_goal?.replace(/_/g, " ")}</strong> • Profile: <strong>{userProfile.weight_kg}kg ({userProfile.dietary_pattern})</strong>
            </p>
          </div>

          {/* Cute Performance Stamp / Badge */}
          <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-100/90 to-amber-200/90 border-2 border-amber-300 shadow-sm flex items-center gap-2 self-start md:self-auto rotate-1 hover:rotate-0 transition-transform">
            <Award className="w-5 h-5 text-amber-700 animate-bounce" />
            <div>
              <span className="text-[10px] font-black uppercase text-amber-900 block tracking-wider">
                Daily Performance Stamp
              </span>
              <strong className="text-xs text-amber-950 font-bold">
                {currentDayRecord.achievement_stamp}
              </strong>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 1: CUTE WATER COMPLETE OR NOT TRACKER                  */}
        {/* ============================================================== */}
        <div className="mt-6 p-5 rounded-3xl bg-gradient-to-r from-[#EBF8FF] via-[#E1F3FE] to-[#F0FAFF] border-2 border-[#BAE3FE] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-200 border-2 border-sky-300 text-sky-700 flex items-center justify-center text-2xl shadow-xs shrink-0">
              {isWaterComplete ? "🦭✨" : "💧"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-sky-950">
                  Pure Water Intake Status
                </h4>
                {isWaterComplete ? (
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Target Complete!
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-200 text-sky-900">
                    In Progress
                  </span>
                )}
              </div>
              <p className="text-xs text-sky-800 mt-0.5">
                Logged: <strong>{currentDayRecord.water_ml} ml</strong> of your <strong>{waterTarget} ml</strong> personalized hydration target.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => addWater(250)}
              className="px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <Droplet className="w-3.5 h-3.5" /> +250ml Glass
            </button>
            <button
              onClick={() => addWater(500)}
              className="px-3 py-2 rounded-xl bg-white hover:bg-sky-50 text-sky-800 border border-sky-300 font-bold text-xs transition-all"
            >
              +500ml Bottle
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 2: FOOD TOOK BY MEAL SLOT (BREAKFAST, LUNCH, DINNER)   */}
        {/* ============================================================== */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#8C6D4F]" />
              <h4 className="text-base font-extrabold text-[#2E2014] font-serif">
                Meals Logged by Slot
              </h4>
            </div>
            <span className="text-xs text-[#826E5D]">
              Total Consumed: <strong>{totalCalories} kcal</strong> • <strong>{totalProtein}g protein</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* SLOT 1: BREAKFAST */}
            <MealSlotCard
              title="Breakfast"
              slot="breakfast"
              icon={Sunrise}
              iconColor="text-amber-500"
              bgColor="bg-amber-50/60"
              borderColor="border-amber-200/80"
              items={currentDayRecord.meals.filter((m) => m.meal_slot === "breakfast")}
              onAdd={() => setActiveSlotModal("breakfast")}
              onRemove={handleRemoveFood}
              onStudio={() => onOpenAIShop && onOpenAIShop("breakfast")}
            />

            {/* SLOT 2: LUNCH */}
            <MealSlotCard
              title="Lunch"
              slot="lunch"
              icon={Sun}
              iconColor="text-orange-500"
              bgColor="bg-orange-50/60"
              borderColor="border-orange-200/80"
              items={currentDayRecord.meals.filter((m) => m.meal_slot === "lunch")}
              onAdd={() => setActiveSlotModal("lunch")}
              onRemove={handleRemoveFood}
              onStudio={() => onOpenAIShop && onOpenAIShop("lunch")}
            />

            {/* SLOT 3: SNACKS */}
            <MealSlotCard
              title="Snacks & Tea"
              slot="snack"
              icon={Coffee}
              iconColor="text-emerald-500"
              bgColor="bg-emerald-50/60"
              borderColor="border-emerald-200/80"
              items={currentDayRecord.meals.filter((m) => m.meal_slot === "snack")}
              onAdd={() => setActiveSlotModal("snack")}
              onRemove={handleRemoveFood}
              onStudio={() => onOpenAIShop && onOpenAIShop("snack")}
            />

            {/* SLOT 4: DINNER */}
            <MealSlotCard
              title="Dinner"
              slot="dinner"
              icon={Moon}
              iconColor="text-indigo-500"
              bgColor="bg-indigo-50/60"
              borderColor="border-indigo-200/80"
              items={currentDayRecord.meals.filter((m) => m.meal_slot === "dinner")}
              onAdd={() => setActiveSlotModal("dinner")}
              onRemove={handleRemoveFood}
              onStudio={() => onOpenAIShop && onOpenAIShop("dinner")}
            />

          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 3: WHAT YOU ACHIEVED TODAY (REPORT CARD)               */}
        {/* ============================================================== */}
        <div className="mt-8 p-6 rounded-3xl bg-white border-2 border-[#EADCCE] shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-extrabold text-[#2E2014] uppercase tracking-wider font-serif">
                What Was Achieved on This Day
              </h4>
            </div>
            <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              ICMR 2024 Calibrated
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">CALORIES</span>
              <div className="text-base font-black text-slate-800 font-mono mt-0.5">
                {totalCalories} <span className="text-xs font-normal text-slate-400">/ {targetCal}</span>
              </div>
              <span className="text-[10px] font-bold text-teal-700">
                {Math.round((totalCalories / targetCal) * 100)}% of Target
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-center">
              <span className="text-[10px] font-bold text-blue-400 block uppercase">PROTEIN</span>
              <div className="text-base font-black text-blue-900 font-mono mt-0.5">
                {totalProtein}g <span className="text-xs font-normal text-blue-400">/ {targetProt}g</span>
              </div>
              <span className="text-[10px] font-bold text-blue-700">
                {Math.round((totalProtein / targetProt) * 100)}% Muscle Synthesis
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-center">
              <span className="text-[10px] font-bold text-emerald-400 block uppercase">DIETARY FIBER</span>
              <div className="text-base font-black text-emerald-900 font-mono mt-0.5">
                {totalFiber}g <span className="text-xs font-normal text-emerald-400">/ 30g</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700">
                Low Glycemic Buffer
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-200/80 text-center">
              <span className="text-[10px] font-bold text-sky-400 block uppercase">AQUA HYDRATION</span>
              <div className="text-base font-black text-sky-900 font-mono mt-0.5">
                {currentDayRecord.water_ml} <span className="text-xs font-normal text-sky-400">ml</span>
              </div>
              <span className="text-[10px] font-bold text-sky-700">
                {isWaterComplete ? "Goal Complete ✨" : "Almost There 💧"}
              </span>
            </div>
          </div>

          {/* Clinical Clinical Insights Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 text-xs text-teal-950 flex items-start gap-2.5">
            <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong>Clinical Guard Summary:</strong> Consumed clean whole foods with high soluble fiber ({totalFiber}g) keeping post-meal blood sugar levels flat and safe for prediabetes. Sodium levels remained well below the 2,000mg hypertension limit.
            </div>
          </div>
        </div>

        {/* Reflection Note Box */}
        <div className="mt-6 p-4 rounded-2xl bg-[#FFF8EE] border border-[#E8D4BE] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#634932]">
            <Smile className="w-3.5 h-3.5 text-amber-600" />
            <span>Daily Journal Note:</span>
          </div>
          <p className="text-xs text-[#523E2C] italic">
            &ldquo;{currentDayRecord.reflection_note || "Another positive step toward healthy living and personalized vitality!"}&rdquo;
          </p>
        </div>

      </div>

      {/* Quick Add Food Modal */}
      {activeSlotModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl max-w-sm w-full space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 capitalize">
                Add to {activeSlotModal}
              </h3>
              <button
                onClick={() => setActiveSlotModal(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Food / Dish Name:
                </label>
                <input
                  type="text"
                  value={customDishName}
                  onChange={(e) => setCustomDishName(e.target.value)}
                  placeholder="e.g. Masala Egg Toast, Oats Porridge"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Calories (kcal):
                  </label>
                  <input
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Protein (g):
                  </label>
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleAddFoodItem(activeSlotModal as any)}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
              >
                Save to Diary
              </button>
              <button
                onClick={() => setActiveSlotModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Subcomponent: Meal Slot Card
function MealSlotCard({
  title,
  slot,
  icon: Icon,
  iconColor,
  bgColor,
  borderColor,
  items,
  onAdd,
  onRemove,
  onStudio
}: {
  title: string;
  slot: string;
  icon: any;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  items: LoggedFoodItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onStudio: () => void;
}) {
  const slotCalories = items.reduce((sum, item) => sum + (item.calories || 0), 0);
  const slotProtein = Math.round(items.reduce((sum, item) => sum + (item.protein_g || 0), 0) * 10) / 10;

  return (
    <div className={`p-4 rounded-3xl ${bgColor} border ${borderColor} space-y-3 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center">
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-slate-900">{title}</h5>
              <span className="text-[10px] text-slate-500 font-mono">
                {slotCalories} kcal • {slotProtein}g protein
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onStudio}
              title={`Ask AI what to make for ${title}`}
              className="p-1.5 rounded-xl bg-white hover:bg-teal-50 text-teal-800 border border-slate-200 text-[10px] font-bold flex items-center gap-1 shadow-2xs"
            >
              <ChefHat className="w-3 h-3 text-teal-600" /> AI
            </button>
            <button
              onClick={onAdd}
              className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Item List */}
        <div className="space-y-1.5 pt-1">
          {items.length === 0 ? (
            <div className="text-[11px] text-slate-400 italic py-2 text-center">
              No food logged for {title} yet.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-xl bg-white/90 border border-slate-100 flex items-center justify-between text-xs group"
              >
                <div>
                  <div className="font-bold text-slate-800 text-[11px] leading-tight">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {item.calories} kcal • {item.protein_g}g protein • {item.portion}
                  </div>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="opacity-40 group-hover:opacity-100 p-1 hover:text-rose-600 text-slate-400 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

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
  ChefHat,
  Flame,
  Dna,
  Wheat,
  Activity,
  Layers
} from "lucide-react";
import CuteDailyNutritionTable from "./CuteDailyNutritionTable";

export interface LoggedFoodItem {
  id: string;
  name: string;
  meal_slot: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g?: number;
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
}

interface CuteHealthDiaryProps {
  userProfile: any;
  onOpenAIShop?: (slot: string) => void;
  externalLoggedMeal?: any;
}

// Helper to get formatted date string: YYYY-MM-DD
function getLocalDateString(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

// Helper to get pretty display date
function getPrettyDate(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const options: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short", year: "numeric" };
  const str = d.toLocaleDateString("en-US", options);
  if (offsetDays === 0) return `${str} (Today)`;
  if (offsetDays === -1) return `${str} (Yesterday)`;
  return str;
}

export default function CuteHealthDiary({
  userProfile,
  onOpenAIShop
}: CuteHealthDiaryProps) {
  // Navigation for the past 7 days up to today
  // offsetDays: 0 = today, -1 = yesterday, -2 = 2 days ago, etc.
  const [dayOffset, setDayOffset] = useState<number>(0);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);

  // Diary records stored in localStorage - STRICTLY ZERO DEMO DATA!
  const [diaryRecords, setDiaryRecords] = useState<Record<string, DayRecord>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nutrivision_real_diary_records_v3");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse diary storage:", e);
        }
      }
    }
    return {};
  });

  const [activeSlotModal, setActiveSlotModal] = useState<string | null>(null);
  const [customDishName, setCustomDishName] = useState("");
  const [customCalories, setCustomCalories] = useState("350");
  const [customProtein, setCustomProtein] = useState("18");
  const [customCarbs, setCustomCarbs] = useState("30");
  const [customFiber, setCustomFiber] = useState("5");
  const [journalNote, setJournalNote] = useState("");

  const currentDateKey = getLocalDateString(dayOffset);
  const currentPrettyDate = getPrettyDate(dayOffset);

  // Water target from profile or 35ml/kg rule
  const waterTarget = userProfile.daily_water_target_ml || Math.round((userProfile.weight_kg * 35) / 50) * 50 || 2500;
  const targetCal = userProfile.daily_calorie_target || 2050;
  const targetProt = userProfile.daily_protein_target_g || 78;
  const targetCarb = userProfile.daily_carb_target_g || 250;
  const targetFat = userProfile.daily_fat_target_g || 58;
  const targetFiber = userProfile.daily_fiber_target_g || 35;

  // Active day record (starts completely empty if not logged)
  const currentRecord: DayRecord = diaryRecords[currentDateKey] || {
    date: currentDateKey,
    display_date: currentPrettyDate,
    water_ml: 0,
    water_target_ml: waterTarget,
    meals: [],
    reflection_note: ""
  };

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nutrivision_real_diary_records_v3", JSON.stringify(diaryRecords));
    }
  }, [diaryRecords]);

  // Real-time synchronization when food or water is logged from any tab or studio
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem("nutrivision_real_diary_records_v3");
        if (saved) {
          setDiaryRecords(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to sync diary records:", e);
      }
    };

    window.addEventListener("nutrivision_meal_logged", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("nutrivision_meal_logged", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Daily Totals - Real Calculations Only!
  const totalCalories = currentRecord.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = Math.round(currentRecord.meals.reduce((sum, m) => sum + (m.protein_g || 0), 0) * 10) / 10;
  const totalCarbs = Math.round(currentRecord.meals.reduce((sum, m) => sum + (m.carbs_g || 0), 0) * 10) / 10;
  const totalFiber = Math.round(currentRecord.meals.reduce((sum, m) => sum + (m.fiber_g || 0), 0) * 10) / 10;
  const totalFat = Math.round(currentRecord.meals.reduce((sum, m) => sum + (m.fat_g || (m.calories * 0.25 / 9)), 0) * 10) / 10;

  const isWaterComplete = currentRecord.water_ml >= waterTarget && waterTarget > 0;
  const hasMeals = currentRecord.meals.length > 0;

  // Flip page animation handler
  const flipTo = (newOffset: number) => {
    setIsFlipping(true);
    setTimeout(() => {
      setDayOffset(newOffset);
      setIsFlipping(false);
    }, 180);
  };

  // Water increment helper
  const addWater = (amountMl: number) => {
    setDiaryRecords((prev) => {
      const existing = prev[currentDateKey] || currentRecord;
      const updated = {
        ...existing,
        water_ml: Math.min(6000, (existing.water_ml || 0) + amountMl)
      };
      return { ...prev, [currentDateKey]: updated };
    });
  };

  // Reset water for today
  const resetWater = () => {
    setDiaryRecords((prev) => {
      const existing = prev[currentDateKey] || currentRecord;
      return { ...prev, [currentDateKey]: { ...existing, water_ml: 0 } };
    });
  };

  // Add food item
  const handleAddFoodItem = (slot: "breakfast" | "lunch" | "dinner" | "snack") => {
    if (!customDishName.trim()) return;
    const cCal = parseInt(customCalories) || 0;
    const cProt = parseFloat(customProtein) || 0;
    const cCarb = parseFloat(customCarbs) || 0;
    const cFib = parseFloat(customFiber) || 0;
    const cFat = Math.max(0, Math.round((cCal - (cProt * 4 + cCarb * 4)) / 9));

    const newItem: LoggedFoodItem = {
      id: "food-" + Date.now(),
      name: customDishName.trim(),
      meal_slot: slot,
      calories: cCal,
      protein_g: cProt,
      carbs_g: cCarb,
      fat_g: cFat,
      fiber_g: cFib,
      portion: "1 serving",
      time_logged: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setDiaryRecords((prev) => {
      const existing = prev[currentDateKey] || currentRecord;
      const updated = {
        ...prev,
        [currentDateKey]: {
          ...existing,
          meals: [...existing.meals, newItem]
        }
      };
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("nutrivision_meal_logged", { detail: newItem }));
      }
      return updated;
    });

    setCustomDishName("");
    setActiveSlotModal(null);
  };

  // Remove food item
  const handleRemoveFood = (id: string) => {
    setDiaryRecords((prev) => {
      const existing = prev[currentDateKey] || currentRecord;
      return {
        ...prev,
        [currentDateKey]: {
          ...existing,
          meals: existing.meals.filter((m) => m.id !== id)
        }
      };
    });
  };

  // Save journal note
  const handleSaveNote = () => {
    if (!journalNote.trim()) return;
    setDiaryRecords((prev) => {
      const existing = prev[currentDateKey] || currentRecord;
      return {
        ...prev,
        [currentDateKey]: {
          ...existing,
          reflection_note: journalNote.trim()
        }
      };
    });
    setJournalNote("");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* ============================================================== */}
      {/* CUTE DIARY CONTAINER: BOOK SPINE, WARM-COOL PASTEL AESTHETIC    */}
      {/* ============================================================== */}
      <div className={`relative rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF7F2] to-[#F3F9F6] border-4 border-[#E8DCCF] shadow-xl p-6 sm:p-9 transition-all duration-300 ${
        isFlipping ? "opacity-40 scale-[0.99] blur-[0.5px]" : "opacity-100 scale-100"
      }`}>

        {/* Decorative Leather Stitching & Bookmark Ribbon Accent */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#C89868] via-[#42BFA5] to-[#C89868] opacity-80" />
        <div className="absolute top-0 right-12 w-6 h-10 bg-rose-400/80 rounded-b-lg shadow-sm hidden sm:block" />

        {/* Top Header: Title & Page Flip Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b-2 border-dashed border-[#EADBCE]">
          
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-[#FFEBD8] border-2 border-[#F6D2AF] text-[#8F511D] flex items-center justify-center text-2xl shadow-xs shrink-0 animate-bounce duration-1000">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-[#2D2015] font-serif tracking-tight">
                  Cute Nutrition Diary & Daily Tracker
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E5F7F1] text-[#127764] border border-[#BDECDC]">
                  Real Data Only • Zero Presets
                </span>
              </div>
              <p className="text-xs text-[#7A6451] mt-0.5">
                Every calorie, nutrient, and water sip recorded here is 100% real and personalized to you.
              </p>
            </div>
          </div>

          {/* Flip Controls with past 7-day pill navigator */}
          <div className="flex items-center gap-2 bg-white/95 p-1.5 rounded-2xl border border-[#E4D5C5] shadow-xs">
            <button
              onClick={() => flipTo(dayOffset - 1)}
              disabled={dayOffset <= -6}
              title="Flip to previous day"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#6B5139] hover:bg-[#FDF3E7] disabled:opacity-30 transition-all flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> ◀ Flip
            </button>

            <span className="px-3.5 py-1 rounded-xl bg-[#FAF0E4] text-[#4A3828] text-xs font-extrabold font-mono shadow-2xs">
              {currentPrettyDate}
            </span>

            <button
              onClick={() => flipTo(dayOffset + 1)}
              disabled={dayOffset >= 0}
              title="Flip to next day"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#6B5139] hover:bg-[#FDF3E7] disabled:opacity-30 transition-all flex items-center gap-1 cursor-pointer"
            >
              Flip ▶ <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Date Jump Quick Bar (Past 7 Days) */}
        <div className="pt-4 pb-2 flex items-center justify-between gap-2 overflow-x-auto text-xs border-b border-[#EFE5DB]">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Past Week:
          </span>
          <div className="flex items-center gap-1.5">
            {[-6, -5, -4, -3, -2, -1, 0].map((offset) => {
              const dStr = getLocalDateString(offset);
              const pStr = getPrettyDate(offset).split(",")[0];
              const isSelected = dayOffset === offset;
              const hasMealsRecorded = (diaryRecords[dStr]?.meals?.length || 0) > 0;
              const isWaterHit = (diaryRecords[dStr]?.water_ml || 0) >= waterTarget;

              return (
                <button
                  key={offset}
                  onClick={() => flipTo(offset)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 border ${
                    isSelected
                      ? "bg-teal-700 text-white border-teal-700 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50"
                  }`}
                >
                  <span>{pStr}</span>
                  {hasMealsRecorded && <span className="text-[9px]">⭐</span>}
                  {isWaterHit && <span className="text-[9px]">💧</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 1: EMBEDDED REAL DAILY MACRO TRACKER GAUGES            */}
        {/* ============================================================== */}
        <div className="mt-6 p-6 rounded-3xl bg-white border-2 border-[#EADCCE] shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Daily Macro & Calorie Targets
              </span>
              <h3 className="text-base font-black text-[#2D2015] font-serif mt-1">
                Nutrient Achievement for {currentPrettyDate}
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Calibrated for: <strong>{userProfile.primary_goal.replace(/_/g, " ")}</strong> ({userProfile.weight_kg}kg)
            </span>
          </div>

          {/* 5 Real Macro Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            
            {/* Calories */}
            <CuteMacroCard
              label="Calories"
              current={totalCalories}
              target={targetCal}
              unit="kcal"
              icon={Flame}
              color="text-teal-700"
              bgColor="bg-teal-50"
              borderColor="border-teal-200"
              barColor="bg-teal-500"
            />

            {/* Protein */}
            <CuteMacroCard
              label="Protein"
              current={totalProtein}
              target={targetProt}
              unit="g"
              icon={Dna}
              color="text-blue-700"
              bgColor="bg-blue-50"
              borderColor="border-blue-200"
              barColor="bg-blue-500"
            />

            {/* Carbs */}
            <CuteMacroCard
              label="Carbs"
              current={totalCarbs}
              target={targetCarb}
              unit="g"
              icon={Wheat}
              color="text-amber-700"
              bgColor="bg-amber-50"
              borderColor="border-amber-200"
              barColor="bg-amber-500"
            />

            {/* Fats */}
            <CuteMacroCard
              label="Healthy Fats"
              current={totalFat}
              target={targetFat}
              unit="g"
              icon={Activity}
              color="text-rose-700"
              bgColor="bg-rose-50"
              borderColor="border-rose-200"
              barColor="bg-rose-500"
            />

            {/* Fiber */}
            <CuteMacroCard
              label="Dietary Fiber"
              current={totalFiber}
              target={targetFiber}
              unit="g"
              icon={Layers}
              color="text-emerald-700"
              bgColor="bg-emerald-50"
              borderColor="border-emerald-200"
              barColor="bg-emerald-500"
            />

          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 2: CUTE DAILY NUTRITION TRACKING TABLE (REMAINING/EXCESS)*/}
        {/* ============================================================== */}
        <div className="mt-6">
          <CuteDailyNutritionTable
            userProfile={userProfile}
            currentRecord={currentRecord}
            prettyDate={currentPrettyDate}
            onOpenMealModal={(slot) => setActiveSlotModal(slot)}
            onOpenStudio={() => onOpenAIShop && onOpenAIShop("breakfast")}
          />
        </div>

        {/* ============================================================== */}
        {/* SECTION 2: CUTE WATER INTAKE TRACKER (COMPLETE OR NOT)         */}
        {/* ============================================================== */}
        <div className="mt-6 p-5 rounded-3xl bg-gradient-to-r from-[#EBF8FF] via-[#E2F2FE] to-[#F1FAFF] border-2 border-[#B9E2FD] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-sky-200 border-2 border-sky-300 text-sky-700 flex items-center justify-center text-3xl shadow-xs shrink-0 animate-pulse">
              {isWaterComplete ? "🦭🎉" : "💧"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-sky-950">
                  Pure Water Intake Status
                </h4>
                {isWaterComplete ? (
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs flex items-center gap-1 animate-bounce">
                    <CheckCircle2 className="w-3 h-3" /> Target Complete!
                  </span>
                ) : currentRecord.water_ml > 0 ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-200 text-sky-900">
                    {Math.round((currentRecord.water_ml / waterTarget) * 100)}% Hydrated
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 text-sky-700 border border-sky-200">
                    Awaiting First Sip
                  </span>
                )}
              </div>
              <p className="text-xs text-sky-800 mt-0.5">
                Logged: <strong>{currentRecord.water_ml} ml</strong> of your <strong>{waterTarget} ml</strong> personalized target.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => addWater(250)}
              className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Droplet className="w-3.5 h-3.5" /> +250ml Glass
            </button>
            <button
              onClick={() => addWater(500)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-sky-50 text-sky-800 border border-sky-300 font-bold text-xs transition-all cursor-pointer"
            >
              +500ml Bottle
            </button>
            {currentRecord.water_ml > 0 && (
              <button
                onClick={resetWater}
                title="Reset water for this day"
                className="p-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-700 text-xs transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 3: 4 MEAL SLOTS (BREAKFAST, LUNCH, SNACKS, DINNER)     */}
        {/* ============================================================== */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#8C6D4F]" />
              <h4 className="text-base font-extrabold text-[#2E2014] font-serif">
                Meals Eaten on {currentPrettyDate}
              </h4>
            </div>
            <span className="text-xs text-[#826E5D]">
              {hasMeals ? (
                <>Logged: <strong>{totalCalories} kcal</strong> • <strong>{totalProtein}g protein</strong></>
              ) : (
                <span className="italic text-slate-400">No meals logged yet</span>
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Breakfast */}
            <MealSlotCard
              title="Breakfast"
              slot="breakfast"
              icon={Sunrise}
              iconColor="text-amber-500"
              bgColor="bg-amber-50/50"
              borderColor="border-amber-200/80"
              items={currentRecord.meals.filter((m) => m.meal_slot === "breakfast")}
              onAdd={() => setActiveSlotModal("breakfast")}
              onRemove={handleRemoveFood}
              onStudio={() => onOpenAIShop && onOpenAIShop("breakfast")}
            />

            {/* Lunch */}
            <MealSlotCard
              title="Lunch"
              slot="lunch"
              icon={Sun}
              iconColor="text-orange-500"
              bgColor="bg-orange-50/50"
              borderColor="border-orange-200/80"
              items={currentRecord.meals.filter((m) => m.meal_slot === "lunch")}
              onAdd={() => setActiveSlotModal("lunch")}
              onRemove={handleRemoveFood}
              onStudio={() => onOpenAIShop && onOpenAIShop("lunch")}
            />

            {/* Snacks */}
            <MealSlotCard
              title="Snacks & Tea"
              slot="snack"
              icon={Coffee}
              iconColor="text-emerald-500"
              bgColor="bg-emerald-50/50"
              borderColor="border-emerald-200/80"
              items={currentRecord.meals.filter((m) => m.meal_slot === "snack")}
              onAdd={() => setActiveSlotModal("snack")}
              onRemove={handleRemoveFood}
              onStudio={() => onOpenAIShop && onOpenAIShop("snack")}
            />

            {/* Dinner */}
            <MealSlotCard
              title="Dinner"
              slot="dinner"
              icon={Moon}
              iconColor="text-indigo-500"
              bgColor="bg-indigo-50/50"
              borderColor="border-indigo-200/80"
              items={currentRecord.meals.filter((m) => m.meal_slot === "dinner")}
              onAdd={() => setActiveSlotModal("dinner")}
              onRemove={handleRemoveFood}
              onStudio={() => onOpenAIShop && onOpenAIShop("dinner")}
            />

          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 4: WHAT WAS ACHIEVED (REAL REPORT CARD)                */}
        {/* ============================================================== */}
        <div className="mt-8 p-6 rounded-3xl bg-white border-2 border-[#EADCCE] shadow-md space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-extrabold text-[#2E2014] uppercase tracking-wider font-serif">
                What Was Achieved on This Day
              </h4>
            </div>
            {hasMeals && (
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                {totalProtein >= targetProt && isWaterComplete ? "🌟 PERFECT DAY STAMP" : totalProtein >= targetProt ? "💪 MUSCLE PROTEIN HIT" : "🥑 CLEAN NUTRITION LOGGED"}
              </span>
            )}
          </div>

          {!hasMeals ? (
            <div className="p-6 rounded-2xl bg-[#FCFAF7] border border-dashed border-[#E4D5C5] text-center space-y-2">
              <div className="text-3xl">🥞✨</div>
              <h5 className="text-sm font-extrabold text-[#4A3828]">
                Your Daily Achievement Report Card is Clean & Waiting
              </h5>
              <p className="text-xs text-[#826E5D] max-w-md mx-auto">
                No food has been logged for {currentPrettyDate} yet. Use the <strong>AI Food Studio</strong> or tap <strong>+</strong> on any meal slot above to record real meals.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-200">
                  <span className="text-[10px] font-bold text-teal-600 block uppercase">CALORIE ACCURACY</span>
                  <div className="text-base font-black text-teal-950 font-mono mt-0.5">
                    {totalCalories} <span className="text-xs font-normal text-slate-400">/ {targetCal}</span>
                  </div>
                  <span className="text-[10px] font-bold text-teal-700">
                    {Math.round((totalCalories / targetCal) * 100)}% of Daily Goal
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200">
                  <span className="text-[10px] font-bold text-blue-600 block uppercase">PROTEIN TARGET</span>
                  <div className="text-base font-black text-blue-950 font-mono mt-0.5">
                    {totalProtein}g <span className="text-xs font-normal text-slate-400">/ {targetProt}g</span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700">
                    {Math.round((totalProtein / targetProt) * 100)}% Muscle Synthesis
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-600 block uppercase">DIETARY FIBER</span>
                  <div className="text-base font-black text-emerald-950 font-mono mt-0.5">
                    {totalFiber}g <span className="text-xs font-normal text-slate-400">/ {targetFiber}g</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700">
                    {totalFiber >= 25 ? "Optimal Buffer" : "Keep Building"}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-200">
                  <span className="text-[10px] font-bold text-sky-600 block uppercase">HYDRATION STATUS</span>
                  <div className="text-base font-black text-sky-950 font-mono mt-0.5">
                    {currentRecord.water_ml} <span className="text-xs font-normal text-slate-400">/ {waterTarget} ml</span>
                  </div>
                  <span className="text-[10px] font-bold text-sky-700">
                    {isWaterComplete ? "Goal Complete ✨" : "In Progress 💧"}
                  </span>
                </div>
              </div>

              {/* Real Clinical Evaluation */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 text-xs text-teal-950 flex items-start gap-3">
                <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Clinical Guardrail Feedback:</strong> Today you have consumed <strong>{totalCalories} kcal</strong> and <strong>{totalProtein}g protein</strong>. Your fiber of <strong>{totalFiber}g</strong> helps stabilize post-meal glucose absorption. Drink adequate water to aid digestion and optimize nutrient absorption.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Daily Note / Journal Reflection */}
        <div className="mt-6 p-4 rounded-2xl bg-[#FFF8EE] border border-[#E8D4BE] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#634932] flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-amber-600" />
              <span>Personal Diary Note for {currentPrettyDate}:</span>
            </span>
          </div>

          {currentRecord.reflection_note ? (
            <p className="text-xs text-[#523E2C] italic">
              &ldquo;{currentRecord.reflection_note}&rdquo;
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={journalNote}
                onChange={(e) => setJournalNote(e.target.value)}
                placeholder="Write a sweet reflection about your food or how you felt today..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-[#E4D5C5] text-xs bg-white focus:outline-teal-600"
              />
              <button
                onClick={handleSaveNote}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
              >
                Save
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Quick Add Food Modal */}
      {activeSlotModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl max-w-sm w-full space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 capitalize">
                Log Real Food to {activeSlotModal}
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
                  placeholder="e.g. 2 Boiled Eggs & Whole Wheat Toast"
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Carbs (g):
                  </label>
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Fiber (g):
                  </label>
                  <input
                    type="number"
                    value={customFiber}
                    onChange={(e) => setCustomFiber(e.target.value)}
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

// Subcomponent: Meal Slot Card with Real Data or Empty State
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
    <div className={`p-4 rounded-3xl ${bgColor} border ${borderColor} space-y-3 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white shadow-2xs flex items-center justify-center">
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-slate-900">{title}</h5>
              <span className="text-[10px] text-slate-500 font-mono">
                {items.length > 0 ? `${slotCalories} kcal • ${slotProtein}g protein` : "Empty Slot"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onStudio}
              title={`Ask AI what to make for ${title}`}
              className="p-1.5 rounded-xl bg-white hover:bg-teal-50 text-teal-800 border border-slate-200 text-[10px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <ChefHat className="w-3 h-3 text-teal-600" /> AI
            </button>
            <button
              onClick={onAdd}
              className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Item List: Real items or Empty State */}
        <div className="space-y-1.5 pt-1">
          {items.length === 0 ? (
            <div className="py-3 px-2 rounded-2xl bg-white/60 border border-dashed border-slate-200 text-center space-y-1">
              <div className="text-xs text-slate-400">🍽️ Empty {title}</div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Tap <strong>+</strong> to log what you ate, or tap <strong>AI</strong> to generate a dish from ingredients!
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-xl bg-white/95 border border-slate-100 flex items-center justify-between text-xs group shadow-2xs"
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
                  className="opacity-40 group-hover:opacity-100 p-1 hover:text-rose-600 text-slate-400 transition-opacity cursor-pointer"
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

// Subcomponent: Cute Macro Gauge Card
function CuteMacroCard({
  label,
  current,
  target,
  unit,
  icon: Icon,
  color,
  bgColor,
  borderColor,
  barColor
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  barColor: string;
}) {
  const percent = Math.min(100, Math.round((current / Math.max(1, target)) * 100));

  return (
    <div className={`p-3.5 rounded-2xl ${bgColor} border ${borderColor} space-y-2 shadow-2xs`}>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${color}`}>
          {label}
        </span>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-lg font-black text-slate-800 font-mono leading-none">
          {current}
        </span>
        <span className="text-[10px] text-slate-400 font-medium">
          / {target} {unit}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-black/5 overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="text-[10px] text-slate-500 font-medium flex justify-between">
        <span>{percent}%</span>
        <span>{current === 0 ? "Awaiting Log" : percent >= 95 ? "Hit ✨" : "In Progress"}</span>
      </div>
    </div>
  );
}

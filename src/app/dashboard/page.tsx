"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Camera,
  ChefHat,
  Search,
  Plus,
  Flame,
  Sparkles,
  Calendar,
  AlertCircle,
  Trash2,
  ArrowRight,
  TrendingUp,
  Leaf
} from "lucide-react";
import { ApiClient } from "@/lib/api";
import MacroGauge from "@/components/MacroGauge";
import FoodImage from "@/components/FoodImage";
import SuitabilityBadge from "@/components/SuitabilityBadge";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [pantryRecs, setPantryRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [userData, summaryData, mealsData] = await Promise.all([
        ApiClient.getMe(),
        ApiClient.getDailySummary(todayStr),
        ApiClient.getMealsForDate(todayStr),
      ]);
      setUser(userData);
      setSummary(summaryData);
      setMeals(mealsData);

      // Load available-food recommendations
      ApiClient.recommendAvailableMeals([])
        .then((res) => {
          setPantryRecs(res.tier1_best_available.slice(0, 2));
        })
        .catch(() => {});
    } catch {
      // Auto fallback to demo user if not logged in
      try {
        const demoRes = await ApiClient.demoLogin();
        setUser(demoRes.user);
        const [summaryData, mealsData] = await Promise.all([
          ApiClient.getDailySummary(todayStr),
          ApiClient.getMealsForDate(todayStr),
        ]);
        setSummary(summaryData);
        setMeals(mealsData);
        const recs = await ApiClient.recommendAvailableMeals([]);
        setPantryRecs(recs.tier1_best_available.slice(0, 2));
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async (mealId: number) => {
    try {
      await ApiClient.deleteMeal(mealId);
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || "Failed to remove meal.");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#20312F] tracking-tight">
            {getGreeting()}, {user?.full_name?.split(" ")[0] || "Aarav"}
          </h1>
          <p className="text-sm text-[#5A6D6B] mt-1">
            Goal: <strong className="text-[#177E75] capitalize">{user?.profile?.primary_goal?.replace(/_/g, " ") || "Balanced Diet"}</strong> •{" "}
            <span>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.is_demo && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E9F8F3] text-[#177E75] border border-[#42BFA5]/30">
              Demo Mode Active
            </span>
          )}
          <Link
            href="/assistant"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E2ECEB] text-xs font-bold text-[#177E75] hover:bg-[#F7FAFC] card-shadow"
          >
            <Sparkles className="w-4 h-4 text-[#42BFA5]" />
            <span>Ask Coach</span>
          </Link>
        </div>
      </div>

      {/* Primary Action Card: "What's on your plate?" */}
      <div className="bg-gradient-to-r from-[#42BFA5] via-[#2ba98e] to-[#177E75] rounded-3xl p-6 sm:p-8 text-white card-shadow relative overflow-hidden">
        <div className="max-w-xl space-y-3 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E9F8F3]">
            Instant Food Analysis
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            What’s on your plate today?
          </h2>
          <p className="text-sm sm:text-base text-[#F0FBFA] leading-relaxed">
            Scan your thali or home-cooked meal for instant nutrient breakdown, or tell us what ingredients you have in the kitchen.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/scan"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#177E75] font-bold text-sm shadow hover:bg-[#F0FBFA] transition-all card-shadow-hover"
            >
              <Camera className="w-4 h-4 text-[#42BFA5]" />
              <span>Scan Food</span>
            </Link>
            <Link
              href="/foods"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#177E75]/40 backdrop-blur-md border border-white/30 text-white font-bold text-sm hover:bg-[#177E75]/60 transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Enter Manually</span>
            </Link>
            <Link
              href="/available-food"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-sm hover:bg-white/30 transition-all"
            >
              <ChefHat className="w-4 h-4" />
              <span>Use Kitchen Ingredients</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Daily Nutrition Summary (ICMR-NIN Targets) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#20312F]">Today’s Nutrition Summary</h2>
          <span className="text-xs font-medium text-[#8E9F9D]">
            ICMR-NIN 2024 Reference
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          <MacroGauge
            label="Calories"
            current={summary?.logged_calories || 0}
            target={summary?.targets?.calories || 2000}
            unit="kcal"
            colorHex="#177E75"
            bgHex="#E9F8F3"
          />
          <MacroGauge
            label="Protein"
            current={summary?.logged_protein || 0}
            target={summary?.targets?.protein || 65}
            unit="g"
            colorHex="#42BFA5"
            bgHex="#E9F8F3"
          />
          <MacroGauge
            label="Carbohydrates"
            current={summary?.logged_carbs || 0}
            target={summary?.targets?.carbs || 260}
            unit="g"
            colorHex="#377BC4"
            bgHex="#EDF5FF"
          />
          <MacroGauge
            label="Fats"
            current={summary?.logged_fat || 0}
            target={summary?.targets?.fat || 60}
            unit="g"
            colorHex="#B87921"
            bgHex="#FFF5E5"
          />
          <MacroGauge
            label="Fiber"
            current={summary?.logged_fiber || 0}
            target={summary?.targets?.fiber || 30}
            unit="g"
            colorHex="#218C68"
            bgHex="#E8F7EF"
          />
        </div>
      </div>

      {/* Grid: Logged Meals & Available Food Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Today's Logged Meals */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#20312F]">Today’s Logged Meals</h2>
            <Link href="/foods" className="text-xs font-bold text-[#177E75] hover:underline flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Food</span>
            </Link>
          </div>

          {meals.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-[#E2ECEB] text-center space-y-3 card-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#E9F8F3] text-[#177E75] mx-auto flex items-center justify-center">
                <ChefHat className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#20312F]">No meals logged yet today</h3>
              <p className="text-xs text-[#5A6D6B] max-w-sm mx-auto">
                Scan your lunch or enter dishes manually to calculate your real nutrients and suitability scores.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  href="/scan"
                  className="px-4 py-2 rounded-xl bg-[#42BFA5] text-white font-bold text-xs hover:bg-[#38a892]"
                >
                  Scan a Meal
                </Link>
                <Link
                  href="/foods"
                  className="px-4 py-2 rounded-xl border border-[#E2ECEB] text-[#20312F] font-bold text-xs hover:bg-[#F7FAFC]"
                >
                  Manual Search
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2ECEB] card-shadow card-shadow-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <FoodImage
                      foodName={meal.items[0]?.food_name || meal.meal_type}
                      className="w-16 h-16 rounded-xl shrink-0"
                      aspectRatio="square"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#177E75] bg-[#E9F8F3] px-2 py-0.5 rounded-md">
                          {meal.meal_type}
                        </span>
                        <span className="text-xs text-[#8E9F9D]">
                          {meal.items.length} {meal.items.length === 1 ? "item" : "items"}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-[#20312F] mt-1 line-clamp-1">
                        {meal.items.map((it: any) => it.food_name).join(", ")}
                      </p>
                      <p className="text-xs text-[#5A6D6B] mt-0.5">
                        <strong className="text-[#20312F]">{meal.total_calories}</strong> kcal •{" "}
                        <span>{meal.total_protein}g P</span> •{" "}
                        <span>{meal.total_carbs}g C</span> •{" "}
                        <span>{meal.total_fiber}g Fiber</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <button
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="p-2 rounded-lg text-[#8E9F9D] hover:text-[#C94B53] hover:bg-[#FFF0F1] transition-colors"
                      title="Delete Meal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (5 cols): "What can I eat right now?" Spotlight */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#20312F]">Cook With What You Have</h2>
            <Link
              href="/available-food"
              className="text-xs font-bold text-[#177E75] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {pantryRecs.length > 0 ? (
              pantryRecs.map((rec) => (
                <div
                  key={rec.recipe_id}
                  className="p-4 rounded-2xl bg-white border border-[#E2ECEB] card-shadow space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <FoodImage
                      foodName={rec.name}
                      className="w-14 h-14 rounded-xl shrink-0"
                      aspectRatio="square"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <SuitabilityBadge status="optimal" label={rec.suitability_badge} />
                      </div>
                      <h4 className="font-bold text-sm text-[#20312F] mt-1 truncate">{rec.name}</h4>
                      <p className="text-xs text-[#5A6D6B]">{rec.prep_time_minutes} min • {rec.calories_est} kcal • {rec.protein_est}g protein</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#5A6D6B] line-clamp-2 leading-relaxed bg-[#F7FAFC] p-2.5 rounded-xl border border-[#EDF3F3]">
                    {rec.explanation}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl bg-white border border-[#E2ECEB] card-shadow text-center space-y-2">
                <ChefHat className="w-8 h-8 text-[#42BFA5] mx-auto" />
                <p className="text-xs font-bold text-[#20312F]">Select Your Kitchen Staples</p>
                <p className="text-[11px] text-[#5A6D6B]">
                  Add items like rice, dal, and potatoes to see instant zero-grocery meals.
                </p>
                <Link
                  href="/available-food"
                  className="inline-block mt-2 px-3.5 py-2 rounded-xl bg-[#E9F8F3] text-[#177E75] font-bold text-xs"
                >
                  Set Available Ingredients
                </Link>
              </div>
            )}
          </div>

          {/* Daily Educational Insight */}
          <div className="p-4 rounded-2xl bg-[#EEF7FF] border border-[#377BC4]/20 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#377BC4]">
              <Sparkles className="w-4 h-4" />
              <span>ICMR-NIN Plate Principle</span>
            </div>
            <p className="text-xs text-[#20312F] leading-relaxed">
              Prioritize filling half your meal plate with leafy greens, seasonal vegetables, or fresh kachumber salad. This naturally boosts micronutrients and dietary fiber without caloric excess.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

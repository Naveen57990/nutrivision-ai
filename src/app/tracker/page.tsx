"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  TrendingUp,
  Flame,
  ChefHat,
  Leaf
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";
import { ApiClient } from "@/lib/api";
import FoodImage from "@/components/FoodImage";
import MacroGauge from "@/components/MacroGauge";

export default function TrackerPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [meals, setMeals] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [historyTrends, setHistoryTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrackerData();
  }, [selectedDate]);

  const loadTrackerData = async () => {
    setLoading(true);
    try {
      const [mealsData, summaryData, historyData] = await Promise.all([
        ApiClient.getMealsForDate(selectedDate),
        ApiClient.getDailySummary(selectedDate),
        ApiClient.getHistory(7),
      ]);
      setMeals(mealsData);
      setSummary(summaryData);
      setHistoryTrends(historyData.trends);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleDeleteMeal = async (mealId: number) => {
    if (!confirm("Are you sure you want to delete this logged meal?")) return;
    try {
      await ApiClient.deleteMeal(mealId);
      loadTrackerData();
    } catch (err: any) {
      alert(err.message || "Failed to delete meal.");
    }
  };

  const mealSlots = ["breakfast", "lunch", "dinner", "snack"];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#20312F] tracking-tight">
            Daily Meal Tracker & History
          </h1>
          <p className="text-sm text-[#5A6D6B] mt-1">
            Track your intake across Breakfast, Lunch, Dinner, and Snacks.
          </p>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-[#E2ECEB] card-shadow">
          <button
            onClick={handlePrevDay}
            className="p-2 hover:bg-[#F7FAFC] rounded-xl text-[#5A6D6B]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-2">
            <Calendar className="w-4 h-4 text-[#177E75]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold text-[#20312F] bg-transparent focus:outline-none"
            />
          </div>
          <button
            onClick={handleNextDay}
            className="p-2 hover:bg-[#F7FAFC] rounded-xl text-[#5A6D6B]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Daily Progress Gauges */}
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
          label="Carbs"
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

      {/* Meal Slots Timeline */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#20312F]">Meals for {selectedDate}</h2>

        <div className="space-y-4">
          {mealSlots.map((slot) => {
            const slotMeals = meals.filter((m) => m.meal_type.toLowerCase() === slot);
            const slotCalories = slotMeals.reduce((acc, m) => acc + m.total_calories, 0);

            return (
              <div
                key={slot}
                className="bg-white p-5 rounded-3xl border border-[#E2ECEB] card-shadow space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[#EDF3F3] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#42BFA5]" />
                    <h3 className="font-extrabold text-base text-[#20312F] capitalize">
                      {slot}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-[#177E75]">
                    {Math.round(slotCalories)} kcal
                  </span>
                </div>

                {slotMeals.length === 0 ? (
                  <p className="text-xs text-[#8E9F9D] py-2">No items logged for {slot}.</p>
                ) : (
                  <div className="space-y-2">
                    {slotMeals.map((meal) => (
                      <div
                        key={meal.id}
                        className="p-3.5 rounded-2xl bg-[#F7FAFC] border border-[#E2ECEB] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <FoodImage
                            foodName={meal.items[0]?.food_name || slot}
                            className="w-12 h-12 rounded-xl shrink-0"
                            aspectRatio="square"
                          />
                          <div>
                            <p className="text-xs font-bold text-[#20312F] line-clamp-1">
                              {meal.items.map((i: any) => `${i.food_name} (${i.weight_grams}g)`).join(", ")}
                            </p>
                            <p className="text-[11px] text-[#5A6D6B] mt-0.5">
                              {meal.total_calories} kcal • {meal.total_protein}g P • {meal.total_carbs}g C • {meal.total_fiber}g Fiber
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="p-1.5 text-[#8E9F9D] hover:text-[#C94B53] transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 7-Day Nutrition Trends Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2ECEB] card-shadow space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#20312F]">7-Day Caloric & Intake Trend</h2>
            <p className="text-xs text-[#5A6D6B]">Track consistency against your daily maintenance target.</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#177E75]">
            <TrendingUp className="w-4 h-4" />
            <span>Weekly Overview</span>
          </div>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF3F3" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8E9F9D" }} />
              <YAxis tick={{ fontSize: 11, fill: "#8E9F9D" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#E2ECEB",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="calories" name="Calories (kcal)" fill="#42BFA5" radius={[6, 6, 0, 0]} />
              <Bar dataKey="protein" name="Protein (g)" fill="#177E75" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

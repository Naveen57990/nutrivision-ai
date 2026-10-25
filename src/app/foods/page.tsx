"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Plus,
  Scale,
  X,
  CheckCircle2,
  AlertCircle,
  Leaf,
  Flame,
  ArrowRight
} from "lucide-react";
import { ApiClient } from "@/lib/api";
import FoodImage from "@/components/FoodImage";

export default function FoodsDatabasePage() {
  const router = useRouter();
  const [foods, setFoods] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [preference, setPreference] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Portion Modal
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [servingQty, setServingQty] = useState(1.0);
  const [customGrams, setCustomGrams] = useState(150.0);
  const [addedOil, setAddedOil] = useState(0.0);
  const [addedSugar, setAddedSugar] = useState(0.0);
  const [calculatedNutrients, setCalculatedNutrients] = useState<any>(null);
  const [mealType, setMealType] = useState("lunch");
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    ApiClient.getFoodCategories()
      .then((res) => setCategories(res.categories))
      .catch(() => {});

    loadFoods();
  }, [category, preference]);

  const loadFoods = async (searchQuery: string = query) => {
    setLoading(true);
    try {
      const data = await ApiClient.searchFoods(searchQuery, category, preference);
      setFoods(data);
    } catch (err: any) {
      alert(err.message || "Failed to search foods.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPortionModal = (food: any) => {
    setSelectedFood(food);
    setServingQty(1.0);
    setCustomGrams(food.default_serving_grams);
    setAddedOil(0.0);
    setAddedSugar(0.0);
    calculateNutrients(food, food.default_serving_grams, 0.0, 0.0);
  };

  const calculateNutrients = async (
    food: any,
    weight: number,
    oil: number,
    sugar: number
  ) => {
    try {
      const res = await ApiClient.calculatePortion({
        food_item_id: food.id,
        weight_grams: weight,
        added_oil_tsp: oil,
        added_sugar_tsp: sugar,
      });
      setCalculatedNutrients(res.nutrients);
    } catch {}
  };

  const handleServingChange = (qty: number) => {
    setServingQty(qty);
    if (selectedFood) {
      const newWeight = selectedFood.default_serving_grams * qty;
      setCustomGrams(newWeight);
      calculateNutrients(selectedFood, newWeight, addedOil, addedSugar);
    }
  };

  const handleCustomGramsChange = (grams: number) => {
    setCustomGrams(grams);
    if (selectedFood) {
      setServingQty(Number((grams / selectedFood.default_serving_grams).toFixed(1)));
      calculateNutrients(selectedFood, grams, addedOil, addedSugar);
    }
  };

  const handleLogMeal = async () => {
    if (!selectedFood) return;
    setLogging(true);
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      await ApiClient.logMeal({
        meal_type: mealType,
        date_str: todayStr,
        source_method: "manual",
        items: [
          {
            food_item_id: selectedFood.id,
            food_name: selectedFood.name,
            serving_quantity: servingQty,
            serving_unit: selectedFood.default_serving_name,
            weight_grams: customGrams,
          },
        ],
      });
      alert(`Logged ${selectedFood.name} to ${mealType}!`);
      setSelectedFood(null);
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message || "Failed to log meal.");
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#20312F] tracking-tight">
          Food Composition Database
        </h1>
        <p className="text-sm text-[#5A6D6B] mt-1">
          Search over 100+ authentic Indian foods, regional recipes, and staples backed by ICMR-NIN IFCT tables.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E2ECEB] card-shadow space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#8E9F9D] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                loadFoods(e.target.value);
              }}
              placeholder="Search by English, Hindi, or Tamil dish name (e.g. Idli, Dal Tadka, Roti, Curd)..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E2ECEB] text-sm focus:outline-none focus:ring-2 focus:ring-[#42BFA5] bg-[#F7FAFC]"
            />
          </div>
        </div>

        {/* Categories & Dietary Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#EDF3F3]">
          <span className="text-xs font-bold text-[#8E9F9D] uppercase mr-1">Categories:</span>
          <button
            onClick={() => setCategory("")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
              category === ""
                ? "bg-[#177E75] text-white"
                : "bg-[#F7FAFC] text-[#5A6D6B] hover:bg-[#E2ECEB]"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                category === cat
                  ? "bg-[#177E75] text-white"
                  : "bg-[#F7FAFC] text-[#5A6D6B] hover:bg-[#E2ECEB]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dietary Preferences Filter */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-[#8E9F9D] uppercase mr-1">Diet:</span>
          {["All", "Vegetarian", "Vegan", "Eggetarian"].map((d) => {
            const val = d === "All" ? "" : d.toLowerCase();
            return (
              <button
                key={d}
                onClick={() => setPreference(val)}
                className={`px-3 py-1 rounded-lg font-semibold ${
                  preference === val
                    ? "bg-[#42BFA5] text-white"
                    : "bg-[#F7FAFC] text-[#5A6D6B] hover:bg-[#E2ECEB]"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Food Grid */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E2ECEB]">
          <div className="w-8 h-8 border-4 border-[#E2ECEB] border-t-[#42BFA5] rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold text-[#5A6D6B]">Searching food records...</p>
        </div>
      ) : foods.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-[#E2ECEB]">
          <p className="text-sm font-bold text-[#20312F]">No dishes matched your search criteria.</p>
          <p className="text-xs text-[#8E9F9D] mt-1">Try searching for broader terms like "Rice", "Dal", or "Paneer".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {foods.map((food) => (
            <div
              key={food.id}
              className="bg-white p-5 rounded-3xl border border-[#E2ECEB] card-shadow card-shadow-hover flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FoodImage
                    foodName={food.name}
                    category={food.category}
                    className="w-14 h-14 rounded-xl shrink-0"
                    aspectRatio="square"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#177E75] bg-[#E9F8F3] px-2 py-0.5 rounded-md">
                      {food.category}
                    </span>
                    <h3 className="font-bold text-sm text-[#20312F] mt-1 truncate" title={food.name}>
                      {food.name}
                    </h3>
                    <p className="text-xs text-[#8E9F9D] truncate">{food.regional_names || food.alternate_names}</p>
                  </div>
                </div>

                {/* Macro summary per 100g */}
                <div className="grid grid-cols-4 gap-1.5 bg-[#F7FAFC] p-2 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-[9px] text-[#8E9F9D] uppercase block">Energy</span>
                    <span className="font-bold text-[#20312F]">{Math.round(food.calories_per_100g)}k</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#8E9F9D] uppercase block">Protein</span>
                    <span className="font-bold text-[#177E75]">{food.protein_per_100g}g</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#8E9F9D] uppercase block">Carbs</span>
                    <span className="font-bold text-[#20312F]">{food.carbs_per_100g}g</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#8E9F9D] uppercase block">Fiber</span>
                    <span className="font-bold text-[#218C68]">{food.fiber_per_100g}g</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#EDF3F3] flex items-center justify-between">
                <span className="text-[11px] text-[#8E9F9D]">
                  Basis: {food.default_serving_name}
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenPortionModal(food)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#E9F8F3] text-[#177E75] font-bold text-xs hover:bg-[#d5f2e8] transition-colors"
                >
                  Calculate & Log
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Portion Calculation & Logging Modal */}
      {selectedFood && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 card-shadow space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedFood(null)}
              className="absolute top-5 right-5 text-[#8E9F9D] hover:text-[#20312F] p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <FoodImage
                foodName={selectedFood.name}
                className="w-16 h-16 rounded-xl shrink-0"
                aspectRatio="square"
              />
              <div>
                <h3 className="font-bold text-base text-[#20312F]">{selectedFood.name}</h3>
                <p className="text-xs text-[#8E9F9D]">Standard Serving: {selectedFood.default_serving_name}</p>
              </div>
            </div>

            {/* Serving multipliers */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#5A6D6B] uppercase">Serving Multiplier</label>
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 1.0, 1.5, 2.0].map((multiplier) => (
                  <button
                    key={multiplier}
                    type="button"
                    onClick={() => handleServingChange(multiplier)}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      servingQty === multiplier
                        ? "border-[#42BFA5] bg-[#E9F8F3] text-[#177E75]"
                        : "border-[#E2ECEB] bg-[#F7FAFC] text-[#5A6D6B]"
                    }`}
                  >
                    {multiplier}x
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#8E9F9D]">Exact Weight:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={10}
                    max={1000}
                    value={customGrams}
                    onChange={(e) => handleCustomGramsChange(Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-[#E2ECEB] rounded-lg text-right font-bold text-[#20312F]"
                  />
                  <span className="text-[#8E9F9D]">grams</span>
                </div>
              </div>
            </div>

            {/* Meal Slot Selector */}
            <div>
              <label className="block text-xs font-bold text-[#5A6D6B] uppercase mb-1">Meal Category</label>
              <div className="grid grid-cols-4 gap-2">
                {["breakfast", "lunch", "dinner", "snack"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMealType(m)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize border ${
                      mealType === m
                        ? "border-[#177E75] bg-[#177E75] text-white"
                        : "border-[#E2ECEB] bg-[#F7FAFC] text-[#5A6D6B]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Calculated Nutrients */}
            {calculatedNutrients && (
              <div className="p-4 rounded-2xl bg-[#F7FAFC] border border-[#E2ECEB] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#20312F]">Estimated Nutrients</span>
                  <span className="text-base font-black text-[#177E75]">
                    {calculatedNutrients.calories} kcal
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-[#8E9F9D] block">Protein</span>
                    <strong className="text-[#20312F]">{calculatedNutrients.protein}g</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8E9F9D] block">Carbs</span>
                    <strong className="text-[#20312F]">{calculatedNutrients.carbs}g</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8E9F9D] block">Fats</span>
                    <strong className="text-[#20312F]">{calculatedNutrients.fat}g</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8E9F9D] block">Fiber</span>
                    <strong className="text-[#218C68]">{calculatedNutrients.fiber}g</strong>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogMeal}
              disabled={logging}
              className="w-full py-3.5 px-4 rounded-xl bg-[#177E75] text-white font-bold text-sm hover:bg-[#12645e] transition-colors card-shadow"
            >
              {logging ? "Logging..." : `Log to ${mealType.toUpperCase()}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

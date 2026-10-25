"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChefHat,
  Plus,
  X,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Search,
  Filter
} from "lucide-react";
import { ApiClient } from "@/lib/api";
import FoodImage from "@/components/FoodImage";
import SuitabilityBadge from "@/components/SuitabilityBadge";

export default function AvailableFoodPage() {
  const router = useRouter();
  const [pantryIngredients, setPantryIngredients] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [staples, setStaples] = useState<{ name: string; category: string }[]>([]);
  const [maxTime, setMaxTime] = useState<number | undefined>(undefined);
  const [mealType, setMealType] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    // Load staples and user's saved pantry
    ApiClient.getCommonIngredients()
      .then((res) => setStaples(res.staples))
      .catch(() => {});

    ApiClient.getPantry()
      .then((res) => {
        if (res.pantry && res.pantry.length > 0) {
          const names = res.pantry.map((p) => p.ingredient_name);
          setPantryIngredients(names);
          fetchRecommendations(names);
        } else {
          // Default initial set for easy exploration
          const initial = ["Rice", "Moong Dal", "Tomatoes", "Onions", "Potatoes"];
          setPantryIngredients(initial);
          fetchRecommendations(initial);
        }
      })
      .catch(() => {
        const initial = ["Rice", "Moong Dal", "Tomatoes", "Onions", "Potatoes"];
        setPantryIngredients(initial);
        fetchRecommendations(initial);
      });
  }, []);

  const fetchRecommendations = async (ingredients: string[]) => {
    if (ingredients.length === 0) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await ApiClient.recommendAvailableMeals(ingredients, maxTime, mealType);
      setResults(res);
    } catch (err: any) {
      alert(err.message || "Failed to find recipes.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!pantryIngredients.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...pantryIngredients, trimmed];
      setPantryIngredients(updated);
      setCustomInput("");
      fetchRecommendations(updated);
      ApiClient.addPantryItem(trimmed).catch(() => {});
    }
  };

  const handleRemoveIngredient = (name: string) => {
    const updated = pantryIngredients.filter((i) => i.toLowerCase() !== name.toLowerCase());
    setPantryIngredients(updated);
    fetchRecommendations(updated);
  };

  const handleLogRecipe = async (recipe: any) => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      await ApiClient.logMeal({
        meal_type: "lunch",
        date_str: todayStr,
        source_method: "available_pantry",
        notes: `Prepared from available pantry: ${recipe.name}`,
        items: [
          {
            food_name: recipe.name,
            serving_quantity: 1.0,
            serving_unit: "serving",
            weight_grams: 250.0,
          },
        ],
      });
      alert(`Logged "${recipe.name}" to today's meals!`);
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message || "Failed to log meal.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9F8F3] text-xs font-bold text-[#177E75] mb-2">
          <ChefHat className="w-4 h-4 text-[#42BFA5]" />
          <span>Available-Food-First Personalization</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#20312F] tracking-tight">
          What do you have at home?
        </h1>
        <p className="text-sm text-[#5A6D6B] mt-1 max-w-2xl">
          Add the ingredients sitting in your kitchen right now. We’ll rank what you can cook immediately without running to the store.
        </p>
      </div>

      {/* Ingredient Management Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2ECEB] card-shadow space-y-6">
        {/* Custom Input */}
        <div>
          <label className="block text-xs font-bold text-[#5A6D6B] uppercase mb-2">
            Add Fridge or Pantry Ingredients
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddIngredient(customInput);
                }
              }}
              placeholder="e.g. Eggs, Paneer, Spinach, Toor Dal, Atta..."
              className="flex-1 px-4 py-3 rounded-xl border border-[#E2ECEB] text-sm focus:outline-none focus:ring-2 focus:ring-[#42BFA5] bg-[#F7FAFC]"
            />
            <button
              type="button"
              onClick={() => handleAddIngredient(customInput)}
              className="px-5 py-3 rounded-xl bg-[#177E75] text-white font-bold text-sm hover:bg-[#12645e] transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Selected Pantry Chips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#20312F] uppercase">
              Current Available Ingredients ({pantryIngredients.length})
            </span>
            {pantryIngredients.length > 0 && (
              <button
                onClick={() => {
                  setPantryIngredients([]);
                  setResults(null);
                }}
                className="text-[11px] font-semibold text-[#C94B53] hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {pantryIngredients.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E9F8F3] text-[#177E75] border border-[#42BFA5]/30 text-xs font-bold"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(item)}
                  className="hover:text-[#C94B53] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Quick Tap Staple Pills */}
        <div className="pt-2 border-t border-[#EDF3F3]">
          <span className="text-xs font-semibold text-[#8E9F9D] block mb-2">
            Quick-add familiar kitchen staples:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {staples.map((s) => {
              const isAdded = pantryIngredients.some((i) => i.toLowerCase() === s.name.toLowerCase());
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => handleAddIngredient(s.name)}
                  disabled={isAdded}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isAdded
                      ? "bg-[#F7FAFC] text-[#98A5A4] border border-[#E2ECEB] cursor-not-allowed"
                      : "bg-[#F7FAFC] text-[#20312F] border border-[#E2ECEB] hover:border-[#42BFA5] hover:bg-[#E9F8F3]"
                  }`}
                >
                  + {s.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Filters */}
        <div className="pt-2 border-t border-[#EDF3F3] flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#5A6D6B]">Max Cooking Time:</span>
            {[
              { label: "Any", val: undefined },
              { label: "≤ 15 min", val: 15 },
              { label: "≤ 25 min", val: 25 },
              { label: "≤ 40 min", val: 40 },
            ].map((t) => (
              <button
                key={t.label}
                onClick={() => {
                  setMaxTime(t.val);
                  fetchRecommendations(pantryIngredients);
                }}
                className={`px-2.5 py-1 rounded-md font-semibold ${
                  maxTime === t.val
                    ? "bg-[#177E75] text-white"
                    : "bg-[#F7FAFC] text-[#5A6D6B] hover:bg-[#E2ECEB]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E2ECEB] card-shadow">
          <div className="w-10 h-10 border-4 border-[#E2ECEB] border-t-[#42BFA5] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-[#20312F]">Evaluating recipe combinations against your pantry...</p>
        </div>
      ) : results ? (
        <div className="space-y-8">
          {/* Overall Pantry Insight */}
          <div className="p-4 rounded-2xl bg-[#E9F8F3] border border-[#42BFA5]/30 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#177E75] shrink-0 mt-0.5" />
            <p className="text-xs text-[#177E75] font-semibold leading-relaxed">
              {results.overall_pantry_insight}
            </p>
          </div>

          {/* Tier 1: Best Available Options (100% at home) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#218C68]" />
              <h2 className="text-xl font-black text-[#20312F]">
                Best Available Options (100% Ready to Cook)
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E8F7EF] text-[#218C68]">
                {results.tier1_best_available.length} Meals
              </span>
            </div>

            {results.tier1_best_available.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-[#E2ECEB] text-center text-xs text-[#5A6D6B]">
                No 100% exact recipe match found with current items. Check Tier 2 below for meals requiring only 1 minor ingredient!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.tier1_best_available.map((meal: any) => (
                  <MealRecommendationCard
                    key={meal.recipe_id}
                    meal={meal}
                    onLog={() => handleLogRecipe(meal)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Tier 2: Other Reasonable Alternatives (Minor additions/substitutions) */}
          {results.tier2_reasonable_alternatives.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#377BC4]" />
                <h2 className="text-xl font-black text-[#20312F]">
                  Other Reasonable Alternatives (Minor Substitution)
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EDF5FF] text-[#377BC4]">
                  {results.tier2_reasonable_alternatives.length} Meals
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.tier2_reasonable_alternatives.map((meal: any) => (
                  <MealRecommendationCard
                    key={meal.recipe_id}
                    meal={meal}
                    onLog={() => handleLogRecipe(meal)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tier 3: Requiring Caution or Extra Steps */}
          {results.tier3_requiring_caution.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#B87921]" />
                <h2 className="text-xl font-black text-[#20312F]">
                  Options Requiring Additional Ingredients or Caution
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FFF5E5] text-[#B87921]">
                  {results.tier3_requiring_caution.length} Ideas
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.tier3_requiring_caution.map((meal: any) => (
                  <MealRecommendationCard
                    key={meal.recipe_id}
                    meal={meal}
                    onLog={() => handleLogRecipe(meal)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function MealRecommendationCard({ meal, onLog }: { meal: any; onLog: () => void }) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-[#E2ECEB] card-shadow card-shadow-hover space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <FoodImage
            foodName={meal.name}
            className="w-16 h-16 rounded-2xl shrink-0"
            aspectRatio="square"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <SuitabilityBadge status={meal.suitability_badge} label={meal.suitability_badge} />
            </div>
            <h3 className="font-bold text-base text-[#20312F] mt-1 truncate">{meal.name}</h3>
            <p className="text-xs text-[#8E9F9D]">
              {meal.regional_cuisine} • {meal.prep_time_minutes} min prep
            </p>
          </div>
        </div>

        {/* Nutritional Highlights */}
        <div className="grid grid-cols-4 gap-2 bg-[#F7FAFC] p-2.5 rounded-xl border border-[#EDF3F3] text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8E9F9D]">Calories</span>
            <p className="text-xs font-bold text-[#20312F]">{meal.calories_est}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8E9F9D]">Protein</span>
            <p className="text-xs font-bold text-[#177E75]">{meal.protein_est}g</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8E9F9D]">Carbs</span>
            <p className="text-xs font-bold text-[#20312F]">{meal.carbs_est}g</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8E9F9D]">Fiber</span>
            <p className="text-xs font-bold text-[#218C68]">{meal.fiber_est}g</p>
          </div>
        </div>

        {/* Explanation & Portion Guidance */}
        <p className="text-xs text-[#5A6D6B] leading-relaxed">
          {meal.explanation}
        </p>

        {meal.portion_guidance && (
          <div className="p-2.5 rounded-xl bg-[#EEF7FF] text-[#377BC4] border border-[#377BC4]/20 text-xs">
            <strong>Portion Guidance:</strong> {meal.portion_guidance}
          </div>
        )}

        {/* Missing ingredients */}
        {meal.missing_ingredients && meal.missing_ingredients.length > 0 && (
          <div className="text-xs text-[#B87921]">
            <span className="font-semibold">Missing:</span> {meal.missing_ingredients.join(", ")}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-[#EDF3F3] flex items-center justify-between">
        <span className="text-xs font-bold text-[#218C68]">
          {meal.match_percentage}% Ingredient Match
        </span>
        <button
          onClick={onLog}
          className="px-4 py-2 rounded-xl bg-[#177E75] text-white font-bold text-xs hover:bg-[#12645e] transition-colors"
        >
          Cook & Log This
        </button>
      </div>
    </div>
  );
}

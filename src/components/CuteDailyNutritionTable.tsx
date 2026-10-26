"use client";

import React, { useState } from "react";
import {
  Flame,
  Dna,
  Wheat,
  Activity,
  Layers,
  Droplet,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Target,
  ArrowRight
} from "lucide-react";
import { UserMedicalProfile } from "./MedicalProfileModal";
import { DayRecord, LoggedFoodItem } from "./CuteHealthDiary";

interface CuteDailyNutritionTableProps {
  userProfile: UserMedicalProfile;
  currentRecord: DayRecord;
  prettyDate: string;
  onOpenMealModal?: (slot: "breakfast" | "lunch" | "dinner" | "snack") => void;
  onOpenStudio?: () => void;
}

interface NutrientMetric {
  id: string;
  name: string;
  emoji: string;
  unit: string;
  consumed: number;
  target: number;
  icon: any;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    bar: string;
    pillBg: string;
    pillText: string;
    pillBorder: string;
  };
  isExcessBad: boolean; // e.g. Calories, Carbs, Fat, Sodium: excess is a warning; Protein & Fiber & Water: excess is usually okay/good
  clinicalRationale: string;
  conditionNotice?: string;
}

export default function CuteDailyNutritionTable({
  userProfile,
  currentRecord,
  prettyDate,
  onOpenMealModal,
  onOpenStudio
}: CuteDailyNutritionTableProps) {
  const [expandedNutrient, setExpandedNutrient] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Sum up real consumed nutrients from all logged meals in this day's record
  const meals = currentRecord.meals || [];
  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = Math.round(meals.reduce((sum, m) => sum + (m.protein_g || 0), 0) * 10) / 10;
  const totalCarbs = Math.round(meals.reduce((sum, m) => sum + (m.carbs_g || 0), 0) * 10) / 10;
  const totalFiber = Math.round(meals.reduce((sum, m) => sum + (m.fiber_g || 0), 0) * 10) / 10;
  
  // Real or estimated fat (if item fat not explicitly logged, derive via standard 4-4-9 macro math)
  const totalFat = Math.round(
    meals.reduce((sum, m) => {
      if (m.fat_g !== undefined && m.fat_g !== null) return sum + m.fat_g;
      const calcFat = Math.max(0, (m.calories - ((m.protein_g || 0) * 4 + (m.carbs_g || 0) * 4)) / 9);
      return sum + calcFat;
    }, 0) * 10
  ) / 10;

  // Real or estimated sodium (estimated standard ICMR ~350mg per meal item if not explicitly recorded)
  const totalSodium = Math.round(
    meals.reduce((sum, m) => {
      if (m.sodium_mg !== undefined && m.sodium_mg !== null) return sum + m.sodium_mg;
      return sum + Math.round((m.calories || 0) * 0.7);
    }, 0)
  );

  const totalWater = currentRecord.water_ml || 0;

  // Personalized Targets from User Medical Profile (ICMR-NIN 2024 calibrated)
  const targetCalories = userProfile.daily_calorie_target || 2050;
  const targetProtein = userProfile.daily_protein_target_g || 78;
  const targetCarbs = userProfile.daily_carb_target_g || 250;
  const targetFat = userProfile.daily_fat_target_g || 58;
  const targetFiber = userProfile.daily_fiber_target_g || 35;
  const targetWater = userProfile.daily_water_target_ml || 2500;
  const targetSodium = userProfile.daily_sodium_target_mg || 1800;

  const isDiabetic = (userProfile.health_conditions || []).some(c => 
    c.includes("diabetes") || c.includes("prediabetes") || c.includes("pcos")
  );
  const isHypertensive = (userProfile.health_conditions || []).some(c => 
    c.includes("hypertension") || c.includes("heart") || c.includes("coronary")
  );
  const isKidney = (userProfile.health_conditions || []).some(c => 
    c.includes("kidney")
  );

  // Compile full nutrient metrics list
  const metrics: NutrientMetric[] = [
    {
      id: "calories",
      name: "Daily Energy (Calories)",
      emoji: "🔥",
      unit: "kcal",
      consumed: totalCalories,
      target: targetCalories,
      icon: Flame,
      colorScheme: {
        bg: "bg-amber-50/60",
        border: "border-amber-200/80",
        text: "text-amber-900",
        bar: "bg-amber-500",
        pillBg: "bg-amber-100",
        pillText: "text-amber-900",
        pillBorder: "border-amber-300"
      },
      isExcessBad: true,
      clinicalRationale: `Mifflin-St Jeor TDEE adjusted for ${userProfile.primary_goal.replace(/_/g, " ")} at ${userProfile.weight_kg}kg body weight.`,
      conditionNotice: userProfile.primary_goal === "weight_loss" 
        ? "Caloric deficit of ~450 kcal baked into daily target for safe fat oxidation."
        : undefined
    },
    {
      id: "protein",
      name: "Dietary Protein",
      emoji: "🥩",
      unit: "g",
      consumed: totalProtein,
      target: targetProtein,
      icon: Dna,
      colorScheme: {
        bg: "bg-blue-50/60",
        border: "border-blue-200/80",
        text: "text-blue-900",
        bar: "bg-blue-500",
        pillBg: "bg-blue-100",
        pillText: "text-blue-900",
        pillBorder: "border-blue-300"
      },
      isExcessBad: isKidney, // If CKD, excess protein stresses glomeruli
      clinicalRationale: isKidney 
        ? "Strictly capped at 0.85g/kg body weight to protect renal glomerular filtration."
        : `Calibrated to ~${(targetProtein / (userProfile.weight_kg || 70)).toFixed(1)}g/kg for muscle maintenance, cellular enzyme synthesis & sustained satiety.`,
      conditionNotice: isKidney ? "Renal Protection Guardrail active: keep protein close to target." : undefined
    },
    {
      id: "carbs",
      name: "Total Carbohydrates",
      emoji: "🌾",
      unit: "g",
      consumed: totalCarbs,
      target: targetCarbs,
      icon: Wheat,
      colorScheme: {
        bg: "bg-emerald-50/60",
        border: "border-emerald-200/80",
        text: "text-emerald-900",
        bar: "bg-emerald-500",
        pillBg: "bg-emerald-100",
        pillText: "text-emerald-900",
        pillBorder: "border-emerald-300"
      },
      isExcessBad: true,
      clinicalRationale: isDiabetic 
        ? "ICMR-NIN 2024 Protocol: Budgeted at ≤40% total calories to prevent glycemic surges and HbA1c elevation."
        : "Clean energy source fueling cognitive functions and hepatic glycogen reserves.",
      conditionNotice: isDiabetic ? "Diabetic / Metabolic Guardrail: Prefer low-GI complex carbs (millets, oats, whole legumes)." : undefined
    },
    {
      id: "fats",
      name: "Healthy Fats & Lipids",
      emoji: "🥑",
      unit: "g",
      consumed: totalFat,
      target: targetFat,
      icon: Activity,
      colorScheme: {
        bg: "bg-rose-50/60",
        border: "border-rose-200/80",
        text: "text-rose-900",
        bar: "bg-rose-500",
        pillBg: "bg-rose-100",
        pillText: "text-rose-900",
        pillBorder: "border-rose-300"
      },
      isExcessBad: true,
      clinicalRationale: "Essential fatty acids supporting cell membrane fluidity, steroid hormone production and absorption of fat-soluble vitamins (A, D, E, K).",
      conditionNotice: "Choose MUFA/PUFA rich sources (seeds, nuts, mustard/groundnut/olive oils) and avoid hydrogenated trans-fats."
    },
    {
      id: "fiber",
      name: "Dietary Fiber",
      emoji: "🌿",
      unit: "g",
      consumed: totalFiber,
      target: targetFiber,
      icon: Layers,
      colorScheme: {
        bg: "bg-teal-50/60",
        border: "border-teal-200/80",
        text: "text-teal-900",
        bar: "bg-teal-500",
        pillBg: "bg-teal-100",
        pillText: "text-teal-900",
        pillBorder: "border-teal-300"
      },
      isExcessBad: false,
      clinicalRationale: "Prebiotic nourishment for gut microbiota, stool bulk regulation, and natural postprandial glucose absorption buffering.",
      conditionNotice: isDiabetic ? "Target elevated to 38g+ to slow carbohydrate absorption and flatten glycemic index." : undefined
    },
    {
      id: "water",
      name: "Pure Water / Hydration",
      emoji: "💧",
      unit: "ml",
      consumed: totalWater,
      target: targetWater,
      icon: Droplet,
      colorScheme: {
        bg: "bg-sky-50/60",
        border: "border-sky-200/80",
        text: "text-sky-900",
        bar: "bg-sky-500",
        pillBg: "bg-sky-100",
        pillText: "text-sky-900",
        pillBorder: "border-sky-300"
      },
      isExcessBad: false,
      clinicalRationale: "Maintains optimal blood volume, extracellular fluid balance, thermoregulation and renal metabolic waste clearance.",
      conditionNotice: "Calculated at 35ml per kg body weight."
    },
    {
      id: "sodium",
      name: "Sodium Intake",
      emoji: "🧂",
      unit: "mg",
      consumed: totalSodium,
      target: targetSodium,
      icon: ShieldAlert,
      colorScheme: {
        bg: "bg-slate-50/80",
        border: "border-slate-200/80",
        text: "text-slate-900",
        bar: "bg-slate-500",
        pillBg: "bg-slate-100",
        pillText: "text-slate-900",
        pillBorder: "border-slate-300"
      },
      isExcessBad: true,
      clinicalRationale: isHypertensive 
        ? "Capped below 1,500mg/day to reduce vascular resistance and maintain healthy blood pressure."
        : "ICMR ceiling to protect renal tubules and cardiovascular vascular tone.",
      conditionNotice: isHypertensive ? "Hypertension Guardrail: Avoid processed sodium, pickles and high-salt savory snacks." : undefined
    }
  ];

  // Helper to format remaining or excess text exactly as requested by user
  const getStatusDetails = (m: NutrientMetric) => {
    const diff = Math.round((m.target - m.consumed) * 10) / 10;
    const pct = Math.min(Math.round((m.consumed / Math.max(m.target, 1)) * 100), 200);

    if (diff > 0) {
      // Under target -> show exact amount left
      return {
        type: "left",
        label: `${diff} ${m.unit} left for today`,
        shortLabel: `${diff} ${m.unit} left`,
        badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
        barColor: m.colorScheme.bar,
        pct,
        description: `You have consumed ${m.consumed} ${m.unit} out of your ${m.target} ${m.unit} goal.`
      };
    } else if (diff === 0 || Math.abs(diff) <= (m.unit === "kcal" ? 25 : m.unit === "mg" ? 50 : 1)) {
      // Met target
      return {
        type: "met",
        label: `🎯 Target Met (${m.consumed} ${m.unit})`,
        shortLabel: `🎯 Complete`,
        badgeColor: "bg-teal-100 text-teal-900 border-teal-300 font-extrabold",
        barColor: "bg-teal-500",
        pct: 100,
        description: `Perfect achievement! You reached 100% of your ${m.name} goal for today.`
      };
    } else {
      // Over target -> excess
      const excess = Math.abs(diff);
      const isDangerousExcess = m.isExcessBad;
      return {
        type: "excess",
        label: isDangerousExcess
          ? `⚠️ You took excess ${m.id === "fats" ? "fat" : m.name.toLowerCase()} today (+${excess} ${m.unit})`
          : `✨ Exceeded target (+${excess} ${m.unit} bonus)`,
        shortLabel: isDangerousExcess ? `+${excess} ${m.unit} excess` : `+${excess} ${m.unit} bonus`,
        badgeColor: isDangerousExcess
          ? "bg-rose-100 text-rose-900 border-rose-300 font-bold"
          : "bg-sky-100 text-sky-900 border-sky-300",
        barColor: isDangerousExcess ? "bg-rose-500" : "bg-teal-500",
        pct,
        description: isDangerousExcess
          ? `Exceeded daily limit by ${excess} ${m.unit}. Consider balancing with lighter meals for the rest of the day.`
          : `Great job! You exceeded your baseline requirement by ${excess} ${m.unit}.`
      };
    }
  };

  // Overall Day Score Calculation
  const targetsMetCount = metrics.filter(m => {
    const diff = m.target - m.consumed;
    return diff <= (m.unit === "kcal" ? 50 : 2) && (!m.isExcessBad || m.consumed <= m.target * 1.15);
  }).length;

  const hasAnyMeals = meals.length > 0 || totalWater > 0;

  return (
    <div className="rounded-3xl bg-white border border-[#E8DCCF]/80 shadow-[0_4px_24px_-4px_rgba(44,32,22,0.06)] overflow-hidden transition-all duration-300">
      
      {/* Table Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-[#FAF6F0] via-[#F4EFE6] to-[#EBF6F2] border-b border-[#E8DCCF]/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#E0D2C3] shadow-xs flex items-center justify-center text-2xl shrink-0">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-black text-[#2D2015] font-serif tracking-tight">
                Daily Nutrition Tracking Table
              </h3>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200 shadow-2xs">
                ICMR-NIN 2024 Calibrated
              </span>
            </div>
            <p className="text-xs text-[#7A6451] mt-0.5 max-w-xl">
              Tracks your exact daily intake vs personalized targets for <strong>{prettyDate}</strong>. Automatically updates in real time whenever food or water is logged.
            </p>
          </div>
        </div>

        {/* View Switcher & Quick Summary Pill */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <div className="px-3 py-1.5 rounded-2xl bg-white/90 border border-[#E3D6C7] shadow-2xs text-xs font-bold text-[#554131] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>{hasAnyMeals ? `${targetsMetCount} / ${metrics.length} Targets on Track` : "Awaiting Meals"}</span>
          </div>

          <div className="flex rounded-xl bg-[#EBE2D7] p-0.5 border border-[#DACDC0]">
            <button
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "table" ? "bg-white text-teal-900 shadow-2xs" : "text-[#715F4F] hover:text-[#2D2015]"
              }`}
              title="Table Grid View"
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "cards" ? "bg-white text-teal-900 shadow-2xs" : "text-[#715F4F] hover:text-[#2D2015]"
              }`}
              title="Card Stack View"
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Responsive Table or Cards */}
      {viewMode === "table" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EFE5DB] bg-[#FCFAF7] text-[11px] font-bold text-[#7A6451] uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Nutrient & Biological Goal</th>
                <th className="py-3.5 px-3 sm:px-4 text-center">Daily Target</th>
                <th className="py-3.5 px-3 sm:px-4 text-center">Consumed Today</th>
                <th className="py-3.5 px-3 sm:px-4 min-w-[140px]">Progress</th>
                <th className="py-3.5 px-4 sm:px-6">Daily Balance & Left / Excess Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1E8DF] text-xs">
              {metrics.map((m) => {
                const status = getStatusDetails(m);
                const Icon = m.icon;
                const isExpanded = expandedNutrient === m.id;

                return (
                  <React.Fragment key={m.id}>
                    <tr 
                      onClick={() => setExpandedNutrient(isExpanded ? null : m.id)}
                      className="hover:bg-[#FAF6F0]/70 transition-colors cursor-pointer group"
                    >
                      {/* Nutrient Name & Emoji */}
                      <td className="py-3.5 px-4 sm:px-6 font-medium text-[#2E2014]">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl ${m.colorScheme.bg} border ${m.colorScheme.border} flex items-center justify-center text-sm shrink-0 shadow-2xs`}>
                            {m.emoji}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-[#2D2015] group-hover:text-teal-800 transition-colors block">
                              {m.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-normal line-clamp-1">
                              {m.clinicalRationale}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Daily Target */}
                      <td className="py-3.5 px-3 sm:px-4 text-center font-mono font-bold text-[#4A3828]">
                        <span className="px-2.5 py-1 rounded-xl bg-[#F6EFE7] border border-[#E9DCCE] inline-block">
                          {m.target.toLocaleString()} <span className="text-[10px] text-slate-500 font-sans">{m.unit}</span>
                        </span>
                      </td>

                      {/* Consumed Today */}
                      <td className="py-3.5 px-3 sm:px-4 text-center font-mono font-black text-slate-900">
                        <span className="text-sm">
                          {m.consumed.toLocaleString()} <span className="text-[10px] font-normal text-slate-500 font-sans">{m.unit}</span>
                        </span>
                      </td>

                      {/* Visual Progress Bar */}
                      <td className="py-3.5 px-3 sm:px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                            <span>{status.pct}%</span>
                            <span className="text-[9px] text-slate-400 font-normal">
                              {m.consumed}/{m.target}
                            </span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-[#EFE7DE] overflow-hidden p-0.5">
                            <div 
                              className={`h-full rounded-full transition-all duration-700 ease-out ${status.barColor}`}
                              style={{ width: `${Math.min(status.pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Left or Excess Pill Badge */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border shadow-2xs ${status.badgeColor}`}>
                            {status.type === "left" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                            {status.type === "met" && <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />}
                            {status.type === "excess" && (
                              m.isExcessBad ? <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" /> : <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            )}
                            <span className="font-bold">{status.label}</span>
                          </span>

                          <button 
                            type="button"
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                            title="Toggle details"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Clinical Insights & Meal Contribution Row */}
                    {isExpanded && (
                      <tr className="bg-[#FAF7F2]/90 border-b border-[#EFE5DB]">
                        <td colSpan={5} className="py-3 px-6 text-xs text-[#523F2F]">
                          <div className="p-4 rounded-2xl bg-white border border-[#E9DCCE] space-y-2 shadow-2xs">
                            <div className="flex items-start gap-2.5">
                              <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <div className="font-bold text-teal-950">
                                  Clinical Goal & Rationale for Your Health Profile:
                                </div>
                                <p className="text-slate-600">
                                  {m.clinicalRationale}
                                </p>
                                {m.conditionNotice && (
                                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-medium text-[11px] flex items-center gap-1.5 mt-1">
                                    <span>⚠️</span>
                                    <span>{m.conditionNotice}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Breakdown of logged meals that contributed to this nutrient */}
                            <div className="pt-2 border-t border-slate-100 mt-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                Meals logged contributing to {m.name}:
                              </span>
                              {meals.length === 0 ? (
                                <p className="text-[11px] text-slate-400 italic">No food items logged for this day yet.</p>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {meals.map((food) => {
                                    const val = 
                                      m.id === "calories" ? food.calories :
                                      m.id === "protein" ? food.protein_g :
                                      m.id === "carbs" ? food.carbs_g :
                                      m.id === "fiber" ? food.fiber_g :
                                      m.id === "fats" ? food.fat_g : undefined;

                                    if (val === undefined || val === 0) return null;

                                    return (
                                      <span 
                                        key={food.id}
                                        className="px-2.5 py-1 rounded-xl bg-[#F6EFE7] text-[#4A3828] text-[11px] border border-[#EADCCE] font-medium"
                                      >
                                        <strong>{food.name}</strong> ({food.meal_slot}): +{val} {m.unit}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Mobile-Optimized Card Stack View */
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {metrics.map((m) => {
            const status = getStatusDetails(m);
            const isExpanded = expandedNutrient === m.id;

            return (
              <div 
                key={m.id}
                onClick={() => setExpandedNutrient(isExpanded ? null : m.id)}
                className="p-4 rounded-2xl bg-white border border-[#EADCCE] hover:border-teal-400/50 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{m.emoji}</span>
                    <div>
                      <h4 className="text-sm font-black text-[#2D2015]">{m.name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Target: {m.target} {m.unit}
                      </span>
                    </div>
                  </div>

                  <span className="text-sm font-mono font-black text-slate-900">
                    {m.consumed} <span className="text-xs text-slate-400 font-sans">{m.unit}</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full h-2 rounded-full bg-[#EFE7DE] overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${status.barColor}`}
                      style={{ width: `${Math.min(status.pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>{status.pct}% Completed</span>
                    <span>{m.consumed} / {m.target} {m.unit}</span>
                  </div>
                </div>

                {/* Remaining / Excess Chip */}
                <div className="pt-2 border-t border-[#F2EAE0] flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] border shadow-2xs ${status.badgeColor}`}>
                    {status.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {isExpanded ? "Less ▲" : "Why ▼"}
                  </span>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-[#554333] space-y-1.5 animate-fadeIn">
                    <p className="text-slate-600 leading-relaxed">
                      {m.clinicalRationale}
                    </p>
                    {m.conditionNotice && (
                      <div className="p-2 rounded-lg bg-amber-50 text-amber-900 font-semibold text-[10px]">
                        ⚠️ {m.conditionNotice}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Footer Guidance & Quick Actions */}
      <div className="p-4 sm:p-5 bg-[#FAF6F0]/90 border-t border-[#E8DCCF]/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#725C48]">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            {hasAnyMeals ? (
              <>
                Every bite you log fills this table in real time. Keep healthy fats and carbs balanced to hit 100%!
              </>
            ) : (
              <>
                No food logged yet for {prettyDate}. Log breakfast, lunch, or dinner above to start tracking!
              </>
            )}
          </span>
        </div>

        {onOpenStudio && (
          <button
            onClick={onOpenStudio}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            Log More Food in AI Studio <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
}

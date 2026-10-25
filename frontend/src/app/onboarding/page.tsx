"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  User,
  Heart,
  Target,
  AlertTriangle,
  Leaf
} from "lucide-react";
import { ApiClient } from "@/lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [age, setAge] = useState(28);
  const [sex, setSex] = useState("male");
  const [height, setHeight] = useState(172);
  const [weight, setWeight] = useState(70);
  const [activity, setActivity] = useState("moderate");
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>(["vegetarian"]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [goal, setGoal] = useState("balanced_diet");

  const toggleArrayItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await ApiClient.updateProfile({
        age: Number(age),
        biological_sex: sex,
        height_cm: Number(height),
        weight_kg: Number(weight),
        activity_level: activity,
        primary_goal: goal,
        dietary_preferences: dietaryPrefs,
        allergies: allergies,
        health_conditions: conditions,
      });
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-[#8E9F9D] mb-2 uppercase tracking-wider">
          <span>Step {step} of 5</span>
          <span>{Math.round((step / 5) * 100)}% Completed</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#E2ECEB] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#42BFA5] to-[#177E75] transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Personal Characteristics */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2ECEB] card-shadow space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-[#20312F]">Tell us about yourself</h2>
            <p className="text-xs text-[#5A6D6B]">
              Biological sex and age are required by the ICMR-NIN framework to establish metabolic reference baselines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#5A6D6B] uppercase mb-1">Age (Years)</label>
              <input
                type="number"
                min={5}
                max={110}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-[#E2ECEB] text-sm focus:outline-none focus:ring-2 focus:ring-[#42BFA5] bg-[#F7FAFC]"
              />
              {age < 18 && (
                <p className="text-[11px] text-[#177E75] font-semibold mt-1">
                  ✓ Adolescent safeguard active: Calorie restriction locked.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A6D6B] uppercase mb-1">Biological Sex</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E2ECEB] text-sm focus:outline-none focus:ring-2 focus:ring-[#42BFA5] bg-[#F7FAFC]"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A6D6B] uppercase mb-1">Height (cm)</label>
              <input
                type="number"
                min={80}
                max={250}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-[#E2ECEB] text-sm focus:outline-none focus:ring-2 focus:ring-[#42BFA5] bg-[#F7FAFC]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A6D6B] uppercase mb-1">Weight (kg)</label>
              <input
                type="number"
                min={20}
                max={300}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-[#E2ECEB] text-sm focus:outline-none focus:ring-2 focus:ring-[#42BFA5] bg-[#F7FAFC]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5A6D6B] uppercase mb-2">Daily Physical Activity</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "sedentary", label: "Sedentary", desc: "Desk job / minimal movement" },
                { id: "light", label: "Light", desc: "1-2 light workouts/wk" },
                { id: "moderate", label: "Moderate", desc: "3-5 active workouts/wk" },
                { id: "active", label: "Very Active", desc: "Hard daily training / labor" },
              ].map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => setActivity(act.id)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    activity === act.id
                      ? "border-[#42BFA5] bg-[#E9F8F3] text-[#177E75]"
                      : "border-[#E2ECEB] bg-[#F7FAFC] text-[#5A6D6B] hover:border-[#cbdcdb]"
                  }`}
                >
                  <span className="block text-xs font-bold">{act.label}</span>
                  <span className="block text-[10px] opacity-75 mt-0.5">{act.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#177E75] text-white font-bold text-sm hover:bg-[#12645e] transition-colors"
            >
              <span>Next: Dietary Preferences</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Dietary Preferences */}
      {step === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2ECEB] card-shadow space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-[#20312F]">Dietary Pattern</h2>
            <p className="text-xs text-[#5A6D6B]">
              This sets deterministic safety guardrails. Non-compliant recipes will never be recommended.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: "vegetarian", label: "Vegetarian", desc: "Plant foods and dairy; zero meat or fish" },
              { id: "eggetarian", label: "Eggetarian", desc: "Vegetarian diet with eggs included" },
              { id: "vegan", label: "Vegan", desc: "Strictly 100% plant-based; no dairy" },
              { id: "non_vegetarian", label: "Non-Vegetarian", desc: "Includes chicken, fish, and meats" },
              { id: "jain", label: "Jain / Sattvic", desc: "No meat, root vegetables (onions, garlic, potatoes)" },
            ].map((diet) => {
              const isSelected = dietaryPrefs.includes(diet.id);
              return (
                <button
                  key={diet.id}
                  type="button"
                  onClick={() => toggleArrayItem(dietaryPrefs, setDietaryPrefs, diet.id)}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    isSelected
                      ? "border-[#42BFA5] bg-[#E9F8F3] text-[#177E75] shadow-sm"
                      : "border-[#E2ECEB] bg-[#F7FAFC] text-[#5A6D6B] hover:border-[#cbdcdb]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{diet.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#42BFA5]" />}
                  </div>
                  <p className="text-xs opacity-75 mt-1">{diet.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="pt-4 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#E2ECEB] text-[#5A6D6B] font-bold text-sm hover:bg-[#F7FAFC]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#177E75] text-white font-bold text-sm hover:bg-[#12645e]"
            >
              <span>Next: Allergies & Intolerances</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Allergies */}
      {step === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2ECEB] card-shadow space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-[#20312F]">Allergies & Intolerances</h2>
            <p className="text-xs text-[#5A6D6B]">
              Any ingredient containing or tracing these items will trigger a high-visibility allergy warning and exclusion.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              "Peanuts", "Tree Nuts", "Dairy / Lactose", "Gluten / Wheat",
              "Soy", "Eggs", "Shellfish / Fish", "Mustard Seeds", "Sesame"
            ].map((allergen) => {
              const id = allergen.toLowerCase().split(" ")[0];
              const isSelected = allergies.includes(id);
              return (
                <button
                  key={allergen}
                  type="button"
                  onClick={() => toggleArrayItem(allergies, setAllergies, id)}
                  className={`p-3 rounded-xl text-center border font-semibold text-xs transition-all ${
                    isSelected
                      ? "border-[#C94B53] bg-[#FFF0F1] text-[#C94B53]"
                      : "border-[#E2ECEB] bg-[#F7FAFC] text-[#5A6D6B] hover:border-[#cbdcdb]"
                  }`}
                >
                  <span>{allergen}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#E2ECEB] text-[#5A6D6B] font-bold text-sm hover:bg-[#F7FAFC]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#177E75] text-white font-bold text-sm hover:bg-[#12645e]"
            >
              <span>Next: Health Conditions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Health Conditions (Optional) */}
      {step === 4 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2ECEB] card-shadow space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-[#20312F]">Health Considerations (Optional)</h2>
            <p className="text-xs text-[#5A6D6B]">
              Voluntarily declare any condition so we can apply specific ICMR-NIN thresholds (e.g. sodium ceiling for hypertension, glycemic balance for diabetes).
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              { id: "prediabetes", label: "Pre-Diabetes / Type 2 Diabetes", note: "Flags high glycemic index dishes and guides carbohydrate distribution." },
              { id: "hypertension", label: "Hypertension / High Blood Pressure", note: "Monitors sodium content with a single-meal limit and a 2000mg daily ceiling." },
              { id: "dyslipidemia", label: "High Cholesterol / Dyslipidemia", note: "Restricts saturated fat and promotes soluble fiber." },
            ].map((cond) => {
              const isSelected = conditions.includes(cond.id);
              return (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => toggleArrayItem(conditions, setConditions, cond.id)}
                  className={`w-full p-4 rounded-2xl text-left border transition-all ${
                    isSelected
                      ? "border-[#42BFA5] bg-[#E9F8F3] text-[#177E75]"
                      : "border-[#E2ECEB] bg-[#F7FAFC] text-[#5A6D6B] hover:border-[#cbdcdb]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{cond.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#42BFA5]" />}
                  </div>
                  <p className="text-xs opacity-75 mt-1">{cond.note}</p>
                </button>
              );
            })}
          </div>

          <div className="pt-4 flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#E2ECEB] text-[#5A6D6B] font-bold text-sm hover:bg-[#F7FAFC]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(5)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#177E75] text-white font-bold text-sm hover:bg-[#12645e]"
            >
              <span>Next: Nutritional Goals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Goals */}
      {step === 5 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2ECEB] card-shadow space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-[#20312F]">Your Nutritional Goal</h2>
            <p className="text-xs text-[#5A6D6B]">
              Select what you wish to focus on today. You can adjust this anytime.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { id: "healthy_weight_loss", label: "Healthy Sustainable Fat Loss", desc: "Moderate caloric deficit with high fiber and protein to preserve muscle." },
              { id: "balanced_diet", label: "Balanced Daily Nutrition", desc: "Maintenance energy with ICMR-NIN My Plate for the Day distribution." },
              { id: "muscle_gain", label: "Lean Muscle Development", desc: "Elevated protein intake (~1.4g/kg) and positive caloric margin." },
            ].map((g) => {
              const isSelected = goal === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={`w-full p-4 rounded-2xl text-left border transition-all ${
                    isSelected
                      ? "border-[#42BFA5] bg-[#E9F8F3] text-[#177E75] shadow-sm"
                      : "border-[#E2ECEB] bg-[#F7FAFC] text-[#5A6D6B] hover:border-[#cbdcdb]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{g.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#42BFA5]" />}
                  </div>
                  <p className="text-xs opacity-75 mt-1">{g.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="pt-4 flex justify-between">
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#E2ECEB] text-[#5A6D6B] font-bold text-sm hover:bg-[#F7FAFC]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleFinish}
              disabled={loading}
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-[#42BFA5] to-[#177E75] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <span>{loading ? "Configuring Engine..." : "Complete & Open Dashboard"}</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

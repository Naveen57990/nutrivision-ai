"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  Activity, 
  Heart, 
  AlertCircle, 
  ShieldCheck, 
  Scale, 
  Target, 
  X, 
  CheckCircle2, 
  Droplet,
  Save,
  FileText,
  Calendar,
  Sparkles
} from "lucide-react";

export interface UserMedicalProfile {
  age: number;
  gender: "male" | "female" | "other";
  height_cm: number;
  weight_kg: number;
  dietary_pattern: "vegetarian" | "non_vegetarian" | "eggetarian" | "vegan" | "jain";
  primary_goal: "weight_loss" | "muscle_gain" | "weight_gain" | "maintenance" | "blood_sugar_control" | "heart_health";
  activity_level: "sedentary" | "light" | "moderate" | "active";
  health_conditions: string[];
  allergies: string[];
  medical_records: {
    fasting_blood_sugar_mg_dl?: number;
    hba1c_percent?: number;
    systolic_bp?: number;
    diastolic_bp?: number;
    cholesterol_mg_dl?: number;
    last_checkup_date?: string;
  };
  // Calculated ICMR Targets
  daily_calorie_target: number;
  daily_protein_target_g: number;
  daily_carb_target_g: number;
  daily_fat_target_g: number;
  daily_fiber_target_g: number;
  daily_water_target_ml: number;
  daily_sodium_target_mg: number;
}

const DEFAULT_PROFILE: UserMedicalProfile = {
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

interface MedicalProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: UserMedicalProfile) => void;
}

export default function MedicalProfileModal({ 
  isOpen, 
  onClose, 
  onProfileUpdated 
}: MedicalProfileModalProps) {
  const [profile, setProfile] = useState<UserMedicalProfile>(DEFAULT_PROFILE);
  const [activeTab, setActiveTab] = useState<"profile" | "medical_records" | "targets">("profile");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load from localStorage or API
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem("nutrivision_user_profile");
        if (stored) {
          setProfile(JSON.parse(stored));
        }
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Real-time ICMR-NIN 2024 Math Calculations
  const calculateTargets = (curr: UserMedicalProfile): UserMedicalProfile => {
    const { age, gender, height_cm, weight_kg, primary_goal, activity_level, health_conditions } = curr;

    // 1. Mifflin-St Jeor BMR Formula
    let bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age;
    bmr += (gender === "male" ? 5 : -161);

    // 2. Activity Multiplier
    const actMult = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725
    }[activity_level] || 1.375;

    let tdee = bmr * actMult;

    // 3. Goal Adjustment
    if (primary_goal === "weight_loss") {
      tdee -= 450; // Moderate calorie deficit
    } else if (primary_goal === "muscle_gain") {
      tdee += 250; // Clean surplus
    } else if (primary_goal === "weight_gain") {
      tdee += 450;
    }

    const dailyCalories = Math.round(tdee);

    // 4. Protein Calculation
    let proteinPerKg = 1.0;
    if (primary_goal === "muscle_gain") proteinPerKg = 1.6;
    else if (primary_goal === "weight_loss") proteinPerKg = 1.3;
    const dailyProtein = Math.round(weight_kg * proteinPerKg);

    // 5. Carb & Fat distribution (ICMR 2024: Carbs <= 45% if diabetic/prediabetic)
    const isDiabetic = health_conditions.includes("diabetes") || health_conditions.includes("prediabetes");
    const carbPercent = isDiabetic ? 0.42 : 0.50;
    const dailyCarbs = Math.round((dailyCalories * carbPercent) / 4);

    const fatCalories = dailyCalories - (dailyProtein * 4 + dailyCarbs * 4);
    const dailyFat = Math.max(40, Math.round(fatCalories / 9));

    // 6. Fiber & Water
    const dailyFiber = isDiabetic ? 38 : 32;
    const dailyWater = Math.round((weight_kg * 35) / 50) * 50;

    // 7. Sodium limit (<1500mg if hypertension)
    const hasBP = health_conditions.includes("hypertension");
    const dailySodium = hasBP ? 1500 : 2000;

    return {
      ...curr,
      daily_calorie_target: dailyCalories,
      daily_protein_target_g: dailyProtein,
      daily_carb_target_g: dailyCarbs,
      daily_fat_target_g: dailyFat,
      daily_fiber_target_g: dailyFiber,
      daily_water_target_ml: dailyWater,
      daily_sodium_target_mg: dailySodium
    };
  };

  const handleUpdate = (updates: Partial<UserMedicalProfile>) => {
    setProfile(prev => calculateTargets({ ...prev, ...updates }));
  };

  const toggleCondition = (cond: string) => {
    const current = profile.health_conditions || [];
    const updated = current.includes(cond)
      ? current.filter(c => c !== cond)
      : [...current, cond];
    handleUpdate({ health_conditions: updated });
  };

  const handleSave = () => {
    const finalProfile = calculateTargets(profile);
    setProfile(finalProfile);
    try {
      localStorage.setItem("nutrivision_user_profile", JSON.stringify(finalProfile));
    } catch {}

    if (onProfileUpdated) onProfileUpdated(finalProfile);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const bmi = (profile.weight_kg / ((profile.height_cm / 100) ** 2)).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-teal-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-teal-900 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
              <User className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Personalized Health & Medical Profile</h2>
              <p className="text-xs text-teal-200">ICMR-NIN 2024 Clinical Engine Grounding</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-3">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "profile"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Basic Demographics & Goal
          </button>
          <button
            onClick={() => setActiveTab("medical_records")}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "medical_records"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            Medical Conditions & Records
          </button>
          <button
            onClick={() => setActiveTab("targets")}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "targets"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Personalized Nutrition Report
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 flex-1">
          
          {activeTab === "profile" && (
            <div className="space-y-5 animate-in fade-in">
              {/* Demographics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Age (Years)</label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => handleUpdate({ age: parseInt(e.target.value) || 25 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                  <select
                    value={profile.gender}
                    onChange={(e) => handleUpdate({ gender: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={profile.height_cm}
                    onChange={(e) => handleUpdate({ height_cm: parseInt(e.target.value) || 170 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={profile.weight_kg}
                    onChange={(e) => handleUpdate({ weight_kg: parseFloat(e.target.value) || 65 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              {/* BMI Card */}
              <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/60 flex items-center justify-between text-xs text-teal-950">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-teal-600" />
                  <span>Calculated Body Mass Index (BMI): <strong>{bmi} kg/m²</strong></span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-200/60 font-bold text-teal-900 text-[11px]">
                  {parseFloat(bmi) < 18.5 ? "Underweight" : parseFloat(bmi) <= 24.9 ? "Normal weight" : "Overweight"}
                </span>
              </div>

              {/* Dietary Pattern Selection (Top Priority: Vegetarian vs Non-Vegetarian) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Dietary Pattern (Top Priority Filter)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: "vegetarian", label: "Vegetarian", icon: "🥬", desc: "No meat/fish" },
                    { id: "non_vegetarian", label: "Non-Veg", icon: "🍗", desc: "Chicken/Fish/Eggs" },
                    { id: "eggetarian", label: "Eggetarian", icon: "🥚", desc: "Eggs + Plant" },
                    { id: "vegan", label: "Vegan", icon: "🌱", desc: "100% Plant" },
                    { id: "jain", label: "Jain", icon: "🥕", desc: "No Root Veg" }
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleUpdate({ dietary_pattern: d.id as any })}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        profile.dietary_pattern === d.id
                          ? "border-teal-600 bg-teal-50/80 text-teal-900 shadow-sm ring-2 ring-teal-500/20"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                      }`}
                    >
                      <div className="text-xl mb-1">{d.icon}</div>
                      <div className="font-bold text-xs">{d.label}</div>
                      <div className="text-[10px] text-slate-500 leading-tight">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Health & Fitness Goal Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Primary Nutritional & Health Goal
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: "muscle_gain", label: "Improve Muscle & Toning", icon: "💪", desc: "High protein (1.6g/kg) & lean retention" },
                    { id: "weight_loss", label: "Lose Weight & Body Fat", icon: "🔻", desc: "Calorie deficit with high satiety & fiber" },
                    { id: "maintenance", label: "Maintain Weight & Longevity", icon: "⚖️", desc: "Metabolic balance per ICMR guidelines" },
                    { id: "weight_gain", label: "Healthy Weight Gain", icon: "🔺", desc: "Clean nutrient-dense surplus" },
                    { id: "blood_sugar_control", label: "Blood Sugar Stability", icon: "🩺", desc: "Low GI & carbs <=45% for diabetes" },
                    { id: "heart_health", label: "Heart Health & Lower BP", icon: "❤️", desc: "DASH diet & sodium <=1500mg" }
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleUpdate({ primary_goal: g.id as any })}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        profile.primary_goal === g.id
                          ? "border-teal-600 bg-teal-50/80 text-teal-900 shadow-sm ring-2 ring-teal-500/20"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-base">{g.icon}</span>
                        <span className="font-bold text-xs">{g.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">{g.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Physical Activity Level */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Physical Activity Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "sedentary", label: "Sedentary", desc: "Desk job, little exercise" },
                    { id: "light", label: "Light Active", desc: "1-3 days light exercise" },
                    { id: "moderate", label: "Moderately Active", desc: "3-5 days gym/sports" },
                    { id: "active", label: "Very Active", desc: "6-7 days intense training" }
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => handleUpdate({ activity_level: act.id as any })}
                      className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                        profile.activity_level === act.id
                          ? "border-teal-600 bg-teal-50 text-teal-900 font-bold"
                          : "border-slate-200 text-slate-600 bg-white"
                      }`}
                    >
                      <div>{act.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{act.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeTab === "medical_records" && (
            <div className="space-y-5 animate-in fade-in">
              
              {/* Medical Conditions Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Medical Conditions (Check all that apply)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "diabetes", label: "Type 2 Diabetes" },
                    { id: "prediabetes", label: "Prediabetes / Insulin Resistance" },
                    { id: "hypertension", label: "High Blood Pressure (BP)" },
                    { id: "cholesterol", label: "High Cholesterol / Dyslipidemia" },
                    { id: "fatty_liver", label: "Fatty Liver (NAFLD)" },
                    { id: "pcos", label: "PCOS / PCOD" },
                    { id: "thyroid", label: "Thyroid (Hypo/Hyper)" },
                    { id: "uric_acid", label: "High Uric Acid / Gout" },
                    { id: "none", label: "None / Perfectly Healthy" }
                  ].map((cond) => {
                    const isChecked = profile.health_conditions.includes(cond.id);
                    return (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => toggleCondition(cond.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between text-xs ${
                          isChecked
                            ? "border-amber-500 bg-amber-50/70 text-amber-950 font-bold"
                            : "border-slate-200 text-slate-700 bg-white hover:border-slate-300"
                        }`}
                      >
                        <span>{cond.label}</span>
                        {isChecked && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Exact Clinical Health Record Entries */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                    Recent Laboratory & Health Records
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Fasting Blood Sugar (mg/dL)
                    </label>
                    <input
                      type="number"
                      value={profile.medical_records.fasting_blood_sugar_mg_dl || ""}
                      onChange={(e) => handleUpdate({
                        medical_records: {
                          ...profile.medical_records,
                          fasting_blood_sugar_mg_dl: parseFloat(e.target.value) || undefined
                        }
                      })}
                      placeholder="e.g. 105"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      HbA1c Level (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={profile.medical_records.hba1c_percent || ""}
                      onChange={(e) => handleUpdate({
                        medical_records: {
                          ...profile.medical_records,
                          hba1c_percent: parseFloat(e.target.value) || undefined
                        }
                      })}
                      placeholder="e.g. 5.8"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Blood Pressure (Sys / Dia)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="130"
                        value={profile.medical_records.systolic_bp || ""}
                        onChange={(e) => handleUpdate({
                          medical_records: {
                            ...profile.medical_records,
                            systolic_bp: parseInt(e.target.value) || undefined
                          }
                        })}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-white font-mono text-center"
                      />
                      <span className="text-slate-400 font-bold">/</span>
                      <input
                        type="number"
                        placeholder="85"
                        value={profile.medical_records.diastolic_bp || ""}
                        onChange={(e) => handleUpdate({
                          medical_records: {
                            ...profile.medical_records,
                            diastolic_bp: parseInt(e.target.value) || undefined
                          }
                        })}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-white font-mono text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>Last Clinical Checkup Date:</span>
                  </div>
                  <input
                    type="date"
                    value={profile.medical_records.last_checkup_date || ""}
                    onChange={(e) => handleUpdate({
                      medical_records: {
                        ...profile.medical_records,
                        last_checkup_date: e.target.value
                      }
                    })}
                    className="px-2 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 font-mono"
                  />
                </div>
              </div>

            </div>
          )}

          {activeTab === "targets" && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-teal-950">
                    Your Personalized ICMR-NIN 2024 Dietary Prescription
                  </h4>
                  <p className="text-xs text-teal-800 mt-0.5">
                    Scientifically calculated for your <strong>{profile.age} yr old {profile.gender}</strong> body, weight of <strong>{profile.weight_kg}kg</strong>, dietary pattern <strong>{profile.dietary_pattern}</strong>, and goal of <strong>{profile.primary_goal.replace(/_/g, " ")}</strong>.
                  </p>
                </div>
              </div>

              {/* Targets Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Daily Calories</div>
                  <div className="text-xl font-extrabold text-teal-700 font-mono mt-1">
                    {profile.daily_calorie_target} <span className="text-xs font-normal text-slate-500">kcal</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Protein Target</div>
                  <div className="text-xl font-extrabold text-blue-700 font-mono mt-1">
                    {profile.daily_protein_target_g} <span className="text-xs font-normal text-slate-500">g</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Carb Limit</div>
                  <div className="text-xl font-extrabold text-amber-700 font-mono mt-1">
                    {profile.daily_carb_target_g} <span className="text-xs font-normal text-slate-500">g</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Dietary Fiber</div>
                  <div className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
                    {profile.daily_fiber_target_g} <span className="text-xs font-normal text-slate-500">g</span>
                  </div>
                </div>
              </div>

              {/* Water & Sodium Guardrails */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-cyan-50/80 border border-cyan-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-cyan-950 font-bold">
                    <Droplet className="w-4 h-4 text-cyan-600" />
                    <span>Pure Water Target (35ml/kg):</span>
                  </div>
                  <span className="font-mono font-extrabold text-cyan-800 text-sm">
                    {profile.daily_water_target_ml} ml
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-rose-950 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Daily Sodium Ceiling (BP Guard):</span>
                  </div>
                  <span className="font-mono font-extrabold text-rose-800 text-sm">
                    &le; {profile.daily_sodium_target_mg} mg
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {savedSuccess ? (
              <span className="text-teal-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Profile saved successfully!
              </span>
            ) : (
              "Changes immediately re-calibrate your AI food recommendations."
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Save Health Profile
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

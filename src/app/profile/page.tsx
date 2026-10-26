"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  User, 
  ArrowLeft, 
  Heart, 
  ShieldCheck, 
  Scale, 
  Target, 
  CheckCircle2, 
  Droplet, 
  Save, 
  FileText, 
  Calendar, 
  Sparkles, 
  Search, 
  Activity, 
  AlertCircle,
  ChefHat
} from "lucide-react";
import CuteAIConnectionBadge from "@/components/CuteAIConnectionBadge";
import { 
  UserMedicalProfile, 
  COMPREHENSIVE_CONDITIONS 
} from "@/components/MedicalProfileModal";

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
    triglycerides_mg_dl: 160,
    serum_uric_acid_mg_dl: 5.8,
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

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserMedicalProfile>(DEFAULT_PROFILE);
  const [activeTab, setActiveTab] = useState<"demographics" | "conditions" | "targets">("demographics");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Smooth string input states
  const [ageStr, setAgeStr] = useState<string>("29");
  const [heightStr, setHeightStr] = useState<string>("175");
  const [weightStr, setWeightStr] = useState<string>("72");
  const [fbsStr, setFbsStr] = useState<string>("");
  const [hba1cStr, setHba1cStr] = useState<string>("");
  const [sysBpStr, setSysBpStr] = useState<string>("");
  const [diaBpStr, setDiaBpStr] = useState<string>("");
  const [cholStr, setCholStr] = useState<string>("");
  const [trigStr, setTrigStr] = useState<string>("");
  const [uricStr, setUricStr] = useState<string>("");

  // Condition Directory Search & Filter
  const [conditionCategory, setConditionCategory] = useState<string>("all");
  const [conditionSearch, setConditionSearch] = useState<string>("");

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nutrivision_user_profile");
      if (stored) {
        const loaded = JSON.parse(stored);
        setProfile(loaded);
        setAgeStr(String(loaded.age ?? 29));
        setHeightStr(String(loaded.height_cm ?? 175));
        setWeightStr(String(loaded.weight_kg ?? 72));
        setFbsStr(loaded.medical_records?.fasting_blood_sugar_mg_dl ? String(loaded.medical_records.fasting_blood_sugar_mg_dl) : "");
        setHba1cStr(loaded.medical_records?.hba1c_percent ? String(loaded.medical_records.hba1c_percent) : "");
        setSysBpStr(loaded.medical_records?.systolic_bp ? String(loaded.medical_records.systolic_bp) : "");
        setDiaBpStr(loaded.medical_records?.diastolic_bp ? String(loaded.medical_records.diastolic_bp) : "");
        setCholStr(loaded.medical_records?.cholesterol_mg_dl ? String(loaded.medical_records.cholesterol_mg_dl) : "");
        setTrigStr(loaded.medical_records?.triglycerides_mg_dl ? String(loaded.medical_records.triglycerides_mg_dl) : "");
        setUricStr(loaded.medical_records?.serum_uric_acid_mg_dl ? String(loaded.medical_records.serum_uric_acid_mg_dl) : "");
      }
    } catch {}
  }, []);

  // Real-time ICMR-NIN 2024 Math Calculations
  const calculateTargets = (curr: UserMedicalProfile): UserMedicalProfile => {
    const age = Math.max(12, Math.min(110, curr.age || 29));
    const height_cm = Math.max(100, Math.min(240, curr.height_cm || 175));
    const weight_kg = Math.max(30, Math.min(220, curr.weight_kg || 72));
    const { gender, primary_goal, activity_level, health_conditions } = curr;

    let bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age;
    bmr += (gender === "male" ? 5 : -161);

    const actMult = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725
    }[activity_level] || 1.375;

    let tdee = bmr * actMult;

    if (primary_goal === "weight_loss") {
      tdee -= 450;
    } else if (primary_goal === "muscle_gain") {
      tdee += 250;
    } else if (primary_goal === "weight_gain") {
      tdee += 450;
    }

    const dailyCalories = Math.max(1200, Math.round(tdee));

    let proteinPerKg = 1.0;
    if (primary_goal === "muscle_gain") proteinPerKg = 1.6;
    else if (primary_goal === "weight_loss") proteinPerKg = 1.3;

    if (health_conditions.includes("kidney_disease")) {
      proteinPerKg = Math.min(proteinPerKg, 0.85);
    }

    const dailyProtein = Math.round(weight_kg * proteinPerKg);

    const isDiabetic = health_conditions.some(c => 
      c.includes("diabetes") || c.includes("prediabetes") || c.includes("pcos") || c.includes("metabolic_syndrome")
    );
    const carbPercent = isDiabetic ? 0.40 : 0.50;
    const dailyCarbs = Math.round((dailyCalories * carbPercent) / 4);

    const fatCalories = dailyCalories - (dailyProtein * 4 + dailyCarbs * 4);
    const dailyFat = Math.max(35, Math.round(fatCalories / 9));

    let dailyFiber = isDiabetic ? 38 : 32;
    if (health_conditions.includes("constipation")) dailyFiber = Math.max(dailyFiber, 42);

    let dailyWater = Math.round((weight_kg * 35) / 50) * 50;
    if (health_conditions.includes("uric_acid") || health_conditions.includes("kidney_stones")) {
      dailyWater = Math.max(dailyWater, 3000);
    }

    const hasBP = health_conditions.some(c => c.includes("hypertension") || c.includes("coronary_disease") || c.includes("heart"));
    const dailySodium = hasBP ? 1400 : 2000;

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

  const toggleCondition = (condId: string) => {
    const current = profile.health_conditions || [];
    let updated: string[];

    if (condId === "none") {
      updated = current.includes("none") ? [] : ["none"];
    } else {
      const filtered = current.filter(c => c !== "none");
      updated = filtered.includes(condId)
        ? filtered.filter(c => c !== condId)
        : [...filtered, condId];
    }

    handleUpdate({ health_conditions: updated });
  };

  const handleSave = () => {
    const validAge = parseInt(ageStr, 10) || profile.age || 29;
    const validHeight = parseInt(heightStr, 10) || profile.height_cm || 175;
    const validWeight = parseFloat(weightStr) || profile.weight_kg || 72;

    const updatedRecords = {
      ...profile.medical_records,
      fasting_blood_sugar_mg_dl: fbsStr.trim() ? parseFloat(fbsStr) : undefined,
      hba1c_percent: hba1cStr.trim() ? parseFloat(hba1cStr) : undefined,
      systolic_bp: sysBpStr.trim() ? parseInt(sysBpStr, 10) : undefined,
      diastolic_bp: diaBpStr.trim() ? parseInt(diaBpStr, 10) : undefined,
      cholesterol_mg_dl: cholStr.trim() ? parseInt(cholStr, 10) : undefined,
      triglycerides_mg_dl: trigStr.trim() ? parseInt(trigStr, 10) : undefined,
      serum_uric_acid_mg_dl: uricStr.trim() ? parseFloat(uricStr) : undefined,
    };

    const finalProfile = calculateTargets({
      ...profile,
      age: validAge,
      height_cm: validHeight,
      weight_kg: validWeight,
      medical_records: updatedRecords
    });

    setProfile(finalProfile);
    try {
      localStorage.setItem("nutrivision_user_profile", JSON.stringify(finalProfile));
    } catch {}

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const filteredConditions = useMemo(() => {
    return COMPREHENSIVE_CONDITIONS.filter(cond => {
      const matchesCategory = conditionCategory === "all" || cond.category === conditionCategory;
      const matchesSearch = !conditionSearch.trim() || 
        cond.label.toLowerCase().includes(conditionSearch.toLowerCase()) ||
        cond.tag.toLowerCase().includes(conditionSearch.toLowerCase()) ||
        cond.icmrGuidance.toLowerCase().includes(conditionSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [conditionCategory, conditionSearch]);

  const currentWeight = parseFloat(weightStr) || profile.weight_kg || 72;
  const currentHeight = parseInt(heightStr, 10) || profile.height_cm || 175;
  const bmi = (currentWeight / ((currentHeight / 100) ** 2)).toFixed(1);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2016] flex flex-col">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#EADBCE] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to App</span>
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>Personalized Health & Medical Profile</span>
              </h1>
              <p className="text-[11px] text-[#78695C]">
                ICMR-NIN 2024 Clinical Engine Grounding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CuteAIConnectionBadge variant="pill" />
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Success Alert Banner */}
        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-950 flex items-center justify-between text-xs font-bold animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Profile updated successfully! All recommendations and diary targets have been re-calibrated.</span>
            </div>
            <Link href="/" className="underline text-emerald-800">Go to Studio →</Link>
          </div>
        )}

        {/* Profile Hero Overview Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-black text-teal-300 shadow-inner">
              {profile.gender === "female" ? "♀" : "♂"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black tracking-tight">Your Clinical Profile</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-200 border border-teal-400/30 text-[10px] font-bold">
                  ICMR Grounded
                </span>
              </div>
              <p className="text-xs text-teal-100/90 mt-1">
                {ageStr} yrs • {currentHeight} cm • {currentWeight} kg • Dietary Pattern: <strong className="capitalize">{profile.dietary_pattern}</strong>
              </p>
              <div className="text-[11px] text-teal-200 mt-1 flex items-center gap-2 flex-wrap">
                <span>Goal: <strong>{profile.primary_goal.replace(/_/g, " ")}</strong></span>
                <span>•</span>
                <span>Conditions: <strong>{profile.health_conditions.length} active</strong></span>
              </div>
            </div>
          </div>

          {/* Live BMI Meter */}
          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 text-center min-w-[130px]">
            <div className="text-[10px] font-bold text-teal-200 uppercase">BMI Meter</div>
            <div className="text-xl font-black font-mono mt-0.5">{bmi} <span className="text-xs font-normal">kg/m²</span></div>
            <div className="text-[10px] font-bold mt-0.5 text-teal-300">
              {parseFloat(bmi) < 18.5 ? "Underweight" : parseFloat(bmi) <= 24.9 ? "Normal weight" : "Overweight"}
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 gap-2 shadow-2xs">
          <button
            onClick={() => setActiveTab("demographics")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "demographics"
                ? "bg-teal-700 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Demographics & Goal</span>
          </button>

          <button
            onClick={() => setActiveTab("conditions")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "conditions"
                ? "bg-teal-700 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Medical Conditions & Labs ({profile.health_conditions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("targets")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "targets"
                ? "bg-teal-700 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ICMR Dietary Prescription</span>
          </button>
        </div>

        {/* TAB 1: DEMOGRAPHICS */}
        {activeTab === "demographics" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6 animate-in fade-in">
            <div>
              <h3 className="text-base font-bold text-slate-900">Demographic & Body Measurements</h3>
              <p className="text-xs text-slate-500">Used for Mifflin-St Jeor BMR math and target calculation.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Age (Years)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={ageStr}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setAgeStr(val);
                    const parsed = parseInt(val, 10);
                    if (!isNaN(parsed) && parsed > 5 && parsed < 120) {
                      setProfile(p => calculateTargets({ ...p, age: parsed }));
                    }
                  }}
                  onBlur={() => {
                    if (!ageStr.trim() || parseInt(ageStr, 10) < 5) {
                      setAgeStr(String(profile.age || 29));
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => handleUpdate({ gender: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Height (cm)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={heightStr}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setHeightStr(val);
                    const parsed = parseInt(val, 10);
                    if (!isNaN(parsed) && parsed > 50 && parsed < 260) {
                      setProfile(p => calculateTargets({ ...p, height_cm: parsed }));
                    }
                  }}
                  onBlur={() => {
                    if (!heightStr.trim() || parseInt(heightStr, 10) < 50) {
                      setHeightStr(String(profile.height_cm || 175));
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Weight (kg)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={weightStr}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setWeightStr(val);
                    const parsed = parseFloat(val);
                    if (!isNaN(parsed) && parsed > 20 && parsed < 300) {
                      setProfile(p => calculateTargets({ ...p, weight_kg: parsed }));
                    }
                  }}
                  onBlur={() => {
                    if (!weightStr.trim() || parseFloat(weightStr) < 20) {
                      setWeightStr(String(profile.weight_kg || 72));
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                />
              </div>
            </div>

            {/* Dietary Pattern */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Dietary Pattern Filter
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
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
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      profile.dietary_pattern === d.id
                        ? "border-teal-600 bg-teal-50 text-teal-900 shadow-sm ring-2 ring-teal-500/20"
                        : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                    }`}
                  >
                    <div className="text-xl mb-1">{d.icon}</div>
                    <div className="font-bold text-xs">{d.label}</div>
                    <div className="text-[10.5px] text-slate-500 mt-0.5">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Health Goal */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Primary Health & Fitness Goal
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: "muscle_gain", label: "Improve Muscle & Toning", icon: "💪", desc: "High protein (1.6g/kg) & lean retention" },
                  { id: "weight_loss", label: "Lose Weight & Body Fat", icon: "🔻", desc: "Calorie deficit with high satiety & fiber" },
                  { id: "maintenance", label: "Maintain Weight & Longevity", icon: "⚖️", desc: "Metabolic balance per ICMR guidelines" },
                  { id: "weight_gain", label: "Healthy Weight Gain", icon: "🔺", desc: "Clean nutrient-dense surplus" },
                  { id: "blood_sugar_control", label: "Blood Sugar Stability", icon: "🩺", desc: "Low GI & carbs <=40% for diabetes" },
                  { id: "heart_health", label: "Heart Health & Lower BP", icon: "❤️", desc: "DASH diet & sodium <=1400mg" }
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleUpdate({ primary_goal: g.id as any })}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      profile.primary_goal === g.id
                        ? "border-teal-600 bg-teal-50 text-teal-900 shadow-sm ring-2 ring-teal-500/20"
                        : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base">{g.icon}</span>
                      <span className="font-bold text-xs">{g.label}</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 leading-tight">{g.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Physical Activity Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                    className={`p-3 rounded-2xl border text-xs text-left transition-all ${
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

        {/* TAB 2: MEDICAL CONDITIONS & LABS */}
        {activeTab === "conditions" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6 animate-in fade-in">
            
            {/* Selected conditions bar */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-amber-600" />
                  Active Clinical Conditions ({profile.health_conditions.length}):
                </span>
                {profile.health_conditions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleUpdate({ health_conditions: [] })}
                    className="text-[11px] text-amber-800 hover:underline font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {profile.health_conditions.length === 0 ? (
                  <span className="text-xs text-amber-800/80 italic">
                    No conditions selected. Click on conditions below to add them to your medical profile.
                  </span>
                ) : (
                  profile.health_conditions.map((cid) => {
                    const found = COMPREHENSIVE_CONDITIONS.find(c => c.id === cid);
                    return (
                      <span
                        key={cid}
                        className="px-3 py-1 rounded-xl bg-amber-200/80 text-amber-950 font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>{found?.icon || "🩺"}</span>
                        <span>{found?.label || cid}</span>
                        <button
                          type="button"
                          onClick={() => toggleCondition(cid)}
                          className="hover:text-amber-800 transition-colors ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            {/* Search & Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={conditionSearch}
                  onChange={(e) => setConditionSearch(e.target.value)}
                  placeholder="Search 26+ medical conditions (e.g. diabetes, uric acid, thyroid, gerd, celiac)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
                {[
                  { id: "all", label: "All (26)" },
                  { id: "metabolic", label: "Metabolic & Endocrine" },
                  { id: "cardiovascular", label: "Heart & BP" },
                  { id: "digestive", label: "Gut & Digestion" },
                  { id: "liver_kidney", label: "Liver & Kidney" },
                  { id: "musculoskeletal", label: "Bone & Joint" },
                  { id: "deficiencies", label: "Deficiencies" },
                  { id: "general", label: "Longevity & Lifestyle" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setConditionCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                      conditionCategory === cat.id
                        ? "bg-teal-700 text-white border-teal-700 shadow-2xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditions Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {filteredConditions.map((cond) => {
                const isChecked = profile.health_conditions.includes(cond.id);
                return (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => toggleCondition(cond.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                      isChecked
                        ? "border-amber-500 bg-amber-50/80 text-amber-950 font-bold shadow-2xs ring-1 ring-amber-400"
                        : "border-slate-200 text-slate-700 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cond.icon}</span>
                        <span className="text-xs font-bold leading-tight">{cond.label}</span>
                      </div>
                      {isChecked && (
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                        {cond.tag}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {cond.categoryLabel}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 font-normal leading-snug line-clamp-2">
                      {cond.icmrGuidance}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Laboratory Entries */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Recent Laboratory Records
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Fasting Sugar (mg/dL)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={fbsStr}
                    onChange={(e) => setFbsStr(e.target.value.replace(/[^0-9.]/g, ""))}
                    placeholder="105"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">HbA1c Level (%)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={hba1cStr}
                    onChange={(e) => setHba1cStr(e.target.value.replace(/[^0-9.]/g, ""))}
                    placeholder="5.8"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Blood Pressure (Sys/Dia)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="130"
                      value={sysBpStr}
                      onChange={(e) => setSysBpStr(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-white font-mono text-center"
                    />
                    <span className="text-slate-400 font-bold">/</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="85"
                      value={diaBpStr}
                      onChange={(e) => setDiaBpStr(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-white font-mono text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Total Cholesterol (mg/dL)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cholStr}
                    onChange={(e) => setCholStr(e.target.value.replace(/\D/g, ""))}
                    placeholder="195"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Triglycerides (mg/dL)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={trigStr}
                    onChange={(e) => setTrigStr(e.target.value.replace(/\D/g, ""))}
                    placeholder="150"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Serum Uric Acid (mg/dL)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={uricStr}
                    onChange={(e) => setUricStr(e.target.value.replace(/[^0-9.]/g, ""))}
                    placeholder="6.0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Last Checkup Date</label>
                  <input
                    type="date"
                    value={profile.medical_records.last_checkup_date || ""}
                    onChange={(e) => handleUpdate({
                      medical_records: {
                        ...profile.medical_records,
                        last_checkup_date: e.target.value
                      }
                    })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono bg-white"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: TARGETS */}
        {activeTab === "targets" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-teal-950">
                  Your Scientific ICMR-NIN 2024 Dietary Prescription
                </h4>
                <p className="text-xs text-teal-800 mt-0.5">
                  Calculated for a <strong>{ageStr}y {profile.gender}</strong> body, weight of <strong>{weightStr}kg</strong>, dietary pattern <strong>{profile.dietary_pattern}</strong>, and goal of <strong>{profile.primary_goal.replace(/_/g, " ")}</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Daily Calories</div>
                <div className="text-2xl font-black text-teal-700 font-mono mt-1">
                  {profile.daily_calorie_target} <span className="text-xs font-normal text-slate-500">kcal</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Protein Target</div>
                <div className="text-2xl font-black text-blue-700 font-mono mt-1">
                  {profile.daily_protein_target_g} <span className="text-xs font-normal text-slate-500">g</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Carb Limit</div>
                <div className="text-2xl font-black text-amber-700 font-mono mt-1">
                  {profile.daily_carb_target_g} <span className="text-xs font-normal text-slate-500">g</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Dietary Fiber</div>
                <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
                  {profile.daily_fiber_target_g} <span className="text-xs font-normal text-slate-500">g</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-cyan-50/80 border border-cyan-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-cyan-950 font-bold">
                  <Droplet className="w-4 h-4 text-cyan-600" />
                  <span>Pure Water Target (35ml/kg):</span>
                </div>
                <span className="font-mono font-extrabold text-cyan-800 text-sm">
                  {profile.daily_water_target_ml} ml
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-rose-950 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Daily Sodium Ceiling:</span>
                </div>
                <span className="font-mono font-extrabold text-rose-800 text-sm">
                  &le; {profile.daily_sodium_target_mg} mg
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Action Footer */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="text-xs text-slate-500">
            {savedSuccess ? (
              <span className="text-teal-600 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Profile saved! Recalibrating food recommendations...
              </span>
            ) : (
              "Any edits immediately update your AI recommendations, macro meters, and diary."
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Health Profile</span>
          </button>
        </div>

      </main>

    </div>
  );
}

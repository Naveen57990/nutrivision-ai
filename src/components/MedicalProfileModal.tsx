"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Sparkles,
  Search,
  Filter,
  Info
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
    triglycerides_mg_dl?: number;
    serum_uric_acid_mg_dl?: number;
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

export interface MedicalConditionDef {
  id: string;
  label: string;
  category: "metabolic" | "cardiovascular" | "digestive" | "liver_kidney" | "musculoskeletal" | "deficiencies" | "general";
  categoryLabel: string;
  tag: string;
  icon: string;
  icmrGuidance: string;
}

export const COMPREHENSIVE_CONDITIONS: MedicalConditionDef[] = [
  // 1. Metabolic & Endocrine
  {
    id: "diabetes",
    label: "Type 2 Diabetes (T2D)",
    category: "metabolic",
    categoryLabel: "Metabolic & Endocrine",
    tag: "Low GI • Carbs ≤42%",
    icon: "🩸",
    icmrGuidance: "Prioritizes soluble fiber (≥38g/day), unrefined grains, and complex carbohydrates ≤42% of total calories to prevent postprandial glucose surges."
  },
  {
    id: "prediabetes",
    label: "Prediabetes / Insulin Resistance",
    category: "metabolic",
    categoryLabel: "Metabolic & Endocrine",
    tag: "High Fiber • Low Glycemic",
    icon: "📉",
    icmrGuidance: "Pairs protein with high-viscosity fibers to slow carbohydrate gastric emptying and reverse cellular insulin resistance."
  },
  {
    id: "type1_diabetes",
    label: "Type 1 Diabetes (T1D)",
    category: "metabolic",
    categoryLabel: "Metabolic & Endocrine",
    tag: "Precise Carb Counting",
    icon: "💉",
    icmrGuidance: "Requires strict carbohydrate transparency and low glycemic index foods for predictable insulin bolus matching."
  },
  {
    id: "pcos",
    label: "PCOS / PCOD (Hormonal Imbalance)",
    category: "metabolic",
    categoryLabel: "Metabolic & Endocrine",
    tag: "Anti-Inflammatory • Anti-Androgen",
    icon: "🌸",
    icmrGuidance: "Targets hyperinsulinemia and high androgens with low-glycemic, inositol-rich seeds, lean proteins, and low saturated fats."
  },
  {
    id: "hypothyroidism",
    label: "Hypothyroidism (Underactive Thyroid)",
    category: "metabolic",
    categoryLabel: "Metabolic & Endocrine",
    tag: "Selenium & Zinc • Metabolic Support",
    icon: "🦋",
    icmrGuidance: "Provides selenium, zinc, and iodine while limiting raw goitrogens (uncooked cruciferous veggies) to boost metabolic rate."
  },
  {
    id: "hyperthyroidism",
    label: "Hyperthyroidism (Overactive Thyroid)",
    category: "metabolic",
    categoryLabel: "Metabolic & Endocrine",
    tag: "Nutrient-Dense • Calorie Support",
    icon: "⚡",
    icmrGuidance: "Provides high-density calories, calcium, and bone-sparing minerals to counterbalance elevated basal metabolic rate."
  },
  {
    id: "metabolic_syndrome",
    label: "Metabolic Syndrome (Cluster of Risk Factors)",
    category: "metabolic",
    categoryLabel: "Metabolic & Endocrine",
    tag: "Visceral Fat Reduction",
    icon: "🔄",
    icmrGuidance: "Comprehensive ICMR cardio-metabolic protocol targeting abdominal fat, insulin sensitivity, and triglyceride clearing."
  },

  // 2. Cardiovascular & Blood Pressure
  {
    id: "hypertension",
    label: "High Blood Pressure (Hypertension)",
    category: "cardiovascular",
    categoryLabel: "Cardiovascular & Blood Pressure",
    tag: "Sodium ≤1500mg • High Potassium",
    icon: "❤️",
    icmrGuidance: "DASH diet protocol: caps sodium at ≤1500mg/day, enhances potassium and magnesium intake to naturally relax vascular tone."
  },
  {
    id: "cholesterol",
    label: "High LDL Cholesterol / Dyslipidemia",
    category: "cardiovascular",
    categoryLabel: "Cardiovascular & Blood Pressure",
    tag: "Plant Sterols • Sat Fat <7%",
    icon: "🫀",
    icmrGuidance: "Restricts saturated and trans fats, replacing them with heart-healthy MUFAs/PUFAs and soluble beta-glucans to lower ApoB/LDL."
  },
  {
    id: "triglycerides",
    label: "High Triglycerides (Hypertriglyceridemia)",
    category: "cardiovascular",
    categoryLabel: "Cardiovascular & Blood Pressure",
    tag: "Zero Simple Sugars • Omega-3",
    icon: "🌊",
    icmrGuidance: "Eliminates refined sugars, juices, and processed carbs while elevating omega-3 fatty acids for hepatic VLDL suppression."
  },
  {
    id: "coronary_disease",
    label: "Heart Disease / Cardiac Wellness",
    category: "cardiovascular",
    categoryLabel: "Cardiovascular & Blood Pressure",
    tag: "Antioxidant Rich • Anti-Plaque",
    icon: "🩺",
    icmrGuidance: "High-antioxidant, plant-forward Mediterranean/Indian hybrid plate designed to prevent endothelial oxidative stress."
  },
  {
    id: "hypotension",
    label: "Low Blood Pressure (Chronic Hypotension)",
    category: "cardiovascular",
    categoryLabel: "Cardiovascular & Blood Pressure",
    tag: "Electrolyte Balance • Hydration",
    icon: "💧",
    icmrGuidance: "Ensures optimal plasma volume with liberal hydration, healthy electrolytes, and steady meal distribution to prevent postural dizziness."
  },

  // 3. Gastrointestinal & Digestive Health
  {
    id: "gerd",
    label: "GERD / Acid Reflux / Heartburn",
    category: "digestive",
    categoryLabel: "Gastrointestinal & Digestive",
    tag: "Low Acid • Non-Spicy • Gentle",
    icon: "🔥",
    icmrGuidance: "Avoids high-acid, excessively spicy, and deep-fried triggers; promotes soothing alkaline grains, gourds, and frequent smaller portions."
  },
  {
    id: "ibs",
    label: "Irritable Bowel Syndrome (IBS)",
    category: "digestive",
    categoryLabel: "Gastrointestinal & Digestive",
    tag: "Low FODMAP Friendly",
    icon: "🌿",
    icmrGuidance: "Minimizes fermentable oligosaccharides, disaccharides, and polyols to prevent gut distension, gas, and abdominal cramping."
  },
  {
    id: "constipation",
    label: "Chronic Constipation / Sluggish Gut",
    category: "digestive",
    categoryLabel: "Gastrointestinal & Digestive",
    tag: "High Insoluble Fiber • Hydration",
    icon: "🌾",
    icmrGuidance: "Boosts insoluble fiber from whole bran, psyllium, and flaxseeds alongside a strict 35ml/kg pure water intake target."
  },
  {
    id: "celiac",
    label: "Celiac Disease / Gluten Sensitivity",
    category: "digestive",
    categoryLabel: "Gastrointestinal & Digestive",
    tag: "100% Strict Gluten-Free",
    icon: "🚫",
    icmrGuidance: "Strict zero-gluten exclusion (no wheat, maida, barley, rye); substitutes with millets (jowar, bajra, ragi), quinoa, and brown rice."
  },
  {
    id: "lactose_intolerance",
    label: "Lactose Intolerance",
    category: "digestive",
    categoryLabel: "Gastrointestinal & Digestive",
    tag: "Dairy-Free / Fermented",
    icon: "🥛",
    icmrGuidance: "Eliminates fresh milk and paneer; recommends plant milks or well-fermented curds/dahi with near-zero residual lactose."
  },
  {
    id: "ibd",
    label: "Inflammatory Bowel Disease (Crohn's / Colitis)",
    category: "digestive",
    categoryLabel: "Gastrointestinal & Digestive",
    tag: "Gut-Healing • Anti-Inflammatory",
    icon: "🛡️",
    icmrGuidance: "Focuses on soft, easily digestible proteins and gut mucosal repair while avoiding harsh abrasive fibers during flare-ups."
  },
  {
    id: "gastritis",
    label: "Gastritis / Peptic Ulcer Healing",
    category: "digestive",
    categoryLabel: "Gastrointestinal & Digestive",
    tag: "Bland • Non-Irritating",
    icon: "🍵",
    icmrGuidance: "Protective bland diet: avoids chili, caffeine, and acidic tomatoes; emphasizes soothing moong khichdi, oats, and bottle gourd."
  },

  // 4. Liver & Kidney Health
  {
    id: "fatty_liver",
    label: "Non-Alcoholic Fatty Liver (NAFLD / NASH)",
    category: "liver_kidney",
    categoryLabel: "Liver & Kidney Health",
    tag: "Zero Fructose • Choline Rich",
    icon: "🍃",
    icmrGuidance: "Eliminates high-fructose syrups and refined fats; enhances choline, cruciferous veggies, and antioxidants to reduce hepatic fat accumulation."
  },
  {
    id: "uric_acid",
    label: "High Uric Acid / Gout Hyperuricemia",
    category: "liver_kidney",
    categoryLabel: "Liver & Kidney Health",
    tag: "Low Purine • Alkaline Urine",
    icon: "🦶",
    icmrGuidance: "Restricts high-purine items (red meat, organ meats, specific pulses); promotes cherries, vitamin C, and aggressive water flushing."
  },
  {
    id: "kidney_disease",
    label: "Chronic Kidney Disease (CKD Early Stages)",
    category: "liver_kidney",
    categoryLabel: "Liver & Kidney Health",
    tag: "Controlled Protein • Low Sodium",
    icon: "🧬",
    icmrGuidance: "Controls dietary protein to 0.8g/kg to reduce renal filtration pressure; monitors phosphorus and potassium loads."
  },
  {
    id: "kidney_stones",
    label: "Kidney Stones (Calcium Oxalate / Uric)",
    category: "liver_kidney",
    categoryLabel: "Liver & Kidney Health",
    tag: "Low Oxalate • High Hydration",
    icon: "💎",
    icmrGuidance: "Caps dietary oxalates (limits excess spinach/beetroot/nuts without calcium pairing) and ensures continuous urinary dilution."
  },

  // 5. Musculoskeletal & Bone Health
  {
    id: "osteoporosis",
    label: "Osteoporosis / Low Bone Density (Osteopenia)",
    category: "musculoskeletal",
    categoryLabel: "Bone & Joint Health",
    tag: "Calcium ≥1000mg • Vitamin D/K2",
    icon: "🦴",
    icmrGuidance: "Emphasizes bioavailable calcium (ragi, sesame seeds, curd), vitamin D co-factors, and bone matrix-building proteins."
  },
  {
    id: "arthritis",
    label: "Osteoarthritis / Joint Inflammation",
    category: "musculoskeletal",
    categoryLabel: "Bone & Joint Health",
    tag: "Anti-Inflammatory • Turmeric/Curcumin",
    icon: "🦵",
    icmrGuidance: "Anti-inflammatory diet: includes curcumin, ginger, cold-pressed oils, and omega-3s to alleviate cartilage inflammation."
  },

  // 6. Deficiencies & Blood Health
  {
    id: "vitamin_d_deficiency",
    label: "Vitamin D Deficiency",
    category: "deficiencies",
    categoryLabel: "Nutritional Deficiencies",
    tag: "Fortified Foods • Sunlight",
    icon: "☀️",
    icmrGuidance: "Pairs fat-soluble vitamin D absorption with healthy dietary fats; suggests mushrooms and fortified plant/dairy sources."
  },
  {
    id: "vitamin_b12_deficiency",
    label: "Vitamin B12 Deficiency",
    category: "deficiencies",
    categoryLabel: "Nutritional Deficiencies",
    tag: "Active B12 • Neurological Guard",
    icon: "🧠",
    icmrGuidance: "High priority for vegetarians/vegans; emphasizes fortified nutritional yeast, fermented foods, dairy, or targeted supplementation."
  },
  {
    id: "iron_anemia",
    label: "Iron Deficiency Anemia (Low Hemoglobin)",
    category: "deficiencies",
    categoryLabel: "Nutritional Deficiencies",
    tag: "Non-Heme Iron + Vitamin C",
    icon: "🩸",
    icmrGuidance: "Pairs iron-rich greens and pulses with vitamin C (amla, lemon juice) to amplify non-heme iron absorption by up to 300%."
  },

  // 7. General & Longevity
  {
    id: "high_stress",
    label: "High Stress & Elevated Cortisol",
    category: "general",
    categoryLabel: "Lifestyle & Longevity",
    tag: "Adaptogenic • Magnesium Rich",
    icon: "🧘",
    icmrGuidance: "Stabilizes adrenal axis with magnesium-rich seeds, pumpkin seeds, chamomile, and complex whole carbohydrates."
  },
  {
    id: "none",
    label: "None / General Preventive Longevity",
    category: "general",
    categoryLabel: "Lifestyle & Longevity",
    tag: "ICMR 2024 Golden Standard",
    icon: "🌱",
    icmrGuidance: "Standard balanced ICMR-NIN 2024 diet: 50% complex carbs, 20% protein, 30% healthy fats, 30g+ dietary fiber for optimal longevity."
  }
];

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

interface MedicalProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfile?: UserMedicalProfile;
  onProfileUpdated?: (profile: UserMedicalProfile) => void;
}

export default function MedicalProfileModal({ 
  isOpen, 
  onClose, 
  initialProfile,
  onProfileUpdated 
}: MedicalProfileModalProps) {
  const [profile, setProfile] = useState<UserMedicalProfile>(initialProfile || DEFAULT_PROFILE);
  const [activeTab, setActiveTab] = useState<"profile" | "medical_records" | "targets">("profile");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Smooth string input states to eliminate backspace / snap-back lock
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

  // Synchronize on modal open or initialProfile update
  useEffect(() => {
    if (isOpen) {
      let active = initialProfile;
      if (!active) {
        try {
          const stored = localStorage.getItem("nutrivision_user_profile");
          if (stored) active = JSON.parse(stored);
        } catch {}
      }
      const loaded = active || DEFAULT_PROFILE;
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
  }, [isOpen, initialProfile]);

  // Filtered conditions for search and category
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

  // Real-time ICMR-NIN 2024 Math Calculations
  const calculateTargets = (curr: UserMedicalProfile): UserMedicalProfile => {
    const age = Math.max(12, Math.min(110, curr.age || 29));
    const height_cm = Math.max(100, Math.min(240, curr.height_cm || 175));
    const weight_kg = Math.max(30, Math.min(220, curr.weight_kg || 72));
    const { gender, primary_goal, activity_level, health_conditions } = curr;

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
      tdee -= 450;
    } else if (primary_goal === "muscle_gain") {
      tdee += 250;
    } else if (primary_goal === "weight_gain") {
      tdee += 450;
    }

    const dailyCalories = Math.max(1200, Math.round(tdee));

    // 4. Protein Calculation
    let proteinPerKg = 1.0;
    if (primary_goal === "muscle_gain") proteinPerKg = 1.6;
    else if (primary_goal === "weight_loss") proteinPerKg = 1.3;

    // Renal protection: If chronic kidney disease, cap protein at 0.8g/kg
    if (health_conditions.includes("kidney_disease")) {
      proteinPerKg = Math.min(proteinPerKg, 0.85);
    }

    const dailyProtein = Math.round(weight_kg * proteinPerKg);

    // 5. Carb & Fat distribution (ICMR 2024: Carbs <= 42% if diabetic/prediabetic/PCOS)
    const isDiabetic = health_conditions.some(c => 
      c.includes("diabetes") || c.includes("prediabetes") || c.includes("pcos") || c.includes("metabolic_syndrome")
    );
    const carbPercent = isDiabetic ? 0.40 : 0.50;
    const dailyCarbs = Math.round((dailyCalories * carbPercent) / 4);

    const fatCalories = dailyCalories - (dailyProtein * 4 + dailyCarbs * 4);
    const dailyFat = Math.max(35, Math.round(fatCalories / 9));

    // 6. Fiber & Water
    let dailyFiber = isDiabetic ? 38 : 32;
    if (health_conditions.includes("constipation")) dailyFiber = Math.max(dailyFiber, 42);

    let dailyWater = Math.round((weight_kg * 35) / 50) * 50;
    if (health_conditions.includes("uric_acid") || health_conditions.includes("kidney_stones")) {
      dailyWater = Math.max(dailyWater, 3000);
    }

    // 7. Sodium limit (<1500mg if hypertension or heart condition)
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

    if (onProfileUpdated) {
      onProfileUpdated(finalProfile);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  const currentWeight = parseFloat(weightStr) || profile.weight_kg || 72;
  const currentHeight = parseInt(heightStr, 10) || profile.height_cm || 175;
  const bmi = (currentWeight / ((currentHeight / 100) ** 2)).toFixed(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-teal-100 overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-900 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
              <User className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Personalized Health & Medical Profile</h2>
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
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 gap-2 sm:gap-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "profile"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Demographics & Goals
          </button>
          <button
            onClick={() => setActiveTab("medical_records")}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "medical_records"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            Medical Conditions ({profile.health_conditions.length})
          </button>
          <button
            onClick={() => setActiveTab("targets")}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "targets"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Nutrition Prescription
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800 flex-1">
          
          {/* TAB 1: PROFILE & DEMOGRAPHICS */}
          {activeTab === "profile" && (
            <div className="space-y-5 animate-in fade-in">
              {/* Demographics Grid with smooth string editing */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Age (Years)</label>
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
                    placeholder="29"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-white font-mono"
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
                    placeholder="175"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Weight (kg)</label>
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
                    placeholder="72"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-white font-mono"
                  />
                </div>
              </div>

              {/* BMI Live Display */}
              <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/60 flex items-center justify-between text-xs text-teal-950">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-teal-600" />
                  <span>Calculated Body Mass Index (BMI): <strong>{bmi} kg/m²</strong></span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-200/60 font-bold text-teal-900 text-[11px]">
                  {parseFloat(bmi) < 18.5 ? "Underweight" : parseFloat(bmi) <= 24.9 ? "Normal weight" : "Overweight"}
                </span>
              </div>

              {/* Dietary Pattern Selection */}
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
                    { id: "blood_sugar_control", label: "Blood Sugar Stability", icon: "🩺", desc: "Low GI & carbs <=42% for diabetes" },
                    { id: "heart_health", label: "Heart Health & Lower BP", icon: "❤️", desc: "DASH diet & sodium <=1400mg" }
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

          {/* TAB 2: MEDICAL CONDITIONS DIRECTORY & LAB RECORDS */}
          {activeTab === "medical_records" && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Selected Conditions Active Bar */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-amber-600" />
                    Selected Medical Conditions ({profile.health_conditions.length}):
                  </span>
                  {profile.health_conditions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleUpdate({ health_conditions: [] })}
                      className="text-[11px] text-amber-700 hover:underline font-semibold"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {profile.health_conditions.length === 0 ? (
                    <span className="text-xs text-amber-700/80 italic">
                      No conditions selected. Click on conditions below to add them to your medical profile.
                    </span>
                  ) : (
                    profile.health_conditions.map((cid) => {
                      const found = COMPREHENSIVE_CONDITIONS.find(c => c.id === cid);
                      return (
                        <span
                          key={cid}
                          className="px-2.5 py-1 rounded-xl bg-amber-200/80 text-amber-950 font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>{found?.icon || "🩺"}</span>
                          <span>{found?.label || cid}</span>
                          <button
                            type="button"
                            onClick={() => toggleCondition(cid)}
                            className="hover:text-amber-800 transition-colors ml-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Conditions Search and Category Tabs */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={conditionSearch}
                      onChange={(e) => setConditionSearch(e.target.value)}
                      placeholder="Search conditions (e.g. diabetes, uric acid, thyroid, gerd, celiac)..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50"
                    />
                  </div>

                  <div className="text-[11px] text-slate-500 shrink-0">
                    Showing {filteredConditions.length} of {COMPREHENSIVE_CONDITIONS.length} conditions
                  </div>
                </div>

                {/* Category Pills */}
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
                      className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all border ${
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                {filteredConditions.map((cond) => {
                  const isChecked = profile.health_conditions.includes(cond.id);
                  return (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => toggleCondition(cond.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                        isChecked
                          ? "border-amber-500 bg-amber-50/80 text-amber-950 font-bold shadow-2xs ring-1 ring-amber-400"
                          : "border-slate-200 text-slate-700 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{cond.icon}</span>
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

                      <p className="text-[10.5px] text-slate-500 font-normal leading-snug line-clamp-2">
                        {cond.icmrGuidance}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Lab & Clinical Health Record Inputs */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Recent Laboratory & Health Records
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Optional clinical grounding</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Fasting Sugar (mg/dL)
                    </label>
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
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      HbA1c Level (%)
                    </label>
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
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      BP (Sys / Dia)
                    </label>
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
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Cholesterol (mg/dL)
                    </label>
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
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Triglycerides (mg/dL)
                    </label>
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
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Uric Acid (mg/dL)
                    </label>
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
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Last Checkup Date
                    </label>
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

          {/* TAB 3: TARGETS & ICMR PRESCRIPTION */}
          {activeTab === "targets" && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-teal-950">
                    Your Personalized ICMR-NIN 2024 Dietary Prescription
                  </h4>
                  <p className="text-xs text-teal-800 mt-0.5">
                    Scientifically calculated for your <strong>{ageStr} yr old {profile.gender}</strong> body, weight of <strong>{weightStr}kg</strong>, dietary pattern <strong>{profile.dietary_pattern}</strong>, and goal of <strong>{profile.primary_goal.replace(/_/g, " ")}</strong>.
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
                    <span>Daily Sodium Ceiling:</span>
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

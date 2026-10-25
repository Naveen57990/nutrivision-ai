"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  ChefHat, 
  Scale, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Flame, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Loader2,
  RefreshCw,
  Utensils,
  Leaf,
  Drumstick,
  Heart,
  Bot
} from "lucide-react";
import { UserMedicalProfile } from "./MedicalProfileModal";
import SuitabilityBadge from "./SuitabilityBadge";

interface SmartFoodIntelligenceStudioProps {
  userProfile: UserMedicalProfile;
  onOpenProfile: () => void;
  onOpenAISettings: () => void;
  onLogMeal: (meal: any) => void;
}

export default function SmartFoodIntelligenceStudio({
  userProfile,
  onOpenProfile,
  onOpenAISettings,
  onLogMeal
}: SmartFoodIntelligenceStudioProps) {
  const [inputMode, setInputMode] = useState<"text" | "upload" | "camera">("text");
  const [textInput, setTextInput] = useState("Paneer, Spinach, Tomatoes, Whole wheat flour");
  const [dietFilter, setDietFilter] = useState<"vegetarian" | "non_vegetarian">(
    userProfile.dietary_pattern === "non_vegetarian" ? "non_vegetarian" : "vegetarian"
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [resultsSummary, setResultsSummary] = useState<string>("");
  const [activeProvider, setActiveProvider] = useState<string>("Smart ICMR Engine");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Quick Ingredient Tags for easy 1-click addition
  const QUICK_TAGS = [
    { name: "Paneer", veg: true },
    { name: "Spinach (Palak)", veg: true },
    { name: "Moong Dal", veg: true },
    { name: "Sprouts", veg: true },
    { name: "Eggs", veg: false },
    { name: "Chicken Breast", veg: false },
    { name: "Curd / Dahi", veg: true },
    { name: "Whole Wheat Atta", veg: true },
    { name: "Brown Rice", veg: true },
    { name: "Tomatoes & Onion", veg: true },
  ];

  const handleTagClick = (tag: string) => {
    if (textInput.includes(tag)) return;
    setTextInput(prev => prev ? `${prev}, ${tag}` : tag);
  };

  // Image Upload Handler
  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Camera Handler
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      alert("Camera permission denied or camera not available. You can upload an image file instead.");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setImagePreview(dataUrl);
        // Convert to file
        fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => {
            setSelectedFile(new File([blob], "camera-capture.jpg", { type: "image/jpeg" }));
          });
      }
      // Stop tracks
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(t => t.stop());
      setIsCameraActive(false);
    }
  };

  // Execute AI Recommendation Query
  const generateRecommendations = async () => {
    setLoading(true);
    setResults(null);
    try {
      // 1. If image mode and file exists, run optical scan first to extract items
      let scannedTerms = "";
      if ((inputMode === "upload" || inputMode === "camera") && selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const scanRes = await fetch("/api/scan", {
          method: "POST",
          body: formData
        });
        if (scanRes.ok) {
          const scanData = await scanRes.json();
          scannedTerms = (scanData.candidates || []).map((c: any) => c.dish_name).join(", ");
          if (scanData.provider) setActiveProvider(scanData.provider.toUpperCase());
        }
      }

      // 2. Query Food Intelligence API
      const payload = {
        rawInput: scannedTerms || textInput,
        dishName: textInput,
        userProfile: userProfile,
        dietaryPreference: dietFilter
      };

      const res = await fetch("/api/food-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.recommendations || []);
        setResultsSummary(data.summary || "");
        if (data.provider) setActiveProvider(data.provider.toUpperCase());
      } else {
        throw new Error("Unable to fetch recommendations");
      }
    } catch (err: any) {
      alert("Error: " + (err.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Personalized User Clinical Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold">Personalized Food & Nutrition Intelligence</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-200 border border-teal-400/30">
                ICMR-NIN 2024 Calibrated
              </span>
            </div>
            <p className="text-xs text-teal-100/80 mt-0.5">
              Profile: <strong>{userProfile.age}y {userProfile.gender}</strong> ({userProfile.weight_kg}kg, {userProfile.height_cm}cm) • Diet: <strong>{userProfile.dietary_pattern}</strong> • Goal: <strong>{userProfile.primary_goal.replace(/_/g, " ")}</strong>
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-teal-200">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-300" /> Conditions: {userProfile.health_conditions.join(", ") || "None"}
              </span>
              <span>•</span>
              <span>Target: <strong>{userProfile.daily_calorie_target} kcal</strong> | <strong>{userProfile.daily_protein_target_g}g protein</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenProfile}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            ✏️ Edit Health Records
          </button>
          <button
            onClick={onOpenAISettings}
            className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-teal-950 text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5" /> AI Engine Settings
          </button>
        </div>
      </div>

      {/* Input Options Card: Upload Image OR Enter Text */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              Step 1: Provide Available Ingredients or Dish Name
            </h3>
            <p className="text-xs text-slate-500">
              Upload a picture of your kitchen ingredients/plate, or simply type their names.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setInputMode("text")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                inputMode === "text"
                  ? "bg-white text-teal-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ✍️ Enter Text
            </button>
            <button
              type="button"
              onClick={() => setInputMode("upload")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                inputMode === "upload"
                  ? "bg-white text-teal-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📸 Upload Photo
            </button>
            <button
              type="button"
              onClick={() => { setInputMode("camera"); startCamera(); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                inputMode === "camera"
                  ? "bg-white text-teal-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📷 Live Camera
            </button>
          </div>
        </div>

        {/* Dietary Preference Filter Switch (Vegetarian vs Non-Vegetarian) */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-600">Dietary Filter:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDietFilter("vegetarian")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                dietFilter === "vegetarian"
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Leaf className="w-3.5 h-3.5" /> 🥬 Vegetarian Only
            </button>
            <button
              type="button"
              onClick={() => setDietFilter("non_vegetarian")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                dietFilter === "non_vegetarian"
                  ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Drumstick className="w-3.5 h-3.5" /> 🍗 Non-Vegetarian (Eggs/Chicken)
            </button>
          </div>
        </div>

        {/* Input Mode A: Text Input */}
        {inputMode === "text" && (
          <div className="space-y-3 animate-in fade-in">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Type ingredients you have or dish name (comma-separated):
              </label>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="e.g. Paneer, Spinach, Tomatoes, Garlic, Whole wheat atta"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none shadow-inner"
              />
            </div>

            {/* Quick ingredient chips */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Add Popular Ingredients:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAGS.filter(t => dietFilter === "non_vegetarian" || t.veg).map(tag => (
                  <button
                    key={tag.name}
                    type="button"
                    onClick={() => handleTagClick(tag.name)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-900 border border-slate-200 text-slate-700 text-xs transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 text-slate-400" />
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Mode B: Upload Image */}
        {inputMode === "upload" && (
          <div className="space-y-3 animate-in fade-in">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleImageSelect(e.target.files[0]);
                }
              }}
            />

            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-teal-300 hover:border-teal-500 rounded-3xl p-8 text-center cursor-pointer transition-colors bg-teal-50/40 hover:bg-teal-50/80 flex flex-col items-center justify-center gap-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-sm">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    Click to browse or drop food / ingredients photo
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Supports JPG, PNG, WEBP. Multimodal AI scans your plate or kitchen counter.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-64 flex items-center justify-center bg-black/5">
                <img
                  src={imagePreview}
                  alt="Food Preview"
                  className="max-h-64 object-contain"
                />
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setImagePreview(null); }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Input Mode C: Live Camera */}
        {inputMode === "camera" && (
          <div className="space-y-3 animate-in fade-in">
            {isCameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-black flex flex-col items-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-h-72 object-cover"
                />
                <div className="p-4 bg-slate-900/90 w-full flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-6 py-2.5 rounded-full bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold text-xs shadow-lg flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" /> Capture Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const stream = videoRef.current?.srcObject as MediaStream;
                      stream?.getTracks().forEach(t => t.stop());
                      setIsCameraActive(false);
                    }}
                    className="px-4 py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-64 flex items-center justify-center bg-black/5">
                <img
                  src={imagePreview}
                  alt="Captured Food"
                  className="max-h-64 object-contain"
                />
                <button
                  type="button"
                  onClick={() => { setImagePreview(null); startCamera(); }}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-bold transition-colors"
                >
                  Retake Photo
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" />
            AI will answer: <em>What to make</em> • <em>How much to eat</em> • <em>How it achieves your goal</em>
          </div>

          <button
            type="button"
            onClick={generateRecommendations}
            disabled={loading || (inputMode === "text" && !textInput.trim()) || (inputMode !== "text" && !selectedFile && !imagePreview)}
            className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing with {activeProvider}...
              </>
            ) : (
              <>
                <ChefHat className="w-4 h-4" />
                Get Personalized Food Intelligence
              </>
            )}
          </button>
        </div>

      </div>

      {/* Results Section: The 3 Answers */}
      {results && results.length > 0 && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Personalized Meal Recommendations
              </h3>
              <p className="text-xs text-slate-500">{resultsSummary}</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" /> Engine: {activeProvider}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {results.map((rec, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-3xl border border-teal-200/80 shadow-md overflow-hidden hover:shadow-xl transition-all"
              >
                {/* Recipe Card Header */}
                <div className="p-6 bg-gradient-to-r from-teal-50/80 via-emerald-50/50 to-white border-b border-teal-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xl font-extrabold text-slate-900">
                        {rec.dish_name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rec.is_vegetarian 
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                          : "bg-rose-100 text-rose-800 border border-rose-200"
                      }`}>
                        {rec.is_vegetarian ? "🥬 Vegetarian" : "🍗 Non-Vegetarian"}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" /> {rec.prep_time_minutes} mins
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                      <span><strong>Ingredients used:</strong> {rec.ingredients_used?.join(", ")}</span>
                      {rec.missing_ingredients?.length > 0 && (
                        <span className="text-amber-700">
                          (Need: {rec.missing_ingredients.join(", ")})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Log Button */}
                  <button
                    type="button"
                    onClick={() => {
                      onLogMeal({
                        meal_type: "lunch",
                        items: [{
                          food_name: rec.dish_name,
                          weight_grams: 250,
                          calories: rec.nutrition.calories,
                          protein: rec.nutrition.protein_g,
                          carbs: rec.nutrition.carbs_g,
                          fiber: rec.nutrition.fiber_g
                        }],
                        total_calories: rec.nutrition.calories,
                        total_protein: rec.nutrition.protein_g,
                        total_carbs: rec.nutrition.carbs_g,
                        total_fiber: rec.nutrition.fiber_g
                      });
                      alert(`Logged "${rec.dish_name}" to your Daily Meals Tracker!`);
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0 self-start md:self-auto"
                  >
                    <Plus className="w-4 h-4" /> Log to Today&apos;s Diary
                  </button>
                </div>

                {/* The 3 Core Pillars in 3 Columns */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                  
                  {/* Pillar 1: What can you make & Quick Steps */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                      <ChefHat className="w-4 h-4 text-teal-600" />
                      <h4>1. Preparation Guide</h4>
                    </div>
                    <div className="space-y-2">
                      {(rec.quick_steps || []).map((step: string, sIdx: number) => (
                        <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                          <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pillar 2: How much should you eat? (Personalized Portion) */}
                  <div className="pt-4 lg:pt-0 lg:px-4 space-y-3">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                      <Scale className="w-4 h-4 text-blue-600" />
                      <h4>2. How Much Should You Eat?</h4>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                      <div className="text-xs font-extrabold text-blue-950 font-mono">
                        Serving Size: {rec.portion_guidance?.serving_size}
                      </div>
                      <p className="text-xs text-blue-900 leading-relaxed">
                        {rec.portion_guidance?.reasoning}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      💡 <strong>ICMR Portion Rule:</strong> Keep added cooking oil under 1-2 tsp to preserve cardiac health.
                    </div>
                  </div>

                  {/* Pillar 3: What you will get & How it achieves your goal */}
                  <div className="pt-4 lg:pt-0 lg:pl-4 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                      <Target className="w-4 h-4 text-emerald-600" />
                      <h4>3. What You Get & Goal Impact</h4>
                    </div>

                    {/* Macro Breakdown Chips */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold">CALORIES</div>
                        <div className="text-sm font-extrabold text-teal-800 font-mono">
                          {rec.nutrition?.calories}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold">PROTEIN</div>
                        <div className="text-sm font-extrabold text-blue-800 font-mono">
                          {rec.nutrition?.protein_g}g
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold">FIBER</div>
                        <div className="text-sm font-extrabold text-emerald-800 font-mono">
                          {rec.nutrition?.fiber_g}g
                        </div>
                      </div>
                    </div>

                    {/* Goal Achievement Explanation */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                      <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Achieving: {rec.goal_impact?.goal_name}
                      </div>
                      <p className="text-xs text-emerald-900 leading-relaxed">
                        {rec.goal_impact?.summary}
                      </p>
                    </div>

                    {/* Medical Condition Check */}
                    {rec.goal_impact?.medical_notes && (
                      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-950 flex items-start gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span><strong>Clinical Safeguard:</strong> {rec.goal_impact.medical_notes}</span>
                      </div>
                    )}

                  </div>

                </div>

              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Camera,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Plus,
  ArrowRight,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Flame,
  ShieldAlert,
  Leaf
} from "lucide-react";
import { ApiClient } from "@/lib/api";
import FoodImage from "@/components/FoodImage";
import SuitabilityBadge from "@/components/SuitabilityBadge";

export default function FoodScannerPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState("Looking at your meal...");
  const [scanResult, setScanResult] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [uncertaintyNote, setUncertaintyNote] = useState("");
  const [demoScenarios, setDemoScenarios] = useState<any[]>([]);
  const [logging, setLogging] = useState(false);
  const [nutritionReport, setNutritionReport] = useState<any>(null);

  useEffect(() => {
    ApiClient.getDemoScenarios()
      .then((res) => setDemoScenarios(res.scenarios))
      .catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setNutritionReport(null);
      processUpload(selected);
    }
  };

  const processUpload = async (imageFile: File) => {
    setAnalyzing(true);
    setAnalysisProgress("Looking at your meal...");
    
    // Simulate real status progression
    setTimeout(() => setAnalysisProgress("Identifying dishes and components..."), 400);
    setTimeout(() => setAnalysisProgress("Estimating household portions..."), 800);

    try {
      const res = await ApiClient.scanImage(imageFile);
      setScanResult(res);
      setCandidates(res.candidates);
      setUncertaintyNote(res.scan_uncertainty_note);
    } catch (err: any) {
      alert(err.message || "Failed to process image.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectDemoScenario = (scenario: any) => {
    setPreviewUrl(scenario.image_url);
    setCandidates(scenario.candidates);
    setUncertaintyNote("Visual note: Preset multi-dish Indian meal loaded for deterministic analysis.");
    setNutritionReport(null);
  };

  const handleUpdateItemWeight = (index: number, newWeight: number) => {
    const updated = [...candidates];
    updated[index].suggested_weight_grams = Math.max(10, newWeight);
    setCandidates(updated);
  };

  const handleRemoveCandidate = (index: number) => {
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const handleEvaluateMeal = async () => {
    if (candidates.length === 0) return;
    setAnalyzing(true);
    setAnalysisProgress("Generating verified nutritional report...");
    try {
      const itemsPayload = candidates.map((c) => ({
        food_item_id: c.matched_food_id || null,
        food_name: c.dish_name,
        serving_quantity: 1.0,
        serving_unit: c.household_measure,
        weight_grams: c.suggested_weight_grams,
      }));

      const report = await ApiClient.evaluateMeal(itemsPayload, "Lunch");
      setNutritionReport(report);
    } catch (err: any) {
      alert(err.message || "Evaluation failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLogToTracker = async () => {
    if (candidates.length === 0) return;
    setLogging(true);
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const itemsPayload = candidates.map((c) => ({
        food_item_id: c.matched_food_id || null,
        food_name: c.dish_name,
        serving_quantity: 1.0,
        serving_unit: c.household_measure,
        weight_grams: c.suggested_weight_grams,
      }));

      await ApiClient.logMeal({
        meal_type: "lunch",
        date_str: todayStr,
        source_method: "scan",
        image_url: previewUrl || "",
        items: itemsPayload,
      });

      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message || "Failed to log meal.");
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#20312F] tracking-tight">
          AI Food Scanner
        </h1>
        <p className="text-sm text-[#5A6D6B] mt-1">
          Capture or upload your meal. We break down mixed thalis into individual verified items.
        </p>
      </div>

      {/* Upload & Scenario Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Image Upload Area */}
        <div className="md:col-span-7 space-y-4">
          <div className="border-2 border-dashed border-[#42BFA5]/40 rounded-3xl p-6 bg-white card-shadow text-center relative overflow-hidden">
            {previewUrl ? (
              <div className="space-y-4">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/5">
                  <Image
                    src={previewUrl}
                    alt="Analyzed food"
                    fill
                    className="object-cover"
                  />
                  {analyzing && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4">
                      <div className="w-10 h-10 border-4 border-white/30 border-t-[#42BFA5] rounded-full animate-spin mb-3" />
                      <p className="text-sm font-bold">{analysisProgress}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center pt-2">
                  <label className="text-xs font-bold text-[#177E75] hover:underline cursor-pointer">
                    <span>Change Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-[#8E9F9D]">
                    {candidates.length} item(s) detected
                  </span>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center py-10 cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-[#E9F8F3] text-[#42BFA5] flex items-center justify-center mb-4 card-shadow">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-base text-[#20312F]">
                  Snap a photo or upload meal image
                </h3>
                <p className="text-xs text-[#5A6D6B] mt-1 max-w-xs">
                  Supports JPEG, PNG, WebP up to 10MB. Mixed thalis, rotis, and curries supported.
                </p>
                <div className="mt-4 px-5 py-2.5 rounded-xl bg-[#42BFA5] text-white font-bold text-xs hover:bg-[#38a892] transition-colors card-shadow">
                  Choose Image
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Fallback to Manual Entry */}
          <div className="p-4 rounded-2xl bg-[#F7FAFC] border border-[#E2ECEB] flex items-center justify-between">
            <span className="text-xs text-[#5A6D6B]">
              Camera not available or preferred to search?
            </span>
            <button
              onClick={() => router.push("/foods")}
              className="text-xs font-bold text-[#177E75] hover:underline"
            >
              Manual Food Entry →
            </button>
          </div>
        </div>

        {/* Right Column: Clickable Sample Scenarios */}
        <div className="md:col-span-5 space-y-3">
          <h3 className="text-sm font-bold text-[#20312F]">Or try an authentic demo meal:</h3>
          <div className="space-y-2.5">
            {demoScenarios.map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleSelectDemoScenario(sc)}
                className="w-full p-3.5 rounded-2xl bg-white border border-[#E2ECEB] card-shadow card-shadow-hover text-left flex items-center gap-3 transition-all"
              >
                <FoodImage
                  foodName={sc.title}
                  className="w-14 h-14 rounded-xl shrink-0"
                  aspectRatio="square"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-[#20312F] truncate">{sc.title}</h4>
                  <p className="text-[11px] text-[#5A6D6B] line-clamp-1 mt-0.5">{sc.description}</p>
                  <span className="text-[10px] font-bold text-[#177E75] mt-1 inline-block">
                    Select Scenario →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Identified Foods Review & Confirmation */}
      {candidates.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2ECEB] card-shadow space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EDF3F3] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#20312F]">Review Identified Dishes</h2>
              <p className="text-xs text-[#5A6D6B]">
                Adjust weights or household servings before generating your verified report.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E9F8F3] text-[#177E75] self-start sm:self-auto">
              {candidates.length} Components Confirmed
            </span>
          </div>

          {/* Uncertainty notice */}
          {uncertaintyNote && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#EDF5FF] text-[#377BC4] border border-[#377BC4]/20 text-xs">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{uncertaintyNote}</span>
            </div>
          )}

          {/* Candidates List */}
          <div className="space-y-3">
            {candidates.map((c, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#F7FAFC] border border-[#E2ECEB] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E9F8F3] text-[#177E75] flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#20312F]">{c.dish_name}</h4>
                    <p className="text-xs text-[#8E9F9D]">
                      Default: {c.household_measure} • Confidence: {Math.round(c.confidence * 100)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="flex items-center gap-1.5 bg-white border border-[#E2ECEB] rounded-xl px-2.5 py-1.5">
                    <input
                      type="number"
                      min={10}
                      max={800}
                      value={c.suggested_weight_grams}
                      onChange={(e) => handleUpdateItemWeight(idx, Number(e.target.value))}
                      className="w-16 text-center text-sm font-bold text-[#20312F] focus:outline-none"
                    />
                    <span className="text-xs text-[#8E9F9D]">grams</span>
                  </div>

                  <button
                    onClick={() => handleRemoveCandidate(idx)}
                    className="p-2 text-[#8E9F9D] hover:text-[#C94B53] hover:bg-[#FFF0F1] rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={() => router.push("/foods")}
              className="text-xs font-bold text-[#177E75] hover:underline"
            >
              + Add another dish from database
            </button>

            <button
              onClick={handleEvaluateMeal}
              disabled={analyzing}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#42BFA5] to-[#177E75] text-white font-bold text-sm shadow hover:shadow-md transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Confirm & Generate Nutrition Report</span>
            </button>
          </div>
        </div>
      )}

      {/* Generated Nutrition Report Display */}
      {nutritionReport && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#42BFA5]/30 card-shadow space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EDF3F3] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <SuitabilityBadge
                  status={nutritionReport.suitability.overall_status}
                  label={nutritionReport.suitability.status_label}
                />
              </div>
              <h2 className="text-xl font-black text-[#20312F] mt-2">Verified Nutrition Report</h2>
              <p className="text-xs text-[#5A6D6B]">{nutritionReport.household_portion_summary}</p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-3xl font-black text-[#177E75]">
                {nutritionReport.nutrients.calories}
              </span>
              <span className="text-xs text-[#8E9F9D] block">Total kcal</span>
            </div>
          </div>

          {/* Macro Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#F7FAFC] border border-[#E2ECEB] text-center">
              <span className="text-[10px] uppercase font-bold text-[#8E9F9D]">Protein</span>
              <p className="text-lg font-black text-[#20312F]">{nutritionReport.nutrients.protein}g</p>
              <span className="text-[10px] text-[#5A6D6B]">({nutritionReport.nutrients.protein_percent}% energy)</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F7FAFC] border border-[#E2ECEB] text-center">
              <span className="text-[10px] uppercase font-bold text-[#8E9F9D]">Carbohydrates</span>
              <p className="text-lg font-black text-[#20312F]">{nutritionReport.nutrients.carbs}g</p>
              <span className="text-[10px] text-[#5A6D6B]">({nutritionReport.nutrients.carbs_percent}% energy)</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F7FAFC] border border-[#E2ECEB] text-center">
              <span className="text-[10px] uppercase font-bold text-[#8E9F9D]">Fat</span>
              <p className="text-lg font-black text-[#20312F]">{nutritionReport.nutrients.fat}g</p>
              <span className="text-[10px] text-[#5A6D6B]">({nutritionReport.nutrients.fat_percent}% energy)</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#E8F7EF] border border-[#218C68]/20 text-center">
              <span className="text-[10px] uppercase font-bold text-[#218C68]">Dietary Fiber</span>
              <p className="text-lg font-black text-[#218C68]">{nutritionReport.nutrients.fiber}g</p>
              <span className="text-[10px] text-[#218C68]">ICMR target: 30g</span>
            </div>
          </div>

          {/* Micronutrients */}
          <div className="p-4 rounded-2xl bg-[#F7FAFC] border border-[#E2ECEB] space-y-2">
            <h4 className="text-xs font-bold text-[#5A6D6B] uppercase">Micronutrients & Minerals</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-[#8E9F9D]">Sodium:</span>{" "}
                <strong className="text-[#20312F]">{nutritionReport.nutrients.sodium} mg</strong>
              </div>
              <div>
                <span className="text-[#8E9F9D]">Potassium:</span>{" "}
                <strong className="text-[#20312F]">{nutritionReport.nutrients.potassium} mg</strong>
              </div>
              <div>
                <span className="text-[#8E9F9D]">Calcium:</span>{" "}
                <strong className="text-[#20312F]">{nutritionReport.nutrients.calcium} mg</strong>
              </div>
              <div>
                <span className="text-[#8E9F9D]">Iron:</span>{" "}
                <strong className="text-[#20312F]">{nutritionReport.nutrients.iron} mg</strong>
              </div>
            </div>
          </div>

          {/* Personalized Insights & Actionable Guidance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#20312F] uppercase">Personalized Nutritional Assessment</h4>
            
            {/* Allergy Warnings */}
            {nutritionReport.suitability.allergy_warnings.map((warn: string, i: number) => (
              <div key={i} className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FFF0F1] text-[#C94B53] border border-[#C94B53]/20 text-xs font-semibold">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{warn}</span>
              </div>
            ))}

            {/* Health Alerts */}
            {nutritionReport.suitability.health_alerts.map((alertStr: string, i: number) => (
              <div key={i} className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FFF5E5] text-[#B87921] border border-[#B87921]/20 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{alertStr}</span>
              </div>
            ))}

            {/* Actionable Tips */}
            {nutritionReport.suitability.actionable_tips.map((tip: string, i: number) => (
              <div key={i} className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#E9F8F3] text-[#177E75] border border-[#42BFA5]/20 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>

          {/* Log to Tracker Button */}
          <div className="pt-4 border-t border-[#EDF3F3] flex justify-end">
            <button
              onClick={handleLogToTracker}
              disabled={logging}
              className="px-6 py-3.5 rounded-xl bg-[#177E75] text-white font-bold text-sm hover:bg-[#12645e] transition-colors card-shadow"
            >
              {logging ? "Logging..." : "Save & Log This Meal to Tracker"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

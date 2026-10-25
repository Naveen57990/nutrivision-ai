"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Camera,
  ChefHat,
  ShieldCheck,
  ArrowRight,
  Leaf,
  CheckCircle2,
  Scale,
  Brain,
  Flame,
  Clock,
  Play
} from "lucide-react";
import { ApiClient } from "@/lib/api";
import FoodImage from "@/components/FoodImage";
import SuitabilityBadge from "@/components/SuitabilityBadge";

export default function LandingPage() {
  const router = useRouter();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleLaunchDemo = async () => {
    setIsDemoLoading(true);
    try {
      await ApiClient.demoLogin();
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#20312F]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E2ECEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#42BFA5] to-[#177E75] flex items-center justify-center text-white shadow-sm">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#177E75]">NutriVision</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E9F8F3] text-[#218C68]">
                ICMR-NIN Aligned
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-[#5A6D6B] hover:text-[#20312F] px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={handleLaunchDemo}
              disabled={isDemoLoading}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-[#42BFA5] text-white hover:bg-[#38a892] transition-all card-shadow card-shadow-hover"
            >
              {isDemoLoading ? (
                <span>Entering Demo...</span>
              ) : (
                <>
                  <span>Explore Live Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline & Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9F8F3] border border-[#42BFA5]/30 text-xs font-bold text-[#177E75]">
                <Sparkles className="w-3.5 h-3.5 text-[#42BFA5]" />
                <span>Available-Food-First Nutrition Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#20312F] leading-[1.12]">
                Better food choices,{" "}
                <span className="bg-gradient-to-r from-[#42BFA5] to-[#177E75] bg-clip-text text-transparent">
                  made personal.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-[#5A6D6B] max-w-2xl leading-relaxed">
                Discover what’s in your food, understand what your body needs, and find healthy meals using the{" "}
                <strong className="text-[#20312F]">ingredients you already have at home</strong>.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  onClick={handleLaunchDemo}
                  className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-gradient-to-r from-[#42BFA5] to-[#177E75] text-white font-bold text-base shadow-md hover:shadow-lg transition-all card-shadow-hover"
                >
                  <Camera className="w-5 h-5" />
                  <span>Analyze My Food</span>
                </button>
                <Link
                  href="/available-food"
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white border border-[#E2ECEB] text-[#20312F] font-bold text-base hover:bg-[#F7FAFC] transition-colors card-shadow"
                >
                  <ChefHat className="w-5 h-5 text-[#42BFA5]" />
                  <span>What Can I Eat Right Now?</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-[#EDF3F3]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#218C68] shrink-0" />
                  <span className="text-xs font-medium text-[#5A6D6B]">ICMR-NIN 2024 Tables</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#218C68] shrink-0" />
                  <span className="text-xs font-medium text-[#5A6D6B]">Deterministic Safety</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#218C68] shrink-0" />
                  <span className="text-xs font-medium text-[#5A6D6B]">Zero LLM Math</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Composition with Food Photography & Live Insight */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden card-shadow bg-white p-3 border border-[#E2ECEB]">
                {/* Visual Food Anchor */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                  <Image
                    src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"
                    alt="Authentic Indian Balanced Thali"
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <SuitabilityBadge status="optimal" label="100% Home Ingredients" />
                  </div>
                </div>

                {/* Overlaid Nutritional Summary Card */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-base text-[#20312F]">Comforting Moong Dal Khichdi</h2>
                      <p className="text-xs text-[#8E9F9D]">Ready in 20 min • Zero grocery run</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-[#177E75]">320</span>
                      <span className="text-xs text-[#8E9F9D] block">kcal</span>
                    </div>
                  </div>

                  {/* Macro Progress Bars */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#EDF3F3]">
                    <div className="bg-[#F7FAFC] p-2 rounded-xl text-center">
                      <span className="text-[10px] text-[#8E9F9D] uppercase block">Protein</span>
                      <span className="text-xs font-bold text-[#20312F]">11.5g</span>
                    </div>
                    <div className="bg-[#F7FAFC] p-2 rounded-xl text-center">
                      <span className="text-[10px] text-[#8E9F9D] uppercase block">Carbs</span>
                      <span className="text-xs font-bold text-[#20312F]">52.0g</span>
                    </div>
                    <div className="bg-[#F7FAFC] p-2 rounded-xl text-center">
                      <span className="text-[10px] text-[#8E9F9D] uppercase block">Fiber</span>
                      <span className="text-xs font-bold text-[#218C68]">5.2g</span>
                    </div>
                  </div>

                  {/* Pantry Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["Rice", "Moong Dal", "Cumin", "Turmeric"].map((ing) => (
                      <span
                        key={ing}
                        className="text-[11px] font-medium bg-[#E9F8F3] text-[#177E75] px-2 py-0.5 rounded-md"
                      >
                        ✓ {ing}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Central Differentiator: Available-Food-First */}
      <section className="py-16 bg-white border-y border-[#E2ECEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#42BFA5]">
              The Core Problem Solved
            </span>
            <h2 className="text-3xl font-extrabold text-[#20312F] mt-2">
              Most nutrition apps suggest groceries you don’t have.
            </h2>
            <p className="text-base text-[#5A6D6B] mt-3">
              NutriVision starts with what’s already sitting in your kitchen—dal, rice, onions, eggs, potatoes—and ranks real, delicious recipes you can cook immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#F7FAFC] border border-[#E2ECEB] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#E9F8F3] text-[#177E75] flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="font-bold text-lg text-[#20312F]">Select Available Ingredients</h3>
              <p className="text-sm text-[#5A6D6B] leading-relaxed">
                Add whatever staples or vegetables you have in the fridge. No complicated measurements required.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7FAFC] border border-[#E2ECEB] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#EEF7FF] text-[#377BC4] flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="font-bold text-lg text-[#20312F]">Deterministic Safety Triage</h3>
              <p className="text-sm text-[#5A6D6B] leading-relaxed">
                Our rule engine checks your declared allergies (peanuts, lactose, gluten) and dietary preferences before ranking.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7FAFC] border border-[#E2ECEB] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#E8F7EF] text-[#218C68] flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="font-bold text-lg text-[#20312F]">3-Tier Realistic Guidance</h3>
              <p className="text-sm text-[#5A6D6B] leading-relaxed">
                Receive instant Tier 1 zero-shopping meals, Tier 2 minor substitutions, and Tier 3 ideas with exact portion math.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ICMR-NIN Scientific Grounding Section */}
      <section className="py-16 bg-[#F7FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#177E75] to-[#20312F] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
            <div className="max-w-2xl space-y-4 relative z-10">
              <span className="text-xs uppercase font-bold tracking-widest text-[#42BFA5]">
                Evidence-Based Standard
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Grounded in the ICMR-NIN 2024 Dietary Guidelines for Indians
              </h2>
              <p className="text-sm sm:text-base text-[#cbdcdb] leading-relaxed">
                Unlike generic calorie counters that apply Western formulas to Indian curries, NutriVision computes nutrients deterministically using the Indian Food Composition Tables (IFCT).
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                <div className="border-l-2 border-[#42BFA5] pl-3">
                  <span className="text-xl font-bold">≤ 45%</span>
                  <p className="text-xs text-[#cbdcdb]">Energy from refined cereals</p>
                </div>
                <div className="border-l-2 border-[#42BFA5] pl-3">
                  <span className="text-xl font-bold">50%</span>
                  <p className="text-xs text-[#cbdcdb]">Plate vegetables & fruits</p>
                </div>
                <div className="border-l-2 border-[#42BFA5] pl-3">
                  <span className="text-xl font-bold">30g</span>
                  <p className="text-xs text-[#cbdcdb]">Minimum daily dietary fiber</p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleLaunchDemo}
                  className="px-6 py-3 rounded-xl bg-[#42BFA5] text-white font-bold text-sm hover:bg-[#38a892] transition-colors"
                >
                  Try With Sample Foods
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 bg-white border-t border-[#E2ECEB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#20312F] text-center mb-10">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#F7FAFC] border border-[#E2ECEB]">
              <h3 className="font-bold text-base text-[#20312F]">
                How does the AI Food Scanner work with mixed Indian plates (thalis)?
              </h3>
              <p className="text-sm text-[#5A6D6B] mt-2 leading-relaxed">
                Our vision engine separates discrete components (e.g., 2 Rotis, 1 Katori Dal, Sabzi). You review the detected items, adjust household portions (katoris, bowls, pieces), and confirmed weights are calculated deterministically against verified food tables.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F7FAFC] border border-[#E2ECEB]">
              <h3 className="font-bold text-base text-[#20312F]">
                Are calorie and nutrient values generated by a language model?
              </h3>
              <p className="text-sm text-[#5A6D6B] mt-2 leading-relaxed">
                No. Never. NutriVision strictly enforces deterministic math: <code>(Nutrient per 100g × confirmed weight) / 100</code> using ICMR-NIN IFCT tables. AI is only used for conversational education and optical dish classification.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F7FAFC] border border-[#E2ECEB]">
              <h3 className="font-bold text-base text-[#20312F]">
                Can I export or permanently delete my health records?
              </h3>
              <p className="text-sm text-[#5A6D6B] mt-2 leading-relaxed">
                Yes. Under Settings, you can download a full JSON dump of your profile and logged meals at any time, or trigger a complete cascade account deletion with zero remnant data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#20312F] text-[#8E9F9D] py-12 border-t border-[#E2ECEB]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#42BFA5] flex items-center justify-center text-white">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-base">NutriVision</span>
          </div>

          <p className="text-xs text-center sm:text-right">
            Evidence-based nutritional intelligence. Not a substitute for professional clinical medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

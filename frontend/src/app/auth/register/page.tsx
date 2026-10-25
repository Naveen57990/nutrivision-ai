"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, ArrowRight, AlertCircle } from "lucide-react";
import { ApiClient } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await ApiClient.register({ full_name: fullName, email, password });
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "Failed to register. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#42BFA5] to-[#177E75] flex items-center justify-center text-white shadow-sm">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#177E75]">NutriVision</span>
        </Link>
        <h2 className="text-2xl font-black text-[#20312F]">Create Your Account</h2>
        <p className="mt-1 text-sm text-[#5A6D6B]">Personalized nutrition begins with your unique profile.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#E2ECEB] card-shadow space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-[#FFF0F1] border border-[#C94B53]/20 text-[#C94B53] text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#5A6D6B] uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Priya Patel"
                className="w-full px-4 py-3 rounded-xl border border-[#E2ECEB] text-sm focus:outline-none focus:ring-2 focus:ring-[#42BFA5] bg-[#F7FAFC]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A6D6B] uppercase mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-xl border border-[#E2ECEB] text-sm focus:outline-none focus:ring-2 focus:ring-[#42BFA5] bg-[#F7FAFC]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A6D6B] uppercase mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-xl border border-[#E2ECEB] text-sm focus:outline-none focus:ring-2 focus:ring-[#42BFA5] bg-[#F7FAFC]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#177E75] text-white font-bold text-sm hover:bg-[#12645e] transition-colors card-shadow"
            >
              <span>{loading ? "Creating Profile..." : "Continue to Onboarding"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-[#5A6D6B]">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-bold text-[#177E75] hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

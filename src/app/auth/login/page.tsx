"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { ApiClient } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await ApiClient.login({ email, password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await ApiClient.demoLogin();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to enter demo mode.");
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
        <h2 className="text-2xl font-black text-[#20312F]">Welcome Back</h2>
        <p className="mt-1 text-sm text-[#5A6D6B]">Sign in to access your nutrition profile and meal history.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#E2ECEB] card-shadow space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-[#FFF0F1] border border-[#C94B53]/20 text-[#C94B53] text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Access Pill */}
          <div className="p-4 rounded-2xl bg-[#E9F8F3] border border-[#42BFA5]/30 text-center space-y-2">
            <p className="text-xs font-semibold text-[#177E75]">Evaluating or Testing?</p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#42BFA5] text-white font-bold text-xs hover:bg-[#38a892] transition-colors card-shadow"
            >
              1-Click Instant Demo Login (Aarav Sharma)
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#EDF3F3] w-full" />
            <span className="bg-white px-3 text-xs text-[#8E9F9D] uppercase tracking-wider font-semibold absolute">
              or sign in with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[#E2ECEB] text-sm focus:outline-none focus:ring-2 focus:ring-[#42BFA5] bg-[#F7FAFC]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#177E75] text-white font-bold text-sm hover:bg-[#12645e] transition-colors card-shadow"
            >
              <span>{loading ? "Signing in..." : "Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-[#5A6D6B]">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="font-bold text-[#177E75] hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

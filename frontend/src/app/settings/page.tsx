"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Download,
  Trash2,
  ShieldCheck,
  User,
  Heart,
  Save,
  AlertTriangle,
  Leaf
} from "lucide-react";
import { ApiClient } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form Fields
  const [age, setAge] = useState(28);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(172);
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState("balanced_diet");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getMe();
      setUser(data);
      if (data.profile) {
        setAge(data.profile.age);
        setWeight(data.profile.weight_kg);
        setHeight(data.profile.height_cm);
        setActivity(data.profile.activity_level);
        setGoal(data.profile.primary_goal);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await ApiClient.updateProfile({
        age: Number(age),
        weight_kg: Number(weight),
        height_cm: Number(height),
        activity_level: activity,
        primary_goal: goal,
      });
      setUser(updated);
      alert("Profile and nutritional targets successfully updated!");
    } catch (err: any) {
      alert(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const exportJson = await ApiClient.exportUserData();
      const blob = new Blob([JSON.stringify(exportJson, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nutrivision-health-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "Failed to export data.");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE_MY_ACCOUNT_PERMANENTLY") {
      alert("Please enter the exact confirmation keyword to proceed.");
      return;
    }
    try {
      await ApiClient.deleteAccountPermanently(deleteConfirm);
      ApiClient.clearToken();
      alert("Your account and all associated health records have been permanently erased.");
      router.push("/");
    } catch (err: any) {
      alert(err.message || "Failed to delete account.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#20312F] tracking-tight">
          Settings & Privacy
        </h1>
        <p className="text-sm text-[#5A6D6B] mt-1">
          Manage your personal parameters, export your data, or control privacy preferences.
        </p>
      </div>

      {/* Profile Parameters Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2ECEB] card-shadow space-y-6">
        <div className="flex items-center justify-between border-b border-[#EDF3F3] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E9F8F3] text-[#177E75] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#20312F]">Nutritional Baselines</h2>
              <p className="text-xs text-[#8E9F9D]">Used by the ICMR-NIN engine to calculate your energy targets</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#177E75] text-white font-bold text-xs hover:bg-[#12645e] transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#5A6D6B] uppercase mb-1">Age (Years)</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECEB] text-sm font-semibold bg-[#F7FAFC]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#5A6D6B] uppercase mb-1">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECEB] text-sm font-semibold bg-[#F7FAFC]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#5A6D6B] uppercase mb-1">Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECEB] text-sm font-semibold bg-[#F7FAFC]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#5A6D6B] uppercase mb-1">Activity Level</label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECEB] text-sm font-semibold bg-[#F7FAFC]"
            >
              <option value="sedentary">Sedentary (Desk work)</option>
              <option value="light">Light Activity (1-2x/wk)</option>
              <option value="moderate">Moderate Activity (3-5x/wk)</option>
              <option value="active">Very Active (Daily training)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#5A6D6B] uppercase mb-1">Nutritional Focus</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECEB] text-sm font-semibold bg-[#F7FAFC]"
            >
              <option value="balanced_diet">Balanced Nutrition</option>
              <option value="healthy_weight_loss">Healthy Sustainable Fat Loss</option>
              <option value="muscle_gain">Lean Muscle Development</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Sovereignty & Export */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2ECEB] card-shadow space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EEF7FF] text-[#377BC4] flex items-center justify-center font-bold">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#20312F]">Data Portability & Export</h2>
            <p className="text-xs text-[#8E9F9D]">Download all your health metrics, logged meals, and kitchen pantry records</p>
          </div>
        </div>

        <p className="text-xs text-[#5A6D6B] leading-relaxed">
          NutriVision respects user data sovereignty. You can export your entire history in standardized JSON format for your personal records or sharing with a licensed dietitian.
        </p>

        <button
          type="button"
          onClick={handleExportData}
          disabled={exporting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F7FAFC] border border-[#E2ECEB] text-[#20312F] font-bold text-xs hover:bg-[#E9F8F3] hover:text-[#177E75] hover:border-[#42BFA5] transition-all"
        >
          <Download className="w-4 h-4 text-[#42BFA5]" />
          <span>{exporting ? "Generating Export..." : "Download Full JSON Data Archive"}</span>
        </button>
      </div>

      {/* Account Deletion (Danger Zone) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#C94B53]/20 card-shadow space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF0F1] text-[#C94B53] flex items-center justify-center font-bold">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#C94B53]">Danger Zone: Permanent Account Deletion</h2>
            <p className="text-xs text-[#8E9F9D]">Irreversible cascade deletion of your account and all meal records</p>
          </div>
        </div>

        <p className="text-xs text-[#5A6D6B]">
          Once confirmed, all your demographic profiles, dietary preferences, logged meals, pantry inventory, and assistant chats will be permanently deleted from the database.
        </p>

        {!showDeleteModal ? (
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#FFF0F1] text-[#C94B53] font-bold text-xs hover:bg-[#ffe3e5] border border-[#C94B53]/30 transition-colors"
          >
            I want to delete my account permanently
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-[#FFF0F1] border border-[#C94B53]/30 space-y-3">
            <p className="text-xs font-bold text-[#C94B53]">
              Type &ldquo;DELETE_MY_ACCOUNT_PERMANENTLY&rdquo; below to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE_MY_ACCOUNT_PERMANENTLY"
              className="w-full px-4 py-2.5 rounded-xl border border-[#C94B53]/40 bg-white text-xs font-mono font-bold focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-xl bg-[#C94B53] text-white font-bold text-xs hover:bg-[#b03d45]"
              >
                Permanently Erase Everything
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E2ECEB] text-[#5A6D6B] font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

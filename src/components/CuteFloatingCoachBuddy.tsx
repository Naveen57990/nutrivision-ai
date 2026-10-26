"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  X, 
  RotateCcw, 
  Bot, 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  ChevronDown,
  Heart
} from "lucide-react";
import { UserMedicalProfile } from "./MedicalProfileModal";

interface CuteFloatingCoachBuddyProps {
  userProfile: UserMedicalProfile;
  totalCalories: number;
  totalProtein: number;
  onOpenAISettings?: () => void;
}

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  suggested_followups?: string[];
  timestamp: string;
}

export default function CuteFloatingCoachBuddy({
  userProfile,
  totalCalories,
  totalProtein,
  onOpenAISettings
}: CuteFloatingCoachBuddyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [showGreetingBubble, setShowGreetingBubble] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      role: "assistant",
      content: `Namaste Aarav! 🥑 I'm NutriBuddy, your personal nutrition coach.\n\nI'm watching your ${userProfile.primary_goal.replace(/_/g, " ")} goal, prediabetes & BP safeguards, and today's intake (${totalCalories} kcal, ${totalProtein}g protein).\n\nHow can I help you right now?`,
      suggested_followups: [
        "What should I eat for dinner?",
        "How much protein do I have left today?",
        "Can I eat rice with prediabetes?"
      ],
      timestamp: "Just now"
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShowGreetingBubble(false);
      setHasUnread(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isOpen]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;

    const userText = text.trim();
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsSending(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          userProfile: userProfile
        })
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.content || "I'm right here with you! Let me check the ICMR guidelines.",
          suggested_followups: data.suggested_followups || [
            "What can I cook with what I have?",
            "How to balance my plate?"
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error("Unable to reach coach");
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "I'm having a brief connection flutter. Please try asking again in a moment! 🌱",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsSending(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleClearHistory = () => {
    if (confirm("Reset conversation with NutriBuddy?")) {
      setMessages([
        {
          id: `fresh-${Date.now()}`,
          role: "assistant",
          content: "Conversation refreshed! Ask me anything about your meals, recipes, or health goals.",
          suggested_followups: [
            "What should I eat for dinner?",
            "Healthy high-protein Indian snacks"
          ],
          timestamp: "Just now"
        }
      ]);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end">
      
      {/* Speech greeting bubble (shown initially) */}
      {!isOpen && showGreetingBubble && (
        <div className="mb-3 mr-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white rounded-2xl p-3 shadow-xl border border-teal-200/90 text-xs text-slate-800 flex items-center gap-2 relative max-w-xs">
            <span className="text-base animate-bounce">🥑</span>
            <div>
              <strong className="block text-teal-900 font-bold">NutriBuddy Coach</strong>
              <span className="text-[11px] text-slate-500">Need food advice? Tap me anytime!</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setShowGreetingBubble(false); }}
              className="text-slate-400 hover:text-slate-600 p-0.5 ml-1"
            >
              <X className="w-3 h-3" />
            </button>
            {/* Speech bubble pointer */}
            <div className="absolute -bottom-2 right-6 w-3 h-3 bg-white border-b border-r border-teal-200/90 transform rotate-45" />
          </div>
        </div>
      )}

      {/* Floating Mascot Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-2 border-white ring-4 ring-teal-500/20"
          title="Open NutriBuddy AI Coach"
        >
          {/* Animated Glow Halo */}
          <div className="absolute inset-0 rounded-full bg-teal-400 animate-ping opacity-20 pointer-events-none" />

          {/* Cute Avocado / Sprout Mascot SVG */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow">
              {/* Cute Pear/Avocado Body */}
              <path 
                d="M20,4 C14,4 10,12 10,22 C10,31 14,36 20,36 C26,36 30,31 30,22 C30,12 26,4 20,4 Z" 
                fill="#4ade80" 
                stroke="#15803d" 
                strokeWidth="1.5"
              />
              {/* Inner Light Core */}
              <ellipse cx="20" cy="23" rx="7" ry="9" fill="#bbf7d0" />
              {/* Seed / Belly */}
              <circle cx="20" cy="25" r="5" fill="#ca8a04" opacity="0.8" />
              
              {/* Cheerful Blushing Cheeks */}
              <circle cx="15" cy="18" r="1.5" fill="#f43f5e" opacity="0.7" />
              <circle cx="25" cy="18" r="1.5" fill="#f43f5e" opacity="0.7" />

              {/* Expressive Winking / Big Eyes */}
              <circle cx="16" cy="15" r="1.8" fill="#14532d" />
              <circle cx="24" cy="15" r="1.8" fill="#14532d" />
              <circle cx="16.5" cy="14.5" r="0.6" fill="white" />
              <circle cx="24.5" cy="14.5" r="0.6" fill="white" />

              {/* Sweet Smile */}
              <path d="M18,19 Q20,22 22,19" stroke="#14532d" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              
              {/* Sprout Leaves on Head */}
              <path d="M20,4 Q18,0 15,2 Q17,4 20,4 Z" fill="#22c55e" stroke="#15803d" strokeWidth="0.8" />
              <path d="M20,4 Q22,0 25,2 Q23,4 20,4 Z" fill="#22c55e" stroke="#15803d" strokeWidth="0.8" />
            </svg>
          </div>

          {/* Unread / Active Notification Badge */}
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-[9px] font-bold">
              1
            </span>
          )}
        </button>
      )}

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div className="w-[370px] sm:w-[420px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-teal-200/90 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-teal-900 to-teal-800 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-lg">
                🥑
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm">NutriBuddy AI Coach</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-teal-200">
                  Grounded in ICMR-NIN 2024 &amp; Your Profile
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Reset conversation"
                className="p-1.5 rounded-lg hover:bg-white/10 text-teal-200 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              {onOpenAISettings && (
                <button
                  onClick={onOpenAISettings}
                  title="Configure AI model"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-teal-200 hover:text-white transition-colors text-xs font-bold"
                >
                  <Bot className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context pill banner */}
          <div className="px-4 py-2 bg-teal-50 border-b border-teal-100 flex items-center justify-between text-[11px] text-teal-950">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <strong>{userProfile.primary_goal.replace(/_/g, " ")}</strong> ({medicalProfileSummary(userProfile)})
            </span>
            <span className="font-mono text-teal-800 font-bold">
              {totalCalories} / {userProfile.daily_calorie_target} kcal
            </span>
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap shadow-xs ${
                    msg.role === "user"
                      ? "bg-teal-600 text-white rounded-br-none"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>

                {/* Followup suggestions */}
                {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {msg.suggested_followups.map((f, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleSendMessage(f)}
                        className="px-2 py-0.5 rounded-full bg-teal-100/70 hover:bg-teal-200 text-teal-900 font-semibold text-[10px] transition-colors"
                      >
                        + {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isSending && (
              <div className="flex items-center gap-1.5 text-xs text-teal-700 bg-white p-2.5 rounded-2xl border border-teal-100 self-start animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                <span>NutriBuddy is consulting ICMR guidelines...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputMessage)}
              placeholder="Ask NutriBuddy about food or portions..."
              className="flex-1 px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
            />
            <button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={isSending || !inputMessage.trim()}
              className="p-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-sm disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

function medicalProfileSummary(profile: UserMedicalProfile): string {
  const parts = [];
  if (profile.health_conditions.includes("prediabetes") || profile.health_conditions.includes("diabetes")) {
    parts.push("Glucose Watch");
  }
  if (profile.health_conditions.includes("hypertension")) {
    parts.push("BP Guard");
  }
  return parts.length > 0 ? parts.join(", ") : "Healthy Balance";
}

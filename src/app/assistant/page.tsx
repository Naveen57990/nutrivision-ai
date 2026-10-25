"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  User as UserIcon,
  Bot,
  AlertTriangle,
  Leaf,
  ShieldCheck
} from "lucide-react";
import { ApiClient } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  suggested_followups?: string[];
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterPrompts = [
    "How much protein did I have today?",
    "What can I cook with what I have at home?",
    "How can I balance my dinner plate?",
    "Explain my daily fiber guideline",
  ];

  useEffect(() => {
    // Load chat history or set initial greeting
    ApiClient.getChatHistory()
      .then((res) => {
        if (res.messages && res.messages.length > 0) {
          setMessages(res.messages);
        } else {
          setMessages([
            {
              role: "assistant",
              content:
                "Hello! I'm your NutriVision AI Coach. I have factual access to your profile, today's logged meals, and your kitchen ingredients.\n\nAsk me anything about balancing your meals, recipes using what you have, or macro recommendations!",
              suggested_followups: starterPrompts,
            },
          ]);
        }
      })
      .catch(() => {
        setMessages([
          {
            role: "assistant",
            content:
              "Hello! I'm your NutriVision AI Coach. How can I help optimize your nutrition today?",
            suggested_followups: starterPrompts,
          },
        ]);
      });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await ApiClient.sendChatMessage(text);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.content,
          suggested_followups: res.suggested_followups || [],
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting to the nutrition service right now. Please check back shortly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E2ECEB]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C5B9F5] to-[#177E75] flex items-center justify-center text-white card-shadow">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#20312F]">AI Nutrition Coach</h1>
            <p className="text-xs text-[#5A6D6B]">Grounded in your real meal logs & ICMR-NIN science</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#218C68] font-bold bg-[#E8F7EF] px-3 py-1 rounded-full">
          <ShieldCheck className="w-4 h-4" />
          <span>Factual Grounding Active</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.role === "user"
                  ? "bg-[#177E75] text-white"
                  : "bg-[#E9F8F3] text-[#177E75] border border-[#42BFA5]"
              }`}
            >
              {msg.role === "user" ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-xl p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#177E75] text-white rounded-tr-sm"
                  : "bg-white border border-[#E2ECEB] text-[#20312F] card-shadow rounded-tl-sm space-y-3"
              }`}
            >
              <div className="whitespace-pre-line">{msg.content}</div>

              {/* Followup suggestions if provided by assistant */}
              {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                <div className="pt-2 border-t border-[#EDF3F3] flex flex-wrap gap-1.5">
                  {msg.suggested_followups.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="text-xs font-medium bg-[#F7FAFC] hover:bg-[#E9F8F3] text-[#177E75] px-2.5 py-1 rounded-lg border border-[#E2ECEB] transition-colors"
                    >
                      {prompt} →
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E9F8F3] flex items-center justify-center text-[#177E75]">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#E2ECEB] text-xs text-[#8E9F9D] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#42BFA5] animate-ping" />
              <span>Checking your logged nutrients and food tables...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="bg-white p-3 rounded-2xl border border-[#E2ECEB] card-shadow">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your logged nutrients, high-protein snacks, or cooking with available ingredients..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2ECEB] text-sm focus:outline-none focus:ring-2 focus:ring-[#42BFA5] bg-[#F7FAFC]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#177E75] text-white font-bold text-sm hover:bg-[#12645e] transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

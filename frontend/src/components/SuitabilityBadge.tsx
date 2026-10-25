"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

interface SuitabilityBadgeProps {
  status: "optimal" | "good" | "caution" | "restricted" | string;
  label?: string;
  className?: string;
}

export default function SuitabilityBadge({ status, label, className = "" }: SuitabilityBadgeProps) {
  const norm = status.toLowerCase();

  if (norm.includes("optimal") || norm.includes("best") || norm.includes("100%")) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F7EF] text-[#218C68] border border-[#218C68]/20 ${className}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>{label || "Optimal Choice"}</span>
      </span>
    );
  }

  if (norm.includes("caution") || norm.includes("attention") || norm.includes("sub") || norm.includes("moderate")) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF5E5] text-[#B87921] border border-[#B87921]/20 ${className}`}
      >
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>{label || "Requires Caution"}</span>
      </span>
    );
  }

  if (norm.includes("restricted") || norm.includes("allergen") || norm.includes("conflict")) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF0F1] text-[#C94B53] border border-[#C94B53]/20 ${className}`}
      >
        <XCircle className="w-3.5 h-3.5 shrink-0" />
        <span>{label || "Not Recommended"}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EDF5FF] text-[#377BC4] border border-[#377BC4]/20 ${className}`}
    >
      <Info className="w-3.5 h-3.5 shrink-0" />
      <span>{label || "Good Fit"}</span>
    </span>
  );
}

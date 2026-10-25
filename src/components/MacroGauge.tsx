"use client";

import React from "react";

interface MacroGaugeProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  colorHex?: string;
  bgHex?: string;
  showPercent?: boolean;
}

export default function MacroGauge({
  label,
  current,
  target,
  unit = "g",
  colorHex = "#42BFA5",
  bgHex = "#E9F8F3",
  showPercent = true,
}: MacroGaugeProps) {
  const safeTarget = Math.max(target, 1);
  const percentage = Math.min(Math.round((current / safeTarget) * 100), 100);
  const isOver = current > target;

  return (
    <div className="bg-white p-4 rounded-2xl border border-[#E2ECEB] card-shadow flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[#5A6D6B] uppercase tracking-wide">
          {label}
        </span>
        {showPercent && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: bgHex,
              color: colorHex,
            }}
          >
            {percentage}%
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-2xl font-extrabold text-[#20312F]">
          {Math.round(current)}
        </span>
        <span className="text-xs font-medium text-[#8E9F9D]">
          / {Math.round(target)} {unit}
        </span>
      </div>

      {/* Progress track */}
      <div className="w-full h-2 rounded-full overflow-hidden bg-[#EDF3F3]">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: isOver ? "#B87921" : colorHex,
          }}
        />
      </div>
    </div>
  );
}

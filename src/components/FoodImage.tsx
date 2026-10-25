"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getFoodImage } from "@/lib/food_images";
import { Utensils } from "lucide-react";

interface FoodImageProps {
  src?: string;
  foodName: string;
  category?: string;
  alt?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "wide" | "portrait";
  sizes?: string;
}

export default function FoodImage({
  src,
  foodName,
  category,
  alt,
  className = "",
  aspectRatio = "video",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: FoodImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Determine fallback or matched photography URL
  const resolvedUrl = (!hasError && src) ? src : getFoodImage(foodName, category);

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-[4/3]",
    wide: "aspect-[16/9]",
    portrait: "aspect-[3/4]",
  };

  return (
    <div
      className={`relative overflow-hidden bg-[#E9F8F3] rounded-2xl ${aspectClasses[aspectRatio]} ${className}`}
    >
      {!hasError ? (
        <Image
          src={resolvedUrl}
          alt={alt || `${foodName} authentic dish`}
          fill
          sizes={sizes}
          className={`object-cover transition-opacity duration-300 ${
            isLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-[#177E75] bg-gradient-to-br from-[#E9F8F3] to-[#F0FBFA]">
          <Utensils className="w-8 h-8 opacity-40 mb-1" />
          <span className="text-xs font-semibold text-center line-clamp-1">{foodName}</span>
        </div>
      )}

      {/* Subtle bottom shadow overlay to ensure contrast if text is overlaid */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

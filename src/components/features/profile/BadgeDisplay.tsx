"use client";

import { Badge } from "@/lib/stats";
import { useState } from "react";

interface BadgeDisplayProps {
    badge: Badge;
    size?: "sm" | "md" | "lg";
}

export function BadgeDisplay({ badge, size = "md" }: BadgeDisplayProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    const sizeClasses = {
        sm: "w-8 h-8 text-lg",
        md: "w-12 h-12 text-2xl",
        lg: "w-16 h-16 text-3xl",
    };

    return (
        <div
            className="relative flex flex-col items-center"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <div
                className={`${sizeClasses[size]} ${badge.color} rounded-full flex items-center justify-center shadow-lg border-2 border-white/10 cursor-help transition-transform hover:scale-110`}
            >
                {badge.icon}
            </div>

            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute bottom-full mb-2 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 border border-white/10 backdrop-blur-md">
                    <div className="font-bold">{badge.name}</div>
                    <div className="text-gray-400 font-normal">{badge.description}</div>
                </div>
            )}
        </div>
    );
}

"use client";

import Image from "next/image";
import { WatchProvidersData, WatchProvider } from "@/lib/tmdb";

interface StreamingBadgesProps {
    providers: WatchProvidersData | null;
    compact?: boolean;
}

export function StreamingBadges({ providers, compact = false }: StreamingBadgesProps) {
    if (!providers) return null;

    const { flatrate, rent, buy, link } = providers;
    const hasStream = flatrate && flatrate.length > 0;
    const hasRent = rent && rent.length > 0;
    const hasBuy = buy && buy.length > 0;

    if (!hasStream && !hasRent && !hasBuy) return null;

    // Helper to render provider list
    const renderProviders = (list: WatchProvider[], label: string) => (
        <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                {label}
            </span>
            <div className="flex flex-wrap gap-2">
                {list.slice(0, compact ? 2 : 4).map((provider) => (
                    <div
                        key={provider.provider_id}
                        className="relative w-8 h-8 rounded-md overflow-hidden shadow-sm hover:scale-110 transition-transform"
                        title={provider.provider_name}
                    >
                        <Image
                            src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                            alt={provider.provider_name}
                            fill
                            className="object-cover"
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors"
        >
            <div className={`flex ${compact ? "flex-col gap-2" : "flex-wrap gap-6"}`}>
                {hasStream && renderProviders(flatrate, "Stream")}
                {!compact && hasRent && renderProviders(rent, "Rent")}
                {!compact && hasBuy && renderProviders(buy, "Buy")}

                {compact && !hasStream && (
                    <div className="text-xs text-gray-400">
                        {hasRent ? "Available to Rent" : "Available to Buy"}
                    </div>
                )}
            </div>
            {!compact && (
                <div className="mt-2 text-[10px] text-gray-500 text-right">
                    Provided by JustWatch
                </div>
            )}
        </a>
    );
}

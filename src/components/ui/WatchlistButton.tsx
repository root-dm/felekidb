"use client";

import { useState, useTransition } from "react";
import { addToWatchlist, removeFromWatchlist } from "@/lib/actions/watchlist";

interface WatchlistButtonProps {
    tmdbId: number;
    mediaType: "movie" | "tv";
    title: string;
    posterPath: string | null;
    releaseYear: number | null;
    initialIsInWatchlist?: boolean;
    className?: string; // Allow custom styling
}

export function WatchlistButton({
    tmdbId,
    mediaType,
    title,
    posterPath,
    releaseYear,
    initialIsInWatchlist = false,
    className = "",
}: WatchlistButtonProps) {
    const [isInWatchlist, setIsInWatchlist] = useState(initialIsInWatchlist);
    const [isPending, startTransition] = useTransition();

    function handleToggle(e: React.MouseEvent) {
        e.preventDefault(); // Prevent navigating if inside a link
        e.stopPropagation();

        const newState = !isInWatchlist;
        setIsInWatchlist(newState); // Optimistic update

        startTransition(async () => {
            if (newState) {
                await addToWatchlist({ tmdbId, mediaType, title, posterPath, releaseYear });
            } else {
                await removeFromWatchlist(tmdbId);
            }
        });
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`flex items-center justify-center transition-all ${isInWatchlist ? "text-[#E50914] scale-110" : "text-gray-400 hover:text-white"
                } ${className}`}
            title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
        >
            <span className="text-2xl">{isInWatchlist ? "❤️" : "🤍"}</span>
        </button>
    );
}

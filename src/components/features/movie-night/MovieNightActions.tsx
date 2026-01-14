"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMovieNight } from "@/lib/actions/movie-night";
import type { MovieNight } from "@prisma/client";

interface MovieNightActionsProps {
    movieNight: MovieNight;
}

export function MovieNightActions({ movieNight }: MovieNightActionsProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleDelete() {
        setIsDeleting(true);
        setError(null);
        try {
            const result = await deleteMovieNight({ nightId: movieNight.id });
            if (result.success) {
                router.push("/dashboard");
            } else {
                throw new Error(result.error || "Delete failed");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Delete failed");
            setIsDeleting(false);
        }
    }

    if (error) {
        return (
            <div className="text-red-500 text-xs bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                {error}
                <button onClick={() => setError(null)} className="ml-2 hover:underline">✕</button>
            </div>
        );
    }

    if (showDeleteConfirm) {
        return (
            <div className="flex items-center gap-2 bg-black/50 p-1 rounded-lg border border-red-500/30">
                <span className="text-xs text-red-300 px-2">Sure?</span>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition-colors disabled:opacity-50"
                >
                    {isDeleting ? "..." : "Yes, Delete"}
                </button>
                <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2 py-1 hover:bg-white/10 text-gray-400 hover:text-white text-xs rounded transition-colors"
                >
                    ✕
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-gray-400 hover:text-red-500 transition-colors text-sm flex items-center gap-1 group"
            title="Delete Movie Night"
        >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                Delete
            </span>
            <span className="p-2 hover:bg-white/5 rounded-full">🗑️</span>
        </button>
    );
}

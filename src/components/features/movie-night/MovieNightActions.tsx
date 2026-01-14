"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Added import
import { updateMovieNightStatus, deleteMovieNight } from "@/lib/actions/movie-night";
import { closeVoting } from "@/lib/actions/voting";
import { finalizeMovieNight } from "@/lib/actions/rating";
import type { MovieNight } from "@prisma/client";

interface MovieNightActionsProps {
    movieNight: MovieNight;
}

export function MovieNightActions({ movieNight }: MovieNightActionsProps) {
    const router = useRouter(); // Import useRouter from next/navigation
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleAction(action: () => Promise<any>) {
        setIsLoading(true);
        setError(null);
        try {
            const result = await action();
            // Check if result is from createSafeAction
            if (result && typeof result === 'object' && 'success' in result) {
                if (!result.success) {
                    throw new Error(result.error || "Action failed");
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Action failed");
        } finally {
            setIsLoading(false);
        }
    }

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

    // Get the next action based on current status
    function getNextAction() {
        switch (movieNight.status) {
            case "PLANNING":
                return {
                    label: "Start Voting",
                    icon: "🗳️",
                    action: () => updateMovieNightStatus({ nightId: movieNight.id, status: "VOTING" }),
                    btnClass: "bg-yellow-500 hover:bg-yellow-600 text-black",
                    description: "Lock nominations and let attendees vote",
                };
            case "VOTING":
                return {
                    label: "Finalize Winner",
                    icon: "🏆",
                    action: () => closeVoting(movieNight.id), // Not refactored yet
                    btnClass: "bg-green-500 hover:bg-green-600 text-white",
                    description: "Pick the movie with most votes and start watching",
                };
            case "WATCHING":
            case "RATING":
                return {
                    label: "Complete Night",
                    icon: "✅",
                    action: () => finalizeMovieNight(movieNight.id), // Not refactored yet
                    btnClass: "btn-primary",
                    description: "Finalize ratings and update reputation scores",
                };
            default:
                return null;
        }
    }

    const nextAction = getNextAction();

    return (
        <div className="space-y-4">
            {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {nextAction && (
                <div className="space-y-3">
                    <p className="text-gray-400 text-sm">{nextAction.description}</p>
                    <button
                        onClick={() => handleAction(nextAction.action)}
                        disabled={isLoading}
                        className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${nextAction.btnClass}`}
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Processing...</span>
                        ) : (
                            <>
                                <span className="text-xl">{nextAction.icon}</span>
                                {nextAction.label}
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Delete Zone */}
            <div className="pt-4 border-t border-white/10">
                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full text-center text-red-400 text-xs hover:text-red-300 transition-colors py-2"
                    >
                        Delete Movie Night
                    </button>
                ) : (
                    <div className="glass p-3 rounded-xl border-red-500/30">
                        <p className="text-red-300 text-xs mb-3 text-center font-medium">
                            Are you sure? This cannot be undone.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-1.5 rounded-lg bg-white/5 text-gray-300 text-xs hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? "..." : "Confirm Delete"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { toggleReaction } from "@/lib/actions/reactions";

interface Reaction {
    emoji: string;
    userId: string;
}

interface ReactionPickerProps {
    commentId: string;
    reactions: Reaction[];
    currentUserId: string;
}

const COMMON_EMOJIS = ["❤️", "👍", "🔥", "😂", "👏", "🎉"];

export function ReactionPicker({ commentId, reactions = [], currentUserId }: ReactionPickerProps) {
    // Group reactions by emoji
    const reactionCounts = reactions.reduce((acc, reaction) => {
        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Check which emojis the user has selected
    const userReactions = new Set(
        reactions
            .filter((r) => r.userId === currentUserId)
            .map((r) => r.emoji)
    );

    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);

    const [optimisticCounts, setOptimisticCounts] = useState(reactionCounts);
    const [optimisticUserReactions, setOptimisticUserReactions] = useState(userReactions);

    function togglePicker() {
        if (!pickerOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // Calculate position to ensure it fits on screen
            // 8px gap below button
            const top = rect.bottom + 8;
            // Align with left of button, but prevent overflow on right
            // We assume picker width is approx 250px
            const left = Math.min(rect.left, window.innerWidth - 260);

            setPickerPos({ top, left });
        }
        setPickerOpen(!pickerOpen);
    }

    async function handleReaction(emoji: string) {
        // Optimistic update
        const isAdding = !optimisticUserReactions.has(emoji);

        setOptimisticUserReactions((prev) => {
            const next = new Set(prev);
            if (isAdding) next.add(emoji);
            else next.delete(emoji);
            return next;
        });

        setOptimisticCounts((prev) => ({
            ...prev,
            [emoji]: (prev[emoji] || 0) + (isAdding ? 1 : -1),
        }));

        setPickerOpen(false);

        try {
            const result = await toggleReaction(commentId, emoji);
            if (!result.success) {
                // Revert on failure (simplified)
                console.error("Failed to react");
            }
        } catch (error) {
            console.error("Failed to react", error);
        }
    }

    // Close on scroll to avoid detached popup
    useEffect(() => {
        if (pickerOpen) {
            const handleScroll = () => setPickerOpen(false);
            window.addEventListener("scroll", handleScroll, true);
            return () => window.removeEventListener("scroll", handleScroll, true);
        }
    }, [pickerOpen]);

    // Close on click outside



    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="flex items-center gap-2 mt-2">
            {/* Display existing reactions */}
            {Object.entries(optimisticCounts).map(([emoji, count]) => {
                if (count <= 0) return null;
                const isActive = optimisticUserReactions.has(emoji);
                return (
                    <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className={`text-xs px-2 py-1 rounded-full border transition-colors ${isActive
                            ? "bg-[#E50914]/10 border-[#E50914]/30 text-white"
                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                            }`}
                    >
                        {emoji} {count}
                    </button>
                );
            })}

            {/* Helper to add new reaction */}
            <div>
                <button
                    ref={triggerRef}
                    onClick={togglePicker}
                    className="text-xs w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                    +
                </button>

                {pickerOpen && mounted && createPortal(
                    <>
                        {/* Transparent Backdrop to detect clicks outside */}
                        <div
                            className="fixed inset-0 z-[100] bg-transparent"
                            onClick={() => setPickerOpen(false)}
                        />

                        {/* Emoji Picker - Fixed Position via Portal */}
                        <div
                            className="fixed z-[101] bg-[#1a1a1a] border border-white/10 rounded-lg p-2 flex gap-1 shadow-xl animate-in fade-in zoom-in-95 duration-200"
                            style={{
                                top: pickerPos.top,
                                left: pickerPos.left
                            }}
                        >
                            {COMMON_EMOJIS.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => handleReaction(emoji)}
                                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-lg transition-colors hover:scale-110 active:scale-95"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </>,
                    document.body
                )}
            </div>
        </div>
    );
}

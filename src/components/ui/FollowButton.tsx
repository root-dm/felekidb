"use client";

import { useState } from "react";
import { followUser, unfollowUser } from "@/lib/actions/follow";

interface FollowButtonProps {
    targetUserId: string;
    isFollowing: boolean;
    isMutual: boolean;
}

export function FollowButton({ targetUserId, isFollowing: initialIsFollowing, isMutual }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isLoading, setIsLoading] = useState(false);

    async function handleClick() {
        setIsLoading(true);
        try {
            if (isFollowing) {
                await unfollowUser(targetUserId);
                setIsFollowing(false);
            } else {
                await followUser(targetUserId);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error("Follow action failed:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={`px-5 py-2 rounded-lg font-medium transition-all disabled:opacity-50 ${isFollowing
                ? "bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400"
                : "bg-primary-500 text-white hover:bg-primary-400"
                }`}
        >
            {isLoading ? "..." : isFollowing ? (isMutual ? "👥 Mutual" : "Following") : "Follow"}
        </button>
    );
}

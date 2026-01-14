"use client";

import { useState } from "react";
import { FollowListModal } from "./FollowListModal";

interface FollowStatsProps {
    userId: string;
    followersCount: number;
    followingCount: number;
    isFollowedBy: boolean;
    isOwnProfile: boolean;
}

export function FollowStats({
    userId,
    followersCount,
    followingCount,
    isFollowedBy,
    isOwnProfile,
}: FollowStatsProps) {
    const [modalTab, setModalTab] = useState<"followers" | "following" | "mutuals" | null>(null);

    return (
        <>
            <div className="flex items-center justify-center md:justify-start gap-4 text-gray-400 mb-3">
                <button
                    onClick={() => setModalTab("followers")}
                    className="hover:text-white transition-colors"
                >
                    <strong className="text-white">{followersCount}</strong> followers
                </button>
                <button
                    onClick={() => setModalTab("following")}
                    className="hover:text-white transition-colors"
                >
                    <strong className="text-white">{followingCount}</strong> following
                </button>
                {isFollowedBy && !isOwnProfile && (
                    <span className="px-2 py-0.5 rounded bg-white/10 text-xs">Follows you</span>
                )}
            </div>

            {modalTab && (
                <FollowListModal
                    userId={userId}
                    initialTab={modalTab}
                    followersCount={followersCount}
                    followingCount={followingCount}
                    onClose={() => setModalTab(null)}
                />
            )}
        </>
    );
}

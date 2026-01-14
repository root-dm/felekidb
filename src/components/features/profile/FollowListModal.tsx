"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFollowers, getFollowing, getMutuals } from "@/lib/actions/follow";

interface User {
    id: string;
    name: string | null;
    image: string | null;
}

interface FollowListModalProps {
    userId: string;
    initialTab: "followers" | "following" | "mutuals";
    followersCount: number;
    followingCount: number;
    onClose: () => void;
}

export function FollowListModal({
    userId,
    initialTab,
    followersCount,
    followingCount,
    onClose,
}: FollowListModalProps) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            setLoading(true);
            try {
                let data: User[] = [];
                if (activeTab === "followers") {
                    data = await getFollowers(userId);
                } else if (activeTab === "following") {
                    data = await getFollowing(userId);
                } else {
                    data = await getMutuals(userId);
                }
                setUsers(data);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, [userId, activeTab]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-4">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    >
                        ✕
                    </button>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab("followers")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "followers"
                                ? "bg-white/10 text-white"
                                : "text-gray-400 hover:text-white"
                                }`}
                        >
                            Followers ({followersCount})
                        </button>
                        <button
                            onClick={() => setActiveTab("following")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "following"
                                ? "bg-white/10 text-white"
                                : "text-gray-400 hover:text-white"
                                }`}
                        >
                            Following ({followingCount})
                        </button>
                        <button
                            onClick={() => setActiveTab("mutuals")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "mutuals"
                                ? "bg-white/10 text-white"
                                : "text-gray-400 hover:text-white"
                                }`}
                        >
                            Mutuals
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[60vh] p-4">
                    {loading ? (
                        <div className="text-center py-8 text-gray-400">Loading...</div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            {activeTab === "followers" && "No followers yet"}
                            {activeTab === "following" && "Not following anyone yet"}
                            {activeTab === "mutuals" && "No mutual follows yet"}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {users.map((user) => (
                                <Link
                                    key={user.id}
                                    href={`/profile/${user.id}`}
                                    onClick={onClose}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10">
                                        {user.image ? (
                                            <Image
                                                src={user.image}
                                                alt={user.name || "User"}
                                                width={40}
                                                height={40}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-lg">
                                                👤
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-white font-medium">
                                        {user.name || "Anonymous"}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

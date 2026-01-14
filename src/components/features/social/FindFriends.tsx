"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { followUser } from "@/lib/actions/follow";

interface User {
    id: string;
    name: string | null;
    image: string | null;
}

interface FindFriendsProps {
    suggestedUsers: User[];
}

export function FindFriends({ suggestedUsers }: FindFriendsProps) {
    const [users, setUsers] = useState(suggestedUsers);
    const [isPending, startTransition] = useTransition();
    const [followingId, setFollowingId] = useState<string | null>(null);

    async function handleFollow(userId: string) {
        setFollowingId(userId);
        startTransition(async () => {
            try {
                await followUser(userId);
                setUsers((prev) => prev.filter((u) => u.id !== userId));
            } catch (error) {
                console.error("Failed to follow:", error);
            } finally {
                setFollowingId(null);
            }
        });
    }

    if (users.length === 0) {
        return null;
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                👥 Find Friends
            </h3>
            <div className="space-y-3">
                {users.map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                        <Link href={`/profile/${user.id}`} className="flex-shrink-0">
                            {user.image ? (
                                <Image
                                    src={user.image}
                                    alt={user.name || "User"}
                                    width={36}
                                    height={36}
                                    className="rounded-full"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm">
                                    👤
                                </div>
                            )}
                        </Link>
                        <div className="flex-1 min-w-0">
                            <Link
                                href={`/profile/${user.id}`}
                                className="text-white text-sm font-medium hover:text-[#E50914] transition-colors line-clamp-1"
                            >
                                {user.name || "User"}
                            </Link>
                        </div>
                        <button
                            onClick={() => handleFollow(user.id)}
                            disabled={isPending && followingId === user.id}
                            className="px-3 py-1 text-xs font-medium rounded-full bg-[#E50914] text-white hover:bg-[#f40612] disabled:opacity-50 transition-colors"
                        >
                            {isPending && followingId === user.id ? "..." : "Follow"}
                        </button>
                    </div>
                ))}
            </div>
            <Link
                href="/search"
                className="block text-center text-xs text-gray-500 hover:text-[#E50914] mt-4 transition-colors"
            >
                Search for more users →
            </Link>
        </div>
    );
}

"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { searchUsers } from "@/lib/actions/search";
import { followUser } from "@/lib/actions/follow";

interface User {
    id: string;
    name: string | null;
    image: string | null;
}

interface UserSearchPageProps {
    currentUserId: string;
    suggestedUsers: User[];
}

export function UserSearchPage({ currentUserId, suggestedUsers }: UserSearchPageProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());

    async function handleSearch(value: string) {
        setQuery(value);
        if (value.length < 2) {
            setResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const users = await searchUsers(value);
            setResults(users.filter((u) => u.id !== currentUserId));
        } catch {
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }

    function handleFollow(userId: string) {
        startTransition(async () => {
            try {
                await followUser(userId);
                setFollowedIds((prev) => new Set(Array.from(prev).concat(userId)));
            } catch {
                // Silently fail
            }
        });
    }

    function renderUserCard(user: User) {
        return (
            <div
                key={user.id}
                className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-colors"
            >
                <Link href={`/profile/${user.id}`} className="flex-shrink-0">
                    {user.image ? (
                        <Image
                            src={user.image}
                            alt={user.name || "User"}
                            width={48}
                            height={48}
                            className="rounded-full"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl">
                            👤
                        </div>
                    )}
                </Link>
                <div className="flex-1 min-w-0">
                    <Link
                        href={`/profile/${user.id}`}
                        className="text-white font-medium hover:text-[#E50914] transition-colors"
                    >
                        {user.name || "User"}
                    </Link>
                </div>
                {followedIds.has(user.id) ? (
                    <span className="px-4 py-2 text-sm text-gray-400">Following ✓</span>
                ) : (
                    <button
                        onClick={() => handleFollow(user.id)}
                        disabled={isPending}
                        className="px-4 py-2 text-sm font-medium rounded-full bg-[#E50914] text-white hover:bg-[#f40612] disabled:opacity-50 transition-colors"
                    >
                        Follow
                    </button>
                )}
            </div>
        );
    }

    return (
        <div>
            {/* Search Input */}
            <div className="mb-6">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by name..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#E50914] outline-none transition-colors"
                />
            </div>

            {/* Search Results */}
            <div className="space-y-3">
                {isSearching ? (
                    <div className="text-center text-gray-400 py-8">Searching...</div>
                ) : query.length >= 2 && results.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">No users found</div>
                ) : query.length >= 2 ? (
                    results.map((user) => renderUserCard(user))
                ) : null}
            </div>

            {/* Suggested Users - Show when not searching */}
            {query.length < 2 && suggestedUsers.length > 0 && (
                <div className="mt-4">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        👥 Suggested Users
                    </h2>
                    <div className="space-y-3">
                        {suggestedUsers
                            .filter((u) => !followedIds.has(u.id))
                            .map((user) => renderUserCard(user))}
                    </div>
                </div>
            )}
        </div>
    );
}

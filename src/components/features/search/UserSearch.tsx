"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { searchUsers } from "@/lib/actions/search";

interface User {
    id: string;
    name: string | null;
    image: string | null;
}

interface UserSearchProps {
    className?: string;
}

export function UserSearch({ className }: UserSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setIsLoading(true);
                try {
                    const users = await searchUsers(query);
                    setResults(users);
                    setIsOpen(true);
                } catch (error) {
                    console.error("Search failed:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className={`relative ${className || ""}`}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder="Search users..."
                    className="w-full px-4 py-2 pl-10 rounded bg-[#333] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-white/30"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    🔍
                </span>
                {isLoading && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                        ...
                    </span>
                )}
            </div>

            {/* Results dropdown */}
            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                    {results.map((user) => (
                        <Link
                            key={user.id}
                            href={`/profile/${user.id}`}
                            onClick={() => {
                                setIsOpen(false);
                                setQuery("");
                            }}
                            className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10">
                                {user.image ? (
                                    <Image
                                        src={user.image}
                                        alt={user.name || "User"}
                                        width={32}
                                        height={32}
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sm">
                                        👤
                                    </div>
                                )}
                            </div>
                            <span className="text-white text-sm">
                                {user.name || "Anonymous"}
                            </span>
                        </Link>
                    ))}
                </div>
            )}

            {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg p-4 text-center text-gray-500 text-sm z-50">
                    No users found
                </div>
            )}

            {/* Backdrop to close dropdown */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}

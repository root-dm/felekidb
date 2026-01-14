"use client";

import Link from "next/link";
import Image from "next/image";
import { UserSearch } from "@/components/features/search/UserSearch";
import { NotificationBell } from "@/components/features/notifications/NotificationBell";
import { handleSignOut } from "@/lib/actions/auth";
import { useState } from "react";
interface NavbarProps {
    user: {
        id: string;
        name?: string | null;
        image?: string | null;
    };
}

export function Navbar({ user }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-gradient-to-b from-[#141414] to-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex justify-between items-center gap-4">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center flex-shrink-0">
                        <div className="relative w-32 h-9">
                            <Image
                                src="/images/logo-white.png"
                                alt="FelekiDB"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Search & Actions */}
                    <div className="flex items-center gap-4 flex-1 justify-end">
                        {/* Search - Collapsed on Mobile, Full on Desktop */}
                        <div className="hidden md:block w-full max-w-xs">
                            <UserSearch />
                        </div>

                        <Link
                            href="/dashboard/create"
                            className="bg-[#E50914] hover:bg-[#f40612] text-white font-semibold flex items-center gap-2 px-4 py-2 rounded text-sm whitespace-nowrap transition-colors"
                        >
                            <span>+</span>
                            <span className="hidden sm:inline">New Night</span>
                        </Link>

                        {/* Profile & Mobile Toggle */}
                        <div className="flex items-center gap-3">
                            {/* Notification Bell */}
                            <NotificationBell />

                            <Link href={`/profile/${user.id}`} className="flex-shrink-0 relative">
                                <div className="rounded-full p-0.5 bg-gradient-to-r from-[#E50914] to-[#b20710]">
                                    {user.image ? (
                                        <Image
                                            src={user.image}
                                            alt={user.name || "Profile"}
                                            width={36}
                                            height={36}
                                            className="rounded-full w-9 h-9 object-cover"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-[#333] flex items-center justify-center text-sm">👤</div>
                                    )}
                                </div>
                            </Link>

                            {/* Mobile Hamburger */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <span className="text-xl">☰</span>
                            </button>

                            {/* Desktop Sign Out */}
                            <button
                                onClick={() => handleSignOut()}
                                className="hidden md:block text-gray-400 hover:text-white text-sm transition-colors whitespace-nowrap"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 pt-4 border-t border-white/10 space-y-4">
                        <UserSearch className="w-full" />
                        <button
                            onClick={() => handleSignOut()}
                            className="w-full text-left text-red-400 hover:text-red-300 py-2 text-sm"
                        >
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

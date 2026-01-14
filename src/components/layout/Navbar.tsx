"use client";

import Link from "next/link";
import Image from "next/image";
import { UserSearch } from "@/components/features/search/UserSearch";
import { handleSignOut } from "@/lib/actions/auth";
import { useState } from "react";
import { usePathname } from "next/navigation";

interface NavbarProps {
    user: {
        id: string;
        name?: string | null;
        image?: string | null;
    };
}

export function Navbar({ user }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const isDashboard = pathname === "/dashboard";

    return (
        <nav className="glass-nav sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
                <div className="flex justify-between items-center gap-4">
                    {/* Logo - Text hidden on small mobile */}
                    <Link href="/dashboard" className="flex items-center gap-2 group flex-shrink-0">
                        <Image
                            src="/images/logo-white.png"
                            alt="FelekiDB"
                            width={140}
                            height={40}
                            className="h-10 w-auto object-contain"
                            priority
                        />
                    </Link>

                    {/* Desktop Search & Actions */}
                    <div className="flex items-center gap-4 flex-1 justify-end">
                        {/* Search - Collapsed on Mobile, Full on Desktop */}
                        <div className="hidden md:block w-full max-w-xs">
                            <UserSearch />
                        </div>

                        <Link
                            href="/dashboard/create"
                            className="btn-primary flex items-center gap-2 px-3 py-2 text-sm whitespace-nowrap"
                        >
                            <span>+</span>
                            <span className="hidden sm:inline">New Night</span>
                        </Link>

                        {/* Profile & Mobile Toggle */}
                        <div className="flex items-center gap-3">
                            <Link href={`/profile/${user.id}`} className="avatar-ring flex-shrink-0 relative">
                                {user.image ? (
                                    <Image
                                        src={user.image}
                                        alt={user.name || "Profile"}
                                        width={36}
                                        height={36}
                                        className="rounded-full w-9 h-9 object-cover"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm">👤</div>
                                )}
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
                    <div className="md:hidden mt-4 pt-4 border-t border-white/10 space-y-4 animate-fade-in-up">
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createMovieNight } from "@/lib/actions/movie-night";
import { DateTimePicker } from "@/components/ui/DateTimePicker";

export default function CreateMovieNightPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        try {
            const result = await createMovieNight({
                title: formData.get("title") as string,
                description: formData.get("description") as string || undefined,
                scheduledAt: new Date(formData.get("scheduledAt") as string),
                location: formData.get("location") as string || undefined,
                theme: formData.get("theme") as string || undefined,
            });

            if (result.success && result.data) {
                router.push(`/nights/${result.data.id}`);
            } else {
                setError(result.error || "Failed to create movie night");
                setIsLoading(false);
            }
        } catch {
            setError("Something went wrong");
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#141414]">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-[#141414] border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <Link href="/dashboard" className="flex items-center">
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
                        <button
                            onClick={() => router.back()}
                            className="text-gray-400 hover:text-white text-sm transition-colors"
                        >
                            ✕ Cancel
                        </button>
                    </div>
                </div>
            </nav>

            {/* Form */}
            <main className="max-w-lg mx-auto px-6 py-16">
                <div className="text-center mb-10">
                    <div className="text-6xl mb-4">🎬</div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Create <span className="text-[#E50914]">Movie Night</span>
                    </h1>
                    <p className="text-gray-400">
                        Set up a new movie night and invite your friends
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-[#E50914]/20 border border-[#E50914]/50 rounded p-4 text-[#E50914] text-sm">
                            {error}
                        </div>
                    )}

                    <div className="bg-[#181818] rounded-lg p-6 space-y-5 border border-white/5">
                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                                📝 Title
                                <span className="text-[#E50914] ml-1">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                minLength={3}
                                maxLength={100}
                                placeholder="Friday Horror Night"
                                className="w-full px-4 py-3 rounded bg-[#333] border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors"
                            />
                        </div>

                        {/* Date & Time */}
                        <div>
                            <DateTimePicker
                                label="📅 Date & Time"
                                name="scheduledAt"
                                required
                                minDate={new Date()}
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                                📍 Location
                                <span className="text-gray-500 ml-1">(optional)</span>
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                maxLength={100}
                                placeholder="Sarah's Place, Discord, etc."
                                className="w-full px-4 py-3 rounded bg-[#333] border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                                💬 Description
                                <span className="text-gray-500 ml-1">(optional)</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                maxLength={500}
                                placeholder="What's the theme? Any special instructions?"
                                className="w-full px-4 py-3 rounded bg-[#333] border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors resize-none"
                            />
                        </div>

                        {/* Theme */}
                        <div>
                            <label htmlFor="theme" className="block text-sm font-medium text-gray-300 mb-2">
                                🎭 Theme
                                <span className="text-gray-500 ml-1">(optional)</span>
                            </label>
                            <input
                                type="text"
                                id="theme"
                                name="theme"
                                maxLength={50}
                                placeholder="Horror, 90s, So Bad It's Good"
                                className="w-full px-4 py-3 rounded bg-[#333] border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#E50914] hover:bg-[#f40612] text-white font-bold py-4 text-lg rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Creating...</span>
                        ) : (
                            <>🎉 Create Movie Night</>
                        )}
                    </button>

                    {/* Helper text */}
                    <p className="text-center text-gray-500 text-sm">
                        After creating, you&apos;ll get an invite code to share with friends
                    </p>
                </form>
            </main>
        </div>
    );
}

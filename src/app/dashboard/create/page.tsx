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
            });

            if (result.success && result.data) {
                router.push(`/nights/${result.data.id}`);
            } else {
                setError(result.error || "Failed to create movie night");
                setIsLoading(false); // Only stop loading on error, otherwise we are redirecting
            }
        } catch (err) {
            setError("Something went wrong");
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="glass-nav sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="relative w-36 h-10">
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
                            className="btn-secondary text-sm"
                        >
                            ✕ Cancel
                        </button>
                    </div>
                </div>
            </nav>

            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
            </div>

            {/* Form */}
            <main className="max-w-lg mx-auto px-6 py-16">
                <div className="text-center mb-10">
                    <div className="text-6xl mb-4 animate-float">🎬</div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Create <span className="text-gradient">Movie Night</span>
                    </h1>
                    <p className="text-gray-400">
                        Set up a new movie night and invite your friends
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="glass rounded-xl p-4 border-red-500/50 bg-red-500/10 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="glass-strong rounded-2xl p-6 space-y-5">
                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                                📝 Title
                                <span className="text-primary-400 ml-1">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                minLength={3}
                                maxLength={100}
                                placeholder="Friday Horror Night"
                                className="input-glass w-full"
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
                                className="input-glass w-full"
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
                                className="input-glass w-full resize-none"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full py-4 text-lg shadow-glow-strong disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-pulse">Creating...</span>
                            </>
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

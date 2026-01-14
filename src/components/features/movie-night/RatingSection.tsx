"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { submitRating } from "@/lib/actions/rating";

interface Rating {
    id: string;
    score: number;
    comment: string | null;
    user: {
        id: string;
        name: string | null;
        image: string | null;
    };
}

interface RatingSectionProps {
    movieNightId: string;
    movieTitle: string;
    status: string;
    ratings: Rating[];
    userRating: Rating | null | undefined;
    averageRating: number;
}

export function RatingSection({
    movieNightId,
    movieTitle,
    status,
    ratings,
    userRating,
    averageRating,
}: RatingSectionProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedScore, setSelectedScore] = useState(userRating?.score || 0);
    const [comment, setComment] = useState(userRating?.comment || "");
    const [error, setError] = useState<string | null>(null);

    const canRate = status === "WATCHING" || status === "RATING";

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (selectedScore === 0) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await submitRating({
                movieNightId,
                score: selectedScore,
                comment: comment || undefined,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to submit rating");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section>
            <h2 className="text-xl font-semibold text-white mb-6">Ratings</h2>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Rating Form */}
                {canRate && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4">
                            Rate &quot;{movieTitle}&quot;
                        </h3>

                        <form onSubmit={handleSubmit}>
                            {/* Star Rating */}
                            <div className="mb-4">
                                <label className="block text-sm text-gray-400 mb-2">
                                    Your Rating
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((score) => (
                                        <button
                                            key={score}
                                            type="button"
                                            onClick={() => setSelectedScore(score)}
                                            className={`text-3xl transition-transform hover:scale-110 ${score <= selectedScore
                                                ? "text-yellow-400"
                                                : "text-gray-600"
                                                }`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comment */}
                            <div className="mb-4">
                                <label className="block text-sm text-gray-400 mb-2">
                                    Comment (optional)
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    maxLength={500}
                                    rows={2}
                                    placeholder="What did you think?"
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm resize-none"
                                />
                            </div>

                            {error && (
                                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={selectedScore === 0 || isSubmitting}
                                className="w-full py-3 rounded bg-[#E50914] text-white font-medium hover:bg-[#f40612] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting
                                    ? "Submitting..."
                                    : userRating
                                        ? "Update Rating"
                                        : "Submit Rating"}
                            </button>
                        </form>
                    </div>
                )}

                {/* Results */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="text-5xl font-bold text-white">
                            {averageRating > 0 ? averageRating.toFixed(1) : "-"}
                        </div>
                        <div>
                            <div className="flex text-yellow-400 text-xl">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        className={`${star <= Math.round(averageRating)
                                            ? "text-yellow-400"
                                            : "text-gray-600"
                                            }`}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <p className="text-gray-400 text-sm">
                                {ratings.length} rating{ratings.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>

                    {/* Individual Ratings */}
                    {ratings.length > 0 ? (
                        <div className="space-y-4">
                            {ratings.map((rating) => (
                                <div
                                    key={rating.id}
                                    className="flex items-start gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0"
                                >
                                    <Link href={`/profile/${rating.user.id}`} className="flex-shrink-0">
                                        {rating.user.image ? (
                                            <Image
                                                src={rating.user.image}
                                                alt={rating.user.name || "User"}
                                                width={32}
                                                height={32}
                                                className="rounded-full hover:ring-2 hover:ring-[#E50914] transition-all"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm hover:ring-2 hover:ring-[#E50914] transition-all">
                                                👤
                                            </div>
                                        )}
                                    </Link>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Link href={`/profile/${rating.user.id}`} className="text-white font-medium text-sm hover:text-[#E50914] transition-colors">
                                                {rating.user.name}
                                            </Link>
                                            <span className="text-yellow-400 text-sm">
                                                {"★".repeat(Math.round(rating.score))}
                                            </span>
                                        </div>
                                        {rating.comment && (
                                            <p className="text-gray-400 text-sm">{rating.comment}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No ratings yet.</p>
                    )}
                </div>
            </div>
        </section>
    );
}

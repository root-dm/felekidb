"use client";

import Image from "next/image";
import Link from "next/link";
import { getPosterUrl } from "@/lib/tmdb";
import { castVote } from "@/lib/actions/voting";
import { setWinningMovie } from "@/lib/actions/movie-night";
import { useState } from "react";

interface Nomination {
    id: string;
    tmdbId: number;
    mediaType: "movie" | "tv";
    title: string;
    posterPath: string | null;
    releaseYear: number | null;
    pitch: string | null;
    user: {
        id: string;
        name: string | null;
        image: string | null;
    };
    votes: { userId: string }[];
}

interface NominationListProps {
    nominations: Nomination[];
    status: string;
    userVoteId: string | undefined;
    winnerId: string | null;
    userId: string;
    isHost?: boolean;
    movieNightId: string;
}

export function NominationList({
    nominations,
    status,
    userVoteId,
    winnerId,
    userId,
    isHost = false,
    movieNightId,
}: NominationListProps) {
    const [votingId, setVotingId] = useState<string | null>(null);
    const [settingWinner, setSettingWinner] = useState<string | null>(null);

    async function handleSetWinner(nominationId: string) {
        setSettingWinner(nominationId);
        try {
            await setWinningMovie(movieNightId, nominationId);
        } catch (error) {
            console.error("Set winner failed:", error);
        } finally {
            setSettingWinner(null);
        }
    }

    async function handleVote(nominationId: string) {
        setVotingId(nominationId);
        try {
            await castVote(nominationId);
        } catch (error) {
            console.error("Vote failed:", error);
        } finally {
            setVotingId(null);
        }
    }

    if (nominations.length === 0) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                    No nominations yet
                </h3>
                <p className="text-gray-400">
                    {status === "PLANNING"
                        ? "Be the first to nominate a movie!"
                        : "Voting will begin when movies are nominated."}
                </p>
            </div>
        );
    }

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nominations.map((nomination) => {
                const isWinner = nomination.id === winnerId;
                const isUserVote = nomination.id === userVoteId;
                const isVoting = votingId === nomination.id;

                return (
                    <div
                        key={nomination.id}
                        className={`relative bg-white/5 border rounded-xl overflow-hidden transition-all ${isWinner
                            ? "border-yellow-500/50 ring-2 ring-yellow-500/20"
                            : isUserVote
                                ? "border-primary-500/50"
                                : "border-white/10 hover:border-white/20"
                            }`}
                    >
                        {/* Winner badge */}
                        {isWinner && (
                            <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-yellow-500/90 text-black text-xs font-bold">
                                🏆 Winner
                            </div>
                        )}

                        {/* Poster */}
                        <div className="aspect-[2/3] relative bg-gradient-to-br from-gray-800 to-gray-900">
                            {nomination.posterPath ? (
                                <Image
                                    src={getPosterUrl(nomination.posterPath, "w342")}
                                    alt={nomination.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                                    🎬
                                </div>
                            )}

                            {/* Vote count badge */}
                            {(status === "VOTING" || status === "WATCHING" || status === "COMPLETED") && (
                                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-sm font-medium">
                                    {nomination.votes.length} votes
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="p-4">
                            <h3 className="font-semibold text-white mb-1 line-clamp-1">
                                {nomination.title}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                                <span className="uppercase text-xs">
                                    {nomination.mediaType}
                                </span>
                                {nomination.releaseYear && <span>• {nomination.releaseYear}</span>}
                            </div>

                            {nomination.pitch && (
                                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                                    &quot;{nomination.pitch}&quot;
                                </p>
                            )}

                            {/* Nominator */}
                            <Link href={`/profile/${nomination.user.id}`} className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity">
                                {nomination.user.image ? (
                                    <Image
                                        src={nomination.user.image}
                                        alt={nomination.user.name || "User"}
                                        width={20}
                                        height={20}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">
                                        👤
                                    </div>
                                )}
                                <span className="text-gray-500 text-sm hover:text-primary-400 transition-colors">
                                    {nomination.user.name}
                                </span>
                            </Link>

                            {/* Vote button */}
                            {status === "VOTING" && (
                                <button
                                    onClick={() => handleVote(nomination.id)}
                                    disabled={isVoting}
                                    className={`w-full py-2 rounded-lg font-medium text-sm transition-all ${isUserVote
                                        ? "bg-primary-500 text-white"
                                        : "bg-white/10 text-white hover:bg-white/20"
                                        }`}
                                >
                                    {isVoting
                                        ? "Voting..."
                                        : isUserVote
                                            ? "✓ Your Vote"
                                            : "Vote"}
                                </button>
                            )}

                            {/* Host: Set as Winner button */}
                            {isHost && status !== "COMPLETED" && !isWinner && (
                                <button
                                    onClick={() => handleSetWinner(nomination.id)}
                                    disabled={settingWinner !== null}
                                    className="w-full py-2 mt-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 font-medium text-sm transition-all disabled:opacity-50"
                                >
                                    {settingWinner === nomination.id ? "Setting..." : "🏆 Set as Winner"}
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

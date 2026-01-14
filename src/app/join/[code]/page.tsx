import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { joinMovieNight } from "@/lib/actions/movie-night";

import { getPosterUrl } from "@/lib/tmdb";

interface JoinPageProps {
    params: Promise<{ code: string }>;
}

export default async function JoinPage({ params }: JoinPageProps) {
    const { code } = await params;
    const session = await auth();

    const movieNight = await prisma.movieNight.findUnique({
        where: { inviteCode: code },
        include: {
            host: {
                select: { name: true, image: true },
            },
            invitations: {
                where: { status: "ACCEPTED" },
                select: { userId: true },
            },
            winningNomination: true,
        },
    });

    if (!movieNight) {
        notFound();
    }

    // If user is logged in and already a member, redirect to the night
    if (session?.user) {
        const isAlreadyMember = movieNight.invitations.some(
            (inv) => inv.userId === session.user!.id
        ) || movieNight.hostId === session.user.id;

        if (isAlreadyMember) {
            redirect(`/nights/${movieNight.id}`);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#141414] relative overflow-hidden">
            {/* Background Image (Winner or Stock) */}
            <div className="absolute inset-0">
                {movieNight.winningNomination?.posterPath ? (
                    <Image
                        src={getPosterUrl(movieNight.winningNomination.posterPath, "original")}
                        alt="Background"
                        fill
                        className="object-cover opacity-30 blur-xl scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 bg-[#141414]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-black/60" />
            </div>

            <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col md:flex-row items-center gap-12">

                {/* Winner Poster (if exists) */}
                {movieNight.winningNomination && (
                    <div className="hidden md:block w-64 h-96 relative flex-shrink-0 group">
                        <div className="absolute inset-0 bg-[#E50914] rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                        <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                            <Image
                                src={getPosterUrl(movieNight.winningNomination.posterPath, "w500")}
                                alt={movieNight.winningNomination.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                )}

                <div className="flex-1 w-full max-w-md">
                    {/* Logo */}
                    <div className="flex justify-center md:justify-start mb-8">
                        <div className="relative w-40 h-10">
                            <Image
                                src="/images/logo-white.png"
                                alt="FelekiDB"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>

                    {/* Join Card */}
                    <div className="bg-black/80 backdrop-blur-md rounded-xl p-8 border border-white/10 shadow-2xl">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-white mb-2">
                                You&apos;re Invited!
                            </h1>
                            <p className="text-gray-400">
                                <span className="text-white font-medium">{movieNight.host.name}</span> invited you to:
                            </p>
                        </div>

                        <div className="bg-[#181818] rounded-lg p-4 mb-8 border border-white/5">
                            <h2 className="text-xl font-bold text-white mb-2 text-center md:text-left">
                                {movieNight.title}
                            </h2>

                            {movieNight.winningNomination && (
                                <div className="mb-4 pb-4 border-b border-white/10 md:hidden">
                                    <p className="text-[#E50914] text-xs font-bold uppercase tracking-widest mb-1">
                                        Current Selection
                                    </p>
                                    <p className="text-gray-300 font-medium">{movieNight.winningNomination.title}</p>
                                </div>
                            )}

                            <div className="space-y-2 text-sm text-gray-400">
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <span>📅</span>
                                    <span>
                                        {new Date(movieNight.scheduledAt).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <span>⏰</span>
                                    <span>
                                        {new Date(movieNight.scheduledAt).toLocaleTimeString("en-US", {
                                            hour: "numeric",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                                {movieNight.location && (
                                    <div className="flex items-center justify-center md:justify-start gap-2">
                                        <span>📍</span>
                                        <span>{movieNight.location}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-center md:justify-start gap-2 pt-2 text-[#E50914] font-medium">
                                    <span>👥</span>
                                    <span>{movieNight.invitations.length} attending</span>
                                </div>
                            </div>
                        </div>

                        {session?.user ? (
                            <form
                                action={async () => {
                                    "use server";
                                    const result = await joinMovieNight({ inviteCode: code });
                                    if (result.success && result.data) {
                                        redirect(`/nights/${result.data.id}`);
                                    } else {
                                        redirect(`/join/${code}?error=${encodeURIComponent(result.error || "Failed to join")}`);
                                    }
                                }}
                            >
                                <button
                                    type="submit"
                                    className="w-full py-3.5 rounded bg-[#E50914] hover:bg-[#f40612] text-white font-bold text-lg transition-colors shadow-lg shadow-red-900/20"
                                >
                                    Accept Invitation
                                </button>
                            </form>
                        ) : (
                            <Link
                                href={`/login?callbackUrl=/join/${code}`}
                                className="block w-full py-3.5 rounded bg-[#E50914] hover:bg-[#f40612] text-white font-bold text-lg text-center transition-colors shadow-lg shadow-red-900/20"
                            >
                                Sign In to Join
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

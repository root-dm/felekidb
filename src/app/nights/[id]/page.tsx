import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { getPosterUrl } from "@/lib/tmdb";
import { MovieNightActions } from "@/components/features/movie-night/MovieNightActions";
import { NominationList } from "@/components/features/movie-night/NominationList";
import { MovieSearch } from "@/components/features/movie-night/MovieSearch";
import { RatingSection } from "@/components/features/movie-night/RatingSection";
import { CopyButton } from "@/components/ui/CopyButton";
import { EditableLocation } from "@/components/features/movie-night/EditableLocation";
import { AutoStartManager } from "@/components/features/movie-night/AutoStartManager";
import { CommentSection } from "@/components/features/movie-night/CommentSection";
import { getWatchProviders, WatchProvidersData } from "@/lib/tmdb";
import { StreamingBadges } from "@/components/features/movie-night/StreamingBadges";

import { Navbar } from "@/components/layout/Navbar";

interface MovieNightPageProps {
    params: Promise<{ id: string }>;
}

export default async function MovieNightPage({ params }: MovieNightPageProps) {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const movieNight = await prisma.movieNight.findUnique({
        where: { id },
        include: {
            host: {
                select: { id: true, name: true, image: true },
            },
            invitations: {
                where: { status: "ACCEPTED" },
                include: {
                    user: {
                        select: { id: true, name: true, image: true },
                    },
                },
            },
            nominations: {
                include: {
                    user: {
                        select: { id: true, name: true, image: true },
                    },
                    votes: {
                        select: { userId: true },
                    },
                },
                orderBy: { createdAt: "asc" },
            },
            winningNomination: true,
            ratings: {
                include: {
                    user: {
                        select: { id: true, name: true, image: true },
                    },
                },
            },
            comments: {
                include: {
                    user: {
                        select: { id: true, name: true, image: true },
                    },
                    reactions: true,
                },
                orderBy: { createdAt: "desc" },
                take: 50,
            },
        },
    });

    if (!movieNight) {
        notFound();
    }

    const isHost = movieNight.hostId === session.user.id;
    const isAttendee = movieNight.invitations.some(
        (inv) => inv.userId === session.user!.id
    );

    if (!isAttendee && !isHost) {
        redirect(`/join/${movieNight.inviteCode}`);
    }

    const userVote = movieNight.nominations.find((nom) =>
        nom.votes.some((v) => v.userId === session.user!.id)
    );

    const userRating = movieNight.ratings.find(
        (r) => r.userId === session.user!.id
    );

    const averageRating =
        movieNight.ratings.length > 0
            ? movieNight.ratings.reduce((sum, r) => sum + r.score, 0) /
            movieNight.ratings.length
            : 0;

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/join/${movieNight.inviteCode}`;

    // Fetch watch providers for nominations
    const nominationsWithProviders = await Promise.all(
        movieNight.nominations.map(async (nom) => {
            const providers = await getWatchProviders(nom.tmdbId, nom.mediaType as "movie" | "tv");
            return { ...nom, providers };
        })
    );

    // Fetch watch providers for winning movie
    let winningProviders: WatchProvidersData | null = null;
    if (movieNight.winningNomination) {
        winningProviders = await getWatchProviders(
            movieNight.winningNomination.tmdbId,
            movieNight.winningNomination.mediaType as "movie" | "tv"
        );
    }

    // Status colors
    const statusColors = {
        PLANNING: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        VOTING: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        WATCHING: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        RATING: "bg-pink-500/20 text-pink-300 border-pink-500/30",
        COMPLETED: "bg-green-500/20 text-green-300 border-green-500/30",
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Background Backdrop */}
            {movieNight.winningNomination?.posterPath && (
                <div className="fixed inset-0 -z-10">
                    <Image
                        src={getPosterUrl(movieNight.winningNomination.posterPath, "original")}
                        alt="Background"
                        fill
                        className="object-cover opacity-20 blur-3xl scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-[#141414]/60" />
                </div>
            )}

            {/* Navigation */}
            <Navbar user={session.user} />

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
                {/* Hero Section */}
                <div className="relative mb-8"> {/* Reduced margin */}
                    <div className="glass-strong rounded-3xl p-8 md:p-12 overflow-hidden relative">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E50914]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        {/* Host Controls (Absolute Top Right) */}
                        {isHost && (
                            <div className="absolute top-6 right-6 z-20">
                                <MovieNightActions movieNight={movieNight} />
                            </div>
                        )}

                        <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                            {/* Winning Movie Poster or Placeholder */}
                            <div className="w-full md:w-auto flex-shrink-0 flex justify-center md:block">
                                <div className="w-48 h-72 rounded-2xl overflow-hidden glass shadow-2xl relative shadow-glow transform hover:scale-105 transition-transform duration-500">
                                    {movieNight.winningNomination?.posterPath ? (
                                        <Image
                                            src={getPosterUrl(movieNight.winningNomination.posterPath, "w500")}
                                            alt={movieNight.winningNomination.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/5">
                                            <span className="text-6xl mb-2 animate-pulse">🎬</span>
                                            <span className="text-xs text-gray-500 uppercase tracking-widest">No Selection</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 w-full text-center md:text-left">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColors[movieNight.status]}`}>
                                        {movieNight.status}
                                    </span>
                                    {movieNight.theme && (
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                                            🎭 {movieNight.theme}
                                        </span>
                                    )}
                                    {isHost && (
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/10 flex items-center gap-1">
                                            👑 Host
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                                    {movieNight.title}
                                </h1>

                                {movieNight.description && (
                                    <p className="text-lg text-gray-300 mb-6 max-w-2xl leading-relaxed mx-auto md:mx-0">
                                        {movieNight.description}
                                    </p>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto md:mx-0">
                                    <div className="glass px-4 py-3 rounded-xl flex items-center gap-3 text-left">
                                        <span className="text-2xl">📅</span>
                                        <div>
                                            <div className="text-xs text-[#E50914] uppercase font-bold tracking-wider">Scheduled For</div>
                                            <div className="text-white font-medium">{formatDate(new Date(movieNight.scheduledAt))}</div>
                                        </div>
                                    </div>

                                    <EditableLocation
                                        nightId={movieNight.id}
                                        initialLocation={movieNight.location}
                                        isHost={isHost}
                                    />

                                    {winningProviders && (
                                        <div className="glass px-4 py-3 rounded-xl col-span-1 md:col-span-2">
                                            <StreamingBadges providers={winningProviders} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Features */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Invite Link Tool */}
                        {isHost && movieNight.status === "PLANNING" && (
                            <div className="glass p-6 rounded-2xl border-l-4 border-l-[#E50914] animate-fade-in-up">
                                <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                                    🎟️ Invite Friends
                                    <span className="text-xs font-normal text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">Share this code</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inviteLink}
                                        readOnly
                                        className="flex-1 px-4 py-3 rounded bg-[#0a0a0a] border border-white/10 text-white font-mono text-sm focus:outline-none"
                                    />
                                    <CopyButton text={inviteLink} />
                                </div>
                                <AutoStartManager
                                    nightId={movieNight.id}
                                    scheduledAt={movieNight.scheduledAt}
                                    status={movieNight.status}
                                    isHost={isHost}
                                />
                            </div>
                        )}

                        {/* Nominations / Movie Selection */}
                        <section className="glass-strong rounded-2xl p-6 md:p-8 animate-fade-in-up animate-delay-100">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                        🗳️ Nominations
                                    </h2>
                                    <p className="text-gray-400 text-sm mt-1">Suggest and vote for what to watch</p>
                                </div>
                                {["PLANNING", "VOTING"].includes(movieNight.status) && (
                                    <MovieSearch movieNightId={movieNight.id} />
                                )}
                            </div>

                            {(() => {
                                const leader = nominationsWithProviders.length > 0
                                    ? [...nominationsWithProviders].sort((a, b) => b.votes.length - a.votes.length)[0]
                                    : null;
                                const currentLeaderId = leader && leader.votes.length > 0 ? leader.id : null;

                                return (
                                    <NominationList
                                        nominations={nominationsWithProviders}
                                        status={movieNight.status}
                                        userVoteId={userVote?.id}
                                        winnerId={movieNight.winningNominationId}
                                        isHost={isHost}
                                        movieNightId={movieNight.id}
                                        currentLeaderId={currentLeaderId}
                                    />
                                );
                            })()}
                        </section>

                        {/* Ratings & Reviews */}
                        {(movieNight.status === "WATCHING" ||
                            movieNight.status === "RATING" ||
                            movieNight.status === "COMPLETED") &&
                            movieNight.winningNomination && (
                                <section className="animate-fade-in-up animate-delay-200">
                                    <RatingSection
                                        movieNightId={movieNight.id}
                                        movieTitle={movieNight.winningNomination.title}
                                        status={movieNight.status}
                                        ratings={movieNight.ratings}
                                        userRating={userRating}
                                        averageRating={averageRating}
                                    />
                                </section>
                            )}

                        {/* Discussion / Comments */}
                        <section className="animate-fade-in-up animate-delay-300">
                            <CommentSection
                                movieNightId={movieNight.id}
                                initialComments={movieNight.comments}
                                currentUserId={session.user.id}
                            />
                        </section>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="sticky top-24 space-y-6">
                            {/* Attendees List */}
                            <div className="glass-strong rounded-2xl p-6 animate-fade-in-up animate-delay-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        👥 Attendees
                                    </h3>
                                    <span className="bg-white/10 text-white px-2 py-0.5 rounded-full text-xs">
                                        {movieNight.invitations.length}
                                    </span>
                                </div>

                                {movieNight.invitations.length === 0 ? (
                                    <p className="text-gray-500 text-sm italic">No one yet...</p>
                                ) : (
                                    <div className="space-y-3">
                                        {movieNight.invitations.map((inv) => (
                                            <Link
                                                key={inv.userId}
                                                href={`/profile/${inv.userId}`}
                                                className="flex items-center gap-3 group hover:bg-white/5 p-2 rounded-lg transition-colors"
                                            >
                                                <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden relative shadow-md">
                                                    {inv.user.image ? (
                                                        <Image
                                                            src={inv.user.image}
                                                            alt={inv.user.name || "Attendee"}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-[#232323] flex items-center justify-center text-sm">
                                                            👤
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white truncate group-hover:text-[#E50914] transition-colors">
                                                        {inv.user.name || "Unknown User"}
                                                    </p>
                                                    {inv.userId === movieNight.hostId && (
                                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest">Host</span>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

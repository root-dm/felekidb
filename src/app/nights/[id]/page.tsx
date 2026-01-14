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
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/60" />
                </div>
            )}

            {/* Navigation */}
            <Navbar user={session.user} />

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
                {/* Hero Section */}
                <div className="relative mb-12">
                    <div className="glass-strong rounded-3xl p-8 md:p-12 overflow-hidden relative">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

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
                            <div className="flex-1 w-full">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColors[movieNight.status]}`}>
                                        {movieNight.status}
                                    </span>
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
                                    <p className="text-lg text-gray-300 mb-6 max-w-2xl leading-relaxed">
                                        {movieNight.description}
                                    </p>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                    <div className="glass px-4 py-3 rounded-xl flex items-center gap-3">
                                        <span className="text-2xl">📅</span>
                                        <div>
                                            <div className="text-xs text-primary-300 uppercase font-bold tracking-wider">Scheduled For</div>
                                            <div className="text-white font-medium">{formatDate(new Date(movieNight.scheduledAt))}</div>
                                        </div>
                                    </div>
                                    {movieNight.location && (
                                        <div className="glass px-4 py-3 rounded-xl flex items-center gap-3">
                                            <span className="text-2xl">📍</span>
                                            <div>
                                                <div className="text-xs text-primary-300 uppercase font-bold tracking-wider">Location</div>
                                                <div className="text-white font-medium">{movieNight.location}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Attendees */}
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-3 flex items-center gap-2">
                                        <span>Attendees</span>
                                        <span className="bg-white/10 text-white px-1.5 py-0.5 rounded text-[10px]">{movieNight.invitations.length}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-3">
                                            {movieNight.invitations.slice(0, 8).map((inv) => (
                                                <Link
                                                    key={inv.userId}
                                                    href={`/profile/${inv.userId}`}
                                                    className="w-10 h-10 rounded-full border-2 border-slate-900 overflow-hidden hover:scale-110 hover:z-10 hover:border-primary-500 transition-all shadow-lg"
                                                    title={inv.user.name || "Attendee"}
                                                >
                                                    {inv.user.image ? (
                                                        <Image
                                                            src={inv.user.image}
                                                            alt={inv.user.name || "Attendee"}
                                                            width={40}
                                                            height={40}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-xs">
                                                            👤
                                                        </div>
                                                    )}
                                                </Link>
                                            ))}
                                            {movieNight.invitations.length > 8 && (
                                                <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white shadow-lg z-0">
                                                    +{movieNight.invitations.length - 8}
                                                </div>
                                            )}
                                        </div>
                                    </div>
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
                            <div className="glass p-6 rounded-2xl border-l-4 border-l-primary-500 animate-fade-in-up">
                                <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                                    🎟️ Invite Friends
                                    <span className="text-xs font-normal text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">Share this code</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inviteLink}
                                        readOnly
                                        className="flex-1 px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-white font-mono text-sm focus:outline-none"
                                    />
                                    <CopyButton text={inviteLink} />
                                </div>
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
                                {movieNight.status === "PLANNING" && (
                                    <MovieSearch movieNightId={movieNight.id} />
                                )}
                            </div>

                            <NominationList
                                nominations={movieNight.nominations}
                                status={movieNight.status}
                                userVoteId={userVote?.id}
                                winnerId={movieNight.winningNominationId}
                                userId={session.user.id}
                                isHost={isHost}
                                movieNightId={movieNight.id}
                            />
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
                                        isHost={isHost}
                                    />
                                </section>
                            )}
                    </div>

                    {/* Right Column - Actions & Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Host Controls */}
                            {isHost && (
                                <div className="glass-strong rounded-2xl p-6 animate-fade-in-up animate-delay-300">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        ⚡ Control Panel
                                    </h3>
                                    <MovieNightActions movieNight={movieNight} />
                                </div>
                            )}

                            {/* Quick Tips or Info could go here */}
                            <div className="glass rounded-xl p-5 border-l-2 border-l-blue-500/50">
                                <h4 className="text-sm font-bold text-blue-300 mb-2">Did you know?</h4>
                                <p className="text-sm text-gray-400">
                                    You can click on any profile picture to see their movie stats and reputation!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

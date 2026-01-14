import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getUserMovieNights } from "@/lib/actions/movie-night";
import { getActivityFeed, getQuickStats } from "@/lib/actions/feed";
import { formatDate, getTimeRemaining } from "@/lib/utils";
import { getPosterUrl } from "@/lib/tmdb";
import { UserSearch } from "@/components/features/search/UserSearch";
import { ActivityFeed } from "@/components/features/feed/ActivityFeed";

import { Navbar } from "@/components/layout/Navbar";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const [{ upcoming, past }, feedItems, stats] = await Promise.all([
        getUserMovieNights(),
        getActivityFeed(15),
        getQuickStats(),
    ]);

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <Navbar user={session.user} />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Header with stats */}
                <div className="mb-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Welcome back, <span className="text-gradient">{session.user.name?.split(" ")[0]}</span> 👋
                            </h1>
                            <p className="text-gray-400">
                                Your movie night hub
                            </p>
                        </div>

                        {/* Quick Stats */}
                        {stats && (
                            <div className="flex gap-4">
                                <div className="stats-card">
                                    <div className="text-2xl font-bold text-white">{stats.upcomingNights}</div>
                                    <div className="text-gray-500 text-xs">Upcoming</div>
                                </div>
                                <div className="stats-card">
                                    <div className="text-2xl font-bold text-white">{stats.winningNominations}</div>
                                    <div className="text-gray-500 text-xs">Wins</div>
                                </div>
                                <Link href={`/profile/${session.user.id}`} className="stats-card hover:border-primary-500/50">
                                    <div className="text-2xl font-bold text-white">{stats.followersCount}</div>
                                    <div className="text-gray-500 text-xs">Followers</div>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Two column layout */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Movie Nights */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Upcoming Movie Nights */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    🎬 Upcoming Nights
                                    {upcoming.length > 0 && (
                                        <span className="badge-glow">{upcoming.length}</span>
                                    )}
                                </h2>
                                <Link href="/dashboard/create" className="text-primary-400 text-sm hover:text-primary-300 transition-colors">
                                    + Create new
                                </Link>
                            </div>

                            {upcoming.length === 0 ? (
                                <div className="glass-card p-10 text-center">
                                    <div className="text-5xl mb-4 animate-float">🍿</div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        No upcoming movie nights
                                    </h3>
                                    <p className="text-gray-400 mb-6 text-sm">
                                        Create a movie night and invite your friends!
                                    </p>
                                    <Link href="/dashboard/create" className="btn-primary inline-flex">
                                        🎉 Create Movie Night
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {upcoming.slice(0, 4).map((night, index) => (
                                        <Link
                                            key={night.id}
                                            href={`/nights/${night.id}`}
                                            className="glass-card overflow-hidden animate-fade-in-up"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <div className="aspect-[2/1] relative">
                                                {night.winningNomination?.posterPath ? (
                                                    <Image
                                                        src={getPosterUrl(night.winningNomination.posterPath, "w500")}
                                                        alt={night.winningNomination.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-5xl bg-gradient-to-br from-primary-500/20 to-accent-500/20">
                                                        🎬
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                                    <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">
                                                        {night.title}
                                                    </h3>
                                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                                        <span>📅 {formatDate(new Date(night.scheduledAt))}</span>
                                                        <span className="badge-glow text-xs py-0.5 px-2">
                                                            {getTimeRemaining(new Date(night.scheduledAt))}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Past Movie Nights */}
                        {past.length > 0 && (
                            <section>
                                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                    ✅ Recently Watched
                                </h2>
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                    {past.slice(0, 8).map((night) => (
                                        <Link
                                            key={night.id}
                                            href={`/nights/${night.id}`}
                                            className="flex-shrink-0 w-32"
                                        >
                                            <div className="aspect-[2/3] rounded-xl overflow-hidden poster-card mb-2">
                                                {night.winningNomination?.posterPath ? (
                                                    <Image
                                                        src={getPosterUrl(night.winningNomination.posterPath, "w185")}
                                                        alt={night.winningNomination.title}
                                                        width={128}
                                                        height={192}
                                                        className="object-cover w-full h-full"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-800 to-gray-900">
                                                        🎬
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-white text-xs font-medium line-clamp-1">
                                                {night.winningNomination?.title || night.title}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column - Activity Feed */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                📡 Activity Feed
                            </h2>
                            <ActivityFeed items={feedItems} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

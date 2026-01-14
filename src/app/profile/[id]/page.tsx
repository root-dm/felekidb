import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getUserProfile } from "@/lib/actions/profile";
import { getFollowStatus, getFollowCounts } from "@/lib/actions/follow";
import { formatDate } from "@/lib/utils";
import { FollowButton } from "@/components/ui/FollowButton";
import { FollowStats } from "@/components/features/profile/FollowStats";
import { getUserWatchlist } from "@/lib/actions/watchlist";
import { WatchlistGrid } from "@/components/features/profile/WatchlistGrid";
import { getUserStats, calculateBadges } from "@/lib/stats";
import { BadgeDisplay } from "@/components/features/profile/BadgeDisplay";

interface ProfilePageProps {
    params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const [profile, followStatus, followCounts, watchlist, userStats] = await Promise.all([
        getUserProfile(id),
        getFollowStatus(id),
        getFollowCounts(id),
        getUserWatchlist(id),
        getUserStats(id),
    ]);

    const badges = calculateBadges(userStats);

    if (!profile) {
        notFound();
    }

    const isOwnProfile = session.user.id === profile.id;

    return (
        <div className="min-h-screen bg-[#141414] relative">
            {/* Fixed background effects for entire page */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E50914]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#E50914]/5 rounded-full blur-3xl" />
            </div>

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
                        <Link href="/dashboard" className="btn-secondary text-sm">
                            ← Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Profile Header with Glass Background */}
            <header className="relative py-16 px-6 overflow-hidden">

                <div className="max-w-4xl mx-auto relative">
                    <div className="glass-strong rounded-3xl p-8 md:p-10">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="avatar-ring p-1">
                                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden bg-slate-900">
                                        {profile.image ? (
                                            <Image
                                                src={profile.image}
                                                alt={profile.name || "Profile"}
                                                width={144}
                                                height={144}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-[#E50914]/20 to-[#b20710]/20">
                                                👤
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Tier badge */}
                                <div className="absolute -bottom-2 -right-2 text-5xl animate-float">
                                    {profile.reputation.tier.icon}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-4">
                                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                                        {profile.name || "Anonymous"}
                                        {isOwnProfile && <span className="text-gray-500 text-lg ml-2">(You)</span>}
                                    </h1>
                                    {!isOwnProfile ? (
                                        <FollowButton
                                            targetUserId={profile.id}
                                            isFollowing={followStatus.isFollowing}
                                            isMutual={followStatus.isMutual}
                                        />
                                    ) : (
                                        <Link
                                            href="/profile/edit"
                                            className="px-4 py-2 text-sm font-medium rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/5"
                                        >
                                            Edit Profile
                                        </Link>
                                    )}
                                </div>

                                {/* Follow Stats */}
                                <FollowStats
                                    userId={profile.id}
                                    followersCount={followCounts.followers}
                                    followingCount={followCounts.following}
                                    isFollowedBy={followStatus.isFollowedBy}
                                    isOwnProfile={isOwnProfile}
                                />

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                                    <span className="badge-glow">
                                        {profile.reputation.tier.icon} {profile.reputation.tier.name}
                                    </span>
                                    <span className="text-gray-400 text-sm">
                                        📅 Member since {formatDate(new Date(profile.createdAt))}
                                    </span>
                                </div>

                                {/* Badges */}
                                {badges.length > 0 && (
                                    <div className="flex justify-center md:justify-start gap-3 mb-6">
                                        {badges.map((badge) => (
                                            <BadgeDisplay key={badge.id} badge={badge} />
                                        ))}
                                    </div>
                                )}

                                {/* Reputation Stats */}
                                <div className="flex items-center justify-center md:justify-start gap-8">
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-gradient text-glow">
                                            {profile.reputation.score}
                                        </div>
                                        <div className="text-gray-500 text-sm">Reputation</div>
                                    </div>
                                    <div className="h-10 w-px bg-white/10" />
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-white">
                                            {profile.reputation.winningNominations}
                                        </div>
                                        <div className="text-gray-500 text-sm">Wins</div>
                                    </div>
                                    <div className="h-10 w-px bg-white/10" />
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-white">
                                            {profile.reputation.averageRating > 0 ? profile.reputation.averageRating.toFixed(1) : "-"}
                                        </div>
                                        <div className="text-gray-500 text-sm">Avg ★</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 pb-16 -mt-4">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Stats Grid */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            📊 Stats
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="stats-card">
                                <div className="text-3xl font-bold text-white">{userStats.hostingCount}</div>
                                <div className="text-gray-500 text-xs mt-1">Nights Hosted</div>
                            </div>
                            <div className="stats-card">
                                <div className="text-3xl font-bold text-white">{profile.stats.nightsAttended}</div>
                                <div className="text-gray-500 text-xs mt-1">Nights Attended</div>
                            </div>
                            <div className="stats-card">
                                <div className="text-3xl font-bold text-white">{userStats.totalNominations}</div>
                                <div className="text-gray-500 text-xs mt-1">Nominations</div>
                            </div>
                            <div className="stats-card">
                                <div className="text-3xl font-bold text-white">{userStats.totalVotesReceived}</div>
                                <div className="text-gray-500 text-xs mt-1">Votes Recv</div>
                            </div>
                        </div>
                    </section>

                    {/* Reputation History */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            📈 Reputation History
                        </h2>
                        {profile.recentEvents.length === 0 ? (
                            <div className="glass-card p-8 text-center">
                                <div className="text-4xl mb-3 animate-float">🎬</div>
                                <p className="text-gray-400 text-sm">
                                    No reputation events yet. Nominate movies that win and get high ratings!
                                </p>
                            </div>
                        ) : (
                            <div className="glass rounded-xl overflow-hidden divide-y divide-white/5">
                                {profile.recentEvents.map((event: any) => (
                                    <div key={event.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                                        <div>
                                            <div className="text-white font-medium text-sm">{event.movieTitle}</div>
                                            <div className="text-gray-500 text-xs">
                                                {event.averageRating.toFixed(1)}★ avg
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-bold text-sm ${event.points >= 0 ? "text-green-400" : "text-red-400"}`}>
                                                {event.points >= 0 ? "+" : ""}{event.points} pts
                                            </div>
                                            <div className="text-gray-600 text-xs">
                                                {formatDate(new Date(event.createdAt))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Watchlist Section */}
                <section className="mt-12 space-y-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        📺 Watchlist <span className="text-gray-500 text-sm font-normal">({watchlist.length})</span>
                    </h2>
                    <WatchlistGrid items={watchlist} isOwnProfile={isOwnProfile} />
                </section>
            </main>
        </div>
    );
}

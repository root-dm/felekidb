import Image from "next/image";
import Link from "next/link";
import { getPosterUrl } from "@/lib/tmdb";
import type { FeedItem } from "@/lib/actions/feed";

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
}

function getFeedIcon(type: FeedItem["type"]): string {
    switch (type) {
        case "movie_night_created": return "🎬";
        case "nomination_added": return "🎯";
        case "vote_cast": return "🗳️";
        case "rating_submitted": return "⭐";
        case "night_completed": return "✅";
        case "follow": return "👥";
        default: return "📌";
    }
}

function getFeedMessage(item: FeedItem): React.ReactNode {
    switch (item.type) {
        case "movie_night_created":
            return (
                <>
                    created a movie night: <strong>{item.data.movieNightTitle}</strong>
                </>
            );
        case "nomination_added":
            return (
                <>
                    nominated <strong>{item.data.nominationTitle}</strong> for {item.data.movieNightTitle}
                </>
            );
        case "rating_submitted":
            return (
                <>
                    rated <strong>{item.data.movieNightTitle}</strong> {item.data.rating}★
                </>
            );
        case "follow":
            return (
                <>
                    started following <strong>{item.data.targetUser?.name}</strong>
                </>
            );
        default:
            return "did something";
    }
}

interface ActivityFeedProps {
    items: FeedItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
    if (items.length === 0) {
        return (
            <div className="glass-card p-8 text-center">
                <div className="text-4xl mb-4">📡</div>
                <h3 className="text-lg font-medium text-white mb-2">No activity yet</h3>
                <p className="text-gray-400 text-sm">
                    Follow people or create movie nights to see activity here
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.id} className="glass rounded-xl p-4 flex gap-4">
                    {/* User Avatar */}
                    <Link href={`/profile/${item.user.id}`} className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10">
                            {item.user.image ? (
                                <Image
                                    src={item.user.image}
                                    alt={item.user.name || "User"}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    👤
                                </div>
                            )}
                        </div>
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-gray-300 text-sm">
                                <Link
                                    href={`/profile/${item.user.id}`}
                                    className="font-medium text-white hover:text-primary-400 transition-colors"
                                >
                                    {item.user.name}
                                </Link>{" "}
                                {getFeedMessage(item)}
                            </p>
                            <span className="text-gray-500 text-xs whitespace-nowrap">
                                {formatTimeAgo(item.createdAt)}
                            </span>
                        </div>

                        {/* Poster preview */}
                        {item.data.posterPath && item.data.movieNightId && (
                            <Link
                                href={`/nights/${item.data.movieNightId}`}
                                className="mt-3 block"
                            >
                                <div className="w-20 h-28 rounded-lg overflow-hidden poster-card">
                                    <Image
                                        src={getPosterUrl(item.data.posterPath, "w185")}
                                        alt={item.data.nominationTitle || item.data.movieNightTitle || "Movie"}
                                        width={80}
                                        height={112}
                                        className="object-cover"
                                    />
                                </div>
                            </Link>
                        )}
                    </div>

                    {/* Icon */}
                    <div className="text-2xl flex-shrink-0">
                        {getFeedIcon(item.type)}
                    </div>
                </div>
            ))}
        </div>
    );
}

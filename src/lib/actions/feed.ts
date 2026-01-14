"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export interface FeedItem {
    id: string;
    type: "movie_night_created" | "nomination_added" | "vote_cast" | "rating_submitted" | "night_completed" | "follow";
    user: {
        id: string;
        name: string | null;
        image: string | null;
    };
    data: {
        movieNightId?: string;
        movieNightTitle?: string;
        nominationTitle?: string;
        posterPath?: string | null;
        rating?: number;
        targetUser?: {
            id: string;
            name: string | null;
        };
    };
    createdAt: Date;
}

/**
 * Get activity feed for the current user
 * Shows activities from people they follow and their own activity
 */
export async function getActivityFeed(limit = 20): Promise<FeedItem[]> {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    // Get users this person follows
    const following = await prisma.follow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true },
    });

    const followedUserIds = following.map((f) => f.followingId);
    const relevantUserIds = [session.user.id, ...followedUserIds];

    const feed: FeedItem[] = [];

    // Recent movie nights created
    const recentNights = await prisma.movieNight.findMany({
        where: { hostId: { in: relevantUserIds } },
        include: {
            host: { select: { id: true, name: true, image: true } },
            winningNomination: { select: { posterPath: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
    });

    for (const night of recentNights) {
        feed.push({
            id: `night-${night.id}`,
            type: "movie_night_created",
            user: night.host,
            data: {
                movieNightId: night.id,
                movieNightTitle: night.title,
                posterPath: night.winningNomination?.posterPath,
            },
            createdAt: night.createdAt,
        });
    }

    // Recent nominations
    const recentNominations = await prisma.nomination.findMany({
        where: { userId: { in: relevantUserIds } },
        include: {
            user: { select: { id: true, name: true, image: true } },
            movieNight: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
    });

    for (const nom of recentNominations) {
        feed.push({
            id: `nom-${nom.id}`,
            type: "nomination_added",
            user: nom.user,
            data: {
                movieNightId: nom.movieNight.id,
                movieNightTitle: nom.movieNight.title,
                nominationTitle: nom.title,
                posterPath: nom.posterPath,
            },
            createdAt: nom.createdAt,
        });
    }

    // Recent ratings
    const recentRatings = await prisma.rating.findMany({
        where: { userId: { in: relevantUserIds } },
        include: {
            user: { select: { id: true, name: true, image: true } },
            movieNight: {
                select: {
                    id: true,
                    title: true,
                    winningNomination: { select: { title: true, posterPath: true } },
                },
            },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
    });

    for (const rating of recentRatings) {
        feed.push({
            id: `rating-${rating.id}`,
            type: "rating_submitted",
            user: rating.user,
            data: {
                movieNightId: rating.movieNight.id,
                movieNightTitle: rating.movieNight.winningNomination?.title || rating.movieNight.title,
                posterPath: rating.movieNight.winningNomination?.posterPath,
                rating: rating.score,
            },
            createdAt: rating.createdAt,
        });
    }

    // Recent follows
    const recentFollows = await prisma.follow.findMany({
        where: { followerId: { in: relevantUserIds } },
        include: {
            follower: { select: { id: true, name: true, image: true } },
            following: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
    });

    for (const follow of recentFollows) {
        feed.push({
            id: `follow-${follow.id}`,
            type: "follow",
            user: follow.follower,
            data: {
                targetUser: follow.following,
            },
            createdAt: follow.createdAt,
        });
    }

    // Sort by date and limit
    feed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return feed.slice(0, limit);
}

/**
 * Get quick stats for the current user
 */
export async function getQuickStats() {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const [
        upcomingNights,
        totalNominations,
        winningNominations,
        followersCount,
        followingCount,
    ] = await Promise.all([
        prisma.movieNight.count({
            where: {
                OR: [
                    { hostId: session.user.id },
                    { invitations: { some: { userId: session.user.id, status: "ACCEPTED" } } },
                ],
                status: { not: "COMPLETED" },
            },
        }),
        prisma.nomination.count({ where: { userId: session.user.id } }),
        prisma.nomination.count({
            where: {
                userId: session.user.id,
                wonMovieNight: { isNot: null },
            },
        }),
        prisma.follow.count({ where: { followingId: session.user.id } }),
        prisma.follow.count({ where: { followerId: session.user.id } }),
    ]);

    return {
        upcomingNights,
        totalNominations,
        winningNominations,
        followersCount,
        followingCount,
    };
}

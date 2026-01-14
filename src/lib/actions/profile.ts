"use server";

import { prisma } from "@/lib/db";
import { calculateReputation } from "@/lib/reputation";

interface ReputationTier {
    name: string;
    icon: string;
    color: string;
}

function getTierInfo(tier: string): ReputationTier {
    switch (tier) {
        case "Platinum":
            return { name: "Film Guru", icon: "🏆", color: "bg-purple-500/20 text-purple-400 border border-purple-500/50" };
        case "Gold":
            return { name: "Great Taste", icon: "🥇", color: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50" };
        case "Silver":
            return { name: "Solid Picks", icon: "🥈", color: "bg-gray-400/20 text-gray-300 border border-gray-400/50" };
        case "Bronze":
            return { name: "Hit or Miss", icon: "🥉", color: "bg-orange-500/20 text-orange-400 border border-orange-500/50" };
        default:
            return { name: "Needs Improvement", icon: "📉", color: "bg-red-500/20 text-red-400 border border-red-500/50" };
    }
}

export interface UserProfile {
    id: string;
    name: string | null;
    image: string | null;
    createdAt: Date;
    reputation: {
        score: number;
        tier: ReputationTier;
        totalNominations: number;
        winningNominations: number;
        averageRating: number;
    };
    recentEvents: {
        id: string;
        movieTitle: string;
        averageRating: number;
        points: number;
        createdAt: Date;
    }[];
    stats: {
        nightsHosted: number;
        nightsAttended: number;
        moviesWatched: number;
    };
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            reputationEvents: {
                include: {
                    nomination: {
                        select: { title: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
            },
            nominations: {
                include: {
                    movieNight: {
                        select: { winningNominationId: true },
                    },
                },
            },
            hostedNights: {
                select: { id: true },
            },
            invitations: {
                where: { status: "ACCEPTED" },
                include: {
                    movieNight: {
                        select: { status: true },
                    },
                },
            },
        },
    });

    if (!user) return null;

    // Calculate reputation using the userId
    const reputationData = await calculateReputation(userId);
    const tierInfo = getTierInfo(reputationData.tier);

    // Count winning nominations
    const winningNominations = user.nominations.filter(
        (nom) => nom.movieNight.winningNominationId === nom.id
    ).length;

    // Calculate average rating for winning nominations
    const ratingsSum = user.reputationEvents.reduce((sum, e) => sum + e.averageRating, 0);
    const averageRating = user.reputationEvents.length > 0
        ? ratingsSum / user.reputationEvents.length
        : 0;

    // Count completed movie nights
    const moviesWatched = user.invitations.filter(
        (inv) => inv.movieNight.status === "COMPLETED"
    ).length;

    return {
        id: user.id,
        name: user.name,
        image: user.image,
        createdAt: user.createdAt,
        reputation: {
            score: reputationData.score,
            tier: tierInfo,
            totalNominations: user.nominations.length,
            winningNominations,
            averageRating: Math.round(averageRating * 10) / 10,
        },
        recentEvents: user.reputationEvents.map((e) => ({
            id: e.id,
            movieTitle: e.nomination?.title || "Unknown",
            averageRating: e.averageRating,
            points: Math.round(e.points * 10) / 10,
            createdAt: e.createdAt,
        })),
        stats: {
            nightsHosted: user.hostedNights.length,
            nightsAttended: user.invitations.length,
            moviesWatched,
        },
    };
}

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Update user profile
 */
export async function updateProfile(data: { name: string }) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    if (!data.name || data.name.length < 2) {
        throw new Error("Name must be at least 2 characters");
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { name: data.name },
    });

    revalidatePath(`/profile/${session.user.id}`);
    revalidatePath("/dashboard");
    return { success: true };
}

/**
 * Delete user account and all associated data
 */
export async function deleteAccount() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // Delete in order to respect foreign key constraints
    await prisma.$transaction([
        // Delete notifications
        prisma.notification.deleteMany({ where: { userId } }),
        // Delete comments
        prisma.movieNightComment.deleteMany({ where: { userId } }),
        // Delete votes
        prisma.vote.deleteMany({ where: { userId } }),
        // Delete ratings
        prisma.rating.deleteMany({ where: { userId } }),
        // Delete reputation events
        prisma.reputationEvent.deleteMany({ where: { userId } }),
        // Delete nominations
        prisma.nomination.deleteMany({ where: { userId } }),
        // Delete invitations
        prisma.invitation.deleteMany({ where: { userId } }),
        // Delete follows (both directions)
        prisma.follow.deleteMany({ where: { OR: [{ followerId: userId }, { followingId: userId }] } }),
        // Delete hosted movie nights
        prisma.movieNight.deleteMany({ where: { hostId: userId } }),
        // Delete accounts (OAuth)
        prisma.account.deleteMany({ where: { userId } }),
        // Delete sessions
        prisma.session.deleteMany({ where: { userId } }),
        // Finally delete user
        prisma.user.delete({ where: { id: userId } }),
    ]);

    return { success: true };
}

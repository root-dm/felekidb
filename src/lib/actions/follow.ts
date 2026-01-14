"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Follow a user
 */
export async function followUser(targetUserId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    if (session.user.id === targetUserId) {
        throw new Error("You cannot follow yourself");
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
    });

    if (!targetUser) {
        throw new Error("User not found");
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: session.user.id,
                followingId: targetUserId,
            },
        },
    });

    if (existingFollow) {
        throw new Error("Already following this user");
    }

    await prisma.follow.create({
        data: {
            followerId: session.user.id,
            followingId: targetUserId,
        },
    });

    revalidatePath(`/profile/${targetUserId}`);
}

/**
 * Unfollow a user
 */
export async function unfollowUser(targetUserId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    await prisma.follow.deleteMany({
        where: {
            followerId: session.user.id,
            followingId: targetUserId,
        },
    });

    revalidatePath(`/profile/${targetUserId}`);
}

/**
 * Get follow status between current user and target user
 */
export async function getFollowStatus(targetUserId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { isFollowing: false, isFollowedBy: false, isMutual: false };
    }

    if (session.user.id === targetUserId) {
        return { isFollowing: false, isFollowedBy: false, isMutual: false };
    }

    const [following, followedBy] = await Promise.all([
        prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: session.user.id,
                    followingId: targetUserId,
                },
            },
        }),
        prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: targetUserId,
                    followingId: session.user.id,
                },
            },
        }),
    ]);

    const isFollowing = !!following;
    const isFollowedBy = !!followedBy;

    return {
        isFollowing,
        isFollowedBy,
        isMutual: isFollowing && isFollowedBy,
    };
}

/**
 * Get follow counts for a user
 */
export async function getFollowCounts(userId: string) {
    const [followers, following] = await Promise.all([
        prisma.follow.count({ where: { followingId: userId } }),
        prisma.follow.count({ where: { followerId: userId } }),
    ]);

    return { followers, following };
}

/**
 * Get followers list for a user
 */
export async function getFollowers(userId: string) {
    const follows = await prisma.follow.findMany({
        where: { followingId: userId },
        include: {
            follower: {
                select: { id: true, name: true, image: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return follows.map((f) => f.follower);
}

/**
 * Get following list for a user
 */
export async function getFollowing(userId: string) {
    const follows = await prisma.follow.findMany({
        where: { followerId: userId },
        include: {
            following: {
                select: { id: true, name: true, image: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return follows.map((f) => f.following);
}

/**
 * Get mutuals (users who follow each other) for a user
 */
export async function getMutuals(userId: string) {
    // Get users this person follows
    const following = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);

    // Get users who follow back
    const mutualFollows = await prisma.follow.findMany({
        where: {
            followerId: { in: followingIds },
            followingId: userId,
        },
        include: {
            follower: {
                select: { id: true, name: true, image: true },
            },
        },
    });

    return mutualFollows.map((f) => f.follower);
}

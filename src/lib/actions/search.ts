"use server";

import { prisma } from "@/lib/db";

interface SearchResult {
    id: string;
    name: string | null;
    image: string | null;
}

/**
 * Search for users by name
 */
export async function searchUsers(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) {
        return [];
    }

    const users = await prisma.user.findMany({
        where: {
            name: {
                contains: query,
            },
        },
        select: {
            id: true,
            name: true,
            image: true,
        },
        take: 20,
        orderBy: {
            name: "asc",
        },
    });

    return users;
}

/**
 * Get suggested users to follow (users not currently followed)
 */
export async function getSuggestedUsers(currentUserId: string, limit = 5): Promise<SearchResult[]> {
    // Get IDs of users already followed
    const following = await prisma.follow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);

    // Get users not followed (excluding self)
    const suggestedUsers = await prisma.user.findMany({
        where: {
            id: {
                notIn: [...followingIds, currentUserId],
            },
        },
        select: {
            id: true,
            name: true,
            image: true,
        },
        take: limit,
        orderBy: {
            createdAt: "desc",
        },
    });

    return suggestedUsers;
}

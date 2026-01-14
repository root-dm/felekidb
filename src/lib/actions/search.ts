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

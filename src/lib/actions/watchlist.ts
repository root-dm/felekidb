"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addToWatchlist(movie: {
    tmdbId: number;
    mediaType: "movie" | "tv";
    title: string;
    posterPath: string | null;
    releaseYear: number | null;
}) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.watchlistItem.create({
            data: {
                userId: session.user.id,
                tmdbId: movie.tmdbId,
                mediaType: movie.mediaType,
                title: movie.title,
                posterPath: movie.posterPath,
                releaseYear: movie.releaseYear,
            },
        });

        revalidatePath(`/profile/${session.user.id}`);
        return { success: true };
    } catch {
        return { success: false, error: "Failed to add to watchlist" };
    }
}

export async function removeFromWatchlist(tmdbId: number) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.watchlistItem.delete({
            where: {
                userId_tmdbId: {
                    userId: session.user.id,
                    tmdbId,
                },
            },
        });

        revalidatePath(`/profile/${session.user.id}`);
        return { success: true };
    } catch {
        return { success: false, error: "Failed to remove from watchlist" };
    }
}

export async function getWatchlistStatus(tmdbId: number) {
    const session = await auth();
    if (!session?.user) return false;

    const item = await prisma.watchlistItem.findUnique({
        where: {
            userId_tmdbId: {
                userId: session.user.id,
                tmdbId,
            },
        },
    });

    return !!item;
}

export async function getUserWatchlist(userId: string) {
    return await prisma.watchlistItem.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
}

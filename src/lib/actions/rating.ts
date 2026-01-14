"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
    calculateDampenedAverage,
    calculatePoints,
} from "@/lib/reputation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const submitRatingSchema = z.object({
    movieNightId: z.string(),
    score: z.number().min(1).max(5),
    comment: z.string().max(500).optional(),
});

export type SubmitRatingInput = z.infer<typeof submitRatingSchema>;

/**
 * Submit a rating for a movie night
 */
export async function submitRating(input: SubmitRatingInput) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const validated = submitRatingSchema.parse(input);

    const movieNight = await prisma.movieNight.findUnique({
        where: { id: validated.movieNightId },
        include: {
            invitations: true,
            winningNomination: true,
        },
    });

    if (!movieNight) {
        throw new Error("Movie night not found");
    }

    const isAttendee = movieNight.invitations.some(
        (inv) => inv.userId === session.user!.id && inv.status === "ACCEPTED"
    );

    if (!isAttendee) {
        throw new Error("You must have attended to rate");
    }

    // Allow rating at any time as long as night exists and has a winner
    // Effectively we allow it even in PLANNING/VOTING if a winner is selected?
    // User wants "indefinite", so basically if winningNomination exists, we are good.
    if (!movieNight.winningNomination) {
        throw new Error("Cannot rate without a selected movie");
    }

    // Upsert rating
    await prisma.rating.upsert({
        where: {
            movieNightId_userId: {
                movieNightId: validated.movieNightId,
                userId: session.user.id,
            },
        },
        update: {
            score: validated.score,
            comment: validated.comment,
        },
        create: {
            movieNightId: validated.movieNightId,
            userId: session.user.id,
            score: validated.score,
            comment: validated.comment,
        },
    });

    // Automatically update/create reputation event
    // Fetch all current ratings
    const allRatings = await prisma.rating.findMany({
        where: { movieNightId: validated.movieNightId }
    });

    // Filter out nominator's rating
    const nominatorId = movieNight.winningNomination.userId;
    const eligibleRatings = allRatings.filter(r => r.userId !== nominatorId);

    if (eligibleRatings.length > 0) {
        const ratingScores = eligibleRatings.map((r) => r.score);
        const averageRating = calculateDampenedAverage(ratingScores);
        const points = calculatePoints(averageRating, eligibleRatings.length);

        // Upsert reputation event
        await prisma.reputationEvent.upsert({
            where: {
                movieNightId: validated.movieNightId
            },
            update: {
                averageRating,
                voterCount: eligibleRatings.length,
                points,
            },
            create: {
                userId: nominatorId,
                movieNightId: validated.movieNightId,
                nominationId: movieNight.winningNomination.id,
                averageRating,
                voterCount: eligibleRatings.length,
                points,
            }
        });
    }

    // Notify nominator about the rating (if rater is different from nominator)
    if (session.user.id !== nominatorId) {
        const rater = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { name: true },
        });

        await prisma.notification.create({
            data: {
                userId: nominatorId,
                type: "RATING",
                title: "New Rating",
                message: `${rater?.name || "Someone"} rated your pick ${validated.score}⭐`,
                link: `/nights/${validated.movieNightId}`,
            },
        });
    }

    revalidatePath(`/nights/${validated.movieNightId}`);
    revalidatePath("/dashboard");
}

/**
 * Finalize a movie night and create reputation event
 * @deprecated functionality moved to submitRating and auto-updates
 */
export async function finalizeMovieNight(movieNightId: string) {
    // Keep this for backward compatibility or explicit closure if needed
    // But update implementation to just set status to COMPLETED
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const movieNight = await prisma.movieNight.findUnique({
        where: { id: movieNightId },
    });

    if (!movieNight) {
        throw new Error("Movie night not found");
    }

    if (movieNight.hostId !== session.user.id) {
        throw new Error("Only the host can finalize");
    }

    await prisma.movieNight.update({
        where: { id: movieNightId },
        data: { status: "COMPLETED" },
    });

    revalidatePath(`/nights/${movieNightId}`);
}

/**
 * Get ratings for a movie night
 */
export async function getRatings(movieNightId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { ratings: [], average: 0, userRating: null };
    }

    const ratings = await prisma.rating.findMany({
        where: { movieNightId },
        include: {
            user: {
                select: { id: true, name: true, image: true },
            },
        },
    });

    const average =
        ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
            : 0;

    const userRating = ratings.find((r) => r.userId === session.user!.id) || null;

    return { ratings, average, userRating };
}

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
    calculateDampenedAverage,
    calculatePoints,
    hasEnoughVoters,
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

    if (movieNight.status !== "RATING" && movieNight.status !== "WATCHING") {
        throw new Error("Rating is not open");
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

    // Update status to RATING if still WATCHING
    if (movieNight.status === "WATCHING") {
        await prisma.movieNight.update({
            where: { id: validated.movieNightId },
            data: { status: "RATING" },
        });
    }

    revalidatePath(`/nights/${validated.movieNightId}`);
}

/**
 * Finalize a movie night and create reputation event
 */
export async function finalizeMovieNight(movieNightId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const movieNight = await prisma.movieNight.findUnique({
        where: { id: movieNightId },
        include: {
            ratings: true,
            winningNomination: {
                include: { user: true },
            },
        },
    });

    if (!movieNight) {
        throw new Error("Movie night not found");
    }

    if (movieNight.hostId !== session.user.id) {
        throw new Error("Only the host can finalize");
    }

    if (movieNight.status !== "RATING") {
        throw new Error("Movie night is not in rating phase");
    }

    if (!movieNight.winningNomination) {
        throw new Error("No winning movie to rate");
    }

    // Filter out the nominator's own rating
    const eligibleRatings = movieNight.ratings.filter(
        (r) => r.userId !== movieNight.winningNomination!.userId
    );

    // Update status to completed
    await prisma.movieNight.update({
        where: { id: movieNightId },
        data: { status: "COMPLETED" },
    });

    // Create reputation event if there are eligible ratings (excluding nominator's own)
    if (eligibleRatings.length > 0) {
        const ratingScores = eligibleRatings.map((r) => r.score);
        const averageRating = calculateDampenedAverage(ratingScores);
        const points = calculatePoints(averageRating, eligibleRatings.length);

        await prisma.reputationEvent.create({
            data: {
                userId: movieNight.winningNomination.userId,
                movieNightId,
                nominationId: movieNight.winningNomination.id,
                averageRating,
                voterCount: eligibleRatings.length,
                points,
            },
        });
    }

    revalidatePath(`/nights/${movieNightId}`);
    revalidatePath("/dashboard");
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

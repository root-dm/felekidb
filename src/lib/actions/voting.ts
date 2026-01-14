"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const nominateMovieSchema = z.object({
    movieNightId: z.string(),
    tmdbId: z.number(),
    mediaType: z.enum(["movie", "tv"]),
    title: z.string(),
    posterPath: z.string().nullable(),
    releaseYear: z.number().nullable(),
    pitch: z.string().max(250).optional(),
});

export type NominateMovieInput = z.infer<typeof nominateMovieSchema>;

/**
 * Nominate a movie for a movie night
 */
export async function nominateMovie(input: NominateMovieInput) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const validated = nominateMovieSchema.parse(input);

    // Verify movie night exists and user is attendee
    const movieNight = await prisma.movieNight.findUnique({
        where: { id: validated.movieNightId },
        include: { invitations: true },
    });

    if (!movieNight) {
        throw new Error("Movie night not found");
    }

    const isAttendee = movieNight.invitations.some(
        (inv) => inv.userId === session.user!.id && inv.status === "ACCEPTED"
    );

    if (!isAttendee) {
        throw new Error("You must be attending this movie night to nominate");
    }

    if (movieNight.status !== "PLANNING" && movieNight.status !== "VOTING") {
        throw new Error("Nominations are closed");
    }

    // Check for duplicate
    const existing = await prisma.nomination.findUnique({
        where: {
            movieNightId_tmdbId: {
                movieNightId: validated.movieNightId,
                tmdbId: validated.tmdbId,
            },
        },
    });

    if (existing) {
        throw new Error("This movie has already been nominated");
    }

    // Check user's nomination count (max 3)
    const userNominations = await prisma.nomination.count({
        where: {
            movieNightId: validated.movieNightId,
            userId: session.user.id,
        },
    });

    if (userNominations >= 3) {
        throw new Error("You can only nominate 3 movies per night");
    }

    await prisma.nomination.create({
        data: {
            movieNightId: validated.movieNightId,
            userId: session.user.id,
            tmdbId: validated.tmdbId,
            mediaType: validated.mediaType,
            title: validated.title,
            posterPath: validated.posterPath,
            releaseYear: validated.releaseYear,
            pitch: validated.pitch,
        },
    });

    revalidatePath(`/nights/${validated.movieNightId}`);
}

/**
 * Cast a vote for a nomination
 */
export async function castVote(nominationId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const nomination = await prisma.nomination.findUnique({
        where: { id: nominationId },
        include: {
            movieNight: {
                include: { invitations: true },
            },
        },
    });

    if (!nomination) {
        throw new Error("Nomination not found");
    }

    const isAttendee = nomination.movieNight.invitations.some(
        (inv) => inv.userId === session.user!.id && inv.status === "ACCEPTED"
    );

    if (!isAttendee) {
        throw new Error("You must be attending to vote");
    }

    // Allow voting at any time as long as night exists
    if (!["PLANNING", "VOTING", "WATCHING", "COMPLETED", "RATING"].includes(nomination.movieNight.status)) {
        // Should not happen unless bad status
        throw new Error("Invalid night status");
    }

    // Remove any existing vote for this night
    const existingVote = await prisma.vote.findFirst({
        where: {
            userId: session.user.id,
            nomination: {
                movieNightId: nomination.movieNightId,
            },
        },
    });

    if (existingVote) {
        await prisma.vote.delete({
            where: { id: existingVote.id },
        });
    }

    // Create new vote
    await prisma.vote.create({
        data: {
            nominationId,
            userId: session.user.id,
        },
    });

    // Recalculate winner
    const updatedMovieNight = await prisma.movieNight.findUnique({
        where: { id: nomination.movieNightId },
        include: {
            nominations: {
                include: { votes: true }
            }
        }
    });

    if (updatedMovieNight) {
        const sorted = updatedMovieNight.nominations.sort((a, b) => b.votes.length - a.votes.length);
        const topNomination = sorted[0];

        // If there's a clear winner or even a tie, we just take the first one returned by sort
        // Update winningId (or clear it if no votes)
        const newWinnerId = (topNomination && topNomination.votes.length > 0) ? topNomination.id : null;

        await prisma.movieNight.update({
            where: { id: updatedMovieNight.id },
            data: { winningNominationId: newWinnerId }
        });
    }

    revalidatePath(`/nights/${nomination.movieNightId}`);
}

/**
 * Close voting and select winner
 */
export async function closeVoting(movieNightId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const movieNight = await prisma.movieNight.findUnique({
        where: { id: movieNightId },
        include: {
            nominations: {
                include: {
                    votes: true,
                },
            },
        },
    });

    if (!movieNight) {
        throw new Error("Movie night not found");
    }

    if (movieNight.hostId !== session.user.id) {
        throw new Error("Only the host can close voting");
    }

    // AutoStartManager might call this even if in VOTING/PLANNING, so we generally allow it
    if (movieNight.status !== "VOTING" && movieNight.status !== "PLANNING") {
        throw new Error("Voting is not open");
    }

    if (movieNight.nominations.length === 0) {
        // Decide: Do we error or just switch to Watching with no winner?
        // User logic: "tha ksekinaei mono tou"
        // If no nominations, maybe just switch phase.
        // But logic below expects nominations.
        // Let's keep existing check for now.
        // throw new Error("No nominations to vote on");
    }

    // Find winner (most votes)
    let winnerId = null;
    if (movieNight.nominations.length > 0) {
        const sortedNominations = movieNight.nominations.sort(
            (a, b) => b.votes.length - a.votes.length
        );
        const winner = sortedNominations[0];
        if (winner && winner.votes.length > 0) {
            winnerId = winner.id;
        }
    }

    await prisma.movieNight.update({
        where: { id: movieNightId },
        data: {
            status: "WATCHING",
            winningNominationId: winnerId,
        },
    });

    revalidatePath(`/nights/${movieNightId}`);
}

/**
 * Get nominations for a movie night
 */
export async function getNominations(movieNightId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    return prisma.nomination.findMany({
        where: { movieNightId },
        include: {
            user: {
                select: { id: true, name: true, image: true },
            },
            votes: {
                select: { userId: true },
            },
        },
        orderBy: { createdAt: "asc" },
    });
}

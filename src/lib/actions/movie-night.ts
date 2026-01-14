"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateInviteCode } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createMovieNightSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100),
    description: z.string().max(500).optional(),
    scheduledAt: z.coerce.date().refine((date) => date > new Date(), {
        message: "Date must be in the future",
    }),
    location: z.string().max(100).optional(),
    theme: z.string().max(50).optional(),
    votingDeadline: z.coerce.date().optional(),
});

export type CreateMovieNightInput = z.infer<typeof createMovieNightSchema>;

import { createSafeAction } from "@/lib/server-utils";

export const createMovieNight = createSafeAction(createMovieNightSchema, async (data, userId) => {
    // Generate unique invite code
    let inviteCode = generateInviteCode();
    let attempts = 0;
    while (attempts < 10) {
        const existing = await prisma.movieNight.findUnique({
            where: { inviteCode },
        });
        if (!existing) break;
        inviteCode = generateInviteCode();
        attempts++;
    }

    const movieNight = await prisma.movieNight.create({
        data: {
            title: data.title,
            description: data.description,
            scheduledAt: data.scheduledAt,
            location: data.location,
            theme: data.theme,
            votingDeadline: data.votingDeadline,
            inviteCode,
            hostId: userId,
            status: "PLANNING",
        },
    });

    // Auto-add host as accepted attendee
    await prisma.invitation.create({
        data: {
            movieNightId: movieNight.id,
            userId: userId,
            status: "ACCEPTED",
            joinedAt: new Date(),
        },
    });

    revalidatePath("/dashboard");
    return movieNight;
});

/**
 * Join a movie night via invite code
 */
const joinMovieNightSchema = z.object({
    inviteCode: z.string(),
});

export const joinMovieNight = createSafeAction(joinMovieNightSchema, async ({ inviteCode }, userId) => {
    const movieNight = await prisma.movieNight.findUnique({
        where: { inviteCode },
        include: { invitations: true },
    });

    if (!movieNight) {
        throw new Error("Movie night not found");
    }

    if (movieNight.status === "COMPLETED") {
        throw new Error("This movie night has already ended");
    }

    // Check if already joined
    const existingInvite = movieNight.invitations.find(
        (inv) => inv.userId === userId
    );

    if (existingInvite) {
        return movieNight;
    }

    // Create invitation
    await prisma.invitation.create({
        data: {
            movieNightId: movieNight.id,
            userId: userId,
            status: "ACCEPTED",
            joinedAt: new Date(),
        },
    });

    // Notify host that someone joined
    const joiner = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
    });

    await prisma.notification.create({
        data: {
            userId: movieNight.hostId,
            type: "INVITE",
            title: "New Attendee",
            message: `${joiner?.name || "Someone"} joined "${movieNight.title}"`,
            link: `/nights/${movieNight.id}`,
        },
    });

    revalidatePath(`/nights/${movieNight.id}`);
    return movieNight;
});

/**
 * Update movie night status
 */
const updateStatusSchema = z.object({
    nightId: z.string(),
    status: z.enum(["PLANNING", "VOTING", "WATCHING", "RATING", "COMPLETED"]),
});

export const updateMovieNightStatus = createSafeAction(updateStatusSchema, async ({ nightId, status }, userId) => {
    const movieNight = await prisma.movieNight.findUnique({
        where: { id: nightId },
    });

    if (!movieNight) {
        throw new Error("Movie night not found");
    }

    if (movieNight.hostId !== userId) {
        throw new Error("Only the host can change status");
    }

    await prisma.movieNight.update({
        where: { id: nightId },
        data: { status },
    });

    revalidatePath(`/nights/${nightId}`);
    return { success: true };
});

/**
 * Update movie night details (title, description, location, etc.)
 */
const updateDetailsSchema = z.object({
    nightId: z.string(),
    location: z.string().max(100).optional(),
    description: z.string().max(500).optional(),
});

export const updateMovieNightDetails = createSafeAction(updateDetailsSchema, async ({ nightId, location, description }, userId) => {
    const movieNight = await prisma.movieNight.findUnique({
        where: { id: nightId },
    });

    if (!movieNight) {
        throw new Error("Movie night not found");
    }

    if (movieNight.hostId !== userId) {
        throw new Error("Only the host can update details");
    }

    await prisma.movieNight.update({
        where: { id: nightId },
        data: {
            location: location !== undefined ? location : undefined,
            description: description !== undefined ? description : undefined,
        },
    });

    revalidatePath(`/nights/${nightId}`);
    return { success: true };
});

/**
 * Get user's movie nights for dashboard
 */
export async function getUserMovieNights() {
    const session = await auth();
    if (!session?.user?.id) {
        return { upcoming: [], past: [] };
    }

    const now = new Date();

    const invitations = await prisma.invitation.findMany({
        where: {
            userId: session.user.id,
            status: "ACCEPTED",
        },
        include: {
            movieNight: {
                include: {
                    host: {
                        select: { id: true, name: true, image: true },
                    },
                    invitations: {
                        where: { status: "ACCEPTED" },
                        select: { userId: true },
                    },
                    winningNomination: {
                        select: { title: true, posterPath: true },
                    },
                },
            },
        },
        orderBy: {
            movieNight: {
                scheduledAt: "asc",
            },
        },
    });

    const nights = invitations.map((inv) => inv.movieNight);

    return {
        upcoming: nights.filter(
            (n) => n.status !== "COMPLETED" && n.scheduledAt > now
        ),
        past: nights.filter(
            (n) => n.status === "COMPLETED" || n.scheduledAt <= now
        ),
    };
}

/**
 * Host can manually set the winning movie (override voting)
 */
const setWinnerSchema = z.object({
    nightId: z.string(),
    nominationId: z.string(),
});

export const setWinningMovie = createSafeAction(setWinnerSchema, async ({ nightId, nominationId }, userId) => {
    const movieNight = await prisma.movieNight.findUnique({
        where: { id: nightId },
        include: { nominations: true },
    });

    if (!movieNight) {
        throw new Error("Movie night not found");
    }

    if (movieNight.hostId !== userId) {
        throw new Error("Only the host can set the winning movie");
    }

    // Verify nomination exists for this movie night
    const nomination = movieNight.nominations.find((n) => n.id === nominationId);
    if (!nomination) {
        throw new Error("Nomination not found");
    }

    await prisma.movieNight.update({
        where: { id: nightId },
        data: {
            winningNominationId: nominationId,
            status: movieNight.status === "VOTING" ? "WATCHING" : movieNight.status,
        },
    });

    revalidatePath(`/nights/${nightId}`);
    return { success: true };
});

/**
 * Host can delete a movie night
 */
const deleteNightSchema = z.object({
    nightId: z.string(),
});

export const deleteMovieNight = createSafeAction(deleteNightSchema, async ({ nightId }, userId) => {
    const movieNight = await prisma.movieNight.findUnique({
        where: { id: nightId },
    });

    if (!movieNight) {
        throw new Error("Movie night not found");
    }

    if (movieNight.hostId !== userId) {
        throw new Error("Only the host can delete this movie night");
    }

    // Delete all related records first (cascade)
    await prisma.reputationEvent.deleteMany({ where: { movieNightId: nightId } });
    await prisma.rating.deleteMany({ where: { movieNightId: nightId } });
    await prisma.vote.deleteMany({ where: { nomination: { movieNightId: nightId } } });
    await prisma.nomination.deleteMany({ where: { movieNightId: nightId } });
    await prisma.invitation.deleteMany({ where: { movieNightId: nightId } });
    await prisma.movieNight.delete({ where: { id: nightId } });

    revalidatePath("/dashboard");
    return { success: true };
});

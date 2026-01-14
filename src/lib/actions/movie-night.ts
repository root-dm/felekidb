"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateInviteCode } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createMovieNightSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100),
    description: z.string().max(500).optional(),
    scheduledAt: z.coerce.date().refine((date) => date > new Date(), {
        message: "Date must be in the future",
    }),
    location: z.string().max(100).optional(),
    votingDeadline: z.coerce.date().optional(),
});

export type CreateMovieNightInput = z.infer<typeof createMovieNightSchema>;

/**
 * Create a new movie night
 */
export async function createMovieNight(input: CreateMovieNightInput) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const validated = createMovieNightSchema.parse(input);

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
            title: validated.title,
            description: validated.description,
            scheduledAt: validated.scheduledAt,
            location: validated.location,
            votingDeadline: validated.votingDeadline,
            inviteCode,
            hostId: session.user.id,
        },
    });

    // Auto-add host as accepted attendee
    await prisma.invitation.create({
        data: {
            movieNightId: movieNight.id,
            userId: session.user.id,
            status: "ACCEPTED",
            joinedAt: new Date(),
        },
    });

    revalidatePath("/dashboard");
    redirect(`/nights/${movieNight.id}`);
}

/**
 * Join a movie night via invite code
 */
export async function joinMovieNight(inviteCode: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

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
        (inv) => inv.userId === session.user!.id
    );

    if (existingInvite) {
        redirect(`/nights/${movieNight.id}`);
    }

    // Create invitation
    await prisma.invitation.create({
        data: {
            movieNightId: movieNight.id,
            userId: session.user.id,
            status: "ACCEPTED",
            joinedAt: new Date(),
        },
    });

    revalidatePath(`/nights/${movieNight.id}`);
    redirect(`/nights/${movieNight.id}`);
}

/**
 * Update movie night status
 */
export async function updateMovieNightStatus(
    nightId: string,
    status: "PLANNING" | "VOTING" | "WATCHING" | "RATING" | "COMPLETED"
) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const movieNight = await prisma.movieNight.findUnique({
        where: { id: nightId },
    });

    if (!movieNight) {
        throw new Error("Movie night not found");
    }

    if (movieNight.hostId !== session.user.id) {
        throw new Error("Only the host can change status");
    }

    await prisma.movieNight.update({
        where: { id: nightId },
        data: { status },
    });

    revalidatePath(`/nights/${nightId}`);
}

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
export async function setWinningMovie(nightId: string, nominationId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const movieNight = await prisma.movieNight.findUnique({
        where: { id: nightId },
        include: { nominations: true },
    });

    if (!movieNight) {
        throw new Error("Movie night not found");
    }

    if (movieNight.hostId !== session.user.id) {
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
}

/**
 * Host can delete a movie night
 */
export async function deleteMovieNight(nightId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const movieNight = await prisma.movieNight.findUnique({
        where: { id: nightId },
    });

    if (!movieNight) {
        throw new Error("Movie night not found");
    }

    if (movieNight.hostId !== session.user.id) {
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
    redirect("/dashboard");
}

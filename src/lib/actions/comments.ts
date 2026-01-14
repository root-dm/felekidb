"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const addCommentSchema = z.object({
    movieNightId: z.string(),
    content: z.string().min(1, "Comment cannot be empty").max(500, "Comment too long"),
});

/**
 * Add a comment to a movie night
 */
export async function addComment(input: z.infer<typeof addCommentSchema>) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const validated = addCommentSchema.parse(input);

    // Check if user is attendee of this movie night
    const invitation = await prisma.invitation.findUnique({
        where: {
            movieNightId_userId: {
                movieNightId: validated.movieNightId,
                userId: session.user.id,
            },
        },
    });

    if (!invitation) {
        throw new Error("You must be an attendee to comment");
    }

    const comment = await prisma.movieNightComment.create({
        data: {
            movieNightId: validated.movieNightId,
            userId: session.user.id,
            content: validated.content,
        },
        include: {
            user: {
                select: { id: true, name: true, image: true },
            },
        },
    });

    // Notify other attendees about the comment
    const movieNight = await prisma.movieNight.findUnique({
        where: { id: validated.movieNightId },
        include: { invitations: true },
    });

    if (movieNight) {
        const otherAttendees = movieNight.invitations
            .filter((inv) => inv.userId !== session.user!.id && inv.status === "ACCEPTED")
            .map((inv) => inv.userId);

        if (otherAttendees.length > 0) {
            await prisma.notification.createMany({
                data: otherAttendees.map((userId) => ({
                    userId,
                    type: "COMMENT",
                    title: "New Comment",
                    message: `${comment.user.name || "Someone"} commented on "${movieNight.title}"`,
                    link: `/nights/${validated.movieNightId}`,
                })),
            });
        }
    }

    revalidatePath(`/nights/${validated.movieNightId}`);
    return comment;
}

/**
 * Get comments for a movie night
 */
export async function getComments(movieNightId: string) {
    const comments = await prisma.movieNightComment.findMany({
        where: { movieNightId },
        include: {
            user: {
                select: { id: true, name: true, image: true },
            },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    return comments;
}

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleReaction(commentId: string, emoji: string) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { success: false, error: "Not authenticated" };
        }

        const existingReaction = await prisma.reaction.findUnique({
            where: {
                commentId_userId_emoji: {
                    commentId,
                    userId: session.user.id,
                    emoji,
                },
            },
        });

        if (existingReaction) {
            // Remove reaction
            await prisma.reaction.delete({
                where: { id: existingReaction.id },
            });
        } else {
            // Add reaction
            await prisma.reaction.create({
                data: {
                    commentId,
                    userId: session.user.id,
                    emoji,
                },
            });
        }

        revalidatePath("/nights/[id]");
        return { success: true };
    } catch (error) {
        console.error("Toggle reaction error:", error);
        return { success: false, error: "Failed to toggle reaction" };
    }
}

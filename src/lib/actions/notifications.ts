"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Get notifications for current user
 */
export async function getNotifications() {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    const notifications = await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
    });

    return notifications;
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    await prisma.notification.update({
        where: { id, userId: session.user.id },
        data: { read: true },
    });

    revalidatePath("/");
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    await prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true },
    });

    revalidatePath("/");
}

/**
 * Create a notification (internal helper)
 */
export async function createNotification({
    userId,
    type,
    title,
    message,
    link,
}: {
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
}) {
    await prisma.notification.create({
        data: {
            userId,
            type,
            title,
            message,
            link,
        },
    });
}

/**
 * Get unread count for current user
 */
export async function getUnreadCount() {
    const session = await auth();
    if (!session?.user?.id) {
        return 0;
    }

    const count = await prisma.notification.count({
        where: { userId: session.user.id, read: false },
    });

    return count;
}

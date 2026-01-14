import { prisma } from "@/lib/db";


export interface UserStats {
    totalNights: number;
    totalNominations: number;
    totalVotesReceived: number;
    wins: number;
    hostingCount: number;
    favoriteGenre?: string; // Placeholder for now
}

export interface Badge {
    id: string;
    icon: string;
    name: string;
    description: string;
    color: string;
}

export const BADGES: Record<string, Badge> = {
    HOST_WITH_THE_MOST: {
        id: "HOST_WITH_THE_MOST",
        icon: "🎟️",
        name: "Host with the Most",
        description: "Hosted 5+ Movie Nights",
        color: "bg-purple-500",
    },
    OFTEN_NOMINATED: {
        id: "OFTEN_NOMINATED",
        icon: "🎬",
        name: "Cinephile",
        description: "Nominated 10+ Movies",
        color: "bg-blue-500",
    },
    CHAMPION: {
        id: "CHAMPION",
        icon: "🏆",
        name: "Champion",
        description: "Won 3+ Movie Nights",
        color: "bg-yellow-500",
    },
    TRENDSETTER: {
        id: "TRENDSETTER",
        icon: "🔥",
        name: "Trendsetter",
        description: "Received 50+ Votes Total",
        color: "bg-red-500",
    },
    EARLY_BIRD: {
        id: "EARLY_BIRD",
        icon: "🌅",
        name: "Early Bird",
        description: "Joined within the first month",
        color: "bg-green-500",
    }
};

export async function getUserStats(userId: string): Promise<UserStats> {
    const [nominations, hostedNights, wins] = await Promise.all([
        prisma.nomination.findMany({
            where: { userId },
            include: { votes: true },
        }),
        prisma.movieNight.count({
            where: { hostId: userId },
        }),
        prisma.movieNight.count({
            where: { winningNomination: { userId } },
        }),
    ]);

    const totalVotesReceived = nominations.reduce((acc, curr) => acc + curr.votes.length, 0);

    return {
        totalNights: 0, // Difficult to calculate precisely without joining everything, skipping for now
        totalNominations: nominations.length,
        totalVotesReceived,
        wins,
        hostingCount: hostedNights,
    };
}

export function calculateBadges(stats: UserStats): Badge[] {
    const badges: Badge[] = [];

    if (stats.hostingCount >= 5) badges.push(BADGES.HOST_WITH_THE_MOST);
    if (stats.totalNominations >= 10) badges.push(BADGES.OFTEN_NOMINATED);
    if (stats.wins >= 3) badges.push(BADGES.CHAMPION);
    if (stats.totalVotesReceived >= 50) badges.push(BADGES.TRENDSETTER);

    return badges;
}

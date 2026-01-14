import { prisma } from "@/lib/db";
import { ReputationEvent } from "@prisma/client";

// Minimum voters required for reputation impact
const MIN_VOTERS = 3;

// Maximum points change per single event
const MAX_POINTS = 5;

/**
 * Get multiplier based on voter count
 * More voters = more weight
 */
function getMultiplier(voterCount: number): number {
    if (voterCount >= 11) return 1.2;
    if (voterCount >= 8) return 1.1;
    if (voterCount >= 5) return 1.0;
    return 0.8; // 3-4 voters
}

/**
 * Apply dampening to extreme ratings (1.0 or 5.0)
 * Reduces impact of spite/favor ratings
 */
export function calculateDampenedAverage(ratings: number[]): number {
    if (ratings.length === 0) return 3.0;

    let sum = 0;
    let weight = 0;

    for (const rating of ratings) {
        const ratingWeight = rating === 1.0 || rating === 5.0 ? 0.8 : 1.0;
        sum += rating * ratingWeight;
        weight += ratingWeight;
    }

    return weight > 0 ? sum / weight : 3.0;
}

/**
 * Calculate points for a reputation event
 * Returns value between -5 and +5
 */
export function calculatePoints(
    averageRating: number,
    voterCount: number
): number {
    const multiplier = getMultiplier(voterCount);
    const rawPoints = (averageRating - 3.0) * multiplier;
    return Math.max(-MAX_POINTS, Math.min(MAX_POINTS, rawPoints));
}

/**
 * Calculate time decay weight for an event
 * Events decay exponentially over a year
 */
function getTimeDecayWeight(eventDate: Date): number {
    const now = new Date();
    const ageInDays =
        (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
    return Math.exp(-ageInDays / 365);
}

/**
 * Calculate a user's current reputation score
 * Uses weighted average of all events with time decay
 * Returns 0-100 scale (50 is neutral)
 */
export async function calculateReputation(userId: string): Promise<{
    score: number;
    tier: string;
    label: string;
    eventCount: number;
}> {
    const events = await prisma.reputationEvent.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });

    if (events.length === 0) {
        return { score: 50, tier: "Bronze", label: "Hit or Miss", eventCount: 0 };
    }

    let totalPoints = 0;
    let totalWeight = 0;

    for (const event of events) {
        const weight = getTimeDecayWeight(event.createdAt);
        totalPoints += event.points * weight;
        totalWeight += weight;
    }

    // Normalize to 0-100 scale
    const rawScore = totalWeight > 0 ? totalPoints / totalWeight : 0;
    const score = Math.min(100, Math.max(0, 50 + rawScore * 10));

    return {
        score: Math.round(score),
        ...getTier(score),
        eventCount: events.length,
    };
}

/**
 * Get tier information based on score
 */
function getTier(score: number): { tier: string; label: string } {
    if (score >= 90) return { tier: "Platinum", label: "Film Guru" };
    if (score >= 75) return { tier: "Gold", label: "Great Taste" };
    if (score >= 60) return { tier: "Silver", label: "Solid Picks" };
    if (score >= 40) return { tier: "Bronze", label: "Hit or Miss" };
    return { tier: "Iron", label: "Needs Improvement" };
}

/**
 * Get reputation history for a user
 */
export async function getReputationHistory(
    userId: string,
    limit = 10
): Promise<ReputationEvent[]> {
    return prisma.reputationEvent.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
            movieNight: {
                select: { title: true },
            },
            nomination: {
                select: { title: true },
            },
        },
    });
}

/**
 * Check if enough voters for reputation event
 */
export function hasEnoughVoters(voterCount: number): boolean {
    return voterCount >= MIN_VOTERS;
}

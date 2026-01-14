import { PrismaClient, MovieNightStatus, InvitationStatus, MediaType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Clean existing data
    await prisma.reputationEvent.deleteMany();
    await prisma.rating.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.nomination.deleteMany();
    await prisma.invitation.deleteMany();
    await prisma.movieNight.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    // Create test users
    const users = await Promise.all([
        prisma.user.create({
            data: {
                email: "alice@example.com",
                name: "Alice Johnson",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
            },
        }),
        prisma.user.create({
            data: {
                email: "bob@example.com",
                name: "Bob Smith",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
            },
        }),
        prisma.user.create({
            data: {
                email: "carol@example.com",
                name: "Carol Williams",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=carol",
            },
        }),
    ]);

    console.log(`✅ Created ${users.length} users`);

    const [alice, bob, carol] = users;

    // Create movie nights in different states

    // 1. Planning phase movie night
    const planningNight = await prisma.movieNight.create({
        data: {
            title: "Friday Horror Marathon",
            description: "Spooky movies for a spooky night! 🎃",
            scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
            location: "Alice's Place",
            inviteCode: "HORROR123",
            status: MovieNightStatus.PLANNING,
            hostId: alice.id,
        },
    });

    // Add invitations
    await prisma.invitation.createMany({
        data: [
            { movieNightId: planningNight.id, userId: alice.id, status: InvitationStatus.ACCEPTED, joinedAt: new Date() },
            { movieNightId: planningNight.id, userId: bob.id, status: InvitationStatus.ACCEPTED, joinedAt: new Date() },
            { movieNightId: planningNight.id, userId: carol.id, status: InvitationStatus.PENDING },
        ],
    });

    // Add nominations
    await prisma.nomination.createMany({
        data: [
            {
                movieNightId: planningNight.id,
                userId: alice.id,
                tmdbId: 694,
                mediaType: MediaType.movie,
                title: "The Shining",
                posterPath: "/9fgh3Ns1iRzlQNRLlMlY5iGQOk.jpg",
                releaseYear: 1980,
                pitch: "A classic that never gets old!",
            },
            {
                movieNightId: planningNight.id,
                userId: bob.id,
                tmdbId: 539,
                mediaType: MediaType.movie,
                title: "Psycho",
                posterPath: "/tJK5PB8qAqJLEn7epDJhJRciKRg.jpg",
                releaseYear: 1960,
                pitch: "Hitchcock at his finest",
            },
        ],
    });

    console.log("✅ Created planning phase movie night");

    // 2. Voting phase movie night
    const votingNight = await prisma.movieNight.create({
        data: {
            title: "Sci-Fi Sunday",
            description: "Explore the cosmos together!",
            scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            location: "Discord Watch Party",
            inviteCode: "SCIFI2025",
            status: MovieNightStatus.VOTING,
            hostId: bob.id,
        },
    });

    await prisma.invitation.createMany({
        data: [
            { movieNightId: votingNight.id, userId: bob.id, status: InvitationStatus.ACCEPTED, joinedAt: new Date() },
            { movieNightId: votingNight.id, userId: alice.id, status: InvitationStatus.ACCEPTED, joinedAt: new Date() },
            { movieNightId: votingNight.id, userId: carol.id, status: InvitationStatus.ACCEPTED, joinedAt: new Date() },
        ],
    });

    const scifiNominations = await Promise.all([
        prisma.nomination.create({
            data: {
                movieNightId: votingNight.id,
                userId: bob.id,
                tmdbId: 438631,
                mediaType: MediaType.movie,
                title: "Dune",
                posterPath: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
                releaseYear: 2021,
                pitch: "Visually stunning!",
            },
        }),
        prisma.nomination.create({
            data: {
                movieNightId: votingNight.id,
                userId: alice.id,
                tmdbId: 27205,
                mediaType: MediaType.movie,
                title: "Inception",
                posterPath: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
                releaseYear: 2010,
                pitch: "Mind-bending masterpiece",
            },
        }),
    ]);

    // Add votes
    await prisma.vote.createMany({
        data: [
            { nominationId: scifiNominations[0].id, userId: bob.id },
            { nominationId: scifiNominations[0].id, userId: carol.id },
            { nominationId: scifiNominations[1].id, userId: alice.id },
        ],
    });

    console.log("✅ Created voting phase movie night");

    // 3. Completed movie night with ratings
    const completedNight = await prisma.movieNight.create({
        data: {
            title: "Classic Comedy Night",
            description: "Laughs guaranteed!",
            scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
            location: "Carol's Home Theater",
            inviteCode: "COMEDY01",
            status: MovieNightStatus.COMPLETED,
            hostId: carol.id,
        },
    });

    await prisma.invitation.createMany({
        data: [
            { movieNightId: completedNight.id, userId: carol.id, status: InvitationStatus.ACCEPTED, joinedAt: new Date() },
            { movieNightId: completedNight.id, userId: alice.id, status: InvitationStatus.ACCEPTED, joinedAt: new Date() },
            { movieNightId: completedNight.id, userId: bob.id, status: InvitationStatus.ACCEPTED, joinedAt: new Date() },
        ],
    });

    const winningNomination = await prisma.nomination.create({
        data: {
            movieNightId: completedNight.id,
            userId: carol.id,
            tmdbId: 12133,
            mediaType: MediaType.movie,
            title: "Airplane!",
            posterPath: "/7Q8j0HkPH9vxfPBnrlBvQaKz7oL.jpg",
            releaseYear: 1980,
            pitch: "Don't call me Shirley!",
        },
    });

    // Update with winning nomination
    await prisma.movieNight.update({
        where: { id: completedNight.id },
        data: { winningNominationId: winningNomination.id },
    });

    // Add ratings
    await prisma.rating.createMany({
        data: [
            { movieNightId: completedNight.id, userId: alice.id, score: 4.5, comment: "So funny! 😂" },
            { movieNightId: completedNight.id, userId: bob.id, score: 4.0, comment: "Classic humor" },
            { movieNightId: completedNight.id, userId: carol.id, score: 5.0, comment: "My favorite comedy!" },
        ],
    });

    // Create reputation event for Carol
    await prisma.reputationEvent.create({
        data: {
            userId: carol.id,
            movieNightId: completedNight.id,
            nominationId: winningNomination.id,
            averageRating: 4.25, // Excluding Carol's own rating
            voterCount: 2,
            points: 1.25, // (4.25 - 3) * 1.0
        },
    });

    console.log("✅ Created completed movie night with ratings");

    console.log("\n🎉 Seeding complete!");
    console.log("\nTest users created:");
    console.log("  - Alice (alice@example.com)");
    console.log("  - Bob (bob@example.com)");
    console.log("  - Carol (carol@example.com)");
    console.log("\nNote: These are demo users. In production, users are created via Google OAuth.");
}

main()
    .catch((e) => {
        console.error("Error seeding database:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

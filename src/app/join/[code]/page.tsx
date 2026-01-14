import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { joinMovieNight } from "@/lib/actions/movie-night";

interface JoinPageProps {
    params: Promise<{ code: string }>;
}

export default async function JoinPage({ params }: JoinPageProps) {
    const { code } = await params;
    const session = await auth();

    const movieNight = await prisma.movieNight.findUnique({
        where: { inviteCode: code },
        include: {
            host: {
                select: { name: true, image: true },
            },
            invitations: {
                where: { status: "ACCEPTED" },
                select: { userId: true },
            },
        },
    });

    if (!movieNight) {
        notFound();
    }

    // If user is logged in and already a member, redirect to the night
    if (session?.user) {
        const isAlreadyMember = movieNight.invitations.some(
            (inv) => inv.userId === session.user!.id
        ) || movieNight.hostId === session.user.id;

        if (isAlreadyMember) {
            redirect(`/nights/${movieNight.id}`);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#141414] relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center mb-10">
                    <div className="relative w-40 h-12">
                        <Image
                            src="/images/logo-white.png"
                            alt="FelekiDB"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </Link>

                {/* Join Card */}
                <div className="bg-black/75 rounded p-8 text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        You&apos;re Invited!
                    </h1>
                    <p className="text-gray-400 mb-6">
                        {movieNight.host.name} invited you to join:
                    </p>

                    <div className="bg-[#181818] border border-white/10 rounded p-4 mb-8">
                        <h2 className="text-xl font-semibold text-white mb-2">
                            {movieNight.title}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {new Date(movieNight.scheduledAt).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                            })}
                        </p>
                        {movieNight.location && (
                            <p className="text-gray-500 text-sm mt-1">
                                📍 {movieNight.location}
                            </p>
                        )}
                        <p className="text-gray-500 text-sm mt-2">
                            {movieNight.invitations.length} attending
                        </p>
                    </div>

                    {session?.user ? (
                        <form
                            action={async () => {
                                "use server";
                                const result = await joinMovieNight({ inviteCode: code });
                                if (result.success && result.data) {
                                    redirect(`/nights/${result.data.id}`);
                                } else {
                                    redirect(`/join/${code}?error=${encodeURIComponent(result.error || "Failed to join")}`);
                                }
                            }}
                        >
                            <button
                                type="submit"
                                className="w-full py-4 rounded bg-[#E50914] hover:bg-[#f40612] text-white font-semibold text-lg transition-colors"
                            >
                                Join Movie Night
                            </button>
                        </form>
                    ) : (
                        <Link
                            href={`/login?callbackUrl=/join/${code}`}
                            className="block w-full py-4 rounded bg-[#E50914] hover:bg-[#f40612] text-white font-semibold text-lg text-center transition-colors"
                        >
                            Sign In to Join
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

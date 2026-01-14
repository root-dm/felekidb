import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
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
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-10">
                    <span className="text-4xl">🎬</span>
                    <span className="text-3xl font-bold text-white">FelekiDB</span>
                </Link>

                {/* Join Card */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        You&apos;re Invited!
                    </h1>
                    <p className="text-gray-400 mb-6">
                        {movieNight.host.name} invited you to join:
                    </p>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
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
                                    // In a real app we might redirect to error or show toast, 
                                    // but for now redirecting to dashboard or keeping here is fine.
                                    // Since we can't easily show error in server action form without hooks,
                                    // we might just refresh.
                                    redirect(`/join/${code}?error=${encodeURIComponent(result.error || "Failed to join")}`);
                                }
                            }}
                        >
                            <button
                                type="submit"
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-lg hover:from-primary-400 hover:to-primary-500 transition-all"
                            >
                                Join Movie Night
                            </button>
                        </form>
                    ) : (
                        <Link
                            href={`/login?callbackUrl=/join/${code}`}
                            className="block w-full py-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-lg hover:from-primary-400 hover:to-primary-500 transition-all text-center"
                        >
                            Sign In to Join
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
    const session = await auth();

    if (session?.user) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-[#141414]">
            {/* Hero Section with gradient overlay */}
            <div className="relative min-h-screen">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-[#141414] z-10" />

                {/* Background image placeholder - dark cinema aesthetic */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />

                {/* Navigation */}
                <nav className="relative z-20 px-6 md:px-12 py-6">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <Link href="/" className="flex items-center">
                            <div className="relative w-36 h-10">
                                <Image
                                    src="/images/logo-white.png"
                                    alt="FelekiDB"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </Link>
                        <Link
                            href="/login"
                            className="bg-[#E50914] hover:bg-[#f40612] text-white font-semibold px-6 py-2 rounded transition-colors"
                        >
                            Sign In
                        </Link>
                    </div>
                </nav>

                {/* Hero Content */}
                <div className="relative z-20 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 max-w-4xl leading-tight">
                        Movie Nights<br />
                        <span className="text-[#E50914]">Democratized</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl">
                        Plan watch parties, vote on movies, and build your reputation as the ultimate film curator.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/login"
                            className="bg-[#E50914] hover:bg-[#f40612] text-white font-bold text-lg px-10 py-4 rounded transition-all hover:scale-105"
                        >
                            Get Started Free
                        </Link>
                        <Link
                            href="#features"
                            className="bg-white/10 hover:bg-white/20 text-white font-semibold text-lg px-10 py-4 rounded border border-white/20 transition-all"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce text-white/60">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </div>

            {/* Features Section */}
            <section id="features" className="py-20 md:py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            How It <span className="text-[#E50914]">Works</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            From planning to watching, FelekiDB makes every step seamless
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="bg-[#181818] rounded-lg p-8 text-center hover:bg-[#232323] transition-all duration-300 border border-white/5 hover:border-white/10 group"
                            >
                                <div className="w-16 h-16 mx-auto rounded-lg bg-[#E50914]/10 flex items-center justify-center text-4xl mb-6 group-hover:bg-[#E50914]/20 transition-colors">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Reputation Section */}
            <section className="py-20 md:py-32 px-6 bg-gradient-to-b from-transparent via-[#1a1a1a]/50 to-transparent">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div>
                            <span className="inline-block px-4 py-2 rounded bg-[#E50914]/20 text-[#E50914] text-sm font-medium mb-6">
                                ⭐ Reputation System
                            </span>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                                Build Your <span className="text-[#E50914]">Film Reputation</span>
                            </h2>
                            <p className="text-xl text-gray-300 mb-8">
                                Every movie you nominate that wins the vote gets rated by your friends.
                                Pick great movies consistently to climb the leaderboard and earn your
                                place as the group&apos;s Film Guru.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {tiers.map((tier) => (
                                    <div
                                        key={tier.name}
                                        className="bg-[#232323] px-4 py-2 rounded text-sm text-gray-300 border border-white/5"
                                    >
                                        {tier.icon} {tier.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-[#181818] rounded-lg p-8 border border-white/5">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#E50914] to-[#b20710] flex items-center justify-center text-3xl">
                                    🏆
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-white">87</div>
                                    <div className="text-gray-400">Reputation Score</div>
                                </div>
                            </div>
                            <div className="h-px bg-white/10 mb-6" />
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 rounded bg-white/5">
                                    <span className="text-gray-300">🎬 The Dark Knight</span>
                                    <span className="text-green-400 font-medium">+4.2 pts</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded bg-white/5">
                                    <span className="text-gray-300">🎬 Dune: Part Two</span>
                                    <span className="text-green-400 font-medium">+3.8 pts</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded bg-white/5">
                                    <span className="text-gray-300">🎬 The Room</span>
                                    <span className="text-red-400 font-medium">-2.1 pts</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-32 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Ready to Plan Your Next <span className="text-[#E50914]">Movie Night</span>?
                    </h2>
                    <p className="text-xl text-gray-400 mb-10">
                        Join thousands of users who are already making movie decisions the democratic way.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-3 bg-[#E50914] hover:bg-[#f40612] text-white font-bold text-xl px-12 py-5 rounded transition-all hover:scale-105"
                    >
                        Start for Free
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="relative w-28 h-8">
                        <Image
                            src="/images/logo-white.png"
                            alt="FelekiDB"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <span>Powered by</span>
                        <a
                            href="https://www.themoviedb.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#E50914] hover:text-[#f40612] transition-colors"
                        >
                            TMDB
                        </a>
                    </div>
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} FelekiDB. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

const features = [
    {
        icon: "📅",
        title: "Create Events",
        description: "Set up a movie night in seconds. Pick a date, invite friends, and start planning.",
    },
    {
        icon: "🎯",
        title: "Nominate & Vote",
        description: "Everyone nominates their picks, then vote together to choose the winner.",
    },
    {
        icon: "⭐",
        title: "Rate & Rank",
        description: "After watching, rate the movie. Great picks boost your reputation score.",
    },
];

const tiers = [
    { icon: "🥉", name: "Bronze" },
    { icon: "🥈", name: "Silver" },
    { icon: "🥇", name: "Gold" },
    { icon: "🏆", name: "Platinum" },
];

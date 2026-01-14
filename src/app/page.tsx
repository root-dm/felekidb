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
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3">
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
                    <Link href="/login" className="btn-secondary">
                        Sign In
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                {/* Animated background grid */}
                <div className="absolute inset-0 overflow-hidden opacity-20">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(168, 85, 247, 0.3) 1px, transparent 0)`,
                        backgroundSize: '50px 50px'
                    }} />
                </div>

                {/* Floating orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                    <div className="animate-fade-in-up">
                        <span className="badge-glow mb-6 inline-block">🍿 The Ultimate Movie Night Planner</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 animate-fade-in-up leading-tight">
                        Movie Nights,<br />
                        <span className="text-gradient text-glow">Democratized</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto animate-fade-in-up animate-delay-100">
                        Plan watch parties, vote on movies, and build your reputation as the ultimate film curator.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animate-delay-200">
                        <Link href="/login" className="btn-primary text-lg px-8 py-4 shadow-glow-strong">
                            🎉 Get Started Free
                        </Link>
                        <Link href="#features" className="btn-secondary text-lg px-8 py-4">
                            Learn More
                        </Link>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-primary-300/80">
                    ↓
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            How It <span className="text-gradient">Works</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            From planning to watching, FelekiDB makes every step seamless
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="glass-card p-8 text-center animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-white/10 flex items-center justify-center text-4xl mb-6 shadow-glow">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">
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
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/5 to-transparent" />
                <div className="max-w-7xl mx-auto px-6 relative">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="animate-fade-in-up">
                            <span className="badge-glow mb-6 inline-block">⭐ Reputation System</span>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                Build Your <span className="text-gradient">Film Reputation</span>
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
                                        className="glass px-4 py-2 rounded-full text-sm text-gray-300"
                                    >
                                        {tier.icon} {tier.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative animate-fade-in-up animate-delay-200">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/30 to-accent-500/30 rounded-3xl blur-2xl" />
                            <div className="glass-strong rounded-3xl p-8 relative">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl shadow-glow animate-pulse-glow">
                                        🏆
                                    </div>
                                    <div>
                                        <div className="text-4xl font-bold text-white text-glow">87</div>
                                        <div className="text-gray-400">Reputation Score</div>
                                    </div>
                                </div>
                                <div className="divider-glow mb-6" />
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                                        <span className="text-gray-300">🎬 The Dark Knight</span>
                                        <span className="text-green-400 font-medium">+4.2 pts</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                                        <span className="text-gray-300">🎬 Dune: Part Two</span>
                                        <span className="text-green-400 font-medium">+3.8 pts</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                                        <span className="text-gray-300">🎬 The Room</span>
                                        <span className="text-red-400 font-medium">-2.1 pts</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 relative">
                <div className="absolute inset-0 hero-glow" />
                <div className="max-w-3xl mx-auto px-6 text-center relative">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Plan Your Next <span className="text-gradient">Movie Night</span>?
                    </h2>
                    <p className="text-xl text-gray-300 mb-12">
                        Join thousands of users who are already making movie decisions the democratic way.
                    </p>
                    <Link
                        href="/login"
                        className="btn-primary text-xl px-12 py-5 shadow-glow-strong inline-flex items-center gap-2"
                    >
                        Start for Free <span className="text-2xl">→</span>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="relative w-32 h-10">
                            <Image
                                src="/images/logo-white.png"
                                alt="FelekiDB"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <span>Powered by</span>
                        <a
                            href="https://www.themoviedb.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-400 hover:text-primary-300 transition-colors"
                        >
                            TMDB
                        </a>
                    </div>
                    <p className="text-gray-400 text-sm">
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

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "FelekiDB - Social Movie Night Planner",
    description: "Plan movie nights with friends. Vote on movies, watch together, and build your reputation as the best movie picker.",
    keywords: ["movie night", "watch party", "movie voting", "social movies", "film club"],
    authors: [{ name: "FelekiDB Team" }],
    openGraph: {
        title: "FelekiDB - Social Movie Night Planner",
        description: "Plan movie nights with friends. Vote on movies, watch together, and build your reputation.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <SessionProvider>
                    {children}
                </SessionProvider>
            </body>
        </html>
    );
}

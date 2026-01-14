import { NextResponse } from "next/server";
import { getTrending, getPosterUrl, getReleaseYear } from "@/lib/tmdb";

export async function GET() {
    try {
        const results = await getTrending();

        // Transform results for frontend
        const transformedResults = results.map((result) => ({
            id: result.id,
            title: result.title || result.name || "Unknown",
            mediaType: result.media_type,
            posterUrl: getPosterUrl(result.poster_path, "w185"),
            releaseYear: getReleaseYear(result.release_date || result.first_air_date),
            overview: result.overview,
            rating: result.vote_average,
        }));

        return NextResponse.json({ results: transformedResults });
    } catch (error) {
        console.error("Trending fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch trending" },
            { status: 500 }
        );
    }
}

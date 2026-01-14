import { NextRequest, NextResponse } from "next/server";
import { searchMedia, getPosterUrl, getReleaseYear } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
        return NextResponse.json({ results: [] });
    }

    try {
        const results = await searchMedia(query);

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
        console.error("Movie search error:", error);
        return NextResponse.json(
            { error: "Failed to search movies" },
            { status: 500 }
        );
    }
}

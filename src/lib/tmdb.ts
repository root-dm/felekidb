import NodeCache from "node-cache";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

// Cache search results for 1 hour, movie details for 24 hours
const cache = new NodeCache({
    stdTTL: 3600,
    checkperiod: 600,
});

export interface TMDBSearchResult {
    id: number;
    title?: string; // Movies
    name?: string; // TV shows
    media_type: "movie" | "tv";
    poster_path: string | null;
    release_date?: string; // Movies
    first_air_date?: string; // TV shows
    overview: string;
    vote_average: number;
}

export interface TMDBMovie {
    id: number;
    title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    overview: string;
    release_date: string;
    vote_average: number;
    runtime: number;
    genres: { id: number; name: string }[];
}

export interface TMDBTVShow {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
    overview: string;
    first_air_date: string;
    vote_average: number;
    number_of_seasons: number;
    genres: { id: number; name: string }[];
}

/**
 * Fetch from TMDB API with authorization
 */
async function tmdbFetch<T>(endpoint: string): Promise<T> {
    const token = process.env.TMDB_ACCESS_TOKEN;

    if (!token) {
        throw new Error("TMDB_ACCESS_TOKEN is not configured");
    }

    const response = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        next: { revalidate: 3600 },
    });

    if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
    }

    return response.json();
}

/**
 * Search for movies and TV shows
 */
export async function searchMedia(query: string): Promise<TMDBSearchResult[]> {
    if (!query || query.length < 2) {
        return [];
    }

    const cacheKey = `search:${query.toLowerCase().trim()}`;
    const cached = cache.get<TMDBSearchResult[]>(cacheKey);

    if (cached) {
        return cached;
    }

    const data = await tmdbFetch<{ results: TMDBSearchResult[] }>(
        `/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`
    );

    const results = data.results.filter(
        (r) => r.media_type === "movie" || r.media_type === "tv"
    );

    cache.set(cacheKey, results);
    return results;
}

/**
 * Get movie details by ID
 */
export async function getMovie(id: number): Promise<TMDBMovie> {
    const cacheKey = `movie:${id}`;
    const cached = cache.get<TMDBMovie>(cacheKey);

    if (cached) {
        return cached;
    }

    const movie = await tmdbFetch<TMDBMovie>(`/movie/${id}?language=en-US`);
    cache.set(cacheKey, movie, 86400); // Cache for 24 hours

    return movie;
}

/**
 * Get TV show details by ID
 */
export async function getTVShow(id: number): Promise<TMDBTVShow> {
    const cacheKey = `tv:${id}`;
    const cached = cache.get<TMDBTVShow>(cacheKey);

    if (cached) {
        return cached;
    }

    const show = await tmdbFetch<TMDBTVShow>(`/tv/${id}?language=en-US`);
    cache.set(cacheKey, show, 86400); // Cache for 24 hours

    return show;
}

/**
 * Get trending movies and TV shows
 */
export async function getTrending(): Promise<TMDBSearchResult[]> {
    const cacheKey = "trending:week";
    const cached = cache.get<TMDBSearchResult[]>(cacheKey);

    if (cached) {
        return cached;
    }

    const data = await tmdbFetch<{ results: TMDBSearchResult[] }>(
        "/trending/all/week?language=en-US"
    );

    const results = data.results.filter(
        (r) => r.media_type === "movie" || r.media_type === "tv"
    );

    cache.set(cacheKey, results, 21600); // Cache for 6 hours
    return results;
}

/**
 * Get poster URL for a given path
 */
export function getPosterUrl(
    posterPath: string | null,
    size: "w92" | "w185" | "w342" | "w500" | "original" = "w342"
): string {
    if (!posterPath) {
        return "/images/no-poster.svg";
    }
    return `${TMDB_IMAGE_BASE}/${size}${posterPath}`;
}

/**
 * Get backdrop URL for a given path
 */
export function getBackdropUrl(
    backdropPath: string | null,
    size: "w780" | "w1280" | "original" = "w1280"
): string {
    if (!backdropPath) {
        return "";
    }
    return `${TMDB_IMAGE_BASE}/${size}${backdropPath}`;
}

/**
 * Extract release year from date string
 */
export function getReleaseYear(dateString: string | undefined): number | null {
    if (!dateString) return null;
    const year = parseInt(dateString.split("-")[0], 10);
    return isNaN(year) ? null : year;
}

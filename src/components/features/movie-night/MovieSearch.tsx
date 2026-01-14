"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { nominateMovie } from "@/lib/actions/voting";

interface SearchResult {
    id: number;
    title: string;
    mediaType: "movie" | "tv";
    posterUrl: string;
    releaseYear: number | null;
    overview: string;
}

interface MovieSearchProps {
    movieNightId: string;
}

export function MovieSearch({ movieNightId }: MovieSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isNominating, setIsNominating] = useState<number | null>(null);
    const [pitch, setPitch] = useState("");
    const [selectedMovie, setSelectedMovie] = useState<SearchResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const search = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `/api/movies?q=${encodeURIComponent(searchQuery)}`
            );
            const data = await response.json();
            setResults(data.results || []);
        } catch {
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Debounced search
    const handleQueryChange = (value: string) => {
        setQuery(value);
        const timeout = setTimeout(() => search(value), 300);
        return () => clearTimeout(timeout);
    };

    async function handleNominate() {
        if (!selectedMovie) return;

        setIsNominating(selectedMovie.id);
        setError(null);

        try {
            await nominateMovie({
                movieNightId,
                tmdbId: selectedMovie.id,
                mediaType: selectedMovie.mediaType,
                title: selectedMovie.title,
                posterPath: selectedMovie.posterUrl.includes("no-poster")
                    ? null
                    : selectedMovie.posterUrl.replace("https://image.tmdb.org/t/p/w185", ""),
                releaseYear: selectedMovie.releaseYear,
                pitch: pitch || undefined,
            });
            setIsOpen(false);
            setQuery("");
            setResults([]);
            setSelectedMovie(null);
            setPitch("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to nominate");
        } finally {
            setIsNominating(null);
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors text-sm font-medium"
            >
                + Nominate Movie
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-white">
                                {selectedMovie ? "Confirm Nomination" : "Search Movies"}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setSelectedMovie(null);
                                    setPitch("");
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        {selectedMovie ? (
                            /* Confirmation view */
                            <div className="p-4">
                                <div className="flex gap-4 mb-4">
                                    <Image
                                        src={selectedMovie.posterUrl}
                                        alt={selectedMovie.title}
                                        width={80}
                                        height={120}
                                        className="rounded-lg"
                                    />
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">
                                            {selectedMovie.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm">
                                            {selectedMovie.mediaType.toUpperCase()}
                                            {selectedMovie.releaseYear && ` • ${selectedMovie.releaseYear}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm text-gray-400 mb-2">
                                        Why this movie? (optional)
                                    </label>
                                    <textarea
                                        value={pitch}
                                        onChange={(e) => setPitch(e.target.value)}
                                        maxLength={250}
                                        rows={2}
                                        placeholder="Make your case..."
                                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm resize-none"
                                    />
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setSelectedMovie(null);
                                            setPitch("");
                                        }}
                                        className="flex-1 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors text-sm font-medium"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleNominate}
                                        disabled={isNominating !== null}
                                        className="flex-1 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-400 transition-colors text-sm font-medium disabled:opacity-50"
                                    >
                                        {isNominating ? "Nominating..." : "Nominate"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Search view */
                            <>
                                <div className="p-4 border-b border-white/10">
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => handleQueryChange(e.target.value)}
                                        placeholder="Search movies and TV shows..."
                                        autoFocus
                                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary-500 outline-none"
                                    />
                                </div>

                                <div className="flex-1 overflow-y-auto p-2">
                                    {isSearching ? (
                                        <div className="p-8 text-center text-gray-400">
                                            Searching...
                                        </div>
                                    ) : results.length === 0 ? (
                                        <div className="p-8 text-center text-gray-400">
                                            {query.length >= 2
                                                ? "No results found"
                                                : "Type to search movies and shows"}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {results.map((result) => (
                                                <button
                                                    key={result.id}
                                                    onClick={() => setSelectedMovie(result)}
                                                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                                                >
                                                    <Image
                                                        src={result.posterUrl}
                                                        alt={result.title}
                                                        width={40}
                                                        height={60}
                                                        className="rounded"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-white font-medium truncate">
                                                            {result.title}
                                                        </h3>
                                                        <p className="text-gray-500 text-sm">
                                                            {result.mediaType.toUpperCase()}
                                                            {result.releaseYear && ` • ${result.releaseYear}`}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

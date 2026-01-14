"use client";

import Image from "next/image";
import { WatchlistButton } from "@/components/ui/WatchlistButton";

interface WatchlistItem {
    id: string;
    tmdbId: number;
    mediaType: string;
    title: string;
    posterPath: string | null;
    releaseYear: number | null;
}

interface WatchlistGridProps {
    items: WatchlistItem[];
    isOwnProfile: boolean;
}

export function WatchlistGrid({ items, isOwnProfile }: WatchlistGridProps) {
    if (items.length === 0) {
        return (
            <div className="glass-card p-8 text-center w-full">
                <div className="text-4xl mb-3 animate-float">📺</div>
                <p className="text-gray-400 text-sm">
                    {isOwnProfile
                        ? "Your watchlist is empty. Go find some movies to add!"
                        : "This user hasn't added any movies to their watchlist yet."}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item) => (
                <div key={item.id} className="relative group aspect-[2/3] rounded-xl overflow-hidden glass hover:ring-2 hover:ring-[#E50914] transition-all">
                    {item.posterPath ? (
                        <Image
                            src={`https://image.tmdb.org/t/p/w342${item.posterPath}`}
                            alt={item.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#232323] text-gray-500">
                            No Poster
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <h3 className="text-white text-sm font-medium line-clamp-2">{item.title}</h3>
                        <p className="text-gray-400 text-xs">
                            {item.releaseYear} • {item.mediaType === "movie" ? "Movie" : "TV"}
                        </p>
                    </div>

                    {isOwnProfile && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <WatchlistButton
                                tmdbId={item.tmdbId}
                                mediaType={item.mediaType as "movie" | "tv"}
                                title={item.title}
                                posterPath={item.posterPath}
                                releaseYear={item.releaseYear}
                                initialIsInWatchlist={true}
                                className="bg-black/60 rounded-full p-2 hover:bg-black/80"
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

"use client";

import { useState } from "react";
import { updateMovieNightDetails } from "@/lib/actions/movie-night";

interface EditableLocationProps {
    nightId: string;
    initialLocation: string | null;
    isHost: boolean;
}

export function EditableLocation({ nightId, initialLocation, isHost }: EditableLocationProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [location, setLocation] = useState(initialLocation || "");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSave() {
        if (!location.trim()) return;
        setIsLoading(true);
        try {
            await updateMovieNightDetails({ nightId, location });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update location:", error);
        } finally {
            setIsLoading(false);
        }
    }

    if (!isHost) {
        if (!initialLocation) return (
            <div className="glass px-4 py-3 rounded-xl flex items-center gap-3 opacity-50">
                <span className="text-2xl">📍</span>
                <div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Location</div>
                    <div className="text-gray-400 font-medium italic">No location set</div>
                </div>
            </div>
        );
        return (
            <div className="glass px-4 py-3 rounded-xl flex items-center gap-3">
                <span className="text-2xl">📍</span>
                <div>
                    <div className="text-xs text-[#E50914] uppercase font-bold tracking-wider">Location</div>
                    <div className="text-white font-medium">{initialLocation}</div>
                </div>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="glass px-4 py-3 rounded-xl flex items-center gap-3 bg-[#E50914]/10 border-[#E50914]/30">
                <span className="text-2xl">📍</span>
                <div className="flex-1">
                    <div className="text-xs text-[#E50914] uppercase font-bold tracking-wider mb-1">Set Location</div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. Living Room, Discord"
                            className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#E50914]"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSave();
                                if (e.key === "Escape") setIsEditing(false);
                            }}
                        />
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="bg-[#E50914] text-white px-3 py-1 rounded text-xs font-bold hover:bg-[#f40612] disabled:opacity-50"
                        >
                            ✓
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsEditing(true)}
            className="glass px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-colors text-left w-full group"
        >
            <span className="text-2xl">📍</span>
            <div>
                <div className="text-xs text-[#E50914] uppercase font-bold tracking-wider flex items-center gap-2">
                    Location
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-white/10 text-white px-1 rounded">EDIT</span>
                </div>
                <div className={`${location ? "text-white" : "text-gray-500 italic"} font-medium`}>
                    {location || "Set location..."}
                </div>
            </div>
        </button>
    );
}

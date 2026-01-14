"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LiveUpdatesProps {
    intervalMs?: number;
}

export function LiveUpdates({ intervalMs = 4000 }: LiveUpdatesProps) {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(true);

    // Track visibility to avoid polling when tab is hidden
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(document.visibilityState === "visible");
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const interval = setInterval(() => {
            // Soft refresh: fetches data from server but preserves client-state (like inputs)
            router.refresh();
        }, intervalMs);

        return () => clearInterval(interval);
    }, [router, intervalMs, isVisible]);

    return null;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { closeVoting } from "@/lib/actions/voting";

interface AutoStartManagerProps {
    nightId: string;
    scheduledAt: Date;
    status: string;
    isHost: boolean;
}

export function AutoStartManager({ nightId, scheduledAt, status, isHost }: AutoStartManagerProps) {
    const router = useRouter();

    useEffect(() => {
        if (status !== "PLANNING" && status !== "VOTING") return;

        // Only host triggers the server action to avoid race conditions/multiple calls
        // although server action should handle it, it's cleaner if one person drives it.
        // If host updates it, revalidation will update everyone else.
        // Fallback: if host isn't there, any user could trigger it? 
        // Safer to let anyone trigger it if it's purely time based?
        // But closeVoting checks for host... 
        // User Requirement: "tha ksekinaei mono tou" (starts on its own).
        // If closeVoting requires HOST, then Host MUST be present.
        // If we want it to start regardless, we need to bypass host check or use a cron (not available here).
        // Workaround: Modify closeVoting to allow system/time-based trigger or anyone to trigger if time passed?
        // For now, let's assume Host is present or we modify closeVoting.
        // Let's rely on Host primarily, or check if we can relax closeVoting for time-based.

        // Actually, if we want "automated", usually a cron job is best.
        // Since we are client-side, we must rely on someone visiting the page.
        // Attempt: Trigger if Date > scheduledAt

        const checkTime = () => {
            const now = new Date();
            const scheduled = new Date(scheduledAt);

            if (now >= scheduled) {
                // Time to start!
                if (isHost) {
                    closeVoting(nightId)
                        .then(() => router.refresh())
                        .catch(err => console.error("Auto-start failed", err));
                }
            }
        };

        // Check immediately
        checkTime();

        // Check every minute
        const interval = setInterval(checkTime, 60000);

        return () => clearInterval(interval);
    }, [nightId, scheduledAt, status, isHost, router]);

    return null;
}

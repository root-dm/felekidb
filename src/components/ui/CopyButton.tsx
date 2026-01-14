"use client";

import { useState } from "react";

interface CopyButtonProps {
    text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <button
            onClick={handleCopy}
            className="px-4 py-2 rounded bg-[#E50914]/20 text-[#E50914] hover:bg-[#E50914]/30 transition-colors text-sm"
        >
            {copied ? "Copied!" : "Copy"}
        </button>
    );
}

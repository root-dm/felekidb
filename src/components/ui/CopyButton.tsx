"use client";

import { useState } from "react";

interface CopyButtonProps {
    text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            // Check if Clipboard API is available and we are in a secure context
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback for non-secure contexts (like HTTP on mobile LAN)
                const textArea = document.createElement("textarea");
                textArea.value = text;

                // Ensure outside viewport
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";

                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.error('Fallback: Oops, unable to copy', err);
                }

                document.body.removeChild(textArea);
            }

            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
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

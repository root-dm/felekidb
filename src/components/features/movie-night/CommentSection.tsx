"use client";

import { useState, useOptimistic, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { addComment } from "@/lib/actions/comments";

import { ReactionPicker } from "./ReactionPicker";

interface Comment {
    id: string;
    content: string;
    createdAt: Date;
    user: {
        id: string;
        name: string | null;
        image: string | null;
    };
    reactions: {
        emoji: string;
        userId: string;
    }[];
}

interface CommentSectionProps {
    movieNightId: string;
    initialComments: Comment[];
    currentUserId: string;
}

export function CommentSection({ movieNightId, initialComments, currentUserId }: CommentSectionProps) {
    const [newComment, setNewComment] = useState("");
    const [isPending, startTransition] = useTransition();
    const [optimisticComments, addOptimisticComment] = useOptimistic(
        initialComments,
        (state, newComment: Comment) => [newComment, ...state]
    );

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!newComment.trim()) return;

        const tempComment: Comment = {
            id: `temp-${Date.now()}`,
            content: newComment,
            createdAt: new Date(),

            user: { id: "", name: "You", image: null },
            reactions: [], // Init empty reactions
        };

        setNewComment("");

        startTransition(async () => {
            addOptimisticComment(tempComment);
            try {
                await addComment({
                    movieNightId,
                    content: newComment,
                });
            } catch (error) {
                console.error("Failed to add comment:", error);
            }
        });
    }

    function formatTime(date: Date) {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return "just now";
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return new Date(date).toLocaleDateString();
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                💬 Discussion
                <span className="text-sm font-normal text-gray-500">
                    ({optimisticComments.length})
                </span>
            </h3>

            {/* Add Comment Form */}
            <form onSubmit={handleSubmit} className="mb-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        maxLength={500}
                        className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-white/30 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={isPending || !newComment.trim()}
                        className="px-4 py-2 rounded-lg bg-[#E50914] text-white text-sm font-medium hover:bg-[#f40612] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isPending ? "..." : "Post"}
                    </button>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
                {optimisticComments.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                        No comments yet. Start the conversation!
                    </p>
                ) : (
                    optimisticComments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <Link href={`/profile/${comment.user.id}`} className="flex-shrink-0">
                                {comment.user.image ? (
                                    <Image
                                        src={comment.user.image}
                                        alt={comment.user.name || "User"}
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                                        👤
                                    </div>
                                )}
                            </Link>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Link
                                        href={`/profile/${comment.user.id}`}
                                        className="text-white text-sm font-medium hover:text-[#E50914] transition-colors"
                                    >
                                        {comment.user.name}
                                    </Link>
                                    <span className="text-gray-600 text-xs">
                                        {formatTime(comment.createdAt)}
                                    </span>
                                </div>
                                <p className="text-gray-300 text-sm">{comment.content}</p>
                                <ReactionPicker
                                    commentId={comment.id}
                                    reactions={comment.reactions}
                                    currentUserId={currentUserId}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

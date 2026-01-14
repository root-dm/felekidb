"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, deleteAccount } from "@/lib/actions/profile";
import { handleSignOut } from "@/lib/actions/auth";

interface User {
    id: string;
    name?: string | null;
    image?: string | null;
    email?: string | null;
}

export function EditProfileForm({ user }: { user: User }) {
    const router = useRouter();
    const [name, setName] = useState(user.name || "");
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        setMessage(null);

        startTransition(async () => {
            try {
                await updateProfile({ name });
                setMessage({ type: "success", text: "Profile updated successfully" });
                router.refresh();
            } catch (error) {
                setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to update profile" });
            }
        });
    }

    function handleDelete() {
        startTransition(async () => {
            try {
                await deleteAccount();
                await handleSignOut();
            } catch {
                setMessage({ type: "error", text: "Failed to delete account" });
            }
        });
    }

    return (
        <div className="space-y-12">
            {/* General Settings */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">General Settings</h2>

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            minLength={2}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:border-[#E50914] outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={user.email || ""}
                            disabled
                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/5 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Email cannot be changed as it is linked to your authentication provider.
                        </p>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm ${message.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-2 bg-[#E50914] text-white font-medium rounded-full hover:bg-[#f40612] disabled:opacity-50 transition-colors"
                        >
                            {isPending ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-red-500 mb-2">Danger Zone</h2>
                <p className="text-gray-400 text-sm mb-6">
                    Once you delete your account, there is no going back. Please be certain.
                </p>

                {showDeleteConfirm ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-2">Are you absolutely sure?</h3>
                        <p className="text-gray-300 text-sm mb-6">
                            This action cannot be undone. This will permanently delete your account,
                            including all your movie nights, nominations, votes, and reputation history.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isPending}
                                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isPending}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {isPending ? "Deleting..." : "Yes, delete my account"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-6 py-2 border border-red-500/30 text-red-400 font-medium rounded-full hover:bg-red-500/10 transition-colors"
                    >
                        Delete Account
                    </button>
                )}
            </div>
        </div>
    );
}

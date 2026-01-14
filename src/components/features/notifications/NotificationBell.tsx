"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { getNotifications, markAsRead, markAllAsRead } from "@/lib/actions/notifications";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    read: boolean;
    createdAt: Date;
}

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isPending, startTransition] = useTransition();

    // Fetch notifications on mount
    useEffect(() => {
        getNotifications().then((data) => setNotifications(data));
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    function handleMarkAllRead() {
        startTransition(async () => {
            await markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        });
    }

    function handleNotificationClick(notification: Notification) {
        if (!notification.read) {
            startTransition(async () => {
                await markAsRead(notification.id);
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
                );
            });
        }
        setIsOpen(false);
    }

    function formatTime(date: Date) {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return "now";
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return new Date(date).toLocaleDateString();
    }

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
            >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E50914] text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                        {/* Header */}
                        <div className="p-3 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-white font-semibold">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    disabled={isPending}
                                    className="text-xs text-[#E50914] hover:text-[#f40612] transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-gray-500 text-sm">
                                    No notifications yet
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div key={notification.id}>
                                        {notification.link ? (
                                            <Link
                                                href={notification.link}
                                                onClick={() => handleNotificationClick(notification)}
                                                className={`block p-3 hover:bg-white/5 transition-colors ${!notification.read ? "bg-white/5" : ""
                                                    }`}
                                            >
                                                <NotificationContent notification={notification} formatTime={formatTime} />
                                            </Link>
                                        ) : (
                                            <div
                                                className={`p-3 ${!notification.read ? "bg-white/5" : ""}`}
                                            >
                                                <NotificationContent notification={notification} formatTime={formatTime} />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function NotificationContent({
    notification,
    formatTime,
}: {
    notification: Notification;
    formatTime: (date: Date) => string;
}) {
    return (
        <div className="flex gap-3">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${notification.read ? "text-gray-400" : "text-white"}`}>
                        {notification.title}
                    </p>
                    {!notification.read && (
                        <span className="w-2 h-2 bg-[#E50914] rounded-full flex-shrink-0" />
                    )}
                </div>
                <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">
                    {notification.message}
                </p>
                <p className="text-gray-600 text-xs mt-1">
                    {formatTime(notification.createdAt)}
                </p>
            </div>
        </div>
    );
}

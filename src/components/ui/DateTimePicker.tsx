"use client";

import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface CustomDateTimePickerProps {
    name: string;
    required?: boolean;
    minDate?: Date;
    className?: string;
    label: string;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export function DateTimePicker({ name, required, minDate, className, label }: CustomDateTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [viewDate, setViewDate] = useState(new Date()); // For calendar navigation
    const [selectedTime, setSelectedTime] = useState({ hours: 20, minutes: 0 }); // Default 8:00 PM

    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize from default or current
    useEffect(() => {
        if (!selectedDate) {
            const now = new Date();
            if (minDate && now < minDate) {
                setViewDate(new Date(minDate));
            }
        }
    }, [minDate, selectedDate]);

    // Handle outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Calendar logic
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const handleDateSelect = (day: number) => {
        const newDate = new Date(currentYear, currentMonth, day);
        newDate.setHours(selectedTime.hours);
        newDate.setMinutes(selectedTime.minutes);
        setSelectedDate(newDate);
        // Don't close immediately, let them verify/change time if needed
    };

    const handleTimeChange = (type: "hours" | "minutes", value: string) => {
        const num = parseInt(value, 10);
        const newTime = { ...selectedTime, [type]: num };
        setSelectedTime(newTime);

        if (selectedDate) {
            const newDate = new Date(selectedDate);
            newDate.setHours(type === "hours" ? num : selectedTime.hours);
            newDate.setMinutes(type === "minutes" ? num : selectedTime.minutes);
            setSelectedDate(newDate);
        }
    };

    const formatDisplayDate = () => {
        if (!selectedDate) return "Select date & time";
        return selectedDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const isDateDisabled = (day: number) => {
        if (!minDate) return false;
        const dateToCheck = new Date(currentYear, currentMonth, day, 23, 59, 59);
        return dateToCheck < minDate;
    };

    const isSelected = (day: number) => {
        return selectedDate &&
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentMonth &&
            selectedDate.getFullYear() === currentYear;
    };

    // Prepare hidden input value
    const hiddenValue = selectedDate ? selectedDate.toISOString() : "";

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            <input type="hidden" name={name} value={hiddenValue} required={required} />

            <label className="block text-sm font-medium text-gray-300 mb-2">
                {label}
                {required && <span className="text-primary-400 ml-1">*</span>}
            </label>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full text-left px-4 py-3 rounded-xl bg-white/5 border text-white transition-all duration-300 flex items-center justify-between",
                    isOpen ? "border-primary-500/50 bg-white/10" : "border-white/10 hover:bg-white/10",
                    !selectedDate && "text-gray-400"
                )}
            >
                <span>{formatDisplayDate()}</span>
                <span className="text-xl">📅</span>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 w-full md:w-[340px] bg-slate-900 border border-white/20 rounded-xl p-4 shadow-2xl animate-fade-in-up">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))}
                            className="p-2 hover:bg-white/10 rounded-lg text-white hover:text-primary-400 transition-colors"
                        >
                            ←
                        </button>
                        <span className="font-bold text-white text-lg">
                            {MONTHS[currentMonth]} {currentYear}
                        </span>
                        <button
                            type="button"
                            onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))}
                            className="p-2 hover:bg-white/10 rounded-lg text-white hover:text-primary-400 transition-colors"
                        >
                            →
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center text-sm mb-4">
                        {DAYS.map(day => (
                            <div key={day} className="text-gray-400 py-2 font-bold text-xs uppercase tracking-wider">{day}</div>
                        ))}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const disabled = isDateDisabled(day);
                            const selected = isSelected(day);

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => handleDateSelect(day)}
                                    className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all mx-auto font-medium",
                                        selected
                                            ? "bg-primary-600 text-white shadow-lg shadow-primary-500/50"
                                            : disabled
                                                ? "text-gray-700 cursor-not-allowed"
                                                : "text-gray-200 hover:bg-white/20 hover:text-white"
                                    )}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Time Selection */}
                    <div className="border-t border-white/10 pt-4 mt-4">
                        <label className="block text-xs uppercase text-gray-500 font-bold mb-2 tracking-wider">Time</label>
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedTime.hours}
                                onChange={(e) => handleTimeChange("hours", e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white outline-none focus:border-primary-500 w-full cursor-pointer appearance-none text-center hover:bg-white/10 transition-colors"
                            >
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <option key={i} value={i} className="bg-slate-900 text-white">
                                        {i.toString().padStart(2, "0")}
                                    </option>
                                ))}
                            </select>
                            <span className="text-gray-500 text-lg">:</span>
                            <select
                                value={selectedTime.minutes}
                                onChange={(e) => handleTimeChange("minutes", e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white outline-none focus:border-primary-500 w-full cursor-pointer appearance-none text-center hover:bg-white/10 transition-colors"
                            >
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <option key={i * 5} value={i * 5} className="bg-slate-900 text-white">
                                        {(i * 5).toString().padStart(2, "0")}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Quick Select */}
                    <div className="border-t border-white/10 pt-3 mt-3 flex justify-between gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                const today = new Date();
                                isDateDisabled(today.getDate()) || setSelectedDate(today);
                                setIsOpen(false);
                            }}
                            className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

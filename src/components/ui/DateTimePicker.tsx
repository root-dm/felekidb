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

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export function DateTimePicker({ name, required, minDate, className, label }: CustomDateTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState({ hours: 20, minutes: 0 });

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!selectedDate) {
            const now = new Date();
            if (minDate && now < minDate) {
                setViewDate(new Date(minDate));
            }
        }
    }, [minDate, selectedDate]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    // Check if we can navigate to previous month
    const canGoBack = () => {
        if (!minDate) return true;
        // Can't go back if viewing the same month as minDate or earlier
        const minYear = minDate.getFullYear();
        const minMonth = minDate.getMonth();
        if (currentYear < minYear) return false;
        if (currentYear === minYear && currentMonth <= minMonth) return false;
        return true;
    };

    const handleDateSelect = (day: number) => {
        const newDate = new Date(currentYear, currentMonth, day);
        let hours = selectedTime.hours;
        let minutes = selectedTime.minutes;

        // If selecting today, ensure time is not in the past
        if (minDate) {
            newDate.setHours(hours);
            newDate.setMinutes(minutes);
            if (newDate < minDate) {
                // Adjust to next hour from now
                hours = minDate.getHours() + 1;
                minutes = 0;
                if (hours >= 24) hours = 23;
            }
        }

        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        setSelectedTime({ hours, minutes });
        setSelectedDate(newDate);
    };

    const incrementTime = (type: "hours" | "minutes", delta: number) => {
        let newHours = selectedTime.hours;
        let newMinutes = selectedTime.minutes;

        if (type === "hours") {
            newHours = (selectedTime.hours + delta + 24) % 24;
        } else {
            newMinutes = selectedTime.minutes + delta;
            if (newMinutes >= 60) {
                newMinutes = 0;
                newHours = (newHours + 1) % 24;
            } else if (newMinutes < 0) {
                newMinutes = 55;
                newHours = (newHours - 1 + 24) % 24;
            }
        }

        // Check if the new time would be in the past
        if (minDate && selectedDate) {
            const testDate = new Date(selectedDate);
            testDate.setHours(newHours);
            testDate.setMinutes(newMinutes);
            if (testDate < minDate) {
                return; // Don't allow setting time in the past
            }
        }

        const newTime = { hours: newHours, minutes: newMinutes };
        setSelectedTime(newTime);

        if (selectedDate) {
            const newDate = new Date(selectedDate);
            newDate.setHours(newHours);
            newDate.setMinutes(newMinutes);
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

    const hiddenValue = selectedDate ? selectedDate.toISOString() : "";

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            <input type="hidden" name={name} value={hiddenValue} required={required} />

            <label className="block text-sm font-medium text-gray-300 mb-2">
                {label}
                {required && <span className="text-[#E50914] ml-1">*</span>}
            </label>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full text-left px-4 py-3 rounded bg-[#333] border text-white transition-all duration-200 flex items-center justify-between",
                    isOpen ? "border-white/30 bg-[#444]" : "border-white/10 hover:bg-[#3a3a3a]",
                    !selectedDate && "text-gray-400"
                )}
            >
                <span>{formatDisplayDate()}</span>
                <span className="text-xl">📅</span>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#141414] px-4 py-3 border-b border-white/10">
                        <p className="text-white font-medium">Select Date and Time</p>
                    </div>

                    {/* Main Content - Side by Side Layout */}
                    <div className="flex">
                        {/* Left Side - Time Picker */}
                        <div className="p-6 border-r border-white/10 flex flex-col items-center justify-center min-w-[140px]">
                            {/* Display current selection */}
                            <div className="text-gray-400 text-sm mb-4">
                                {selectedDate
                                    ? selectedDate.toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' })
                                    : "----/--/--"
                                }
                                {" "}
                                {selectedTime.hours.toString().padStart(2, "0")}:{selectedTime.minutes.toString().padStart(2, "0")}
                            </div>

                            {/* Time Spinner */}
                            <div className="flex items-center gap-1">
                                {/* Hours */}
                                <div className="flex flex-col items-center">
                                    <button
                                        type="button"
                                        onClick={() => incrementTime("hours", 1)}
                                        className="text-gray-400 hover:text-white p-1 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                    </button>
                                    <div className="text-4xl font-light text-white my-2 tabular-nums">
                                        {selectedTime.hours.toString().padStart(2, "0")}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => incrementTime("hours", -1)}
                                        className="text-gray-400 hover:text-white p-1 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>

                                <span className="text-4xl font-light text-white mx-1">:</span>

                                {/* Minutes */}
                                <div className="flex flex-col items-center">
                                    <button
                                        type="button"
                                        onClick={() => incrementTime("minutes", 5)}
                                        className="text-gray-400 hover:text-white p-1 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                    </button>
                                    <div className="text-4xl font-light text-white my-2 tabular-nums">
                                        {selectedTime.minutes.toString().padStart(2, "0")}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => incrementTime("minutes", -5)}
                                        className="text-gray-400 hover:text-white p-1 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Select Button */}
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="mt-6 w-full bg-[#E50914] hover:bg-[#f40612] text-white font-semibold py-2 px-6 rounded transition-colors"
                            >
                                Select
                            </button>
                        </div>

                        {/* Right Side - Calendar */}
                        <div className="p-4">
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    type="button"
                                    onClick={() => canGoBack() && setViewDate(new Date(currentYear, currentMonth - 1, 1))}
                                    disabled={!canGoBack()}
                                    className={cn(
                                        "p-1 transition-colors",
                                        canGoBack()
                                            ? "text-gray-400 hover:text-white cursor-pointer"
                                            : "text-gray-700 cursor-not-allowed"
                                    )}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <span className="font-medium text-white">
                                    {MONTHS[currentMonth]} {currentYear}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))}
                                    className="p-1 text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-0 text-center text-sm">
                                {DAYS.map(day => (
                                    <div key={day} className="text-gray-500 py-2 text-xs font-medium w-9">{day}</div>
                                ))}
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`empty-${i}`} className="w-9 h-9" />
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
                                                "w-9 h-9 rounded-full flex items-center justify-center transition-all text-sm",
                                                selected
                                                    ? "bg-[#E50914] text-white"
                                                    : disabled
                                                        ? "text-gray-700 cursor-not-allowed"
                                                        : "text-gray-300 hover:bg-white/10"
                                            )}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

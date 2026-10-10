import React, { useMemo } from "react";
import { View, ScrollView } from "react-native";
import { useColors } from "./theme";
import { Text } from "./Text";
import { Progress, streakOf } from "./progress";

export type HeatmapCell = {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
};

export type HeatmapWeek = HeatmapCell[];

/**
 * Generates heatmap data for the past 52 weeks (1 year) of study activity.
 * Each cell contains a date and a "level" (0-4) based on question count that day.
 */
export function generateHeatmapData(days: Record<string, number>): HeatmapWeek[] {
    const today = new Date();
    const weeks: HeatmapWeek[] = [];

    // Find max count to normalize levels
    const counts = Object.values(days);
    const maxCount = counts.length > 0 ? Math.max(...counts) : 0;
    const thresholds = [0, Math.ceil(maxCount * 0.25), Math.ceil(maxCount * 0.5), Math.ceil(maxCount * 0.75), maxCount];

    // Generate 52 weeks (364 days)
    for (let weekIdx = 0; weekIdx < 52; weekIdx++) {
        const week: HeatmapCell[] = [];

        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
            const date = new Date(today);
            date.setDate(date.getDate() - (weekIdx * 7 + dayOfWeek));

            const dateStr = formatDate(date);
            const count = days[dateStr] || 0;

            // Determine level (0-4) based on count thresholds
            let level: 0 | 1 | 2 | 3 | 4 = 0;
            if (count > 0) level = 1;
            if (count > thresholds[2]) level = 2;
            if (count > thresholds[3]) level = 3;
            if (count >= thresholds[4] && maxCount > 0) level = 4;

            week.push({ date: dateStr, count, level });
        }
        weeks.push(week);
    }

    return weeks;
}

/**
 * Get the intensity color for a given level (0-4).
 */
export function getLevelColor(level: 0 | 1 | 2 | 3 | 4, colors: any): string {
    switch (level) {
        case 0: return colors.muted;    // No activity - muted
        case 1: return colors.muted;    // Light activity
        case 2: return colors.accent;   // Medium activity
        case 3: return colors.accent;   // High activity
        case 4: return colors.accent;   // Max activity - bright accent
    }
}

/**
 * Format date to "YYYY-MM-DD" format
 */
export function formatDate(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Get day of week name
 */
function getDayName(index: number): string {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[index];
}

interface StudyStreakHeatmapProps {
    progress: Progress;
    compact?: boolean;
}

export default function StudyStreakHeatmap({ progress, compact = false }: StudyStreakHeatmapProps) {
    const COLORS = useColors();

    const heatmapWeeks = useMemo(() => generateHeatmapData(progress.days), [progress.days]);
    const currentStreak = useMemo(() => streakOf(progress.days), [progress.days]);

    const totalDaysStudied = useMemo(() => Object.keys(progress.days).length, [progress.days]);
    const totalQuestions = useMemo(() => Object.values(progress.days).reduce((a, b) => a + b, 0), [progress.days]);

    // Get hover tooltip info
    const getTooltipText = (cell: HeatmapCell): string => {
        if (cell.count === 0) return "No activity";
        return `${cell.count} question${cell.count !== 1 ? "s" : ""} on ${cell.date}`;
    };

    if (compact) {
        return (
            <View style={{ gap: 12 }}>
                {/* Stats Row */}
                <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
                    <View>
                        <Text style={{ fontSize: 12, color: COLORS.muted }}>Current Streak</Text>
                        <Text style={{ fontSize: 20, fontWeight: "600", color: COLORS.accent }}>
                            {currentStreak} {currentStreak === 1 ? "day" : "days"}
                        </Text>
                    </View>
                    <View>
                        <Text style={{ fontSize: 12, color: COLORS.muted }}>Days Studied</Text>
                        <Text style={{ fontSize: 20, fontWeight: "600", color: COLORS.accent }}>
                            {totalDaysStudied}
                        </Text>
                    </View>
                    <View>
                        <Text style={{ fontSize: 12, color: COLORS.muted }}>Total Questions</Text>
                        <Text style={{ fontSize: 20, fontWeight: "600", color: COLORS.accent }}>
                            {totalQuestions}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={{ gap: 16 }}>
            {/* Header */}
            <View>
                <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.text, marginBottom: 4 }}>
                    Study Streak Heatmap
                </Text>
                <Text style={{ fontSize: 12, color: COLORS.muted }}>
                    Your activity over the past year
                </Text>
            </View>

            {/* Stats */}
            <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
                <View>
                    <Text style={{ fontSize: 11, color: COLORS.muted }}>Current Streak</Text>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.accent }}>
                        {currentStreak} {currentStreak === 1 ? "day" : "days"}
                    </Text>
                </View>
                <View>
                    <Text style={{ fontSize: 11, color: COLORS.muted }}>Days Studied</Text>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.accent }}>
                        {totalDaysStudied}
                    </Text>
                </View>
                <View>
                    <Text style={{ fontSize: 11, color: COLORS.muted }}>Total Questions</Text>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.accent }}>
                        {totalQuestions}
                    </Text>
                </View>
            </View>

            {/* Heatmap Grid */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 2 }}>
                    {/* Day labels */}
                    <View style={{ paddingRight: 8 }}>
                        <View style={{ height: 20 }} />
                        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                            <View key={i} style={{ height: 24, width: 20, marginBottom: 2, justifyContent: "center" }}>
                                <Text style={{ fontSize: 9, color: COLORS.muted, textAlign: "right" }}>
                                    {getDayName(i).charAt(0)}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Weeks and cells */}
                    <View style={{ flexDirection: "row", gap: 2 }}>
                        {heatmapWeeks.map((week, weekIdx) => (
                            <View key={weekIdx} style={{ gap: 2 }}>
                                {/* Week number label */}
                                <View style={{ height: 20, justifyContent: "center" }}>
                                    <Text style={{ fontSize: 8, color: COLORS.muted, width: 24 }}>
                                        {52 - weekIdx}w
                                    </Text>
                                </View>

                                {/* Day cells */}
                                {week.map((cell, dayIdx) => {
                                    const bgColor = getLevelColor(cell.level, COLORS);
                                    const opacity = cell.level === 0 ? 0.3 : 1;

                                    return (
                                        <View
                                            key={`${weekIdx}-${dayIdx}`}
                                            style={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: 3,
                                                backgroundColor: bgColor,
                                                opacity,
                                                borderWidth: 1,
                                                borderColor: bgColor,
                                            }}
                                        />
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Legend */}
            <View>
                <Text style={{ fontSize: 11, color: COLORS.muted, marginBottom: 8 }}>
                    Less ←→ More
                </Text>
                <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                    <View
                        style={{
                            width: 16,
                            height: 16,
                            borderRadius: 2,
                            backgroundColor: COLORS.muted,
                            opacity: 0.3,
                        }}
                    />
                    <View
                        style={{
                            width: 16,
                            height: 16,
                            borderRadius: 2,
                            backgroundColor: COLORS.muted,
                        }}
                    />
                    <View
                        style={{
                            width: 16,
                            height: 16,
                            borderRadius: 2,
                            backgroundColor: COLORS.accent,
                        }}
                    />
                    <View
                        style={{
                            width: 16,
                            height: 16,
                            borderRadius: 2,
                            backgroundColor: COLORS.accent,
                        }}
                    />
                    <View
                        style={{
                            width: 16,
                            height: 16,
                            borderRadius: 2,
                            backgroundColor: COLORS.accent,
                            borderWidth: 2,
                            borderColor: COLORS.accent,
                        }}
                    />
                </View>
            </View>
        </View>
    );
}
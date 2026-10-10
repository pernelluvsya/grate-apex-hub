import React, { useMemo } from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Text } from "./Text";
import { useColors, Colors } from "./theme";
import { QuizSessionState, answeredIn } from "./quizSession";
import { Em } from "./components/em";

interface QuizResumeDialogProps {
    session: QuizSessionState;
    onContinue: () => void;
    onRestart: () => void;
    onCancel?: () => void;
    elapsed: number;
}

export default function QuizResumeDialog({
    session,
    onContinue,
    onRestart,
    onCancel,
    elapsed,
}: QuizResumeDialogProps) {
    const COLORS = useColors();
    const s = useMemo(() => makeStyles(COLORS), [COLORS]);

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const total = session.questions.length;
    const answeredCount = answeredIn(session);
    const progress = `${answeredCount} / ${total} answered`;

    return (
        <View style={s.container}>
            <View style={s.backdrop} />
            <View style={s.dialog}>
                <Text style={s.title}>Resume Quiz?</Text>
                <Text style={[s.subtitle, { marginBottom: 16 }]}>{session.title}</Text>

                <View style={s.progressContainer}>
                    <View style={s.progressBar}>
                        <View
                            style={[
                                s.progressFill,
                                {
                                    width: `${(answeredCount / total) * 100}%`,
                                    backgroundColor: COLORS.accent,
                                },
                            ]}
                        />
                    </View>
                    <Text style={[s.small, { marginTop: 8, textAlign: "center" }]}>
                        {progress}
                    </Text>
                    <Text style={[s.small, { marginTop: 4, color: COLORS.muted }]}>
                        Saved {formatTime(elapsed)}
                    </Text>
                </View>

                <View style={s.actions}>
                    <TouchableOpacity
                        style={[s.button, s.secondaryButton]}
                        onPress={onRestart}
                    >
                        <Text style={[s.buttonText, { color: COLORS.text }]}>
                            <Em n="repeat" /> Restart
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.button, s.primaryButton]} onPress={onContinue}>
                        <Text style={[s.buttonText, { color: COLORS.onPrimary }]}>
                            ▶ Continue
                        </Text>
                    </TouchableOpacity>
                </View>
                {onCancel && (
                    <TouchableOpacity onPress={onCancel} style={{ marginTop: 14, alignItems: "center" }}>
                        <Text style={[s.small, { color: COLORS.muted, fontWeight: "700" }]}>Cancel</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const makeStyles = (COLORS: Colors) =>
    StyleSheet.create({
        container: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            ...Platform.select({
                web: { position: "fixed" as any },
            }),
        },
        backdrop: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
        dialog: {
            backgroundColor: COLORS.card,
            borderRadius: 16,
            padding: 20,
            maxWidth: 360,
            width: "90%",
            zIndex: 1001,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
        },
        title: {
            fontSize: 18,
            fontWeight: "700",
            color: COLORS.text,
            marginBottom: 4,
        },
        subtitle: {
            fontSize: 14,
            color: COLORS.muted,
            fontWeight: "600",
        },
        progressContainer: {
            marginBottom: 24,
        },
        progressBar: {
            height: 8,
            backgroundColor: COLORS.border,
            borderRadius: 4,
            overflow: "hidden",
        },
        progressFill: {
            height: "100%",
            borderRadius: 4,
        },
        small: {
            fontSize: 13,
            color: COLORS.text,
        },
        actions: {
            flexDirection: "row",
            gap: 10,
        },
        button: {
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
        },
        primaryButton: {
            backgroundColor: COLORS.accent,
        },
        secondaryButton: {
            backgroundColor: COLORS.border,
        },
        buttonText: {
            fontSize: 15,
            fontWeight: "700",
        },
    });
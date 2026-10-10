import React, { useState, useEffect } from "react";
import { ActivityIndicator, Modal, ScrollView, TouchableOpacity, View, StyleSheet, Platform, Share } from "react-native";
import { Text, TextInput } from "./Text";
import { useAuth } from "./auth";
import { useColors, Colors } from "./theme";
import { UserHit, postActivity } from "./social";
import { Group, listMyGroups, sendMessage } from "./groups";
import { fetchFriends, sendDM } from "./messages";
import { Avatar } from "./MediaUI";
import { usePhotos } from "./photos";
import { Em } from "./components/em";

export interface QuizResultData {
    mode: string;
    title: string;
    correct: number;
    total: number;
    xp: number;
    accuracy: number;
    emoji: string;
    pct: number;
}

type ShareMethod = null | "feed" | "friends" | "groups" | "copy";

const makeStyles = (COLORS: Colors) => StyleSheet.create({
    modal: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "flex-end",
    },
    sheet: {
        backgroundColor: COLORS.light ? "#ffffff" : "#0b1466",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 18,
        maxHeight: "80%",
        width: "100%",
        maxWidth: 560,
        alignSelf: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    headerTitle: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: "800",
        flex: 1,
        marginLeft: 10,
    },
    backButton: {
        padding: 6,
    },
    backText: {
        color: COLORS.accent,
        fontWeight: "800",
        fontSize: 16,
    },
    closeButton: {
        padding: 6,
    },
    closeText: {
        color: COLORS.muted,
        fontWeight: "800",
        fontSize: 16,
    },
    previewCard: {
        backgroundColor: COLORS.card,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
    },
    previewLabel: {
        color: COLORS.muted,
        fontSize: 12,
        fontWeight: "700",
        marginBottom: 8,
    },
    previewScore: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 4,
    },
    previewPercent: {
        color: COLORS.accent,
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 2,
    },
    previewTitle: {
        color: COLORS.muted,
        fontSize: 12,
    },
    successText: {
        color: "#22c55e",
        fontWeight: "700",
        marginBottom: 12,
        textAlign: "center",
    },
    errorText: {
        color: COLORS.danger,
        fontWeight: "700",
        marginBottom: 12,
        textAlign: "center",
    },
    messageInput: {
        backgroundColor: COLORS.card,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 12,
        color: COLORS.text,
        padding: 10,
        marginBottom: 12,
    },
    submitButton: {
        backgroundColor: COLORS.accent,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: "#04123a",
        fontWeight: "700",
        fontSize: 15,
    },
    methodButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    methodIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    methodContent: {
        flex: 1,
    },
    methodTitle: {
        color: COLORS.text,
        fontWeight: "700",
        fontSize: 15,
    },
    methodSubtitle: {
        color: COLORS.muted,
        fontSize: 12,
    },
    friendRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    friendName: {
        color: COLORS.text,
        fontWeight: "700",
        flex: 1,
        marginLeft: 12,
    },
    checkbox: {
        fontSize: 20,
    },
});

export default function ResultsShareSheet({
    result,
    onClose,
}: {
    result: QuizResultData | null;
    onClose: () => void;
}) {
    const open = !!result;
    const COLORS = useColors();
    const s = makeStyles(COLORS);
    const { user, profile } = useAuth();
    const me = user && profile ? { uid: user.uid, username: profile.username } : null;

    const [shareMethod, setShareMethod] = useState<ShareMethod>(null);
    const [friends, setFriends] = useState<UserHit[]>([]);
    const photos = usePhotos(open ? friends.map((f) => f.uid) : []);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
    const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!open || !me) return;
        setLoading(true);
        setSelectedFriends(new Set());
        setSelectedGroups(new Set());
        setMessage("");
        setError("");
        setSuccess("");

        Promise.all([
            fetchFriends(me.uid).catch(() => []),
            listMyGroups(me.uid).catch(() => []),
        ])
            .then(([f, g]) => {
                setFriends(f);
                setGroups(g.sort((a, b) => a.name.localeCompare(b.name)));
            })
            .finally(() => setLoading(false));
    }, [open, me?.uid]);

    if (!result || !me) return null;

    const formatResultText = () => {
        return `${result.emoji} ${result.correct}/${result.total} correct (${result.pct}%) on ${result.title}! +${result.xp} XP`;
    };

    const handlePostToFeed = async () => {
        if (!user || !profile) return;
        setBusy(true);
        setError("");
        setSuccess("");
        try {
            await postActivity(user.uid, profile.username, "quizShare", {
                title: result.title,
                correct: result.correct,
                total: result.total,
                pct: result.pct,
                xp: result.xp,
                accuracy: result.accuracy,
                emoji: result.emoji,
                mode: result.mode,
                text: `${formatResultText()}${message.trim() ? "\n\n" + message.trim() : ""}`.slice(0, 280),
            }, true);
            setSuccess("Result posted to your feed! 🎉");
            setTimeout(() => {
                setShareMethod(null);
                onClose();
            }, 1500);
        } catch (e: any) {
            setError(
                `Couldn't post result (${e?.code ?? "error"}). Try again later.`
            );
        }
        setBusy(false);
    };

    const handleSendToFriends = async () => {
        if (!me) return;
        setBusy(true);
        setError("");
        setSuccess("");

        const selectedFriendsArray = friends.filter((f) => selectedFriends.has(f.uid));
        const resultText = formatResultText();

        try {
            await Promise.all(
                selectedFriendsArray.map((friend) =>
                    sendDM(me, friend, `${resultText}${message ? "\n\n" + message : ""}`.slice(0, 500), {
                        share: {
                            kind: "activity",
                            uid: me.uid,
                            id: `quiz_${Date.now()}`,
                            username: me.username,
                            text: resultText,
                            title: result.title,
                        },
                    })
                )
            );

            setSuccess(
                `Sent to ${selectedFriendsArray.length} friend${selectedFriendsArray.length === 1 ? "" : "s"
                }! 📤`
            );
            setTimeout(() => {
                setShareMethod(null);
                setSelectedFriends(new Set());
                setMessage("");
                onClose();
            }, 1500);
        } catch (e: any) {
            setError(
                `Couldn't send to friends (${e?.code ?? "error"}). Try again.`
            );
        }
        setBusy(false);
    };

    const handleSendToGroups = async () => {
        if (!me) return;
        setBusy(true);
        setError("");
        setSuccess("");

        const selectedGroupsArray = groups.filter((g) => selectedGroups.has(g.id));
        const resultText = formatResultText();

        try {
            await Promise.all(
                selectedGroupsArray.map((group) =>
                    sendMessage(
                        group.id,
                        `${resultText}${message ? "\n\n" + message : ""}`.slice(0, 500),
                        me,
                        undefined,
                        {
                            kind: "activity",
                            uid: me.uid,
                            id: `quiz_${Date.now()}`,
                            username: me.username,
                            text: resultText,
                            title: result.title,
                        }
                    )
                )
            );

            setSuccess(
                `Sent to ${selectedGroupsArray.length} group${selectedGroupsArray.length === 1 ? "" : "s"
                }! 📤`
            );
            setTimeout(() => {
                setShareMethod(null);
                setSelectedGroups(new Set());
                setMessage("");
                onClose();
            }, 1500);
        } catch (e: any) {
            setError(
                `Couldn't send to groups (${e?.code ?? "error"}). Try again.`
            );
        }
        setBusy(false);
    };

    const handleCopyToClipboard = async () => {
        const text = formatResultText();
        setError("");
        try {
            if (Platform.OS === "web") {
                const nav: any = typeof navigator !== "undefined" ? navigator : null;
                if (nav?.share) { await nav.share({ text }); }
                else if (nav?.clipboard) { await nav.clipboard.writeText(text); setSuccess("Result copied to clipboard! 📋"); }
                else { setError("Sharing isn't supported in this browser."); return; }
            } else {
                // Opens the phone's share sheet (WhatsApp, Messages, copy, etc.)
                const r = await Share.share({ message: text });
                if (r.action === Share.dismissedAction) return;
            }
            setTimeout(() => { setShareMethod(null); onClose(); }, 1200);
        } catch (e: any) {
            if (e?.name === "AbortError") return; // user closed the share dialog
            setError("Couldn't share the result. Try again.");
        }
    };

    // Main share method selection screen
    if (!shareMethod) {
        return (
            <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
                <View style={s.modal}>
                    <View style={s.sheet}>
                        <View style={s.header}>
                            <Text style={s.headerTitle}>Share Your Result</Text>
                            <TouchableOpacity onPress={onClose} style={s.closeButton}>
                                <Text style={s.closeText}><Em n="close" /></Text>
                            </TouchableOpacity>
                        </View>

                        <View style={s.previewCard}>
                            <Text style={s.previewScore}>
                                {result.emoji} {result.correct}/{result.total} correct
                            </Text>
                            <Text style={s.previewPercent}>
                                {result.pct}% • +{result.xp} XP
                            </Text>
                            <Text style={s.previewTitle}>{result.title}</Text>
                        </View>

                        {!!success && <Text style={s.successText}>{success}</Text>}
                        {!!error && <Text style={s.errorText}>{error}</Text>}

                        <TouchableOpacity onPress={() => setShareMethod("feed")} style={s.methodButton}>
                            <Text style={s.methodIcon}><Em n="globe" /></Text>
                            <View style={s.methodContent}>
                                <Text style={s.methodTitle}>Post to Feed</Text>
                                <Text style={s.methodSubtitle}>Share with your followers</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShareMethod("friends")} style={s.methodButton}>
                            <Text style={s.methodIcon}><Em n="users" /></Text>
                            <View style={s.methodContent}>
                                <Text style={s.methodTitle}>Send to Friends</Text>
                                <Text style={s.methodSubtitle}>Message your close friends</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShareMethod("groups")} style={s.methodButton}>
                            <Text style={s.methodIcon}><Em n="chat" /></Text>
                            <View style={s.methodContent}>
                                <Text style={s.methodTitle}>Send to Groups</Text>
                                <Text style={s.methodSubtitle}>Share in study groups</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleCopyToClipboard} style={s.methodButton}>
                            <Text style={s.methodIcon}><Em n="list" /></Text>
                            <View style={s.methodContent}>
                                <Text style={s.methodTitle}>Share elsewhere</Text>
                                <Text style={s.methodSubtitle}>Share via WhatsApp, Twitter, etc.</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    // Post to Feed screen
    if (shareMethod === "feed") {
        return (
            <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
                <View style={s.modal}>
                    <View style={s.sheet}>
                        <View style={s.header}>
                            <TouchableOpacity onPress={() => setShareMethod(null)} style={s.backButton}>
                                <Text style={s.backText}>← Back</Text>
                            </TouchableOpacity>
                            <Text style={s.headerTitle}>Post to Feed</Text>
                        </View>

                        {!!success && <Text style={s.successText}>{success}</Text>}
                        {!!error && <Text style={s.errorText}>{error}</Text>}

                        <View style={s.previewCard}>
                            <Text style={s.previewLabel}>Preview</Text>
                            <Text style={s.previewScore}>{formatResultText()}</Text>
                        </View>

                        <TextInput
                            value={message}
                            onChangeText={setMessage}
                            placeholder="Add a message (optional)"
                            placeholderTextColor={COLORS.muted}
                            maxLength={280}
                            multiline
                            numberOfLines={3}
                            style={s.messageInput}
                        />

                        <TouchableOpacity
                            onPress={handlePostToFeed}
                            disabled={busy}
                            style={[s.submitButton, busy && s.submitButtonDisabled]}
                        >
                            {busy ? (
                                <ActivityIndicator color={"#04123a"} />
                            ) : (
                                <Text style={s.submitButtonText}>Post to Feed</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    // Send to Friends screen
    if (shareMethod === "friends") {
        return (
            <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
                <View style={s.modal}>
                    <View style={s.sheet}>
                        <View style={s.header}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShareMethod(null);
                                    setSelectedFriends(new Set());
                                }}
                                style={s.backButton}
                            >
                                <Text style={s.backText}>← Back</Text>
                            </TouchableOpacity>
                            <Text style={s.headerTitle}>Send to Friends</Text>
                        </View>

                        {!!success && <Text style={s.successText}>{success}</Text>}
                        {!!error && <Text style={s.errorText}>{error}</Text>}

                        {loading ? (
                            <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 12 }} />
                        ) : friends.length === 0 ? (
                            <Text
                                style={{
                                    color: COLORS.muted,
                                    marginVertical: 12,
                                    textAlign: "center",
                                }}
                            >
                                No friends yet. Friends are people you follow who follow you back.
                            </Text>
                        ) : (
                            <>
                                <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 300, marginBottom: 12 }}>
                                    {friends.map((f) => (
                                        <TouchableOpacity
                                            key={f.uid}
                                            onPress={() => {
                                                const next = new Set(selectedFriends);
                                                if (next.has(f.uid)) {
                                                    next.delete(f.uid);
                                                } else {
                                                    next.add(f.uid);
                                                }
                                                setSelectedFriends(next);
                                            }}
                                            style={s.friendRow}
                                        >
                                            <Avatar name={f.username} photo={photos[f.uid]} size={36} />
                                            <Text style={s.friendName}>@{f.username}</Text>
                                            <Text
                                                style={[
                                                    s.checkbox,
                                                    { color: selectedFriends.has(f.uid) ? COLORS.accent : COLORS.muted },
                                                ]}
                                            >
                                                {selectedFriends.has(f.uid) ? "✓" : "○"}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                <TextInput
                                    value={message}
                                    onChangeText={setMessage}
                                    placeholder="Add a message (optional)"
                                    placeholderTextColor={COLORS.muted}
                                    maxLength={280}
                                    style={s.messageInput}
                                />

                                <TouchableOpacity
                                    onPress={handleSendToFriends}
                                    disabled={busy || selectedFriends.size === 0}
                                    style={[s.submitButton, (busy || selectedFriends.size === 0) && s.submitButtonDisabled]}
                                >
                                    {busy ? (
                                        <ActivityIndicator color={"#04123a"} />
                                    ) : (
                                        <Text style={s.submitButtonText}>
                                            Send to {selectedFriends.size} Friend{selectedFriends.size === 1 ? "" : "s"}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        );
    }

    // Send to Groups screen
    if (shareMethod === "groups") {
        return (
            <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
                <View style={s.modal}>
                    <View style={s.sheet}>
                        <View style={s.header}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShareMethod(null);
                                    setSelectedGroups(new Set());
                                }}
                                style={s.backButton}
                            >
                                <Text style={s.backText}>← Back</Text>
                            </TouchableOpacity>
                            <Text style={s.headerTitle}>Send to Groups</Text>
                        </View>

                        {!!success && <Text style={s.successText}>{success}</Text>}
                        {!!error && <Text style={s.errorText}>{error}</Text>}

                        {loading ? (
                            <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 12 }} />
                        ) : groups.length === 0 ? (
                            <Text
                                style={{
                                    color: COLORS.muted,
                                    marginVertical: 12,
                                    textAlign: "center",
                                }}
                            >
                                No groups yet. Create or join a study group to share results.
                            </Text>
                        ) : (
                            <>
                                <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 300, marginBottom: 12 }}>
                                    {groups.map((g) => (
                                        <TouchableOpacity
                                            key={g.id}
                                            onPress={() => {
                                                const next = new Set(selectedGroups);
                                                if (next.has(g.id)) {
                                                    next.delete(g.id);
                                                } else {
                                                    next.add(g.id);
                                                }
                                                setSelectedGroups(next);
                                            }}
                                            style={s.friendRow}
                                        >
                                            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" }}>
                                                <Text style={{ color: COLORS.onPrimary, fontWeight: "700" }}><Em n="users" /></Text>
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 12 }}>
                                                <Text style={s.friendName}>{g.name}</Text>
                                                <Text style={s.methodSubtitle}>{g.memberUids.length} members</Text>
                                            </View>
                                            <Text
                                                style={[
                                                    s.checkbox,
                                                    { color: selectedGroups.has(g.id) ? COLORS.accent : COLORS.muted },
                                                ]}
                                            >
                                                {selectedGroups.has(g.id) ? "✓" : "○"}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                <TextInput
                                    value={message}
                                    onChangeText={setMessage}
                                    placeholder="Add a message (optional)"
                                    placeholderTextColor={COLORS.muted}
                                    maxLength={280}
                                    style={s.messageInput}
                                />

                                <TouchableOpacity
                                    onPress={handleSendToGroups}
                                    disabled={busy || selectedGroups.size === 0}
                                    style={[s.submitButton, (busy || selectedGroups.size === 0) && s.submitButtonDisabled]}
                                >
                                    {busy ? (
                                        <ActivityIndicator color={"#04123a"} />
                                    ) : (
                                        <Text style={s.submitButtonText}>
                                            Send to {selectedGroups.size} Group{selectedGroups.size === 1 ? "" : "s"}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        );
    }

    return null;
}
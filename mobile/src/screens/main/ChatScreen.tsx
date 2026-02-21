/**
 * Chat screen - interactive AI tutor for practicing
 * DSA, System Design, and Gen AI concepts.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    ActivityIndicator,
    KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { chatAPI } from '../../lib/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type ChatScreenProps = NativeStackScreenProps<any, any>;

interface ChatMsg {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const TOPIC_PRESETS = [
    { label: '🧮 DSA', topic: 'Data Structures & Algorithms' },
    { label: '🏗️ System Design', topic: 'System Design' },
    { label: '🤖 GenAI', topic: 'Generative AI & LLMs' },
];

const STARTER_PROMPTS = [
    'Explain the two-pointer technique with examples',
    'How would you design a URL shortener?',
    'What is RAG and why is it useful?',
    'Give me a medium difficulty LeetCode problem to solve',
    'Explain CAP theorem simply',
    'What are attention mechanisms in transformers?',
];

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);
    const [selectedTopic, setSelectedTopic] = useState<string | undefined>(
        route.params?.contextTopic
    );
    const scrollRef = useRef<ScrollView>(null);

    // Load history if sessionId passed
    useEffect(() => {
        if (route.params?.sessionId) {
            setSessionId(route.params.sessionId);
            loadHistory(route.params.sessionId);
        }
    }, []);

    const loadHistory = async (sid: string) => {
        try {
            const data = await chatAPI.getHistory(sid);
            setMessages(
                data.messages.map((m: any) => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    timestamp: new Date(m.created_at),
                }))
            );
        } catch (e) {
            console.error('Failed to load chat history:', e);
        }
    };

    const sendMessage = async (text?: string) => {
        const msg = text || input.trim();
        if (!msg || loading) return;

        const userMsg: ChatMsg = {
            id: Date.now().toString(),
            role: 'user',
            content: msg,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            const data = await chatAPI.send(msg, sessionId, selectedTopic);
            setSessionId(data.session_id);

            const assistantMsg: ChatMsg = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.reply,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMsg]);
        } catch (error: any) {
            const errMsg: ChatMsg = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I couldn\'t process that. Please try again.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errMsg]);
        } finally {
            setLoading(false);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
        }
    };

    const newChat = () => {
        setMessages([]);
        setSessionId(undefined);
        setSelectedTopic(undefined);
    };

    const hasMessages = messages.length > 0;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, SHADOWS.sm]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                >
                    <Ionicons name="arrow-back" size={22} color={COLORS.slate[700]} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>AI Tutor</Text>
                    <Text style={styles.headerSubtitle}>
                        {selectedTopic || 'Ask anything about DSA, System Design, or GenAI'}
                    </Text>
                </View>
                <TouchableOpacity onPress={newChat} style={styles.newChatBtn}>
                    <Ionicons name="create-outline" size={22} color={COLORS.primary[600]} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <ScrollView
                    ref={scrollRef}
                    style={styles.messageList}
                    contentContainerStyle={styles.messageListContent}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() =>
                        scrollRef.current?.scrollToEnd({ animated: true })
                    }
                >
                    {/* Empty state */}
                    {!hasMessages && (
                        <View style={styles.emptyState}>
                            <LinearGradient
                                colors={COLORS.gradients.purple}
                                style={styles.emptyIcon}
                            >
                                <Ionicons name="chatbubbles" size={40} color={COLORS.white} />
                            </LinearGradient>
                            <Text style={styles.emptyTitle}>Practice with AI Tutor</Text>
                            <Text style={styles.emptyText}>
                                Ask questions, solve problems, and get instant feedback on DSA,
                                System Design, and Generative AI topics.
                            </Text>

                            {/* Topic chips */}
                            <Text style={styles.topicLabel}>Choose a topic:</Text>
                            <View style={styles.topicRow}>
                                {TOPIC_PRESETS.map((t) => (
                                    <TouchableOpacity
                                        key={t.topic}
                                        style={[
                                            styles.topicChip,
                                            selectedTopic === t.topic && styles.topicChipActive,
                                        ]}
                                        onPress={() =>
                                            setSelectedTopic(
                                                selectedTopic === t.topic ? undefined : t.topic
                                            )
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.topicChipText,
                                                selectedTopic === t.topic &&
                                                styles.topicChipTextActive,
                                            ]}
                                        >
                                            {t.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Starter prompts */}
                            <Text style={styles.starterLabel}>Or try a starter:</Text>
                            <View style={styles.starterList}>
                                {STARTER_PROMPTS.map((p) => (
                                    <TouchableOpacity
                                        key={p}
                                        style={styles.starterItem}
                                        onPress={() => sendMessage(p)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name="chatbubble-ellipses-outline"
                                            size={16}
                                            color={COLORS.primary[500]}
                                        />
                                        <Text style={styles.starterText} numberOfLines={2}>
                                            {p}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Messages */}
                    {messages.map((msg) => (
                        <View
                            key={msg.id}
                            style={[
                                styles.messageBubble,
                                msg.role === 'user'
                                    ? styles.userBubble
                                    : styles.assistantBubble,
                            ]}
                        >
                            {msg.role === 'assistant' && (
                                <View style={styles.assistantAvatar}>
                                    <Ionicons
                                        name="sparkles"
                                        size={14}
                                        color={COLORS.primary[600]}
                                    />
                                </View>
                            )}
                            <View
                                style={[
                                    styles.messageContent,
                                    msg.role === 'user'
                                        ? styles.userContent
                                        : styles.assistantContent,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.messageText,
                                        msg.role === 'user' && styles.userMessageText,
                                    ]}
                                    selectable
                                >
                                    {msg.content}
                                </Text>
                            </View>
                        </View>
                    ))}

                    {/* Typing indicator */}
                    {loading && (
                        <View style={[styles.messageBubble, styles.assistantBubble]}>
                            <View style={styles.assistantAvatar}>
                                <Ionicons
                                    name="sparkles"
                                    size={14}
                                    color={COLORS.primary[600]}
                                />
                            </View>
                            <View style={[styles.messageContent, styles.assistantContent]}>
                                <View style={styles.typingRow}>
                                    <ActivityIndicator
                                        size="small"
                                        color={COLORS.primary[500]}
                                    />
                                    <Text style={styles.typingText}>Thinking...</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Input bar */}
                <View style={[styles.inputBar, SHADOWS.md]}>
                    {hasMessages && (
                        <View style={styles.topicRowSmall}>
                            {TOPIC_PRESETS.map((t) => (
                                <TouchableOpacity
                                    key={t.topic}
                                    style={[
                                        styles.topicChipSmall,
                                        selectedTopic === t.topic &&
                                        styles.topicChipSmallActive,
                                    ]}
                                    onPress={() =>
                                        setSelectedTopic(
                                            selectedTopic === t.topic ? undefined : t.topic
                                        )
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.topicChipSmallText,
                                            selectedTopic === t.topic &&
                                            styles.topicChipSmallTextActive,
                                        ]}
                                    >
                                        {t.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.textInput}
                            value={input}
                            onChangeText={setInput}
                            placeholder="Ask a question..."
                            placeholderTextColor={COLORS.slate[400]}
                            multiline
                            maxLength={2000}
                            returnKeyType="send"
                            onSubmitEditing={() => sendMessage()}
                            blurOnSubmit={false}
                        />
                        <TouchableOpacity
                            onPress={() => sendMessage()}
                            disabled={loading || !input.trim()}
                            style={[
                                styles.sendBtn,
                                (!input.trim() || loading) && styles.sendBtnDisabled,
                            ]}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="send"
                                size={20}
                                color={
                                    input.trim() && !loading
                                        ? COLORS.white
                                        : COLORS.slate[400]
                                }
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.slate[50],
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingTop: Platform.OS === 'web' ? SPACING.lg : SPACING['5xl'],
        paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate[200],
    },
    backBtn: {
        padding: SPACING.sm,
    },
    headerCenter: {
        flex: 1,
        marginLeft: SPACING.sm,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.slate[900],
    },
    headerSubtitle: {
        fontSize: 11,
        color: COLORS.slate[500],
        marginTop: 1,
    },
    newChatBtn: {
        padding: SPACING.sm,
    },

    // Messages
    messageList: {
        flex: 1,
    },
    messageListContent: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xl,
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: SPACING['2xl'],
    },
    emptyIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.slate[900],
        marginBottom: SPACING.sm,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.slate[600],
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 320,
        marginBottom: SPACING['2xl'],
    },
    topicLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.slate[700],
        marginBottom: SPACING.md,
        alignSelf: 'flex-start',
    },
    topicRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING['2xl'],
        alignSelf: 'flex-start',
    },
    topicChip: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
        borderWidth: 2,
        borderColor: COLORS.slate[200],
        backgroundColor: COLORS.white,
    },
    topicChipActive: {
        borderColor: COLORS.primary[500],
        backgroundColor: COLORS.primary[50],
    },
    topicChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.slate[700],
    },
    topicChipTextActive: {
        color: COLORS.primary[700],
    },
    starterLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.slate[700],
        marginBottom: SPACING.md,
        alignSelf: 'flex-start',
    },
    starterList: {
        width: '100%',
        gap: SPACING.sm,
    },
    starterItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.slate[200],
        borderRadius: RADIUS.lg,
        backgroundColor: COLORS.white,
    },
    starterText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.slate[700],
    },

    // Message bubbles
    messageBubble: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
        alignItems: 'flex-start',
    },
    userBubble: {
        justifyContent: 'flex-end',
    },
    assistantBubble: {
        justifyContent: 'flex-start',
    },
    assistantAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary[100],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
        marginTop: 2,
    },
    messageContent: {
        maxWidth: '80%',
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
    },
    userContent: {
        backgroundColor: COLORS.primary[600],
        borderBottomRightRadius: RADIUS.sm,
        marginLeft: 'auto',
    },
    assistantContent: {
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: RADIUS.sm,
        borderWidth: 1,
        borderColor: COLORS.slate[200],
    },
    messageText: {
        fontSize: 14,
        lineHeight: 22,
        color: COLORS.slate[800],
    },
    userMessageText: {
        color: COLORS.white,
    },

    // Typing indicator
    typingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    typingText: {
        fontSize: 13,
        color: COLORS.slate[500],
        fontStyle: 'italic',
    },

    // Input bar
    inputBar: {
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.slate[200],
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
    },
    topicRowSmall: {
        flexDirection: 'row',
        gap: SPACING.xs,
        marginBottom: SPACING.sm,
    },
    topicChipSmall: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 3,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.slate[200],
    },
    topicChipSmallActive: {
        borderColor: COLORS.primary[400],
        backgroundColor: COLORS.primary[50],
    },
    topicChipSmallText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.slate[500],
    },
    topicChipSmallTextActive: {
        color: COLORS.primary[600],
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: SPACING.sm,
    },
    textInput: {
        flex: 1,
        borderWidth: 2,
        borderColor: COLORS.slate[200],
        borderRadius: RADIUS.xl,
        paddingHorizontal: SPACING.lg,
        paddingVertical: Platform.OS === 'web' ? SPACING.md : SPACING.sm,
        fontSize: 15,
        color: COLORS.slate[900],
        maxHeight: 100,
        minHeight: 40,
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary[600],
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendBtnDisabled: {
        backgroundColor: COLORS.slate[200],
    },
});

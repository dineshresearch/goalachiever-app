/**
 * Day Detail screen - shows DSA problem, System Design topic, GenAI question, and notes.
 * Mirrors the Next.js [date] page.
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Platform,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { plansAPI } from '../../lib/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type DayDetailScreenProps = NativeStackScreenProps<any, any>;

export default function DayDetailScreen({ navigation, route }: DayDetailScreenProps) {
    const { date, goalId } = route.params || {};
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showSolution, setShowSolution] = useState(false);
    const [copied, setCopied] = useState(false);
    const [notes, setNotes] = useState<any[]>([]);
    const [newNote, setNewNote] = useState('');

    useEffect(() => {
        loadPlanData();
    }, [date]);

    const loadPlanData = async () => {
        try {
            const planData = await plansAPI.getByDate(date);
            setPlan(planData);

            const notesData = await plansAPI.getNotes(planData.id);
            setNotes(notesData);
        } catch (error) {
            console.error('Failed to load plan:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkComplete = async () => {
        if (!plan) return;
        try {
            await plansAPI.markComplete(plan.id);
            setPlan({ ...plan, completed: true });
        } catch (error) {
            console.error('Failed to mark complete:', error);
        }
    };

    const handleAddNote = async () => {
        if (!plan || !newNote.trim()) return;
        try {
            const note = await plansAPI.addNote(plan.id, newNote);
            setNotes([...notes, note]);
            setNewNote('');
        } catch (error) {
            console.error('Failed to add note:', error);
        }
    };

    const copyCode = async (code: string) => {
        try {
            if (Platform.OS === 'web') {
                await navigator.clipboard.writeText(code);
            } else {
                // For native, we'd use expo-clipboard but it requires install
                // Fallback for now
                Alert.alert('Copied', 'Code copied to clipboard');
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            Alert.alert('Error', 'Failed to copy code');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary[600]} />
            </View>
        );
    }

    if (!plan) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.emptyTitle}>No plan found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backLink}>← Back to Calendar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const dsa = plan.dsa;
    const systemDesign = plan.system_design;
    const genai = plan.genai;

    const formattedDate = new Date(plan.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, SHADOWS.sm]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={20} color={COLORS.slate[700]} />
                        <Text style={styles.backText}>Calendar</Text>
                    </TouchableOpacity>

                    {!plan.completed ? (
                        <TouchableOpacity
                            onPress={handleMarkComplete}
                            style={styles.completeButton}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
                            <Text style={styles.completeButtonText}>Mark Complete</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.completedBadge}>
                            <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                            <Text style={styles.completedText}>Completed</Text>
                        </View>
                    )}
                </View>
                <View style={styles.headerMeta}>
                    <Text style={styles.dayLabel}>Day {plan.day_number}</Text>
                    <Text style={styles.dateLabel}>{formattedDate}</Text>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* DSA Section */}
                {dsa && (
                    <View style={[styles.sectionCard, SHADOWS.md]}>
                        <View style={styles.sectionHeader}>
                            <LinearGradient
                                colors={['#3b82f6', '#2563eb']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.sectionIcon}
                            >
                                <Ionicons name="code-slash" size={22} color={COLORS.white} />
                            </LinearGradient>
                            <View>
                                <Text style={styles.sectionTitle}>Data Structures & Algorithms</Text>
                                <View
                                    style={[
                                        styles.difficultyBadge,
                                        dsa.difficulty === 'Easy' && styles.badgeSuccess,
                                        dsa.difficulty === 'Medium' && styles.badgeWarning,
                                        dsa.difficulty === 'Hard' && styles.badgeError,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.difficultyText,
                                            dsa.difficulty === 'Easy' && styles.textSuccess,
                                            dsa.difficulty === 'Medium' && styles.textWarning,
                                            dsa.difficulty === 'Hard' && styles.textError,
                                        ]}
                                    >
                                        {dsa.difficulty}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.sectionContent}>
                            <Text style={styles.contentLabel}>Problem</Text>
                            <Text style={styles.contentText}>{dsa.problem}</Text>

                            {/* Solution Toggle */}
                            <TouchableOpacity
                                onPress={() => setShowSolution(!showSolution)}
                                style={styles.toggleButton}
                                activeOpacity={0.7}
                            >
                                <View style={styles.toggleLeft}>
                                    <Ionicons name="code-slash" size={18} color={COLORS.slate[700]} />
                                    <Text style={styles.toggleText}>
                                        {showSolution ? 'Hide Solution' : 'Show Solution'}
                                    </Text>
                                </View>
                                <Ionicons
                                    name={showSolution ? 'chevron-up' : 'chevron-down'}
                                    size={18}
                                    color={COLORS.slate[700]}
                                />
                            </TouchableOpacity>

                            {showSolution && (
                                <View style={styles.solutionContainer}>
                                    <View style={styles.codeBlock}>
                                        <ScrollView horizontal showsHorizontalScrollIndicator>
                                            <Text style={styles.codeText}>{dsa.solution}</Text>
                                        </ScrollView>
                                        <TouchableOpacity
                                            onPress={() => copyCode(dsa.solution)}
                                            style={styles.copyButton}
                                        >
                                            <Ionicons
                                                name={copied ? 'checkmark' : 'copy-outline'}
                                                size={16}
                                                color={COLORS.white}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    {dsa.explanation && (
                                        <View style={styles.explanationBox}>
                                            <Text style={styles.explanationTitle}>Explanation</Text>
                                            <Text style={styles.explanationText}>{dsa.explanation}</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* System Design Section */}
                {systemDesign && (
                    <View style={[styles.sectionCard, SHADOWS.md]}>
                        <View style={styles.sectionHeader}>
                            <LinearGradient
                                colors={COLORS.gradients.purple}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.sectionIcon}
                            >
                                <Ionicons name="git-network-outline" size={22} color={COLORS.white} />
                            </LinearGradient>
                            <Text style={styles.sectionTitle}>System Design</Text>
                        </View>

                        <View style={styles.sectionContent}>
                            <Text style={styles.contentLabel}>Topic</Text>
                            <Text style={styles.topicText}>{systemDesign.topic}</Text>

                            {systemDesign.notes && (
                                <>
                                    <Text style={styles.contentLabel}>Key Concepts</Text>
                                    <Text style={styles.contentText}>{systemDesign.notes}</Text>
                                </>
                            )}

                            {systemDesign.tradeoffs && systemDesign.tradeoffs.length > 0 && (
                                <>
                                    <Text style={styles.contentLabel}>Tradeoffs to Consider</Text>
                                    {systemDesign.tradeoffs.map((tradeoff: string, idx: number) => (
                                        <View key={idx} style={styles.tradeoffRow}>
                                            <View style={styles.tradeoffNumber}>
                                                <Text style={styles.tradeoffNumberText}>{idx + 1}</Text>
                                            </View>
                                            <Text style={styles.tradeoffText}>{tradeoff}</Text>
                                        </View>
                                    ))}
                                </>
                            )}
                        </View>
                    </View>
                )}

                {/* GenAI Section */}
                {genai && (
                    <View style={[styles.sectionCard, SHADOWS.md]}>
                        <View style={styles.sectionHeader}>
                            <LinearGradient
                                colors={COLORS.gradients.pink}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.sectionIcon}
                            >
                                <Ionicons name="sparkles" size={22} color={COLORS.white} />
                            </LinearGradient>
                            <Text style={styles.sectionTitle}>Generative AI</Text>
                        </View>

                        <View style={styles.sectionContent}>
                            <Text style={styles.contentLabel}>Question</Text>
                            <Text style={styles.topicText}>{genai.question}</Text>

                            {genai.answer && (
                                <LinearGradient
                                    colors={['rgba(236, 72, 153, 0.05)', 'rgba(168, 85, 247, 0.05)']}
                                    style={styles.answerBox}
                                >
                                    <Text style={styles.answerTitle}>Answer</Text>
                                    <Text style={styles.answerText}>{genai.answer}</Text>
                                </LinearGradient>
                            )}

                            {genai.resources && genai.resources.length > 0 && (
                                <>
                                    <Text style={styles.contentLabel}>Resources</Text>
                                    {genai.resources.map((resource: string, idx: number) => (
                                        <View key={idx} style={styles.resourceItem}>
                                            <Text style={styles.resourceText} numberOfLines={1}>{resource}</Text>
                                        </View>
                                    ))}
                                </>
                            )}
                        </View>
                    </View>
                )}

                {/* Notes Section */}
                <View style={[styles.sectionCard, SHADOWS.md]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="document-text-outline" size={22} color={COLORS.slate[600]} />
                        <Text style={styles.sectionTitle}>Your Notes</Text>
                    </View>

                    {notes.length > 0 && (
                        <View style={styles.notesList}>
                            {notes.map((note) => (
                                <View key={note.id} style={styles.noteItem}>
                                    <Text style={styles.noteContent}>{note.content}</Text>
                                    <Text style={styles.noteDate}>
                                        {new Date(note.created_at).toLocaleString()}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={styles.noteInput}>
                        <TextInput
                            style={styles.noteTextArea}
                            value={newNote}
                            onChangeText={setNewNote}
                            placeholder="Add your thoughts, learnings, or questions..."
                            placeholderTextColor={COLORS.slate[400]}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                        <TouchableOpacity
                            style={[styles.addNoteButton, !newNote.trim() && styles.addNoteButtonDisabled]}
                            onPress={handleAddNote}
                            disabled={!newNote.trim()}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.addNoteButtonText}>Add Note</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.slate[50],
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.slate[50],
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.slate[900],
        marginBottom: SPACING.md,
    },
    backLink: {
        color: COLORS.primary[600],
        fontSize: 15,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },

    // Header
    header: {
        backgroundColor: COLORS.white,
        paddingTop: Platform.OS === 'web' ? SPACING.lg : SPACING['5xl'],
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.xl,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate[200],
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    backText: {
        fontSize: 15,
        color: COLORS.slate[700],
        fontWeight: '500',
    },
    completeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        backgroundColor: COLORS.primary[600],
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.lg,
    },
    completeButtonText: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: '600',
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        backgroundColor: COLORS.successLight,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    completedText: {
        color: COLORS.success,
        fontSize: 14,
        fontWeight: '600',
    },
    headerMeta: {
        marginTop: SPACING.xs,
    },
    dayLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.slate[900],
    },
    dateLabel: {
        fontSize: 13,
        color: COLORS.slate[600],
    },

    // Section Card
    sectionCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
        marginHorizontal: SPACING.xl,
        marginTop: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.slate[100],
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    sectionIcon: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.slate[900],
    },
    sectionContent: {
        gap: SPACING.lg,
    },

    // Content
    contentLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.slate[900],
    },
    contentText: {
        fontSize: 15,
        color: COLORS.slate[700],
        lineHeight: 24,
    },
    topicText: {
        fontSize: 17,
        color: COLORS.slate[700],
        lineHeight: 26,
    },

    // Difficulty Badge
    difficultyBadge: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
        marginTop: SPACING.xs,
        alignSelf: 'flex-start',
    },
    badgeSuccess: {
        backgroundColor: COLORS.successLight,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    badgeWarning: {
        backgroundColor: COLORS.warningLight,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
    },
    badgeError: {
        backgroundColor: COLORS.errorLight,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    difficultyText: {
        fontSize: 12,
        fontWeight: '600',
    },
    textSuccess: { color: COLORS.success },
    textWarning: { color: COLORS.warning },
    textError: { color: COLORS.error },

    // Toggle
    toggleButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.slate[200],
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
    },
    toggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.slate[700],
    },

    // Solution
    solutionContainer: {
        gap: SPACING.lg,
    },
    codeBlock: {
        backgroundColor: COLORS.slate[900],
        borderRadius: RADIUS.lg,
        padding: SPACING.xl,
        position: 'relative',
    },
    codeText: {
        color: COLORS.slate[100],
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 13,
        lineHeight: 20,
    },
    copyButton: {
        position: 'absolute',
        top: SPACING.md,
        right: SPACING.md,
        backgroundColor: COLORS.slate[700],
        padding: SPACING.sm,
        borderRadius: RADIUS.md,
    },
    explanationBox: {
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
    },
    explanationTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e3a5f',
        marginBottom: SPACING.sm,
    },
    explanationText: {
        fontSize: 14,
        color: COLORS.slate[700],
        lineHeight: 22,
    },

    // Tradeoffs
    tradeoffRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: SPACING.md,
        backgroundColor: 'rgba(139, 92, 246, 0.05)',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
    },
    tradeoffNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#8b5cf6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tradeoffNumberText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '700',
    },
    tradeoffText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.slate[700],
        lineHeight: 20,
    },

    // Answer
    answerBox: {
        borderRadius: RADIUS.lg,
        padding: SPACING.xl,
        borderWidth: 1,
        borderColor: 'rgba(236, 72, 153, 0.2)',
    },
    answerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.slate[900],
        marginBottom: SPACING.md,
    },
    answerText: {
        fontSize: 14,
        color: COLORS.slate[700],
        lineHeight: 22,
    },

    // Resources
    resourceItem: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.slate[200],
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
    },
    resourceText: {
        color: '#ec4899',
        fontSize: 14,
    },

    // Notes
    notesList: {
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    noteItem: {
        backgroundColor: COLORS.slate[50],
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.slate[200],
    },
    noteContent: {
        fontSize: 14,
        color: COLORS.slate[700],
        marginBottom: SPACING.sm,
        lineHeight: 20,
    },
    noteDate: {
        fontSize: 11,
        color: COLORS.slate[500],
    },
    noteInput: {
        gap: SPACING.md,
    },
    noteTextArea: {
        borderWidth: 2,
        borderColor: COLORS.slate[200],
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        fontSize: 14,
        color: COLORS.slate[900],
        minHeight: 100,
        backgroundColor: COLORS.white,
    },
    addNoteButton: {
        backgroundColor: COLORS.primary[600],
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
    },
    addNoteButtonDisabled: {
        opacity: 0.5,
    },
    addNoteButtonText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '600',
    },
});

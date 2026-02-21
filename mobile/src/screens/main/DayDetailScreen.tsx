/**
 * Day Detail screen - shows dynamically generated topic and content
 * with a Floating Action Button for chat.
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

    const handleChatPress = () => {
        if (plan) {
            navigation.navigate('Chat', { contextTopic: `Day ${plan.day_number}: ${plan.topic}` });
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

    const { content, topic } = plan;
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
                {topic && (
                    <View style={[styles.sectionCard, SHADOWS.md]}>
                        <Text style={styles.topicHeader}>Topic:</Text>
                        <Text style={styles.topicText}>{topic}</Text>
                    </View>
                )}

                {content && (
                    <View style={[styles.sectionCard, SHADOWS.md]}>
                        {content.overview && (
                            <View style={styles.contentBlock}>
                                <Text style={styles.contentHeader}>Overview</Text>
                                <Text style={styles.contentText}>{content.overview}</Text>
                            </View>
                        )}

                        {content.tasks && content.tasks.length > 0 && (
                            <View style={styles.contentBlock}>
                                <Text style={styles.contentHeader}>Tasks for Today</Text>
                                {content.tasks.map((task: string, idx: number) => (
                                    <View key={idx} style={styles.taskRow}>
                                        <Ionicons name="radio-button-off" size={16} color={COLORS.primary[500]} />
                                        <Text style={styles.taskText}>{task}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {content.details && (
                            <View style={styles.contentBlock}>
                                <Text style={styles.contentHeader}>Details & Execution</Text>
                                <Text style={styles.contentText}>{content.details}</Text>
                            </View>
                        )}

                        {content.tips && (
                            <View style={[styles.contentBlock, styles.tipsBlock]}>
                                <Text style={[styles.contentHeader, { color: COLORS.warning }]}>
                                    Tips for Success
                                </Text>
                                <Text style={styles.tipsText}>{content.tips}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Notes Section */}
                <View style={[styles.sectionCard, SHADOWS.md, { marginBottom: SPACING.xl }]}>
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

                <View style={{ height: 100 }} /> {/* Padding for FAB */}
            </ScrollView>

            {/* Chat FAB */}
            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.8}
                onPress={handleChatPress}
            >
                <LinearGradient
                    colors={COLORS.gradients.pink}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.fabIconContainer}
                >
                    <Ionicons name="chatbubbles" size={28} color={COLORS.white} />
                </LinearGradient>
            </TouchableOpacity>
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
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.slate[900],
    },
    dateLabel: {
        fontSize: 14,
        color: COLORS.slate[500],
    },

    // AI Contents
    sectionCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
        marginHorizontal: SPACING.xl,
        marginTop: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.slate[100],
    },
    topicHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary[600],
        marginBottom: SPACING.xs,
    },
    topicText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.slate[900],
        lineHeight: 26,
    },
    contentBlock: {
        marginBottom: SPACING.lg,
    },
    contentHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.slate[900],
        marginBottom: SPACING.sm,
    },
    contentText: {
        fontSize: 15,
        color: COLORS.slate[700],
        lineHeight: 24,
    },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    taskText: {
        flex: 1,
        fontSize: 15,
        color: COLORS.slate[700],
        lineHeight: 22,
    },
    tipsBlock: {
        backgroundColor: COLORS.warningLight,
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.warning,
        marginBottom: 0,
    },
    tipsText: {
        fontSize: 14,
        color: COLORS.slate[800],
        lineHeight: 22,
    },

    // Notes
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.slate[900],
    },
    notesList: {
        gap: SPACING.md,
        marginBottom: SPACING.md,
    },
    noteItem: {
        backgroundColor: COLORS.slate[50],
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.slate[200],
    },
    noteContent: {
        fontSize: 14,
        color: COLORS.slate[800],
        marginBottom: SPACING.xs,
    },
    noteDate: {
        fontSize: 12,
        color: COLORS.slate[500],
    },
    noteInput: {
        gap: SPACING.md,
    },
    noteTextArea: {
        borderWidth: 1,
        borderColor: COLORS.slate[300],
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        minHeight: 80,
    },
    addNoteButton: {
        backgroundColor: COLORS.primary[600],
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        alignItems: 'center',
    },
    addNoteButtonDisabled: {
        opacity: 0.5,
    },
    addNoteButtonText: {
        color: COLORS.white,
        fontWeight: '600',
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        ...SHADOWS.lg,
    },
    fabIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

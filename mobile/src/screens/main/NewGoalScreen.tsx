/**
 * New Goal screen - multi-step goal creation wizard.
 * Mirrors the Next.js goal/new page with 4 steps:
 * 1. Goal Title, 2. Duration, 3. Focus Areas, 4. AI Options.
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Platform,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { goalsAPI } from '../../lib/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type NewGoalScreenProps = NativeStackScreenProps<any, any>;

export default function NewGoalScreen({ navigation }: NewGoalScreenProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form data
    const [title, setTitle] = useState('');
    const [totalDays, setTotalDays] = useState(90);
    const [startDate, setStartDate] = useState('');
    const [useAI, setUseAI] = useState(false);
    const [focuses, setFocuses] = useState(['dsa', 'system_design', 'genai']);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await goalsAPI.create({
                title,
                total_days: totalDays,
                start_date: startDate || undefined,
                focuses,
                use_ai: useAI,
            });
            navigation.navigate('CalendarView', { goalId: response.id });
        } catch (error) {
            console.error('Failed to create goal:', error);
            Alert.alert('Error', 'Failed to create goal. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const canProceed = () => {
        if (step === 1) return title.length > 0;
        if (step === 2) return totalDays >= 1 && totalDays <= 365;
        if (step === 3) return focuses.length > 0;
        return true;
    };

    const toggleFocus = (focus: string) => {
        if (focuses.includes(focus)) {
            setFocuses(focuses.filter((f) => f !== focus));
        } else {
            setFocuses([...focuses, focus]);
        }
    };

    const focusItems = [
        { id: 'dsa', name: 'Data Structures & Algorithms', desc: 'Coding problems and patterns', icon: 'code-slash' as const },
        { id: 'system_design', name: 'System Design', desc: 'Architecture and scalability', icon: 'git-network-outline' as const },
        { id: 'genai', name: 'Generative AI', desc: 'LLMs and AI concepts', icon: 'sparkles' as const },
    ];

    return (
        <LinearGradient
            colors={['#0284c7', '#0ea5e9', '#2563eb']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Create Your Goal</Text>
                    <Text style={styles.headerSubtitle}>Let's design your personalized learning journey</Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        {[1, 2, 3, 4].map((s) => (
                            <View
                                key={s}
                                style={[
                                    styles.progressSegment,
                                    s <= step ? styles.progressActive : styles.progressInactive,
                                ]}
                            />
                        ))}
                    </View>
                    <Text style={styles.progressText}>Step {step} of 4</Text>
                </View>

                {/* Card Container */}
                <View style={[styles.card, SHADOWS.xl]}>
                    {/* Step 1: Goal Title */}
                    {step === 1 && (
                        <View style={styles.stepContent}>
                            <View style={styles.stepHeader}>
                                <LinearGradient colors={COLORS.gradients.primary} style={styles.stepIcon}>
                                    <Ionicons name="flag" size={28} color={COLORS.white} />
                                </LinearGradient>
                                <Text style={styles.stepTitle}>What's your goal?</Text>
                                <Text style={styles.stepSubtitle}>Give your learning journey a clear, motivating title</Text>
                            </View>
                            <TextInput
                                style={styles.titleInput}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="e.g., AI Architect Interview Preparation"
                                placeholderTextColor={COLORS.slate[400]}
                                autoFocus
                            />
                            {title.length > 0 && (
                                <Text style={styles.feedbackText}>
                                    Great! "{title}" sounds like an exciting goal!
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Step 2: Duration */}
                    {step === 2 && (
                        <View style={styles.stepContent}>
                            <View style={styles.stepHeader}>
                                <LinearGradient colors={COLORS.gradients.orange} style={styles.stepIcon}>
                                    <Ionicons name="calendar" size={28} color={COLORS.white} />
                                </LinearGradient>
                                <Text style={styles.stepTitle}>How many days?</Text>
                                <Text style={styles.stepSubtitle}>Choose a duration (we recommend 90 days for deep learning)</Text>
                            </View>

                            <View style={styles.sliderContainer}>
                                <View style={styles.sliderRow}>
                                    <View style={styles.sliderTrack}>
                                        <View
                                            style={[
                                                styles.sliderFill,
                                                { width: `${((totalDays - 7) / (365 - 7)) * 100}%` },
                                            ]}
                                        />
                                        <TextInput
                                            style={styles.daysInput}
                                            value={String(totalDays)}
                                            onChangeText={(text) => {
                                                const num = parseInt(text);
                                                if (!isNaN(num) && num >= 1 && num <= 365) {
                                                    setTotalDays(num);
                                                }
                                            }}
                                            keyboardType="number-pad"
                                            selectTextOnFocus
                                        />
                                    </View>
                                    <Text style={styles.daysValue}>{totalDays}</Text>
                                </View>

                                <View style={styles.presetRow}>
                                    {[30, 90, 180].map((days) => (
                                        <TouchableOpacity
                                            key={days}
                                            onPress={() => setTotalDays(days)}
                                            style={[
                                                styles.presetButton,
                                                totalDays === days && styles.presetButtonActive,
                                            ]}
                                            activeOpacity={0.7}
                                        >
                                            <Text
                                                style={[
                                                    styles.presetText,
                                                    totalDays === days && styles.presetTextActive,
                                                ]}
                                            >
                                                {days} days
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Step 3: Focus Areas */}
                    {step === 3 && (
                        <View style={styles.stepContent}>
                            <View style={styles.stepHeader}>
                                <LinearGradient colors={COLORS.gradients.purple} style={styles.stepIcon}>
                                    <Ionicons name="checkmark-circle" size={28} color={COLORS.white} />
                                </LinearGradient>
                                <Text style={styles.stepTitle}>What to focus on?</Text>
                                <Text style={styles.stepSubtitle}>Select the areas you want to master</Text>
                            </View>

                            <View style={styles.focusList}>
                                {focusItems.map((focus) => {
                                    const isSelected = focuses.includes(focus.id);
                                    return (
                                        <TouchableOpacity
                                            key={focus.id}
                                            onPress={() => toggleFocus(focus.id)}
                                            style={[
                                                styles.focusItem,
                                                isSelected && styles.focusItemSelected,
                                            ]}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.focusRow}>
                                                <View
                                                    style={[
                                                        styles.focusCheckbox,
                                                        isSelected && styles.focusCheckboxSelected,
                                                    ]}
                                                >
                                                    {isSelected && (
                                                        <Ionicons name="checkmark" size={14} color={COLORS.white} />
                                                    )}
                                                </View>
                                                <View style={styles.focusInfo}>
                                                    <Text style={styles.focusName}>{focus.name}</Text>
                                                    <Text style={styles.focusDesc}>{focus.desc}</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* Step 4: AI Options */}
                    {step === 4 && (
                        <View style={styles.stepContent}>
                            <View style={styles.stepHeader}>
                                <LinearGradient colors={COLORS.gradients.pink} style={styles.stepIcon}>
                                    <Ionicons name="sparkles" size={28} color={COLORS.white} />
                                </LinearGradient>
                                <Text style={styles.stepTitle}>Use AI generation?</Text>
                                <Text style={styles.stepSubtitle}>
                                    Enhance your plan with AI-powered content (requires API key)
                                </Text>
                            </View>

                            <View style={styles.aiOptions}>
                                <TouchableOpacity
                                    onPress={() => setUseAI(false)}
                                    style={[styles.aiOption, !useAI && styles.aiOptionSelected]}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.aiOptionTitle}>Standard Plan</Text>
                                    <Text style={styles.aiOptionDesc}>
                                        Curated content with consistent quality, always available
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setUseAI(true)}
                                    style={[styles.aiOption, useAI && styles.aiOptionSelected]}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.aiOptionHeader}>
                                        <Text style={styles.aiOptionTitle}>AI-Enhanced Plan</Text>
                                        <View style={styles.premiumBadge}>
                                            <Text style={styles.premiumBadgeText}>Premium</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.aiOptionDesc}>
                                        Personalized content tailored to your goal using AI
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Summary */}
                            <View style={styles.summary}>
                                <Text style={styles.summaryTitle}>Summary:</Text>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Goal:</Text>
                                    <Text style={styles.summaryValue} numberOfLines={1}>{title}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Duration:</Text>
                                    <Text style={styles.summaryValue}>{totalDays} days</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Focus Areas:</Text>
                                    <Text style={styles.summaryValue}>{focuses.length} selected</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Generation:</Text>
                                    <Text style={styles.summaryValue}>{useAI ? 'AI-Enhanced' : 'Standard'}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Navigation Buttons */}
                    <View style={styles.navRow}>
                        {step > 1 ? (
                            <TouchableOpacity
                                onPress={() => setStep(step - 1)}
                                style={styles.navBack}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="arrow-back" size={18} color={COLORS.slate[700]} />
                                <Text style={styles.navBackText}>Back</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={styles.navCancel}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.navCancelText}>Cancel</Text>
                            </TouchableOpacity>
                        )}

                        {step < 4 ? (
                            <TouchableOpacity
                                onPress={() => setStep(step + 1)}
                                disabled={!canProceed()}
                                style={[styles.navNext, !canProceed() && styles.navNextDisabled]}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.navNextText}>Continue</Text>
                                <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={loading || !canProceed()}
                                style={[styles.navNext, (loading || !canProceed()) && styles.navNextDisabled]}
                                activeOpacity={0.85}
                            >
                                {loading ? (
                                    <ActivityIndicator color={COLORS.white} size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.navNextText}>Create Goal</Text>
                                        <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SPACING.xl,
        paddingTop: Platform.OS === 'web' ? SPACING['4xl'] : SPACING['6xl'],
        paddingBottom: SPACING['4xl'],
        justifyContent: 'center',
    },

    // Header
    header: {
        alignItems: 'center',
        marginBottom: SPACING['2xl'],
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.white,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    headerSubtitle: {
        fontSize: 15,
        color: COLORS.primary[200],
        textAlign: 'center',
    },

    // Progress
    progressContainer: {
        marginBottom: SPACING['2xl'],
    },
    progressBar: {
        flexDirection: 'row',
        gap: SPACING.xs,
        marginBottom: SPACING.sm,
    },
    progressSegment: {
        flex: 1,
        height: 6,
        borderRadius: 3,
    },
    progressActive: {
        backgroundColor: COLORS.white,
    },
    progressInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    progressText: {
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 13,
    },

    // Card
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING['3xl'],
        borderWidth: 1,
        borderColor: COLORS.slate[100],
    },

    // Step Content
    stepContent: {
        gap: SPACING.xl,
    },
    stepHeader: {
        alignItems: 'center',
        gap: SPACING.sm,
    },
    stepIcon: {
        width: 56,
        height: 56,
        borderRadius: RADIUS.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.slate[900],
        textAlign: 'center',
    },
    stepSubtitle: {
        fontSize: 14,
        color: COLORS.slate[600],
        textAlign: 'center',
    },

    // Step 1
    titleInput: {
        borderWidth: 2,
        borderColor: COLORS.slate[200],
        borderRadius: RADIUS.lg,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        fontSize: 16,
        color: COLORS.slate[900],
    },
    feedbackText: {
        fontSize: 13,
        color: COLORS.slate[500],
    },

    // Step 2
    sliderContainer: {
        gap: SPACING.xl,
    },
    sliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.lg,
    },
    sliderTrack: {
        flex: 1,
        height: 8,
        backgroundColor: COLORS.slate[200],
        borderRadius: 4,
        overflow: 'hidden',
    },
    sliderFill: {
        height: '100%',
        backgroundColor: COLORS.primary[500],
        borderRadius: 4,
    },
    daysInput: {
        display: 'none',
    },
    daysValue: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.primary[600],
        minWidth: 60,
        textAlign: 'right',
    },
    presetRow: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    presetButton: {
        flex: 1,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 2,
        borderColor: COLORS.slate[200],
        alignItems: 'center',
    },
    presetButtonActive: {
        borderColor: COLORS.primary[500],
        backgroundColor: COLORS.primary[50],
    },
    presetText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.slate[700],
    },
    presetTextActive: {
        color: COLORS.primary[700],
    },

    // Step 3
    focusList: {
        gap: SPACING.md,
    },
    focusItem: {
        borderWidth: 2,
        borderColor: COLORS.slate[200],
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
    },
    focusItemSelected: {
        borderColor: COLORS.primary[500],
        backgroundColor: COLORS.primary[50],
    },
    focusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    focusCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.slate[300],
        alignItems: 'center',
        justifyContent: 'center',
    },
    focusCheckboxSelected: {
        borderColor: COLORS.primary[500],
        backgroundColor: COLORS.primary[500],
    },
    focusInfo: {
        flex: 1,
    },
    focusName: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.slate[900],
    },
    focusDesc: {
        fontSize: 13,
        color: COLORS.slate[600],
    },

    // Step 4
    aiOptions: {
        gap: SPACING.md,
    },
    aiOption: {
        borderWidth: 2,
        borderColor: COLORS.slate[200],
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
    },
    aiOptionSelected: {
        borderColor: COLORS.primary[500],
        backgroundColor: COLORS.primary[50],
    },
    aiOptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.xs,
    },
    aiOptionTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.slate[900],
        marginBottom: SPACING.xs,
    },
    aiOptionDesc: {
        fontSize: 13,
        color: COLORS.slate[600],
        lineHeight: 20,
    },
    premiumBadge: {
        backgroundColor: COLORS.primary[100],
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.primary[200],
    },
    premiumBadgeText: {
        color: COLORS.primary[700],
        fontSize: 11,
        fontWeight: '600',
    },

    // Summary
    summary: {
        backgroundColor: COLORS.slate[50],
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
        gap: SPACING.sm,
    },
    summaryTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.slate[900],
        marginBottom: SPACING.xs,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryLabel: {
        fontSize: 13,
        color: COLORS.slate[600],
    },
    summaryValue: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.slate[900],
        maxWidth: '60%',
    },

    // Navigation
    navRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING['2xl'],
        paddingTop: SPACING.xl,
        borderTopWidth: 1,
        borderTopColor: COLORS.slate[200],
    },
    navBack: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        borderWidth: 2,
        borderColor: COLORS.slate[200],
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.lg,
    },
    navBackText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.slate[700],
    },
    navCancel: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
    },
    navCancelText: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.slate[600],
    },
    navNext: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        backgroundColor: COLORS.primary[600],
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: RADIUS.lg,
    },
    navNextDisabled: {
        opacity: 0.5,
    },
    navNextText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '600',
    },
});

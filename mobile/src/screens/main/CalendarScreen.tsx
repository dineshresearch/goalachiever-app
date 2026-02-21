/**
 * Calendar screen - shows a month view of goal progress days.
 * Mirrors the Next.js calendar page.
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type CalendarScreenProps = NativeStackScreenProps<any, any>;

export default function CalendarScreen({ navigation, route }: CalendarScreenProps) {
    const goalId = route.params?.goalId;
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!goalId) {
            navigation.goBack();
            return;
        }
        // TODO: Load goal and day plans
        setLoading(false);
    }, [goalId]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        return { firstDay, lastDay, daysCount: lastDay.getDate() };
    };

    const { firstDay, daysCount } = getDaysInMonth(currentDate);
    const startDayOfWeek = firstDay.getDay();

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary[600]} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, SHADOWS.sm]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.slate[700]} />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <LinearGradient
                            colors={COLORS.gradients.primary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.headerLogo}
                        >
                            <Ionicons name="flag" size={18} color={COLORS.white} />
                        </LinearGradient>
                        <View>
                            <Text style={styles.headerTitle}>Goal Calendar</Text>
                            <Text style={styles.headerSubtitle}>Track your daily progress</Text>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Calendar Card */}
                <View style={[styles.calendarCard, SHADOWS.lg]}>
                    {/* Calendar Header */}
                    <View style={styles.calendarHeader}>
                        <Text style={styles.monthName}>{monthName}</Text>
                        <View style={styles.navButtons}>
                            <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
                                <Ionicons name="chevron-back" size={20} color={COLORS.slate[700]} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
                                <Ionicons name="chevron-forward" size={20} color={COLORS.slate[700]} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Days of Week */}
                    <View style={styles.daysOfWeekRow}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <View key={day} style={styles.dayOfWeekCell}>
                                <Text style={styles.dayOfWeekText}>{day}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Calendar Grid */}
                    <View style={styles.calendarGrid}>
                        {/* Empty cells before month starts */}
                        {Array.from({ length: startDayOfWeek }).map((_, i) => (
                            <View key={`empty-${i}`} style={styles.dayCell} />
                        ))}

                        {/* Actual days */}
                        {Array.from({ length: daysCount }).map((_, i) => {
                            const dayNumber = i + 1;
                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
                            const today = new Date();
                            const isToday =
                                date.getDate() === today.getDate() &&
                                date.getMonth() === today.getMonth() &&
                                date.getFullYear() === today.getFullYear();

                            // TODO: Get actual completion status from backend
                            const isCompleted = Math.random() > 0.7;
                            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;

                            return (
                                <TouchableOpacity
                                    key={dayNumber}
                                    style={[
                                        styles.dayCell,
                                        isCompleted && styles.dayCellCompleted,
                                        !isCompleted && styles.dayCellPending,
                                        isToday && styles.dayCellToday,
                                    ]}
                                    onPress={() => navigation.navigate('DayDetail', { date: dateStr, goalId })}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>{dayNumber}</Text>
                                    {isCompleted && (
                                        <Ionicons name="checkmark-circle" size={12} color={COLORS.success} style={styles.dayIcon} />
                                    )}
                                    {!isCompleted && isToday && (
                                        <Ionicons name="ellipse-outline" size={12} color={COLORS.primary[600]} style={styles.dayIcon} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Legend */}
                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: COLORS.successLight, borderColor: 'rgba(16, 185, 129, 0.3)' }]} />
                            <Text style={styles.legendText}>Completed</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: COLORS.slate[50], borderColor: COLORS.slate[200] }]} />
                            <Text style={styles.legendText}>Pending</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { borderColor: COLORS.primary[600], borderWidth: 2 }]} />
                            <Text style={styles.legendText}>Today</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Below Calendar */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, SHADOWS.sm]}>
                        <Text style={[styles.statValue, { color: COLORS.primary[600] }]}>0</Text>
                        <Text style={styles.statLabel}>Days Completed</Text>
                    </View>
                    <View style={[styles.statCard, SHADOWS.sm]}>
                        <Text style={[styles.statValue, { color: '#f97316' }]}>90</Text>
                        <Text style={styles.statLabel}>Total Days</Text>
                    </View>
                    <View style={[styles.statCard, SHADOWS.sm]}>
                        <Text style={[styles.statValue, { color: COLORS.success }]}>0%</Text>
                        <Text style={styles.statLabel}>Progress</Text>
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
    headerLeft: {
        gap: SPACING.md,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        marginBottom: SPACING.sm,
    },
    backText: {
        fontSize: 15,
        color: COLORS.slate[700],
        fontWeight: '500',
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    headerLogo: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.slate[900],
    },
    headerSubtitle: {
        fontSize: 13,
        color: COLORS.slate[600],
    },

    // Calendar Card
    calendarCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
        marginHorizontal: SPACING.xl,
        marginTop: SPACING['2xl'],
        borderWidth: 1,
        borderColor: COLORS.slate[100],
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    monthName: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.slate[900],
    },
    navButtons: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    navButton: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.md,
        borderWidth: 2,
        borderColor: COLORS.slate[200],
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Days of Week
    daysOfWeekRow: {
        flexDirection: 'row',
        marginBottom: SPACING.sm,
    },
    dayOfWeekCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    dayOfWeekText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.slate[600],
    },

    // Calendar Grid
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
    },
    dayCellCompleted: {
        backgroundColor: COLORS.successLight,
        borderRadius: RADIUS.lg,
        borderWidth: 1.5,
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    dayCellPending: {
        backgroundColor: COLORS.slate[50],
        borderRadius: RADIUS.lg,
        borderWidth: 1.5,
        borderColor: COLORS.slate[200],
    },
    dayCellToday: {
        borderWidth: 2,
        borderColor: COLORS.primary[600],
    },
    dayNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.slate[800],
    },
    dayNumberToday: {
        color: COLORS.primary[600],
        fontWeight: '700',
    },
    dayIcon: {
        position: 'absolute',
        bottom: 2,
    },

    // Legend
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SPACING.xl,
        marginTop: SPACING.xl,
        paddingTop: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.slate[200],
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    legendDot: {
        width: 14,
        height: 14,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    legendText: {
        fontSize: 12,
        color: COLORS.slate[600],
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: SPACING.md,
        paddingHorizontal: SPACING.xl,
        marginTop: SPACING.xl,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.slate[100],
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 11,
        color: COLORS.slate[600],
        fontWeight: '500',
    },
});

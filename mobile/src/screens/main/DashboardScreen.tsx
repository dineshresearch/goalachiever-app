/**
 * Dashboard screen - shows goals list, stats, and navigation.
 * Mirrors the Next.js dashboard page.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { goalsAPI, getUserData, clearAuthToken } from '../../lib/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type DashboardScreenProps = NativeStackScreenProps<any, any>;

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
    const [user, setUser] = useState<any>(null);
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            const userData = await getUserData();
            if (!userData) {
                navigation.getParent()?.getParent()?.reset({
                    index: 0,
                    routes: [{ name: 'Auth' }],
                });
                return;
            }
            setUser(userData);

            const goalsData = await goalsAPI.list();
            setGoals(goalsData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleLogout = async () => {
        await clearAuthToken();
        navigation.getParent()?.getParent()?.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
        });
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

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
                    <LinearGradient
                        colors={COLORS.gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.headerLogo}
                    >
                        <Ionicons name="flag" size={22} color={COLORS.white} />
                    </LinearGradient>
                    <Text style={styles.headerTitle}>Goal Achiever</Text>
                </View>
                <View style={styles.headerRight}>
                    <View style={styles.userInfo}>
                        <Text style={styles.welcomeText}>Welcome back,</Text>
                        <Text style={styles.userEmail} numberOfLines={1}>{user?.email || 'User'}</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Chat' as never)} style={styles.headerIconBtn}>
                        <Ionicons name="chatbubble-ellipses-outline" size={22} color={COLORS.primary[600]} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Settings' as never)} style={styles.headerIconBtn}>
                        <Ionicons name="settings-outline" size={22} color={COLORS.slate[600]} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary[600]]} />
                }
            >
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.pageTitle}>
                        Your Learning <Text style={styles.pageTitleAccent}>Dashboard</Text>
                    </Text>
                    <Text style={styles.pageSubtitle}>
                        Track your progress and stay on top of your goals
                    </Text>
                </View>

                {/* Goals Grid */}
                {goals.length === 0 ? (
                    <View style={[styles.emptyCard, SHADOWS.lg]}>
                        <LinearGradient
                            colors={[COLORS.primary[100], COLORS.primary[200]]}
                            style={styles.emptyIcon}
                        >
                            <Ionicons name="flag" size={40} color={COLORS.primary[600]} />
                        </LinearGradient>
                        <Text style={styles.emptyTitle}>No Goals Yet</Text>
                        <Text style={styles.emptyText}>
                            Start your learning journey by creating your first goal. We'll generate a personalized daily plan for you!
                        </Text>
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => navigation.navigate('NewGoal')}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="add-circle" size={20} color={COLORS.white} />
                            <Text style={styles.createButtonText}>Create Your First Goal</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View style={styles.goalsHeader}>
                            <Text style={styles.goalsTitle}>Your Goals</Text>
                            <TouchableOpacity
                                style={styles.newGoalButton}
                                onPress={() => navigation.navigate('NewGoal')}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="add" size={18} color={COLORS.white} />
                                <Text style={styles.newGoalButtonText}>New Goal</Text>
                            </TouchableOpacity>
                        </View>

                        {goals.map((goal) => (
                            <TouchableOpacity
                                key={goal.id}
                                style={[styles.goalCard, SHADOWS.md]}
                                onPress={() => navigation.navigate('CalendarView', { goalId: goal.id })}
                                activeOpacity={0.85}
                            >
                                <View style={styles.goalCardTop}>
                                    <LinearGradient
                                        colors={COLORS.gradients.primary}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.goalIcon}
                                    >
                                        <Ionicons name="flag" size={22} color={COLORS.white} />
                                    </LinearGradient>
                                    <View style={styles.goalBadge}>
                                        <Text style={styles.goalBadgeText}>{goal.total_days} days</Text>
                                    </View>
                                </View>

                                <View style={styles.goalInfo}>
                                    <Text style={styles.goalTitle} numberOfLines={2}>{goal.title}</Text>
                                    <Text style={styles.goalDate}>
                                        Started {new Date(goal.start_date).toLocaleDateString()}
                                    </Text>
                                </View>

                                <View style={styles.goalAction}>
                                    <Ionicons name="calendar-outline" size={16} color={COLORS.primary[600]} />
                                    <Text style={styles.goalActionText}>View Calendar</Text>
                                    <Ionicons name="chevron-forward" size={16} color={COLORS.primary[600]} />
                                </View>
                            </TouchableOpacity>
                        ))}

                        {/* Stats Section */}
                        <View style={styles.statsRow}>
                            <View style={[styles.statCard, SHADOWS.sm]}>
                                <View style={[styles.statIcon, { backgroundColor: COLORS.primary[100] }]}>
                                    <Ionicons name="flag" size={22} color={COLORS.primary[600]} />
                                </View>
                                <Text style={styles.statValue}>{goals.length}</Text>
                                <Text style={styles.statLabel}>Active Goals</Text>
                            </View>

                            <View style={[styles.statCard, SHADOWS.sm]}>
                                <View style={[styles.statIcon, { backgroundColor: COLORS.successLight }]}>
                                    <Ionicons name="trending-up" size={22} color={COLORS.success} />
                                </View>
                                <Text style={styles.statValue}>0%</Text>
                                <Text style={styles.statLabel}>Completion</Text>
                            </View>

                            <View style={[styles.statCard, SHADOWS.sm]}>
                                <View style={[styles.statIcon, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                                    <Ionicons name="calendar" size={22} color="#f97316" />
                                </View>
                                <Text style={styles.statValue}>0</Text>
                                <Text style={styles.statLabel}>Completed</Text>
                            </View>
                        </View>
                    </>
                )}

                {/* Bottom spacing */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Chat Button */}
            <TouchableOpacity
                style={[styles.fab, SHADOWS.lg]}
                onPress={() => navigation.navigate('Chat' as never)}
                activeOpacity={0.85}
            >
                <LinearGradient
                    colors={COLORS.gradients.purple}
                    style={styles.fabGradient}
                >
                    <Ionicons name="chatbubbles" size={26} color={COLORS.white} />
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
    scrollView: {
        flex: 1,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        paddingTop: Platform.OS === 'web' ? SPACING.lg : SPACING['5xl'],
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.xl,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate[200],
    },
    headerLeft: {
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
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.slate[900],
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    userInfo: {
        alignItems: 'flex-end',
        maxWidth: 120,
    },
    welcomeText: {
        fontSize: 11,
        color: COLORS.slate[600],
    },
    userEmail: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.slate[900],
    },
    logoutButton: {
        padding: SPACING.sm,
    },
    headerIconBtn: {
        padding: SPACING.sm,
    },

    // Floating action button
    fab: {
        position: 'absolute',
        bottom: SPACING['2xl'],
        right: SPACING.xl,
        zIndex: 100,
    },
    fabGradient: {
        width: 58,
        height: 58,
        borderRadius: 29,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Welcome
    welcomeSection: {
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING['3xl'],
        paddingBottom: SPACING.xl,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.slate[900],
        marginBottom: SPACING.sm,
    },
    pageTitleAccent: {
        color: COLORS.primary[600],
    },
    pageSubtitle: {
        fontSize: 16,
        color: COLORS.slate[600],
    },

    // Empty State
    emptyCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING['4xl'],
        marginHorizontal: SPACING.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.slate[100],
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
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
        marginBottom: SPACING['2xl'],
        maxWidth: 300,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.primary[600],
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING['3xl'],
        borderRadius: RADIUS.lg,
    },
    createButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },

    // Goals
    goalsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.lg,
    },
    goalsTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.slate[900],
    },
    newGoalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        backgroundColor: COLORS.primary[600],
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.lg,
    },
    newGoalButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
    },

    // Goal Card
    goalCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
        marginHorizontal: SPACING.xl,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.slate[100],
    },
    goalCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.lg,
    },
    goalIcon: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    goalBadge: {
        backgroundColor: COLORS.primary[100],
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.primary[200],
    },
    goalBadgeText: {
        color: COLORS.primary[700],
        fontSize: 12,
        fontWeight: '600',
    },
    goalInfo: {
        marginBottom: SPACING.lg,
    },
    goalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.slate[900],
        marginBottom: SPACING.xs,
    },
    goalDate: {
        fontSize: 13,
        color: COLORS.slate[600],
    },
    goalAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    goalActionText: {
        color: COLORS.primary[600],
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: SPACING.md,
        paddingHorizontal: SPACING.xl,
        marginTop: SPACING['2xl'],
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
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.slate[900],
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 11,
        color: COLORS.slate[600],
        fontWeight: '500',
    },
});

/**
 * Landing / Home screen - the first screen users see.
 * Mirrors the Next.js home page with hero, features, stats, and CTA.
 */
import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../../constants/theme';
import type { LandingScreenProps } from '../../navigation/types';

const { width } = Dimensions.get('window');

export default function LandingScreen({ navigation }: LandingScreenProps) {
    return (
        <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
            {/* Hero Section */}
            <LinearGradient
                colors={['#0284c7', '#0ea5e9', '#2563eb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroSection}
            >
                {/* Badge */}
                <View style={styles.badgeContainer}>
                    <View style={styles.badge}>
                        <Ionicons name="sparkles" size={14} color={COLORS.white} />
                        <Text style={styles.badgeText}>AI-Powered Learning Plans</Text>
                    </View>
                </View>

                {/* Heading */}
                <Text style={styles.heroTitle}>
                    Achieve Your{'\n'}
                    <Text style={styles.heroTitleAccent}>Learning Goals</Text>
                </Text>

                <Text style={styles.heroSubtitle}>
                    Master DSA, System Design, and Generative AI with personalized daily plans powered by artificial intelligence
                </Text>

                {/* CTA Buttons */}
                <View style={styles.ctaContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('Register')}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.primaryButtonText}>Get Started Free</Text>
                        <Ionicons name="arrow-forward" size={20} color={COLORS.primary[600]} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => navigation.navigate('Login')}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.secondaryButtonText}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Features Section */}
            <View style={styles.featuresSection}>
                <Text style={styles.sectionTitle}>
                    Everything You Need to{' '}
                    <Text style={styles.gradientText}>Succeed</Text>
                </Text>
                <Text style={styles.sectionSubtitle}>
                    Powerful features to accelerate your learning journey
                </Text>

                <View style={styles.featuresGrid}>
                    {/* Feature 1: Goal Tracking */}
                    <View style={[styles.featureCard, SHADOWS.lg]}>
                        <LinearGradient
                            colors={COLORS.gradients.primary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.featureIcon}
                        >
                            <Ionicons name="flag" size={28} color={COLORS.white} />
                        </LinearGradient>
                        <Text style={styles.featureTitle}>Goal Tracking</Text>
                        <Text style={styles.featureDescription}>
                            Set ambitious learning goals and track your progress day by day with beautiful visualizations
                        </Text>
                    </View>

                    {/* Feature 2: AI-Generated Plans */}
                    <View style={[styles.featureCard, SHADOWS.lg]}>
                        <LinearGradient
                            colors={COLORS.gradients.purple}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.featureIcon}
                        >
                            <Ionicons name="sparkles" size={28} color={COLORS.white} />
                        </LinearGradient>
                        <Text style={styles.featureTitle}>AI-Generated Plans</Text>
                        <Text style={styles.featureDescription}>
                            Get personalized daily content powered by advanced AI for DSA problems, system design, and GenAI topics
                        </Text>
                    </View>

                    {/* Feature 3: Smart Calendar */}
                    <View style={[styles.featureCard, SHADOWS.lg]}>
                        <LinearGradient
                            colors={COLORS.gradients.green}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.featureIcon}
                        >
                            <Ionicons name="calendar" size={28} color={COLORS.white} />
                        </LinearGradient>
                        <Text style={styles.featureTitle}>Smart Calendar</Text>
                        <Text style={styles.featureDescription}>
                            Navigate your learning journey with an intuitive calendar view showing progress and upcoming challenges
                        </Text>
                    </View>
                </View>

                {/* Stats Section */}
                <View style={[styles.statsCard, SHADOWS.lg]}>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>90+</Text>
                            <Text style={styles.statLabel}>Days of Content</Text>
                        </View>
                        <View style={[styles.statItem, styles.statDivider]}>
                            <Text style={styles.statNumber}>100%</Text>
                            <Text style={styles.statLabel}>AI-Powered</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>3</Text>
                            <Text style={styles.statLabel}>Focus Areas</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Bottom CTA Section */}
            <LinearGradient
                colors={['#0284c7', '#2563eb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bottomCTA}
            >
                <Text style={styles.bottomCTATitle}>Ready to Start Learning?</Text>
                <Text style={styles.bottomCTASubtitle}>
                    Join thousands of learners achieving their goals with AI-powered daily plans
                </Text>
                <TouchableOpacity
                    style={styles.bottomCTAButton}
                    onPress={() => navigation.navigate('Register')}
                    activeOpacity={0.85}
                >
                    <Text style={styles.bottomCTAButtonText}>Create Your First Goal</Text>
                    <Ionicons name="arrow-forward" size={18} color={COLORS.primary[600]} />
                </TouchableOpacity>
            </LinearGradient>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerBrand}>Goal Achiever</Text>
                <Text style={styles.footerCopy}>© 2024 Goal Achiever. All rights reserved.</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },

    // Hero Section
    heroSection: {
        paddingTop: Platform.OS === 'web' ? 60 : 80,
        paddingBottom: 50,
        paddingHorizontal: SPACING.xl,
        alignItems: 'center',
    },
    badgeContainer: {
        alignItems: 'center',
        marginBottom: SPACING['3xl'],
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: '600',
    },
    heroTitle: {
        fontSize: Platform.OS === 'web' ? 48 : 40,
        fontWeight: '800',
        color: COLORS.white,
        textAlign: 'center',
        lineHeight: Platform.OS === 'web' ? 56 : 48,
        marginBottom: SPACING.lg,
    },
    heroTitleAccent: {
        color: '#fbbf24',
    },
    heroSubtitle: {
        fontSize: 17,
        color: 'rgba(186, 230, 253, 1)',
        textAlign: 'center',
        lineHeight: 26,
        maxWidth: 500,
        marginBottom: SPACING['3xl'],
        paddingHorizontal: SPACING.sm,
    },
    ctaContainer: {
        width: '100%',
        maxWidth: 400,
        gap: SPACING.md,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.white,
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING['3xl'],
        borderRadius: RADIUS.lg,
        ...SHADOWS.xl,
    },
    primaryButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.primary[600],
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING['3xl'],
        borderRadius: RADIUS.lg,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    secondaryButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.white,
    },

    // Features Section
    featuresSection: {
        paddingVertical: SPACING['5xl'],
        paddingHorizontal: SPACING.xl,
        backgroundColor: COLORS.slate[50],
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.slate[900],
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    gradientText: {
        color: COLORS.primary[600],
    },
    sectionSubtitle: {
        fontSize: 16,
        color: COLORS.slate[600],
        textAlign: 'center',
        marginBottom: SPACING['4xl'],
    },
    featuresGrid: {
        gap: SPACING.lg,
    },
    featureCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING['3xl'],
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.slate[100],
    },
    featureIcon: {
        width: 56,
        height: 56,
        borderRadius: RADIUS.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    featureTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.slate[900],
        marginBottom: SPACING.sm,
    },
    featureDescription: {
        fontSize: 14,
        color: COLORS.slate[600],
        textAlign: 'center',
        lineHeight: 22,
    },

    // Stats
    statsCard: {
        marginTop: SPACING['3xl'],
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING['3xl'],
        borderWidth: 1,
        borderColor: COLORS.slate[100],
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: COLORS.slate[200],
    },
    statNumber: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.primary[600],
        marginBottom: SPACING.xs,
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.slate[600],
    },

    // Bottom CTA
    bottomCTA: {
        paddingVertical: SPACING['5xl'],
        paddingHorizontal: SPACING.xl,
        alignItems: 'center',
    },
    bottomCTATitle: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.white,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    bottomCTASubtitle: {
        fontSize: 16,
        color: COLORS.primary[200],
        textAlign: 'center',
        marginBottom: SPACING['3xl'],
        maxWidth: 400,
        lineHeight: 24,
    },
    bottomCTAButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.white,
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING['3xl'],
        borderRadius: RADIUS.lg,
        ...SHADOWS.xl,
    },
    bottomCTAButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary[600],
    },

    // Footer
    footer: {
        backgroundColor: COLORS.slate[900],
        paddingVertical: SPACING['4xl'],
        paddingHorizontal: SPACING.xl,
        alignItems: 'center',
    },
    footerBrand: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.white,
        marginBottom: SPACING.sm,
    },
    footerCopy: {
        fontSize: 13,
        color: COLORS.slate[400],
    },
});

/**
 * Login screen - mirrors the Next.js login page.
 * Uses AsyncStorage-based API client for auth token management.
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { authAPI, setAuthToken, saveUserData } from '../../lib/api';
import type { LoginScreenProps } from '../../navigation/types';

export default function LoginScreen({ navigation }: LoginScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [secureText, setSecureText] = useState(true);

    const handleSubmit = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login(email, password);
            await setAuthToken(response.access_token);
            await saveUserData(response.user);

            // Navigate to main app (handled by root navigator auth state)
            // The parent navigator will detect the token and switch
            navigation.getParent()?.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
        } catch (err: any) {
            const message = err.response?.data?.detail || 'Login failed. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>
                        Welcome <Text style={styles.titleAccent}>Back</Text>
                    </Text>
                    <Text style={styles.subtitle}>Sign in to continue your learning journey</Text>
                </View>

                {/* Form Card */}
                <View style={[styles.card, SHADOWS.lg]}>
                    {/* Email Field */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color={COLORS.slate[400]} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="you@example.com"
                                placeholderTextColor={COLORS.slate[400]}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                returnKeyType="next"
                            />
                        </View>
                    </View>

                    {/* Password Field */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.slate[400]} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                placeholderTextColor={COLORS.slate[400]}
                                secureTextEntry={secureText}
                                autoComplete="password"
                                returnKeyType="done"
                                onSubmitEditing={handleSubmit}
                            />
                            <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeButton}>
                                <Ionicons
                                    name={secureText ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={COLORS.slate[400]}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Error Message */}
                    {error ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} size="small" />
                        ) : (
                            <>
                                <Ionicons name="log-in-outline" size={20} color={COLORS.white} />
                                <Text style={styles.submitButtonText}>Sign In</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>Don't have an account?</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => navigation.navigate('Register')}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.registerButtonText}>Create Account</Text>
                    </TouchableOpacity>
                </View>

                {/* Back to Home */}
                <TouchableOpacity
                    style={styles.backLink}
                    onPress={() => navigation.navigate('Landing')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.backLinkText}>← Back to Home</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.slate[50],
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING['4xl'],
    },

    // Header
    header: {
        alignItems: 'center',
        marginBottom: SPACING['3xl'],
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.slate[900],
        marginBottom: SPACING.sm,
    },
    titleAccent: {
        color: COLORS.primary[600],
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.slate[600],
    },

    // Card
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING['3xl'],
        borderWidth: 1,
        borderColor: COLORS.slate[100],
    },

    // Fields
    fieldContainer: {
        marginBottom: SPACING.xl,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.slate[700],
        marginBottom: SPACING.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.slate[200],
        borderRadius: RADIUS.lg,
        backgroundColor: COLORS.white,
    },
    inputIcon: {
        paddingLeft: SPACING.md,
    },
    input: {
        flex: 1,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
        fontSize: 15,
        color: COLORS.slate[900],
    },
    eyeButton: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
    },

    // Error
    errorBox: {
        backgroundColor: COLORS.errorLight,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 13,
        fontWeight: '500',
    },

    // Submit
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.primary[600],
        paddingVertical: SPACING.lg,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.xl,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: '700',
    },

    // Divider
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.slate[200],
    },
    dividerText: {
        paddingHorizontal: SPACING.lg,
        fontSize: 13,
        color: COLORS.slate[500],
    },

    // Register button
    registerButton: {
        borderWidth: 2,
        borderColor: COLORS.slate[200],
        borderRadius: RADIUS.lg,
        paddingVertical: SPACING.md,
        alignItems: 'center',
    },
    registerButtonText: {
        color: COLORS.slate[700],
        fontSize: 15,
        fontWeight: '600',
    },

    // Back link
    backLink: {
        alignItems: 'center',
        marginTop: SPACING['2xl'],
    },
    backLinkText: {
        color: COLORS.primary[600],
        fontSize: 15,
        fontWeight: '600',
    },
});

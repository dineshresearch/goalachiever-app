/**
 * Register screen - create account page.
 * Includes password validation requirements display.
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { authAPI, setAuthToken, saveUserData } from '../../lib/api';
import type { RegisterScreenProps } from '../../navigation/types';

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [secureText, setSecureText] = useState(true);
    const [secureConfirm, setSecureConfirm] = useState(true);

    const passwordRequirements = [
        { met: password.length >= 8, text: 'At least 8 characters' },
        { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
        { met: /[0-9]/.test(password), text: 'One number' },
    ];

    const handleSubmit = async () => {
        if (!email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const response = await authAPI.register(email, password);
            await setAuthToken(response.access_token);
            await saveUserData(response.user);

            // Navigate to Main app
            navigation.getParent()?.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
        } catch (err: any) {
            const message = err.response?.data?.detail || 'Registration failed. Please try again.';
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
                        Create Your <Text style={styles.titleAccent}>Account</Text>
                    </Text>
                    <Text style={styles.subtitle}>Start your learning journey today</Text>
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
                                autoComplete="new-password"
                                returnKeyType="next"
                            />
                            <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeButton}>
                                <Ionicons
                                    name={secureText ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={COLORS.slate[400]}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Password Requirements */}
                        {password.length > 0 && (
                            <View style={styles.requirements}>
                                {passwordRequirements.map((req, idx) => (
                                    <View key={idx} style={styles.requirementRow}>
                                        <Ionicons
                                            name={req.met ? 'checkmark-circle' : 'ellipse-outline'}
                                            size={16}
                                            color={req.met ? COLORS.success : COLORS.slate[300]}
                                        />
                                        <Text style={[styles.requirementText, req.met && styles.requirementMet]}>
                                            {req.text}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Confirm Password Field */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.slate[400]} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="••••••••"
                                placeholderTextColor={COLORS.slate[400]}
                                secureTextEntry={secureConfirm}
                                autoComplete="new-password"
                                returnKeyType="done"
                                onSubmitEditing={handleSubmit}
                            />
                            <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)} style={styles.eyeButton}>
                                <Ionicons
                                    name={secureConfirm ? 'eye-off-outline' : 'eye-outline'}
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
                                <Ionicons name="person-add-outline" size={20} color={COLORS.white} />
                                <Text style={styles.submitButtonText}>Create Account</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>Already have an account?</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => navigation.navigate('Login')}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.loginButtonText}>Sign In</Text>
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

    // Requirements
    requirements: {
        marginTop: SPACING.md,
        gap: SPACING.sm,
    },
    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    requirementText: {
        fontSize: 13,
        color: COLORS.slate[500],
    },
    requirementMet: {
        color: COLORS.success,
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

    // Login button
    loginButton: {
        borderWidth: 2,
        borderColor: COLORS.slate[200],
        borderRadius: RADIUS.lg,
        paddingVertical: SPACING.md,
        alignItems: 'center',
    },
    loginButtonText: {
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

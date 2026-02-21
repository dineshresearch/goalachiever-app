/**
 * Settings screen with daily notification configuration
 * and app preferences.
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    Switch,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import {
    isNotificationEnabled,
    scheduleDailyNotification,
    cancelDailyNotification,
    getNotificationTime,
} from '../../lib/notifications';
import { clearAuthToken, clearUserData } from '../../lib/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type SettingsScreenProps = NativeStackScreenProps<any, any>;

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
    const [notifEnabled, setNotifEnabled] = useState(false);
    const [notifHour, setNotifHour] = useState(9);
    const [notifMinute, setNotifMinute] = useState(0);
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const enabled = await isNotificationEnabled();
        const { hour, minute } = await getNotificationTime();
        setNotifEnabled(enabled);
        setNotifHour(hour);
        setNotifMinute(minute);
    };

    const toggleNotifications = async (value: boolean) => {
        if (value) {
            const success = await scheduleDailyNotification(notifHour, notifMinute);
            setNotifEnabled(success);
            if (success) {
                Alert.alert(
                    '🔔 Notifications Enabled',
                    `You'll receive a daily reminder at ${formatTime(notifHour, notifMinute)}.`
                );
            }
        } else {
            await cancelDailyNotification();
            setNotifEnabled(false);
        }
    };

    const updateTime = async (hour: number) => {
        setNotifHour(hour);
        setShowTimePicker(false);
        if (notifEnabled) {
            await scheduleDailyNotification(hour, 0);
        }
    };

    const formatTime = (h: number, m: number) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
    };

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await clearAuthToken();
                    await clearUserData();
                    navigation.getParent()?.reset({
                        index: 0,
                        routes: [{ name: 'Auth' }],
                    });
                },
            },
        ]);
    };

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
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Notifications Section */}
                <Text style={styles.sectionTitle}>Notifications</Text>
                <View style={[styles.card, SHADOWS.sm]}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.settingIcon, { backgroundColor: COLORS.primary[100] }]}>
                                <Ionicons name="notifications" size={20} color={COLORS.primary[600]} />
                            </View>
                            <View>
                                <Text style={styles.settingLabel}>Daily Reminders</Text>
                                <Text style={styles.settingDesc}>
                                    Get notified to study every day
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={notifEnabled}
                            onValueChange={toggleNotifications}
                            trackColor={{ false: COLORS.slate[300], true: COLORS.primary[400] }}
                            thumbColor={notifEnabled ? COLORS.primary[600] : COLORS.slate[100]}
                        />
                    </View>

                    {notifEnabled && (
                        <>
                            <View style={styles.divider} />
                            <TouchableOpacity
                                style={styles.settingRow}
                                onPress={() => setShowTimePicker(!showTimePicker)}
                            >
                                <View style={styles.settingLeft}>
                                    <View style={[styles.settingIcon, { backgroundColor: '#FFF3E0' }]}>
                                        <Ionicons name="time" size={20} color="#F57C00" />
                                    </View>
                                    <View>
                                        <Text style={styles.settingLabel}>Reminder Time</Text>
                                        <Text style={styles.settingDesc}>
                                            {formatTime(notifHour, notifMinute)}
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons
                                    name={showTimePicker ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color={COLORS.slate[400]}
                                />
                            </TouchableOpacity>

                            {showTimePicker && (
                                <View style={styles.timeGrid}>
                                    {HOURS.map((h) => (
                                        <TouchableOpacity
                                            key={h}
                                            style={[
                                                styles.timeItem,
                                                h === notifHour && styles.timeItemActive,
                                            ]}
                                            onPress={() => updateTime(h)}
                                        >
                                            <Text
                                                style={[
                                                    styles.timeItemText,
                                                    h === notifHour && styles.timeItemTextActive,
                                                ]}
                                            >
                                                {formatTime(h, 0)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </>
                    )}
                </View>

                {Platform.OS === 'web' && notifEnabled && (
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={18} color={COLORS.primary[600]} />
                        <Text style={styles.infoText}>
                            Push notifications only work on mobile devices. Use Expo Go for full notification support.
                        </Text>
                    </View>
                )}

                {/* About Section */}
                <Text style={styles.sectionTitle}>About</Text>
                <View style={[styles.card, SHADOWS.sm]}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.settingIcon, { backgroundColor: '#E8F5E9' }]}>
                                <Ionicons name="information-circle" size={20} color="#43A047" />
                            </View>
                            <View>
                                <Text style={styles.settingLabel}>Version</Text>
                                <Text style={styles.settingDesc}>1.0.0</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.settingIcon, { backgroundColor: '#E3F2FD' }]}>
                                <Ionicons name="logo-react" size={20} color="#1E88E5" />
                            </View>
                            <View>
                                <Text style={styles.settingLabel}>Built with</Text>
                                <Text style={styles.settingDesc}>Expo + FastAPI + Gemini AI</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Logout */}
                <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
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
        justifyContent: 'space-between',
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
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.slate[900],
    },

    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: SPACING['4xl'],
    },

    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.slate[500],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: SPACING.md,
        marginTop: SPACING.lg,
    },

    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.slate[100],
        overflow: 'hidden',
    },

    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.xl,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        flex: 1,
    },
    settingIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.slate[900],
    },
    settingDesc: {
        fontSize: 12,
        color: COLORS.slate[500],
        marginTop: 1,
    },

    divider: {
        height: 1,
        backgroundColor: COLORS.slate[100],
        marginHorizontal: SPACING.xl,
    },

    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: SPACING.lg,
        gap: SPACING.sm,
    },
    timeItem: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.slate[200],
        minWidth: 72,
        alignItems: 'center',
    },
    timeItemActive: {
        borderColor: COLORS.primary[500],
        backgroundColor: COLORS.primary[50],
    },
    timeItemText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.slate[600],
    },
    timeItemTextActive: {
        color: COLORS.primary[700],
        fontWeight: '700',
    },

    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        padding: SPACING.lg,
        backgroundColor: COLORS.primary[50],
        borderRadius: RADIUS.lg,
        marginTop: SPACING.md,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: COLORS.primary[700],
        lineHeight: 18,
    },

    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        marginTop: SPACING['3xl'],
        paddingVertical: SPACING.lg,
        borderRadius: RADIUS.xl,
        borderWidth: 2,
        borderColor: 'rgba(239,68,68,0.2)',
        backgroundColor: 'rgba(239,68,68,0.05)',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.error,
    },
});

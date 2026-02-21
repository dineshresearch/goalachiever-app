/**
 * Navigation type definitions for type-safe navigation in Goal Achiever.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Root stack (auth vs main app)
export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
};

// Auth stack screens
export type AuthStackParamList = {
    Landing: undefined;
    Login: undefined;
    Register: undefined;
};

// Main tab screens
export type MainTabParamList = {
    Dashboard: undefined;
    Calendar: { goalId?: string };
    Chat: { contextTopic?: string; sessionId?: string };
    NewGoal: undefined;
    Settings: undefined;
};

// Screens within dashboard or calendar that need their own stack
export type DashboardStackParamList = {
    DashboardHome: undefined;
    CalendarView: { goalId: string };
    DayDetail: { date: string; goalId?: string };
    Chat: { contextTopic?: string; sessionId?: string };
    Settings: undefined;
};

// Screen props
export type LandingScreenProps = NativeStackScreenProps<AuthStackParamList, 'Landing'>;
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;
export type DashboardScreenProps = NativeStackScreenProps<DashboardStackParamList, 'DashboardHome'>;
export type CalendarScreenProps = NativeStackScreenProps<DashboardStackParamList, 'CalendarView'>;
export type DayDetailScreenProps = NativeStackScreenProps<DashboardStackParamList, 'DayDetail'>;
export type NewGoalScreenProps = NativeStackScreenProps<MainTabParamList, 'NewGoal'>;

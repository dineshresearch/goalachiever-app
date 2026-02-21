/**
 * Main app navigator - Dashboard stack with full screen flow.
 * Uses a stack navigator for Dashboard -> Calendar -> DayDetail -> Chat flow,
 * plus NewGoal and Settings screens.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/main/DashboardScreen';
import CalendarScreen from '../screens/main/CalendarScreen';
import DayDetailScreen from '../screens/main/DayDetailScreen';
import NewGoalScreen from '../screens/main/NewGoalScreen';
import ChatScreen from '../screens/main/ChatScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="DashboardHome"
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="DashboardHome" component={DashboardScreen} />
            <Stack.Screen name="CalendarView" component={CalendarScreen} />
            <Stack.Screen name="DayDetail" component={DayDetailScreen} />
            <Stack.Screen
                name="NewGoal"
                component={NewGoalScreen}
                options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
    );
}

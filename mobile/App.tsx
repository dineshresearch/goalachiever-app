/**
 * Goal Achiever - Mobile App
 *
 * An Expo (React Native) mobile app for tracking learning goals
 * with AI-powered daily plans for DSA, System Design, and Generative AI.
 *
 * Supports: iOS, Android, and Web preview.
 */
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { initializeNotifications } from './src/lib/notifications';

export default function App() {
  useEffect(() => {
    initializeNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

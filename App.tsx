import 'react-native-gesture-handler';
import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryDraftProvider } from '@/contexts/QueryDraftContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { DemoModeBanner } from '@/components/DemoModeBanner';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppErrorBoundary>
          <AuthProvider>
            <QueryDraftProvider>
              <StatusBar style="light" />
              <View style={{ flex: 1 }}>
                <RootNavigator />
                <DemoModeBanner />
              </View>
            </QueryDraftProvider>
          </AuthProvider>
        </AppErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

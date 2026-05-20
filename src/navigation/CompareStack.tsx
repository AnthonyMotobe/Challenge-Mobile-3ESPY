import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CompareSelectionScreen } from '@/screens/compare/CompareSelectionScreen';
import { CompareResultScreen } from '@/screens/compare/CompareResultScreen';
import { colors } from '@/theme/colors';
import type { CompareStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<CompareStackParamList>();

export function CompareStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.fordBlue },
        headerTintColor: '#FFF',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="CompareSelection"
        component={CompareSelectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CompareResult"
        component={CompareResultScreen}
        options={{ title: 'Comparação' }}
      />
    </Stack.Navigator>
  );
}

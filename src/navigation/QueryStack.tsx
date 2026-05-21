import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VehicleFormScreen } from '@/screens/query/VehicleFormScreen';
import { AttributeSelectorScreen } from '@/screens/query/AttributeSelectorScreen';
import { ProcessingScreen } from '@/screens/query/ProcessingScreen';
import { SpecSheetScreen } from '@/screens/query/SpecSheetScreen';
import { colors } from '@/theme/colors';
import type { QueryStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<QueryStackParamList>();

export function QueryStack() {
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
        name="VehicleForm"
        component={VehicleFormScreen}
        options={{ title: 'Nova consulta' }}
      />
      <Stack.Screen
        name="AttributeSelector"
        component={AttributeSelectorScreen}
        options={{ title: 'Atributos' }}
      />
      <Stack.Screen
        name="Processing"
        component={ProcessingScreen}
        options={{ title: 'Processando', headerBackVisible: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="SpecSheet"
        component={SpecSheetScreen}
        options={{ title: 'Ficha técnica' }}
      />
    </Stack.Navigator>
  );
}

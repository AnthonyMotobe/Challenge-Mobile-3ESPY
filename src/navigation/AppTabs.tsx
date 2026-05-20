import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { QueryStack } from '@/navigation/QueryStack';
import { HistoryStack } from '@/navigation/HistoryStack';
import { CompareStack } from '@/navigation/CompareStack';
import { colors } from '@/theme/colors';
import type { AppTabsParamList } from '@/navigation/types';

const Tab = createBottomTabNavigator<AppTabsParamList>();

function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapFocused]}>
      <Text style={[styles.iconText, focused && styles.iconTextFocused]}>{symbol}</Text>
    </View>
  );
}

export function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.fordBlue,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontWeight: '700', fontSize: 10 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingTop: 6,
        },
        tabBarItemStyle: { paddingHorizontal: 2 },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => <TabIcon symbol="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="QueryTab"
        component={QueryStack}
        options={{
          title: 'Consulta',
          tabBarIcon: ({ focused }) => <TabIcon symbol="🔍" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryStack}
        options={{
          title: 'Histórico',
          tabBarIcon: ({ focused }) => <TabIcon symbol="🗂️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="CompareTab"
        component={CompareStack}
        options={{
          title: 'Comparar',
          tabBarIcon: ({ focused }) => <TabIcon symbol="⚖️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon symbol="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapFocused: {
    backgroundColor: '#E8EEFA',
  },
  iconText: { fontSize: 16 },
  iconTextFocused: { fontSize: 18 },
});

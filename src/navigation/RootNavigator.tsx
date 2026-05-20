import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from '@/navigation/AuthNavigator';
import { AppTabs } from '@/navigation/AppTabs';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme/colors';

export function RootNavigator() {
  const { isBootstrapping, isAuthenticated } = useAuth();

  if (isBootstrapping) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.fordBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

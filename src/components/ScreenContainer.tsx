import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/colors';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
}

export function ScreenContainer({ children, scroll = true, padded = true, style }: Props) {
  const Inner = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Inner
          keyboardShouldPersistTaps={scroll ? 'handled' : undefined}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            scroll
              ? [padded && styles.padded, styles.scrollContent, style]
              : undefined
          }
          style={!scroll ? [styles.fill, padded && styles.padded, style] : styles.fill}
        >
          {children}
        </Inner>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  fill: { flex: 1 },
  padded: { padding: spacing.lg },
  scrollContent: { paddingBottom: spacing.xxl },
});

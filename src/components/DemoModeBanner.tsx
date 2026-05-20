import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { isMockMode } from '@/api/config';
import { colors, radius, spacing } from '@/theme/colors';

export function DemoModeBanner() {
  if (!isMockMode) return null;
  return (
    <View pointerEvents="none" style={styles.wrapper}>
      <View style={styles.pill}>
        <View style={styles.dot} />
        <Text style={styles.text}>MODO DEMO</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 12,
    zIndex: 9999,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#F59E0B',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.warning,
    marginRight: spacing.xs,
  },
  text: {
    color: '#92400E',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.8,
  },
});

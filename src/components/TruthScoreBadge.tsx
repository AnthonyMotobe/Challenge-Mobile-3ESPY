import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/theme/colors';
import type { TruthScore } from '@/utils/truthScore';

interface Props {
  score: TruthScore;
  size?: 'sm' | 'md' | 'lg';
}

export function TruthScoreBadge({ score, size = 'md' }: Props) {
  const percent = Math.round(score.value * 100);
  return (
    <View style={[styles.wrapper, sizes[size].wrapper, { borderColor: score.color }]}>
      <View style={[styles.dot, { backgroundColor: score.color }]} />
      <Text style={[styles.label, sizes[size].label, { color: score.color }]}>
        {score.label} · {percent}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  label: {
    fontWeight: '700',
  },
});

const sizes = {
  sm: {
    wrapper: { paddingHorizontal: 10, paddingVertical: 4 },
    label: { fontSize: 12 },
  },
  md: {
    wrapper: { paddingHorizontal: 12, paddingVertical: 6 },
    label: { fontSize: 13 },
  },
  lg: {
    wrapper: { paddingHorizontal: 14, paddingVertical: 8 },
    label: { fontSize: 15 },
  },
};

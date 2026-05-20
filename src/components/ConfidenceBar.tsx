import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '@/theme/colors';

interface Props {
  value: number;
  color: string;
  height?: number;
}

export function ConfidenceBar({ value, color, height = 6 }: Props) {
  const clamped = Math.max(0, Math.min(value, 1));
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={{
          width: `${clamped * 100}%`,
          height,
          backgroundColor: color,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    overflow: 'hidden',
    width: '100%',
  },
});

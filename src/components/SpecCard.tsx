import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme/colors';
import { titleCase } from '@/utils/format';
import type { SpecOut } from '@/types/api';

interface Props {
  spec: SpecOut;
}

export function SpecCard({ spec }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.attribute}>{titleCase(spec.attribute)}</Text>
      <Text style={styles.value}>
        {spec.value ?? '—'}
        {spec.normalized_unit ? (
          <Text style={styles.unit}> {spec.normalized_unit}</Text>
        ) : null}
      </Text>
      <View style={styles.sourceRow}>
        <Text style={styles.sourceLabel}>Fonte</Text>
        <Text style={styles.sourceValue}>
          {spec.source_hint ?? 'não informada'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  attribute: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  unit: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  sourceLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: spacing.sm,
  },
  sourceValue: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
});

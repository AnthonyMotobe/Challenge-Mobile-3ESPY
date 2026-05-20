import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme/colors';
import { ConfidenceBar } from '@/components/ConfidenceBar';
import { computeTruthScore } from '@/utils/truthScore';
import type { SpecOut } from '@/types/api';

interface Props {
  spec: SpecOut;
}

export function SpecCard({ spec }: Props) {
  const score = computeTruthScore(spec);
  const display = spec.available
    ? spec.value ?? '—'
    : 'Não encontrado nas fontes consultadas';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.attribute}>{formatAttribute(spec.attribute)}</Text>
        <Text style={[styles.scoreText, { color: score.color }]}>
          {Math.round(score.value * 100)}%
        </Text>
      </View>
      <Text style={[styles.value, !spec.available && styles.valueMissing]}>{display}</Text>
      <View style={styles.metaRow}>
        {spec.normalized_unit ? (
          <Text style={styles.meta}>Unidade: {spec.normalized_unit}</Text>
        ) : null}
        {spec.source_hint ? (
          <Text style={styles.meta} numberOfLines={1}>
            Fonte: {spec.source_hint}
          </Text>
        ) : null}
      </View>
      <ConfidenceBar value={score.value} color={score.color} />
      <Text style={[styles.confidenceLabel, { color: score.color }]}>{score.label}</Text>
    </View>
  );
}

function formatAttribute(raw: string): string {
  return raw
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  attribute: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  scoreText: {
    fontWeight: '700',
    fontSize: 14,
  },
  value: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  valueMissing: {
    color: colors.textMuted,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  metaRow: {
    marginBottom: spacing.sm,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  confidenceLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});

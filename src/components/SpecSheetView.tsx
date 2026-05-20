import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SpecCard } from '@/components/SpecCard';
import { TruthScoreBadge } from '@/components/TruthScoreBadge';
import { ConfidenceBar } from '@/components/ConfidenceBar';
import { Button } from '@/components/Button';
import { aggregateTruthScore, computeTruthScore } from '@/utils/truthScore';
import { colors, radius, spacing, typography } from '@/theme/colors';
import type { QueryResponse } from '@/types/api';

interface Props {
  query: QueryResponse;
  onOpenSources: () => void;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
}

export function SpecSheetView({
  query,
  onOpenSources,
  onSecondaryAction,
  secondaryActionLabel,
}: Props) {
  const aggregate = useMemo(() => aggregateTruthScore(query.specs), [query.specs]);
  const counts = useMemo(() => {
    return query.specs.reduce(
      (acc, spec) => {
        const score = computeTruthScore(spec);
        if (score.level === 'high') acc.high += 1;
        else if (score.level === 'medium') acc.med += 1;
        else if (score.level === 'low') acc.low += 1;
        else acc.missing += 1;
        return acc;
      },
      { high: 0, med: 0, low: 0, missing: 0 },
    );
  }, [query.specs]);

  return (
    <>
      <View style={styles.summaryCard}>
        <Text style={styles.eyebrow}>FICHA TÉCNICA</Text>
        <Text style={styles.title}>
          {query.brand} {query.model}
        </Text>
        <Text style={styles.version}>{query.version}</Text>
        <View style={styles.badgeRow}>
          <TruthScoreBadge score={aggregate} size="lg" />
        </View>
        <View style={styles.aggregateBar}>
          <ConfidenceBar value={aggregate.value} color={aggregate.color} height={10} />
        </View>
        <View style={styles.statsRow}>
          <Stat label="Alta" value={counts.high} color={colors.truthHigh} />
          <Stat label="Média" value={counts.med} color={colors.truthMed} />
          <Stat label="Baixa" value={counts.low} color={colors.truthLow} />
          <Stat label="Faltando" value={counts.missing} color={colors.truthMissing} />
        </View>
        <Pressable style={styles.linkButton} onPress={onOpenSources}>
          <Text style={styles.linkButtonText}>Ver fontes e conflitos →</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Atributos ({query.specs.length})</Text>
      {query.specs.map((spec, idx) => (
        <SpecCard key={`${spec.attribute}-${idx}`} spec={spec} />
      ))}

      {onSecondaryAction && secondaryActionLabel ? (
        <Button title={secondaryActionLabel} variant="secondary" onPress={onSecondaryAction} />
      ) : null}
    </>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: colors.fordBlue,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  eyebrow: {
    color: '#A8C0EC',
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  title: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  version: { color: '#CBDAF2', fontSize: 15, marginBottom: spacing.md },
  badgeRow: { marginBottom: spacing.sm },
  aggregateBar: { marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { color: '#CBDAF2', fontSize: 11, fontWeight: '600' },
  linkButton: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#1B3A7A',
  },
  linkButtonText: { color: '#FFF', fontWeight: '700' },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
});

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SpecCard } from '@/components/SpecCard';
import { Button } from '@/components/Button';
import { colors, radius, spacing, typography } from '@/theme/colors';
import type { QueryResponse } from '@/types/api';

interface Props {
  query: QueryResponse;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
}

export function SpecSheetView({
  query,
  onSecondaryAction,
  secondaryActionLabel,
}: Props) {
  // Só aparecem atributos com dado real (valor disponível).
  const specs = useMemo(
    () => query.specs.filter((s) => s.available && s.value),
    [query.specs],
  );

  return (
    <>
      <View style={styles.summaryCard}>
        <Text style={styles.eyebrow}>FICHA TÉCNICA</Text>
        <Text style={styles.title}>
          {query.brand} {query.model}
        </Text>
        <Text style={styles.version}>{query.version}</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>
            {specs.length} atributo(s) encontrado(s)
          </Text>
        </View>
      </View>

      {specs.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nenhum dado encontrado</Text>
          <Text style={styles.emptyDesc}>
            As fontes consultadas não retornaram informações para os atributos
            solicitados.
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Atributos</Text>
          {specs.map((spec, idx) => (
            <SpecCard key={`${spec.attribute}-${idx}`} spec={spec} />
          ))}
        </>
      )}

      {onSecondaryAction && secondaryActionLabel ? (
        <Button title={secondaryActionLabel} variant="secondary" onPress={onSecondaryAction} />
      ) : null}
    </>
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
  countPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.fordBlueDark,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  countText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptyDesc: { ...typography.caption },
});

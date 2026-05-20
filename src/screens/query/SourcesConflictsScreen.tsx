import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { computeTruthScore, detectConflicts } from '@/utils/truthScore';
import { colors, radius, spacing, typography } from '@/theme/colors';
import type { QueryResponse, SpecOut } from '@/types/api';

interface Props {
  route: { params: { query: QueryResponse } };
}

interface SourceGroup {
  source: string;
  category: 'oficial' | 'review' | 'outra';
  specs: SpecOut[];
}

export function SourcesConflictsScreen({ route }: Props) {
  const { query } = route.params;

  const groups = useMemo<SourceGroup[]>(() => {
    const map = new Map<string, SpecOut[]>();
    for (const spec of query.specs) {
      const key = spec.source_hint?.trim() || (spec.available ? 'Fonte não declarada' : 'Não consultada');
      const list = map.get(key) ?? [];
      list.push(spec);
      map.set(key, list);
    }
    return Array.from(map.entries())
      .map(([source, specs]) => ({
        source,
        category: classify(source),
        specs,
      }))
      .sort((a, b) => order(a.category) - order(b.category));
  }, [query.specs]);

  const conflicts = useMemo(() => detectConflicts(query.specs), [query.specs]);
  const missing = useMemo(() => query.specs.filter((s) => !s.available), [query.specs]);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Fontes & Conflitos</Text>
      <Text style={styles.subtitle}>
        Auditoria do Truth Score: de onde veio cada informação e o que diverge.
      </Text>

      <Section title={`Conflitos detectados (${conflicts.length})`}>
        {conflicts.length === 0 ? (
          <Text style={styles.empty}>
            Nenhum conflito entre fontes para esta consulta.
          </Text>
        ) : (
          conflicts.map((spec, idx) => (
            <View key={`${spec.attribute}-${idx}`} style={styles.conflictRow}>
              <Text style={styles.conflictAttr}>{spec.attribute}</Text>
              <Text style={styles.conflictValue}>
                {spec.value ?? '—'}{' '}
                <Text style={styles.conflictSource}>({spec.source_hint ?? 'sem fonte'})</Text>
              </Text>
            </View>
          ))
        )}
      </Section>

      <Section title={`Atributos faltando (${missing.length})`}>
        {missing.length === 0 ? (
          <Text style={styles.empty}>Todos os atributos solicitados foram encontrados.</Text>
        ) : (
          <View style={styles.tagsWrap}>
            {missing.map((spec) => (
              <View key={spec.attribute} style={styles.missingTag}>
                <Text style={styles.missingText}>{spec.attribute}</Text>
              </View>
            ))}
          </View>
        )}
      </Section>

      <Section title="Fontes consultadas">
        {groups.map((group) => (
          <View key={group.source} style={styles.sourceCard}>
            <View style={styles.sourceHeader}>
              <Text style={styles.sourceName} numberOfLines={2}>
                {group.source}
              </Text>
              <View
                style={[
                  styles.categoryBadge,
                  group.category === 'oficial'
                    ? styles.categoryOfficial
                    : group.category === 'review'
                      ? styles.categoryReview
                      : styles.categoryOther,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    group.category === 'oficial' ? { color: colors.success } : null,
                    group.category === 'review' ? { color: colors.warning } : null,
                    group.category === 'outra' ? { color: colors.textSecondary } : null,
                  ]}
                >
                  {group.category.toUpperCase()}
                </Text>
              </View>
            </View>
            {group.specs.map((spec) => {
              const score = computeTruthScore(spec);
              return (
                <View key={spec.attribute} style={styles.specRow}>
                  <Text style={styles.specAttr}>{spec.attribute}</Text>
                  <Text style={styles.specValue} numberOfLines={2}>
                    {spec.value ?? 'não encontrado'}
                  </Text>
                  <Text style={[styles.specScore, { color: score.color }]}>
                    {Math.round(score.value * 100)}%
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </Section>
    </ScreenContainer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function classify(source: string): SourceGroup['category'] {
  const s = source.toLowerCase();
  if (
    ['oficial', 'official', 'ford.com', 'manual', 'catalog', 'press', 'specsheet', 'ficha'].some(
      (kw) => s.includes(kw),
    )
  )
    return 'oficial';
  if (
    ['review', 'autoesporte', 'quatro rodas', 'webmotors', 'youtube', 'motor1', 'icarros'].some(
      (kw) => s.includes(kw),
    )
  )
    return 'review';
  return 'outra';
}

function order(c: SourceGroup['category']): number {
  if (c === 'oficial') return 0;
  if (c === 'review') return 1;
  return 2;
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: 4 },
  subtitle: { ...typography.caption, marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  empty: {
    color: colors.textSecondary,
    fontSize: 13,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  conflictRow: {
    backgroundColor: '#FFF7ED',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  conflictAttr: { fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  conflictValue: { fontSize: 13, color: colors.textPrimary },
  conflictSource: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  missingTag: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  missingText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  sourceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  sourceName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryOfficial: { backgroundColor: '#DCFCE7' },
  categoryReview: { backgroundColor: '#FEF3C7' },
  categoryOther: { backgroundColor: '#E2E8F0' },
  categoryText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  specAttr: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    flexBasis: 100,
    flexShrink: 0,
  },
  specValue: { flex: 1, fontSize: 13, color: colors.textPrimary, marginHorizontal: 8 },
  specScore: { fontSize: 13, fontWeight: '700' },
});

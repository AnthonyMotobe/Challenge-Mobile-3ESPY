import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { vehiclesApi } from '@/api/vehicles';
import { historyCache } from '@/storage/historyCache';
import { aggregateTruthScore, computeTruthScore } from '@/utils/truthScore';
import {
  ATTRIBUTE_CATEGORIES,
  VEHICLE_PALETTE,
  findWinnerIndex,
  relativeBarValues,
  valuesDiverge,
  valuesMatch,
  winnerStrategyFor,
} from '@/utils/compareHelpers';
import { colors, radius, spacing, typography } from '@/theme/colors';
import type { CompareStackParamList } from '@/navigation/types';
import type { QueryResponse, SpecOut } from '@/types/api';

type Props = NativeStackScreenProps<CompareStackParamList, 'CompareResult'>;

interface ComparisonRow {
  attribute: string;
  cells: (SpecOut | null)[];
  diverges: boolean;
  matches: boolean;
  winnerIdx: number | null;
  bars: (number | null)[];
}

interface Section {
  title: string;
  emoji: string;
  rows: ComparisonRow[];
}

export function CompareResultScreen({ route }: Props) {
  const { queryIds } = route.params;
  const [queries, setQueries] = useState<QueryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const loaded = await Promise.all(
          queryIds.map(async (id) => {
            const cached = await historyCache.loadQuery(id);
            if (cached) return cached;
            const fresh = await vehiclesApi.get(id);
            await historyCache.saveQuery(fresh);
            return fresh;
          }),
        );
        setQueries(loaded);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [queryIds]);

  const rows = useMemo<ComparisonRow[]>(() => {
    if (queries.length === 0) return [];
    const attributeSet = new Set<string>();
    for (const q of queries) {
      for (const s of q.specs) attributeSet.add(s.attribute);
    }
    return Array.from(attributeSet).map((attr) => {
      const cells = queries.map((q) => {
        const matches = q.specs.filter((s) => s.attribute === attr);
        if (matches.length === 0) return null;
        const available = matches.find((m) => m.available);
        return available ?? matches[0];
      });
      return {
        attribute: attr,
        cells,
        diverges: valuesDiverge(cells),
        matches: valuesMatch(cells),
        winnerIdx: findWinnerIndex(cells, attr),
        bars: relativeBarValues(cells),
      };
    });
  }, [queries]);

  const sections = useMemo<Section[]>(() => {
    const used = new Set<string>();
    const grouped: Section[] = ATTRIBUTE_CATEGORIES.map((cat) => {
      const sectionRows = rows.filter((r) => {
        if (cat.keys.includes(r.attribute)) {
          used.add(r.attribute);
          return true;
        }
        return false;
      });
      return { title: cat.title, emoji: cat.emoji, rows: sectionRows };
    }).filter((s) => s.rows.length > 0);
    const others = rows.filter((r) => !used.has(r.attribute));
    if (others.length > 0) {
      grouped.push({ title: 'Outros', emoji: '📋', rows: others });
    }
    return grouped;
  }, [rows]);

  const stats = useMemo(() => {
    const conflicts = rows.filter((r) => r.diverges).length;
    const matches = rows.filter((r) => r.matches).length;
    const total = rows.length;
    return { conflicts, matches, total };
  }, [rows]);

  function toggleSection(title: string) {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.fordBlue} />
          <Text style={styles.loadingText}>Carregando comparação…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || queries.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.loadingBox}>
          <Text style={styles.error}>{error ?? 'Não foi possível carregar.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
      >
        {/* Pills sticky com identidade visual de cada veículo */}
        <View style={styles.pillsBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsContent}
          >
            {queries.map((q, idx) => {
              const score = aggregateTruthScore(q.specs);
              const palette = VEHICLE_PALETTE[idx];
              return (
                <View
                  key={q.id}
                  style={[styles.pill, { backgroundColor: palette.soft }]}
                >
                  <View style={[styles.pillDot, { backgroundColor: palette.primary }]} />
                  <View style={styles.pillContent}>
                    <Text style={styles.pillModel} numberOfLines={1}>
                      {q.model}
                    </Text>
                    <Text style={styles.pillVersion} numberOfLines={1}>
                      {q.version}
                    </Text>
                    <Text style={[styles.pillScore, { color: palette.primary }]}>
                      {Math.round(score.value * 100)}% confiança
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Summary value={stats.total} label="Atributos" color={colors.fordBlue} />
            <SummaryDivider />
            <Summary
              value={stats.matches}
              label="Iguais"
              color={colors.success}
            />
            <SummaryDivider />
            <Summary
              value={stats.conflicts}
              label="Conflitos"
              color={stats.conflicts > 0 ? colors.warning : colors.textMuted}
            />
          </View>
          {stats.conflicts > 0 ? (
            <View style={styles.conflictBanner}>
              <Text style={styles.conflictBannerText}>
                ⚠️ {stats.conflicts} atributo(s) com valores divergentes entre os veículos
              </Text>
            </View>
          ) : null}
        </View>

        {/* Seções colapsáveis */}
        {sections.map((section) => {
          const isCollapsed = collapsed[section.title];
          return (
            <View key={section.title} style={styles.section}>
              <Pressable
                onPress={() => toggleSection(section.title)}
                style={styles.sectionHeader}
              >
                <Text style={styles.sectionEmoji}>{section.emoji}</Text>
                <View style={styles.sectionTitleBlock}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={styles.sectionMeta}>
                    {section.rows.length} atributo(s)
                  </Text>
                </View>
                <Text style={styles.sectionChevron}>{isCollapsed ? '▸' : '▾'}</Text>
              </Pressable>
              {!isCollapsed ? (
                <View style={styles.sectionBody}>
                  {section.rows.map((row) => (
                    <AttributeCard
                      key={row.attribute}
                      row={row}
                      queries={queries}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}

        {/* Legenda */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Como ler</Text>
          <LegendItem
            symbol="🏆"
            text="Vencedor numérico (maior potência, menor 0-100, etc)"
          />
          <LegendItem symbol="✓" text="Mesmo valor em todos os veículos" />
          <LegendItem symbol="⚠️" text="Valores divergentes entre veículos" />
          <LegendItem symbol="—" text="Não disponível neste veículo" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Summary({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function SummaryDivider() {
  return <View style={styles.summaryDivider} />;
}

function LegendItem({ symbol, text }: { symbol: string; text: string }) {
  return (
    <View style={styles.legendItem}>
      <Text style={styles.legendSymbol}>{symbol}</Text>
      <Text style={styles.legendText}>{text}</Text>
    </View>
  );
}

function AttributeCard({
  row,
  queries,
}: {
  row: ComparisonRow;
  queries: QueryResponse[];
}) {
  const hasNumericComparison = row.bars.some((b) => b !== null);
  const strategy = winnerStrategyFor(row.attribute);
  const strategyLabel =
    strategy === 'higher'
      ? 'maior é melhor'
      : strategy === 'lower'
        ? 'menor é melhor'
        : null;

  return (
    <View
      style={[
        styles.card,
        row.diverges && styles.cardConflict,
        row.matches && styles.cardMatch,
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{formatAttr(row.attribute)}</Text>
          {strategyLabel ? (
            <Text style={styles.cardStrategy}>{strategyLabel}</Text>
          ) : null}
        </View>
        {row.matches ? (
          <View style={styles.matchBadge}>
            <Text style={styles.matchBadgeText}>✓ Iguais</Text>
          </View>
        ) : null}
        {row.diverges ? (
          <View style={styles.conflictBadge}>
            <Text style={styles.conflictBadgeText}>⚠ Diverge</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cardBody}>
        {row.cells.map((cell, idx) => {
          const palette = VEHICLE_PALETTE[idx];
          const isWinner = row.winnerIdx === idx;
          const bar = row.bars[idx];
          const score = cell?.available ? computeTruthScore(cell) : null;

          return (
            <View key={`${row.attribute}-${idx}`} style={styles.vehicleRow}>
              <View style={styles.vehicleRowHeader}>
                <View
                  style={[styles.vehicleDot, { backgroundColor: palette.primary }]}
                />
                <Text
                  style={[
                    styles.vehicleRowName,
                    isWinner && { color: palette.primary, fontWeight: '800' },
                  ]}
                  numberOfLines={1}
                >
                  {queries[idx].model}
                </Text>
                {isWinner ? <Text style={styles.winnerCrown}>🏆</Text> : null}
              </View>

              {cell?.available ? (
                <>
                  <View style={styles.valueLine}>
                    <Text
                      style={[
                        styles.valueText,
                        isWinner && { fontWeight: '800', color: colors.textPrimary },
                      ]}
                      numberOfLines={3}
                    >
                      {cell.value}
                    </Text>
                    {cell.normalized_unit ? (
                      <Text style={styles.unitText}>{cell.normalized_unit}</Text>
                    ) : null}
                  </View>

                  {hasNumericComparison && bar !== null ? (
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${Math.max(8, bar * 100)}%`,
                            backgroundColor: palette.primary,
                            opacity: isWinner ? 1 : 0.55,
                          },
                        ]}
                      />
                    </View>
                  ) : null}

                  {score ? (
                    <View style={styles.scoreRow}>
                      <View
                        style={[styles.scoreDot, { backgroundColor: score.color }]}
                      />
                      <Text style={[styles.scoreText, { color: score.color }]}>
                        {Math.round(score.value * 100)}% — {score.label}
                      </Text>
                    </View>
                  ) : null}
                </>
              ) : (
                <View style={styles.missingLine}>
                  <Text style={styles.missingText}>— não disponível</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function formatAttr(raw: string): string {
  return raw
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textSecondary, marginTop: spacing.md },
  error: { color: colors.danger, fontSize: 14, textAlign: 'center', paddingHorizontal: spacing.lg },
  scroll: { paddingBottom: spacing.xxl },

  // Pills bar (sticky)
  pillsBar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  pillsContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    minWidth: 160,
    maxWidth: 220,
    marginRight: spacing.sm,
  },
  pillDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  pillContent: { flex: 1 },
  pillModel: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  pillVersion: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  pillScore: { fontSize: 11, fontWeight: '700', marginTop: 4 },

  // Summary card
  summaryCard: {
    margin: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: '800' },
  summaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryDivider: { width: 1, backgroundColor: colors.border, marginVertical: 8 },
  conflictBanner: {
    backgroundColor: '#FEF3C7',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#FCD34D',
  },
  conflictBannerText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Sections
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionEmoji: { fontSize: 22 },
  sectionTitleBlock: { flex: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  sectionMeta: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  sectionChevron: { fontSize: 16, color: colors.textSecondary, paddingHorizontal: 4 },
  sectionBody: { padding: spacing.sm, paddingTop: 0 },

  // Attribute card
  card: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.border,
  },
  cardMatch: { borderLeftColor: colors.success, backgroundColor: '#F0FDF4' },
  cardConflict: { borderLeftColor: colors.warning, backgroundColor: '#FFFBEB' },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  cardStrategy: { fontSize: 10, color: colors.textSecondary, marginTop: 1, fontStyle: 'italic' },
  matchBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#DCFCE7',
    borderRadius: radius.pill,
  },
  matchBadgeText: { fontSize: 10, fontWeight: '800', color: colors.success },
  conflictBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#FEF3C7',
    borderRadius: radius.pill,
  },
  conflictBadgeText: { fontSize: 10, fontWeight: '800', color: '#92400E' },
  cardBody: { gap: spacing.md },

  // Vehicle row inside card
  vehicleRow: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  vehicleRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  vehicleDot: { width: 8, height: 8, borderRadius: 4 },
  vehicleRowName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  winnerCrown: { fontSize: 14 },
  valueLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  valueText: { fontSize: 15, color: colors.textPrimary, fontWeight: '600', flexShrink: 1 },
  unitText: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  barTrack: {
    height: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  barFill: { height: 6, borderRadius: 3 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scoreDot: { width: 6, height: 6, borderRadius: 3 },
  scoreText: { fontSize: 11, fontWeight: '700' },

  missingLine: { paddingVertical: 4 },
  missingText: { color: colors.textMuted, fontStyle: 'italic', fontSize: 13 },

  // Legend
  legend: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendTitle: { ...typography.label, marginBottom: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: spacing.sm },
  legendSymbol: { fontSize: 14, width: 24 },
  legendText: { fontSize: 12, color: colors.textSecondary, flex: 1 },
});

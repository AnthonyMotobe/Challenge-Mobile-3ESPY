import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '@/components/Button';
import { vehiclesApi } from '@/api/vehicles';
import { historyCache } from '@/storage/historyCache';
import { colors, radius, spacing, typography } from '@/theme/colors';
import type { CompareStackParamList } from '@/navigation/types';
import type { QuerySummary } from '@/types/api';

type Nav = NativeStackNavigationProp<CompareStackParamList, 'CompareSelection'>;

const MIN_SELECTION = 2;
const MAX_SELECTION = 4;

export function CompareSelectionScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<QuerySummary[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const cached = await historyCache.loadSummaries();
    if (cached.length) setItems(cached);
    try {
      const data = await vehiclesApi.list(50, 0);
      const completed = data.filter((q) => q.status === 'completed');
      setItems(completed);
      await historyCache.saveSummaries(data);
    } catch {
      // cache fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECTION) return prev;
      return [...prev, id];
    });
  }

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function startCompare() {
    if (selected.length < MIN_SELECTION) return;
    navigation.navigate('CompareResult', { queryIds: selected });
    setSelected([]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ marginTop: 64 }} color={colors.fordBlue} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Comparar</Text>
        <Text style={styles.subtitle}>
          Selecione {MIN_SELECTION} a {MAX_SELECTION} consultas do histórico para
          comparar lado a lado.
        </Text>
        <View style={styles.counterBox}>
          <Text style={styles.counterText}>
            {selected.length} de {MAX_SELECTION} selecionada(s)
          </Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhuma consulta disponível</Text>
            <Text style={styles.emptyDesc}>
              Faça pelo menos {MIN_SELECTION} consultas (com status concluída) na
              aba “Nova consulta” para poder comparar.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.id);
          const isDisabled = !isSelected && selected.length >= MAX_SELECTION;
          return (
            <Pressable
              onPress={() => toggle(item.id)}
              disabled={isDisabled}
              style={({ pressed }) => [
                styles.row,
                isSelected && styles.rowSelected,
                isDisabled && styles.rowDisabled,
                pressed && !isDisabled && styles.rowPressed,
              ]}
            >
              <View style={[styles.checkbox, isSelected && styles.checkboxOn]}>
                {isSelected ? <Text style={styles.checkText}>✓</Text> : null}
              </View>
              <View style={styles.rowMain}>
                <Text style={styles.rowTitle}>
                  {item.brand} {item.model}
                </Text>
                <Text style={styles.rowMeta}>
                  {item.version} · {formatDate(item.created_at)}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <Button
          title={
            selected.length < MIN_SELECTION
              ? `Selecione mais ${MIN_SELECTION - selected.length}`
              : `Comparar ${selected.length} veículos`
          }
          onPress={startCompare}
          disabled={selected.length < MIN_SELECTION}
        />
      </View>
    </SafeAreaView>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingBottom: spacing.md },
  title: { ...typography.h1 },
  subtitle: { ...typography.caption, marginTop: 4 },
  counterBox: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.fordBlue,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  counterText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowSelected: {
    borderColor: colors.fordBlue,
    backgroundColor: '#EEF4FF',
  },
  rowDisabled: { opacity: 0.4 },
  rowPressed: { opacity: 0.85 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkboxOn: {
    borderColor: colors.fordBlue,
    backgroundColor: colors.fordBlue,
  },
  checkText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  rowMain: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  rowMeta: { ...typography.caption, marginTop: 2 },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700' },
  emptyDesc: { ...typography.caption, marginTop: 4 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

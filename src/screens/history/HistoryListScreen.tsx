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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { vehiclesApi } from '@/api/vehicles';
import { historyCache } from '@/storage/historyCache';
import { colors, radius, spacing, typography } from '@/theme/colors';
import type { HistoryStackParamList } from '@/navigation/types';
import type { QuerySummary } from '@/types/api';

type Nav = NativeStackNavigationProp<HistoryStackParamList>;

export function HistoryListScreen() {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<QuerySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const cached = await historyCache.loadSummaries();
    if (cached.length) setItems(cached);
    try {
      const data = await vehiclesApi.list(50, 0);
      setItems(data);
      setOffline(false);
      await historyCache.saveSummaries(data);
    } catch (err) {
      if (cached.length) {
        setOffline(true);
      } else {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ marginTop: 64 }} color={colors.fordBlue} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico</Text>
        <Text style={styles.subtitle}>
          {offline
            ? 'Modo offline — exibindo cache local'
            : `${items.length} consulta(s)`}
        </Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          error ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nada por aqui ainda</Text>
              <Text style={styles.emptyDesc}>
                Faça sua primeira consulta na aba “Nova consulta”.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate('HistoryDetail', { queryId: item.id })}
          >
            <View style={styles.rowMain}>
              <Text style={styles.rowTitle}>
                {item.brand} {item.model}
              </Text>
              <Text style={styles.rowMeta}>
                {item.version} · {formatDate(item.created_at)}
              </Text>
            </View>
            <Text style={[styles.status, statusColor(item.status)]}>
              {translateStatus(item.status)}
            </Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

function translateStatus(status: string) {
  switch (status) {
    case 'completed':
      return 'Concluída';
    case 'failed':
      return 'Falhou';
    case 'pending':
      return 'Pendente';
    default:
      return status;
  }
}

function statusColor(status: string) {
  switch (status) {
    case 'completed':
      return { color: colors.success, backgroundColor: '#DCFCE7' };
    case 'failed':
      return { color: colors.danger, backgroundColor: '#FEE2E2' };
    case 'pending':
      return { color: colors.warning, backgroundColor: '#FEF3C7' };
    default:
      return { color: colors.textSecondary, backgroundColor: colors.surfaceAlt };
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
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
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowMain: { flex: 1, marginRight: spacing.md },
  rowTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  rowMeta: { ...typography.caption, marginTop: 2 },
  status: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700' },
  emptyDesc: { ...typography.caption, marginTop: 4 },
  error: { color: colors.danger, fontSize: 14 },
});

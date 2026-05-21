import React, { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryDraft } from '@/contexts/QueryDraftContext';
import { vehiclesApi } from '@/api/vehicles';
import { historyCache } from '@/storage/historyCache';
import { Button } from '@/components/Button';
import { formatDateTime, statusPalette, translateStatus } from '@/utils/format';
import { colors, radius, spacing, typography } from '@/theme/colors';
import type { AppTabsParamList } from '@/navigation/types';
import type { QuerySummary } from '@/types/api';

type Nav = BottomTabNavigationProp<AppTabsParamList>;

export function HomeScreen() {
  const { user, logout } = useAuth();
  const { reset } = useQueryDraft();
  const navigation = useNavigation<Nav>();
  const [recent, setRecent] = useState<QuerySummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const cached = await historyCache.loadSummaries();
    if (cached.length) setRecent(cached.slice(0, 5));
    try {
      const items = await vehiclesApi.list(5, 0);
      setRecent(items);
      await historyCache.saveSummaries(items);
    } catch {
      // mantém cache
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

  function startNewQuery() {
    reset();
    navigation.navigate('QueryTab');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.hero}>
          <View style={styles.heroHeader}>
            <View style={styles.heroGreeting}>
              <Text style={styles.greeting}>Olá,</Text>
              <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
                {user?.full_name || user?.email}
              </Text>
            </View>
            <Pressable onPress={logout} hitSlop={10} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Sair</Text>
            </Pressable>
          </View>
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>Scan-to-Spec</Text>
            <Text style={styles.heroSubtitle}>
              Marca + modelo + versão (ou imagem) → ficha técnica padronizada com
              valor e fonte de cada atributo.
            </Text>
            <Button title="Nova consulta" onPress={startNewQuery} variant="secondary" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Como funciona</Text>
          <View style={styles.steps}>
            <StepCard index={1} title="Veículo" description="Informe marca, modelo e versão" />
            <StepCard
              index={2}
              title="Atributos"
              description="Escolha o que extrair (motor, torque, preço...)"
            />
            <StepCard
              index={3}
              title="Ficha técnica"
              description="Receba a ficha com o valor e a fonte de cada item"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Consultas recentes</Text>
            <Pressable onPress={() => navigation.navigate('HistoryTab')}>
              <Text style={styles.linkText}>Ver tudo</Text>
            </Pressable>
          </View>
          {recent.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nenhuma consulta ainda</Text>
              <Text style={styles.emptyDesc}>
                Toque em “Nova consulta” para extrair a primeira ficha técnica.
              </Text>
            </View>
          ) : (
            recent.map((item) => (
              <View key={item.id} style={styles.recentItem}>
                <Text style={styles.recentTitle}>
                  {item.brand} {item.model}
                </Text>
                <Text style={styles.recentMeta}>
                  {item.version} · {formatDateTime(item.created_at)}
                </Text>
                <Text
                  style={[
                    styles.recentStatus,
                    { color: statusPalette(item.status).fg },
                  ]}
                >
                  {translateStatus(item.status)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StepCard({
  index,
  title,
  description,
}: {
  index: number;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepIndex}>
        <Text style={styles.stepIndexText}>{index}</Text>
      </View>
      <View style={styles.stepText}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xxl },
  hero: {
    backgroundColor: colors.fordBlue,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroGreeting: { flex: 1, marginRight: spacing.md },
  greeting: { color: '#CBDAF2', fontSize: 13 },
  userName: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  logoutButton: { paddingVertical: 4, paddingHorizontal: 8 },
  logoutText: { color: '#CBDAF2', fontWeight: '600' },
  heroCard: {
    backgroundColor: colors.fordBlueDark,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    color: '#A8C0EC',
    fontSize: 14,
    marginBottom: spacing.md,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  linkText: {
    color: colors.fordBlue,
    fontWeight: '600',
  },
  steps: { gap: spacing.sm },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  stepIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.fordBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepIndexText: { color: '#FFF', fontWeight: '700' },
  stepText: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  stepDescription: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: colors.textSecondary },
  recentItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  recentTitle: { fontSize: 15, fontWeight: '700' },
  recentMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  recentStatus: { fontSize: 12, marginTop: 6, fontWeight: '600' },
});

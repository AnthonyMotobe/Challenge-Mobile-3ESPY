import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HistoryListScreen } from '@/screens/history/HistoryListScreen';
import { SourcesConflictsScreen } from '@/screens/query/SourcesConflictsScreen';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SpecSheetView } from '@/components/SpecSheetView';
import { vehiclesApi } from '@/api/vehicles';
import { historyCache } from '@/storage/historyCache';
import { colors } from '@/theme/colors';
import type { QueryResponse } from '@/types/api';
import type { HistoryStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<HistoryStackParamList>();

function HistoryDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<HistoryStackParamList, 'HistoryDetail'>) {
  const [query, setQuery] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const cached = await historyCache.loadQuery(route.params.queryId);
      if (cached) {
        setQuery(cached);
        setLoading(false);
      }
      try {
        const fresh = await vehiclesApi.get(route.params.queryId);
        setQuery(fresh);
        await historyCache.saveQuery(fresh);
      } catch (err) {
        if (!cached) setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [route.params.queryId]);

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator color={colors.fordBlue} />
      </ScreenContainer>
    );
  }

  if (error || !query) {
    return (
      <ScreenContainer>
        <Text style={styles.error}>{error ?? 'Não foi possível carregar a ficha.'}</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <SpecSheetView
        query={query}
        onOpenSources={() => navigation.navigate('HistorySources', { query })}
      />
    </ScreenContainer>
  );
}

export function HistoryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.fordBlue },
        headerTintColor: '#FFF',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="HistoryList"
        component={HistoryListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HistoryDetail"
        component={HistoryDetailScreen}
        options={{ title: 'Detalhes' }}
      />
      <Stack.Screen
        name="HistorySources"
        component={SourcesConflictsScreen as never}
        options={{ title: 'Fontes & conflitos' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, fontSize: 14 },
});

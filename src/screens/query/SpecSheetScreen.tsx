import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SpecSheetView } from '@/components/SpecSheetView';
import { vehiclesApi } from '@/api/vehicles';
import { historyCache } from '@/storage/historyCache';
import { colors } from '@/theme/colors';
import type { QueryStackParamList } from '@/navigation/types';
import type { QueryResponse } from '@/types/api';

type Props = NativeStackScreenProps<QueryStackParamList, 'SpecSheet'>;

export function SpecSheetScreen({ navigation, route }: Props) {
  const initial = 'query' in route.params ? route.params.query : null;
  const queryId = 'queryId' in route.params ? route.params.queryId : null;
  const [query, setQuery] = useState<QueryResponse | null>(initial);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query || !queryId) return;
    (async () => {
      const cached = await historyCache.loadQuery(queryId);
      if (cached) {
        setQuery(cached);
        setLoading(false);
      }
      try {
        const fresh = await vehiclesApi.get(queryId);
        setQuery(fresh);
        await historyCache.saveQuery(fresh);
      } catch (err) {
        if (!cached) setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [queryId, query]);

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
        <Text style={styles.error}>{error ?? 'Ficha indisponível.'}</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <SpecSheetView
        query={query}
        onSecondaryAction={() => navigation.popToTop()}
        secondaryActionLabel="Nova consulta"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, fontSize: 14 },
});

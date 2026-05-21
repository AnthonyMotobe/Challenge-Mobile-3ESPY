import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { vehiclesApi } from '@/api/vehicles';
import { useQueryDraft } from '@/contexts/QueryDraftContext';
import { historyCache } from '@/storage/historyCache';
import { normalizeError } from '@/api/client';
import {
  ensureNotificationPermission,
  notifyExtractionComplete,
} from '@/notifications/localNotifications';
import { colors, radius, spacing, typography } from '@/theme/colors';
import type { QueryStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<QueryStackParamList, 'Processing'>;

const STEPS = [
  { key: 'request', label: 'Enviando consulta ao backend' },
  { key: 'sources', label: 'Cruzando fontes (sites, manuais, reviews)' },
  { key: 'normalize', label: 'Normalizando unidades e valores' },
  { key: 'sheet', label: 'Montando a ficha técnica' },
];

export function ProcessingScreen({ navigation }: Props) {
  const { draft, reset } = useQueryDraft();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    ensureNotificationPermission().catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const stepTimer = setInterval(() => {
      setActiveStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 900);
    Animated.timing(progress, {
      toValue: 0.9,
      duration: 4000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    (async () => {
      try {
        const response = await vehiclesApi.query({
          brand: draft.brand,
          model: draft.model,
          version: draft.version,
          attributes: draft.attributes,
        });
        if (cancelled) return;
        await historyCache.saveQuery(response);
        const summaries = await historyCache.loadSummaries();
        await historyCache.saveSummaries([
          {
            id: response.id,
            brand: response.brand,
            model: response.model,
            version: response.version,
            status: response.status,
            created_at: response.created_at,
          },
          ...summaries.filter((s) => s.id !== response.id),
        ]);
        Animated.timing(progress, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
        const found = response.specs.filter((s) => s.available && s.value).length;
        notifyExtractionComplete({
          brand: response.brand,
          model: response.model,
          version: response.version,
          attributesFound: found,
        }).catch(() => undefined);
        setActiveStep(STEPS.length - 1);
        setTimeout(() => {
          if (cancelled) return;
          navigation.replace('SpecSheet', { query: response });
          reset();
        }, 400);
      } catch (err) {
        if (cancelled) return;
        setError(normalizeError(err).message);
      }
    })();

    return () => {
      cancelled = true;
      clearInterval(stepTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  if (error) {
    return (
      <ScreenContainer>
        <View style={styles.errorWrapper}>
          <Text style={styles.errorTitle}>Não conseguimos extrair</Text>
          <Text style={styles.errorMsg}>{error}</Text>
          <Button title="Tentar novamente" onPress={() => navigation.replace('Processing')} />
          <Button
            title="Voltar para o formulário"
            variant="ghost"
            onPress={() => navigation.popToTop()}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Passo 4 de 4</Text>
        <Text style={styles.title}>Extraindo ficha técnica</Text>
        <Text style={styles.subtitle}>
          {draft.brand} {draft.model} · {draft.version}
        </Text>
      </View>

      <View style={styles.spinnerCard}>
        <ActivityIndicator size="large" color={colors.fordBlue} />
        <Text style={styles.spinnerText}>Pode levar alguns segundos…</Text>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width }]} />
        </View>
      </View>

      <View style={styles.stepsCard}>
        {STEPS.map((step, idx) => {
          const done = idx < activeStep;
          const active = idx === activeStep;
          return (
            <View key={step.key} style={styles.stepRow}>
              <View
                style={[
                  styles.stepDot,
                  done && styles.stepDotDone,
                  active && styles.stepDotActive,
                ]}
              >
                {done ? <Text style={styles.checkText}>✓</Text> : null}
              </View>
              <Text
                style={[
                  styles.stepText,
                  done && styles.stepTextDone,
                  active && styles.stepTextActive,
                ]}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.hint}>
        Te notificaremos quando a ficha estiver pronta, mesmo que você troque de tela.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.lg },
  stepLabel: {
    color: colors.fordBlue,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  title: { ...typography.h1, marginBottom: 4 },
  subtitle: { ...typography.caption, fontSize: 14 },
  spinnerCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  spinnerText: { color: colors.textSecondary, marginTop: spacing.md, fontSize: 13 },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: spacing.lg,
  },
  progressFill: { height: 6, backgroundColor: colors.fordBlue, borderRadius: 3 },
  stepsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    borderColor: colors.fordBlue,
    backgroundColor: colors.fordBlue,
  },
  stepDotDone: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  checkText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  stepText: { color: colors.textSecondary, flex: 1 },
  stepTextActive: { color: colors.fordBlue, fontWeight: '700' },
  stepTextDone: { color: colors.textPrimary, fontWeight: '600' },
  hint: { ...typography.caption, textAlign: 'center' },
  errorWrapper: { padding: spacing.lg },
  errorTitle: { ...typography.h2, marginBottom: spacing.sm, color: colors.danger },
  errorMsg: { color: colors.textSecondary, marginBottom: spacing.lg },
});

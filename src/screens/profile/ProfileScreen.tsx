import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useAuth } from '@/contexts/AuthContext';
import { historyCache } from '@/storage/historyCache';
import { apiBaseUrl } from '@/api/client';
import { ensureNotificationPermission } from '@/notifications/localNotifications';
import { colors, radius, spacing, typography } from '@/theme/colors';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  async function clearCache() {
    setBusy(true);
    await historyCache.clearAll();
    setBusy(false);
    Alert.alert('Cache limpo', 'Histórico local removido. Puxe para baixo na aba histórico para sincronizar.');
  }

  async function requestNotifications() {
    const granted = await ensureNotificationPermission();
    Alert.alert(
      granted ? 'Notificações ativadas' : 'Notificações negadas',
      granted
        ? 'Avisaremos quando uma extração terminar.'
        : 'Você pode habilitar nas configurações do dispositivo.',
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Perfil</Text>

      <View style={styles.card}>
        <Row label="Nome" value={user?.full_name ?? '—'} />
        <Row label="E-mail" value={user?.email ?? '—'} />
        <Row label="Papel" value={user?.role ?? '—'} />
        <Row label="API" value={apiBaseUrl} />
      </View>

      <Text style={styles.sectionTitle}>Preferências</Text>
      <View style={styles.card}>
        <Button
          title="Ativar notificações"
          variant="secondary"
          onPress={requestNotifications}
        />
        <Button
          title="Limpar histórico local"
          variant="ghost"
          onPress={clearCache}
          loading={busy}
          style={{ marginTop: spacing.sm }}
        />
      </View>

      <Button title="Sair" variant="danger" onPress={logout} />
    </ScreenContainer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  sectionTitle: { ...typography.label, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { ...typography.caption, fontWeight: '600' },
  rowValue: { fontSize: 13, color: colors.textPrimary, maxWidth: '60%' },
});

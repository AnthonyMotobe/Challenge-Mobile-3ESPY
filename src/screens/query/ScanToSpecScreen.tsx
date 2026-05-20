import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Button } from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useQueryDraft, type QueryAttachment } from '@/contexts/QueryDraftContext';
import { historyCache } from '@/storage/historyCache';
import { colors, radius, spacing, typography } from '@/theme/colors';
import type { QueryStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<QueryStackParamList, 'ScanToSpec'>;

export function ScanToSpecScreen({ navigation }: Props) {
  const { draft, addAttachment, removeAttachment } = useQueryDraft();
  const [busy, setBusy] = useState<'camera' | 'gallery' | 'document' | null>(null);

  async function captureFromCamera() {
    try {
      setBusy('camera');
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permissão negada', 'Habilite o uso da câmera nas configurações.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      await attach({
        uri: asset.uri,
        name: asset.fileName ?? `scan-${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? 'image/jpeg',
        kind: 'image',
        size: asset.fileSize,
      });
    } catch (err) {
      Alert.alert('Erro', (err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function pickFromGallery() {
    try {
      setBusy('gallery');
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permissão negada', 'Habilite o acesso à galeria nas configurações.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: false,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      await attach({
        uri: asset.uri,
        name: asset.fileName ?? `picked-${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? 'image/jpeg',
        kind: 'image',
        size: asset.fileSize,
      });
    } catch (err) {
      Alert.alert('Erro', (err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function pickDocument() {
    try {
      setBusy('document');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      const isPdf = (asset.mimeType ?? '').includes('pdf');
      await attach({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? (isPdf ? 'application/pdf' : 'image/jpeg'),
        kind: isPdf ? 'pdf' : 'image',
        size: asset.size,
      });
    } catch (err) {
      Alert.alert('Erro', (err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function attach(attachment: QueryAttachment) {
    addAttachment(attachment);
    await historyCache.addScan({
      id: `${Date.now()}-${attachment.name}`,
      uri: attachment.uri,
      kind: attachment.kind,
      filename: attachment.name,
      createdAt: new Date().toISOString(),
    });
  }

  function onNext() {
    navigation.navigate('Processing');
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Passo 3 de 4</Text>
        <Text style={styles.title}>Scan-to-Spec</Text>
        <Text style={styles.subtitle}>
          (Opcional) Envie foto, print ou PDF do manual/ficha para refinar a extração.
        </Text>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Veículo</Text>
        <Text style={styles.summaryValue}>
          {draft.brand} {draft.model} · {draft.version}
        </Text>
        <Text style={styles.summaryMeta}>
          {draft.attributes.length} atributo(s) selecionado(s)
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.action} onPress={captureFromCamera} disabled={!!busy}>
          {busy === 'camera' ? (
            <ActivityIndicator color={colors.fordBlue} />
          ) : (
            <>
              <Text style={styles.actionIcon}>📷</Text>
              <Text style={styles.actionTitle}>Câmera</Text>
              <Text style={styles.actionDesc}>Fotografe placa, etiqueta ou ficha</Text>
            </>
          )}
        </Pressable>
        <Pressable style={styles.action} onPress={pickFromGallery} disabled={!!busy}>
          {busy === 'gallery' ? (
            <ActivityIndicator color={colors.fordBlue} />
          ) : (
            <>
              <Text style={styles.actionIcon}>🖼️</Text>
              <Text style={styles.actionTitle}>Galeria</Text>
              <Text style={styles.actionDesc}>Selecione uma imagem salva</Text>
            </>
          )}
        </Pressable>
        <Pressable style={styles.action} onPress={pickDocument} disabled={!!busy}>
          {busy === 'document' ? (
            <ActivityIndicator color={colors.fordBlue} />
          ) : (
            <>
              <Text style={styles.actionIcon}>📄</Text>
              <Text style={styles.actionTitle}>PDF / Documento</Text>
              <Text style={styles.actionDesc}>Manual ou catálogo oficial</Text>
            </>
          )}
        </Pressable>
      </View>

      {draft.attachments.length > 0 && (
        <View style={styles.attachments}>
          <Text style={styles.attachmentsTitle}>
            Anexos ({draft.attachments.length})
          </Text>
          {draft.attachments.map((att) => (
            <View key={att.uri} style={styles.attachmentRow}>
              {att.kind === 'image' ? (
                <Image source={{ uri: att.uri }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbPdf]}>
                  <Text style={styles.thumbPdfText}>PDF</Text>
                </View>
              )}
              <View style={styles.attachmentInfo}>
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {att.name}
                </Text>
                <Text style={styles.attachmentMeta}>
                  {att.kind.toUpperCase()}{att.size ? ` · ${(att.size / 1024).toFixed(0)} KB` : ''}
                </Text>
              </View>
              <Pressable onPress={() => removeAttachment(att.uri)} hitSlop={10}>
                <Text style={styles.remove}>Remover</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Button
        title={draft.attachments.length ? 'Continuar com anexos' : 'Pular e continuar'}
        onPress={onNext}
      />
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
  subtitle: { ...typography.caption },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  summaryTitle: { ...typography.label, marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  summaryMeta: { ...typography.caption, marginTop: 2 },
  actions: { gap: spacing.sm, marginBottom: spacing.lg },
  action: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    minHeight: 110,
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionIcon: { fontSize: 28, marginBottom: spacing.xs },
  actionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  actionDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  attachments: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  attachmentsTitle: { ...typography.label, marginBottom: spacing.sm },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.surface,
    marginRight: spacing.md,
  },
  thumbPdf: {
    backgroundColor: colors.fordBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbPdfText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  attachmentInfo: { flex: 1 },
  attachmentName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  attachmentMeta: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  remove: { color: colors.danger, fontWeight: '600', fontSize: 12 },
});

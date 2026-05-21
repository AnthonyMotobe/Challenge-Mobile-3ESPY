import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Chip } from '@/components/Chip';
import { useQueryDraft } from '@/contexts/QueryDraftContext';
import { colors, radius, spacing, typography } from '@/theme/colors';
import type { QueryStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<QueryStackParamList, 'VehicleForm'>;

const PRESETS: { brand: string; model: string; version: string }[] = [
  { brand: 'Ford', model: 'Ranger Raptor', version: '2024' },
  { brand: 'Ford', model: 'Mustang Mach-E', version: 'GT 2024' },
  { brand: 'Ford', model: 'Bronco', version: 'Wildtrak 2024' },
  { brand: 'Ford', model: 'Maverick', version: 'Tremor 2024' },
];

export function VehicleFormScreen({ navigation }: Props) {
  const { draft, setVehicle } = useQueryDraft();
  const [brand, setBrand] = useState(draft.brand);
  const [model, setModel] = useState(draft.model);
  const [version, setVersion] = useState(draft.version);

  useEffect(() => {
    setBrand(draft.brand);
    setModel(draft.model);
    setVersion(draft.version);
  }, [draft.brand, draft.model, draft.version]);

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setBrand(preset.brand);
    setModel(preset.model);
    setVersion(preset.version);
  }

  function onNext() {
    if (!brand.trim() || !model.trim() || !version.trim()) {
      Alert.alert('Campos obrigatórios', 'Informe marca, modelo e versão.');
      return;
    }
    setVehicle({ brand: brand.trim(), model: model.trim(), version: version.trim() });
    navigation.navigate('AttributeSelector');
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Passo 1 de 4</Text>
        <Text style={styles.title}>Sobre o veículo</Text>
        <Text style={styles.subtitle}>
          Quanto mais específica a versão, mais precisa fica a ficha técnica.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Sugestões rápidas</Text>
        <View style={styles.chips}>
          {PRESETS.map((preset) => {
            const isSelected =
              preset.brand === brand &&
              preset.model === model &&
              preset.version === version;
            return (
              <Chip
                key={`${preset.brand}-${preset.model}-${preset.version}`}
                label={`${preset.model} · ${preset.version}`}
                selected={isSelected}
                onPress={() => applyPreset(preset)}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Field
          label="Marca"
          value={brand}
          onChangeText={setBrand}
          placeholder="Ford"
          autoCapitalize="words"
        />
        <Field
          label="Modelo"
          value={model}
          onChangeText={setModel}
          placeholder="Ranger Raptor"
          autoCapitalize="words"
        />
        <Field
          label="Versão"
          value={version}
          onChangeText={setVersion}
          placeholder="2024"
          autoCapitalize="words"
        />
      </View>

      <Button title="Continuar" onPress={onNext} />
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
  section: { marginBottom: spacing.lg },
  sectionLabel: { ...typography.label, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
});

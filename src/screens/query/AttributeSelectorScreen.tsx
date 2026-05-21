import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Field } from '@/components/Field';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useQueryDraft } from '@/contexts/QueryDraftContext';
import { colors, radius, spacing, typography } from '@/theme/colors';
import type { QueryStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<QueryStackParamList, 'AttributeSelector'>;

const ATTRIBUTE_GROUPS: { title: string; items: string[] }[] = [
  {
    title: 'Motor & Performance',
    items: ['motor', 'potencia', 'torque maximo', '0-100 km/h', 'velocidade maxima'],
  },
  {
    title: 'Transmissão & Tração',
    items: ['transmissao', 'tracao', 'modos de conducao', 'modos de volante'],
  },
  {
    title: 'Suspensão & Rodagem',
    items: ['amortecedores', 'modos de amortecedor', 'rodas e pneus', 'altura do solo'],
  },
  {
    title: 'Conforto & Tecnologia',
    items: ['farois', 'central multimidia', 'assistentes de conducao', 'modos de escapamento'],
  },
  {
    title: 'Comercial',
    items: ['preco', 'consumo', 'garantia'],
  },
];

export function AttributeSelectorScreen({ navigation }: Props) {
  const { draft, setAttributes } = useQueryDraft();
  const [selected, setSelected] = useState<string[]>(draft.attributes);
  const [custom, setCustom] = useState('');

  useEffect(() => {
    setSelected(draft.attributes);
  }, [draft.attributes]);

  function toggle(attr: string) {
    setSelected((prev) =>
      prev.includes(attr) ? prev.filter((a) => a !== attr) : [...prev, attr],
    );
  }

  function addCustom() {
    const cleaned = custom.trim().toLowerCase();
    if (!cleaned) return;
    if (cleaned.length > 80) {
      Alert.alert('Atributo muito longo', 'Use até 80 caracteres.');
      return;
    }
    if (!/^[a-zA-Z0-9_\-\s\/]+$/.test(cleaned)) {
      Alert.alert('Caracteres inválidos', 'Use letras, números, _, - ou espaço.');
      return;
    }
    if (!selected.includes(cleaned)) setSelected([...selected, cleaned]);
    setCustom('');
  }

  function selectAll() {
    const all = Array.from(new Set(ATTRIBUTE_GROUPS.flatMap((g) => g.items)));
    setSelected(all);
  }

  function clearAll() {
    setSelected([]);
  }

  function onNext() {
    if (!selected.length) {
      Alert.alert('Selecione atributos', 'Escolha pelo menos um atributo.');
      return;
    }
    if (selected.length > 30) {
      Alert.alert('Limite excedido', 'Selecione no máximo 30 atributos.');
      return;
    }
    setAttributes(selected);
    navigation.navigate('Processing');
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Passo 2 de 3</Text>
        <Text style={styles.title}>O que extrair?</Text>
        <Text style={styles.subtitle}>
          Selecione os atributos da ficha técnica. Mínimo 1, máximo 30.
        </Text>
      </View>

      <View style={styles.controlRow}>
        <Text style={styles.countText}>{selected.length} selecionado(s)</Text>
        <View style={styles.controlButtons}>
          <Button title="Todos" variant="ghost" onPress={selectAll} />
          <Button title="Limpar" variant="ghost" onPress={clearAll} />
        </View>
      </View>

      {ATTRIBUTE_GROUPS.map((group) => (
        <View key={group.title} style={styles.group}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          <View style={styles.chips}>
            {group.items.map((item) => (
              <Chip
                key={item}
                label={item}
                selected={selected.includes(item)}
                onPress={() => toggle(item)}
              />
            ))}
          </View>
        </View>
      ))}

      <View style={styles.customCard}>
        <Text style={styles.groupTitle}>Atributo personalizado</Text>
        <Field
          label="Nome do atributo"
          value={custom}
          onChangeText={setCustom}
          placeholder="ex.: capacidade do porta-malas"
          autoCapitalize="none"
          onSubmitEditing={addCustom}
          returnKeyType="done"
        />
        <Button title="Adicionar" variant="secondary" onPress={addCustom} />
      </View>

      {selected.length > 0 && (
        <View style={styles.selectedCard}>
          <Text style={styles.groupTitle}>Selecionados</Text>
          <View style={styles.chips}>
            {selected.map((attr) => (
              <Chip key={attr} label={attr} selected onPress={() => toggle(attr)} />
            ))}
          </View>
        </View>
      )}

      <Button title="Continuar" onPress={onNext} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.md },
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
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  countText: { ...typography.label, color: colors.textPrimary },
  controlButtons: { flexDirection: 'row' },
  group: { marginBottom: spacing.lg },
  groupTitle: {
    ...typography.label,
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: 14,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  customCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  selectedCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
});

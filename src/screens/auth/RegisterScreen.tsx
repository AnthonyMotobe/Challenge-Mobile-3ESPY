import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeError } from '@/api/client';
import { colors, spacing, typography } from '@/theme/colors';
import type { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const PASSWORD_RULE = 'Mínimo 12 caracteres, com maiúscula, minúscula, número e símbolo.';

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!email.trim() || !password) {
      Alert.alert('Campos obrigatórios', 'Informe e-mail e senha.');
      return;
    }
    try {
      setLoading(true);
      await register({
        email: email.trim(),
        password,
        full_name: fullName.trim() || undefined,
      });
    } catch (err) {
      Alert.alert('Falha ao registrar', normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer padded={false} scroll>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.hero}>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>
            Acesse o backend Ford Spec Extractor e comece a consultar versões.
          </Text>
        </View>
        <View style={styles.form}>
          <Field
            label="Nome completo (opcional)"
            value={fullName}
            onChangeText={setFullName}
            placeholder="João Silva"
            autoCapitalize="words"
          />
          <Field
            label="E-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
          />
          <Field
            label="Senha"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            hint={PASSWORD_RULE}
            placeholder="Mínimo 12 caracteres"
          />
          <Button title="Cadastrar" onPress={onSubmit} loading={loading} />
          <Button
            title="Já tenho conta"
            variant="ghost"
            onPress={() => navigation.navigate('Login')}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: {
    backgroundColor: colors.fordBlue,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  title: {
    ...typography.h1,
    color: '#FFF',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: '#CBDAF2',
    fontSize: 14,
  },
  form: {
    padding: spacing.lg,
  },
});

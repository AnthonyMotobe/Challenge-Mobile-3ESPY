import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeError } from '@/api/client';
import { colors, spacing, typography } from '@/theme/colors';
import type { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
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
      await login({ email: email.trim(), password });
    } catch (err) {
      Alert.alert('Falha ao entrar', normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scroll padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>FORD</Text>
            <Text style={styles.logoSub}>Scan-to-Spec</Text>
          </View>
          <Text style={styles.title}>Bem-vindo de volta</Text>
          <Text style={styles.subtitle}>
            Extraia fichas técnicas padronizadas em segundos, com a fonte de
            cada informação.
          </Text>
        </View>
        <View style={styles.form}>
          <Field
            label="E-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
          />
          <Field
            label="Senha"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Sua senha"
          />
          <Button title="Entrar" onPress={onSubmit} loading={loading} />
          <Button
            title="Criar conta"
            variant="secondary"
            onPress={() => navigation.navigate('Register')}
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
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logo: {
    marginBottom: spacing.lg,
  },
  logoText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
  },
  logoSub: {
    color: '#A8C0EC',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
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
    flex: 1,
  },
});

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme/colors';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string | null;
}

/**
 * Rede de segurança: captura exceções de renderização em qualquer tela e
 * mostra um fallback amigável em vez de uma tela branca / app morto.
 * Em produção, `componentDidCatch` deveria reportar para Sentry/Crashlytics.
 */
export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: null };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Erro inesperado',
    };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('[AppErrorBoundary]', error);
  }

  private handleReset = () => {
    this.setState({ hasError: false, message: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={styles.title}>Algo deu errado</Text>
        <Text style={styles.message}>
          {this.state.message ?? 'O app encontrou um problema inesperado.'}
        </Text>
        <Pressable style={styles.button} onPress={this.handleReset}>
          <Text style={styles.buttonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emoji: { fontSize: 44, marginBottom: spacing.md },
  title: { ...typography.h2, marginBottom: spacing.sm },
  message: {
    ...typography.caption,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.fordBlue,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});

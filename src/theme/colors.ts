export const colors = {
  fordBlue: '#0A1F44',
  fordBlueLight: '#1B3A7A',
  fordBlueDark: '#06122B',
  accent: '#3B82F6',
  background: '#F5F7FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2F8',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  truthHigh: '#16A34A',
  truthMed: '#F59E0B',
  truthLow: '#DC2626',
  truthMissing: '#94A3B8',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: colors.textPrimary },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.textPrimary },
  h3: { fontSize: 18, fontWeight: '600' as const, color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.textPrimary },
  caption: { fontSize: 13, fontWeight: '400' as const, color: colors.textSecondary },
  label: { fontSize: 13, fontWeight: '600' as const, color: colors.textSecondary },
};

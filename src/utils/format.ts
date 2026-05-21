import { colors } from '@/theme/colors';

/** "torque maximo" → "Torque Maximo". Fonte única de title-case do app. */
export function titleCase(value: string): string {
  return value
    .split(' ')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

/** ISO → "21/05 14:30" (pt-BR, curto). Tolera datas inválidas devolvendo o cru. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Rótulo legível para o status de uma consulta. */
export function translateStatus(status: string): string {
  switch (status) {
    case 'completed':
      return 'Concluída';
    case 'failed':
      return 'Falhou';
    case 'pending':
      return 'Em processamento';
    default:
      return status;
  }
}

/** Cor de texto (fg) e de fundo (bg) por status — usada em Home e Histórico. */
export function statusPalette(status: string): { fg: string; bg: string } {
  switch (status) {
    case 'completed':
      return { fg: colors.success, bg: '#DCFCE7' };
    case 'failed':
      return { fg: colors.danger, bg: '#FEE2E2' };
    case 'pending':
      return { fg: colors.warning, bg: '#FEF3C7' };
    default:
      return { fg: colors.textSecondary, bg: colors.surfaceAlt };
  }
}

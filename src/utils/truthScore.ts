import type { SpecOut } from '@/types/api';
import { colors } from '@/theme/colors';

export type TruthLevel = 'high' | 'medium' | 'low' | 'missing';

export interface TruthScore {
  value: number;
  level: TruthLevel;
  label: string;
  color: string;
}

const OFFICIAL_KEYWORDS = [
  'ficha tecnica',
  'ficha técnica',
  'manual',
  'catalog',
  'catalogo',
  'catálogo',
  'press release',
  'press kit',
  'oficial',
  'official',
  'specsheet',
  'spec sheet',
  'site oficial',
  'website',
  'ford.com',
];

const REVIEW_KEYWORDS = [
  'review',
  'reportagem',
  'autoesporte',
  'quatro rodas',
  'carplace',
  'webmotors',
  'motor1',
  'icarros',
  'uol carros',
  'youtube',
];

function classifySource(sourceHint: string | null | undefined): TruthLevel {
  if (!sourceHint) return 'low';
  const normalized = sourceHint.toLowerCase();
  if (OFFICIAL_KEYWORDS.some((kw) => normalized.includes(kw))) return 'high';
  if (REVIEW_KEYWORDS.some((kw) => normalized.includes(kw))) return 'medium';
  return 'low';
}

export function computeTruthScore(spec: SpecOut): TruthScore {
  if (!spec.available || !spec.value) {
    return {
      value: 0,
      level: 'missing',
      label: 'Não encontrado',
      color: colors.truthMissing,
    };
  }

  const sourceLevel = classifySource(spec.source_hint);
  const hasUnit = spec.normalized_unit !== null && spec.normalized_unit !== '';

  let score = 0.5;
  if (sourceLevel === 'high') score += 0.4;
  else if (sourceLevel === 'medium') score += 0.2;
  if (hasUnit) score += 0.1;
  score = Math.min(score, 1);

  let level: TruthLevel;
  let label: string;
  let color: string;

  if (score >= 0.85) {
    level = 'high';
    label = 'Alta confiança';
    color = colors.truthHigh;
  } else if (score >= 0.6) {
    level = 'medium';
    label = 'Confiança moderada';
    color = colors.truthMed;
  } else {
    level = 'low';
    label = 'Baixa confiança';
    color = colors.truthLow;
  }

  return { value: score, level, label, color };
}

export function aggregateTruthScore(specs: SpecOut[]): TruthScore {
  if (!specs.length) {
    return { value: 0, level: 'missing', label: 'Sem dados', color: colors.truthMissing };
  }
  const available = specs.filter((s) => s.available);
  if (!available.length) {
    return {
      value: 0,
      level: 'missing',
      label: 'Nenhum atributo encontrado',
      color: colors.truthMissing,
    };
  }
  const sum = available.reduce((acc, s) => acc + computeTruthScore(s).value, 0);
  const avg = sum / specs.length;
  let level: TruthLevel;
  let label: string;
  let color: string;
  if (avg >= 0.8) {
    level = 'high';
    label = 'Ficha confiável';
    color = colors.truthHigh;
  } else if (avg >= 0.55) {
    level = 'medium';
    label = 'Ficha parcialmente confiável';
    color = colors.truthMed;
  } else {
    level = 'low';
    label = 'Baixa confiança geral';
    color = colors.truthLow;
  }
  return { value: avg, level, label, color };
}

export function detectConflicts(specs: SpecOut[]): SpecOut[] {
  const byAttribute = new Map<string, SpecOut[]>();
  for (const s of specs) {
    const list = byAttribute.get(s.attribute) ?? [];
    list.push(s);
    byAttribute.set(s.attribute, list);
  }
  const conflicts: SpecOut[] = [];
  for (const list of byAttribute.values()) {
    if (list.length < 2) continue;
    const uniqueValues = new Set(list.map((s) => (s.value ?? '').trim().toLowerCase()));
    if (uniqueValues.size > 1) conflicts.push(...list);
  }
  return conflicts;
}

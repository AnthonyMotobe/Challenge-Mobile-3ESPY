import type { SpecOut } from '@/types/api';

/** Cores por slot de veículo (até 4 veículos comparáveis). */
export const VEHICLE_PALETTE = [
  { primary: '#2563EB', soft: '#DBEAFE', label: 'Veículo 1' }, // azul
  { primary: '#9333EA', soft: '#F3E8FF', label: 'Veículo 2' }, // roxo
  { primary: '#059669', soft: '#D1FAE5', label: 'Veículo 3' }, // verde
  { primary: '#EA580C', soft: '#FFEDD5', label: 'Veículo 4' }, // laranja
];

/** Categorias de atributos pra agrupamento visual. */
export const ATTRIBUTE_CATEGORIES: { title: string; emoji: string; keys: string[] }[] = [
  {
    title: 'Motor & Performance',
    emoji: '⚡',
    keys: ['motor', 'potencia', 'torque maximo', '0-100 km/h', 'velocidade maxima'],
  },
  {
    title: 'Transmissão & Tração',
    emoji: '⚙️',
    keys: ['transmissao', 'tracao', 'modos de conducao', 'modos de volante'],
  },
  {
    title: 'Suspensão & Rodagem',
    emoji: '🛞',
    keys: ['amortecedores', 'modos de amortecedor', 'rodas e pneus', 'altura do solo'],
  },
  {
    title: 'Tecnologia & Conforto',
    emoji: '✨',
    keys: ['farois', 'central multimidia', 'assistentes de conducao', 'modos de escapamento'],
  },
  {
    title: 'Elétrico & Autonomia',
    emoji: '🔋',
    keys: ['bateria', 'autonomia', 'carregamento rapido'],
  },
  {
    title: 'Comercial',
    emoji: '💰',
    keys: ['preco', 'consumo', 'garantia', 'capacidade tanque'],
  },
];

/** Atributos onde MAIOR é melhor. */
const HIGHER_IS_BETTER = new Set([
  'potencia',
  'torque maximo',
  'autonomia',
  'bateria',
  'garantia',
  'consumo', // km/l - quanto maior, melhor
  'velocidade maxima',
  'altura do solo',
  'carregamento rapido',
  'capacidade tanque',
]);

/** Atributos onde MENOR é melhor. */
const LOWER_IS_BETTER = new Set([
  '0-100 km/h',
  'preco',
]);

/** Extrai o primeiro número de uma string ("397 cv @ 5650 RPM" → 397). */
export function extractNumber(value: string | null | undefined): number | null {
  if (!value) return null;
  // Trata formato brasileiro (499.000 ou 499,000) e decimal (5.8 ou 5,8)
  const cleaned = value.replace(/R\$\s*/i, '').replace(/\s/g, '');
  // Pega o primeiro número (com separadores)
  const match = cleaned.match(/[\d]+([.,]\d+)?([.,]\d+)?/);
  if (!match) return null;
  let raw = match[0];
  // Se tem dois separadores, assume formato 499.000,00 (BR) ou 499,000.00 (US)
  if ((raw.match(/[.,]/g) || []).length >= 2) {
    // Remove o separador de milhar (o primeiro) e converte vírgula final para ponto
    raw = raw.replace(/\.(?=\d{3})/g, '').replace(',', '.');
  } else if (raw.includes(',') && !raw.includes('.')) {
    // Formato 5,8 → 5.8
    raw = raw.replace(',', '.');
  }
  const num = parseFloat(raw);
  return isNaN(num) ? null : num;
}

export type WinnerStrategy = 'higher' | 'lower' | 'none';

export function winnerStrategyFor(attribute: string): WinnerStrategy {
  const normalized = attribute.toLowerCase();
  if (HIGHER_IS_BETTER.has(normalized)) return 'higher';
  if (LOWER_IS_BETTER.has(normalized)) return 'lower';
  return 'none';
}

/** Identifica o índice do vencedor entre as células (ou null se não dá pra decidir). */
export function findWinnerIndex(
  cells: (SpecOut | null)[],
  attribute: string,
): number | null {
  const strategy = winnerStrategyFor(attribute);
  if (strategy === 'none') return null;
  const numericPairs = cells
    .map((c, idx) => ({ idx, num: c?.available ? extractNumber(c.value) : null }))
    .filter((p): p is { idx: number; num: number } => p.num !== null);
  if (numericPairs.length < 2) return null;
  const sorted = [...numericPairs].sort((a, b) =>
    strategy === 'higher' ? b.num - a.num : a.num - b.num,
  );
  // Empate na primeira posição → sem vencedor claro
  if (sorted.length > 1 && sorted[0].num === sorted[1].num) return null;
  return sorted[0].idx;
}

/** Calcula percentual relativo entre células numéricas (pra barra visual). */
export function relativeBarValues(
  cells: (SpecOut | null)[],
): (number | null)[] {
  const numbers = cells.map((c) =>
    c?.available ? extractNumber(c.value) : null,
  );
  const validNumbers = numbers.filter((n): n is number => n !== null);
  if (validNumbers.length < 2) return numbers.map(() => null);
  const max = Math.max(...validNumbers);
  if (max === 0) return numbers.map(() => null);
  return numbers.map((n) => (n === null ? null : n / max));
}

/** Detecta se todos os valores não-nulos são iguais. */
export function valuesMatch(cells: (SpecOut | null)[]): boolean {
  const values = cells
    .filter((c): c is SpecOut => c !== null && c.available)
    .map((c) => (c.value ?? '').trim().toLowerCase());
  if (values.length < 2) return false;
  return new Set(values).size === 1;
}

/** Detecta se os valores divergem (≥2 valores diferentes). */
export function valuesDiverge(cells: (SpecOut | null)[]): boolean {
  const values = cells
    .filter((c): c is SpecOut => c !== null && c.available)
    .map((c) => (c.value ?? '').trim().toLowerCase());
  if (values.length < 2) return false;
  return new Set(values).size > 1;
}

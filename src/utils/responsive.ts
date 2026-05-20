import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Baseline: iPhone 13 / 14 (390pt). Escala fontes proporcionalmente.
const BASE_WIDTH = 390;

export const screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: SCREEN_WIDTH < 360,
  isLarge: SCREEN_WIDTH >= 430,
};

export function scaleFont(size: number): number {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  // Limita pra não ficar gigante em tablets nem minúsculo em iPhone SE
  const clamped = Math.max(size - 2, Math.min(size + 4, newSize));
  return Math.round(PixelRatio.roundToNearestPixel(clamped));
}

export function scaleSpacing(value: number): number {
  if (screen.isSmall) return Math.max(4, Math.round(value * 0.85));
  if (screen.isLarge) return Math.round(value * 1.1);
  return value;
}

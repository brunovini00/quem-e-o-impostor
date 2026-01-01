// Vibration API utilities

type VibrationType = 'short' | 'medium' | 'long' | 'impostor' | 'victory' | 'defeat' | 'warning';

const VIBRATION_PATTERNS: Record<VibrationType, number | number[]> = {
  short: 50,
  medium: 100,
  long: 200,
  impostor: [100, 50, 100, 50, 300],
  victory: [50, 50, 50, 50, 100, 100, 200],
  defeat: [300, 100, 300],
  warning: [100, 100, 100],
};

export function vibrate(type: VibrationType, enabled: boolean = true): void {
  if (!enabled) return;
  
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(VIBRATION_PATTERNS[type]);
    }
  } catch (error) {
    console.warn('Vibration failed:', error);
  }
}

export function stopVibration(): void {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
  } catch (error) {
    // Ignore
  }
}

export function isVibrationSupported(): boolean {
  return 'vibrate' in navigator;
}

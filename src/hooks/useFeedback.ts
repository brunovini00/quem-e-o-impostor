import { useCallback } from 'react';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import type { Settings } from '../domain/types';
// Mesmo som e vibração para os dois papéis: feedback não denuncia o impostor.
export function useFeedback(settings: Settings) {
  const player = useAudioPlayer(require('../../assets/tick.wav'));
  return useCallback(() => {
    if (settings.haptics) void Haptics.selectionAsync().catch(() => undefined);
    if (settings.sound)
      void player
        .seekTo(0)
        .then(() => player.play())
        .catch(() => undefined);
  }, [player, settings.haptics, settings.sound]);
}

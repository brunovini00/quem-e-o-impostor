import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { themes } from '../data/themes';
import { DEFAULT_SETTINGS, type Preferences } from '../domain/types';
import { loadPreferences, savePreferences } from '../services/storage';
export const defaultPreferences = (): Preferences => ({
  players: [],
  selectedThemeIds: themes.slice(0, 3).map((t) => t.id),
  settings: { ...DEFAULT_SETTINGS },
  history: [],
});
export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [loaded, setLoaded] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const queue = useRef(Promise.resolve());
  useEffect(() => {
    let alive = true;
    loadPreferences(AsyncStorage)
      .then((saved) => {
        if (alive && saved)
          setPreferences({
            ...saved,
            selectedThemeIds: saved.selectedThemeIds.filter((id) =>
              themes.some((t) => t.id === id),
            ),
          });
        if (alive) setCanSave(true);
      })
      .catch(() => {
        if (alive) setStorageError(true);
      })
      .finally(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!loaded || !canSave) return;
    queue.current = queue.current
      .then(() => savePreferences(AsyncStorage, preferences))
      .then(() => setStorageError(false))
      .catch(() => setStorageError(true));
  }, [loaded, canSave, preferences]);
  return { preferences, setPreferences, loaded, storageError };
}

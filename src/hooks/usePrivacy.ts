import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';

export function usePrivacy(onCover: () => void) {
  const [focused, setFocused] = useState(AppState.currentState === 'active');
  const [protectedScreen, setProtectedScreen] = useState(Platform.OS === 'web');
  const [protectionError, setProtectionError] = useState(false);
  const coverRef = useRef(onCover);
  useEffect(() => {
    coverRef.current = onCover;
  }, [onCover]);
  const protect = useCallback(async () => {
    if (Platform.OS === 'web') return;
    setProtectionError(false);
    try {
      await ScreenCapture.preventScreenCaptureAsync('impostor');
      if (Platform.OS === 'ios') await ScreenCapture.enableAppSwitcherProtectionAsync(1);
      setProtectedScreen(true);
    } catch {
      setProtectedScreen(false);
      setProtectionError(true);
    }
  }, []);
  useEffect(() => {
    void protect();
  }, [protect]);
  useEffect(() => {
    const cover = () => {
      coverRef.current();
      setFocused(false);
    };
    const change = AppState.addEventListener('change', (state) => {
      if (state !== 'active') cover();
      else setFocused(true);
    });
    const blur = Platform.OS === 'android' ? AppState.addEventListener('blur', cover) : null;
    const focus =
      Platform.OS === 'android'
        ? AppState.addEventListener('focus', () => {
            if (AppState.currentState === 'active') setFocused(true);
          })
        : null;
    const visibility = () => {
      if (document.hidden) cover();
      else setFocused(true);
    };
    const webBlur = () => cover();
    const webFocus = () => {
      if (!document.hidden) setFocused(true);
    };
    if (Platform.OS === 'web') {
      document.addEventListener('visibilitychange', visibility);
      window.addEventListener('blur', webBlur);
      window.addEventListener('focus', webFocus);
    }
    return () => {
      change.remove();
      blur?.remove();
      focus?.remove();
      if (Platform.OS === 'web') {
        document.removeEventListener('visibilitychange', visibility);
        window.removeEventListener('blur', webBlur);
        window.removeEventListener('focus', webFocus);
      }
    };
  }, []);
  // Proteção nativa permanece ativa até encerrar o processo, evitando janelas sem proteção nas transições.
  return {
    focused,
    protectedScreen,
    protectionError,
    retryProtection: () => {
      void protect();
    },
  };
}

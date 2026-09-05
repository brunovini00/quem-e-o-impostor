import { useCallback, useRef } from 'react';
import { Platform, type View } from 'react-native';

/** Keeps browser text gestures from competing with a control's press gesture. */
export function useNonSelectablePressRef() {
  const detachRef = useRef<(() => void) | null>(null);
  return useCallback((node: View | null) => {
    detachRef.current?.();
    detachRef.current = null;
    if (Platform.OS !== 'web' || !node) return;

    // React Native Web forwards the View ref to its DOM element.
    const element = node as unknown as HTMLElement;
    element.style.setProperty('user-select', 'none');
    element.style.setProperty('-webkit-user-select', 'none');
    element.style.setProperty('-webkit-touch-callout', 'none');

    const preventDefault = (event: Event) => event.preventDefault();
    const events = ['contextmenu', 'selectstart', 'dragstart'] as const;
    for (const event of events) element.addEventListener(event, preventDefault);

    detachRef.current = () => {
      for (const event of events) element.removeEventListener(event, preventDefault);
    };
  }, []);
}

import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppState, Platform, type AppStateStatus } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';
import { useCountdown } from '../src/hooks/useCountdown';
import { usePrivacy } from '../src/hooks/usePrivacy';

jest.mock('expo-screen-capture', () => ({
  preventScreenCaptureAsync: jest.fn(() => Promise.resolve()),
  enableAppSwitcherProtectionAsync: jest.fn(() => Promise.resolve()),
}));

describe('cronômetro da discussão', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2030-01-01T12:00:00Z'));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('só começa na discussão e respeita a opção desligado', () => {
    const onExpire = jest.fn();
    const { result, rerender } = renderHook(
      ({ active }: { active: boolean }) => useCountdown(10, active, onExpire),
      {
        initialProps: { active: false },
      },
    );
    act(() => {
      jest.advanceTimersByTime(12000);
    });
    expect(result.current).toMatchObject({ remaining: 10, running: false });
    expect(onExpire).not.toHaveBeenCalled();
    rerender({ active: true });
    act(() => {
      jest.advanceTimersByTime(2500);
    });
    expect(result.current).toMatchObject({ remaining: 8, running: true });
    const disabled = renderHook(() => useCountdown(0, true, onExpire));
    expect(disabled.result.current).toMatchObject({ remaining: 0, running: false });
  });

  it('pausa, retoma e emite expiração somente uma vez', () => {
    const onExpire = jest.fn();
    const { result } = renderHook(() => useCountdown(10, true, onExpire));
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    act(() => {
      result.current.toggle();
    });
    expect(result.current).toMatchObject({ remaining: 8, running: false });
    act(() => {
      jest.advanceTimersByTime(20000);
    });
    expect(result.current.remaining).toBe(8);
    act(() => {
      result.current.toggle();
    });
    act(() => {
      jest.advanceTimersByTime(8000);
    });
    expect(result.current).toMatchObject({ remaining: 0, running: false });
    expect(onExpire).toHaveBeenCalledTimes(1);
    act(() => {
      jest.advanceTimersByTime(20000);
      result.current.toggle();
    });
    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(result.current.running).toBe(false);
  });

  it('usa tempo absoluto quando a execução de intervalos foi suspensa', () => {
    const onExpire = jest.fn();
    const { result } = renderHook(() => useCountdown(10, true, onExpire));
    act(() => {
      jest.setSystemTime(new Date('2030-01-01T12:00:30Z'));
      jest.advanceTimersByTime(250);
    });
    expect(result.current.remaining).toBe(0);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('para ao sair da discussão e não toca feedback depois do resultado', () => {
    const onExpire = jest.fn();
    const { result, rerender } = renderHook(
      ({ active }: { active: boolean }) => useCountdown(3, active, onExpire),
      {
        initialProps: { active: true },
      },
    );
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    rerender({ active: false });
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current).toMatchObject({ remaining: 2, running: false });
    expect(onExpire).not.toHaveBeenCalled();
  });

  it('usa o callback atualizado e uma montagem nova inicia outra rodada', () => {
    const first = jest.fn();
    const current = jest.fn();
    const { rerender, unmount } = renderHook(
      ({ onExpire }: { onExpire: () => void }) => useCountdown(2, true, onExpire),
      {
        initialProps: { onExpire: first },
      },
    );
    rerender({ onExpire: current });
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(first).not.toHaveBeenCalled();
    expect(current).toHaveBeenCalledTimes(1);
    unmount();
    const next = renderHook(() => useCountdown(2, true, first));
    expect(next.result.current).toMatchObject({ remaining: 2, running: true });
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(first).toHaveBeenCalledTimes(1);
  });
});

describe('proteção de tela e ciclo de vida nativo', () => {
  type Listener = (status: AppStateStatus) => void;
  const listeners = new Map<string, Set<Listener>>();
  const originalPlatformOS = Object.getOwnPropertyDescriptor(Platform, 'OS');
  const originalAppState = AppState.currentState;

  function setPlatform(os: 'android' | 'ios') {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: os });
  }

  function emit(
    event: 'change' | 'blur' | 'focus',
    status: AppStateStatus = AppState.currentState,
  ) {
    if (event === 'change') AppState.currentState = status;
    act(() => {
      listeners.get(event)?.forEach((listener) => listener(status));
    });
  }

  beforeEach(() => {
    listeners.clear();
    setPlatform('android');
    AppState.currentState = 'active';
    jest.mocked(ScreenCapture.preventScreenCaptureAsync).mockReset().mockResolvedValue(undefined);
    jest
      .mocked(ScreenCapture.enableAppSwitcherProtectionAsync)
      .mockReset()
      .mockResolvedValue(undefined);
    jest.spyOn(AppState, 'addEventListener').mockImplementation((event, listener) => {
      const group = listeners.get(event) ?? new Set<Listener>();
      group.add(listener);
      listeners.set(event, group);
      return {
        remove: () => {
          group.delete(listener);
        },
      };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalPlatformOS) Object.defineProperty(Platform, 'OS', originalPlatformOS);
    AppState.currentState = originalAppState;
  });

  it('ativa proteção Android, cobre no blur/background e só libera foco quando ativo', async () => {
    const onCover = jest.fn();
    const { result } = renderHook(() => usePrivacy(onCover));
    await waitFor(() => expect(result.current.protectedScreen).toBe(true));
    expect(ScreenCapture.preventScreenCaptureAsync).toHaveBeenCalledWith('impostor');
    expect(ScreenCapture.enableAppSwitcherProtectionAsync).not.toHaveBeenCalled();
    emit('blur');
    expect(result.current.focused).toBe(false);
    expect(onCover).toHaveBeenCalledTimes(1);
    emit('focus');
    expect(result.current.focused).toBe(true);
    emit('change', 'background');
    expect(result.current.focused).toBe(false);
    emit('focus');
    expect(result.current.focused).toBe(false);
    emit('change', 'active');
    expect(result.current.focused).toBe(true);
  });

  it('ativa também cobertura de aplicativos recentes no iOS', async () => {
    setPlatform('ios');
    const onCover = jest.fn();
    const { result } = renderHook(() => usePrivacy(onCover));
    await waitFor(() => expect(result.current.protectedScreen).toBe(true));
    expect(ScreenCapture.enableAppSwitcherProtectionAsync).toHaveBeenCalledWith(1);
    expect(listeners.has('blur')).toBe(false);
    emit('change', 'inactive');
    expect(onCover).toHaveBeenCalledTimes(1);
    expect(result.current.focused).toBe(false);
  });

  it('mantém conteúdo bloqueado após falha nativa e permite tentar novamente', async () => {
    jest
      .mocked(ScreenCapture.preventScreenCaptureAsync)
      .mockRejectedValueOnce(new Error('Falha nativa simulada.'));
    const { result } = renderHook(() => usePrivacy(jest.fn()));
    await waitFor(() => expect(result.current.protectionError).toBe(true));
    expect(result.current.protectedScreen).toBe(false);
    act(() => {
      result.current.retryProtection();
    });
    await waitFor(() => expect(result.current.protectedScreen).toBe(true));
    expect(result.current.protectionError).toBe(false);
    expect(ScreenCapture.preventScreenCaptureAsync).toHaveBeenCalledTimes(2);
  });

  it('considera falha na proteção de recentes iOS como bloqueio recuperável', async () => {
    setPlatform('ios');
    jest
      .mocked(ScreenCapture.enableAppSwitcherProtectionAsync)
      .mockRejectedValueOnce(new Error('Recentes indisponível.'));
    const { result } = renderHook(() => usePrivacy(jest.fn()));
    await waitFor(() => expect(result.current.protectionError).toBe(true));
    expect(result.current.protectedScreen).toBe(false);
    act(() => {
      result.current.retryProtection();
    });
    await waitFor(() => expect(result.current.protectedScreen).toBe(true));
  });

  it('usa o callback mais recente e remove observadores ao desmontar', async () => {
    const oldCallback = jest.fn();
    const newCallback = jest.fn();
    const { result, rerender, unmount } = renderHook(
      ({ onCover }: { onCover: () => void }) => usePrivacy(onCover),
      {
        initialProps: { onCover: oldCallback },
      },
    );
    await waitFor(() => expect(result.current.protectedScreen).toBe(true));
    rerender({ onCover: newCallback });
    emit('blur');
    expect(newCallback).toHaveBeenCalledTimes(1);
    expect(oldCallback).not.toHaveBeenCalled();
    unmount();
    emit('change', 'background');
    expect(newCallback).toHaveBeenCalledTimes(1);
    expect([...listeners.values()].every((group) => group.size === 0)).toBe(true);
  });
});

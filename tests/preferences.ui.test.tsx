import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS, type Preferences } from '../src/domain/types';
import { defaultPreferences, usePreferences } from '../src/hooks/usePreferences';
import { PREFERENCES_KEY } from '../src/services/storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

jest.mock('../src/data/themes', () => ({
  themes: [
    { id: 'food', name: 'Comidas', emoji: '🍕', description: 'Sabores', words: [] },
    { id: 'animals', name: 'Animais', emoji: '🐼', description: 'Natureza', words: [] },
    { id: 'music', name: 'Música', emoji: '🎵', description: 'Sons', words: [] },
    { id: 'sports', name: 'Esportes', emoji: '⚽', description: 'Movimento', words: [] },
  ],
}));

const savedPreferences: Preferences = {
  players: [
    { id: 'ana', name: 'Ana' },
    { id: 'bia', name: 'Bia' },
    { id: 'caio', name: 'Caio' },
  ],
  selectedThemeIds: ['music'],
  settings: { ...DEFAULT_SETTINGS, sound: true },
  history: ['pitanga'],
};

function serialize(preferences: Preferences): string {
  return JSON.stringify({ version: 1, preferences });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}

describe('hidratação e gravação de preferências', () => {
  beforeEach(() => {
    jest.mocked(AsyncStorage.getItem).mockReset().mockResolvedValue(null);
    jest.mocked(AsyncStorage.setItem).mockReset().mockResolvedValue(undefined);
    jest.mocked(AsyncStorage.removeItem).mockReset().mockResolvedValue(undefined);
  });

  it('aguarda a leitura e preserva os dados salvos antes do primeiro autosave', async () => {
    const read = deferred<string | null>();
    jest.mocked(AsyncStorage.getItem).mockReturnValue(read.promise);
    const { result } = renderHook(() => usePreferences());
    expect(result.current.loaded).toBe(false);
    expect(result.current.preferences).toEqual(defaultPreferences());
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    await act(async () => {
      read.resolve(
        serialize({ ...savedPreferences, selectedThemeIds: ['music', 'removed-theme'] }),
      );
    });
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.preferences).toEqual(savedPreferences);
    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1));
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(PREFERENCES_KEY, serialize(savedPreferences));
  });

  it('falha de leitura mantém uso em memória e nunca sobrescreve dados existentes', async () => {
    const stored = new Map([[PREFERENCES_KEY, serialize(savedPreferences)]]);
    jest
      .mocked(AsyncStorage.getItem)
      .mockRejectedValue(new Error('Leitura temporariamente indisponível.'));
    jest.mocked(AsyncStorage.setItem).mockImplementation(async (key, value) => {
      stored.set(key, value);
    });
    const { result } = renderHook(() => usePreferences());
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.storageError).toBe(true);
    expect(result.current.preferences).toEqual(defaultPreferences());
    act(() => {
      result.current.setPreferences({ ...defaultPreferences(), players: savedPreferences.players });
    });
    expect(result.current.preferences.players).toEqual(savedPreferences.players);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(stored.get(PREFERENCES_KEY)).toBe(serialize(savedPreferences));
  });

  it('serializa gravações para que a preferência mais recente seja a última persistida', async () => {
    const writes: { value: string; complete: () => void }[] = [];
    jest.mocked(AsyncStorage.setItem).mockImplementation((_key, value) => {
      const write = deferred<void>();
      writes.push({ value, complete: () => write.resolve() });
      return write.promise;
    });
    const { result } = renderHook(() => usePreferences());
    await waitFor(() => expect(writes).toHaveLength(1));
    const firstEdit = { ...defaultPreferences(), players: savedPreferences.players };
    act(() => {
      result.current.setPreferences(firstEdit);
    });
    const lastEdit = { ...firstEdit, settings: { ...firstEdit.settings, sound: true } };
    act(() => {
      result.current.setPreferences(lastEdit);
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    await act(async () => {
      writes[0]!.complete();
    });
    await waitFor(() => expect(writes).toHaveLength(2));
    expect(writes[1]!.value).toBe(serialize(firstEdit));
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
    await act(async () => {
      writes[1]!.complete();
    });
    await waitFor(() => expect(writes).toHaveLength(3));
    expect(writes[2]!.value).toBe(serialize(lastEdit));
    await act(async () => {
      writes[2]!.complete();
    });
    expect(result.current.preferences).toEqual(lastEdit);
    expect(result.current.storageError).toBe(false);
  });

  it('uma falha de gravação avisa e não impede a próxima atualização', async () => {
    jest
      .mocked(AsyncStorage.setItem)
      .mockRejectedValueOnce(new Error('Sem espaço temporariamente.'));
    const { result } = renderHook(() => usePreferences());
    await waitFor(() => expect(result.current.storageError).toBe(true));
    act(() => {
      result.current.setPreferences(savedPreferences);
    });
    await waitFor(() => expect(result.current.storageError).toBe(false));
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
    expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
      PREFERENCES_KEY,
      serialize(savedPreferences),
    );
  });

  it('recupera JSON corrompido e cria objetos padrão independentes', async () => {
    jest.mocked(AsyncStorage.getItem).mockResolvedValue('{json inválido');
    const { result } = renderHook(() => usePreferences());
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.preferences).toEqual(defaultPreferences());
    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1));
    const first = defaultPreferences();
    const second = defaultPreferences();
    first.settings.sound = true;
    first.players.push({ id: 'draft', name: 'Nova pessoa' });
    expect(second.settings.sound).toBe(false);
    expect(second.players).toEqual([]);
  });

  it('desmontar antes da leitura terminar não inicia autosave', async () => {
    const read = deferred<string | null>();
    jest.mocked(AsyncStorage.getItem).mockReturnValue(read.promise);
    const { unmount } = renderHook(() => usePreferences());
    unmount();
    await act(async () => {
      read.resolve(serialize(savedPreferences));
    });
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });
});

import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, type Preferences } from '../../domain/types';
import { players } from '../../domain/__tests__/fixtures';
import {
  clearPreferences,
  loadPreferences,
  PREFERENCES_KEY,
  savePreferences,
  type StorageAdapter,
} from '../storage';

function memoryStorage() {
  const data = new Map<string, string>();
  const adapter: StorageAdapter = {
    getItem: async (key) => data.get(key) ?? null,
    setItem: async (key, value) => {
      data.set(key, value);
    },
    removeItem: async (key) => {
      data.delete(key);
    },
  };
  return { data, adapter };
}

function preferences(): Preferences {
  return {
    players: players(),
    selectedThemeIds: ['food'],
    settings: { ...DEFAULT_SETTINGS },
    history: ['arroz'],
  };
}

describe('preferências locais versionadas', () => {
  it('salva e restaura apenas preferências, permitindo limpar a chave do aplicativo', async () => {
    const { data, adapter } = memoryStorage();
    expect(await loadPreferences(adapter)).toBeNull();
    await savePreferences(adapter, preferences());
    expect(await loadPreferences(adapter)).toEqual(preferences());
    data.set('outro-aplicativo', 'preservar');
    await clearPreferences(adapter);
    expect(await loadPreferences(adapter)).toBeNull();
    expect(data.get('outro-aplicativo')).toBe('preservar');
  });

  it('remove campos não autorizados antes de serializar', async () => {
    const { adapter, data } = memoryStorage();
    const withSecrets = Object.assign(preferences(), {
      round: { word: 'SEGREDO ATIVO', impostorIds: ['player-0'] },
      phase: 'revealing',
    });
    await savePreferences(adapter, withSecrets);
    expect(data.get(PREFERENCES_KEY)).not.toContain('SEGREDO ATIVO');
    expect(data.get(PREFERENCES_KEY)).not.toContain('impostorIds');
    expect(data.get(PREFERENCES_KEY)).not.toContain('revealing');
  });

  it.each([
    '{json inválido',
    'null',
    '[]',
    '{}',
    '{"version":2,"preferences":{}}',
    '{"version":1,"preferences":null}',
  ])('recupera conteúdo corrompido ou versão desconhecida: %s', async (raw) => {
    const { adapter, data } = memoryStorage();
    data.set(PREFERENCES_KEY, raw);
    expect(await loadPreferences(adapter)).toBeNull();
  });

  it('recupera tipos e limites inválidos sem confiar em dados locais', async () => {
    const { adapter, data } = memoryStorage();
    const valid = preferences();
    const invalid: unknown[] = [
      { ...valid, players: [...players(21)] },
      { ...valid, players: [{ id: '1', name: 'x'.repeat(25) }] },
      {
        ...valid,
        players: [
          { id: '1', name: 'Ana' },
          { id: '1', name: 'Bruno' },
        ],
      },
      { ...valid, players: [{ id: 1, name: 'Ana' }] },
      { ...valid, history: [null] },
      { ...valid, selectedThemeIds: [3] },
      { ...valid, settings: { ...valid.settings, sound: 'sim' } },
      { ...valid, settings: { ...valid.settings, timerSeconds: -1 } },
      { ...valid, settings: { ...valid.settings, timerSeconds: 3601 } },
      { ...valid, settings: { ...valid.settings, colorScheme: 'unknown' } },
      {
        ...valid,
        settings: { ...valid.settings, firstSpeaker: 'after-impostor' },
      },
    ];
    for (const input of invalid) {
      data.set(PREFERENCES_KEY, JSON.stringify({ version: 1, preferences: input }));
      expect(await loadPreferences(adapter)).toBeNull();
    }
  });

  it('restaura cadastros ainda incompletos e normaliza histórico e seleções', async () => {
    const { adapter } = memoryStorage();
    const input = {
      ...preferences(),
      players: [{ id: 'draft', name: '' }],
      selectedThemeIds: ['food', 'food'],
      history: [' PÃO ', 'arroz', 'pao'],
    };
    await savePreferences(adapter, input);
    expect(await loadPreferences(adapter)).toEqual({
      ...input,
      selectedThemeIds: ['food'],
      history: ['arroz', 'pao'],
    });
  });

  it('propaga falhas de IO para que a interface avise o usuário', async () => {
    const failure = new Error('Armazenamento indisponível.');
    const adapter: StorageAdapter = {
      getItem: async () => {
        throw failure;
      },
      setItem: async () => {
        throw failure;
      },
      removeItem: async () => {
        throw failure;
      },
    };
    await expect(loadPreferences(adapter)).rejects.toBe(failure);
    await expect(savePreferences(adapter, preferences())).rejects.toBe(failure);
    await expect(clearPreferences(adapter)).rejects.toBe(failure);
  });

  it('rejeita preferências inválidas antes de gravar', async () => {
    const { adapter, data } = memoryStorage();
    await expect(
      savePreferences(adapter, { ...preferences(), players: players(21) }),
    ).rejects.toThrow(/preferências inválidas/);
    expect(data.size).toBe(0);
  });
});

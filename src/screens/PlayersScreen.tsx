import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Player } from '../domain/types';
import { MAX_PLAYER_NAME_LENGTH, MAX_PLAYERS, MIN_PLAYERS, normalize } from '../domain/players';
import { Button, Card, Icon, Label, Page, usePalette } from '../ui/components';

interface PlayersScreenProps {
  players: Player[];
  onChange: (players: Player[]) => void;
  onNext: () => void;
  onBack: () => void;
  onClear: () => void;
}

let nextPlayerId = 0;
function blankPlayer(): Player {
  nextPlayerId += 1;
  return { id: `player-${Date.now().toString(36)}-${nextPlayerId}`, name: '' };
}

function getErrors(players: Player[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const player of players) {
    const name = normalize(player.name);
    if (!name) errors[player.id] = 'Escreva o nome de quem vai jogar.';
    else if ([...player.name.trim()].length > MAX_PLAYER_NAME_LENGTH)
      errors[player.id] = 'Use até 24 caracteres.';
    else if (players.some((other) => other.id !== player.id && normalize(other.name) === name)) {
      errors[player.id] = 'Esse nome já está na lista. Use um apelido diferente.';
    }
  }
  return errors;
}

function cleanedPlayers(players: Player[]): Player[] {
  return players.map((player) => ({ ...player, name: player.name.trim().replace(/\s+/g, ' ') }));
}

export function PlayersScreen({ players, onChange, onNext, onBack, onClear }: PlayersScreenProps) {
  const palette = usePalette();
  const [drafts, setDrafts] = useState<Player[]>(() => [
    ...players.map((player) => ({ ...player })),
    ...Array.from({ length: Math.max(0, MIN_PLAYERS - players.length) }, blankPlayer),
  ]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attempted, setAttempted] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const inputs = useRef<Record<string, TextInput | null>>({});
  const previousPlayers = useRef(players);
  const errors = getErrors(drafts);

  useEffect(() => {
    if (focusId) {
      inputs.current[focusId]?.focus();
      setFocusId(null);
    }
  }, [drafts, focusId]);

  useEffect(() => {
    if (previousPlayers.current.length > 0 && players.length === 0) {
      setDrafts([blankPlayer(), blankPlayer(), blankPlayer()]);
      setTouched({});
      setAttempted(false);
    }
    previousPlayers.current = players;
  }, [players]);

  function update(next: Player[]) {
    setDrafts(next);
    onChange(next);
  }

  function addPlayer() {
    if (drafts.length >= MAX_PLAYERS) return;
    const player = blankPlayer();
    update([...drafts, player]);
    setFocusId(player.id);
  }

  function continueToOrder() {
    setAttempted(true);
    const invalid = drafts.find((player) => errors[player.id]);
    if (invalid) {
      inputs.current[invalid.id]?.focus();
      return;
    }
    onChange(cleanedPlayers(drafts));
    onNext();
  }

  return (
    <Page
      title="Quem vai jogar?"
      subtitle="Junte a turma. Alguém vai ter que improvisar."
      onBack={onBack}
      footer={<Button label="Organizar a ordem" icon="arrow-forward" onPress={continueToOrder} />}
    >
      <View>
        <Card>
          <View style={styles.counterRow}>
            <View style={styles.counterText}>
              <Label>JOGADORES</Label>
              <Text style={[styles.count, { color: palette.text }]}>
                {drafts.length}
                <Text style={[styles.limit, { color: palette.muted }]}> / 20</Text>
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Diminuir quantidade de jogadores"
              accessibilityState={{ disabled: drafts.length <= MIN_PLAYERS }}
              disabled={drafts.length <= MIN_PLAYERS}
              onPress={() => update(drafts.slice(0, -1))}
              style={[
                styles.counterButton,
                {
                  backgroundColor: palette.surface2,
                  opacity: drafts.length <= MIN_PLAYERS ? 0.35 : 1,
                },
              ]}
            >
              <Icon name="remove" color={palette.text} size={24} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Aumentar quantidade de jogadores"
              accessibilityState={{ disabled: drafts.length >= MAX_PLAYERS }}
              disabled={drafts.length >= MAX_PLAYERS}
              onPress={addPlayer}
              style={[
                styles.counterButton,
                {
                  backgroundColor: palette.accent,
                  opacity: drafts.length >= MAX_PLAYERS ? 0.35 : 1,
                },
              ]}
            >
              <Icon name="add" color={palette.accentText} size={24} />
            </Pressable>
          </View>
          <Text style={[styles.help, { color: palette.muted }]}>
            De 3 a 20 pessoas. Com pelo menos 3, há duas pessoas com a palavra e um impostor.
          </Text>
        </Card>

        <View style={styles.sectionHeading}>
          <Label>NOMES DA TURMA</Label>
          <Text style={[styles.optional, { color: palette.muted }]}>Apelidos também valem</Text>
        </View>
        {drafts.map((player, index) => {
          const error = attempted || touched[player.id] ? errors[player.id] : undefined;
          return (
            <View key={player.id} style={styles.playerGroup}>
              <View
                style={[
                  styles.playerRow,
                  {
                    backgroundColor: palette.surface,
                    borderColor: error ? palette.danger : palette.border,
                  },
                ]}
              >
                <Text style={[styles.playerNumber, { color: palette.muted }]}>
                  {String(index + 1).padStart(2, '0')}
                </Text>
                <TextInput
                  ref={(input) => {
                    inputs.current[player.id] = input;
                  }}
                  accessibilityLabel={`Nome do jogador ${index + 1}`}
                  accessibilityHint={
                    error ?? 'Até 24 caracteres. Cada pessoa precisa ter um nome diferente.'
                  }
                  placeholder={`Jogador ${index + 1}`}
                  placeholderTextColor={palette.muted}
                  selectionColor={palette.accent}
                  value={player.name}
                  maxLength={MAX_PLAYER_NAME_LENGTH}
                  autoCorrect={false}
                  autoCapitalize="words"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onChangeText={(name) =>
                    update(drafts.map((item) => (item.id === player.id ? { ...item, name } : item)))
                  }
                  onBlur={() => setTouched((current) => ({ ...current, [player.id]: true }))}
                  onSubmitEditing={() => {
                    setTouched((current) => ({ ...current, [player.id]: true }));
                    const nextPlayer = drafts[index + 1];
                    if (nextPlayer) inputs.current[nextPlayer.id]?.focus();
                    else if (drafts.length < MAX_PLAYERS) addPlayer();
                    else continueToOrder();
                  }}
                  style={[styles.input, { color: palette.text }]}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remover ${player.name.trim() || `jogador ${index + 1}`}`}
                  accessibilityState={{ disabled: drafts.length <= MIN_PLAYERS }}
                  disabled={drafts.length <= MIN_PLAYERS}
                  onPress={() => update(drafts.filter((item) => item.id !== player.id))}
                  style={[styles.remove, { opacity: drafts.length <= MIN_PLAYERS ? 0.25 : 1 }]}
                >
                  <Icon name="close" color={palette.muted} size={20} />
                </Pressable>
              </View>
              {error ? (
                <Text
                  accessibilityLiveRegion="polite"
                  style={[styles.error, { color: palette.danger }]}
                >
                  {error}
                </Text>
              ) : null}
            </View>
          );
        })}
        <Button
          label="Adicionar jogador"
          icon="add"
          variant="secondary"
          onPress={addPlayer}
          disabled={drafts.length >= MAX_PLAYERS}
        />
        <Text style={[styles.savedHint, { color: palette.muted }]}>
          <Icon name="phone-portrait-outline" size={14} color={palette.muted} /> A lista fica salva
          só neste aparelho.
        </Text>
        {players.length > 0 ? (
          <Button label="Apagar lista salva" variant="ghost" onPress={onClear} />
        ) : null}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  counterText: { flex: 1 },
  count: { fontSize: 38, fontWeight: '800', lineHeight: 46 },
  limit: { fontSize: 17, fontWeight: '500' },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  help: { fontSize: 13, lineHeight: 20, marginTop: 14 },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 26,
    marginBottom: 12,
  },
  optional: { fontSize: 12 },
  playerGroup: { marginBottom: 10 },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    borderWidth: 1,
    borderRadius: 16,
    paddingLeft: 17,
  },
  playerNumber: { fontSize: 12, fontWeight: '700', width: 32 },
  input: { flex: 1, minHeight: 58, fontSize: 17, paddingVertical: 12 },
  remove: { width: 48, minHeight: 54, alignItems: 'center', justifyContent: 'center' },
  error: { fontSize: 12, lineHeight: 18, marginTop: 5, paddingHorizontal: 8 },
  savedHint: { textAlign: 'center', fontSize: 12, lineHeight: 19, marginVertical: 17 },
});

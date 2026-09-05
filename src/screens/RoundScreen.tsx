import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { secretForCurrent } from '../domain';
import type { GameAction, GameState, Settings, Theme } from '../domain/types';
import { useCountdown } from '../hooks/useCountdown';
import { Button, Card, Icon, Label, Page, usePalette } from '../ui/components';
import { Confirmation } from '../components/Confirmation';

interface Props {
  game: GameState;
  settings: Settings;
  themes: Theme[];
  dispatch: (action: GameAction) => void;
  onExit: () => void;
  onResult: () => void;
  onReplay: () => void;
  onConfigure: () => void;
  onHome: () => void;
  onFeedback: () => void;
  obscured?: boolean;
  protectionError?: boolean;
  onRetryProtection?: () => void;
}
export function RoundScreen(props: Props) {
  const { game, settings, dispatch, onExit, onResult, onFeedback } = props;
  const p = usePalette();
  const player = game.round.players[game.cursor]!;
  const timer = useCountdown(
    settings.timerSeconds,
    game.phase === 'discussion' || game.phase === 'vote',
    onFeedback,
  );
  const [accessibleConfirm, setAccessibleConfirm] = useState(false);
  useEffect(() => {
    if (props.obscured) setAccessibleConfirm(false);
  }, [props.obscured]);
  const send = (type: 'CONFIRM_HOLDER' | 'REVEAL' | 'CONCEAL' | 'MARK_READ' | 'NEXT') =>
    dispatch({ type, playerId: player.id });
  const secret = props.obscured ? null : secretForCurrent(game);
  if (props.obscured)
    return (
      <Page title="Conteúdo protegido">
        <View style={{ flex: 1, justifyContent: 'center', gap: 24 }}>
          <Icon name="lock-closed-outline" size={55} color={p.accent} />
          <Text style={[styles.centerBody, { color: p.muted }]}>
            {props.protectionError
              ? 'A proteção de tela não pôde ser ativada. Tente novamente para continuar.'
              : 'Volte ao aplicativo para continuar. Seu segredo está escondido.'}
          </Text>
          {props.protectionError && props.onRetryProtection ? (
            <Button label="Ativar proteção e continuar" onPress={props.onRetryProtection} />
          ) : null}
          <Button label="Sair da rodada" variant="ghost" onPress={onExit} />
        </View>
      </Page>
    );
  if (game.phase === 'result') return <ResultScreen {...props} />;
  if (game.phase === 'discussion' || game.phase === 'vote') {
    const first = game.round.players.find((person) => person.id === game.round.firstSpeakerId)!;
    return (
      <Page
        title={game.phase === 'vote' ? 'Quem está disfarçando?' : 'Agora é com vocês.'}
        subtitle="Conversem, desconfiem e divirtam-se."
        onBack={onExit}
        footer={
          <>
            <Button label="Revelar resultado" icon="eye-outline" onPress={onResult} />
            {game.phase === 'discussion' ? (
              <Button
                label="Registrar um palpite"
                variant="secondary"
                onPress={() => dispatch({ type: 'VOTE' })}
              />
            ) : (
              <Button
                label="Voltar à discussão"
                variant="ghost"
                onPress={() => dispatch({ type: 'DISCUSS' })}
              />
            )}
          </>
        }
      >
        {game.phase === 'discussion' ? (
          <>
            <View style={[styles.largeIcon, { backgroundColor: p.surface2 }]}>
              <Icon name="chatbubbles-outline" size={48} color={p.accent} />
            </View>
            <Text style={[styles.big, { color: p.text }]}>
              {first.name}
              <Text style={{ color: p.accent }}>{'\n'}começa a falar.</Text>
            </Text>
            <Text style={[styles.centerBody, { color: p.muted }]}>
              Cada pessoa dá uma pista sobre a palavra.{'\n'}Seja convincente, mas não entregue o
              segredo.
            </Text>
            {settings.timerSeconds > 0 ? (
              <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
                <Label>{timer.remaining === 0 ? 'TEMPO ESGOTADO' : 'TEMPO PARA DISCUTIR'}</Label>
                <Text
                  accessibilityLabel={`${Math.floor(timer.remaining / 60)} minutos e ${timer.remaining % 60} segundos`}
                  style={[styles.clock, { color: timer.remaining === 0 ? p.warning : p.text }]}
                >
                  {String(Math.floor(timer.remaining / 60)).padStart(2, '0')}
                  <Text style={{ color: p.accent }}>:</Text>
                  {String(timer.remaining % 60).padStart(2, '0')}
                </Text>
                {timer.remaining > 0 ? (
                  <Button
                    label={timer.running ? 'Pausar cronômetro' : 'Retomar cronômetro'}
                    icon={timer.running ? 'pause-outline' : 'play-outline'}
                    variant="ghost"
                    onPress={timer.toggle}
                  />
                ) : (
                  <Text style={{ color: p.muted, textAlign: 'center' }}>
                    Vocês podem continuar conversando.
                  </Text>
                )}
              </Card>
            ) : (
              <Card>
                <Label>SEM PRESSA</Label>
                <Text style={{ color: p.muted, lineHeight: 23 }}>
                  O cronômetro está desligado. Revelem o resultado quando o grupo estiver pronto.
                </Text>
              </Card>
            )}
            <View style={styles.tip}>
              <Icon name="bulb-outline" size={20} color={p.warning} />
              <Text style={[styles.tipText, { color: p.muted }]}>
                O impostor tenta descobrir a palavra ouvindo as pistas. Uma boa cara de paisagem
                ajuda.
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={{ color: p.muted, lineHeight: 23 }}>
              Um palpite do grupo, sem votação individual. Esta etapa é opcional.
            </Text>
            {game.round.players.map((person, index) => (
              <Pressable
                key={person.id}
                accessibilityRole="radio"
                accessibilityLabel={person.name}
                accessibilityState={{ checked: game.choiceId === person.id }}
                aria-checked={game.choiceId === person.id}
                onPress={() => dispatch({ type: 'CHOOSE', playerId: person.id })}
                style={[
                  styles.voteRow,
                  {
                    backgroundColor: game.choiceId === person.id ? p.surface2 : p.surface,
                    borderColor: game.choiceId === person.id ? p.accent : p.border,
                  },
                ]}
              >
                <Text style={{ color: p.muted, width: 26 }}>
                  {String(index + 1).padStart(2, '0')}
                </Text>
                <Text style={{ color: p.text, flex: 1, fontWeight: '700', fontSize: 17 }}>
                  {person.name}
                </Text>
                <Icon
                  name={game.choiceId === person.id ? 'radio-button-on' : 'radio-button-off'}
                  color={game.choiceId === person.id ? p.accent : p.muted}
                />
              </Pressable>
            ))}
          </>
        )}
      </Page>
    );
  }
  const progress = game.phase === 'concealed' ? game.cursor + 1 : game.cursor;
  return (
    <Page
      title="A palavra fica entre nós."
      onBack={onExit}
      subtitle={`Pessoa ${game.cursor + 1} de ${game.round.players.length}`}
    >
      <View
        accessibilityLabel={`${progress} de ${game.round.players.length} pessoas concluíram`}
        style={[styles.progressTrack, { backgroundColor: p.surface2 }]}
      >
        <View
          style={{
            width: `${(progress / game.round.players.length) * 100}%`,
            height: 5,
            borderRadius: 4,
            backgroundColor: p.accent,
          }}
        />
      </View>
      {game.phase === 'handoff' ? (
        <>
          <View style={[styles.largeIcon, { backgroundColor: p.surface2 }]}>
            <Icon name="phone-portrait-outline" color={p.accent} size={55} />
          </View>
          <Label>ENTREGUE O CELULAR PARA</Label>
          <Text accessibilityRole="header" style={[styles.big, { color: p.text }]}>
            {player.name}
          </Text>
          <Text style={[styles.centerBody, { color: p.muted }]}>
            Só continue quando você estiver com o celular e ninguém estiver olhando.
          </Text>
          <View style={{ flex: 1, minHeight: 30 }} />
          <Button
            label={`Sou ${player.name}`}
            onPress={() => send('CONFIRM_HOLDER')}
            icon="finger-print-outline"
          />
          <Text style={[styles.small, { color: p.muted }]}>
            Sua informação ainda está escondida.
          </Text>
        </>
      ) : game.phase === 'concealed' ? (
        <>
          <View style={[styles.largeIcon, { backgroundColor: p.surface2 }]}>
            <Icon name="checkmark-done-outline" size={54} color={p.success} />
          </View>
          <Text accessibilityRole="header" style={[styles.big, { color: p.text }]}>
            Segredo guardado.
          </Text>
          <Text style={[styles.centerBody, { color: p.muted }]}>
            A informação foi escondida.{'\n'}
            {game.cursor === game.round.players.length - 1
              ? 'Todo mundo já viu. Hora de conversar!'
              : 'Agora pode passar o celular.'}
          </Text>
          <View style={{ flex: 1, minHeight: 50 }} />
          <Button
            label={
              game.cursor === game.round.players.length - 1 ? 'Começar discussão' : 'Próxima pessoa'
            }
            onPress={() => send('NEXT')}
            icon="arrow-forward"
          />
        </>
      ) : (
        <>
          <Text style={[styles.playerName, { color: p.text }]}>
            {player.name}, só você pode olhar.
          </Text>
          <View
            style={[
              styles.secretCard,
              {
                backgroundColor: secret?.kind === 'impostor' ? p.surface2 : p.surface,
                borderColor: secret
                  ? secret.kind === 'impostor'
                    ? p.danger
                    : p.success
                  : p.border,
              },
            ]}
          >
            {secret ? (
              <View testID="secret-content" style={{ alignItems: 'center', gap: 22 }}>
                <Icon
                  name={secret.kind === 'impostor' ? 'eye-outline' : 'key-outline'}
                  size={48}
                  color={secret.kind === 'impostor' ? p.danger : p.success}
                />
                <Label>{secret.kind === 'impostor' ? 'DISFARCE BEM' : 'SUA PALAVRA É'}</Label>
                <Text
                  accessibilityRole="header"
                  style={[styles.secret, { color: secret.kind === 'impostor' ? p.danger : p.text }]}
                >
                  {secret.kind === 'impostor' ? 'VOCÊ É O\nIMPOSTOR' : secret.text}
                </Text>
                <Text style={[styles.centerBody, { color: p.muted }]}>
                  {secret.kind === 'impostor'
                    ? 'Ouça as pistas. Entre na conversa.\nTente descobrir a palavra.'
                    : 'Memorize. Dê boas pistas.\nNão diga a palavra em voz alta.'}
                </Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center', gap: 22 }}>
                <Icon name="lock-closed-outline" size={48} color={p.accent} />
                <Text style={[styles.secret, { color: p.text }]}>Um segredo{'\n'}na sua mão.</Text>
                <Text style={[styles.centerBody, { color: p.muted }]}>
                  Mantenha o botão pressionado para ver.{'\n'}Soltou? A informação desaparece.
                </Text>
              </View>
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Segure para revelar seu papel"
            accessibilityHint="Mantenha pressionado por meio segundo. Há também uma alternativa com confirmação abaixo."
            delayLongPress={450}
            onLongPress={() => {
              send('REVEAL');
              onFeedback();
            }}
            onPressOut={() => send('CONCEAL')}
            onResponderTerminate={() => send('CONCEAL')}
            style={({ pressed }) => [
              styles.hold,
              { backgroundColor: p.accent, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Icon name="finger-print-outline" color={p.accentText} size={25} />
            <Text style={{ color: p.accentText, fontWeight: '800', fontSize: 16 }}>
              {secret ? 'Solte para esconder' : 'Segure para revelar'}
            </Text>
          </Pressable>
          {game.revealedForCurrent ? (
            <Button
              label="Já memorizei · esconder e continuar"
              variant="secondary"
              onPress={() => send('MARK_READ')}
            />
          ) : null}
          <Button
            label="Revelar com confirmação"
            variant="ghost"
            onPress={() => {
              send('CONCEAL');
              setAccessibleConfirm(true);
            }}
          />
          <Confirmation
            request={
              accessibleConfirm
                ? {
                    title: 'Pronto para olhar?',
                    message:
                      'Seu papel ficará visível até você tocar em esconder. Confirme que só você consegue ver a tela.',
                    label: 'Mostrar meu papel',
                    confirm: () => {
                      send('REVEAL');
                      onFeedback();
                    },
                  }
                : null
            }
            onClose={() => setAccessibleConfirm(false)}
          />
        </>
      )}
    </Page>
  );
}

function ResultScreen({ game, themes, onReplay, onConfigure, onHome }: Props) {
  const p = usePalette();
  const impostor = game.round.players.find((player) => game.round.impostorIds.includes(player.id))!;
  const guessed = game.round.players.find((player) => player.id === game.choiceId);
  const theme = themes.find((item) => item.id === game.round.themeId);
  return (
    <Page title="Fim do disfarce." subtitle="Agora todo mundo pode olhar.">
      <View style={[styles.largeIcon, { backgroundColor: p.surface2 }]}>
        <Icon name="eye-outline" size={54} color={p.danger} />
      </View>
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Label>O IMPOSTOR ERA</Label>
        <Text accessibilityRole="header" style={[styles.big, { color: p.danger }]}>
          {impostor.name}
        </Text>
      </View>
      <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
        <Label>A PALAVRA SECRETA</Label>
        <Text style={[styles.secret, { color: p.text }]}>{game.round.word.text}</Text>
        <Text style={{ color: p.muted }}>
          {theme?.emoji} {theme?.name}
        </Text>
      </Card>
      {guessed ? (
        <Card>
          <Text
            style={{
              color: game.round.impostorIds.includes(guessed.id) ? p.success : p.warning,
              fontWeight: '800',
              fontSize: 18,
            }}
          >
            {game.round.impostorIds.includes(guessed.id)
              ? 'O grupo acertou!'
              : 'O impostor passou despercebido.'}
          </Text>
          <Text style={{ color: p.muted }}>O palpite do grupo foi {guessed.name}.</Text>
        </Card>
      ) : (
        <Text style={[styles.centerBody, { color: p.muted }]}>
          Sem palpite registrado. Valeu o disfarce?
        </Text>
      )}
      <View style={{ flex: 1, minHeight: 10 }} />
      <Button label="Jogar novamente" icon="refresh-outline" onPress={onReplay} />
      <Button label="Nova configuração" variant="secondary" onPress={onConfigure} />
      <Button label="Voltar ao início" variant="ghost" onPress={onHome} />
    </Page>
  );
}
const styles = StyleSheet.create({
  largeIcon: {
    width: 112,
    height: 112,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  big: { fontSize: 36, fontWeight: '900', lineHeight: 43, letterSpacing: -1, textAlign: 'center' },
  centerBody: { fontSize: 15, lineHeight: 24, textAlign: 'center' },
  small: { fontSize: 12, lineHeight: 20, textAlign: 'center' },
  playerName: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: 10 },
  secretCard: {
    minHeight: 285,
    padding: 24,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: 'center',
  },
  secret: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  hold: {
    minHeight: 64,
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    flexDirection: 'row',
  },
  progressTrack: { height: 5, borderRadius: 4, marginBottom: 8 },
  clock: { fontSize: 64, fontWeight: '800', fontVariant: ['tabular-nums'], letterSpacing: -3 },
  tip: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  tipText: { flex: 1, lineHeight: 21, fontSize: 13 },
  voteRow: {
    padding: 18,
    borderWidth: 1,
    borderRadius: 18,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});

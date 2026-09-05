import { Component, useCallback, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  BackHandler,
  Platform,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { themes } from './src/data/themes';
import { createRound, gameReducer, initialGame, shuffle, updateHistory } from './src/domain';
import type { GameAction, GameState, Player, Settings } from './src/domain/types';
import { Confirmation, type ConfirmationRequest } from './src/components/Confirmation';
import { Mascot } from './src/components/Mascot';
import { usePreferences } from './src/hooks/usePreferences';
import { usePrivacy } from './src/hooks/usePrivacy';
import { useFeedback } from './src/hooks/useFeedback';
import { newId, secureRandomInt } from './src/services/random';
import { HomeScreen } from './src/screens/HomeScreen';
import {
  HowToScreen,
  OrderScreen,
  PlayersScreen,
  ReviewScreen,
  SettingsScreen,
  ThemesScreen,
} from './src/screens/SetupScreens';
import { RoundScreen } from './src/screens/RoundScreen';
import { Button, FadeIn, Page } from './src/ui/components';
import { MotionContext, PaletteContext, palettes } from './src/ui/theme';

type Screen = 'home' | 'players' | 'order' | 'themes' | 'browse' | 'review' | 'settings' | 'help';
function Application() {
  const { preferences, setPreferences, loaded, storageError } = usePreferences();
  const [fontsLoaded, fontError] = useFonts(Ionicons.font);
  const [screen, setScreen] = useState<Screen>('home');
  const [game, setGame] = useState<GameState | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [systemReduced, setSystemReduced] = useState(false);
  const systemScheme = useColorScheme();
  const resolvedScheme =
    preferences.settings.colorScheme === 'system'
      ? systemScheme === 'light'
        ? 'light'
        : 'dark'
      : preferences.settings.colorScheme;
  const palette = palettes[resolvedScheme];
  const feedback = useFeedback(preferences.settings);
  const dispatch = useCallback(
    (action: GameAction) => setGame((current) => (current ? gameReducer(current, action) : null)),
    [],
  );
  const onCover = useCallback(() => {
    dispatch({ type: 'BACKGROUND' });
    setConfirmation(null);
  }, [dispatch]);
  const privacy = usePrivacy(onCover);
  const recorded = useRef<string | null>(null);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled()
      .then(setSystemReduced)
      .catch(() => undefined);
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReduced);
    return () => listener.remove();
  }, []);
  useEffect(() => {
    if (game?.phase !== 'result' || recorded.current === game.round.id) return;
    recorded.current = game.round.id;
    setPreferences((current) => ({
      ...current,
      history: updateHistory(current.history, game.round.word.text),
    }));
  }, [game, setPreferences]);

  const abandon = useCallback(() => {
    if (!game || game.phase === 'result') {
      setGame(null);
      setScreen('home');
      return;
    }
    dispatch({ type: 'BACKGROUND' });
    setConfirmation({
      title: 'Sair desta rodada?',
      message: 'A rodada será descartada. Os nomes e as configurações continuam salvos.',
      label: 'Sair da rodada',
      danger: true,
      confirm: () => {
        setGame(null);
        setScreen('home');
      },
    });
  }, [dispatch, game]);
  const back = useCallback(() => {
    if (confirmation) {
      setConfirmation(null);
      return true;
    }
    if (game) {
      abandon();
      return true;
    }
    const previous: Record<Screen, Screen> = {
      home: 'home',
      players: 'home',
      order: 'players',
      themes: 'order',
      browse: 'home',
      review: 'themes',
      settings: 'home',
      help: 'home',
    };
    if (screen === 'home') return false;
    setScreen(previous[screen]);
    return true;
  }, [abandon, confirmation, game, screen]);
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', back);
    const unload = (event: BeforeUnloadEvent) => {
      if (game && game.phase !== 'result') {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') back();
    };
    if (Platform.OS === 'web') {
      window.addEventListener('beforeunload', unload);
      window.addEventListener('keyup', escape);
    }
    return () => {
      subscription.remove();
      if (Platform.OS === 'web') {
        window.removeEventListener('beforeunload', unload);
        window.removeEventListener('keyup', escape);
      }
    };
  }, [back, game]);

  const setPlayers = (players: Player[]) => setPreferences((current) => ({ ...current, players }));
  const setSelectedIds = (selectedThemeIds: string[]) =>
    setPreferences((current) => ({ ...current, selectedThemeIds }));
  const setSettings = (settings: Settings) =>
    setPreferences((current) => ({ ...current, settings }));
  const clearPlayers = () =>
    setConfirmation({
      title: 'Apagar os jogadores?',
      message: 'A lista salva neste celular será apagada.',
      label: 'Apagar jogadores',
      danger: true,
      confirm: () => setPlayers([]),
    });
  const start = () => {
    if (game && game.phase !== 'result') return;
    try {
      const round = createRound({ ...preferences, themes }, secureRandomInt, newId());
      setGame(initialGame(round));
      setError(null);
      feedback();
    } catch {
      setError(
        'Não foi possível preparar a rodada. Confira os jogadores e selecione ao menos um tema.',
      );
    }
  };
  const revealResult = () =>
    setConfirmation({
      title: 'Acabou o disfarce?',
      message: 'O nome do impostor e a palavra serão mostrados para todo mundo.',
      label: 'Sim, revelar resultado',
      confirm: () => {
        dispatch({ type: 'RESULT' });
        feedback();
      },
    });
  let content;
  if (!loaded || (!fontsLoaded && !fontError))
    content = (
      <Page>
        <View style={{ flex: 1, justifyContent: 'center', gap: 24 }}>
          <Mascot />
          <Text
            style={{ color: palette.text, fontSize: 32, fontWeight: '900', textAlign: 'center' }}
          >
            impostor.
          </Text>
          <ActivityIndicator color={palette.accent} accessibilityLabel="Abrindo o jogo" />
        </View>
      </Page>
    );
  else if (game)
    content = (
      <RoundScreen
        key={game.round.id}
        game={game}
        settings={preferences.settings}
        themes={themes}
        dispatch={dispatch}
        onExit={abandon}
        onResult={revealResult}
        onReplay={start}
        onConfigure={() => {
          setGame(null);
          setScreen('players');
        }}
        onHome={() => {
          setGame(null);
          setScreen('home');
        }}
        onFeedback={feedback}
        obscured={!privacy.focused || !privacy.protectedScreen}
        protectionError={privacy.protectionError}
        onRetryProtection={privacy.retryProtection}
      />
    );
  else
    switch (screen) {
      case 'home':
        content = (
          <HomeScreen
            onPlay={() => setScreen('players')}
            onThemes={() => setScreen('browse')}
            onSettings={() => setScreen('settings')}
            onHelp={() => setScreen('help')}
            themeCount={themes.length}
            wordCount={themes.reduce((count, theme) => count + theme.words.length, 0)}
          />
        );
        break;
      case 'players':
        content = (
          <PlayersScreen
            players={preferences.players}
            onChange={setPlayers}
            onNext={() => setScreen('order')}
            onBack={back}
            onClear={clearPlayers}
          />
        );
        break;
      case 'order':
        content = (
          <OrderScreen
            players={preferences.players}
            onChange={setPlayers}
            onNext={() => setScreen('themes')}
            onBack={back}
            onShuffle={() => {
              setPlayers(shuffle(preferences.players, secureRandomInt));
              feedback();
            }}
          />
        );
        break;
      case 'themes':
      case 'browse':
        content = (
          <ThemesScreen
            themes={themes}
            selectedIds={preferences.selectedThemeIds}
            onChange={setSelectedIds}
            onNext={() => setScreen(screen === 'browse' ? 'players' : 'review')}
            onBack={back}
            browseOnly={screen === 'browse'}
          />
        );
        break;
      case 'review':
        content = (
          <ReviewScreen
            players={preferences.players}
            themes={themes}
            selectedIds={preferences.selectedThemeIds}
            settings={preferences.settings}
            onStart={start}
            onBack={back}
            onEditPlayers={() => setScreen('players')}
            onEditThemes={() => setScreen('themes')}
          />
        );
        break;
      case 'settings':
        content = (
          <SettingsScreen
            settings={preferences.settings}
            onChange={setSettings}
            onBack={back}
            onClearPlayers={clearPlayers}
            historyCount={preferences.history.length}
            onClearHistory={() =>
              setConfirmation({
                title: 'Limpar histórico de palavras?',
                message: 'As palavras de partidas anteriores poderão ser sorteadas novamente.',
                label: 'Limpar histórico',
                confirm: () => setPreferences((current) => ({ ...current, history: [] })),
              })
            }
          />
        );
        break;
      case 'help':
        content = <HowToScreen onBack={back} />;
        break;
    }
  return (
    <PaletteContext.Provider value={palette}>
      <MotionContext.Provider value={preferences.settings.reduceMotion || systemReduced}>
        <View style={{ flex: 1, backgroundColor: palette.bg }}>
          <StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
          {storageError ? (
            <Text
              accessibilityRole="alert"
              style={{
                padding: 12,
                backgroundColor: palette.surface2,
                color: palette.warning,
                textAlign: 'center',
              }}
            >
              Não foi possível salvar neste celular. Você ainda pode jogar nesta sessão.
            </Text>
          ) : null}
          {error ? (
            <View style={{ padding: 16 }}>
              <Text accessibilityRole="alert" style={{ color: palette.danger }}>
                {error}
              </Text>
              <Button label="Entendi" variant="ghost" onPress={() => setError(null)} />
            </View>
          ) : null}
          {game ? content : <FadeIn key={screen}>{content}</FadeIn>}
          <Confirmation
            request={privacy.focused ? confirmation : null}
            onClose={() => setConfirmation(null)}
          />
        </View>
      </MotionContext.Provider>
    </PaletteContext.Provider>
  );
}
class ErrorBoundary extends Component<PropsWithChildren, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <PaletteContext.Provider value={palettes.dark}>
          <Page title="Vamos começar de novo.">
            <Text style={{ color: palettes.dark.muted, lineHeight: 24 }}>
              Algo interrompeu o jogo. Por privacidade, a rodada foi descartada.
            </Text>
            <Button label="Voltar ao início" onPress={() => this.setState({ failed: false })} />
          </Page>
        </PaletteContext.Provider>
      );
    return this.props.children;
  }
}
export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ErrorBoundary>
        <Application />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

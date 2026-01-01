import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { playSound } from '@/lib/sounds';
import { vibrate } from '@/lib/vibration';
import { Home, RotateCcw, Shuffle } from 'lucide-react';
import { Screen } from '@/pages/Index';

interface ResultScreenProps {
  onNavigate: (screen: Screen) => void;
}

const ResultScreen = ({ onNavigate }: ResultScreenProps) => {
  const { state, dispatch, pickNewWord } = useGame();

  const impostorPlayers = state.impostorIndices.map(i => state.config.players[i]);
  const votingWasEnabled = state.config.votingEnabled;
  const votedPlayer = votingWasEnabled && state.votedPlayerIndex !== null 
    ? state.config.players[state.votedPlayerIndex] 
    : null;
  const wasImpostor = votingWasEnabled && state.votedPlayerIndex !== null 
    ? state.impostorIndices.includes(state.votedPlayerIndex) 
    : false;

  // Calculate vote counts for display
  const voteCounts: Record<number, number> = {};
  Object.values(state.votes).forEach((votedIdx) => {
    voteCounts[votedIdx] = (voteCounts[votedIdx] || 0) + 1;
  });

  useEffect(() => {
    if (!votingWasEnabled) {
      // No voting, just reveal impostors
      return;
    }
    
    if (state.impostorWon === null && !wasImpostor) {
      // Impostor won because they weren't caught
      dispatch({ type: 'IMPOSTOR_GUESS', payload: false });
    }
  }, [wasImpostor, state.impostorWon, dispatch, votingWasEnabled]);

  useEffect(() => {
    if (!votingWasEnabled) {
      playSound('reveal', state.config.soundEnabled);
      vibrate('medium', state.config.vibrationEnabled);
      return;
    }
    
    if (state.impostorWon !== null) {
      if (state.impostorWon) {
        playSound('defeat', state.config.soundEnabled);
        vibrate('defeat', state.config.vibrationEnabled);
      } else {
        playSound('victory', state.config.soundEnabled);
        vibrate('victory', state.config.vibrationEnabled);
      }
    }
  }, [state.impostorWon, state.config.soundEnabled, state.config.vibrationEnabled, votingWasEnabled]);

  const handlePlayAgain = () => {
    pickNewWord();
  };

  const handleGoHome = () => {
    dispatch({ type: 'RESET_GAME' });
    onNavigate('home');
  };

  // If voting was enabled and impostor was caught, show guess screen first
  if (votingWasEnabled && wasImpostor && state.impostorWon === null) {
    dispatch({ type: 'REVEAL_RESULT' });
    return null;
  }

  // No voting mode - just show the reveal
  if (!votingWasEnabled) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center animate-bounce-in">
          <div className="text-6xl mb-6">🎭</div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Revelação!
          </h1>
        </div>

        <Card className="w-full max-w-sm p-6 mb-6 bg-card">
          <div className="mb-4">
            <p className="text-muted-foreground text-sm mb-2">Impostor(es):</p>
            <div className="flex flex-wrap gap-2">
              {impostorPlayers.map((p) => (
                <span key={p.id} className="px-3 py-1 bg-impostor/20 text-impostor rounded-full text-sm font-bold">
                  {p.name}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-muted-foreground text-sm mb-1">A palavra era:</p>
            <p className="text-2xl font-bold text-primary">{state.secretWord}</p>
            <p className="text-sm text-muted-foreground">Tema: {state.secretWordTheme}</p>
          </div>
        </Card>

        <div className="w-full max-w-sm space-y-3">
          <Button
            className="w-full h-12 gradient-primary shadow-glow"
            onClick={handlePlayAgain}
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Jogar Novamente
          </Button>
          <Button
            variant="ghost"
            className="w-full h-12"
            onClick={handleGoHome}
          >
            <Home className="mr-2 h-5 w-5" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  // Voting mode results
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center animate-bounce-in">
        <div className="text-6xl mb-6">
          {state.impostorWon ? '🕵️' : '🎉'}
        </div>
        <h1 className={`text-4xl font-bold mb-4 ${state.impostorWon ? 'text-impostor text-glow-impostor' : 'text-success'}`}>
          {state.impostorWon ? 'Impostor Venceu!' : 'Jogadores Venceram!'}
        </h1>
      </div>

      <Card className="w-full max-w-sm p-6 mb-6 bg-card">
        {votedPlayer && (
          <div className="text-center mb-4">
            <p className="text-muted-foreground text-sm mb-1">Votaram em:</p>
            <p className="text-xl font-bold">{votedPlayer.name}</p>
            <p className={`text-sm ${wasImpostor ? 'text-success' : 'text-destructive'}`}>
              {wasImpostor ? '✓ Era impostor!' : '✗ Não era impostor'}
            </p>
          </div>
        )}

        {/* Show vote breakdown */}
        {Object.keys(voteCounts).length > 0 && (
          <div className="border-t border-border pt-4 mb-4">
            <p className="text-muted-foreground text-sm mb-2">Resultado da votação:</p>
            <div className="space-y-1">
              {Object.entries(voteCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([idx, count]) => {
                  const player = state.config.players[parseInt(idx)];
                  return (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{player?.name}</span>
                      <span className="text-muted-foreground">{count} voto{count !== 1 ? 's' : ''}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        <div className="border-t border-border pt-4 mb-4">
          <p className="text-muted-foreground text-sm mb-2">Impostor(es):</p>
          <div className="flex flex-wrap gap-2">
            {impostorPlayers.map((p) => (
              <span key={p.id} className="px-3 py-1 bg-impostor/20 text-impostor rounded-full text-sm">
                {p.name}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-muted-foreground text-sm mb-1">A palavra era:</p>
          <p className="text-2xl font-bold text-primary">{state.secretWord}</p>
          <p className="text-sm text-muted-foreground">Tema: {state.secretWordTheme}</p>
        </div>
      </Card>

      <div className="w-full max-w-sm space-y-3">
        <Button
          className="w-full h-12 gradient-primary shadow-glow"
          onClick={handlePlayAgain}
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Jogar Novamente
        </Button>
        <Button
          variant="secondary"
          className="w-full h-12"
          onClick={handlePlayAgain}
        >
          <Shuffle className="mr-2 h-5 w-5" />
          Nova Palavra (Mesmo Tema)
        </Button>
        <Button
          variant="ghost"
          className="w-full h-12"
          onClick={handleGoHome}
        >
          <Home className="mr-2 h-5 w-5" />
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
};

export default ResultScreen;
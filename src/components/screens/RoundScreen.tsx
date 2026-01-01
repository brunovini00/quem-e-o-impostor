import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { playSound } from '@/lib/sounds';
import { vibrate } from '@/lib/vibration';
import { Play, Pause, Vote } from 'lucide-react';
import { Screen } from '@/pages/Index';

interface RoundScreenProps {
  onNavigate: (screen: Screen) => void;
}

const RoundScreen = ({ onNavigate }: RoundScreenProps) => {
  const { state, dispatch } = useGame();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (state.timerRunning && state.config.timerEnabled) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK_TIMER' });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.timerRunning, state.config.timerEnabled, dispatch]);

  useEffect(() => {
    if (state.timerSeconds === 0 && state.config.timerEnabled && state.timerRunning) {
      dispatch({ type: 'PAUSE_TIMER' });
      playSound('timer', state.config.soundEnabled);
      vibrate('warning', state.config.vibrationEnabled);
    } else if (state.timerSeconds === 10 && state.config.timerEnabled) {
      playSound('warning', state.config.soundEnabled);
    }
  }, [state.timerSeconds, state.config.timerEnabled, state.timerRunning, state.config.soundEnabled, state.config.vibrationEnabled, dispatch]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGoToVoting = () => {
    dispatch({ type: 'GO_TO_VOTING' });
    playSound('vote', state.config.soundEnabled);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8 animate-fade-in">
        <p className="text-muted-foreground text-sm mb-2">Tema</p>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {state.secretWordTheme}
        </h1>
        <p className="text-muted-foreground text-sm">
          Dificuldade: {state.config.difficulty === 'todos' ? 'Todas' : state.config.difficulty}
        </p>
      </div>

      {state.config.timerEnabled && (
        <Card className={`p-8 mb-8 ${state.timerSeconds <= 10 ? 'border-destructive animate-pulse' : 'border-primary'}`}>
          <div className={`text-6xl font-mono font-bold ${state.timerSeconds <= 10 ? 'text-destructive' : 'text-foreground'}`}>
            {formatTime(state.timerSeconds)}
          </div>
        </Card>
      )}

      {state.config.timerEnabled && (
        <div className="flex gap-4 mb-8">
          {!state.timerRunning ? (
            <Button
              size="lg"
              onClick={() => dispatch({ type: 'START_TIMER' })}
              className="gradient-primary"
            >
              <Play className="mr-2 h-5 w-5" />
              Iniciar
            </Button>
          ) : (
            <Button
              size="lg"
              variant="secondary"
              onClick={() => dispatch({ type: 'PAUSE_TIMER' })}
            >
              <Pause className="mr-2 h-5 w-5" />
              Pausar
            </Button>
          )}
        </div>
      )}

      <div className="w-full max-w-sm">
        <Card className="p-4 mb-6 bg-card/50">
          <h3 className="font-semibold mb-2">💡 Dicas</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Cada jogador dá uma pista sobre a palavra</li>
            <li>• O impostor deve fingir que sabe</li>
            <li>• Discutam e encontrem o impostor!</li>
          </ul>
        </Card>

        <div className="space-y-3">
          {state.config.votingEnabled ? (
            <Button
              className="w-full h-14 text-lg gradient-primary shadow-glow"
              onClick={handleGoToVoting}
            >
              <Vote className="mr-2 h-5 w-5" />
              Ir para Votação
            </Button>
          ) : (
            <Button
              className="w-full h-14 text-lg gradient-primary shadow-glow"
              onClick={() => dispatch({ type: 'SKIP_VOTING' })}
            >
              Ver Resultado
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoundScreen;

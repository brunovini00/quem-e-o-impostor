import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { playSound } from '@/lib/sounds';
import { vibrate } from '@/lib/vibration';
import { Screen } from '@/pages/Index';

interface GuessScreenProps {
  onNavigate: (screen: Screen) => void;
}

const GuessScreen = ({ onNavigate }: GuessScreenProps) => {
  const { state, dispatch } = useGame();
  const [guess, setGuess] = useState('');

  const impostorPlayers = state.impostorIndices.map(i => state.config.players[i]);

  const handleGuess = () => {
    const isCorrect = guess.trim().toLowerCase() === state.secretWord?.toLowerCase();
    dispatch({ type: 'IMPOSTOR_GUESS', payload: isCorrect });

    if (isCorrect) {
      playSound('victory', state.config.soundEnabled);
      vibrate('victory', state.config.vibrationEnabled);
    } else {
      playSound('defeat', state.config.soundEnabled);
      vibrate('defeat', state.config.vibrationEnabled);
    }
  };

  const handleSkip = () => {
    dispatch({ type: 'IMPOSTOR_GUESS', payload: false });
    playSound('defeat', state.config.soundEnabled);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8 animate-fade-in">
        <div className="text-6xl mb-4">🎯</div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Última Chance!
        </h1>
        <p className="text-muted-foreground">
          O impostor foi descoberto, mas pode tentar adivinhar a palavra!
        </p>
      </div>

      <Card className="w-full max-w-sm p-6 mb-6 bg-card border-impostor">
        <div className="text-center mb-4">
          <p className="text-muted-foreground text-sm mb-2">Impostor(es):</p>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {impostorPlayers.map((p) => (
              <span key={p.id} className="px-3 py-1 bg-impostor/20 text-impostor rounded-full font-medium">
                {p.name}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mb-1">Tema:</p>
          <p className="font-semibold">{state.secretWordTheme}</p>
        </div>

        <div className="space-y-4">
          <Input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Digite sua resposta..."
            className="text-center text-lg"
            onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
          />
          <Button
            className="w-full h-12 gradient-impostor text-white"
            onClick={handleGuess}
            disabled={!guess.trim()}
          >
            Tentar Adivinhar
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={handleSkip}
          >
            Pular (Desistir)
          </Button>
        </div>
      </Card>

      <p className="text-muted-foreground text-xs text-center">
        Se acertar, o impostor vence!
      </p>
    </div>
  );
};

export default GuessScreen;

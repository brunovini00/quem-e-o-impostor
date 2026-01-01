import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { playSound, playImpostorReveal } from '@/lib/sounds';
import { vibrate } from '@/lib/vibration';
import { Eye, ArrowRight } from 'lucide-react';
import { Screen } from '@/pages/Index';

interface DistributionScreenProps {
  onNavigate: (screen: Screen) => void;
}

const DistributionScreen = ({ onNavigate }: DistributionScreenProps) => {
  const { state, dispatch } = useGame();
  const [showingCard, setShowingCard] = useState(false);

  const currentPlayer = state.config.players[state.currentPlayerIndex];
  const isImpostor = state.impostorIndices.includes(state.currentPlayerIndex);

  const handleShowCard = () => {
    setShowingCard(true);
    if (isImpostor) {
      playImpostorReveal(state.config.soundEnabled);
      vibrate('impostor', state.config.vibrationEnabled);
    } else {
      playSound('reveal', state.config.soundEnabled);
      vibrate('short', state.config.vibrationEnabled);
    }
  };

  const handleNext = () => {
    setShowingCard(false);
    dispatch({ type: 'NEXT_PLAYER' });
  };

  if (!showingCard) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center animate-fade-in">
          <div className="text-5xl mb-6">📱</div>
          <p className="text-muted-foreground text-lg mb-2">
            Passe o celular para:
          </p>
          <h1 className="text-4xl font-bold text-foreground mb-8 text-glow">
            {currentPlayer?.name}
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Jogador {state.currentPlayerIndex + 1} de {state.config.players.length}
          </p>
          <Button
            className="h-16 px-12 text-xl gradient-primary shadow-glow hover:scale-105 transition-transform"
            onClick={handleShowCard}
          >
            <Eye className="mr-3 h-6 w-6" />
            VER MINHA CARTA
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <Card
        className={`w-full max-w-sm p-8 text-center card-reveal ${
          isImpostor
            ? 'bg-gradient-to-br from-impostor/20 to-impostor/5 border-impostor shadow-glow-impostor'
            : 'bg-gradient-to-br from-primary/20 to-accent/10 border-primary shadow-glow'
        }`}
      >
        {isImpostor ? (
          <>
            <div className="text-6xl mb-6">🕵️</div>
            <h2 className="text-3xl font-bold text-impostor mb-4 text-glow-impostor">
              VOCÊ É O IMPOSTOR
            </h2>
            <p className="text-muted-foreground">
              Finja que conhece a palavra secreta!
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-6">🎯</div>
            <p className="text-muted-foreground mb-2">A palavra é:</p>
            <h2 className="text-4xl font-bold text-primary mb-4 text-glow">
              {state.secretWord}
            </h2>
            <p className="text-muted-foreground text-sm">
              Tema: {state.secretWordTheme}
            </p>
          </>
        )}
      </Card>

      <Button
        className="mt-8 h-14 px-8 text-lg"
        variant="secondary"
        onClick={handleNext}
      >
        PRONTO
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>

      <p className="text-muted-foreground text-xs mt-4">
        Não mostre para ninguém!
      </p>
    </div>
  );
};

export default DistributionScreen;

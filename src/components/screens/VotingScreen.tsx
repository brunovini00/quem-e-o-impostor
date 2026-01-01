import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { playSound } from '@/lib/sounds';
import { vibrate } from '@/lib/vibration';
import { Check, Vote } from 'lucide-react';
import { Screen } from '@/pages/Index';

interface VotingScreenProps {
  onNavigate: (screen: Screen) => void;
}

const VotingScreen = ({ onNavigate }: VotingScreenProps) => {
  const { state, dispatch } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);

  const handleVote = () => {
    if (selectedPlayer !== null) {
      dispatch({ type: 'VOTE', payload: selectedPlayer });
      playSound('vote', state.config.soundEnabled);
      vibrate('medium', state.config.vibrationEnabled);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="text-center mb-8 animate-fade-in">
        <div className="text-5xl mb-4">🗳️</div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Votação
        </h1>
        <p className="text-muted-foreground">
          Quem o grupo acredita ser o impostor?
        </p>
      </div>

      <div className="space-y-3 max-w-md mx-auto">
        {state.config.players.map((player, index) => (
          <Card
            key={player.id}
            className={`p-4 cursor-pointer transition-all ${
              selectedPlayer === index
                ? 'border-primary bg-primary/10 shadow-glow'
                : 'border-border hover:border-muted-foreground'
            }`}
            onClick={() => setSelectedPlayer(index)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">#{index + 1}</span>
                <span className="font-medium">{player.name}</span>
              </div>
              {selectedPlayer === index && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          className="w-full h-14 text-lg gradient-primary shadow-glow"
          onClick={handleVote}
          disabled={selectedPlayer === null}
        >
          <Vote className="mr-2 h-5 w-5" />
          Confirmar Voto
        </Button>
      </div>
    </div>
  );
};

export default VotingScreen;

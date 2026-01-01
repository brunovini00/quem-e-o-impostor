import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { playSound } from '@/lib/sounds';
import { vibrate } from '@/lib/vibration';
import { Check, Vote, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { Screen } from '@/pages/Index';

interface VotingScreenProps {
  onNavigate: (screen: Screen) => void;
}

const VotingScreen = ({ onNavigate }: VotingScreenProps) => {
  const { state, dispatch } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const currentVoter = state.config.players[state.currentVoterIndex];

  const handleRevealCard = () => {
    setCardRevealed(true);
    playSound('reveal', state.config.soundEnabled);
    vibrate('short', state.config.vibrationEnabled);
  };

  const handleConfirmVote = () => {
    if (selectedPlayer !== null) {
      dispatch({ 
        type: 'CAST_VOTE', 
        payload: { voterId: currentVoter.id, votedIndex: selectedPlayer } 
      });
      playSound('vote', state.config.soundEnabled);
      vibrate('medium', state.config.vibrationEnabled);
      setHasVoted(true);
    }
  };

  const handleNextVoter = () => {
    dispatch({ type: 'NEXT_VOTER' });
    setCardRevealed(false);
    setSelectedPlayer(null);
    setHasVoted(false);
  };

  // Screen: Waiting to pass phone
  if (!cardRevealed) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center animate-fade-in">
          <div className="text-5xl mb-4">🗳️</div>
          <p className="text-muted-foreground text-sm mb-2">
            Passe o celular para:
          </p>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {currentVoter?.name}
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Jogador {state.currentVoterIndex + 1} de {state.config.players.length}
          </p>

          <Button
            size="lg"
            className="gradient-primary shadow-glow px-8 h-16 text-xl"
            onClick={handleRevealCard}
          >
            <Eye className="mr-2 h-6 w-6" />
            Ver Votação
          </Button>
        </div>
      </div>
    );
  }

  // Screen: Player has voted, waiting to pass
  if (hasVoted) {
    const votedPlayerName = state.config.players[selectedPlayer!]?.name;
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center animate-fade-in">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Voto registrado!
          </h1>
          <p className="text-muted-foreground mb-2">
            Você votou em: <span className="font-bold text-foreground">{votedPlayerName}</span>
          </p>
          <p className="text-muted-foreground text-sm mb-8">
            Passe o celular para o próximo jogador
          </p>

          <Button
            size="lg"
            className="gradient-primary shadow-glow px-8 h-14"
            onClick={handleNextVoter}
          >
            <EyeOff className="mr-2 h-5 w-5" />
            Esconder e Passar
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Screen: Voting selection
  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="text-center mb-6 animate-fade-in">
        <p className="text-muted-foreground text-sm mb-1">Votação de</p>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          {currentVoter?.name}
        </h1>
        <p className="text-muted-foreground text-sm">
          Quem você acha que é o impostor?
        </p>
      </div>

      <div className="space-y-3 max-w-md mx-auto">
        {state.config.players.map((player, index) => {
          // Player can't vote for themselves
          if (player.id === currentVoter?.id) return null;
          
          return (
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
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          className="w-full h-14 text-lg gradient-primary shadow-glow"
          onClick={handleConfirmVote}
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
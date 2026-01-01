import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Users, BookOpen, HelpCircle, Settings } from 'lucide-react';
import { Screen } from '@/pages/Index';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
}

const HomeScreen = ({ onNavigate }: HomeScreenProps) => {
  const { state } = useGame();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="text-6xl mb-4">🎭</div>
        <h1 className="text-4xl font-bold text-foreground mb-2 text-glow">
          Quem é o Impostor?
        </h1>
        <p className="text-muted-foreground text-lg">
          Encontre o impostor entre seus amigos!
        </p>
      </div>

      {/* Menu */}
      <div className="w-full max-w-sm space-y-4 animate-slide-up">
        <Button
          className="w-full h-16 text-xl gradient-primary shadow-glow hover:scale-105 transition-transform"
          size="lg"
          onClick={() => onNavigate('setup')}
        >
          <Users className="mr-3 h-6 w-6" />
          Jogar
        </Button>

        <Button
          variant="secondary"
          className="w-full h-14 text-lg"
          size="lg"
          onClick={() => onNavigate('themes')}
        >
          <BookOpen className="mr-3 h-5 w-5" />
          Temas e Palavras
        </Button>

        <Button
          variant="secondary"
          className="w-full h-14 text-lg"
          size="lg"
          onClick={() => onNavigate('howtoplay')}
        >
          <HelpCircle className="mr-3 h-5 w-5" />
          Como Jogar
        </Button>

        <Button
          variant="secondary"
          className="w-full h-14 text-lg"
          size="lg"
          onClick={() => onNavigate('settings')}
        >
          <Settings className="mr-3 h-5 w-5" />
          Configurações
        </Button>
      </div>

      {/* Player count indicator */}
      {state.config.players.length > 0 && (
        <div className="mt-8 text-muted-foreground text-sm animate-fade-in">
          {state.config.players.length} jogador(es) configurado(s)
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-muted-foreground text-xs">
        <p>Passe o celular de mão em mão</p>
      </div>
    </div>
  );
};

export default HomeScreen;

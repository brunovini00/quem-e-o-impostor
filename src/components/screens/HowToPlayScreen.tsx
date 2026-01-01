import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Screen } from '@/pages/Index';

interface HowToPlayScreenProps {
  onNavigate: (screen: Screen) => void;
}

const HowToPlayScreen = ({ onNavigate }: HowToPlayScreenProps) => {
  const steps = [
    {
      emoji: '👥',
      title: 'Configure os Jogadores',
      description: 'Adicione pelo menos 3 jogadores. Quanto mais, melhor!',
    },
    {
      emoji: '🎭',
      title: 'Distribuição de Cartas',
      description: 'Cada jogador vê sua carta em segredo. Um ou mais serão IMPOSTORES e não verão a palavra.',
    },
    {
      emoji: '💬',
      title: 'Dando Pistas',
      description: 'Cada jogador dá uma pista sobre a palavra. O impostor precisa fingir que sabe!',
    },
    {
      emoji: '🗳️',
      title: 'Votação',
      description: 'O grupo discute e vota em quem acreditam ser o impostor.',
    },
    {
      emoji: '🎯',
      title: 'Última Chance',
      description: 'Se o impostor for descoberto, ele tem uma chance de adivinhar a palavra para virar o jogo!',
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => onNavigate('home')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">Como Jogar</h1>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        {steps.map((step, index) => (
          <Card key={index} className="p-4 bg-card animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex gap-4">
              <div className="text-3xl">{step.emoji}</div>
              <div>
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-4 bg-primary/10 border-primary max-w-md mx-auto">
        <h3 className="font-semibold mb-2">💡 Dicas</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Pistas muito específicas podem entregar a palavra!</li>
          <li>• Pistas muito vagas podem parecer suspeitas...</li>
          <li>• Observe as reações dos outros jogadores!</li>
          <li>• O impostor pode fazer perguntas para descobrir pistas.</li>
        </ul>
      </Card>
    </div>
  );
};

export default HowToPlayScreen;

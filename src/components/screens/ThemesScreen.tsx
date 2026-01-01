import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Screen } from '@/pages/Index';

interface ThemesScreenProps {
  onNavigate: (screen: Screen) => void;
}

const ThemesScreen = ({ onNavigate }: ThemesScreenProps) => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => onNavigate('home')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">Temas e Palavras</h1>
      </div>

      <Card className="p-6 text-center">
        <div className="text-4xl mb-4">🚧</div>
        <h2 className="text-xl font-semibold mb-2">Em breve!</h2>
        <p className="text-muted-foreground">
          O gerenciador completo de temas e palavras será implementado em breve.
          Por enquanto, use os 12 temas padrão com 150+ palavras.
        </p>
      </Card>
    </div>
  );
};

export default ThemesScreen;

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useGame } from '@/contexts/GameContext';
import { resetConfig } from '@/lib/storage';
import { ArrowLeft, Volume2, Vibrate, RotateCcw, Vote, Sun, Moon } from 'lucide-react';
import { Screen } from '@/pages/Index';
import { useTheme } from 'next-themes';

interface SettingsScreenProps {
  onNavigate: (screen: Screen) => void;
}

const SettingsScreen = ({ onNavigate }: SettingsScreenProps) => {
  const { state, dispatch } = useGame();
  const { theme, setTheme } = useTheme();

  const handleReset = () => {
    if (confirm('Isso irá apagar todas as configurações salvas. Continuar?')) {
      resetConfig();
      window.location.reload();
    }
  };

  const isDarkMode = theme === 'dark';

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => onNavigate('home')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <Card className="p-4 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Sons</p>
                <p className="text-sm text-muted-foreground">Efeitos sonoros do jogo</p>
              </div>
            </div>
            <Switch
              checked={state.config.soundEnabled}
              onCheckedChange={(checked) =>
                dispatch({ type: 'SET_SOUND_ENABLED', payload: checked })
              }
            />
          </div>
        </Card>

        <Card className="p-4 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Vibrate className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Vibração</p>
                <p className="text-sm text-muted-foreground">Feedback tátil no celular</p>
              </div>
            </div>
            <Switch
              checked={state.config.vibrationEnabled}
              onCheckedChange={(checked) =>
                dispatch({ type: 'SET_VIBRATION_ENABLED', payload: checked })
              }
            />
          </div>
        </Card>

        <Card className="p-4 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Vote className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Votação</p>
                <p className="text-sm text-muted-foreground">Ativar votação no jogo</p>
              </div>
            </div>
            <Switch
              checked={state.config.votingEnabled}
              onCheckedChange={(checked) =>
                dispatch({ type: 'SET_VOTING_ENABLED', payload: checked })
              }
            />
          </div>
        </Card>

        <Card className="p-4 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
              <div>
                <p className="font-medium">Tema</p>
                <p className="text-sm text-muted-foreground">{isDarkMode ? 'Modo escuro' : 'Modo claro'}</p>
              </div>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </Card>

        <Card className="p-4 bg-card/50 border-destructive/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium">Resetar Tudo</p>
                <p className="text-sm text-muted-foreground">Apagar todas as configurações</p>
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={handleReset}>
              Resetar
            </Button>
          </div>
        </Card>
      </div>

      <div className="mt-8 text-center text-muted-foreground text-xs">
        <p>Quem é o Impostor? v1.0</p>
        <p className="mt-1">Feito com ❤️</p>
      </div>
    </div>
  );
};

export default SettingsScreen;

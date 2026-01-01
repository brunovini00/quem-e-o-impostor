import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import { playSound } from '@/lib/sounds';
import { vibrate } from '@/lib/vibration';
import { ArrowLeft, Plus, Trash2, GripVertical, Play, Users, Skull, Timer, Sparkles, Vote } from 'lucide-react';
import { Screen } from '@/pages/Index';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Player } from '@/lib/storage';

interface SetupScreenProps {
  onNavigate: (screen: Screen) => void;
}

interface SortablePlayerProps {
  player: Player;
  index: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, name: string) => void;
}

function SortablePlayer({ player, index, onRemove, onUpdate }: SortablePlayerProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 bg-card rounded-lg border border-border ${
        isDragging ? 'opacity-50 shadow-glow' : ''
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="text-muted-foreground text-sm w-8">#{index + 1}</span>
      <Input
        value={player.name}
        onChange={(e) => onUpdate(player.id, e.target.value)}
        className="flex-1 bg-secondary border-none"
        placeholder="Nome do jogador"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(player.id)}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

const SetupScreen = ({ onNavigate }: SetupScreenProps) => {
  const { state, dispatch, allThemes, availableWordCount, startNewGame } = useGame();
  const { toast } = useToast();
  const [newPlayerName, setNewPlayerName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      dispatch({ type: 'ADD_PLAYER', payload: newPlayerName.trim() });
      setNewPlayerName('');
      playSound('click', state.config.soundEnabled);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = state.config.players.findIndex((p) => p.id === active.id);
      const newIndex = state.config.players.findIndex((p) => p.id === over.id);
      const newOrder = arrayMove(state.config.players, oldIndex, newIndex);
      dispatch({ type: 'REORDER_PLAYERS', payload: newOrder });
    }
  };

  const handleStartGame = () => {
    if (state.config.players.length < 3) {
      toast({
        title: 'Jogadores insuficientes',
        description: 'Adicione pelo menos 3 jogadores para começar.',
        variant: 'destructive',
      });
      return;
    }

    if (state.config.impostorCount >= state.config.players.length) {
      toast({
        title: 'Configuração inválida',
        description: 'O número de impostores deve ser menor que o número de jogadores.',
        variant: 'destructive',
      });
      return;
    }

    if (availableWordCount === 0) {
      toast({
        title: 'Nenhuma palavra disponível',
        description: 'Selecione pelo menos um tema ou ajuste a dificuldade.',
        variant: 'destructive',
      });
      return;
    }

    const success = startNewGame();
    if (success) {
      playSound('reveal', state.config.soundEnabled);
      vibrate('medium', state.config.vibrationEnabled);
    }
  };

  const difficultyLabels = {
    todos: 'Todas',
    facil: 'Fácil',
    medio: 'Médio',
    dificil: 'Difícil',
  };

  const timerOptions = [
    { value: 0, label: 'Desligado' },
    { value: 60, label: '1 min' },
    { value: 120, label: '2 min' },
    { value: 180, label: '3 min' },
    { value: 300, label: '5 min' },
  ];

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => onNavigate('home')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">Configurar Partida</h1>
      </div>

      {/* Players Section */}
      <Card className="p-4 mb-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Jogadores</h2>
          <span className="ml-auto text-muted-foreground text-sm">
            {state.config.players.length} jogador(es)
          </span>
        </div>

        {/* Add player */}
        <div className="flex gap-2 mb-4">
          <Input
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Nome do jogador"
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
          />
          <Button onClick={handleAddPlayer} size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Player list with drag and drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={state.config.players.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {state.config.players.map((player, index) => (
                <SortablePlayer
                  key={player.id}
                  player={player}
                  index={index}
                  onRemove={(id) => dispatch({ type: 'REMOVE_PLAYER', payload: id })}
                  onUpdate={(id, name) => dispatch({ type: 'UPDATE_PLAYER', payload: { id, name } })}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {state.config.players.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-destructive"
            onClick={() => {
              if (confirm('Limpar todos os jogadores?')) {
                dispatch({ type: 'CLEAR_PLAYERS' });
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar lista
          </Button>
        )}
      </Card>

      {/* Impostors Section */}
      <Card className="p-4 mb-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Skull className="h-5 w-5 text-impostor" />
          <h2 className="text-lg font-semibold">Impostores</h2>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              dispatch({ type: 'SET_IMPOSTOR_COUNT', payload: Math.max(1, state.config.impostorCount - 1) })
            }
          >
            -
          </Button>
          <span className="text-2xl font-bold w-12 text-center">{state.config.impostorCount}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => dispatch({ type: 'SET_IMPOSTOR_COUNT', payload: state.config.impostorCount + 1 })}
          >
            +
          </Button>
        </div>
        {state.config.impostorCount >= state.config.players.length && state.config.players.length > 0 && (
          <p className="text-destructive text-sm mt-2">
            ⚠️ Impostores devem ser menos que jogadores
          </p>
        )}
      </Card>

      {/* Themes Section */}
      <Card className="p-4 mb-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">Temas</h2>
          <span className="ml-auto text-muted-foreground text-sm">
            {availableWordCount} palavras
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {allThemes.map((theme) => (
            <Button
              key={theme.id}
              variant={state.config.selectedThemeIds.includes(theme.id) ? 'default' : 'outline'}
              size="sm"
              onClick={() => dispatch({ type: 'TOGGLE_THEME', payload: theme.id })}
              className="text-sm"
            >
              {theme.icon} {theme.name}
            </Button>
          ))}
        </div>
        {state.config.selectedThemeIds.length === 0 && (
          <p className="text-muted-foreground text-sm mt-2">
            Nenhum tema selecionado = todos os temas
          </p>
        )}
      </Card>

      {/* Difficulty Section */}
      <Card className="p-4 mb-4 bg-card border-border">
        <h2 className="text-lg font-semibold mb-4">Dificuldade</h2>
        <div className="flex flex-wrap gap-2">
          {(['todos', 'facil', 'medio', 'dificil'] as const).map((diff) => (
            <Button
              key={diff}
              variant={state.config.difficulty === diff ? 'default' : 'outline'}
              size="sm"
              onClick={() => dispatch({ type: 'SET_DIFFICULTY', payload: diff })}
            >
              {difficultyLabels[diff]}
            </Button>
          ))}
        </div>
      </Card>

      {/* Timer Section */}
      <Card className="p-4 mb-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Timer className="h-5 w-5 text-warning" />
          <h2 className="text-lg font-semibold">Timer</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {timerOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={
                (opt.value === 0 && !state.config.timerEnabled) ||
                (opt.value > 0 && state.config.timerEnabled && state.config.timerDuration === opt.value)
                  ? 'default'
                  : 'outline'
              }
              size="sm"
              onClick={() => {
                if (opt.value === 0) {
                  dispatch({ type: 'SET_TIMER_ENABLED', payload: false });
                } else {
                  dispatch({ type: 'SET_TIMER_ENABLED', payload: true });
                  dispatch({ type: 'SET_TIMER_DURATION', payload: opt.value });
                }
              }}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Voting Section */}
      <Card className="p-4 mb-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Vote className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Votação</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={state.config.votingEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => dispatch({ type: 'SET_VOTING_ENABLED', payload: true })}
          >
            Com votação
          </Button>
          <Button
            variant={!state.config.votingEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => dispatch({ type: 'SET_VOTING_ENABLED', payload: false })}
          >
            Sem votação
          </Button>
        </div>
        <p className="text-muted-foreground text-sm mt-2">
          {state.config.votingEnabled 
            ? 'Cada jogador vota individualmente passando o celular'
            : 'Ao final, apenas revela quem era o impostor'}
        </p>
      </Card>

      {/* Start Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          className="w-full h-14 text-xl gradient-primary shadow-glow"
          onClick={handleStartGame}
        >
          <Play className="mr-2 h-6 w-6" />
          Iniciar Partida
        </Button>
      </div>
    </div>
  );
};

export default SetupScreen;

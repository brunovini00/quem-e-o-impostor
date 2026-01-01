import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit2, 
  Download, 
  Upload, 
  ChevronRight,
  X,
  Check,
  Sparkles
} from 'lucide-react';
import { Screen } from '@/pages/Index';
import { Theme, Word, generateId, exportThemes, importThemes } from '@/lib/storage';
import { DEFAULT_THEMES } from '@/data/themes';

interface ThemesScreenProps {
  onNavigate: (screen: Screen) => void;
}

type ViewMode = 'themes' | 'words';

const ThemesScreen = ({ onNavigate }: ThemesScreenProps) => {
  const { state, dispatch, allThemes } = useGame();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [viewMode, setViewMode] = useState<ViewMode>('themes');
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [editingThemeName, setEditingThemeName] = useState('');
  const [editingThemeIcon, setEditingThemeIcon] = useState('');
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeIcon, setNewThemeIcon] = useState('🎯');
  const [showAddTheme, setShowAddTheme] = useState(false);
  
  // Word editing state
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [editingWordText, setEditingWordText] = useState('');
  const [editingWordDifficulty, setEditingWordDifficulty] = useState<'facil' | 'medio' | 'dificil'>('medio');
  const [newWordText, setNewWordText] = useState('');
  const [newWordDifficulty, setNewWordDifficulty] = useState<'facil' | 'medio' | 'dificil'>('medio');
  const [showAddWord, setShowAddWord] = useState(false);

  const customThemes = state.config.customThemes;

  // --- Theme Actions ---
  const handleCreateTheme = () => {
    if (!newThemeName.trim()) {
      toast({ title: 'Nome obrigatório', variant: 'destructive' });
      return;
    }
    const newTheme: Theme = {
      id: generateId(),
      name: newThemeName.trim(),
      icon: newThemeIcon || '🎯',
      words: [],
      isCustom: true,
    };
    dispatch({ type: 'ADD_CUSTOM_THEME', payload: newTheme });
    setNewThemeName('');
    setNewThemeIcon('🎯');
    setShowAddTheme(false);
    toast({ title: 'Tema criado!' });
  };

  const handleStartEditTheme = (theme: Theme) => {
    setEditingThemeId(theme.id);
    setEditingThemeName(theme.name);
    setEditingThemeIcon(theme.icon);
  };

  const handleSaveEditTheme = (theme: Theme) => {
    if (!editingThemeName.trim()) {
      toast({ title: 'Nome obrigatório', variant: 'destructive' });
      return;
    }
    const updated: Theme = {
      ...theme,
      name: editingThemeName.trim(),
      icon: editingThemeIcon || theme.icon,
    };
    dispatch({ type: 'UPDATE_CUSTOM_THEME', payload: updated });
    setEditingThemeId(null);
    toast({ title: 'Tema atualizado!' });
  };

  const handleDeleteTheme = (themeId: string) => {
    if (confirm('Excluir este tema e todas as palavras?')) {
      dispatch({ type: 'DELETE_CUSTOM_THEME', payload: themeId });
      toast({ title: 'Tema excluído!' });
    }
  };

  const handleOpenTheme = (theme: Theme) => {
    setSelectedTheme(theme);
    setViewMode('words');
  };

  // --- Word Actions ---
  const handleCreateWord = () => {
    if (!newWordText.trim() || !selectedTheme) {
      toast({ title: 'Texto obrigatório', variant: 'destructive' });
      return;
    }
    const newWord: Word = {
      id: generateId(),
      text: newWordText.trim(),
      difficulty: newWordDifficulty,
    };
    const updatedTheme: Theme = {
      ...selectedTheme,
      words: [...selectedTheme.words, newWord],
    };
    dispatch({ type: 'UPDATE_CUSTOM_THEME', payload: updatedTheme });
    setSelectedTheme(updatedTheme);
    setNewWordText('');
    setShowAddWord(false);
    toast({ title: 'Palavra adicionada!' });
  };

  const handleStartEditWord = (word: Word) => {
    setEditingWordId(word.id);
    setEditingWordText(word.text);
    setEditingWordDifficulty(word.difficulty);
  };

  const handleSaveEditWord = (word: Word) => {
    if (!editingWordText.trim() || !selectedTheme) {
      toast({ title: 'Texto obrigatório', variant: 'destructive' });
      return;
    }
    const updatedWords = selectedTheme.words.map(w =>
      w.id === word.id 
        ? { ...w, text: editingWordText.trim(), difficulty: editingWordDifficulty }
        : w
    );
    const updatedTheme: Theme = { ...selectedTheme, words: updatedWords };
    dispatch({ type: 'UPDATE_CUSTOM_THEME', payload: updatedTheme });
    setSelectedTheme(updatedTheme);
    setEditingWordId(null);
    toast({ title: 'Palavra atualizada!' });
  };

  const handleDeleteWord = (wordId: string) => {
    if (!selectedTheme) return;
    const updatedWords = selectedTheme.words.filter(w => w.id !== wordId);
    const updatedTheme: Theme = { ...selectedTheme, words: updatedWords };
    dispatch({ type: 'UPDATE_CUSTOM_THEME', payload: updatedTheme });
    setSelectedTheme(updatedTheme);
    toast({ title: 'Palavra removida!' });
  };

  // --- Import/Export ---
  const handleExport = () => {
    const json = exportThemes(customThemes);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'temas-impostor.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Temas exportados!' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const themes = importThemes(content);
      if (themes) {
        // Mark all as custom and generate new IDs to avoid conflicts
        const processedThemes = themes.map(t => ({
          ...t,
          id: generateId(),
          isCustom: true,
          words: t.words.map(w => ({ ...w, id: generateId() })),
        }));
        dispatch({ type: 'IMPORT_THEMES', payload: processedThemes });
        toast({ title: `${processedThemes.length} tema(s) importado(s)!` });
      } else {
        toast({ title: 'Arquivo inválido', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'facil': return 'Fácil';
      case 'medio': return 'Médio';
      case 'dificil': return 'Difícil';
      default: return diff;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'facil': return 'text-success';
      case 'medio': return 'text-warning';
      case 'dificil': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  // --- Render Words View ---
  if (viewMode === 'words' && selectedTheme) {
    const isCustom = selectedTheme.isCustom;
    const currentTheme = isCustom 
      ? customThemes.find(t => t.id === selectedTheme.id) || selectedTheme
      : selectedTheme;

    return (
      <div className="min-h-screen bg-background p-4 pb-24">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => {
            setViewMode('themes');
            setSelectedTheme(null);
            setShowAddWord(false);
          }}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{currentTheme.icon} {currentTheme.name}</h1>
            <p className="text-sm text-muted-foreground">
              {currentTheme.words.length} palavra(s)
              {!isCustom && ' (somente leitura)'}
            </p>
          </div>
        </div>

        {/* Add Word Form */}
        {isCustom && (
          <>
            {showAddWord ? (
              <Card className="p-4 mb-4 bg-card border-primary">
                <div className="space-y-3">
                  <Input
                    value={newWordText}
                    onChange={(e) => setNewWordText(e.target.value)}
                    placeholder="Nova palavra..."
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateWord()}
                  />
                  <div className="flex gap-2">
                    {(['facil', 'medio', 'dificil'] as const).map((diff) => (
                      <Button
                        key={diff}
                        size="sm"
                        variant={newWordDifficulty === diff ? 'default' : 'outline'}
                        onClick={() => setNewWordDifficulty(diff)}
                      >
                        {getDifficultyLabel(diff)}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={handleCreateWord}>
                      <Check className="h-4 w-4 mr-2" /> Adicionar
                    </Button>
                    <Button variant="ghost" onClick={() => setShowAddWord(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Button
                variant="outline"
                className="w-full mb-4 border-dashed"
                onClick={() => setShowAddWord(true)}
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar Palavra
              </Button>
            )}
          </>
        )}

        {/* Words List */}
        <div className="space-y-2">
          {currentTheme.words.map((word) => (
            <Card key={word.id} className="p-3 bg-card">
              {editingWordId === word.id && isCustom ? (
                <div className="space-y-2">
                  <Input
                    value={editingWordText}
                    onChange={(e) => setEditingWordText(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    {(['facil', 'medio', 'dificil'] as const).map((diff) => (
                      <Button
                        key={diff}
                        size="sm"
                        variant={editingWordDifficulty === diff ? 'default' : 'outline'}
                        onClick={() => setEditingWordDifficulty(diff)}
                      >
                        {getDifficultyLabel(diff)}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSaveEditWord(word)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingWordId(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{word.text}</span>
                    <span className={`text-xs ${getDifficultyColor(word.difficulty)}`}>
                      {getDifficultyLabel(word.difficulty)}
                    </span>
                  </div>
                  {isCustom && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleStartEditWord(word)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteWord(word.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}

          {currentTheme.words.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma palavra ainda</p>
              {isCustom && <p className="text-sm">Adicione a primeira!</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Render Themes View ---
  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => onNavigate('home')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">Temas e Palavras</h1>
      </div>

      {/* Import/Export */}
      <div className="flex gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={handleExport} disabled={customThemes.length === 0}>
          <Download className="h-4 w-4 mr-2" /> Exportar
        </Button>
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4 mr-2" /> Importar
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
      </div>

      {/* Add Theme Form */}
      {showAddTheme ? (
        <Card className="p-4 mb-4 bg-card border-primary">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newThemeIcon}
                onChange={(e) => setNewThemeIcon(e.target.value)}
                placeholder="🎯"
                className="w-16 text-center text-xl"
                maxLength={2}
              />
              <Input
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                placeholder="Nome do tema..."
                className="flex-1"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTheme()}
              />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleCreateTheme}>
                <Check className="h-4 w-4 mr-2" /> Criar Tema
              </Button>
              <Button variant="ghost" onClick={() => setShowAddTheme(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button
          variant="outline"
          className="w-full mb-4 border-dashed"
          onClick={() => setShowAddTheme(true)}
        >
          <Plus className="h-4 w-4 mr-2" /> Criar Novo Tema
        </Button>
      )}

      {/* Custom Themes */}
      {customThemes.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Meus Temas
          </h2>
          <div className="space-y-2 mb-6">
            {customThemes.map((theme) => (
              <Card key={theme.id} className="p-3 bg-card">
                {editingThemeId === theme.id ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={editingThemeIcon}
                        onChange={(e) => setEditingThemeIcon(e.target.value)}
                        className="w-16 text-center text-xl"
                        maxLength={2}
                      />
                      <Input
                        value={editingThemeName}
                        onChange={(e) => setEditingThemeName(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveEditTheme(theme)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingThemeId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => handleOpenTheme(theme)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{theme.icon}</span>
                      <div>
                        <p className="font-medium">{theme.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {theme.words.length} palavra(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditTheme(theme);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTheme(theme.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Default Themes */}
      <h2 className="text-lg font-semibold mb-2">Temas Padrão</h2>
      <p className="text-sm text-muted-foreground mb-3">
        Temas incluídos no jogo (somente leitura)
      </p>
      <div className="space-y-2">
        {DEFAULT_THEMES.map((theme) => (
          <Card 
            key={theme.id} 
            className="p-3 bg-card cursor-pointer hover:bg-card/80 transition-colors"
            onClick={() => handleOpenTheme(theme)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{theme.icon}</span>
                <div>
                  <p className="font-medium">{theme.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {theme.words.length} palavra(s)
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ThemesScreen;
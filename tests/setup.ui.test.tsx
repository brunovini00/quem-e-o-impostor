import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { Player, Theme } from '../src/domain/types';
import { DEFAULT_SETTINGS } from '../src/domain/types';
import { Button } from '../src/ui/components';
import {
  OrderScreen,
  PlayersScreen,
  ReviewScreen,
  SettingsScreen,
  ThemesScreen,
} from '../src/screens/SetupScreens';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: Object.assign(() => null, { glyphMap: {} }),
}));

const players: Player[] = [
  { id: 'ana', name: 'Ana' },
  { id: 'bia', name: 'Bia' },
  { id: 'caio', name: 'Caio' },
];
const themes: Theme[] = [
  {
    id: 'foods',
    name: 'Comidas e pratos',
    emoji: '🍕',
    description: 'Sabores da mesa',
    words: [
      { text: 'Pizza', difficulty: 'easy' },
      { text: 'Feijoada', difficulty: 'easy' },
    ],
  },
  {
    id: 'series',
    name: 'Séries e programas de TV',
    emoji: '📺',
    description: 'Personagens na televisão',
    words: [{ text: 'Chaves', difficulty: 'easy' }],
  },
];
const noop = () => undefined;

describe('cadastro de jogadores', () => {
  it('exige os três nomes e só avança com cadastro completo', () => {
    const onChange = jest.fn();
    const onNext = jest.fn();
    render(
      <PlayersScreen
        players={[]}
        onChange={onChange}
        onNext={onNext}
        onBack={noop}
        onClear={noop}
      />,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Organizar a ordem' }));
    expect(screen.getAllByText('Escreva o nome de quem vai jogar.')).toHaveLength(3);
    expect(onNext).not.toHaveBeenCalled();
    fireEvent.changeText(screen.getByLabelText('Nome do jogador 1'), '  Ana  ');
    fireEvent.changeText(screen.getByLabelText('Nome do jogador 2'), 'Bia');
    expect(onChange.mock.lastCall?.[0].map((player: Player) => player.name)).toEqual([
      '  Ana  ',
      'Bia',
      '',
    ]);
    expect(onNext).not.toHaveBeenCalled();
    fireEvent.changeText(screen.getByLabelText('Nome do jogador 3'), 'Caio');
    fireEvent.press(screen.getByRole('button', { name: 'Organizar a ordem' }));
    expect(onChange.mock.lastCall?.[0].map((player: Player) => player.name)).toEqual([
      'Ana',
      'Bia',
      'Caio',
    ]);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('rejeita nomes equivalentes depois de normalizar acentos, caixa e espaços', () => {
    const onChange = jest.fn();
    const onNext = jest.fn();
    render(
      <PlayersScreen
        players={players}
        onChange={onChange}
        onNext={onNext}
        onBack={noop}
        onClear={noop}
      />,
    );
    fireEvent.changeText(screen.getByLabelText('Nome do jogador 3'), '  ÁNA  ');
    fireEvent.press(screen.getByRole('button', { name: 'Organizar a ordem' }));
    expect(
      screen.getAllByText('Esse nome já está na lista. Use um apelido diferente.'),
    ).toHaveLength(2);
    expect(onChange).toHaveBeenLastCalledWith([
      players[0],
      players[1],
      { ...players[2], name: '  ÁNA  ' },
    ]);
    expect(onNext).not.toHaveBeenCalled();
  });

  it('preserva campos incompletos e nomes repetidos ao voltar e montar novamente a tela', () => {
    const onNext = jest.fn();
    function NavigationHarness() {
      const [saved, setSaved] = useState<Player[]>([]);
      const [open, setOpen] = useState(true);
      return open ? (
        <PlayersScreen
          players={saved}
          onChange={setSaved}
          onNext={onNext}
          onBack={() => setOpen(false)}
          onClear={noop}
        />
      ) : (
        <Button label="Retomar cadastro" onPress={() => setOpen(true)} />
      );
    }
    render(<NavigationHarness />);
    fireEvent.changeText(screen.getByLabelText('Nome do jogador 1'), 'Lia');
    fireEvent.press(screen.getByRole('button', { name: 'Adicionar jogador' }));
    fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    fireEvent.press(screen.getByRole('button', { name: 'Retomar cadastro' }));
    expect(screen.getByLabelText('Nome do jogador 1')).toHaveDisplayValue('Lia');
    expect(screen.getByLabelText('Nome do jogador 2')).toHaveDisplayValue('');
    expect(screen.getAllByLabelText(/^Nome do jogador /)).toHaveLength(4);
    fireEvent.changeText(screen.getByLabelText('Nome do jogador 2'), 'LIA');
    fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    fireEvent.press(screen.getByRole('button', { name: 'Retomar cadastro' }));
    expect(screen.getByLabelText('Nome do jogador 2')).toHaveDisplayValue('LIA');
    fireEvent.press(screen.getByRole('button', { name: 'Organizar a ordem' }));
    expect(
      screen.getAllByText('Esse nome já está na lista. Use um apelido diferente.'),
    ).toHaveLength(2);
    expect(screen.getAllByText('Escreva o nome de quem vai jogar.')).toHaveLength(2);
    expect(onNext).not.toHaveBeenCalled();
  });

  it.each([1, 2])('mantém os %i nomes existentes ao completar os campos mínimos', (count) => {
    render(
      <PlayersScreen
        players={players.slice(0, count)}
        onChange={noop}
        onNext={noop}
        onBack={noop}
        onClear={noop}
      />,
    );
    expect(screen.getAllByLabelText(/^Nome do jogador /)).toHaveLength(3);
    for (const [index, player] of players.slice(0, count).entries()) {
      expect(screen.getByLabelText(`Nome do jogador ${index + 1}`)).toHaveDisplayValue(player.name);
    }
    expect(screen.getByLabelText('Nome do jogador 3')).toHaveDisplayValue('');
  });

  it('rejeita nomes longos e impede reduzir a lista abaixo de três pessoas', () => {
    const onNext = jest.fn();
    render(
      <PlayersScreen
        players={players}
        onChange={noop}
        onNext={onNext}
        onBack={noop}
        onClear={noop}
      />,
    );
    expect(screen.getByRole('button', { name: 'Diminuir quantidade de jogadores' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remover Ana' })).toBeDisabled();
    fireEvent.changeText(screen.getByLabelText('Nome do jogador 1'), 'A'.repeat(25));
    fireEvent.press(screen.getByRole('button', { name: 'Organizar a ordem' }));
    expect(screen.getByText('Use até 24 caracteres.')).toBeOnTheScreen();
    expect(onNext).not.toHaveBeenCalled();
  });

  it('limita o cadastro a vinte campos e permite remover uma pessoa', () => {
    const onChange = jest.fn();
    render(
      <PlayersScreen
        players={players}
        onChange={onChange}
        onNext={noop}
        onBack={noop}
        onClear={noop}
      />,
    );
    for (let index = 3; index < 20; index += 1)
      fireEvent.press(screen.getByRole('button', { name: 'Aumentar quantidade de jogadores' }));
    expect(screen.getByRole('button', { name: 'Adicionar jogador' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Aumentar quantidade de jogadores' })).toBeDisabled();
    expect(screen.getAllByLabelText(/^Nome do jogador /)).toHaveLength(20);
    fireEvent.press(screen.getByRole('button', { name: 'Remover jogador 20' }));
    expect(screen.getAllByLabelText(/^Nome do jogador /)).toHaveLength(19);
  });

  it('salva a edição e a remoção quando os nomes continuam válidos', () => {
    const onChange = jest.fn();
    render(
      <PlayersScreen
        players={[...players, { id: 'duda', name: 'Duda' }]}
        onChange={onChange}
        onNext={noop}
        onBack={noop}
        onClear={noop}
      />,
    );
    fireEvent.changeText(screen.getByLabelText('Nome do jogador 2'), 'Beatriz');
    expect(onChange.mock.lastCall?.[0][1].name).toBe('Beatriz');
    fireEvent.press(screen.getByRole('button', { name: 'Remover Duda' }));
    expect(onChange.mock.lastCall?.[0].map((player: Player) => player.name)).toEqual([
      'Ana',
      'Beatriz',
      'Caio',
    ]);
  });
});

describe('ordem e seleção de temas', () => {
  it('reordena pelas setas e oferece ações para leitores de tela', () => {
    const onChange = jest.fn();
    function Harness() {
      const [ordered, setOrdered] = useState(players);
      return (
        <OrderScreen
          players={ordered}
          onChange={(next) => {
            setOrdered(next);
            onChange(next);
          }}
          onNext={noop}
          onBack={noop}
          onShuffle={noop}
        />
      );
    }
    render(<Harness />);
    expect(screen.getByRole('button', { name: 'Mover Ana para cima' })).toBeDisabled();
    fireEvent.press(screen.getByRole('button', { name: 'Mover Ana para baixo' }));
    expect(onChange.mock.lastCall?.[0].map((player: Player) => player.name)).toEqual([
      'Bia',
      'Ana',
      'Caio',
    ]);
    fireEvent(screen.getByLabelText('Ordem de Caio: 3 de 3'), 'accessibilityAction', {
      nativeEvent: { actionName: 'decrement' },
    });
    expect(onChange.mock.lastCall?.[0].map((player: Player) => player.name)).toEqual([
      'Bia',
      'Caio',
      'Ana',
    ]);
  });

  it('filtra sem exigir acentos e preserva seleção múltipla fora da busca', () => {
    function Harness() {
      const [selected, setSelected] = useState<string[]>([]);
      return (
        <ThemesScreen
          themes={themes}
          selectedIds={selected}
          onChange={setSelected}
          onNext={noop}
          onBack={noop}
        />
      );
    }
    render(<Harness />);
    expect(screen.getByRole('button', { name: 'Revisar partida' })).toBeDisabled();
    fireEvent.press(screen.getByRole('checkbox', { name: /Comidas e pratos,/ }));
    fireEvent.changeText(screen.getByLabelText('Buscar temas'), 'SERIES');
    expect(screen.queryByText('Comidas e pratos')).not.toBeOnTheScreen();
    fireEvent.press(screen.getByRole('checkbox', { name: /Séries e programas de TV,/ }));
    expect(screen.getByText('2 temas selecionados · 3 entradas')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Revisar partida' })).toBeEnabled();
    fireEvent.press(screen.getByRole('button', { name: 'Limpar busca' }));
    expect(screen.getByRole('checkbox', { name: /Comidas e pratos,/ })).toBeChecked();
    fireEvent.press(screen.getByRole('button', { name: 'Limpar seleção de temas' }));
    expect(screen.getByRole('button', { name: 'Revisar partida' })).toBeDisabled();
  });

  it('seleciona todos e apresenta estado vazio sem perder opções', () => {
    const onChange = jest.fn();
    render(
      <ThemesScreen
        themes={themes}
        selectedIds={[]}
        onChange={onChange}
        onNext={noop}
        onBack={noop}
      />,
    );
    fireEvent.press(screen.getByRole('checkbox', { name: 'Todos os temas' }));
    expect(onChange).toHaveBeenLastCalledWith(['foods', 'series']);
    fireEvent.changeText(screen.getByLabelText('Buscar temas'), 'zzzinexistente');
    expect(screen.getByText('Nenhum tema por aqui')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Ver todos os temas' }));
    expect(screen.getByText('Comidas e pratos')).toBeOnTheScreen();
  });
});

describe('revisão e preferências', () => {
  it('apresenta nomes, quantidade real de palavras e atalhos para editar', () => {
    const onEditPlayers = jest.fn();
    const onStart = jest.fn();
    render(
      <ReviewScreen
        players={players}
        themes={themes}
        selectedIds={['foods']}
        settings={DEFAULT_SETTINGS}
        onStart={onStart}
        onBack={noop}
        onEditPlayers={onEditPlayers}
        onEditThemes={noop}
      />,
    );
    expect(screen.getByText('2 entradas disponíveis para o sorteio.')).toBeOnTheScreen();
    expect(screen.getByText('Sorteado entre todos')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Editar jogadores' }));
    expect(onEditPlayers).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByRole('button', { name: 'Iniciar partida' }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('altera som e timer sem modificar as outras preferências', () => {
    const onChange = jest.fn();
    render(
      <SettingsScreen
        settings={DEFAULT_SETTINGS}
        onChange={onChange}
        onBack={noop}
        onClearPlayers={noop}
        onClearHistory={noop}
        historyCount={0}
      />,
    );
    fireEvent(screen.getByLabelText('Sons'), 'valueChange', true);
    expect(onChange).toHaveBeenLastCalledWith({ ...DEFAULT_SETTINGS, sound: true });
    fireEvent.press(screen.getByRole('radio', { name: 'Sem limite' }));
    expect(onChange).toHaveBeenLastCalledWith({ ...DEFAULT_SETTINGS, timerSeconds: 0 });
    expect(screen.getByRole('button', { name: 'Limpar histórico de palavras' })).toBeDisabled();
  });
});

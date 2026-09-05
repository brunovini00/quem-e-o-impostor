import { useEffect, useReducer, useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Confirmation, type ConfirmationRequest } from '../src/components/Confirmation';
import { gameReducer, initialGame } from '../src/domain';
import { DEFAULT_SETTINGS, type GameState, type Round, type Theme } from '../src/domain/types';
import { RoundScreen } from '../src/screens/RoundScreen';

const word = 'Pitanga';
const round: Round = {
  id: 'round-ui',
  players: [
    { id: 'ana', name: 'Ana' },
    { id: 'bia', name: 'Bia' },
    { id: 'caio', name: 'Caio' },
  ],
  word: { text: word, difficulty: 'easy' },
  themeId: 'fruits',
  impostorIds: ['bia'],
  firstSpeakerId: 'caio',
};
const themes: Theme[] = [
  {
    id: 'fruits',
    name: 'Frutas',
    emoji: '🍓',
    description: 'Sabores naturais',
    words: [round.word],
  },
];
const settings = { ...DEFAULT_SETTINGS, timerSeconds: 0 };
const noop = () => undefined;

function Harness({
  obscured = false,
  onState = noop,
  onExit = noop,
  onReplay = noop,
  onConfigure = noop,
  onHome = noop,
}: {
  obscured?: boolean;
  onState?: (state: GameState) => void;
  onExit?: () => void;
  onReplay?: () => void;
  onConfigure?: () => void;
  onHome?: () => void;
}) {
  const [game, dispatch] = useReducer(gameReducer, round, initialGame);
  const [confirmation, setConfirmation] = useState<ConfirmationRequest | null>(null);
  useEffect(() => {
    onState(game);
  }, [game, onState]);
  useEffect(() => {
    if (obscured) dispatch({ type: 'BACKGROUND' });
  }, [obscured]);
  return (
    <>
      <RoundScreen
        game={game}
        settings={settings}
        themes={themes}
        dispatch={dispatch}
        obscured={obscured}
        onExit={() => {
          dispatch({ type: 'BACKGROUND' });
          setConfirmation({
            title: 'Sair da partida?',
            message: 'O segredo será descartado.',
            label: 'Sair da partida',
            danger: true,
            confirm: onExit,
          });
        }}
        onResult={() =>
          setConfirmation({
            title: 'Todos estão prontos?',
            message: 'O grupo verá a palavra e o impostor.',
            label: 'Confirmar resultado',
            confirm: () => dispatch({ type: 'RESULT' }),
          })
        }
        onReplay={onReplay}
        onConfigure={onConfigure}
        onHome={onHome}
        onFeedback={noop}
      />
      <Confirmation request={confirmation} onClose={() => setConfirmation(null)} />
    </>
  );
}

function expectHidden() {
  expect(screen.queryByTestId('secret-content')).not.toBeOnTheScreen();
  expect(screen.queryByText(word)).not.toBeOnTheScreen();
  expect(JSON.stringify(screen.toJSON())).not.toContain(word);
}

function confirmHolder(name: string) {
  expectHidden();
  fireEvent.press(screen.getByRole('button', { name: `Sou ${name}` }));
  expectHidden();
}

function revealByHold() {
  fireEvent(screen.getByRole('button', { name: 'Segure para revelar seu papel' }), 'longPress');
}

function finishReading(last = false) {
  fireEvent.press(screen.getByRole('button', { name: 'Já memorizei · esconder e continuar' }));
  expect(screen.getByText('Segredo guardado.')).toBeOnTheScreen();
  expectHidden();
  fireEvent.press(
    screen.getByRole('button', { name: last ? 'Começar discussão' : 'Próxima pessoa' }),
  );
  expectHidden();
}

function finishRevelations() {
  round.players.forEach((player, index) => {
    confirmHolder(player.name);
    revealByHold();
    finishReading(index === round.players.length - 1);
  });
}

describe('fluxo de revelação em um único celular', () => {
  it('percorre três jogadores, revela a mesma palavra aos comuns e só o papel ao impostor', () => {
    render(<Harness />);
    const receivedWords: string[] = [];
    for (const [index, player] of round.players.entries()) {
      confirmHolder(player.name);
      expect(
        screen.queryByRole('button', { name: 'Já memorizei · esconder e continuar' }),
      ).not.toBeOnTheScreen();
      fireEvent.press(screen.getByRole('button', { name: 'Segure para revelar seu papel' }));
      expectHidden();
      revealByHold();
      expect(screen.getByTestId('secret-content')).toBeOnTheScreen();
      if (player.id === 'bia') {
        expect(screen.getByText(/VOCÊ É O\s+IMPOSTOR/)).toBeOnTheScreen();
        expect(screen.queryByText(word)).not.toBeOnTheScreen();
        expect(JSON.stringify(screen.toJSON())).not.toContain(word);
      } else {
        expect(screen.getByText(word)).toBeOnTheScreen();
        receivedWords.push(word);
        expect(screen.queryByText(/VOCÊ É O\s+IMPOSTOR/)).not.toBeOnTheScreen();
      }
      fireEvent(screen.getByRole('button', { name: 'Segure para revelar seu papel' }), 'pressOut');
      expectHidden();
      finishReading(index === 2);
    }
    expect(receivedWords).toEqual([word, word]);
    expect(screen.getByText('Agora é com vocês.')).toBeOnTheScreen();
    expect(screen.getByText(/Caio\s+começa a falar/)).toBeOnTheScreen();
    expect(screen.getByText('SEM PRESSA')).toBeOnTheScreen();
  });

  it('ignora toques rápidos em lote sem saltar uma pessoa ou reabrir a anterior', () => {
    const onState = jest.fn();
    render(<Harness onState={onState} />);
    const holder = screen.getByRole('button', { name: 'Sou Ana' });
    act(() => {
      fireEvent.press(holder);
      fireEvent.press(holder);
      fireEvent.press(holder);
    });
    expect(onState.mock.lastCall?.[0].phase).toBe('ready');
    const reveal = screen.getByRole('button', { name: 'Segure para revelar seu papel' });
    act(() => {
      fireEvent(reveal, 'longPress');
      fireEvent(reveal, 'longPress');
    });
    expect(screen.getAllByTestId('secret-content')).toHaveLength(1);
    const read = screen.getByRole('button', { name: 'Já memorizei · esconder e continuar' });
    act(() => {
      fireEvent.press(read);
      fireEvent.press(read);
    });
    const next = screen.getByRole('button', { name: 'Próxima pessoa' });
    act(() => {
      fireEvent.press(next);
      fireEvent.press(next);
      fireEvent.press(next);
    });
    expect(onState.mock.lastCall?.[0].cursor).toBe(1);
    expect(onState.mock.lastCall?.[0].phase).toBe('handoff');
    expect(screen.getByRole('button', { name: 'Sou Bia' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Sou Ana' })).not.toBeOnTheScreen();
    expectHidden();
  });

  it('remove o segredo da árvore quando coberto e exige nova ação após voltar', () => {
    const view = render(<Harness />);
    confirmHolder('Ana');
    revealByHold();
    expect(screen.getByText(word)).toBeOnTheScreen();
    view.rerender(<Harness obscured />);
    expect(screen.getByText('Conteúdo protegido')).toBeOnTheScreen();
    expectHidden();
    view.rerender(<Harness />);
    expectHidden();
    expect(screen.getByText('Ana, só você pode olhar.')).toBeOnTheScreen();
    revealByHold();
    expect(screen.getByText(word)).toBeOnTheScreen();
    finishReading();
    view.rerender(<Harness obscured />);
    view.rerender(<Harness />);
    expect(screen.getByRole('button', { name: 'Sou Bia' })).toBeOnTheScreen();
    expectHidden();
  });

  it('oferece revelação acessível com confirmação, cancelamento e ocultação intencional', () => {
    render(<Harness />);
    confirmHolder('Ana');
    fireEvent.press(screen.getByRole('button', { name: 'Revelar com confirmação' }));
    expect(screen.getByText('Pronto para olhar?')).toBeOnTheScreen();
    expectHidden();
    fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expectHidden();
    fireEvent.press(screen.getByRole('button', { name: 'Revelar com confirmação' }));
    fireEvent.press(screen.getByRole('button', { name: 'Mostrar meu papel' }));
    expect(screen.getByText(word)).toBeOnTheScreen();
    finishReading();
    expect(screen.getByRole('button', { name: 'Sou Bia' })).toBeOnTheScreen();
  });

  it('voltar solicita abandono, oculta o segredo e cancelar mantém o jogador atual', () => {
    const onExit = jest.fn();
    render(<Harness onExit={onExit} />);
    confirmHolder('Ana');
    revealByHold();
    finishReading();
    confirmHolder('Bia');
    revealByHold();
    fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(screen.getByText('Sair da partida?')).toBeOnTheScreen();
    expectHidden();
    expect(onExit).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByText('Bia, só você pode olhar.')).toBeOnTheScreen();
    expectHidden();
    expect(screen.queryByRole('button', { name: 'Sou Ana' })).not.toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    fireEvent.press(screen.getByRole('button', { name: 'Sair da partida' }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});

describe('discussão, palpite e resultado', () => {
  it('registra palpite opcional, confirma resultado e oferece três destinos', () => {
    const onReplay = jest.fn();
    const onConfigure = jest.fn();
    const onHome = jest.fn();
    render(<Harness onReplay={onReplay} onConfigure={onConfigure} onHome={onHome} />);
    finishRevelations();
    fireEvent.press(screen.getByRole('button', { name: 'Registrar um palpite' }));
    expect(screen.getByText('Quem está disfarçando?')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('radio', { name: 'Bia' }));
    expect(screen.getByRole('radio', { name: 'Bia' })).toBeChecked();
    fireEvent.press(screen.getByRole('button', { name: 'Voltar à discussão' }));
    expectHidden();
    fireEvent.press(screen.getByRole('button', { name: 'Revelar resultado' }));
    expect(screen.getByText('Todos estão prontos?')).toBeOnTheScreen();
    expectHidden();
    fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expectHidden();
    fireEvent.press(screen.getByRole('button', { name: 'Revelar resultado' }));
    fireEvent.press(screen.getByRole('button', { name: 'Confirmar resultado' }));
    expect(screen.getByText('Fim do disfarce.')).toBeOnTheScreen();
    expect(screen.getByText(word)).toBeOnTheScreen();
    expect(screen.getByText('Bia')).toBeOnTheScreen();
    expect(screen.getByText('O grupo acertou!')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Jogar novamente' }));
    fireEvent.press(screen.getByRole('button', { name: 'Nova configuração' }));
    fireEvent.press(screen.getByRole('button', { name: 'Voltar ao início' }));
    expect(onReplay).toHaveBeenCalledTimes(1);
    expect(onConfigure).toHaveBeenCalledTimes(1);
    expect(onHome).toHaveBeenCalledTimes(1);
  });

  it('permite revelar resultado sem participar da votação', () => {
    render(<Harness />);
    finishRevelations();
    fireEvent.press(screen.getByRole('button', { name: 'Revelar resultado' }));
    fireEvent.press(screen.getByRole('button', { name: 'Confirmar resultado' }));
    expect(screen.getByText('Sem palpite registrado. Valeu o disfarce?')).toBeOnTheScreen();
    expect(screen.getByText(word)).toBeOnTheScreen();
  });
});

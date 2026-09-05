import { useCallback } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { PlayerOrder } from '../components/PlayerOrder';
import { movePlayer } from '../domain/players';
import type { Player, Settings, Theme } from '../domain/types';
import { Button, Card, Icon, Label, Page, usePalette } from '../ui/components';

export { PlayersScreen } from './PlayersScreen';
export { ThemesScreen } from './ThemesScreen';

interface OrderScreenProps {
  players: Player[];
  onChange: (players: Player[]) => void;
  onNext: () => void;
  onBack: () => void;
  onShuffle: () => void;
}

export function OrderScreen({ players, onChange, onNext, onBack, onShuffle }: OrderScreenProps) {
  const palette = usePalette();
  const changeOrder = useCallback(
    (from: number, to: number) => {
      if (from === to || from < 0 || to < 0 || from >= players.length || to >= players.length)
        return;
      onChange(movePlayer(players, from, to));
    },
    [onChange, players],
  );

  return (
    <Page
      title="Passe nessa ordem"
      subtitle="Organize a lista como vocês estão sentados. Fica mais fácil passar o celular."
      onBack={onBack}
      footer={<Button label="Escolher os temas" icon="arrow-forward" onPress={onNext} />}
    >
      <View>
        <Button label="Embaralhar ordem" icon="shuffle" variant="secondary" onPress={onShuffle} />
        <View style={styles.orderHint}>
          <Icon name="hand-left-outline" size={17} color={palette.accent} />
          <Text style={[styles.bodySmall, { color: palette.muted }]}>
            Arraste pela alça ou use as setas para mover.
          </Text>
        </View>
        <PlayerOrder players={players} onMove={changeOrder} />
        <Text style={[styles.note, { color: palette.muted }]}>
          A ordem organiza a passagem do aparelho. Todo mundo tem a mesma chance de ser o impostor.
        </Text>
      </View>
    </Page>
  );
}

interface ReviewScreenProps {
  players: Player[];
  themes: Theme[];
  selectedIds: string[];
  settings: Settings;
  onStart: () => void;
  onBack: () => void;
  onEditPlayers: () => void;
  onEditThemes: () => void;
}

export function ReviewScreen({
  players,
  themes,
  selectedIds,
  settings,
  onStart,
  onBack,
  onEditPlayers,
  onEditThemes,
}: ReviewScreenProps) {
  const palette = usePalette();
  const chosenThemes = themes.filter((theme) => selectedIds.includes(theme.id));
  const words = chosenThemes.reduce((sum, theme) => sum + theme.words.length, 0);
  return (
    <Page
      title="Tudo pronto?"
      subtitle="Uma palavra em comum. Uma pessoa fora do segredo."
      onBack={onBack}
      footer={
        <Button
          label="Iniciar partida"
          icon="play"
          onPress={onStart}
          disabled={players.length < 3 || chosenThemes.length === 0}
        />
      }
    >
      <View>
        <Card>
          <View style={styles.cardHeader}>
            <View style={styles.headerLabel}>
              <Icon name="people-outline" size={20} color={palette.accent} />
              <Label>{players.length} JOGADORES</Label>
            </View>
            <EditButton label="Editar jogadores" onPress={onEditPlayers} />
          </View>
          <View style={styles.playerChips}>
            {players.map((player, index) => (
              <View
                key={player.id}
                style={[styles.playerChip, { backgroundColor: palette.surface2 }]}
              >
                <Text style={[styles.chipNumber, { color: palette.accent }]}>{index + 1}</Text>
                <Text style={[styles.chipText, { color: palette.text }]}>{player.name}</Text>
              </View>
            ))}
          </View>
        </Card>
        <View style={styles.spacer} />
        <Card>
          <View style={styles.cardHeader}>
            <View style={styles.headerLabel}>
              <Icon name="grid-outline" size={20} color={palette.accent} />
              <Label>
                {chosenThemes.length === themes.length
                  ? 'TODOS OS TEMAS'
                  : `${chosenThemes.length} ${chosenThemes.length === 1 ? 'TEMA' : 'TEMAS'}`}
              </Label>
            </View>
            <EditButton label="Editar temas" onPress={onEditThemes} />
          </View>
          <Text style={[styles.themeSummary, { color: palette.text }]}>
            {chosenThemes.map((theme) => `${theme.emoji} ${theme.name}`).join('  ·  ')}
          </Text>
          <Text style={[styles.bodySmall, styles.summaryCount, { color: palette.muted }]}>
            {words.toLocaleString('pt-BR')} entradas disponíveis para o sorteio.
          </Text>
        </Card>
        <View style={styles.spacer} />
        <Card>
          <Label>COMBINADO DA RODADA</Label>
          <SummaryLine icon="finger-print-outline" label="Impostores" value="1 pessoa" />
          <SummaryLine
            icon="chatbubble-ellipses-outline"
            label="Quem começa"
            value={
              settings.firstSpeaker === 'first'
                ? (players[0]?.name ?? 'Primeiro da lista')
                : 'Sorteado entre todos'
            }
          />
          <SummaryLine
            icon="timer-outline"
            label="Discussão"
            value={
              settings.timerSeconds === 0 ? 'Sem cronômetro' : `${settings.timerSeconds / 60} min`
            }
          />
          <SummaryLine icon="checkmark-done-outline" label="Votação" value="Opcional" />
        </Card>
        <View style={[styles.privacyNote, { backgroundColor: palette.surface2 }]}>
          <Icon name="eye-off-outline" size={23} color={palette.accent} />
          <Text style={[styles.privacyText, { color: palette.muted }]}>
            Cada pessoa vê sua informação sozinha. Ao começar, entregue o celular a{' '}
            <Text style={{ color: palette.text, fontWeight: '700' }}>
              {players[0]?.name ?? 'quem estiver primeiro na lista'}
            </Text>
            .
          </Text>
        </View>
      </View>
    </Page>
  );
}

function EditButton({ label, onPress }: { label: string; onPress: () => void }) {
  const palette = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.editButton}
    >
      <Text style={[styles.editText, { color: palette.accent }]}>Editar</Text>
    </Pressable>
  );
}

function SummaryLine({ icon, label, value }: { icon: string; label: string; value: string }) {
  const palette = usePalette();
  return (
    <View style={styles.summaryLine}>
      <Icon name={icon} size={18} color={palette.muted} />
      <Text style={[styles.summaryLabel, { color: palette.muted }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: palette.text }]}>{value}</Text>
    </View>
  );
}

interface SettingsScreenProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onBack: () => void;
  onClearPlayers: () => void;
  onClearHistory: () => void;
  historyCount: number;
}

export function SettingsScreen({
  settings,
  onChange,
  onBack,
  onClearPlayers,
  onClearHistory,
  historyCount,
}: SettingsScreenProps) {
  const palette = usePalette();
  return (
    <Page title="Do seu jeito" subtitle="Os ajustes ficam salvos neste aparelho." onBack={onBack}>
      <View>
        <Label>EXPERIÊNCIA</Label>
        <View style={styles.sectionCard}>
          <Card>
            <ToggleRow
              icon="volume-medium-outline"
              title="Sons"
              subtitle="Toques breves nas ações do jogo"
              value={settings.sound}
              onChange={(sound) => onChange({ ...settings, sound })}
            />
            <View style={[styles.divider, { backgroundColor: palette.border }]} />
            <ToggleRow
              icon="phone-portrait-outline"
              title="Vibração"
              subtitle="Feedback tátil ao tocar nos botões"
              value={settings.haptics}
              onChange={(haptics) => onChange({ ...settings, haptics })}
            />
            <View style={[styles.divider, { backgroundColor: palette.border }]} />
            <ToggleRow
              icon="leaf-outline"
              title="Reduzir animações"
              subtitle="Movimentos discretos e transições diretas"
              value={settings.reduceMotion}
              onChange={(reduceMotion) => onChange({ ...settings, reduceMotion })}
            />
          </Card>
        </View>

        <Label>APARÊNCIA</Label>
        <View
          style={styles.choices}
          accessibilityRole="radiogroup"
          accessibilityLabel="Aparência do aplicativo"
        >
          {(
            [
              { value: 'light', label: 'Claro', icon: 'sunny-outline' },
              { value: 'dark', label: 'Escuro', icon: 'moon-outline' },
              { value: 'system', label: 'Sistema', icon: 'phone-portrait-outline' },
            ] as const
          ).map((option) => (
            <Choice
              key={option.value}
              label={option.label}
              icon={option.icon}
              selected={settings.colorScheme === option.value}
              onPress={() => onChange({ ...settings, colorScheme: option.value })}
            />
          ))}
        </View>

        <View style={styles.settingsLabel}>
          <Label>QUEM COMEÇA A DISCUSSÃO</Label>
        </View>
        <View
          style={styles.choices}
          accessibilityRole="radiogroup"
          accessibilityLabel="Primeiro jogador da discussão"
        >
          <Choice
            label="Aleatório"
            icon="shuffle-outline"
            selected={settings.firstSpeaker === 'random'}
            onPress={() => onChange({ ...settings, firstSpeaker: 'random' })}
          />
          <Choice
            label="Primeiro da lista"
            icon="list-outline"
            selected={settings.firstSpeaker === 'first'}
            onPress={() => onChange({ ...settings, firstSpeaker: 'first' })}
          />
        </View>
        <Text style={[styles.bodySmall, { color: palette.muted }]}>
          A escolha é independente do papel de cada pessoa e não dá pistas sobre o impostor.
        </Text>

        <View style={styles.settingsLabel}>
          <Label>TEMPO DE DISCUSSÃO</Label>
        </View>
        <View
          style={styles.choices}
          accessibilityRole="radiogroup"
          accessibilityLabel="Duração do cronômetro"
        >
          {[0, 60, 120, 180, 300, 600].map((seconds) => (
            <Choice
              key={seconds}
              label={seconds === 0 ? 'Sem limite' : `${seconds / 60} min`}
              selected={settings.timerSeconds === seconds}
              onPress={() => onChange({ ...settings, timerSeconds: seconds })}
            />
          ))}
        </View>
        <Text style={[styles.bodySmall, { color: palette.muted }]}>
          O tempo é um guia. Quando acabar, vocês decidem se querem votar ou continuar.
        </Text>

        <View style={styles.settingsLabel}>
          <Label>DADOS LOCAIS</Label>
        </View>
        <View style={styles.sectionCard}>
          <Card>
            <View style={styles.headerLabel}>
              <Icon name="refresh-outline" size={21} color={palette.accent} />
              <Text style={[styles.dataTitle, { color: palette.text }]}>Palavras recentes</Text>
            </View>
            <Text style={[styles.dataDescription, { color: palette.muted }]}>
              {historyCount} {historyCount === 1 ? 'palavra guardada' : 'palavras guardadas'} para
              evitar repetições nas próximas rodadas.
            </Text>
            <Button
              label="Limpar histórico de palavras"
              variant="secondary"
              onPress={onClearHistory}
              disabled={historyCount === 0}
            />
            <View style={[styles.divider, { backgroundColor: palette.border }]} />
            <Text style={[styles.dataTitle, { color: palette.text }]}>Lista de jogadores</Text>
            <Text style={[styles.dataDescription, { color: palette.muted }]}>
              Apague os nomes salvos para começar com uma nova turma.
            </Text>
            <Button label="Apagar jogadores salvos" variant="ghost" onPress={onClearPlayers} />
          </Card>
        </View>
        <Text style={[styles.note, { color: palette.muted }]}>
          Sem conta. Sem envio de dados. O segredo fica entre vocês.
        </Text>
      </View>
    </Page>
  );
}

function ToggleRow({
  icon,
  title,
  subtitle,
  value,
  onChange,
}: {
  icon: string;
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const palette = usePalette();
  return (
    <View style={styles.toggleRow}>
      <Icon name={icon} size={22} color={palette.accent} />
      <View style={styles.toggleText}>
        <Text style={[styles.toggleTitle, { color: palette.text }]}>{title}</Text>
        <Text style={[styles.toggleSubtitle, { color: palette.muted }]}>{subtitle}</Text>
      </View>
      <Switch
        accessibilityLabel={title}
        accessibilityHint={subtitle}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: palette.border, true: palette.accent }}
        thumbColor={value ? palette.accentText : palette.muted}
        ios_backgroundColor={palette.border}
      />
    </View>
  );
}

function Choice({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: string;
}) {
  const palette = usePalette();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      aria-checked={selected}
      onPress={onPress}
      style={[
        styles.choice,
        {
          backgroundColor: selected ? palette.accent : palette.surface,
          borderColor: selected ? palette.accent : palette.border,
        },
      ]}
    >
      {icon ? (
        <Icon name={icon} size={18} color={selected ? palette.accentText : palette.muted} />
      ) : null}
      <Text style={[styles.choiceText, { color: selected ? palette.accentText : palette.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function HowToScreen({ onBack }: { onBack: () => void }) {
  const palette = usePalette();
  const steps = [
    {
      icon: 'people-outline',
      title: 'Reúna a turma',
      body: 'De 3 a 20 pessoas e um único celular. Cadastre os nomes, organize a ordem e escolha os temas.',
    },
    {
      icon: 'eye-off-outline',
      title: 'Descubra seu segredo',
      body: 'Receba o celular e confirme seu nome. Mantenha pressionado para ver sua informação, sem mostrar para ninguém.',
    },
    {
      icon: 'swap-horizontal-outline',
      title: 'Esconda e passe',
      body: 'Confirme que leu e entregue o aparelho à próxima pessoa. A informação fica escondida antes de mostrar o próximo nome.',
    },
    {
      icon: 'chatbubbles-outline',
      title: 'Dê uma pista',
      body: 'Cada pessoa fala algo relacionado à palavra, sem dizer a palavra em si. O impostor precisa improvisar e se misturar.',
    },
    {
      icon: 'finger-print-outline',
      title: 'Quem está improvisando?',
      body: 'Conversem, registrem um palpite se quiserem e revelem o resultado juntos. Depois, joguem outra rodada!',
    },
  ];
  return (
    <Page
      title="Um segredo. Muitas suspeitas."
      subtitle="Aprenda em um minuto e deixe a conversa fazer o resto."
      onBack={onBack}
      footer={<Button label="Entendi, vamos lá" icon="checkmark" onPress={onBack} />}
    >
      <View>
        <Card>
          <View style={styles.roleTitle}>
            <Icon name="key-outline" size={24} color={palette.accent} />
            <Text style={[styles.roleHeading, { color: palette.text }]}>
              A turma recebe a mesma palavra
            </Text>
          </View>
          <Text style={[styles.roleBody, { color: palette.muted }]}>
            Só uma pessoa fica sem saber qual é: o impostor. Ninguém conhece o papel dos outros.
          </Text>
          <View style={[styles.example, { backgroundColor: palette.surface2 }]}>
            <Text style={[styles.exampleLabel, { color: palette.muted }]}>
              EXEMPLO DE PISTA PARA “PIZZA”
            </Text>
            <Text style={[styles.exampleText, { color: palette.accent }]}>
              “Combina com sexta à noite.”
            </Text>
          </View>
        </Card>
        <View style={styles.steps}>
          {steps.map((step, index) => (
            <View key={step.title} style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: palette.surface2 }]}>
                <Icon name={step.icon} size={23} color={palette.accent} />
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: palette.text }]}>
                  {index + 1}. {step.title}
                </Text>
                <Text style={[styles.stepBody, { color: palette.muted }]}>{step.body}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={[styles.privacyNote, { backgroundColor: palette.surface2 }]}>
          <Icon name="bulb-outline" size={23} color={palette.warning} />
          <Text style={[styles.privacyText, { color: palette.muted }]}>
            Uma boa pista é reconhecível para quem sabe a palavra, mas não entrega o segredo de
            bandeja.
          </Text>
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  orderHint: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  bodySmall: { fontSize: 12, lineHeight: 19, flexShrink: 1 },
  note: { fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 19, marginBottom: 10 },
  spacer: { height: 14 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  headerLabel: { flexDirection: 'row', alignItems: 'center', gap: 9, flexShrink: 1 },
  editButton: { minHeight: 44, justifyContent: 'center', paddingLeft: 10 },
  editText: { fontSize: 13, fontWeight: '700' },
  playerChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  playerChip: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 11,
    gap: 9,
    alignItems: 'center',
    maxWidth: '100%',
  },
  chipNumber: { fontSize: 12, fontWeight: '700' },
  chipText: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  themeSummary: { fontSize: 14, lineHeight: 25 },
  summaryCount: { marginTop: 9 },
  summaryLine: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 19 },
  summaryLabel: { fontSize: 13, flex: 1 },
  summaryValue: { fontSize: 13, fontWeight: '600', maxWidth: '50%', textAlign: 'right' },
  privacyNote: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    padding: 18,
    borderRadius: 18,
    marginTop: 20,
  },
  privacyText: { fontSize: 13, lineHeight: 21, flex: 1 },
  sectionCard: { marginTop: 12, marginBottom: 27 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60 },
  toggleText: { flex: 1 },
  toggleTitle: { fontSize: 15, fontWeight: '600' },
  toggleSubtitle: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  divider: { height: 1, marginVertical: 16 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginBottom: 10 },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    minHeight: 47,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexGrow: 1,
  },
  choiceText: { fontSize: 13, fontWeight: '600' },
  settingsLabel: { marginTop: 25 },
  dataTitle: { fontSize: 16, fontWeight: '600' },
  dataDescription: { fontSize: 13, lineHeight: 21, marginTop: 9, marginBottom: 16 },
  roleTitle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roleHeading: { fontSize: 19, lineHeight: 26, fontWeight: '700', flex: 1 },
  roleBody: { fontSize: 14, lineHeight: 23, marginTop: 13 },
  example: { borderRadius: 15, padding: 16, marginTop: 18 },
  exampleLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.7, lineHeight: 16 },
  exampleText: { fontSize: 17, fontWeight: '600', lineHeight: 25, marginTop: 7 },
  steps: { gap: 25, marginTop: 28 },
  step: { flexDirection: 'row', gap: 14 },
  stepIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 17, fontWeight: '700', lineHeight: 24, marginBottom: 5 },
  stepBody: { fontSize: 13, lineHeight: 21 },
});

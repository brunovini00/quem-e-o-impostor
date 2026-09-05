import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Mascot } from '../components/Mascot';
import { Button, Card, Icon, Label, Page, usePalette } from '../ui/components';
export function HomeScreen({
  onPlay,
  onThemes,
  onSettings,
  onHelp,
  themeCount,
  wordCount,
}: {
  onPlay: () => void;
  onThemes: () => void;
  onSettings: () => void;
  onHelp: () => void;
  themeCount: number;
  wordCount: number;
}) {
  const p = usePalette();
  return (
    <Page>
      <View style={styles.top}>
        <View style={styles.brand}>
          <Icon name="eye-outline" color={p.accent} size={26} />
          <Text style={[styles.brandText, { color: p.text }]}>
            impostor<Text style={{ color: p.accent }}>.</Text>
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Configurações"
          onPress={onSettings}
          style={[styles.settings, { backgroundColor: p.surface }]}
        >
          <Icon name="options-outline" />
        </Pressable>
      </View>
      <View style={[styles.badge, { backgroundColor: p.surface }]}>
        <View style={[styles.liveDot, { backgroundColor: p.success }]} />
        <Label>UM CELULAR. MUITAS DESCONFIANÇAS.</Label>
      </View>
      <View>
        <Text accessibilityRole="header" style={[styles.title, { color: p.text }]}>
          Todo mundo sabe.{'\n'}
          <Text style={{ color: p.accent }}>Menos um.</Text>
        </Text>
        <Text style={[styles.description, { color: p.muted }]}>
          Uma palavra secreta. Um impostor entre vocês.{'\n'}Quem consegue disfarçar melhor?
        </Text>
      </View>
      <Mascot />
      <View style={styles.facts}>
        {[
          ['people-outline', '3–20 pessoas'],
          ['phone-portrait-outline', '1 celular'],
          ['wifi-outline', 'Offline'],
        ].map(([icon, text]) => (
          <View key={text} style={styles.fact}>
            <Icon name={icon ?? ''} size={16} color={p.muted} />
            <Text style={{ color: p.muted, fontSize: 12 }}>{text}</Text>
          </View>
        ))}
      </View>
      <Button label="Jogar" icon="play" onPress={onPlay} />
      <Button label="Como jogar" variant="ghost" icon="help-circle-outline" onPress={onHelp} />
      <Pressable onPress={onThemes} accessibilityRole="button" accessibilityLabel="Explorar temas">
        <Card style={{ flexDirection: 'row', alignItems: 'center', padding: 18 }}>
          <View style={[styles.themeIcon, { backgroundColor: p.surface2 }]}>
            <Icon name="grid-outline" color={p.accent} />
          </View>
          <View style={{ flex: 1, gap: 5 }}>
            <Text style={{ color: p.text, fontSize: 16, fontWeight: '700' }}>
              Qual é o tema de hoje?
            </Text>
            <Text style={{ color: p.muted, fontSize: 12 }}>
              {themeCount} temas · {wordCount.toLocaleString('pt-BR')} palavras
            </Text>
          </View>
          <Icon name="arrow-forward" color={p.muted} />
        </Card>
      </Pressable>
      <Text style={[styles.note, { color: p.muted }]}>
        Junte a turma. Passe o celular. Confie em ninguém.
      </Text>
    </Page>
  );
}
const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    marginBottom: 12,
  },
  brand: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  brandText: { fontSize: 27, fontWeight: '900', letterSpacing: -1.4 },
  settings: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 30,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  title: { fontSize: 41, lineHeight: 47, fontWeight: '900', letterSpacing: -1.8 },
  description: { marginTop: 15, lineHeight: 23, fontSize: 14 },
  facts: { flexDirection: 'row', gap: 16, justifyContent: 'center', marginBottom: 4 },
  fact: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  themeIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: { fontSize: 11, textAlign: 'center', marginBottom: 6 },
});

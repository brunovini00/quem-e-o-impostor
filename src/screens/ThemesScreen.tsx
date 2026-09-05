import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Theme } from '../domain/types';
import { normalize } from '../domain/players';
import { Button, Icon, Label, Page, usePalette } from '../ui/components';

interface ThemesScreenProps {
  themes: Theme[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  browseOnly?: boolean;
}

export function ThemesScreen({
  themes,
  selectedIds,
  onChange,
  onNext,
  onBack,
  browseOnly = false,
}: ThemesScreenProps) {
  const palette = usePalette();
  const [query, setQuery] = useState('');
  const filteredThemes = useMemo(() => {
    const term = normalize(query);
    return themes.filter((theme) => normalize(`${theme.name} ${theme.description}`).includes(term));
  }, [query, themes]);
  const selected = new Set(selectedIds);
  const selectedThemes = themes.filter((theme) => selected.has(theme.id));
  const selectedWords = selectedThemes.reduce((sum, theme) => sum + theme.words.length, 0);
  const allSelected = themes.every((theme) => selected.has(theme.id));
  const totalWords = themes.reduce((sum, theme) => sum + theme.words.length, 0);

  function toggle(id: string) {
    onChange(selected.has(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]);
  }

  return (
    <Page
      title={browseOnly ? 'Um mundo de palavras' : 'Qual é o assunto?'}
      subtitle={
        browseOnly
          ? 'Explore os temas. Todas as palavras ficam no aparelho.'
          : 'Escolha um tema ou misture vários para surpreender.'
      }
      onBack={onBack}
      footer={
        browseOnly ? undefined : (
          <View style={styles.footer}>
            <Text
              accessibilityLiveRegion="polite"
              style={[styles.selectionCount, { color: palette.muted }]}
            >
              {selectedThemes.length === 0
                ? 'Selecione pelo menos um tema'
                : `${selectedThemes.length} ${selectedThemes.length === 1 ? 'tema selecionado' : 'temas selecionados'} · ${selectedWords.toLocaleString('pt-BR')} entradas`}
            </Text>
            <Button
              label="Revisar partida"
              icon="arrow-forward"
              onPress={onNext}
              disabled={selectedThemes.length === 0}
            />
          </View>
        )
      }
    >
      <View>
        <View
          style={[styles.search, { backgroundColor: palette.surface, borderColor: palette.border }]}
        >
          <Icon name="search-outline" size={21} color={palette.muted} />
          <TextInput
            accessibilityLabel="Buscar temas"
            placeholder="Buscar um tema..."
            placeholderTextColor={palette.muted}
            selectionColor={palette.accent}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            returnKeyType="search"
            style={[styles.searchInput, { color: palette.text }]}
          />
          {query.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpar busca"
              onPress={() => setQuery('')}
              style={styles.clearSearch}
            >
              <Icon name="close-circle" size={22} color={palette.muted} />
            </Pressable>
          ) : null}
        </View>

        {!browseOnly ? (
          <Pressable
            accessibilityRole="checkbox"
            accessibilityLabel="Todos os temas"
            accessibilityState={{ checked: allSelected }}
            aria-checked={allSelected}
            onPress={() => onChange(allSelected ? [] : themes.map((theme) => theme.id))}
            style={[
              styles.allCard,
              {
                backgroundColor: allSelected ? palette.accent : palette.surface,
                borderColor: allSelected ? palette.accent : palette.border,
              },
            ]}
          >
            <View style={styles.allIcon}>
              <Icon
                name="sparkles-outline"
                size={26}
                color={allSelected ? palette.accentText : palette.accent}
              />
            </View>
            <View style={styles.allText}>
              <Text
                style={[
                  styles.allTitle,
                  { color: allSelected ? palette.accentText : palette.text },
                ]}
              >
                Todos os temas
              </Text>
              <Text
                style={[
                  styles.allDescription,
                  { color: allSelected ? palette.accentText : palette.muted },
                ]}
              >
                {themes.length} temas · {totalWords.toLocaleString('pt-BR')} entradas
              </Text>
            </View>
            <Icon
              name={allSelected ? 'checkbox' : 'square-outline'}
              size={25}
              color={allSelected ? palette.accentText : palette.muted}
            />
          </Pressable>
        ) : null}

        <View style={styles.heading}>
          <Label>
            {query
              ? `${filteredThemes.length} ${filteredThemes.length === 1 ? 'TEMA ENCONTRADO' : 'TEMAS ENCONTRADOS'}`
              : `${themes.length} TEMAS PARA EXPLORAR`}
          </Label>
          {!browseOnly && selectedIds.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpar seleção de temas"
              onPress={() => onChange([])}
              style={styles.clearSelection}
            >
              <Text style={[styles.clearText, { color: palette.accent }]}>Limpar</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.grid}>
          {filteredThemes.map((theme) => {
            const active = !browseOnly && selected.has(theme.id);
            return (
              <Pressable
                key={theme.id}
                accessibilityRole={browseOnly ? 'text' : 'checkbox'}
                accessibilityLabel={`${theme.name}, ${theme.words.length.toLocaleString('pt-BR')} entradas. ${theme.description}`}
                accessibilityState={browseOnly ? undefined : { checked: active }}
                aria-checked={browseOnly ? undefined : active}
                onPress={browseOnly ? undefined : () => toggle(theme.id)}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: palette.surface,
                    borderColor: active ? palette.accent : palette.border,
                    borderWidth: active ? 2 : 1,
                    padding: active ? 15 : 16,
                  },
                ]}
              >
                <View style={styles.themeTop}>
                  <Text accessible={false} style={styles.emoji}>
                    {theme.emoji}
                  </Text>
                  {!browseOnly ? (
                    <Icon
                      name={active ? 'checkmark-circle' : 'ellipse-outline'}
                      size={23}
                      color={active ? palette.accent : palette.border}
                    />
                  ) : null}
                </View>
                <Text style={[styles.themeName, { color: palette.text }]}>{theme.name}</Text>
                <Text style={[styles.words, { color: palette.muted }]}>
                  {theme.words.length.toLocaleString('pt-BR')} entradas
                </Text>
              </Pressable>
            );
          })}
        </View>
        {filteredThemes.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="search-outline" size={36} color={palette.muted} />
            <Text style={[styles.emptyTitle, { color: palette.text }]}>Nenhum tema por aqui</Text>
            <Text style={[styles.emptyBody, { color: palette.muted }]}>
              Tente uma palavra diferente ou limpe a busca para ver todos.
            </Text>
            <Button label="Ver todos os temas" variant="ghost" onPress={() => setQuery('')} />
          </View>
        ) : null}
        <Text style={[styles.offline, { color: palette.muted }]}>
          <Icon name="cloud-offline-outline" size={14} color={palette.muted} /> Pronto para jogar
          sem internet.
        </Text>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingLeft: 17,
    paddingRight: 6,
    minHeight: 56,
  },
  searchInput: { flex: 1, minHeight: 54, fontSize: 15, paddingVertical: 13 },
  clearSearch: { width: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  allCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    marginTop: 16,
    padding: 18,
    gap: 12,
  },
  allIcon: { width: 32, alignItems: 'center' },
  allText: { flex: 1 },
  allTitle: { fontSize: 17, fontWeight: '700' },
  allDescription: { fontSize: 12, lineHeight: 19, marginTop: 3 },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 55,
    marginTop: 13,
    gap: 8,
    flexWrap: 'wrap',
  },
  clearSelection: { minHeight: 44, justifyContent: 'center', paddingLeft: 10 },
  clearText: { fontSize: 13, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  themeCard: { width: '48%', flexGrow: 1, borderRadius: 20, minHeight: 158 },
  themeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },
  emoji: { fontSize: 31, lineHeight: 40 },
  themeName: { fontSize: 15, fontWeight: '700', lineHeight: 21, flex: 1 },
  words: { fontSize: 11, marginTop: 9, lineHeight: 16 },
  footer: { gap: 9 },
  selectionCount: { fontSize: 12, lineHeight: 18, textAlign: 'center' },
  empty: { alignItems: 'center', paddingVertical: 38, gap: 12 },
  emptyTitle: { fontSize: 19, fontWeight: '700', textAlign: 'center' },
  emptyBody: { fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: 6 },
  offline: { fontSize: 12, textAlign: 'center', lineHeight: 20, marginTop: 23 },
});

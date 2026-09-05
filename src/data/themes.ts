import type { Theme, WordEntry } from '../domain/types';
import catalog from './catalog.json';
import comidas from './words/comidas.json';
import bebidas from './words/bebidas.json';
import ingredientes from './words/ingredientes.json';
import animais from './words/animais.json';
import objetos from './words/objetos.json';
import profissoes from './words/profissoes.json';
import lugares from './words/lugares.json';
import paisesCidades from './words/paises-cidades.json';
import filmes from './words/filmes.json';
import seriesTv from './words/series-tv.json';
import desenhos from './words/desenhos.json';
import personagens from './words/personagens.json';
import personalidades from './words/personalidades.json';
import esportes from './words/esportes.json';
import jogos from './words/jogos.json';
import musica from './words/musica.json';
import tecnologia from './words/tecnologia.json';
import natureza from './words/natureza.json';
import transportes from './words/transportes.json';
import escola from './words/escola.json';
import corpoSaude from './words/corpo-saude.json';
import moda from './words/moda.json';
import casa from './words/casa.json';
import festas from './words/festas.json';
import acoes from './words/acoes.json';

// Asserção limitada à fronteira dos JSONs. O validador de conteúdo verifica
// toda entrada (inclusive dificuldade) antes do build de produção.
const banks: Record<string, WordEntry[]> = {
  comidas: comidas as WordEntry[],
  bebidas: bebidas as WordEntry[],
  ingredientes: ingredientes as WordEntry[],
  animais: animais as WordEntry[],
  objetos: objetos as WordEntry[],
  profissoes: profissoes as WordEntry[],
  lugares: lugares as WordEntry[],
  'paises-cidades': paisesCidades as WordEntry[],
  filmes: filmes as WordEntry[],
  'series-tv': seriesTv as WordEntry[],
  desenhos: desenhos as WordEntry[],
  personagens: personagens as WordEntry[],
  personalidades: personalidades as WordEntry[],
  esportes: esportes as WordEntry[],
  jogos: jogos as WordEntry[],
  musica: musica as WordEntry[],
  tecnologia: tecnologia as WordEntry[],
  natureza: natureza as WordEntry[],
  transportes: transportes as WordEntry[],
  escola: escola as WordEntry[],
  'corpo-saude': corpoSaude as WordEntry[],
  moda: moda as WordEntry[],
  casa: casa as WordEntry[],
  festas: festas as WordEntry[],
  acoes: acoes as WordEntry[],
};

export const themes: Theme[] = catalog.map(({ id, name, emoji, description }) => {
  const words = banks[id];
  if (!words) throw new Error(`Banco ausente para o tema ${id}.`);
  return { id, name, emoji, description, words };
});

# Conteúdo editorial e pendência de quantidade

Os 25 temas foram aprovados pelo usuário. O material inicial reúne **4.368 entradas** escolhidas individualmente, com **130 a 289 entradas por tema**. A meta aprovada continua sendo **1.000 entradas válidas e únicas em cada tema**, totalizando pelo menos 25.000. Faltam **20.632 entradas** para essa meta. As contagens por tema estão no [relatório automatizado](word-report.md).

**Esta etapa não atende o critério de quantidade e não pode ser declarada concluída.** O comando normal de validação e o build de produção devem falhar até a complementação dos bancos ou uma alteração expressa do requisito pelo usuário. A implementação do aplicativo e as verificações de integridade podem avançar independentemente dessa decisão.

## Origem e método

- Listas editoriais próprias, escolhidas para o jogo em português do Brasil, sem copiar bancos de terceiros, letras de músicas, sinopses ou descrições de obras.
- Nenhum scraping, consulta remota em tempo de execução ou produto cartesiano de palavras foi usado.
- Títulos de obras, nomes próprios e termos convencionais estrangeiros foram preservados quando esse é o nome pelo qual são conhecidos no Brasil.
- O script `scripts/author-word-banks.mjs` registra cada entrada individual da primeira edição. Ele apenas transforma as listas em JSON; não inventa combinações, deriva palavras ou adiciona números.
- Cada entrada contém `text` e `difficulty`. O campo opcional `subtype` está previsto no domínio e no validador. Os níveis atuais são `easy` e `medium`; a classificação é editorial e ainda precisa ser calibrada com grupos de jogadores.
- A seleção inclui tanto o núcleo quanto os subassuntos indicados no nome de cada tema: equipamentos e regras em esportes; instrumentos, artistas e gêneros em música; ambientes e utensílios em casa; rituais e itens associados em festas. Isso é documentado para permitir revisar a adequação das pistas.
- A quantidade atual é o material curado nesta implementação, e não uma afirmação de que o idioma ou os temas não comportam mais palavras.

## O que a automação comprova

`node scripts/validate-words.mjs` carrega os arquivos locais, compara o catálogo com a lista dos 25 temas aprovados e verifica:

1. Identificadores válidos, únicos e presentes; metadados e arquivos correspondentes.
2. Estrutura das entradas, texto não vazio, dificuldade e subtipo válidos.
3. Caracteres invisíveis, grafias com letras não latinas semelhantes e marcadores comuns de preenchimento.
4. Duplicatas dentro de cada tema após normalização Unicode, remoção de acentos, padronização de caixa e espaços.
5. Contagem de entradas válidas únicas e o mínimo obrigatório de 1.000 por tema.

Os relatórios `word-report.json` e `word-report.md` são regravados também quando a validação falha. O código de saída do comando normal é 1 quando a meta ou a integridade não passam. Arquivo ausente, JSON malformado, tema removido e banco extra sem aprovação também geram falha.

`node scripts/validate-words.mjs --integrity-only` verifica a estrutura durante o desenvolvimento. Ele **não altera a meta**, mantém `strictPassed: false` no relatório quando a quantidade é insuficiente e não deve substituir a validação obrigatória no build ou na integração contínua.

O script não decide se dois termos diferentes são sinônimos, se um título tem nome local mais conhecido, se uma pessoa é reconhecida em certa faixa etária nem se toda pista é divertida. Essa revisão continua editorial. Palavras podem aparecer em mais de um tema; a regra aprovada exige unicidade dentro de cada tema. Por isso, o total somado não é uma contagem global de palavras distintas.

## Opções para decisão do usuário

A aprovação de todos os temas não é uma autorização para reduzir a quantidade. Não foi aplicada nenhuma alteração silenciosa. Há três caminhos possíveis:

1. **Manter os 25 temas e a meta de 1.000:** completar lotes editoriais, revisar cada inclusão e calibrar dificuldade com partidas reais. É possível ampliar subassuntos naturais, mas o usuário deve decidir qualquer ampliação relevante de escopo.
2. **Manter os 25 temas com uma primeira edição menor:** aceitar expressamente a contagem atual ou definir uma nova meta por tema. Isso altera o critério de aceite e exige nova decisão do usuário antes de mudar o gate de produção.
3. **Reorganizar temas estreitos:** por exemplo, unir bebidas a alimentação; unir festas a cultura e lazer; ou ampliar transportes para mobilidade, lugares e viagem. Isso muda a lista aprovada e depende de autorização antes de editar o catálogo.

Os temas com menor cobertura atual são **Comidas e pratos (130)**, **Bebidas (130)** e **Objetos do cotidiano (140)**. Música (236) e Ações e verbos (289) têm maior cobertura nesta edição, mas também estão abaixo da meta. Não há evidência editorial suficiente nesta versão para prometer que acrescentar mais nomes manterá a mesma familiaridade e utilidade.

## Como acrescentar conteúdo

Edite os JSONs em `src/data/words/`, preserve os metadados e execute a validação. Antes de incluir um item, confirme que ele pertence ao tema, tem grafia reconhecível no Brasil e admite pistas úteis. Evite sinônimos adicionados só para aumentar a contagem, flexões previsíveis, numeração artificial e combinações mecânicas. Não reutilize bancos com origem ou licença desconhecida.

O script de autoria representa a fonte inicial: se ele for executado novamente, substituirá os JSONs pelos itens que contém. Para manter a reprodução após alterações editoriais, atualize também suas listas ou edite diretamente os JSONs e deixe de usar esse gerador. A licença do projeto permanece sujeita à confirmação do usuário; esta documentação não aplica uma licença por conta própria.

# Conteúdo editorial e pendência de quantidade

Os 25 temas foram aprovados pelo usuário. O material inicial reúne **4.368 entradas** escolhidas individualmente, com **130 a 289 entradas por tema**. A meta aprovada continua sendo **1.000 entradas válidas e únicas em cada tema**, totalizando pelo menos 25.000. Faltam **20.632 entradas** para essa meta. As contagens por tema estão no [relatório automatizado](word-report.md).

**A expansão do conteúdo ainda não atende o critério de quantidade e permanece pendente.** Em 5 de setembro de 2026, o usuário autorizou expressamente a publicação da primeira edição web no Netlify com as 4.368 entradas atuais. Essa edição exige integridade dos bancos; a meta de 1.000 por tema continua exigida por `words:validate`, `build`, `check` e pela preparação de builds nativos.

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

`node scripts/validate-words.mjs --integrity-only` verifica a integridade durante o desenvolvimento e na publicação da primeira edição web autorizada. Ele **não altera a meta** e mantém `strictPassed: false` no relatório quando a quantidade é insuficiente. O comando `build:web` utiliza essa verificação antes de exportar e preparar os assets. Na integração contínua, falhas de integridade bloqueiam o fluxo, enquanto a verificação da meta de 1.000 é uma etapa informativa com `continue-on-error` explícito.

O script não decide se dois termos diferentes são sinônimos, se um título tem nome local mais conhecido, se uma pessoa é reconhecida em certa faixa etária nem se toda pista é divertida. Essa revisão continua editorial. Palavras podem aparecer em mais de um tema; a regra aprovada exige unicidade dentro de cada tema. Por isso, o total somado não é uma contagem global de palavras distintas.

## Edição web autorizada e expansão

A decisão confirmada pelo usuário é publicar a primeira edição web com o banco atual e conservar os 25 temas e a meta de 1.000 entradas por tema. A autorização permite o acesso pelo navegador do celular; não declara concluída a expansão nem altera a lista aprovada.

A expansão deve ocorrer em lotes editoriais, com revisão de cada inclusão e calibração de dificuldade em partidas reais. Subassuntos naturais podem ampliar os bancos, mas reorganizar ou substituir temas exige uma nova decisão do usuário.

Os temas com menor cobertura atual são **Comidas e pratos (130)**, **Bebidas (130)** e **Objetos do cotidiano (140)**. Música (236) e Ações e verbos (289) têm maior cobertura nesta edição, mas também estão abaixo da meta. Não há evidência editorial suficiente nesta versão para prometer que acrescentar mais nomes manterá a mesma familiaridade e utilidade.

## Como acrescentar conteúdo

Edite os JSONs em `src/data/words/`, preserve os metadados e execute a validação. Antes de incluir um item, confirme que ele pertence ao tema, tem grafia reconhecível no Brasil e admite pistas úteis. Evite sinônimos adicionados só para aumentar a contagem, flexões previsíveis, numeração artificial e combinações mecânicas. Não reutilize bancos com origem ou licença desconhecida.

O script de autoria representa a fonte inicial: se ele for executado novamente, substituirá os JSONs pelos itens que contém. Para manter a reprodução após alterações editoriais, atualize também suas listas ou edite diretamente os JSONs e deixe de usar esse gerador. A licença do projeto permanece sujeita à confirmação do usuário; esta documentação não aplica uma licença por conta própria.

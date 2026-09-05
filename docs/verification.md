# Verificação executada em 5 de setembro de 2026

Ambiente: Windows, Node 22.14.0, pnpm 11.19.0, Expo 57.0.20, React Native 0.86.3, React 19.2.3 e TypeScript 6.0.3. Versões resolvidas registradas em `pnpm-lock.yaml`.

## Resultados

| Verificação                             | Resultado real                                                                          |
| --------------------------------------- | --------------------------------------------------------------------------------------- |
| `pnpm typecheck`                        | Passou, saída 0                                                                         |
| `pnpm lint`                             | Passou, saída 0                                                                         |
| `pnpm format:check`                     | Passou, saída 0                                                                         |
| `pnpm test`                             | 83 testes, 7 arquivos, saída 0                                                          |
| `pnpm test:ui`                          | 36 testes, 4 arquivos, saída 0                                                          |
| `pnpm test:e2e`                         | 6 testes, Chrome 390×844 e 320×740, incluindo toque prolongado via CDP, saída 0         |
| `pnpm words:integrity`                  | Passou, 25 temas, 4.368 entradas válidas, zero inválidas/duplicadas dentro de cada tema |
| `pnpm words:validate`                   | **Falhou**, saída 1: todos os temas abaixo de 1.000                                     |
| `pnpm build`                            | **Bloqueado na validação obrigatória do conteúdo**                                      |
| `pnpm build:web`                        | Passou: integridade dos bancos, exportação web e preparação de uma fonte de ícones      |
| Exportação `expo export --platform all` | Passou: pacotes Android/iOS Hermes e web                                                |
| Capturas de tela                        | Início, temas e resultado inspecionados visualmente                                     |
| Aparelhos Android/iOS                   | Não executado neste ambiente                                                            |
| APK/IPA assinado                        | Não gerado                                                                              |
| GitHub Actions remoto                   | Workflow versionado; resultados remotos disponíveis na aba Actions do repositório       |

O primeiro ensaio de exportação foi impedido pela permissão de execução do compilador Hermes no sandbox. A exportação foi repetida com autorização de execução e concluiu com saída 0. A autorização posterior da edição web altera apenas a exigência de quantidade para essa publicação; testes, lint, compilação e integridade dos bancos permanecem obrigatórios.

Os resultados desta tabela foram obtidos localmente. O usuário autorizou em 5 de setembro de 2026 o envio para [brunovini00/quem-e-o-impostor](https://github.com/brunovini00/quem-e-o-impostor), substituindo a aplicação anterior e preservando seu histórico. A [validação remota](https://github.com/brunovini00/quem-e-o-impostor/actions) deve ser consultada separadamente. Para a edição web autorizada, a integridade dos bancos bloqueia o CI; a meta de 1.000 por tema continua verificada em uma etapa informativa com `continue-on-error`.

No ambiente, a verificação `expo install --check` precisou do modo offline: as versões coincidem com `bundledNativeModules.json` do Expo instalado. Isso verifica compatibilidade com o SDK instalado, sem consulta a atualizações do registro. Os comandos também foram executados diretamente por `node node_modules/...` durante a instalação das dependências; as verificações finais utilizaram os scripts do projeto.

## Publicação no Netlify

Publicação de produção concluída em **5 de setembro de 2026, às 18:28 BRT**, com estado `ready`, sem erro:

- Site: [quem-e-o-impostor.netlify.app](https://quem-e-o-impostor.netlify.app/).
- Deploy: [6a9c89751b06ac000806981a](https://app.netlify.com/projects/quem-e-o-impostor/deploys/6a9c89751b06ac000806981a).
- Commit publicado: `962c0b9669169e7a0cd2b923c88e354947b48015`, branch `main`, repositório `brunovini00/quem-e-o-impostor`.

Os quatro testes Playwright passaram contra o site HTTPS publicado, em 11 segundos: partida completa, proteção da revelação, telas de 320 px, temas claro/escuro e persistência. A primeira tentativa de acesso remoto foi bloqueada pelo sandbox (`ERR_NETWORK_ACCESS_DENIED`); os testes foram executados com acesso à rede autorizado. O teste de 320 px identificou o iframe do selo “Powered by Netlify” interceptando o botão “Organizar a ordem”. O selo foi desativado pelo controle oficial do painel e a suíte inteira passou novamente, sem alterar os testes ou forçar cliques.

Um smoke independente com Pixel 7 emulado confirmou contexto HTTPS seguro, controles por toque prolongado, ocultação ao soltar e passagem à próxima pessoa, sem erros JavaScript ou requisições falhas. A fonte de ícones corrigida respondeu HTTP 200 (`font/ttf`, 389.724 bytes), com ícones visíveis e sem overflow horizontal. Nenhum APK/IPA ou teste em aparelho físico foi incluído nessa publicação web.

A configuração local `netlify.toml` usa Node 22, `pnpm run build:web` e `dist`. A exportação web isolada passou. O pós-processamento de assets remove das referências públicas os diretórios ocultos de dependências que o Netlify ignora. A fonte de ícones foi copiada sem alteração dos bytes e respondeu HTTP 200 no servidor local. Os seis testes novos desse pós-processamento passaram, assim como lint e TypeScript. Os 23 testes do validador de palavras também passaram.

Após a autorização da primeira edição web, o comando completo `pnpm build:web` passou com 4.368 entradas íntegras, exportação web e preparação de uma fonte de ícones. A suíte Vitest completa passou com 83 testes em 7 arquivos. TypeScript, lint e a formatação dos arquivos técnicos também passaram nessa revisão.

O Playwright agora aceita `E2E_BASE_URL` para executar a mesma suíte contra uma publicação HTTPS, mantendo as capturas remotas fora da documentação versionada. Uma verificação adicional com emulação Pixel 7 e eventos de toque confirmou segurar/soltar para revelar/ocultar e continuar a rodada depois de desconectar a rede da página já carregada. Isso não comprova recarregamento offline nem uso em aparelhos físicos.

O usuário confirmou expressamente publicar no Netlify com as 4.368 entradas atuais nos 25 temas. `build:web` executa `words:integrity`, a exportação web e `prepare-netlify`. A meta de 1.000 por tema permanece pendente, com déficit de 20.632, e continua bloqueando `words:validate`, `build`, `check` e a preparação de builds nativos.

## Cobertura funcional

### Gesto de revelação no navegador

O botão de segurar e os controles compartilhados agora desativam seleção, arraste de texto e menus de contexto somente nos seus elementos. A regra `-webkit-touch-callout: none` cobre o callout do Safari iOS; os textos e ícones dos botões também são não selecionáveis. Campos de nomes continuam editáveis e selecionáveis, e a página preserva seus gestos de rolagem e zoom.

O controle dá feedback imediato com “Continue segurando…” e muda para “Solte para esconder” durante a revelação. A área de toque foi ampliada e ganha um contorno ao pressionar. O limiar de 450 ms, a ocultação ao soltar/cancelar e a alternativa com confirmação foram preservados.

Validação local da correção: TypeScript, ESLint, Prettier, build web, 36 testes de componentes/hooks e 6 testes de ponta a ponta passaram. Os dois novos testes cobrem ausência de seleção, prevenção dos menus/arraste, confirmação por Enter/Espaço, toque prolongado real via CDP, soltura e cancelamento antes/depois da revelação. Um smoke adicional no WebKit 26.5 com viewport de iPhone 13 passou; esse port no Windows não implementa `-webkit-touch-callout`, portanto não substitui a verificação do menu nativo em um iPhone físico.

### Regras e fluxo da partida

- Sorteio seguro por rejeição, distribuição grosseira, Fisher–Yates, palavra comum a não impostores e exatamente um impostor.
- Jogadores mínimos/máximos, limites de nome, duplicatas normalizadas, edição, remoção e reordenação.
- Histórico, escolha de palavras disponíveis e liberação da menos recente quando necessário.
- Máquina de estados, impedimento de transições inválidas e ações atrasadas/repetidas.
- Segredo ausente da árvore de interface em entrega, pronto, ocultação e cobertura; conteúdo individual exibido somente durante revelação.
- Revelação por pressionar/soltar e alternativa com confirmação, palpite e resultado.
- Blur/segundo plano, APIs de proteção Android/iOS mockadas, falha da proteção, evento de foco tardio e cronômetro.
- Persistência versionada, corrupção, falha de leitura sem sobrescrita, fila de gravação e recuperação de falhas.
- Integridade e limites do script de palavras, incluindo CLI real com arquivos temporários.
- Ponta a ponta em navegador: configuração, arrastar, seleção múltipla, rodada completa, resultado, nova rodada, abandono e reload.
- Temas claro/escuro e ausência de overflow horizontal em viewport de 320 px.

## Pendências para os critérios completos do briefing

1. **Conteúdo:** 4.368 entradas curadas; exigência de 25.000, com déficit de 20.632. Os temas têm entre 130 e 289 entradas. Consulte [word-report.md](word-report.md) para a contagem por tema. A qualidade semântica exige revisão editorial além da contagem automatizada.
2. **Validação nativa:** executar [device-qa.md](device-qa.md) em Android e iOS. Exportação Hermes e mocks não comprovam o comportamento real de capturas, seletor de aplicativos, áudio, gestos e leitores de tela.
3. **Distribuição:** gerar um aplicativo instalável assinado depois de resolver o controle de conteúdo e configurar as contas/assinaturas de distribuição.

O aplicativo está implementado e testado no escopo acima, mas não é declarado integralmente concluído em relação ao briefing enquanto essas pendências permanecerem.

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
| `pnpm test:e2e`                         | 4 testes, Chrome 390×844 e 320×740, saída 0                                             |
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

## Preparação do Netlify

O painel autenticado confirmou o repositório `brunovini00/quem-e-o-impostor`, a branch de produção `main` e os dois deploys interrompidos pela validação do conteúdo. Ainda não há uma publicação bem-sucedida.

A configuração local `netlify.toml` usa Node 22, `pnpm run build:web` e `dist`. A exportação web isolada passou. O pós-processamento de assets remove das referências públicas os diretórios ocultos de dependências que o Netlify ignora. A fonte de ícones foi copiada sem alteração dos bytes e respondeu HTTP 200 no servidor local. Os seis testes novos desse pós-processamento passaram, assim como lint e TypeScript. Os 23 testes do validador de palavras também passaram.

Após a autorização da primeira edição web, o comando completo `pnpm build:web` passou com 4.368 entradas íntegras, exportação web e preparação de uma fonte de ícones. A suíte Vitest completa passou com 83 testes em 7 arquivos. TypeScript, lint e a formatação dos arquivos técnicos também passaram nessa revisão.

O Playwright agora aceita `E2E_BASE_URL` para executar a mesma suíte contra uma publicação HTTPS, mantendo as capturas remotas fora da documentação versionada. Uma verificação adicional com emulação Pixel 7 e eventos de toque confirmou segurar/soltar para revelar/ocultar e continuar a rodada depois de desconectar a rede da página já carregada. Isso não comprova recarregamento offline nem uso em aparelhos físicos.

O usuário confirmou expressamente publicar no Netlify com as 4.368 entradas atuais nos 25 temas. `build:web` passa a executar `words:integrity`, a exportação web e `prepare-netlify`. A meta de 1.000 por tema permanece pendente, com déficit de 20.632, e continua bloqueando `words:validate`, `build`, `check` e a preparação de builds nativos. A autorização da edição web não equivale a comprovação de deploy: a URL HTTPS e os resultados da verificação remota ainda precisam ser registrados após a publicação.

## Cobertura funcional

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

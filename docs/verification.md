# Verificação executada em 5 de setembro de 2026

Ambiente: Windows, Node 22.14.0, pnpm 11.19.0, Expo 57.0.20, React Native 0.86.3, React 19.2.3 e TypeScript 6.0.3. Versões resolvidas registradas em `pnpm-lock.yaml`.

## Resultados

| Verificação                             | Resultado real                                                                          |
| --------------------------------------- | --------------------------------------------------------------------------------------- |
| `pnpm typecheck`                        | Passou, saída 0                                                                         |
| `pnpm lint`                             | Passou, saída 0                                                                         |
| `pnpm format:check`                     | Passou, saída 0                                                                         |
| `pnpm test`                             | 77 testes, 6 arquivos, saída 0                                                          |
| `pnpm test:ui`                          | 36 testes, 4 arquivos, saída 0                                                          |
| `pnpm test:e2e`                         | 4 testes, Chrome 390×844 e 320×740, saída 0                                             |
| `pnpm words:integrity`                  | Passou, 25 temas, 4.368 entradas válidas, zero inválidas/duplicadas dentro de cada tema |
| `pnpm words:validate`                   | **Falhou**, saída 1: todos os temas abaixo de 1.000                                     |
| `pnpm build`                            | **Bloqueado na validação obrigatória do conteúdo**                                      |
| Exportação `expo export --platform all` | Passou: pacotes Android/iOS Hermes e web                                                |
| Capturas de tela                        | Início, temas e resultado inspecionados visualmente                                     |
| Aparelhos Android/iOS                   | Não executado neste ambiente                                                            |
| APK/IPA assinado                        | Não gerado                                                                              |
| GitHub Actions remoto                   | Workflow versionado; resultados remotos disponíveis na aba Actions do repositório       |

O primeiro ensaio de exportação foi impedido pela permissão de execução do compilador Hermes no sandbox. A exportação foi repetida com autorização de execução e concluiu com saída 0. Nenhuma proteção de teste, lint, compilação ou conteúdo foi removida para contornar falhas.

Os resultados desta tabela foram obtidos localmente. O usuário autorizou em 5 de setembro de 2026 o envio para [brunovini00/quem-e-o-impostor](https://github.com/brunovini00/quem-e-o-impostor), substituindo a aplicação anterior e preservando seu histórico. A [validação remota](https://github.com/brunovini00/quem-e-o-impostor/actions) deve ser consultada separadamente; o controle de conteúdo continua exigindo 1.000 entradas por tema.

No ambiente, a verificação `expo install --check` precisou do modo offline: as versões coincidem com `bundledNativeModules.json` do Expo instalado. Isso verifica compatibilidade com o SDK instalado, sem consulta a atualizações do registro. Os comandos também foram executados diretamente por `node node_modules/...` durante a instalação das dependências; as verificações finais utilizaram os scripts do projeto.

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

# Implementação do Impostor

- [x] Ler o briefing e inspecionar o destino.
- [x] Aprovação dos 25 temas pelo usuário.
- [x] Arquitetura: Expo, React Native, TypeScript estrito, dados offline.
- [x] Motor de sorteio e máquina de estados com testes.
- [x] Cadastro, ordenação, temas, configurações e persistência.
- [x] Fluxo privado de revelação, discussão, votação e resultado.
- [x] Bancos editoriais e relatório de contagem real.
- [ ] Cada um dos 25 temas com 1.000 entradas naturais e únicas.
- [x] Verificações de tipos, lint, formatação, testes e exportação.
- [x] Verificação visual e fluxo completo no navegador.
- [x] Documentação de uso, CI e limitações.
- [ ] Aprovação de privacidade e execução offline em aparelhos Android/iOS.

## Verificações executadas

- TypeScript, ESLint e Prettier: passaram.
- Vitest: 77 testes passaram.
- Jest/React Native Testing Library: 36 testes passaram.
- Playwright/Chrome: 4 testes de ponta a ponta passaram.
- Exportação de produção Metro/Hermes: Android, iOS e web passaram.
- Integridade dos bancos: 25 temas, 4.368 entradas, zero inválidas/duplicadas dentro de cada tema.
- Validação obrigatória: reprovada; faltam 20.632 entradas para 1.000 por tema. Nenhuma redução da meta foi autorizada.

Resultados detalhados em `docs/verification.md`. O projeto não atende a todos os critérios de aceite enquanto as pendências acima existirem.

## Decisões

- Uma rodada existe somente em memória: encerrar o processo descarta os segredos.
- Primeiro a falar: primeiro da lista ou sorteado. A opção de anunciar o jogador após o impostor revelaria sua identidade pela ordem conhecida.
- Nenhuma licença aplicada: sugestão MIT depende da confirmação do proprietário.
- Em 5 de setembro de 2026, o usuário autorizou substituir o conteúdo de `brunovini00/quem-e-o-impostor` por este aplicativo, preservando o histórico. A autorização de envio não reduz a meta de palavras nem inclui publicação em lojas.
- Não restaurar arquivos de configuração anteriores de outros assistentes; o diretório foi encontrado sem arquivos de trabalho, com exclusões registradas no Git.

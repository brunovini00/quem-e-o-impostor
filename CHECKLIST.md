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
- [x] Configuração web para Netlify e correção dos caminhos públicos dos ícones.
- [x] Autorização expressa para publicar a primeira edição web com 4.368 entradas.
- [x] Publicação web bem-sucedida e seis testes de ponta a ponta pela URL HTTPS.
- [ ] Aprovação de privacidade e execução offline em aparelhos Android/iOS.

## Verificações executadas

- TypeScript, ESLint e Prettier: passaram.
- Vitest: 83 testes em 7 arquivos passaram.
- Jest/React Native Testing Library: 36 testes passaram.
- Playwright/Chrome: 6 testes de ponta a ponta passaram, incluindo seleção e cancelamento do gesto de revelar.
- Exportação de produção Metro/Hermes: Android, iOS e web passaram.
- `pnpm build:web`: passou com validação de integridade, exportação web e preparação de uma fonte de ícones para o Netlify.
- Integridade dos bancos: 25 temas, 4.368 entradas, zero inválidas/duplicadas dentro de cada tema.
- Validação da meta completa: reprovada; faltam 20.632 entradas para 1.000 por tema. A primeira edição web foi autorizada com o banco atual, mantendo a expansão como pendência.

Resultados detalhados em `docs/verification.md`. O projeto não atende a todos os critérios de aceite enquanto as pendências acima existirem.

## Decisões

- Uma rodada existe somente em memória: encerrar o processo descarta os segredos.
- Primeiro a falar: primeiro da lista ou sorteado. A opção de anunciar o jogador após o impostor revelaria sua identidade pela ordem conhecida.
- Nenhuma licença aplicada: sugestão MIT depende da confirmação do proprietário.
- Em 5 de setembro de 2026, o usuário autorizou substituir o conteúdo de `brunovini00/quem-e-o-impostor` por este aplicativo, preservando o histórico. A autorização de envio não reduz a meta de palavras nem inclui publicação em lojas.
- Em 5 de setembro de 2026, o usuário confirmou expressamente publicar no Netlify com as 4.368 entradas atuais. `build:web` exige integridade, exporta a versão web e prepara os assets públicos. A meta de 1.000 por tema continua exigida por `words:validate`, `build`, `check` e builds nativos; no CI, a integridade bloqueia e a meta de quantidade é informativa com `continue-on-error`.
- Não restaurar arquivos de configuração anteriores de outros assistentes; o diretório foi encontrado sem arquivos de trabalho, com exclusões registradas no Git.

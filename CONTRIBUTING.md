# Contribuindo

1. Instale Node 22.13+ e pnpm 11.19.0 e execute `pnpm install --frozen-lockfile`.
2. Faça mudanças pequenas, com intenção clara e sem misturar alterações de terceiros.
3. Mantenha regras puras em `src/domain`. A interface não deve sortear ou calcular papéis por conta própria.
4. Execute `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:ui` e `pnpm words:validate`.
5. Para UI/privacidade, execute `pnpm export:check`, `pnpm test:e2e` e os passos pertinentes de `docs/device-qa.md`.
6. Formate com `pnpm format`, revise o diff e registre o resultado dos testes no pull request.

## Conteúdo

Cada tema tem um JSON em `src/data/words`. O catálogo é `src/data/catalog.json`, importado explicitamente por `src/data/themes.ts`. Use entradas naturais em português brasileiro. Letras maiúsculas, acentos e espaços não tornam uma entrada diferente. Nomes compostos contam como uma entrada.

O validador não é uma revisão editorial automática: verifique se o termo pertence ao tema, se é adequado ao jogo social e se a dificuldade faz sentido. Não infle contagens com combinações de adjetivos, números ou sinônimos triviais. A meta contratual é 1.000 entradas válidas por tema; o relatório deve mostrar qualquer déficit.

## Privacidade

Nunca registre palavra, papel ou objeto Round em console, telemetria, mensagens de erro, navegação ou armazenamento. Testes podem usar rodadas sintéticas. Screenshots de documentação devem usar nomes fictícios e apenas telas públicas/resultado. Não exponha segredos reais em issues.

Preserve o estado neutro entre jogadores, os tokens de identidade de ações e o bloqueio de revelação sem proteção nativa. Mudanças nessa área exigem testes que falhem quando o segredo é montado fora da etapa correta.

## Pull requests

Descreva o problema, o comportamento final e como validou. Informe explicitamente verificações que não foram executadas. Não adicione credenciais, certificados, dados privados nem dependências sem necessidade.

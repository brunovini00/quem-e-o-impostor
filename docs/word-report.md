# Relatório dos bancos de palavras

Validação executada no modo: **required-minimum**.

Meta aprovada: **1000 entradas válidas e únicas em cada um dos 25 temas**.

Total atual: **4368 entradas válidas, somadas entre os 25 temas**. A unicidade é verificada dentro de cada tema. Déficit: **20632 entradas**.

Integridade: **APROVADA**. Critério obrigatório completo: **REPROVADO**.

| Tema | Entradas | Válidas únicas | Faltam | Inválidas | Duplicatas | Fáceis | Médias | Difíceis |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Comidas e pratos | 130 | 130 | 870 | 0 | 0 | 70 | 60 | 0 |
| Bebidas | 130 | 130 | 870 | 0 | 0 | 70 | 60 | 0 |
| Frutas, verduras e ingredientes | 160 | 160 | 840 | 0 | 0 | 80 | 80 | 0 |
| Animais | 170 | 170 | 830 | 0 | 0 | 70 | 100 | 0 |
| Objetos do cotidiano | 140 | 140 | 860 | 0 | 0 | 70 | 70 | 0 |
| Profissões | 150 | 150 | 850 | 0 | 0 | 70 | 80 | 0 |
| Lugares e pontos turísticos | 150 | 150 | 850 | 0 | 0 | 70 | 80 | 0 |
| Países, cidades e culturas | 175 | 175 | 825 | 0 | 0 | 75 | 100 | 0 |
| Filmes | 150 | 150 | 850 | 0 | 0 | 70 | 80 | 0 |
| Séries e programas de TV | 150 | 150 | 850 | 0 | 0 | 70 | 80 | 0 |
| Desenhos e animações | 150 | 150 | 850 | 0 | 0 | 70 | 80 | 0 |
| Personagens fictícios | 176 | 176 | 824 | 0 | 0 | 75 | 101 | 0 |
| Celebridades e personalidades conhecidas | 170 | 170 | 830 | 0 | 0 | 70 | 100 | 0 |
| Esportes | 160 | 160 | 840 | 0 | 0 | 70 | 90 | 0 |
| Jogos e videogames | 190 | 190 | 810 | 0 | 0 | 70 | 120 | 0 |
| Música, artistas e instrumentos | 236 | 236 | 764 | 0 | 0 | 70 | 166 | 0 |
| Tecnologia e internet | 170 | 170 | 830 | 0 | 0 | 70 | 100 | 0 |
| Natureza e meio ambiente | 190 | 190 | 810 | 0 | 0 | 80 | 110 | 0 |
| Transportes e veículos | 170 | 170 | 830 | 0 | 0 | 70 | 100 | 0 |
| Escola, faculdade e conhecimentos gerais | 190 | 190 | 810 | 0 | 0 | 70 | 120 | 0 |
| Corpo humano, saúde e bem-estar | 200 | 200 | 800 | 0 | 0 | 70 | 130 | 0 |
| Moda, roupas e acessórios | 191 | 191 | 809 | 0 | 0 | 70 | 121 | 0 |
| Casa, móveis e decoração | 191 | 191 | 809 | 0 | 0 | 70 | 121 | 0 |
| Festas, feriados e celebrações | 190 | 190 | 810 | 0 | 0 | 70 | 120 | 0 |
| Ações e verbos | 289 | 289 | 711 | 0 | 0 | 80 | 209 | 0 |

## Limites da verificação

- Unicidade verificada dentro de cada tema; uma palavra pode aparecer em temas diferentes.
- A verificação automática não comprova pertinência temática, familiaridade cultural, equivalência semântica ou ausência de variantes artificiais.
- A classificação de dificuldade é editorial e ainda precisa de avaliação com grupos de jogadores.
- O modo integrity-only não atende nem altera a exigência de 1.000 entradas por tema.

A origem, o método editorial e as opções de ampliação estão em [content-notes.md](content-notes.md). O relatório estruturado completo está em [word-report.json](word-report.json).

## Erros encontrados

Nenhum erro global de estrutura.

O build de produção deve continuar bloqueado enquanto algum tema estiver abaixo da meta ou houver erro de integridade. Não há autorização registrada para reduzir o mínimo.

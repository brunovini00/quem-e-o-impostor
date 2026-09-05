# Roteiro de validação em aparelhos

Status: este ambiente Windows verificou compilação Metro/Hermes para Android/iOS e testes automatizados; não há confirmação de execução em aparelhos Android/iOS. Marque cada passo somente após executá-lo no aparelho indicado, registrando modelo e versão do sistema.

| Cenário                                                                 | Android  | iOS      |
| ----------------------------------------------------------------------- | -------- | -------- |
| Instalar um build nativo e abrir em modo avião                          | Pendente | Pendente |
| Rodada completa com 3 jogadores                                         | Pendente | Pendente |
| 20 jogadores, nome de 24 caracteres, teclado e tela pequena             | Pendente | Pendente |
| Arrastar nomes, usar setas e leitor de tela                             | Pendente | Pendente |
| Segurar para revelar, soltar fora do botão e gesto cancelado            | Pendente | Pendente |
| Tocar rapidamente em confirmar/próximo; nenhuma pessoa pulada           | Pendente | Pendente |
| Pressionar voltar durante revelação: segredo oculto e confirmação       | Pendente | Pendente |
| Abrir seletor de aplicativos durante palavra/impostor                   | Pendente | Pendente |
| Abrir notificações/central de controle durante revelação                | Pendente | Pendente |
| Bloquear tela, receber interrupção, retornar e revelar intencionalmente | Pendente | Pendente |
| Captura e gravação de tela bloqueadas enquanto a sessão existe          | Pendente | Pendente |
| Fechar processo na revelação e reabrir sem recuperar segredo            | Pendente | Pendente |
| Timer continua com tempo real no segundo plano e para no resultado      | Pendente | Pendente |
| Som/vibração opcionais e idênticos para os dois papéis                  | Pendente | Pendente |
| Modo claro/escuro, aumento de texto e reduzir movimentos                | Pendente | Pendente |
| Lista, preferências e histórico após reabrir                            | Pendente | Pendente |

## Limites práticos

Proteções de captura dependem do sistema operacional e do módulo nativo; não impedem alguém de fotografar fisicamente a tela. A prévia web cobre conteúdo em perda de foco, mas navegadores não oferecem o mesmo bloqueio nativo de capturas. A aprovação de privacidade em dispositivo depende deste roteiro, não apenas de mocks em testes.

Nenhum segredo deve aparecer na entrega do aparelho, na tela neutra, em mensagens de erro ou após retorno do segundo plano. Ao testar, confira também a árvore de acessibilidade: texto invisível visualmente não pode permanecer disponível ao leitor de tela.

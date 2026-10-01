# Nara: O Despertar da Floresta

Uma aventura de plataforma 2D em cinco capítulos. Nara, uma raposa guardiã,
recupera as estrelas para despertar a Árvore-Mãe e reencontrar a memória de sua mãe.
Combate de purificação, vida limitada por encontro e nenhuma perda de fragmentos ao cair.

## Jogar

Abra `index.html` em um navegador moderno, ou sirva esta pasta por HTTP.
O jogo usa Canvas 2D e áudio sintetizado, sem downloads de imagens, fontes ou sons.
O progresso e as configurações ficam neste navegador; não há conta ou sincronização.
Bloquear o armazenamento não impede jogar, mas impede recuperar a jornada após fechar a aba.

## Capítulos e progressão

| Capítulo | Aprendizado | Desafio |
| --- | --- | --- |
| O bosque esquecido | Movimento, ataque e santuários | 1 patrulheiro lento, galhos baixos |
| Jardim dos cogumelos | Impulso e criaturas que saltam | 3 inimigos, cogumelos e uma fenda de 130 px |
| Travessia do riacho | Combate aéreo e reflexão | 4 inimigos; margens separadas por até 160 px |
| Ruínas em flor | Combinar saltos, ataques e descidas | 5 inimigos mais resistentes e galhos de 135 px |
| Coração da floresta | Reunir as habilidades e lutar contra o guardião | 6 inimigos, fendas de 170 px, galhos de 130 px e chefe com duas fases |

Cada capítulo contém quatro fragmentos obrigatórios. Reunir os quatro acende o arco
de saída e libera o próximo capítulo. As três memórias violetas, nos capítulos II,
III e IV, são opcionais. O final acontece na árvore, após a travessia do capítulo V e a purificação do Guardião do Eclipse.
Capítulos liberados podem ser revisitados pelo menu; seus fragmentos ficam registrados.

A narrativa e as instruções aparecem nos cartões de capítulo e nos menus.
Durante a partida, há apenas contadores, símbolos e uma barra: sem diálogos ou avisos
sobrepostos ao cenário. Uma seta discreta aponta para o fragmento ausente mais próximo
ou para o arco. Quatro pontos no arco representam os fragmentos daquele capítulo.

## Controles

- A/D ou ←/→: mover.
- Espaço, W ou ↑: pular. Segure para um salto maior.
- S/↓ + pulo: descer de galhos. As margens sólidas não permitem descida.
- F ou J: ataque de luz. O ataque também devolve projéteis para os inimigos.
- Esc ou Ⅱ: pausar/continuar. Trocar de aba também pausa a partida.
- Celular: ◀ ▶, ✧ para atacar e ▲, com suporte a toques simultâneos. Deslize para baixo em ▲ para descer.

Há tolerância de salto após sair da borda e uma pequena janela para registrar o
pulo antes de aterrissar. Cogumelos lançam Nara automaticamente. Quedas retornam ao
último santuário e preservam as estrelas. Nara tem três corações; ao receber dano,
fica protegida por 1,2 s. Um novo santuário restaura a vida. Sem corações, Nara
retorna ao santuário com vida cheia e proteção temporária.

Configurações: reduzir movimento, desligar tremor, alto contraste e volumes separados.
As opções são salvas; reduzir movimento também desliga tremores e animações decorativas.
Menus têm navegação por teclado e foco contido. Reiniciar a jornada exige confirmação
e preserva as configurações.

## Criaturas e combate

Os patrulheiros cruzam trechos seguros; os saltadores se agacham antes de atacar;
as mariposas oscilam pelo ar; as sentinelas sinalizam disparos com um anel âmbar.
Saltar sobre criaturas pequenas ou acertá-las com a luz as purifica. Sentinelas e
chefe resistem a pisões. Um golpe causa um ponto de dano; projéteis refletidos causam dois.
Ataques têm intervalo de 0,38 s e atingem cada inimigo uma única vez por golpe.

O Guardião do Eclipse tem 12 pontos de vida, patrulha a área da árvore e lança duas
esferas por rajada. Com metade da vida, acelera e dispara três esferas por rajada.
O anel âmbar também indica a armadura do chefe: nessa janela, golpes diretos são
bloqueados, mas projéteis refletidos continuam causando dano. A derrota de Nara restaura a vida do chefe; coletar as estrelas não permite ignorá-lo.
Os ataques de inimigos e projéteis param nos menus e durante a pausa.

Nara tem uma silhueta quadrúpede com focinho, orelhas, cauda articulada e capa.
As quatro patas têm fases próprias de passada; corrida, subida, queda, aterrissagem,
ataque e dano usam poses diferentes. Reduzir movimento suprime oscilações decorativas,
mas mantém os sinais visuais que permitem ler os ataques.

## Estrutura

- `js/engine`: estados, loop, câmera, entrada, colisões e combate.
- `js/entities/Enemy.js`: patrulheiros, saltadores, mariposas, sentinelas e chefe.
- `js/world/LevelData.js`: capítulos, geometria, estrelas, santuários e saídas.
- `js/world/WorldRenderer.js`: arte vetorial, paralaxe, flora, rio, cogumelos e árvore.
- `js/entities/Lumi.js`: Nara, movimento, salto, capa, cauda e animação.
- `js/ui/JourneyMenu.js`: menu, capítulos, história e pausa.
- `js/ui/EndingScreen.js`: despertar da árvore e conclusão.
- `js/audio/SoundManager.js`: música e efeitos via Web Audio.

O nome interno `LumiGame` foi preservado para manter compatibilidade entre os módulos.
A renderização das entidades recebe a câmera uma única vez. A simulação usa passos
de até 1/120 s; a câmera interpola conforme o tempo, evitando dependência da taxa de quadros.

## Verificação

Com Node.js, execute `npm test` (sem instalar dependências). Os testes verificam coleta
imediata, contato com chão, altura variável, tolerância e buffer de salto, descida,
impulso de cogumelo e alcançabilidade de todas as estrelas e saídas usando a física real.

Com Playwright disponível e o jogo servido localmente:

```sh
node tests/browser-flow.cjs http://127.0.0.1:8123
node tests/browser-combat.cjs http://127.0.0.1:8123
```

`NARA_BROWSER` permite indicar um executável Chromium/Edge e `NARA_SCREENSHOTS` uma pasta
para capturas. O teste cobre menus, teclado, pausa, configurações, santuários, transições
dos cinco capítulos, salvamento/reabertura, final, revisita, reinício e tela móvel.
As transições usam posições controladas; a alcançabilidade é verificada separadamente
por trajetórias de salto reais. O teste de combate também luta contra o chefe com vida normal, verifica a segunda
fase, bloqueio da saída, pausa e ataque por toque. Isso não substitui avaliação humana de dificuldade.

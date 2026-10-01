# Nara: O Despertar da Floresta

Uma aventura de plataforma 2D em cinco capítulos. Nara, uma raposa guardiã,
recupera as estrelas para despertar a Árvore-Mãe e reencontrar a memória de sua mãe.
Sem combate, vidas limitadas ou perda de fragmentos ao cair.

## Jogar

Abra `index.html` em um navegador moderno, ou sirva esta pasta por HTTP.
O jogo usa Canvas 2D e áudio sintetizado, sem downloads de imagens, fontes ou sons.
O progresso e as configurações ficam neste navegador; não há conta ou sincronização.
Bloquear o armazenamento não impede jogar, mas impede recuperar a jornada após fechar a aba.

## Capítulos e progressão

| Capítulo | Aprendizado | Desafio |
| --- | --- | --- |
| O bosque esquecido | Movimento, salto e santuários | Chão contínuo e galhos baixos |
| Jardim dos cogumelos | Impulso e altura | Cogumelos elásticos e galhos elevados |
| Travessia do riacho | Saltar com impulso | Margens separadas por até 120 px |
| Ruínas em flor | Combinar saltos e descidas | Escadarias de galhos e uma fenda |
| Coração da floresta | Reunir as habilidades | Três fendas, galhos e a Árvore-Mãe |

Cada capítulo contém quatro fragmentos obrigatórios. Reunir os quatro acende o arco
de saída e libera o próximo capítulo. As três memórias violetas, nos capítulos II,
III e IV, são opcionais. O final acontece na árvore, após a travessia do capítulo V.
Capítulos liberados podem ser revisitados pelo menu; seus fragmentos ficam registrados.

A narrativa e as instruções aparecem nos cartões de capítulo e nos menus.
Durante a partida, há apenas contadores, símbolos e uma barra: sem diálogos ou avisos
sobrepostos ao cenário. Uma seta discreta aponta para o fragmento ausente mais próximo
ou para o arco. Quatro pontos no arco representam os fragmentos daquele capítulo.

## Controles

- A/D ou ←/→: mover.
- Espaço, W ou ↑: pular. Segure para um salto maior.
- S/↓ + pulo: descer de galhos. As margens sólidas não permitem descida.
- Esc ou Ⅱ: pausar/continuar. Trocar de aba também pausa a partida.
- Celular: ◀ ▶ e ▲, com suporte a toques simultâneos. Deslize para baixo em ▲ para descer.

Há tolerância de salto após sair da borda e uma pequena janela para registrar o
pulo antes de aterrissar. Cogumelos lançam Nara automaticamente. Quedas retornam ao
último santuário e preservam as estrelas.

Configurações: reduzir movimento, desligar tremor, alto contraste e volumes separados.
As opções são salvas; reduzir movimento também desliga tremores e animações decorativas.
Menus têm navegação por teclado e foco contido. Reiniciar a jornada exige confirmação
e preserva as configurações.

## Estrutura

- `js/engine`: estados, loop, câmera, entrada e colisões.
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
```

`NARA_BROWSER` permite indicar um executável Chromium/Edge e `NARA_SCREENSHOTS` uma pasta
para capturas. O teste cobre menus, teclado, pausa, configurações, santuários, transições
dos cinco capítulos, salvamento/reabertura, final, revisita, reinício e tela móvel.
As transições usam posições controladas; a alcançabilidade é verificada separadamente
por trajetórias de salto reais. Isso não substitui avaliação humana de dificuldade.

window.LumiGame = window.LumiGame || {};
// Wider gaps, narrower routes and stronger enemy combinations increase challenge.
class LevelData {
  static chapters = [
    {name:'O bosque esquecido', subtitle:'I · A última guardiã', color:'#80d7c0', sky:'#101e32', story:'Quando o céu se apagou, a Árvore-Mãe adormeceu. Nara, a última raposa guardiã, ainda carrega uma centelha no pingente de sua mãe. A noite corrompeu as criaturas: a luz de Nara pode libertá-las. Quatro fragmentos abrirão o caminho para as raízes.', lesson:'Ataque com F ou J; no celular, toque em ✧. Você tem três corações. Pule sobre as criaturas pequenas ou use a luz para purificá-las. Mova com A/D ou ←/→. Pule com Espaço, W ou ↑. Reúna as quatro estrelas e atravesse o arco aceso. Os santuários guardam seu caminho.', end:'As raízes voltam a respirar. Entre os cogumelos, Nara ouve a canção que sua mãe cantava para a floresta.'},
    {name:'Jardim dos cogumelos', subtitle:'II · A canção das raízes', color:'#bb9bea', sky:'#211b38', story:'Os cogumelos guardaram a canção durante a longa noite. Seus chapéus elásticos apontam para os galhos onde repousam as próximas estrelas.', lesson:'Os cogumelos impulsionam seus saltos. As criaturas espinhosas se agacham antes de saltar: observe e ataque com F/J. Segure o pulo para ir mais alto. As estrelas violetas são lembranças opcionais.', end:'A canção alcança o rio. A água desperta, mas a ponte antiga cedeu ao silêncio.'},
    {name:'Travessia do riacho', subtitle:'III · O caminho partido', color:'#79dce9', sky:'#102838', story:'Nara precisa levar a canção à outra margem. Pedras e troncos resistiram à noite; a correnteza devolve quem cai ao último santuário.', lesson:'As mariposas patrulham o ar e as sentinelas carregam disparos. Use seu ataque para devolver os projéteis. Salte entre as margens com impulso. Uma queda preserva suas estrelas. Esc ou Ⅱ pausa a jornada.', end:'Na outra margem, flores se abrem pela primeira vez em anos. Elas revelam uma escadaria esquecida.'},
    {name:'Ruínas em flor', subtitle:'IV · A memória das guardiãs', color:'#f1b6c2', sky:'#292039', story:'As guardiãs antigas deixaram uma promessa nas ruínas: a luz nunca pertence a uma só criatura. Nara sobe entre flores e pedras para reunir essa memória.', lesson:'Inimigos mais resistentes protegem as rotas estreitas. Combine ataques, saltos e reflexão de projéteis. Para descer de um galho, use S/↓ + pulo. Os pontos luminosos no arco mostram os fragmentos que faltam.', end:'O pingente brilha branco. A promessa está inteira. Falta devolver sua luz ao coração da floresta.'},
    {name:'Coração da floresta', subtitle:'V · O despertar', color:'#f5d886', sky:'#253047', story:'A Árvore-Mãe espera além das últimas fendas. Com as raízes, a canção, o rio e a memória reunidos, Nara já não caminha sozinha.', lesson:'O Guardião do Eclipse bloqueia a árvore. Purifique-o com ataques e projéteis refletidos. Durante o anel âmbar, sua armadura bloqueia golpes: devolva os projéteis. Com metade da vida, ele disparará mais rápido. Recupere também as quatro estrelas. A floresta lembra de você.', end:'A floresta lembra de sua luz.'}
  ];
  constructor(index=0) {
    this.index=index; this.chapter=LevelData.chapters[index]; this.worldWidth=2200; this.spawn={x:90,y:456}; this.platforms=[];
    const ground=(x,w)=>this.platforms.push({x,y:500,width:w,height:150,isOneWay:false});
    const branch=(x,y,w)=>this.platforms.push({x,y,width:w,height:18,isOneWay:true});
    if(index===0)ground(0,2200);
    else if(index===1){ground(0,940);ground(1070,1130);}
    else if(index===2){ground(0,550);ground(690,310);ground(1150,330);ground(1640,560);}
    else if(index===3){ground(0,970);ground(1130,1070);}
    else{ground(0,450);ground(620,400);ground(1190,350);ground(1710,490);}
    const routes=[[[410,400,210],[1050,400,210],[1550,400,220]],[[380,390,220],[650,290,220],[1120,390,220],[1400,290,220]],[[800,395,170],[1260,395,180]],[[340,395,190],[590,295,135],[830,210,135],[1190,395,200],[1450,295,135],[1720,210,135]],[[700,395,130],[1270,395,130],[1750,395,130]]];
    routes[index].forEach(p=>branch(...p));
    const stars=[[[230,460],[490,365],[1130,365],[1770,460]],[[240,460],[730,255],[1200,355],[1490,255]],[[300,460],[850,360],[1320,360],[1800,460]],[[410,360],[680,260],[1270,360],[1800,175]],[[260,460],[770,360],[1340,360],[1840,360]]];
    this.mainStars=stars[index].map((p,i)=>new window.LumiGame.Star(...p,false,i));
    const secret={1:[1550,180],2:[1320,265],3:[920,110]}[index];
    this.secretStars=secret?[new window.LumiGame.Star(...secret,true,0)]:[];
    this.mushrooms=index===1?[390,1130].map(x=>({x,y:477,width:58,height:23,bounceForce:720,color:'#bca3ff',squishTime:0})):[];
    this.hazards=[{x:0,y:550,width:2200,height:150,type:index===2?'water':'abyss'}];
    this.checkpoints=[[80,720,1580],[80,1085,1970],[80,710,1655],[80,1138,1990],[80,640,1730]][index].map((x,i)=>new window.LumiGame.Checkpoint(x,430,i));
    const encounters=[
      [{type:'crawler',x:1250,y:468,minX:1200,maxX:1380,speed:48}],
      [{type:'crawler',x:620,y:468,minX:540,maxX:850,speed:68},{type:'hopper',x:1500,y:468,minX:1430,maxX:1710,speed:86},{type:'crawler',x:1850,y:468,minX:1800,maxX:1900,speed:76}],
      [{type:'crawler',x:360,y:468,minX:320,maxX:490,speed:88},{type:'wisp',x:850,y:365,minX:760,maxX:960,speed:78},{type:'shooter',x:1320,y:452},{type:'hopper',x:1780,y:468,minX:1740,maxX:1910,speed:98}],
      [{type:'crawler',x:410,y:468,minX:350,maxX:530,speed:108},{type:'wisp',x:650,y:240,minX:610,maxX:750,speed:94},{type:'shooter',x:1240,y:452},{type:'hopper',x:1470,y:468,minX:1360,maxX:1520,speed:108},{type:'wisp',x:1800,y:220,minX:1750,maxX:1900,speed:100}],
      [{type:'crawler',x:290,y:468,minX:230,maxX:365,speed:122},{type:'hopper',x:830,y:468,minX:770,maxX:945,speed:118},{type:'wisp',x:850,y:345,minX:760,maxX:975,speed:110},{type:'shooter',x:1460,y:452},{type:'wisp',x:1330,y:315,minX:1230,maxX:1440,speed:115},{type:'boss',x:1870,y:412,minX:1830,maxX:1940,speed:42}]
    ];
    this.enemies=encounters[index].map(config=>new window.LumiGame.Enemy(config,index));
    this.difficulty={enemyCount:this.enemies.length,gap:[0,130,160,160,170][index],rank:index+1};
    this.checkpoints[0].active=true; this.gate={x:2060,y:500,width:76,height:130};
    this.ancestralTree={x:2060,y:500,shrineX:2060,isAwakened:false};
  }
  getZoneAt(){return this.chapter.name;}
}
window.LumiGame.LevelData=LevelData;

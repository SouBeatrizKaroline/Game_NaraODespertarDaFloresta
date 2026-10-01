window.LumiGame = window.LumiGame || {};
// Required gaps stay below 120px; secrets never gate the story.
class LevelData {
  static chapters = [
    {name:'O bosque esquecido', subtitle:'I · A última guardiã', color:'#80d7c0', sky:'#101e32', story:'Quando o céu se apagou, a Árvore-Mãe adormeceu. Nara, a última raposa guardiã, ainda carrega uma centelha no pingente de sua mãe. Quatro fragmentos abrirão o caminho para as raízes.', lesson:'Mova com A/D ou ←/→. Pule com Espaço, W ou ↑. Reúna as quatro estrelas e atravesse o arco aceso. Os santuários guardam seu caminho.', end:'As raízes voltam a respirar. Entre os cogumelos, Nara ouve a canção que sua mãe cantava para a floresta.'},
    {name:'Jardim dos cogumelos', subtitle:'II · A canção das raízes', color:'#bb9bea', sky:'#211b38', story:'Os cogumelos guardaram a canção durante a longa noite. Seus chapéus elásticos apontam para os galhos onde repousam as próximas estrelas.', lesson:'Os cogumelos impulsionam seus saltos. Segure o pulo para ir mais alto. As estrelas violetas são lembranças opcionais.', end:'A canção alcança o rio. A água desperta, mas a ponte antiga cedeu ao silêncio.'},
    {name:'Travessia do riacho', subtitle:'III · O caminho partido', color:'#79dce9', sky:'#102838', story:'Nara precisa levar a canção à outra margem. Pedras e troncos resistiram à noite; a correnteza devolve quem cai ao último santuário.', lesson:'Observe os espaços entre as margens e salte com impulso. Uma queda preserva suas estrelas. Esc ou Ⅱ pausa a jornada.', end:'Na outra margem, flores se abrem pela primeira vez em anos. Elas revelam uma escadaria esquecida.'},
    {name:'Ruínas em flor', subtitle:'IV · A memória das guardiãs', color:'#f1b6c2', sky:'#292039', story:'As guardiãs antigas deixaram uma promessa nas ruínas: a luz nunca pertence a uma só criatura. Nara sobe entre flores e pedras para reunir essa memória.', lesson:'Combine os saltos entre galhos. Para descer de um galho, use S/↓ + pulo. Os pontos luminosos no arco mostram os fragmentos que faltam.', end:'O pingente brilha branco. A promessa está inteira. Falta devolver sua luz ao coração da floresta.'},
    {name:'Coração da floresta', subtitle:'V · O despertar', color:'#f5d886', sky:'#253047', story:'A Árvore-Mãe espera além das últimas fendas. Com as raízes, a canção, o rio e a memória reunidos, Nara já não caminha sozinha.', lesson:'Esta travessia reúne tudo o que você aprendeu. Recupere as últimas estrelas e alcance a árvore. A floresta lembra de você.', end:'A floresta lembra de sua luz.'}
  ];
  constructor(index=0) {
    this.index=index; this.chapter=LevelData.chapters[index]; this.worldWidth=2200; this.spawn={x:90,y:456}; this.platforms=[];
    const ground=(x,w)=>this.platforms.push({x,y:500,width:w,height:150,isOneWay:false});
    const branch=(x,y,w)=>this.platforms.push({x,y,width:w,height:18,isOneWay:true});
    if(index<2)ground(0,2200);
    else if(index===2){ground(0,580);ground(690,330);ground(1140,390);ground(1640,560);}
    else if(index===3){ground(0,970);ground(1080,1120);}
    else{ground(0,480);ground(600,430);ground(1150,420);ground(1690,510);}
    const routes=[[[410,400,210],[1050,400,210],[1550,400,220]],[[380,390,220],[650,290,220],[1120,390,220],[1400,290,220]],[[800,395,170],[1260,395,180]],[[340,395,190],[590,295,190],[830,210,200],[1190,395,200],[1450,295,200],[1720,210,210]],[[700,395,190],[1270,395,190],[1750,395,190]]];
    routes[index].forEach(p=>branch(...p));
    const stars=[[[230,460],[490,365],[1130,365],[1770,460]],[[240,460],[730,255],[1200,355],[1490,255]],[[300,460],[850,360],[1320,360],[1800,460]],[[410,360],[680,260],[1270,360],[1800,175]],[[260,460],[770,360],[1340,360],[1840,360]]];
    this.mainStars=stars[index].map((p,i)=>new window.LumiGame.Star(...p,false,i));
    const secret={1:[1550,180],2:[1320,265],3:[920,110]}[index];
    this.secretStars=secret?[new window.LumiGame.Star(...secret,true,0)]:[];
    this.mushrooms=index===1?[390,1130].map(x=>({x,y:477,width:58,height:23,bounceForce:720,color:'#bca3ff',squishTime:0})):[];
    this.hazards=[{x:0,y:550,width:2200,height:150,type:index===2?'water':'abyss'}];
    this.checkpoints=[80,index===4?650:720,index===2?1660:index===4?1720:1580].map((x,i)=>new window.LumiGame.Checkpoint(x,430,i));
    this.checkpoints[0].active=true; this.gate={x:2060,y:500,width:76,height:130};
    this.ancestralTree={x:2060,y:500,shrineX:2060,isAwakened:false};
  }
  getZoneAt(){return this.chapter.name;}
}
window.LumiGame.LevelData=LevelData;

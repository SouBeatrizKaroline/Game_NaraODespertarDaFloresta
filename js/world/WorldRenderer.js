window.LumiGame=window.LumiGame||{};
class WorldRenderer {
 constructor(canvas){this.canvas=canvas;}
 ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
 render(level,player,camera,fx,transform,particles,time=0){
  const c=this.canvas.getContext('2d'),w=this.canvas.width,h=this.canvas.height,light=transform.progress;
  const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,level.chapter.sky);sky.addColorStop(1,light>.5?'#365e67':'#1c3542');c.fillStyle=sky;c.fillRect(0,0,w,h);
  const moonX=w*.8-camera.x*.04;this.ellipse(c,moonX,96,44,44,'#f1e9c9');this.ellipse(c,moonX-12,86,40,40,level.chapter.sky);
  for(let i=0;i<50;i++){const x=(i*137.1)%w,y=(i*61.7)%245;c.globalAlpha=.22+light*.5+Math.sin(time+i)*.12;this.ellipse(c,x,y,1.2,1.2,'#f9e6ab');}c.globalAlpha=1;
  // Three deterministic parallax layers; no generated assets or network required.
  for(let layer=0;layer<3;layer++){
   const spacing=160+layer*65,scroll=camera.x*(.16+layer*.16);
   for(let i=-2;i<12;i++){
    const x=i*spacing-scroll%spacing,base=510,top=60+(i*43+layer*78)%180;
    c.fillStyle=['#1b3043','#203c48','#274c50'][layer];c.globalAlpha=.5;
    c.beginPath();c.moveTo(x-18,base);c.lineTo(x-7,top+70);c.lineTo(x+9,top+70);c.lineTo(x+28,base);c.fill();
    this.ellipse(c,x,top+30,80+layer*15,75,c.fillStyle);this.ellipse(c,x-45,top+70,60,40,c.fillStyle);
   }
  }c.globalAlpha=1;
  const offsets=camera.getRenderOffsets(),view={x:offsets.x,y:offsets.y,viewportWidth:w,viewportHeight:h};
  // Only geometry uses a translated context. Entities already subtract the camera.
  c.save();c.translate(-view.x,-view.y);
  for(const hazard of level.hazards)if(level.index===2){c.fillStyle='#317487';c.fillRect(0,505,2200,120);for(let i=0;i<45;i++){c.strokeStyle='rgba(146,231,222,.28)';c.beginPath();c.moveTo(i*55+Math.sin(time+i)*9,515+i%3*9);c.lineTo(i*55+26,515+i%3*9);c.stroke();}}
  for(const p of level.platforms){
   if(p.x+p.width<view.x-30||p.x>view.x+w+30)continue;
   c.fillStyle=p.isOneWay?'#58605d':'#223b40';c.fillRect(p.x,p.y,p.width,p.height);
   c.fillStyle=p.isOneWay?'#92b494':level.chapter.color;c.globalAlpha=p.isOneWay?.85:.65;c.fillRect(p.x,p.y,p.width,4);c.globalAlpha=1;
   if(p.isOneWay){c.fillStyle='#394f47';c.beginPath();c.moveTo(p.x,p.y+18);c.lineTo(p.x+25,p.y+26);c.lineTo(p.x+p.width-12,p.y+18);c.fill();}
   else for(let x=p.x+12;x<p.x+p.width;x+=32){c.strokeStyle='#589079';c.beginPath();c.moveTo(x,p.y);c.lineTo(x-5,p.y-9-Math.sin(time*1.5+x)*2);c.moveTo(x,p.y);c.lineTo(x+5,p.y-7);c.stroke();if(light>.25){this.ellipse(c,x+5,p.y-10,3,3,level.chapter.color);}}
  }
  for(let i=0;i<14;i++){const x=150+i*153;if(!level.platforms.some(p=>!p.isOneWay&&x>=p.x&&x<p.x+p.width))continue;this.ellipse(c,x,494,6,3,'#537c6d');if(light>.2)this.ellipse(c,x,487,4,4,level.chapter.color);}
  if(level.index===3){for(const x of [560,1450]){c.fillStyle='#596265';c.fillRect(x,370,24,130);c.fillRect(x+60,350,24,150);c.fillRect(x-6,350,96,20);c.strokeStyle='#86a98e';c.beginPath();c.moveTo(x+15,500);c.quadraticCurveTo(x+50,400,x+70,350);c.stroke();}}
  for(const m of level.mushrooms){const squish=m.squishTime>0?Math.sin(m.squishTime/.35*Math.PI)*6:0;c.fillStyle='#a6bbc0';c.fillRect(m.x+24,m.y+5,10,18);this.ellipse(c,m.x+29,m.y+7+squish,30,14-squish*.5,m.color);c.fillStyle='#eae4ff';for(let j=0;j<3;j++)this.ellipse(c,m.x+12+j*16,m.y+5,3,2,'#eae4ff');}
  const gate=level.gate,ready=level.mainStars.every(s=>s.collected);
  if(level.index===4){
   const tree=level.ancestralTree,awake=tree.isAwakened;
   c.fillStyle='#4c6259';c.beginPath();c.moveTo(tree.x-60,500);c.quadraticCurveTo(tree.x-20,300,tree.x-35,170);c.lineTo(tree.x+30,150);c.quadraticCurveTo(tree.x+10,350,tree.x+70,500);c.fill();
   c.strokeStyle='#4c6259';c.lineWidth=17;for(let i=0;i<6;i++){c.beginPath();c.moveTo(tree.x,330);c.quadraticCurveTo(tree.x+(i-3)*28,250,tree.x+(i-3)*60,175);c.stroke();}
   for(let i=0;i<7;i++)this.ellipse(c,tree.x+(i-3)*42,165-Math.sin(i)*30,70,60,awake?'#85b99d':'#3e6761');
   if(awake){c.shadowColor='#ffe6a0';c.shadowBlur=22;for(let i=0;i<18;i++)this.ellipse(c,tree.x+Math.cos(i*2.4)*125,170+Math.sin(i*2.4)*65,3,3,'#ffe6a0');c.shadowBlur=0;}
  }
  c.strokeStyle=ready?level.chapter.color:'#65746f';c.lineWidth=9;c.beginPath();c.moveTo(gate.x-38,500);c.lineTo(gate.x-38,414);c.bezierCurveTo(gate.x-38,355,gate.x+38,355,gate.x+38,414);c.lineTo(gate.x+38,500);c.stroke();
  if(ready){const glow=c.createRadialGradient(gate.x,440,5,gate.x,440,72);glow.addColorStop(0,level.chapter.color+'99');glow.addColorStop(1,level.chapter.color+'00');c.fillStyle=glow;c.fillRect(gate.x-72,360,144,150);c.strokeStyle='#f8eac0';c.lineWidth=3;c.beginPath();c.moveTo(gate.x-12,430);c.lineTo(gate.x+10,440);c.lineTo(gate.x-12,450);c.stroke();}
  level.mainStars.forEach((s,i)=>this.ellipse(c,gate.x-24+i*16,388,4,4,s.collected?'#ffe39b':'#475b60'));
  c.restore();
  for(const s of [...level.mainStars,...level.secretStars])s.draw(c,view);
  for(const cp of level.checkpoints)cp.draw(c,view);
  player.draw(c,view);particles.draw(c,view);
  // A silent compass points to the closest missing fragment, then to the gate.
  const remaining=level.mainStars.filter(s=>!s.collected).sort((a,b)=>Math.abs(a.x-player.x)-Math.abs(b.x-player.x));
  const target=remaining[0]||gate;const tx=target.x-view.x,ty=(target.y||440)-view.y;
  if(tx<35||tx>w-35||ty<65){c.save();c.translate(Math.max(28,Math.min(w-28,tx)),Math.max(78,Math.min(440,ty)));c.rotate(Math.atan2(ty-270,tx-w/2));c.strokeStyle='#ffe39b';c.lineWidth=2;c.beginPath();c.moveTo(-8,-6);c.lineTo(0,0);c.lineTo(-8,6);c.stroke();c.restore();}
  for(let i=0;i<18;i++){const x=(i*97.4+Math.sin(time*.7+i)*12)%960,y=230+(i*33.8)%260;this.ellipse(c,x,y,1.4,1.4,'#bbefd4');}
 }
}
window.LumiGame.WorldRenderer=WorldRenderer;

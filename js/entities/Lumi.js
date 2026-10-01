window.LumiGame=window.LumiGame||{};
class Nara {
  constructor(x,y){Object.assign(this,{x,y,width:38,height:44,vx:0,vy:0,onGround:false,lastCheckpoint:{x,y},isRespawning:false,respawnTimer:0,state:'IDLE',expression:'Curiosa',droppedOneWay:false,furColor:'#8e969f',facing:1,anim:0,coyote:0,jumpBuffer:0,dropTimer:0,celebration:0});}
  update(dt,input,sound){
    this.bounceGrace=Math.max(0,(this.bounceGrace||0)-dt);this.anim+=dt;this.celebration=Math.max(0,this.celebration-dt);
    if(this.isRespawning){this.respawnTimer+=dt;if(this.respawnTimer>=.45)this.respawn();return;}
    this.coyote=this.onGround?.11:Math.max(0,this.coyote-dt);
    this.jumpBuffer=input.jumpPressed?.12:Math.max(0,this.jumpBuffer-dt);
    const direction=Number(input.right)-Number(input.left);
    this.vx+=(direction*250-this.vx)*(1-Math.exp(-14*dt));if(direction)this.facing=direction;
    this.dropTimer=Math.max(0,this.dropTimer-dt);
    if(input.down&&input.jumpPressed&&this.currentPlatform?.isOneWay){this.dropTimer=.24;this.y+=6;this.coyote=0;this.jumpBuffer=0;}
    if(this.jumpBuffer>0&&this.coyote>0){this.vy=-560;this.coyote=0;this.jumpBuffer=0;this.onGround=false;sound?.playJump();}
    if(!this.bounceGrace&&!input.jump&&this.vy < -260)this.vy=-260;
    this.droppedOneWay=this.dropTimer>0;this.vy=Math.min(800,this.vy+980*dt);
    this.x+=this.vx*dt;this.y+=this.vy*dt;this.state=!this.onGround?'JUMP':Math.abs(this.vx)>20?'WALK':'IDLE';
  }
  respawn(){Object.assign(this,{x:this.lastCheckpoint.x,y:this.lastCheckpoint.y,vx:0,vy:0,isRespawning:false,respawnTimer:0,bounceGrace:0,coyote:0,jumpBuffer:0,dropTimer:0,onGround:false,currentPlatform:null});}
  triggerCelebration(secret){this.celebration=secret?1:.5;}
  setFurColor(color){if(color===this.furColor)return false;this.furColor=color;return true;}
  draw(ctx,camera){
    const motion=window.LumiGame.instance?.reducedMotion?0:1;
    const walk=this.onGround?Math.sin(this.anim*18)*Math.min(1,Math.abs(this.vx)/180)*motion:0;
    ctx.save();ctx.translate(this.x+19-camera.x,this.y+24-camera.y);ctx.scale(this.facing,1);
    if(this.isRespawning)ctx.globalAlpha=Math.max(0,1-this.respawnTimer/.45);
    ctx.fillStyle='rgba(4,12,23,.3)';ctx.beginPath();ctx.ellipse(0,22,23,4,0,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.rotate(Math.sin(this.anim*5)*.12*motion);ctx.fillStyle=this.furColor;ctx.beginPath();ctx.moveTo(-9,10);ctx.bezierCurveTo(-36,28,-45,0,-38,-10);ctx.bezierCurveTo(-30,3,-18,-4,-9,10);ctx.fill();
    ctx.fillStyle='#e7e4dd';ctx.beginPath();ctx.moveTo(-38,-10);ctx.quadraticCurveTo(-47,5,-33,15);ctx.lineTo(-28,3);ctx.fill();ctx.restore();
    ctx.fillStyle='#325c85';ctx.beginPath();ctx.moveTo(-2,-5);ctx.lineTo(-26,15+walk*2);ctx.quadraticCurveTo(-12,24,9,14);ctx.fill();
    ctx.fillStyle=this.furColor;ctx.beginPath();ctx.ellipse(0,7,14,16,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#dadde0';for(const [x,phase] of [[-7,1],[8,-1]]){ctx.beginPath();ctx.ellipse(x,19+walk*phase*3,5,5,0,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle=this.furColor;ctx.beginPath();ctx.moveTo(-14,-8);ctx.lineTo(-13,-29);ctx.lineTo(-2,-17);ctx.lineTo(8,-29);ctx.lineTo(15,-7);ctx.closePath();ctx.fill();
    ctx.fillStyle='#c78f9e';ctx.beginPath();ctx.moveTo(-11,-15);ctx.lineTo(-11,-24);ctx.lineTo(-6,-17);ctx.moveTo(6,-17);ctx.lineTo(9,-24);ctx.lineTo(11,-14);ctx.fill();
    ctx.fillStyle=this.furColor;ctx.beginPath();ctx.ellipse(1,-5,17,14,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#eeece3';ctx.beginPath();ctx.moveTo(-12,0);ctx.quadraticCurveTo(0,15,20,1);ctx.lineTo(8,-3);ctx.closePath();ctx.fill();
    ctx.fillStyle='#151e2c';ctx.beginPath();ctx.ellipse(17,0,3,2,0,0,Math.PI*2);ctx.fill();
    const blink=Math.sin(this.anim*1.7)>.996;ctx.fillStyle='#8ce9e0';ctx.beginPath();ctx.ellipse(7,-7,3.5,blink?1:4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#101e32';ctx.fillRect(7,-9,1.7,4);
    ctx.fillStyle='#ffe49c';ctx.shadowColor='#ffe49c';ctx.shadowBlur=this.celebration>0?20:6;ctx.beginPath();ctx.moveTo(5,7);ctx.lineTo(9,11);ctx.lineTo(5,15);ctx.lineTo(1,11);ctx.fill();ctx.restore();
  }
}
window.LumiGame.Lumi=Nara;

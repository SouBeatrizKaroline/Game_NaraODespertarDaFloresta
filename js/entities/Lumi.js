
window.LumiGame = window.LumiGame || {};
class Nara {
  constructor(x,y) {
    Object.assign(this,{x,y,width:38,height:44,vx:0,vy:0,onGround:false,lastCheckpoint:{x,y},isRespawning:false,respawnTimer:0,state:'IDLE',droppedOneWay:false,furColor:'#8996aa',facing:1,anim:0,stride:0,coyote:0,jumpBuffer:0,dropTimer:0,celebration:0,health:3,maxHealth:3,invulnerable:0,hurtTimer:0,attackTimer:0,attackCooldown:0,attackId:0,landing:0,wasGrounded:false});
  }
  update(dt,input,sound) {
    for(const key of ['bounceGrace','celebration','invulnerable','hurtTimer','attackTimer','attackCooldown','landing'])this[key]=Math.max(0,(this[key]||0)-dt);
    this.anim+=dt;this.stride+=Math.abs(this.vx)*dt*.055;
    if(this.isRespawning){this.respawnTimer+=dt;if(this.respawnTimer>=.45)this.respawn();return;}
    if(input.attackPressed&&this.attackCooldown===0&&this.hurtTimer===0){this.attackTimer=.22;this.attackCooldown=.38;this.attackId++;sound?.playAttack();}
    this.coyote=this.onGround?.11:Math.max(0,this.coyote-dt);
    this.jumpBuffer=input.jumpPressed?.12:Math.max(0,this.jumpBuffer-dt);
    const direction=Number(input.right)-Number(input.left);
    if(!this.hurtTimer){this.vx+=(direction*250-this.vx)*(1-Math.exp(-14*dt));if(direction)this.facing=direction;}
    this.dropTimer=Math.max(0,this.dropTimer-dt);
    if(input.down&&input.jumpPressed&&this.currentPlatform?.isOneWay){this.dropTimer=.24;this.y+=6;this.coyote=0;this.jumpBuffer=0;}
    if(this.jumpBuffer>0&&this.coyote>0&&!this.hurtTimer){this.vy=-560;this.coyote=0;this.jumpBuffer=0;this.onGround=false;sound?.playJump();}
    if(!this.bounceGrace&&!this.hurtTimer&&!input.jump&&this.vy < -260)this.vy=-260;
    this.droppedOneWay=this.dropTimer>0;this.vy=Math.min(800,this.vy+980*dt);
    this.x+=this.vx*dt;this.y+=this.vy*dt;
  }
  syncAnimation(){
    if(this.onGround&&!this.wasGrounded)this.landing=.15;
    this.wasGrounded=this.onGround;
    this.state=this.hurtTimer?'HURT':this.attackTimer?'ATTACK':!this.onGround?(this.vy<0?'RISE':'FALL'):this.landing?'LAND':Math.abs(this.vx)>180?'RUN':Math.abs(this.vx)>20?'WALK':'IDLE';
  }
  getAttackBox(){if(!this.attackTimer||this.isRespawning)return null;return {x:this.facing===1?this.x+this.width-5:this.x-72,y:this.y-7,width:77,height:59};}
  respawn(){Object.assign(this,{x:this.lastCheckpoint.x,y:this.lastCheckpoint.y,vx:0,vy:0,isRespawning:false,respawnTimer:0,bounceGrace:0,coyote:0,jumpBuffer:0,dropTimer:0,onGround:false,currentPlatform:null,health:3,invulnerable:1.5,hurtTimer:0,attackTimer:0,attackCooldown:0,landing:0,wasGrounded:false});}
  triggerCelebration(secret){this.celebration=secret?1:.5;}
  setFurColor(color){if(color===this.furColor)return false;this.furColor=color;return true;}
  draw(ctx,camera){
    const reduced=window.LumiGame.instance?.reducedMotion;
    const moving=this.onGround&&Math.abs(this.vx)>20;
    const wave=reduced?0:Math.sin(this.stride);
    const breath=reduced?0:Math.sin(this.anim*2.4)*.7;
    const airborne=!this.onGround;
    const rise=airborne&&this.vy<0,fall=airborne&&this.vy>=0;
    ctx.save();
    ctx.translate(this.x+19-camera.x,this.y+44-camera.y);
    ctx.fillStyle='rgba(5,17,23,.28)';ctx.beginPath();ctx.ellipse(0,1,27,3,0,0,Math.PI*2);ctx.fill();
    ctx.scale(this.facing,1);
    if(this.isRespawning)ctx.globalAlpha=Math.max(0,1-this.respawnTimer/.45);
    else if(this.invulnerable>0)ctx.globalAlpha=reduced?.75:(Math.floor(this.invulnerable*12)%2?.42:1);
    const squash=!reduced&&this.landing>0?Math.sin(this.landing/.15*Math.PI)*.12:0;
    ctx.scale(1+squash,1-squash);
    ctx.rotate(reduced?0:this.hurtTimer?-.15:rise?-.1:fall?.09:0);
    const bob=moving&&!reduced?Math.abs(wave)*1.5:breath;
    ctx.translate(this.attackTimer?3:0,bob);
    const fur=this.furColor,light='#dfe5e8',shade='#59697f';
    const ellipse=(x,y,rx,ry,color,angle=0)=>{ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,angle,0,Math.PI*2);ctx.fill();if(color===fur){ctx.strokeStyle='#365269';ctx.lineWidth=.8;ctx.stroke();}};
    // An elongated fox silhouette with a tapered muzzle and feathered brush.
    ctx.save();ctx.translate(-17,-20);ctx.rotate(reduced?0:airborne?-.24:Math.sin(this.anim*3.5)*.08+wave*.05);
    ctx.fillStyle=fur;ctx.strokeStyle='#263f54';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(4,5);ctx.bezierCurveTo(-10,18,-40,8,-47,-12);ctx.lineTo(-37,-6);ctx.lineTo(-40,-17);ctx.bezierCurveTo(-21,-6,-14,-6,4,-6);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=light;ctx.beginPath();ctx.moveTo(-47,-12);ctx.lineTo(-37,-6);ctx.lineTo(-40,-17);ctx.quadraticCurveTo(-34,-11,-26,-8);ctx.lineTo(-30,4);ctx.quadraticCurveTo(-43,-1,-47,-12);ctx.fill();ctx.restore();
    // Back limbs have independent joint angles; front limbs lead the stride.
    const leg=(hipX,phase,back)=>{
      const cycle=moving&&!reduced?Math.sin(this.stride+phase):0;
      const lift=moving&&!reduced?Math.max(0,Math.cos(this.stride+phase))*5:0;
      const kneeX=hipX+(rise?-5:fall?3:cycle*5),kneeY=rise?-9:-8;
      const pawX=hipX+(rise?-2:fall?7:cycle*8),pawY=airborne?(rise?-7:-2):-lift;
      ctx.strokeStyle=back?shade:fur;ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(hipX,-18);ctx.lineTo(kneeX,kneeY);ctx.lineTo(pawX,pawY-2);ctx.stroke();ellipse(pawX+2,pawY-1,4,2.4,back?'#83909e':light);
    };
    leg(-11,Math.PI,true);leg(9,0,true);
    ellipse(-3,-21,23,11,fur,-.06);ellipse(10,-23,10,13,fur,.12);
    ellipse(1,-15,15,5,light,.1);
    leg(-15,0,false);leg(12,Math.PI,false);
    // Cape fabric streams from the collar and settles when idle.
    ctx.fillStyle='#284b6d';ctx.strokeStyle='#77a4b6';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(9,-34);ctx.quadraticCurveTo(-3,-29,-17,-23+(moving?wave*2:breath));ctx.lineTo(-27,-27+(airborne?-6:wave*2));ctx.quadraticCurveTo(-10,-37,5,-37);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle='#457493';ctx.beginPath();ctx.moveTo(5,-34);ctx.quadraticCurveTo(-8,-31,-22,-28);ctx.stroke();
    // Head, far ear, near ear, cheek tufts and long nose.
    ctx.fillStyle=shade;ctx.beginPath();ctx.moveTo(4,-37);ctx.lineTo(2,-56);ctx.lineTo(16,-43);ctx.fill();
    ellipse(13,-35,13,11,fur,-.1);
    ctx.fillStyle=fur;ctx.strokeStyle='#304758';ctx.beginPath();ctx.moveTo(11,-42);ctx.lineTo(15,-59);ctx.lineTo(25,-39);ctx.lineTo(24,-29);ctx.lineTo(29,-27);ctx.lineTo(18,-22);ctx.lineTo(9,-26);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#bd8b9a';ctx.beginPath();ctx.moveTo(15,-45);ctx.lineTo(16,-53);ctx.lineTo(21,-41);ctx.fill();
    ctx.fillStyle=light;ctx.beginPath();ctx.moveTo(12,-30);ctx.lineTo(27,-34);ctx.lineTo(35,-29);ctx.quadraticCurveTo(28,-23,16,-24);ctx.lineTo(8,-26);ctx.closePath();ctx.fill();
    ellipse(33,-29,3,2,'#172c3e');
    const blink=!reduced&&Math.sin(this.anim*1.65)>.995;
    ellipse(20,-36,3.5,blink?1:3.7,'#c5f5eb',-.13);ellipse(21,-36,1.2,blink?.5:2.7,'#17364a');ellipse(19.5,-37.4,.8,.8,'#fff');
    ctx.strokeStyle='#53697a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(27,-27);ctx.lineTo(31,-27);ctx.stroke();
    ctx.fillStyle='#d6b97d';ctx.fillRect(7,-29,5,2);ctx.shadowColor='#ffe5a1';ctx.shadowBlur=this.attackTimer?16:5;
    ctx.fillStyle='#ffdc81';ctx.beginPath();ctx.moveTo(9,-25);ctx.lineTo(13,-21);ctx.lineTo(9,-17);ctx.lineTo(5,-21);ctx.closePath();ctx.fill();ctx.shadowBlur=0;
    if(this.attackTimer){const t=1-this.attackTimer/.22;ctx.strokeStyle='#d9ffe8';ctx.lineWidth=4;ctx.shadowColor='#b9ffdd';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(35,-22,34,-1.25+t*.3,1.2+t*.3);ctx.stroke();ctx.strokeStyle='#ffe2a2';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(35,-22,40,-1,1);ctx.stroke();ctx.shadowBlur=0;}
    ctx.restore();
  }
}
window.LumiGame.Lumi=Nara;

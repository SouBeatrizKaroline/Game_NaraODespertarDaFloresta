window.LumiGame = window.LumiGame || {};

class Enemy {
  constructor(config, difficulty = 0) {
    Object.assign(this, config);
    this.width = this.type === 'boss' ? 82 : 36;
    this.height = this.type === 'boss' ? 88 : this.type === 'shooter' ? 48 : 32;
    this.baseY = this.y;
    this.minX = config.minX ?? (this.type==='shooter'?this.x:this.x - 70);
    this.maxX = config.maxX ?? (this.type==='shooter'?this.x:this.x + 70);
    this.difficulty = difficulty;
    this.speed = config.speed ?? 48 + difficulty * 19;
    this.maxHealth = this.type === 'boss' ? 12 : this.type === 'shooter' ? 3 : difficulty >= 3 ? 2 : 1;
    this.health = this.maxHealth;
    this.direction = -1;
    this.time = 0;
    this.vy = 0;
    this.cooldown = 1.4;
    this.windup = 0;
    this.stun = 0;
    this.defeated = false;
    this.fade = 1;
    this.lastAttack = -1;
  }

  damage(amount = 1) {
    if (this.defeated) return false;
    this.health = Math.max(0, this.health - amount);
    this.stun = this.type === 'boss' ? .05 : .18;
    if (!this.health) this.defeated = true;
    return true;
  }

  update(dt, player, projectiles) {
    this.time += dt;
    this.stun = Math.max(0, this.stun - dt);
    if (this.defeated) { this.fade = Math.max(0, this.fade - dt * 2); return; }
    if (this.stun) return;
    const distance = player.x + player.width / 2 - (this.x + this.width / 2);
    const active = Math.abs(distance) < (this.type === 'boss' ? 520 : 400);
    if (this.type === 'crawler' || this.type === 'wisp' || this.type === 'boss') {
      const speed = this.speed * (this.type === 'boss' && this.health <= 6 ? 1.45 : 1);
      this.x += this.direction * speed * dt;
      if (this.x <= this.minX) { this.x = this.minX; this.direction = 1; }
      if (this.x >= this.maxX) { this.x = this.maxX; this.direction = -1; }
    }
    if (this.type === 'wisp') this.y = this.baseY + Math.sin(this.time * 2.5) * 32;
    if (this.type === 'hopper') {
      if (active || this.y < this.baseY) this.cooldown -= dt;
      else { this.cooldown = Math.max(.65, this.cooldown); this.windup = 0; }
      if (this.y >= this.baseY && active && this.cooldown <= .55 && this.cooldown > 0) this.windup = .55 - this.cooldown;
      if (this.y >= this.baseY && active && this.cooldown <= 0) {
        this.vy = -360; this.direction = distance < 0 ? -1 : 1;
        this.cooldown = Math.max(1, 2.3 - this.difficulty * .2); this.windup = 0;
      }
      if (this.y < this.baseY || this.vy < 0) {
        this.vy += 980 * dt; this.y += this.vy * dt;
        this.x = Math.max(this.minX, Math.min(this.maxX, this.x + this.direction * this.speed * dt));
        if (this.y >= this.baseY) { this.y = this.baseY; this.vy = 0; }
      }
    }
    if (this.type === 'shooter' || this.type === 'boss') {
      if (!active || player.isRespawning) { this.windup = 0; return; }
      const phaseTwo = this.type === 'boss' && this.health <= 6;
      this.cooldown -= dt;
      this.windup = this.cooldown <= .65 ? Math.max(0, .65 - this.cooldown) : 0;
      if (this.cooldown <= 0) {
        const origin = { x: this.x + this.width / 2, y: this.y + this.height * .45 };
        const angle = Math.atan2(player.y + player.height / 2 - origin.y, player.x + player.width / 2 - origin.x);
        const offsets = this.type === 'boss' ? (phaseTwo ? [-.3, 0, .3] : [-.16, .16]) : [0];
        for (const offset of offsets) projectiles.push({ x: origin.x, y: origin.y, width: 12, height: 12, vx: Math.cos(angle + offset) * (150 + this.difficulty * 22), vy: Math.sin(angle + offset) * (150 + this.difficulty * 22), life: 4, reflected: false, owner: this });
        this.cooldown = this.type === 'boss' ? (phaseTwo ? 1.45 : 2.15) : Math.max(1.65, 2.9 - this.difficulty * .2);
        this.windup = 0;
      }
    }
  }

  draw(ctx, camera, reducedMotion = false) {
    if (this.fade <= 0 || this.x + this.width < camera.x - 60 || this.x > camera.x + camera.viewportWidth + 60) return;
    const pulse = reducedMotion ? 0 : Math.sin(this.time * 6);
    ctx.save(); ctx.translate(this.x + this.width / 2 - camera.x, this.y + this.height / 2 - camera.y);
    ctx.globalAlpha = this.fade;
    const ink = this.stun ? '#e6fff0' : '#38344f', edge = this.type === 'boss' ? '#b76cbe' : '#857298';
    ctx.fillStyle = ink; ctx.strokeStyle = edge; ctx.lineWidth = 2;
    const oval = (x,y,rx,ry,color) => {ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();};
    if (this.type === 'wisp') {
      for (const side of [-1,1]) {ctx.save();ctx.scale(side,1);ctx.rotate(pulse*.15);ctx.fillStyle='#685584';ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(36,-32,23,15);ctx.quadraticCurveTo(13,6,0,0);ctx.fill();ctx.restore();}
      oval(0,0,11,18,ink);
    } else if (this.type === 'boss') {
      oval(-3,8,39,33,ink); oval(3,-22,27,23,ink);
      ctx.strokeStyle=edge;ctx.lineWidth=6;
      for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*14,-33);ctx.lineTo(side*27,-61);ctx.lineTo(side*38,-66);ctx.moveTo(side*25,-55);ctx.lineTo(side*14,-62);ctx.stroke();}
      for(const side of [-1,1])oval(side*23,36,8,12,ink);
      ctx.strokeStyle='#846181';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-15,5);ctx.lineTo(0,18);ctx.lineTo(15,1);ctx.stroke();
      oval(0,5,7,9,this.health<=6?'#ffbb83':'#da97ec');
    } else if (this.type === 'shooter') {
      ctx.fillStyle=ink;ctx.beginPath();ctx.moveTo(-20,24);ctx.lineTo(-14,-20);ctx.lineTo(8,-28);ctx.lineTo(18,24);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.strokeStyle='#8b7393';ctx.beginPath();ctx.moveTo(-14,8);ctx.lineTo(-30,-8);ctx.moveTo(12,4);ctx.lineTo(29,-13);ctx.stroke();
    } else {
      const squash = this.windup > 0 ? 1 - this.windup * .3 : 1;
      ctx.scale(1 / squash, squash);oval(0,2,19,15,ink);
      ctx.strokeStyle=edge;ctx.lineWidth=3;
      for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*10,6);ctx.lineTo(side*21,16+pulse*2);ctx.lineTo(side*28,16);ctx.stroke();}
      ctx.fillStyle='#6b5877';ctx.beginPath();ctx.moveTo(-11,-10);ctx.lineTo(-14,-24);ctx.lineTo(-1,-13);ctx.lineTo(7,-23);ctx.lineTo(12,-9);ctx.fill();
    }
    const eyeY=this.type==='boss'?-24:this.type==='shooter'?-9:-2;
    const glow=this.windup>0?'#ffb56f':'#e9aadf';
    ctx.shadowColor=glow;ctx.shadowBlur=6+this.windup*20;
    for(const side of [-1,1])oval(side*(this.type==='boss'?11:6),eyeY,3,2.5,glow);
    ctx.shadowBlur=0;
    if(this.windup>0){ctx.strokeStyle='#ffbb83';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,this.width*.65+this.windup*12,0,Math.PI*2);ctx.stroke();}
    if(this.maxHealth>1){const width=this.type==='boss'?78:30;ctx.fillStyle='#181c2d';ctx.fillRect(-width/2,-this.height/2-15,width,4);ctx.fillStyle='#dca2ca';ctx.fillRect(-width/2,-this.height/2-15,width*this.health/this.maxHealth,4);}
    ctx.restore();
  }
}
window.LumiGame.Enemy = Enemy;

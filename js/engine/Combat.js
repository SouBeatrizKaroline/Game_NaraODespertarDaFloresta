window.LumiGame = window.LumiGame || {};

class Combat {
  constructor() { this.projectiles = []; }

  update(dt, player, level, sound, particles) {
    for (const enemy of level.enemies) enemy.update(dt, player, this.projectiles);
    if (player.isRespawning) { this.projectiles = []; return; }
    const attack = player.getAttackBox();
    for (const enemy of level.enemies) {
      if (enemy.defeated) continue;
      if (attack && enemy.lastAttack !== player.attackId && window.LumiGame.Physics.checkOverlap(attack, enemy)) {
        enemy.lastAttack = player.attackId;
        if (!(enemy.type === 'boss' && enemy.windup > .25)) enemy.damage(1);
        if (enemy.defeated) { sound?.playStarCollect(); particles?.emitStarBurst(enemy.x + enemy.width/2, enemy.y + enemy.height/2, true); }
      }
      if (enemy.defeated || !window.LumiGame.Physics.checkOverlap(player, enemy)) continue;
      // A downward landing purifies small creatures; the armored sentinel and boss resist stomps.
      const stomp = player.vy > 70 && player.y + player.height - player.vy * dt <= enemy.y + 10;
      if (stomp && ['crawler','hopper','wisp'].includes(enemy.type)) {
        enemy.damage(1); player.vy = -390; player.bounceGrace = .25;
      } else this.hurt(player, enemy.x + enemy.width/2, sound);
    }
    for (const shot of this.projectiles) {
      shot.life -= dt;
      shot.x += shot.vx * dt; shot.y += shot.vy * dt;
      if (attack && !shot.reflected && window.LumiGame.Physics.checkOverlap(attack, shot)) {
        shot.reflected = true;
        const angle = Math.atan2(shot.owner.y + shot.owner.height/2 - shot.y, shot.owner.x + shot.owner.width/2 - shot.x);
        shot.vx = Math.cos(angle) * 340; shot.vy = Math.sin(angle) * 340;
      }
      if (shot.reflected) {
        for (const enemy of level.enemies) if (!enemy.defeated && window.LumiGame.Physics.checkOverlap(shot, enemy)) {enemy.damage(2);shot.life=0;break;}
      } else if (window.LumiGame.Physics.checkOverlap(shot, player)) {this.hurt(player, shot.x, sound);shot.life=0;}
      if (!shot.reflected && level.platforms.some(p => !p.isOneWay && window.LumiGame.Physics.checkOverlap(shot,p))) shot.life=0;
    }
    this.projectiles = this.projectiles.filter(s => s.life > 0 && s.x > -50 && s.x < level.worldWidth+50 && s.y > -100 && s.y < 560).slice(-80);
  }

  hurt(player, sourceX, sound) {
    if (player.invulnerable > 0 || player.isRespawning) return false;
    player.health = Math.max(0, player.health - 1);
    player.invulnerable = 1.2; player.hurtTimer = .24;
    player.vx = player.x + player.width/2 < sourceX ? -230 : 230;
    player.vy = -210; player.onGround = false;
    sound?.playHit();
    if (!player.health) { player.isRespawning = true; player.respawnTimer = 0; }
    return true;
  }

  draw(ctx, camera) {
    for (const shot of this.projectiles) {
      ctx.save();ctx.translate(shot.x+6-camera.x,shot.y+6-camera.y);
      ctx.fillStyle=shot.reflected?'#bff9de':'#ed9dda';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=10;
      ctx.beginPath();ctx.moveTo(0,-7);ctx.lineTo(6,0);ctx.lineTo(0,7);ctx.lineTo(-6,0);ctx.closePath();ctx.fill();ctx.restore();
    }
  }
}
window.LumiGame.Combat = Combat;

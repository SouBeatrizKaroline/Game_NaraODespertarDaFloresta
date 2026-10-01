/**
 * Star - Collectible star fragments (20 main stars + 3 secret purple stars)
 */

window.LumiGame = window.LumiGame || {};

class Star {
  constructor(x, y, isSecret = false, id = 0) {
    this.id = id;
    this.baseX = x;
    this.baseY = y;
    this.x = x;
    this.y = y;
    this.width = isSecret ? 26 : 22;
    this.height = isSecret ? 26 : 22;
    this.isSecret = isSecret;
    this.collected = false;

    // Animation properties
    this.timeOffset = Math.random() * Math.PI * 2;
    this.bobAmp = 5;
    this.bobFreq = 2.4;
    this.rotation = Math.random() * Math.PI;
    this.rotSpeed = isSecret ? 1.6 : 1.2;

    // Disappearance animation state
    this.isDisappearing = false;
    this.disappearTimer = 0;
    this.disappearDuration = 0.35;
    this.scale = 1.0;
    this.alpha = 1.0;
  }

  update(dt, time) {
    if (this.collected && !this.isDisappearing) return;

    if (this.isDisappearing) {
      this.disappearTimer += dt;
      const progress = this.disappearTimer / this.disappearDuration;
      if (progress >= 1.0) {
        this.collected = true;
        this.isDisappearing = false;
        return;
      }
      this.scale = 1.0 + Math.sin(progress * Math.PI) * 0.4 - progress * 1.0;
      this.alpha = 1.0 - progress;
      this.rotation += dt * 10;
      return;
    }

    // Normal floating bob
    this.y = this.baseY + Math.sin(time * this.bobFreq + this.timeOffset) * this.bobAmp;
    this.rotation += this.rotSpeed * dt;
  }

  collect(particleSystem, soundManager) {
    if (this.collected || this.isDisappearing) return;
    this.collected = true;
    this.isDisappearing = true;
    this.disappearTimer = 0;

    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    if (particleSystem) {
      particleSystem.emitStarBurst(centerX, centerY, this.isSecret);
    }

    if (soundManager) {
      if (this.isSecret) {
        soundManager.playSecretStar();
      } else {
        soundManager.playStarCollect();
      }
    }
  }

  draw(ctx, camera) {
    if (this.collected && !this.isDisappearing) return;

    const screenX = this.x + this.width / 2 - camera.x;
    const screenY = this.y + this.height / 2 - camera.y;

    if (screenX < -40 || screenX > camera.viewportWidth + 40 ||
        screenY < -40 || screenY > camera.viewportHeight + 40) {
      return;
    }

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);
    ctx.globalAlpha = this.alpha;

    if (this.isSecret) {
      this.drawSecretStar(ctx);
    } else {
      this.drawMainStar(ctx);
    }

    ctx.restore();
  }

  drawMainStar(ctx) {
    // Outer gentle glow aura
    const gradient = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
    gradient.addColorStop(0, 'rgba(255, 235, 140, 0.7)');
    gradient.addColorStop(0.5, 'rgba(255, 209, 82, 0.25)');
    gradient.addColorStop(1, 'rgba(255, 209, 82, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();

    // 5-pointed golden star
    ctx.fillStyle = '#ffd152';
    ctx.shadowColor = '#ffe57f';
    ctx.shadowBlur = 12;

    this.renderStarShape(ctx, 0, 0, 5, 12, 5.5);
    ctx.fill();

    // Bright core
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 4;
    this.renderStarShape(ctx, 0, 0, 5, 6, 2.8);
    ctx.fill();
  }

  drawSecretStar(ctx) {
    // Outer purple aura
    const gradient = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
    gradient.addColorStop(0, 'rgba(243, 104, 224, 0.8)');
    gradient.addColorStop(0.5, 'rgba(224, 86, 253, 0.3)');
    gradient.addColorStop(1, 'rgba(224, 86, 253, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();

    // 4-pointed radiant crystal star
    ctx.fillStyle = '#f368e0';
    ctx.shadowColor = '#e056fd';
    ctx.shadowBlur = 16;
    this.renderStarShape(ctx, 0, 0, 4, 15, 4.5);
    ctx.fill();

    // Inner bright diamond
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 6;
    this.renderStarShape(ctx, 0, 0, 4, 7, 2.2);
    ctx.fill();
  }

  renderStarShape(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }
}

window.LumiGame.Star = Star;
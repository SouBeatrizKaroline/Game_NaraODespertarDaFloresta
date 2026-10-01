/**
 * Camera - Smooth scrolling 2D camera with lookahead, subtle screen shake, and cinematic framing
 */

window.LumiGame = window.LumiGame || {};

class Camera {
  constructor(viewportWidth, viewportHeight) {
    this.x = 0;
    this.y = 0;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    
    // Bounds
    this.minX = 0;
    this.maxX = 4600;
    this.minY = -200;
    this.maxY = 900;
    
    // Smooth lerp parameters
    this.lerpSpeed = 0.085;
    this.lookaheadDist = 80;
    this.lookahead = 0;
    
    // Screenshake
    this.shakeIntensity = 0;
    this.shakeDecay = 0.9;
    this.enableShake = true;
    
    // Cinematic override
    this.overrideTarget = null;
    this.isCinematic = false;
  }

  resize(w, h) {
    this.viewportWidth = w;
    this.viewportHeight = h;
  }

  setCinematicTarget(targetX, targetY, speed = 0.03) {
    this.overrideTarget = { x: targetX, y: targetY, speed };
    this.isCinematic = true;
  }

  releaseCinematic() {
    this.overrideTarget = null;
    this.isCinematic = false;
  }

  shake(intensity = 4) {
    if (!this.enableShake) return;
    this.shakeIntensity = Math.min(15, this.shakeIntensity + intensity);
  }

  update(target, dt = 1/60) {
    let targetX, targetY;
    let currentLerp = this.lerpSpeed;

    if (this.isCinematic && this.overrideTarget) {
      targetX = this.overrideTarget.x - this.viewportWidth / 2;
      targetY = this.overrideTarget.y - this.viewportHeight / 2;
      currentLerp = this.overrideTarget.speed || 0.03;
    } else if (target) {
      // Lookahead in movement direction
      const facing = target.facing || 1;
      const targetLook = (target.vx !== 0) ? facing * this.lookaheadDist : 0;
      this.lookahead += (targetLook - this.lookahead) * (1 - Math.pow(0.96, dt * 60));

      targetX = (target.x + target.width / 2 + this.lookahead) - this.viewportWidth / 2;
      targetY = (target.y + target.height / 2) - this.viewportHeight * 0.58;
    } else {
      return;
    }

    // Smooth lerp
    const blend = 1 - Math.pow(1 - currentLerp, dt * 60);
    this.x += (targetX - this.x) * blend;
    this.y += (targetY - this.y) * blend;

    // Apply bounds
    const maxBoundX = Math.max(0, this.maxX - this.viewportWidth);
    const maxBoundY = Math.max(0, this.maxY - this.viewportHeight);
    
    this.x = Math.max(this.minX, Math.min(maxBoundX, this.x));
    this.y = Math.max(this.minY, Math.min(maxBoundY, this.y));

    // Screenshake
    if (this.shakeIntensity > 0.01) {
      this.shakeIntensity *= Math.pow(this.shakeDecay, dt * 60);
    } else {
      this.shakeIntensity = 0;
    }
  }

  getRenderOffsets() {
    let offsetX = 0;
    let offsetY = 0;

    if (this.enableShake && this.shakeIntensity > 0) {
      offsetX = (Math.random() * 2 - 1) * this.shakeIntensity;
      offsetY = (Math.random() * 2 - 1) * this.shakeIntensity;
    }

    return {
      x: Math.round(this.x + offsetX),
      y: Math.round(this.y + offsetY)
    };
  }
}

window.LumiGame.Camera = Camera;
/**
 * Input - Keyboard and Touch controller with multi-touch support
 */

window.LumiGame = window.LumiGame || {};

class Input {
  constructor() {
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;
    this.jump = false;
    this.jumpPressed = false;
    this.interactPressed = false;

    // Internal key states
    this.keys = {};
    this.prevKeys = {};

    // Touch state
    this.touchLeft = false;
    this.touchRight = false;
    this.touchJump = false;
    this.touchJumpPressed = false;
    this.touchAttackPressed = false;

    this.initKeyboard();
    this.checkTouchSupport();
  }

  checkTouchSupport() {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouch) {
      document.body.classList.add('touch-enabled');
    }
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Audio autoplay unlock
      if (window.LumiGame.instance && window.LumiGame.instance.sound) {
        window.LumiGame.instance.sound.resumeIfNeeded();
      }

      if(e.target.closest('button,input,select,textarea') || window.LumiGame.instance?.state !== 'playing' || window.LumiGame.instance?.settingsModal?.isOpen)return;
      const code = e.code;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) {
        e.preventDefault();
      }

      this.keys[code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Clear keys if window loses focus
    window.addEventListener('blur', () => {
      this.keys = {};
      this.touchLeft = false;
      this.touchRight = false;
      this.touchJump = false;
    });
  }

  bindTouchButtons(btnLeft, btnRight, btnJump) {
    if (!btnLeft || !btnRight || !btnJump) return;

    const setupBtn=(btn,onDown,onUp)=>{
      let pointer=null,startY=0;
      btn.style.touchAction='none';
      btn.addEventListener('pointerdown',e=>{if(pointer!==null)return;e.preventDefault();pointer=e.pointerId;startY=e.clientY;btn.setPointerCapture(pointer);btn.classList.add('active');window.LumiGame.instance?.sound.resumeIfNeeded();onDown();});
      btn.addEventListener('pointermove',e=>{if(e.pointerId===pointer&&btn.id==='touch-jump'&&e.clientY-startY>22){this.keys.KeyS=true;this.touchJumpPressed=true;}});
      const release=e=>{if(e.pointerId!==pointer)return;pointer=null;btn.classList.remove('active');this.keys.KeyS=false;onUp();};
      btn.addEventListener('pointerup',release);btn.addEventListener('pointercancel',release);btn.addEventListener('lostpointercapture',release);
    };

    setupBtn(document.getElementById('touch-attack'),()=>{this.touchAttackPressed=true;},()=>{});
    setupBtn(
      btnLeft,
      () => { this.touchLeft = true; },
      () => { this.touchLeft = false; }
    );

    setupBtn(
      btnRight,
      () => { this.touchRight = true; },
      () => { this.touchRight = false; }
    );

    setupBtn(
      btnJump,
      () => {
        this.touchJump = true;
        this.touchJumpPressed = true;
      },
      () => {
        this.touchJump = false;
      }
    );
  }

  reset() {
    this.keys={};this.prevKeys={};this.left=this.right=this.jump=this.jumpPressed=false;
    this.touchLeft=this.touchRight=this.touchJump=this.touchJumpPressed=this.touchAttackPressed=this.attackPressed=false;
    document.querySelectorAll('.touch-btn.active').forEach(b=>b.classList.remove('active'));
  }
  update() {
    // Resolve left/right
    const kLeft = !!(this.keys['ArrowLeft'] || this.keys['KeyA']);
    const kRight = !!(this.keys['ArrowRight'] || this.keys['KeyD']);
    const kUp = !!(this.keys['ArrowUp'] || this.keys['KeyW']);
    const kDown = !!(this.keys['ArrowDown'] || this.keys['KeyS']);
    const kJump = !!(this.keys['Space'] || this.keys['ArrowUp'] || this.keys['KeyW']);

    this.left = kLeft || this.touchLeft;
    this.right = kRight || this.touchRight;
    this.up = kUp;
    this.down = kDown;
    this.jump = kJump || this.touchJump;

    // Single frame press triggers
    const prevJump = !!(this.prevKeys['Space'] || this.prevKeys['ArrowUp'] || this.prevKeys['KeyW']);
    this.jumpPressed = (kJump && !prevJump) || this.touchJumpPressed;
    this.touchJumpPressed = false;

    const kInteract = !!(this.keys['KeyE'] || this.keys['Enter']);
    const prevInteract = !!(this.prevKeys['KeyE'] || this.prevKeys['Enter']);
    this.interactPressed = (kInteract && !prevInteract);

    const attack=!!(this.keys.KeyF||this.keys.KeyJ);
    this.attackPressed=(attack&&!this.prevKeys.KeyF&&!this.prevKeys.KeyJ)||this.touchAttackPressed;
    this.touchAttackPressed=false;
    // Save previous
    this.prevKeys = { ...this.keys };
  }
}

window.LumiGame.Input = Input;
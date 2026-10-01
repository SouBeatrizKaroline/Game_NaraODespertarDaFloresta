window.LumiGame=window.LumiGame||{};
class Game {
  constructor(canvas){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.sound=new LumiGame.SoundManager();this.input=new LumiGame.Input();this.camera=new LumiGame.Camera(canvas.width,canvas.height);this.particleSystem=new LumiGame.ParticleSystem();this.transformSys=new LumiGame.TransformationSystem();this.worldRenderer=new LumiGame.WorldRenderer(canvas);this.hud=new LumiGame.HUD();
    this.time=0;this.isRunning=false;this.state='menu';this.isFreeRoam=false;this.reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.save=this.readSave();this.loadLevel(this.save.current);this.settingsModal=new LumiGame.SettingsModal(this);this.endingScreen=new LumiGame.EndingScreen(this);this.touchControls=new LumiGame.TouchControls(this.input);this.menu=new LumiGame.JourneyMenu(this);
    this.fadeEl=document.getElementById('screen-fade');
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&this.state==='playing')this.menu.pause();});
    window.addEventListener('blur',()=>{if(this.state==='playing')this.menu.pause();});
  }
  emptySave(){return {version:1,current:0,unlocked:0,completed:[],levels:{}};}
  readSave(){
    try{const s=JSON.parse(localStorage.getItem('nara-journey-v1'));if(!s||s.version!==1)return this.emptySave();
      const integer=n=>Number.isInteger(n)&&n>=0&&n<5;
      if(!integer(s.current)||!integer(s.unlocked)||s.current>s.unlocked||!Array.isArray(s.completed)||!s.levels||typeof s.levels!=='object')return this.emptySave();
      s.completed=[...new Set(s.completed.filter(integer))];
      const levels={};for(let i=0;i<5;i++){const data=s.levels[i];if(!data||typeof data!=='object')continue;levels[i]={main:Array.isArray(data.main)?[...new Set(data.main.filter(n=>Number.isInteger(n)&&n>=0&&n<4))]:[],secret:i>=1&&i<=3&&Array.isArray(data.secret)&&data.secret.includes(0)?[0]:[],checkpoint:Number.isInteger(data.checkpoint)&&data.checkpoint>=0&&data.checkpoint<3?data.checkpoint:0};}s.levels=levels;return s;
    }catch{return this.emptySave();}
  }
  persist(){
    const old=this.save.levels[this.level.index]||{};
    this.save.current=this.level.index;
    this.save.levels[this.level.index]={main:this.level.mainStars.filter(s=>s.collected).map(s=>s.id),secret:this.level.secretStars.filter(s=>s.collected).map(s=>s.id),checkpoint:this.level.checkpoints.findIndex(c=>c.x+3===this.player.lastCheckpoint.x)};
    if(this.save.levels[this.level.index].checkpoint<0)this.save.levels[this.level.index].checkpoint=old.checkpoint||0;
    try{localStorage.setItem('nara-journey-v1',JSON.stringify(this.save));this.storageUnavailable=false;}catch{this.storageUnavailable=true;}
  }
  totals(){let main=0,secret=0;for(const data of Object.values(this.save.levels)){main+=Array.isArray(data.main)?new Set(data.main.filter(n=>Number.isInteger(n)&&n>=0&&n<4)).size:0;secret+=Array.isArray(data.secret)&&data.secret.includes(0)?1:0;}return {main,secret};}
  loadLevel(index){
    this.level=new LumiGame.LevelData(index);this.combat=new LumiGame.Combat();this.player=new LumiGame.Lumi(this.level.spawn.x,this.level.spawn.y);this.environmentFX=new LumiGame.EnvironmentFX(this.level.worldWidth);this.particleSystem.particles=[];
    const data=this.save.levels[index]||{};
    for(const star of this.level.mainStars)star.collected=Array.isArray(data.main)&&data.main.includes(star.id);
    for(const star of this.level.secretStars)star.collected=Array.isArray(data.secret)&&data.secret.includes(star.id);
    const cp=this.level.checkpoints[data.checkpoint];if(cp){cp.active=true;this.player.lastCheckpoint={x:cp.x+3,y:456};this.player.respawn();}
    this.camera.releaseCinematic();this.camera.maxX=this.level.worldWidth;this.camera.minY=0;this.camera.maxY=540;this.camera.x=Math.max(0,Math.min(this.level.worldWidth-this.camera.viewportWidth,this.player.x-this.camera.viewportWidth*.45));this.camera.y=0;this.camera.lookahead=0;this.camera.shakeIntensity=0;
    this.endSequenceTriggered=false;this.isFreeRoam=false;this.input.reset();this.updateCounters();this.hud.updateHealth(this.player.health);
  }
  updateCounters(){const found=this.level.mainStars.filter(s=>s.collected).length;this.hud.updateCounters(found,4,this.level.secretStars.filter(s=>s.collected).length,this.level.secretStars.length);const total=this.totals();this.transformSys.updateProgress(total.main,20);if(this.sound)this.sound.transformationStage=Math.floor(this.transformSys.progress*4);}
  start(){if(this.isRunning)return;this.isRunning=true;this.lastTime=performance.now();requestAnimationFrame(t=>this.loop(t));}
  triggerHazardRespawn(){if(this.player.isRespawning)return;this.player.isRespawning=true;this.player.respawnTimer=0;this.sound.playRespawn();if(!this.reducedMotion)this.particleSystem.emitRespawnDissolve(this.player.x+19,this.player.y+22);}
  restartGame(){this.endingScreen.hide();this.save=this.emptySave();this.loadLevel(0);this.persist();this.menu.intro(0);}
  resumeFreeRoam(){this.isFreeRoam=true;this.camera.releaseCinematic();this.state='playing';this.menu.hide();}
  checkStarCollections(){for(const s of [...this.level.mainStars,...this.level.secretStars])if(!s.collected&&LumiGame.Physics.checkOverlap(this.player,s)){s.collect(this.reducedMotion?null:this.particleSystem,this.sound);this.player.triggerCelebration(s.isSecret);this.camera.shake(s.isSecret?4:2);s.isSecret?this.hud.bumpSecretCounter():this.hud.bumpMainCounter();this.persist();this.updateCounters();}}
  checkAncestralTreeClimax(){
    if(this.endSequenceTriggered||this.isFreeRoam||this.player.isRespawning)return;
    if(this.level.enemies.some(e=>e.type==='boss'&&!e.defeated))return;
    if(this.level.mainStars.every(s=>s.collected)&&Math.abs(this.player.x+19-this.level.gate.x)<45&&this.player.onGround){
      this.endSequenceTriggered=true;
      if(!this.save.completed.includes(this.level.index))this.save.completed.push(this.level.index);
      this.save.unlocked=Math.max(this.save.unlocked,Math.min(4,this.level.index+1));this.persist();
      if(this.level.index===4){this.state='ending';this.endingScreen.startSequence();}else this.menu.chapterComplete();
    }
  }
  update(dt){
    this.input.update();if(this.settingsModal.isOpen)return;
    if(this.state==='ending'){this.time+=dt;this.endingScreen.update(dt);this.particleSystem.update(dt);this.camera.update(null,dt);return;}
    if(this.state!=='playing')return;
    this.time+=dt;
    // Fixed substeps keep collision and jump behavior stable on slow devices.
    const steps=Math.ceil(dt/(1/120));const step=dt/steps;
    for(let i=0;i<steps;i++){
      if(i){this.input.jumpPressed=false;this.input.attackPressed=false;}
      const wasRespawning=this.player.isRespawning;this.player.update(step,this.input,this.sound);
      if(wasRespawning){if(!this.player.isRespawning){this.combat.projectiles=[];for(const e of this.level.enemies)if(e.type==='boss'&&!e.defeated){e.health=e.maxHealth;e.cooldown=1.4;e.windup=0;e.stun=0;}}continue;}
      LumiGame.Physics.resolveHorizontal(this.player,this.level.platforms);LumiGame.Physics.resolveVertical(this.player,this.level.platforms,step,this.player.droppedOneWay);
      this.player.x=Math.max(0,Math.min(this.level.worldWidth-this.player.width,this.player.x));
      const bounced=LumiGame.Physics.checkMushroomBounce(this.player,this.level.mushrooms);if(bounced){this.player.bounceGrace=.35;this.sound.playMushroomBounce();}
      if(LumiGame.Physics.checkHazard(this.player,this.level.hazards)||this.player.y>620){this.triggerHazardRespawn();continue;}
      for(const cp of this.level.checkpoints){const active=cp.active;cp.update(step,this.player,this.sound,this.reducedMotion?null:this.particleSystem);if(!active&&cp.active){this.player.health=3;this.player.invulnerable=1.2;this.persist();}}
      this.combat.update(step,this.player,this.level,this.sound,this.reducedMotion?null:this.particleSystem);
      if(this.player.isRespawning)continue;
      this.checkStarCollections();this.checkAncestralTreeClimax();if(this.state!=='playing')break;
    }
    for(const s of [...this.level.mainStars,...this.level.secretStars]){if(this.reducedMotion){s.isDisappearing=false;s.y=s.baseY;}else s.update(dt,this.time);}
    for(const m of this.level.mushrooms)m.squishTime=Math.max(0,m.squishTime-dt);
    this.player.setFurColor(this.transformSys.progress>=.6?'#e5e9e6':this.level.index===0&&this.transformSys.progress<.15?'#454c61':'#929ca9');
    this.player.syncAnimation();this.hud.updateHealth(this.player.health);this.particleSystem.update(dt);this.camera.update(this.player,dt);
  }
  draw(){this.worldRenderer.render(this.level,this.player,this.camera,this.environmentFX,this.transformSys,this.particleSystem,this.reducedMotion?0:this.time,this.combat);}
  loop(t){if(!this.isRunning)return;const dt=Math.min(.05,Math.max(0,(t-this.lastTime)/1000));this.lastTime=t;this.update(dt);this.draw();requestAnimationFrame(time=>this.loop(time));}
}
window.LumiGame.Game=Game;

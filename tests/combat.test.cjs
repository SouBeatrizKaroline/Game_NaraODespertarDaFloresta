const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context=vm.createContext({window:{LumiGame:{}},Math});
for(const file of ['engine/Physics','entities/Lumi','entities/Star','entities/Checkpoint','entities/Enemy','engine/Combat','world/LevelData'])vm.runInContext(fs.readFileSync(`js/${file}.js`,'utf8'),context);
const {Lumi,Combat,Enemy,LevelData}=context.window.LumiGame;
const input={left:false,right:false,jump:false,jumpPressed:false,attackPressed:false};
test('chapters introduce increasing enemy counts and distinct behaviors',()=>{
  const chapters=Array.from({length:5},(_,i)=>new LevelData(i));
  assert.deepEqual(chapters.map(c=>c.enemies.length),[1,3,4,5,6]);
  assert.equal(chapters[0].enemies[0].maxHealth,1);
  assert.ok(chapters[3].enemies.some(e=>e.maxHealth>=2));
  assert.ok(chapters[4].enemies.some(e=>e.type==='boss'));
  for(const level of chapters)for(const enemy of level.enemies){
    for(const cp of level.checkpoints)assert.ok(Math.abs(enemy.x-cp.x)>75,'encounter separated from shrine');
    if(!['wisp'].includes(enemy.type))assert.ok(level.platforms.some(p=>!p.isOneWay&&enemy.minX>=p.x&&enemy.maxX+enemy.width<=p.x+p.width),'ground patrol cannot cross a gap');
  }
});
test('light attack has a cooldown and hits once per swing, only in front',()=>{
  const p=new Lumi(200,456);p.facing=1;p.update(1/120,{...input,attackPressed:true});
  const front=new Enemy({type:'shooter',x:260,y:452}),back=new Enemy({type:'shooter',x:140,y:452});
  const level={enemies:[front,back],platforms:[],worldWidth:2200},combat=new Combat();
  for(let i=0;i<8;i++)combat.update(1/120,p,level);
  assert.equal(front.health,2);assert.equal(back.health,3);
  const id=p.attackId;p.update(1/120,{...input,attackPressed:true});assert.equal(p.attackId,id);
  for(let i=0;i<60;i++)p.update(1/120,input);
  p.update(1/120,{...input,attackPressed:true});assert.equal(p.attackId,id+1);
});
test('contact damage grants protection and death restores health at checkpoint',()=>{
  const p=new Lumi(200,456),combat=new Combat();
  assert.equal(combat.hurt(p,260),true);assert.equal(p.health,2);
  assert.equal(combat.hurt(p,260),false);assert.equal(p.health,2);
  p.invulnerable=0;combat.hurt(p,260);p.invulnerable=0;combat.hurt(p,260);
  assert.equal(p.isRespawning,true);assert.equal(p.health,0);
  p.lastCheckpoint={x:700,y:456};for(let i=0;i<60;i++)p.update(1/120,input);
  assert.equal(p.x,700);assert.equal(p.health,3);assert.ok(p.invulnerable>0);
});
test('stomping purifies small enemies but not armored sentinels',()=>{
  const p=new Lumi(200,425);p.vy=200;
  const crawler=new Enemy({type:'crawler',x:200,y:468,minX:200,maxX:200,speed:0});
  const combat=new Combat();combat.update(1/60,p,{enemies:[crawler],platforms:[],worldWidth:2200});
  assert.equal(crawler.defeated,true);assert.ok(p.vy<0);assert.equal(p.health,3);
  const armor=new Enemy({type:'shooter',x:200,y:452});p.y=412;p.vy=200;
  combat.update(1/60,p,{enemies:[armor],platforms:[],worldWidth:2200});
  assert.equal(armor.health,3);assert.equal(p.health,2);
});
test('reflected projectiles damage their source and expire',()=>{
  const p=new Lumi(200,456);p.facing=1;p.attackTimer=.22;p.attackId=1;
  const enemy=new Enemy({type:'shooter',x:340,y:452});const combat=new Combat();
  const level={enemies:[enemy],platforms:[],worldWidth:2200};
  combat.projectiles.push({x:280,y:467,width:12,height:12,vx:-150,vy:0,life:4,reflected:false,owner:enemy});
  combat.update(1/120,p,level);assert.equal(combat.projectiles[0].reflected,true);
  p.attackTimer=0;for(let i=0;i<40;i++)combat.update(1/120,p,level);
  assert.equal(enemy.health,1);assert.equal(combat.projectiles.length,0);
});
test('boss telegraphs shots and adds a faster three-shot phase at half health',()=>{
  const boss=new Enemy({type:'boss',x:1900,y:412,minX:1900,maxX:1900},4),p=new Lumi(1750,456),shots=[];
  boss.cooldown=.6;boss.update(.1,p,shots);assert.ok(boss.windup>0);assert.equal(shots.length,0);
  boss.update(.6,p,shots);assert.equal(shots.length,2);const phaseOneDelay=boss.cooldown;
  boss.health=6;boss.cooldown=.1;shots.length=0;boss.update(.2,p,shots);
  assert.equal(shots.length,3);assert.ok(boss.cooldown<phaseOneDelay);
});
test('boss armor blocks direct swings during its telegraphed charge',()=>{
  const p=new Lumi(1800,456);p.attackTimer=.22;p.attackId=1;
  const boss=new Enemy({type:'boss',x:1870,y:412,minX:1870,maxX:1870},4);
  boss.cooldown=.2;const combat=new Combat(),level={enemies:[boss],platforms:[],worldWidth:2200};
  combat.update(1/120,p,level);assert.equal(boss.health,12);
  boss.damage(2);assert.equal(boss.health,10,'reflected damage still penetrates armor');
});
test('animation states distinguish locomotion, jump, attack, hurt and landing',()=>{
  const p=new Lumi(90,456);p.onGround=true;p.syncAnimation();assert.equal(p.state,'LAND');
  p.landing=0;p.syncAnimation();assert.equal(p.state,'IDLE');
  p.vx=230;p.syncAnimation();assert.equal(p.state,'RUN');
  p.onGround=false;p.vy=-300;p.syncAnimation();assert.equal(p.state,'RISE');
  p.vy=200;p.syncAnimation();assert.equal(p.state,'FALL');
  p.attackTimer=.2;p.syncAnimation();assert.equal(p.state,'ATTACK');
  p.hurtTimer=.2;p.syncAnimation();assert.equal(p.state,'HURT');
});
test('a dormant hopper still warns the player before its first leap',()=>{
  const enemy=new Enemy({type:'hopper',x:1500,y:468,minX:1430,maxX:1710},1),p=new Lumi(90,456);
  for(let i=0;i<600;i++)enemy.update(1/60,p,[]);
  p.x=1400;enemy.update(1/60,p,[]);assert.equal(enemy.vy,0);
  for(let i=0;i<65;i++)enemy.update(1/60,p,[]);
  assert.ok(enemy.windup>0);assert.equal(enemy.vy,0);
});

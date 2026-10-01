const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context=vm.createContext({window:{LumiGame:{}},Math,document:{}});
for(const file of ['engine/Physics','entities/Lumi','entities/Star','entities/Checkpoint','entities/Enemy','engine/Combat','world/LevelData'])
  vm.runInContext(fs.readFileSync(`js/${file}.js`,'utf8'),context);
const {Physics,Lumi,Star,LevelData}=context.window.LumiGame;
function step(p,level,input,dt=1/120){
  p.update(dt,{left:false,right:false,jump:false,jumpPressed:false,down:false,...input});
  Physics.resolveHorizontal(p,level.platforms);
  Physics.resolveVertical(p,level.platforms,dt,p.droppedOneWay);
  const bounce=Physics.checkMushroomBounce(p,level.mushrooms);
  if(bounce)p.bounceGrace=.35;
}
test('collection counts immediately while disappearance completes',()=>{
  const s=new Star(0,0);s.collect();assert.equal(s.collected,true);assert.equal(s.isDisappearing,true);
  s.update(.4,1);assert.equal(s.isDisappearing,false);
});
test('ground contact remains stable and variable jump changes height',()=>{
  const level=new LevelData(0),p=new Lumi(90,456);
  for(let i=0;i<600;i++)step(p,level,{});
  assert.equal(p.y,456);assert.equal(p.onGround,true);
  const peak=held=>{const n=new Lumi(90,456);n.onGround=true;let min=n.y;
    for(let i=0;i<150;i++){step(n,level,{jump:held||i===0,jumpPressed:i===0});min=Math.min(min,n.y);}return min;};
  assert.ok(peak(true)<peak(false)-70);
});
test('buffered and coyote jumps work, intentional drop crosses a branch',()=>{
  const level=new LevelData(0),p=new Lumi(450,356);p.onGround=true;p.currentPlatform=level.platforms[1];
  step(p,level,{down:true,jump:true,jumpPressed:true});
  for(let i=0;i<35;i++)step(p,level,{});
  assert.ok(p.y>380);
  const n=new Lumi(90,456);n.onGround=true;step(n,level,{});n.onGround=false;
  step(n,level,{jump:true,jumpPressed:true});assert.ok(n.vy<0);
  const b=new Lumi(90,453);b.vy=60;step(b,level,{jump:true,jumpPressed:true});
  for(let i=0;i<6;i++)step(b,level,{jump:true});assert.ok(b.vy<0);
});
test('automatic mushroom launch is not cancelled by releasing jump',()=>{
  const level=new LevelData(1),p=new Lumi(410,430);p.vy=100;
  let bounced=false;
  for(let i=0;i<25;i++){step(p,level,{});if(p.bounceGrace>0)bounced=true;}
  assert.ok(bounced);assert.ok(p.y<350);
});
test('all chapter collectibles and exit are reachable with the actual physics',()=>{
  for(let index=0;index<5;index++){
    const level=new LevelData(index),reachable=new Set([0]),seen=new Set(),hits=new Set();
    // Explore real jump trajectories from reachable permanent surfaces.
    // Sample launch points and both walking directions; no teleport to targets.
    for(let pass=0;pass<8;pass++){
      for(const source of [...reachable]){
        if(seen.has(source))continue;seen.add(source);
        const platform=level.platforms[source];
        for(let x=platform.x+2;x<platform.x+platform.width-36;x+=20)
          for(const dir of [-1,0,1])for(const launch of [false,true]){
            const p=new Lumi(x,platform.y-44);p.vx=dir*250;p.onGround=true;p.currentPlatform=platform;
            for(let frame=0;frame<200;frame++){
              step(p,level,{left:dir===-1,right:dir===1,jump:launch,jumpPressed:launch&&frame===0});
              if(p.x<0||p.x>2162||p.y>550)break;
              for(const s of [...level.mainStars,...level.secretStars])if(Physics.checkOverlap(p,s))hits.add((s.isSecret?'secret':'main')+s.id);
              if(p.onGround){const landing=level.platforms.indexOf(p.currentPlatform);reachable.add(landing);}
            }
          }
      }
    }
    for(const s of level.mainStars)assert.ok(hits.has('main'+s.id),`chapter ${index+1}: required ${s.id}`);
    for(const s of level.secretStars)assert.ok(hits.has('secret'+s.id),`chapter ${index+1}: secret ${s.id}`);
    assert.ok([...reachable].some(i=>{const p=level.platforms[i];return p.x<=level.gate.x&&p.x+p.width>level.gate.x;}),`chapter ${index+1}: exit`);
    for(const cp of level.checkpoints)assert.ok(level.platforms.some(p=>!p.isOneWay&&cp.x>=p.x&&cp.x+cp.width<=p.x+p.width),'checkpoint on safe ground');
  }
});

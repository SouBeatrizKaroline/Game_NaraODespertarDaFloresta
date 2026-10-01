const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.NARA_BROWSER?{executablePath:process.env.NARA_BROWSER}:{})});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));await page.goto(process.argv[2]||'http://127.0.0.1:8123');
    await page.locator('[data-action="continue"]').click();await page.locator('[data-action="play"]').click();
    await page.evaluate(()=>{LumiGame.instance.isRunning=false;});
    // Use keyboard input through the real game loop, not direct enemy damage.
    const swing=await page.evaluate(()=>{
      const g=LumiGame.instance,e=g.level.enemies[0];
      g.player.x=e.x-90;g.player.y=456;g.player.facing=1;g.player.invulnerable=0;g.input.keys.KeyF=true;
      g.update(1/60);g.draw();return {attack:g.player.attackId,defeated:e.defeated};
    });
    assert.deepEqual(swing,{attack:1,defeated:true});
    const health=await page.evaluate(()=>{
      const g=LumiGame.instance;g.loadLevel(2);g.state='playing';const e=g.level.enemies[0];
      g.player.x=e.x+3;g.player.y=456;g.player.invulnerable=0;g.update(1/60);
      const first=g.player.health;g.update(1/60);return {first,second:g.player.health,hud:document.getElementById('hud-health').getAttribute('aria-label')};
    });
    assert.deepEqual(health,{first:2,second:2,hud:'2 de 3 corações'});
    const gate=await page.evaluate(()=>{
      const g=LumiGame.instance;g.loadLevel(4);g.state='playing';for(const s of g.level.mainStars)s.collected=true;
      g.player.x=g.level.gate.x-19;g.player.y=456;g.player.invulnerable=2;g.update(1/60);return g.state;
    });
    assert.equal(gate,'playing','living boss blocks the ending even with all fragments');
    // Fight the actual boss using spacing and attacks, with normal health and projectiles.
    const battle=await page.evaluate(()=>{
      const g=LumiGame.instance;g.loadLevel(4);g.state='playing';const boss=g.level.enemies.find(e=>e.type==='boss');
      for(const e of g.level.enemies)if(e!==boss){e.defeated=true;e.fade=0;}
      g.player.x=1775;g.player.y=456;g.player.invulnerable=0;
      let phaseTwo=false,deaths=0,previousRespawn=false;
      for(let i=0;i<3600&&!boss.defeated;i++){
        const gap=boss.x-g.player.x;
        g.input.keys.KeyD=gap>95;g.input.keys.KeyA=gap<75;
        // Face the threat before a swing; the preceding controls still move Nara normally.
        if(!g.input.keys.KeyA)g.player.facing=1;
        g.input.keys.KeyF=i%24===0;
        g.update(1/60);
        if(boss.health<=6)phaseTwo=true;
        if(g.player.isRespawning&&!previousRespawn)deaths++;
        previousRespawn=g.player.isRespawning;
      }
      g.draw();return {defeated:boss.defeated,phaseTwo,deaths,health:g.player.health};
    });
    assert.equal(battle.defeated,true,'normal-health spacing bot can complete the boss encounter');
    assert.equal(battle.phaseTwo,true);
    await page.evaluate(()=>{const g=LumiGame.instance;for(const s of g.level.mainStars)s.collected=true;g.player.x=g.level.gate.x-19;g.player.y=456;g.player.vx=g.player.vy=0;g.update(1/60);});
    assert.equal(await page.evaluate(()=>LumiGame.instance.state),'ending');
    const idleDanger=await page.evaluate(()=>{
      const g=LumiGame.instance;g.loadLevel(4);g.state='playing';g.player.x=1775;g.player.y=456;g.player.invulnerable=0;
      const boss=g.level.enemies.find(e=>e.type==='boss');for(const e of g.level.enemies)if(e!==boss)e.defeated=true;
      let minimumHealth=3;
      for(let i=0;i<720;i++){g.update(1/60);minimumHealth=Math.min(minimumHealth,g.player.health);if(g.player.isRespawning)break;}
      return {minimumHealth,respawning:g.player.isRespawning};
    });
    assert.equal(idleDanger.respawning,true,'ignoring boss attacks is lethal');
    // Verify enemy behavior and shots stop in pause.
    const pause=await page.evaluate(()=>{const g=LumiGame.instance;g.loadLevel(3);g.state='playing';g.player.x=1200;g.player.y=456;g.player.invulnerable=10;for(let i=0;i<120;i++)g.update(1/60);g.menu.pause();const before=JSON.stringify({enemies:g.level.enemies.map(e=>[e.x,e.y,e.cooldown]),shots:g.combat.projectiles});for(let i=0;i<120;i++)g.update(1/60);return before===JSON.stringify({enemies:g.level.enemies.map(e=>[e.x,e.y,e.cooldown]),shots:g.combat.projectiles});});
    assert.equal(pause,true);
    const mobile=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
    mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto(process.argv[2]||'http://127.0.0.1:8123');
    await mobile.locator('[data-action="continue"]').click();await mobile.locator('[data-action="play"]').click();
    await mobile.getByRole('button',{name:'Ataque de luz',exact:true}).tap();await mobile.waitForTimeout(80);
    assert.equal(await mobile.evaluate(()=>LumiGame.instance.player.attackId),1);
    assert.ok(await mobile.locator('#touch-jump').isVisible());
    if(process.env.NARA_SCREENSHOTS){fs.mkdirSync(process.env.NARA_SCREENSHOTS,{recursive:true});await mobile.screenshot({path:process.env.NARA_SCREENSHOTS+'/nara-combate-mobile.png'});}
    assert.deepEqual(errors,[]);
    console.log('PASS: keyboard attack, contact damage and protection, boss blocks ending, real boss fight and second phase, pause freezes combat, touch attack, no browser errors. Boss battle: '+JSON.stringify(battle));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

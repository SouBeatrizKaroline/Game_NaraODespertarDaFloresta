// Run with Playwright available: node tests/browser-flow.cjs http://127.0.0.1:8123
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const url=process.argv[2]||'http://127.0.0.1:8123';
const screenshotDir=process.env.NARA_SCREENSHOTS;
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.NARA_BROWSER?{executablePath:process.env.NARA_BROWSER}:{})});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url);
    const shot=async name=>{if(screenshotDir){fs.mkdirSync(screenshotDir,{recursive:true});await page.screenshot({path:screenshotDir+'/'+name+'.png'});}};
    await page.getByRole('button',{name:'Capítulos',exact:true}).click();
    assert.equal(await page.locator('.chapter-row:disabled').count(),4);
    await page.getByRole('button',{name:'Voltar ao menu',exact:true}).click();
    await shot('menu-nara');
    await page.locator('[data-action="continue"]').click();
    await page.getByRole('button',{name:'Entrar na floresta →',exact:true}).click();
    const start=await page.evaluate(()=>LumiGame.instance.player.x);
    await page.keyboard.down('ArrowRight');await page.waitForTimeout(600);await page.keyboard.up('ArrowRight');
    assert.ok(await page.evaluate(()=>LumiGame.instance.player.x)>start+60,'keyboard moves Nara');
    await page.keyboard.press('Escape');
    const paused=await page.evaluate(()=>LumiGame.instance.player.x);await page.waitForTimeout(200);
    assert.equal(await page.evaluate(()=>LumiGame.instance.player.x),paused,'pause freezes physics');
    await page.getByRole('button',{name:'Configurações',exact:true}).click();
    await page.getByRole('checkbox',{name:'Reduzir movimento',exact:true}).check();
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(()=>LumiGame.instance.state),'paused');
    await page.getByRole('button',{name:'Continuar',exact:true}).click();
    await page.getByRole('button',{name:'Configurações',exact:true}).click();
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'game-canvas','HUD settings restores gameplay focus');
    await page.getByRole('button',{name:'Som',exact:true}).click();
    assert.equal(await page.evaluate(()=>document.activeElement.id),'game-canvas','sound button restores gameplay focus');
    await page.evaluate(()=>{LumiGame.instance.isRunning=false;});
    await shot('bosque-nara');
    // Chapter state transitions are exercised with controlled fixtures.
    // Reachability is independently tested against real jump trajectories.
    for(let index=0;index<5;index++){
      const result=await page.evaluate(index=>{
        const g=LumiGame.instance;if(g.level.index!==index)throw Error('Wrong chapter');
        const cp=g.level.checkpoints[1];g.player.x=cp.x+3;g.player.y=456;g.player.vy=0;g.update(1/60);
        g.player.y=600;g.update(1/60);for(let n=0;n<60;n++)g.update(1/60);
        if(g.player.isRespawning||Math.abs(g.player.x-(cp.x+3))>1)throw Error('Respawn failed');
        for(const s of [...g.level.mainStars,...g.level.secretStars]){g.player.x=s.x;g.player.y=s.y;g.player.vx=g.player.vy=0;g.update(1/60);}
        return {count:document.getElementById('hud-main-stars').textContent,saved:g.save.levels[index].main.length};
      },index);
      assert.deepEqual(result,{count:'4/4',saved:4});
      await shot('capitulo-'+(index+1));
      if(index===2){await page.reload();await page.getByRole('button',{name:'Continuar jornada',exact:true}).click();await page.getByRole('button',{name:'Entrar na floresta →',exact:true}).click();await page.evaluate(()=>LumiGame.instance.isRunning=false);assert.equal(await page.locator('#hud-main-stars').textContent(),'4/4');assert.equal(await page.evaluate(()=>LumiGame.instance.reducedMotion),true);}
      await page.evaluate(()=>{const g=LumiGame.instance;g.player.x=g.level.gate.x-19;g.player.y=456;g.player.vx=g.player.vy=0;g.update(1/60);});
      if(index<4){assert.equal(await page.evaluate(()=>LumiGame.instance.state),'chapter-complete');await page.getByRole('button',{name:'Seguir a luz →',exact:true}).click();await page.getByRole('button',{name:'Entrar na floresta →',exact:true}).click();}
    }
    await page.evaluate(()=>{const g=LumiGame.instance;for(let i=0;i<300;i++)g.update(1/60);g.draw();});
    assert.equal(await page.locator('#ending-stat-main').textContent(),'Fragmentos devolvidos: 20/20');
    assert.equal(await page.locator('#ending-stat-secret').textContent(),'Memórias encontradas: 3/3');
    assert.ok(await page.evaluate(()=>Number.isFinite(LumiGame.instance.camera.x)&&Number.isFinite(LumiGame.instance.camera.y)));
    await shot('final-nara');
    await page.getByRole('button',{name:'Jogar novamente',exact:true}).click();
    await page.getByRole('button',{name:'Voltar',exact:true}).click();
    assert.ok(await page.locator('#ending-screen').evaluate(e=>e.classList.contains('active')));
    await page.getByRole('button',{name:'Revisitar os capítulos',exact:true}).click();
    assert.equal(await page.locator('.chapter-row:disabled').count(),0);
    await page.locator('[data-action="level-1"]').click();await page.getByRole('button',{name:'Entrar na floresta →',exact:true}).click();
    await page.keyboard.press('Escape');await page.getByRole('button',{name:'Menu principal',exact:true}).click();
    await page.getByRole('button',{name:'Nova jornada',exact:true}).click();await page.getByRole('button',{name:'Recomeçar',exact:true}).click();
    assert.equal(await page.evaluate(()=>LumiGame.instance.save.unlocked),0);
    assert.equal(await page.evaluate(()=>LumiGame.instance.totals().main),0);
    await page.getByRole('button',{name:'Entrar na floresta →',exact:true}).click();
    await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
    await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
    assert.equal(await page.evaluate(()=>LumiGame.instance.state),'paused');
    // Small screen, touch bindings, and release on pointer cancellation.
    const mobile=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
    mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto(url);
    await mobile.getByRole('button',{name:'Começar jornada',exact:true}).click();await mobile.getByRole('button',{name:'Entrar na floresta →',exact:true}).click();
    assert.ok(await mobile.locator('#touch-controls').isVisible());
    const box=await mobile.locator('#touch-right').boundingBox();await mobile.mouse.move(box.x+box.width/2,box.y+box.height/2);await mobile.mouse.down();
    await mobile.waitForTimeout(100);await mobile.locator('#touch-right').dispatchEvent('pointercancel',{pointerId:1,pointerType:'touch'});
    await mobile.mouse.up();assert.equal(await mobile.evaluate(()=>LumiGame.instance.input.touchRight),false);
    if(screenshotDir)await mobile.screenshot({path:screenshotDir+'/mobile-nara.png'});
    await mobile.evaluate(()=>{localStorage.setItem('nara-journey-v1','{"version":1,"current":999}');});await mobile.reload();
    assert.equal(await mobile.evaluate(()=>LumiGame.instance.save.current),0,'invalid save resets safely');
    const restricted=await browser.newPage();
    restricted.on('pageerror',e=>errors.push(e.message));
    await restricted.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('Storage blocked','SecurityError');};});
    await restricted.goto(url);await restricted.locator('[data-action="continue"]').click();
    await restricted.getByRole('button',{name:'Entrar na floresta →',exact:true}).click();
    assert.equal(await restricted.evaluate(()=>LumiGame.instance.state),'playing','blocked storage does not prevent play');
    assert.deepEqual(errors,[]);console.log('PASS: menus, keyboard, pause, settings, checkpoints, all chapter transitions, save/reload, finale, replay, reset, mobile, invalid save; no browser errors.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

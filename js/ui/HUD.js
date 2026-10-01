window.LumiGame=window.LumiGame||{};
class HUD {
 constructor(){this.mainCounterEl=document.getElementById('hud-main-stars');this.secretCounterEl=document.getElementById('hud-secret-stars');}
 updateCounters(main,total,secret,secretTotal){this.mainCounterEl.textContent=main+'/'+total;this.secretCounterEl.textContent=secret+'/'+secretTotal;document.getElementById('hud-pill-secret').hidden=secretTotal===0;document.getElementById('hud-progress-fill').style.width=main/total*100+'%';}
 bumpMainCounter(){this.bump('hud-pill-main');} bumpSecretCounter(){this.bump('hud-pill-secret');}
 bump(id){const el=document.getElementById(id);el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}
 setZone(){} showToast(){} // Narrative lives only in chapter cards, never over gameplay.
}
window.LumiGame.HUD=HUD;

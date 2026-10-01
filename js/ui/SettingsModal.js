window.LumiGame=window.LumiGame||{};
class SettingsModal {
 constructor(game){this.game=game;this.modalEl=document.getElementById('settings-modal');this.isOpen=false;this.preferences={reduce:game.reducedMotion,shake:true,contrast:false,music:.55,sfx:.75};try{const p=JSON.parse(localStorage.getItem('nara-settings-v1'));if(p&&typeof p==='object')for(const key of Object.keys(this.preferences)){if(typeof p[key]===typeof this.preferences[key])this.preferences[key]=typeof p[key]==='number'?Math.max(0,Math.min(1,p[key])):p[key];}}catch{}
  const fields={'toggle-reduce-motion':'reduce','toggle-screen-shake':'shake','toggle-high-contrast':'contrast','slider-music-volume':'music','slider-sfx-volume':'sfx'};
  for(const [id,key] of Object.entries(fields)){const input=document.getElementById(id);if(input.type==='checkbox')input.checked=this.preferences[key];else input.value=this.preferences[key];input.addEventListener(input.type==='range'?'input':'change',()=>{this.preferences[key]=input.type==='checkbox'?input.checked:Number(input.value);this.apply();try{localStorage.setItem('nara-settings-v1',JSON.stringify(this.preferences));}catch{}});}
  document.getElementById('btn-settings').onclick=()=>this.open();document.getElementById('btn-close-settings').onclick=()=>this.close();this.modalEl.onclick=e=>{if(e.target===this.modalEl)this.close();};this.apply();
 }
 apply(){const p=this.preferences;this.game.reducedMotion=p.reduce;document.body.classList.toggle('reduce-motion',p.reduce);document.body.classList.toggle('high-contrast',p.contrast);this.game.camera.enableShake=p.shake&&!p.reduce;this.game.sound.setMusicVolume(p.music);this.game.sound.setSfxVolume(p.sfx);}
 open(){if(this.isOpen)return;this.previousFocus=document.activeElement;this.isOpen=true;this.game.input.reset();this.modalEl.inert=false;this.modalEl.classList.add('open');document.getElementById('btn-close-settings').focus();}
 close(){this.isOpen=false;this.modalEl.classList.remove('open');this.modalEl.inert=true;this.game.input.reset();if(this.game.state==='playing')this.game.canvas.focus();else this.previousFocus?.focus();}
}
window.LumiGame.SettingsModal=SettingsModal;

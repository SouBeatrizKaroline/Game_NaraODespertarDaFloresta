/**
 * Main - Game entry point and window lifecycle
 */

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  function resizeCanvas() {
    const container = document.getElementById('game-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderH=540;
    const renderW=Math.max(360,Math.min(960,Math.round(renderH*width/Math.max(1,height))));
    canvas.width=renderW;canvas.height=renderH;
    if(window.LumiGame.instance?.camera)window.LumiGame.instance.camera.resize(renderW,renderH);

  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Initialize Game Instance
  const game = new window.LumiGame.Game(canvas);
  window.LumiGame.instance = game;

  // Sound Button Hook
  const btnSound = document.getElementById('btn-sound');
  if (btnSound) {
    btnSound.addEventListener('click', () => {
      game.sound.resumeIfNeeded();
      const isMuted = game.sound.toggleMute();
      btnSound.textContent = isMuted ? '🔇' : '🎵';
      btnSound.title = isMuted ? 'Desmutar Som' : 'Mutar Som';
      btnSound.setAttribute('aria-pressed',String(isMuted));
      if(game.state==='playing')game.canvas.focus();
    });
  }

  // Audio Context unlock on first interaction
  const unlockAudio = () => {
    game.sound.resumeIfNeeded();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);

  // Start the game!
  game.start();
});
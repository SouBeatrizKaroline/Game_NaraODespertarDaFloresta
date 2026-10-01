/**
 * SoundManager - Procedural Web Audio API Synthesizer
 * Provides soothing, fairy-tale ambient music and delicate sound effects
 * Zero external audio dependencies for 100% reliable offline playback.
 */

window.LumiGame = window.LumiGame || {};

class SoundManager {
  constructor() {
    this.ctx = null;
    this.musicVolume = 0.55;
    this.sfxVolume = 0.75;
    this.isMuted = false;
    this.initialized = false;
    
    // Music state
    this.isPlayingMusic = false;
    this.musicTimer = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.masterGain = null;
    
    // Transformation stage affects music richness (0 to 4)
    this.transformationStage = 0; 
    
    // Scales: Ethereal Lydian / Pentatonic in D Major (D, E, F#, G#, A, B, C#)
    this.baseFrequencies = [
      146.83, // D3
      185.00, // F#3
      220.00, // A3
      277.18, // C#4
      293.66, // D4
      329.63, // E4
      369.99, // F#4
      415.30, // G#4
      440.00, // A4
      493.88, // B4
      554.37, // C#5
      587.33, // D5
      659.25, // E5
      739.99, // F#5
      880.00  // A5
    ];
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.ctx = new AudioContext();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
      
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
      
      this.initialized = true;
      this.startAmbientMusic();
    } catch (e) {
      console.warn('AudioContext failed to initialize:', e);
    }
  }

  resumeIfNeeded() {
    if (!this.initialized) {
      this.init();
    } else if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMusicVolume(val) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
    }
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 1.0, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  setForestProgress(pct) {
    // 0%, 25%, 50%, 75%, 100%
    if (pct >= 1.0) this.transformationStage = 4;
    else if (pct >= 0.75) this.transformationStage = 3;
    else if (pct >= 0.50) this.transformationStage = 2;
    else if (pct >= 0.25) this.transformationStage = 1;
    else this.transformationStage = 0;
  }

  // --- AMBIENT PROCEDURAL MUSIC ENGINE ---
  startAmbientMusic() {
    if (!this.ctx || this.isPlayingMusic) return;
    this.isPlayingMusic = true;
    
    // Play warm background chord pad
    this.schedulePadNote();
    
    // Play gentle random melody notes on celesta/kalimba
    this.scheduleMelodyNote();
  }

  schedulePadNote() {
    if (!this.isPlayingMusic || !this.ctx) return;
    
    const now = this.ctx.currentTime;
    const padChordRoot = [146.83, 164.81, 185.00, 220.00][Math.floor(Math.random() * 4)];
    const freqs = [padChordRoot, padChordRoot * 1.5, padChordRoot * 2.0];
    
    // Add harmonic fifth or octave depending on progress
    if (this.transformationStage >= 2) freqs.push(padChordRoot * 2.5);
    if (this.transformationStage >= 3) freqs.push(padChordRoot * 3.0);

    freqs.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320 + this.transformationStage * 120, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.045 + this.transformationStage * 0.015, now + 2.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 7.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 8.0);
    });

    const nextTime = (5.5 + Math.random() * 2.0) * 1000;
    setTimeout(() => this.schedulePadNote(), nextTime);
  }

  scheduleMelodyNote() {
    if (!this.isPlayingMusic || !this.ctx) return;

    const now = this.ctx.currentTime;
    // Choose delicate note from high frequencies
    const notePool = this.baseFrequencies.slice(4);
    const freq = notePool[Math.floor(Math.random() * notePool.length)];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.04, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + 2.0);

    // Rhythm adapts with transformation stage
    const baseDelay = Math.max(1200, 3200 - this.transformationStage * 450);
    const nextTime = baseDelay + Math.random() * 1200;
    setTimeout(() => this.scheduleMelodyNote(), nextTime);
  }

  // --- SOUND EFFECTS ---

  playFootstep() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160 + Math.random() * 30, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  playJump() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.16);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  playLand() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  playStarCollect() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Ascending fairy arpeggio: C6, E6, G6, B6, C7
    const notes = [1046.50, 1318.51, 1567.98, 1975.53, 2093.00];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.09, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  playSecretStar() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Deep, mysterious chord with glittering top bells
    const chord = [440, 554.37, 659.25, 880, 1318.51, 1760];

    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.04;

      osc.type = (idx < 3) ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 1.3);
    });
  }

  playMushroomBounce() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.32);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  playCheckpoint() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Resonating warm bell chime
    [587.33, 880.00, 1174.66].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0.001, now + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.07, now + i * 0.06 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 1.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 1.5);
    });
  }

  playRespawn() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.28);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  playTreeAwakening() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Grand celestial orchestral chord progression
    const chords = [
      [220, 277.18, 329.63, 440],       // A
      [293.66, 369.99, 440, 587.33],    // D
      [369.99, 440, 554.37, 739.99],    // F#m
      [440, 554.37, 659.25, 880, 1108.73]// A maj / celestial resolution
    ];

    chords.forEach((chord, step) => {
      const stepTime = now + step * 0.75;
      chord.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, stepTime);

        gain.gain.setValueAtTime(0.001, stepTime);
        gain.gain.linearRampToValueAtTime(0.09, stepTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, stepTime + 1.8);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(stepTime);
        osc.stop(stepTime + 2.0);
      });
    });
  }
}

window.LumiGame.SoundManager = SoundManager;
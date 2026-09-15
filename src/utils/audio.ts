// Web Audio API realistic Piano Synthesizer and Sound Effects

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Plays a piano tone using additive synthesis with realistic hammer strike harmonics and natural exponential decay
   */
  public playPianoNote(freq: number, duration: number = 1.8) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.7, now);

      // Gentle lowpass filter to emulate the woody warmth of a piano soundboard
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(freq * 6, 8000), now);
      filter.frequency.exponentialRampToValueAtTime(Math.min(freq * 2.5, 3000), now + duration);

      masterGain.connect(filter);
      filter.connect(this.ctx.destination);

      // Realistic piano harmonic ratios and relative weights
      const harmonics = [
        { mult: 1.0, gain: 1.0, decay: 1.0 },
        { mult: 2.0, gain: 0.55, decay: 0.8 },
        { mult: 3.0, gain: 0.28, decay: 0.6 },
        { mult: 4.0, gain: 0.15, decay: 0.45 },
        { mult: 5.0, gain: 0.08, decay: 0.3 },
      ];

      harmonics.forEach(({ mult, gain: hGain, decay: hDecay }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        // Slight inharmonicity common in real stiff piano strings
        const inharmonicity = 1 + mult * 0.0007;
        osc.type = mult % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq * mult * inharmonicity, now);

        // Attack: extremely fast strike (3ms), then exponential decay
        oscGain.gain.setValueAtTime(0.0001, now);
        oscGain.gain.exponentialRampToValueAtTime(hGain * 0.35, now + 0.004);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * hDecay);

        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + duration * hDecay + 0.05);
      });
    } catch {
      // AudioContext could be blocked by browser policy until user interacts
    }
  }

  /**
   * Sound effect for a correct answer (bright, sparkling uplifting chime)
   */
  public playSuccessSound(streak: number = 1) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // High chord: E5, G#5, B5, E6 for sparkling victory
      const notes = [659.25, 830.61, 987.77, 1318.51];
      if (streak > 3) {
        notes.push(1661.22); // Extra celebratory note on hot streak
      }

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.001, now + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.45);
      });
    } catch {
      // AudioContext error handling
    }
  }

  /**
   * Gentle, encouraging sound for wrong attempt (never harsh or punishing for kids)
   */
  public playGentleErrorSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.28);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.32);
    } catch {
      // AudioContext error handling
    }
  }

  /**
   * Fanfare for completing a level
   */
  public playLevelWinFanfare() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Fanfare: C5 -> E5 -> G5 -> C6
      const pitches = [523.25, 659.25, 783.99, 1046.5];
      const times = [0, 0.12, 0.24, 0.42];
      const durations = [0.2, 0.2, 0.2, 0.8];

      pitches.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + times[idx];
        const dur = durations[idx];

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + dur + 0.05);
      });
    } catch {
      // AudioContext error handling
    }
  }
}

export const soundEngine = new SoundEngine();

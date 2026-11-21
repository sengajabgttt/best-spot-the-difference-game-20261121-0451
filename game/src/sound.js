// sound.js — every sound in Mata Jeli is synthesized with WebAudio.
// No audio files, no network: a found chime, a wrong buzz, a click tick,
// and a little win fanfare, all from oscillators.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return true;
  }

  setMuted(muted) {
    this.muted = muted;
  }

  tone(freq, startAt, dur, type = 'sine', vol = 0.16) {
    if (this.muted || !this.ensure()) return;
    const t0 = this.ctx.currentTime + startAt;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  click() {
    this.tone(720, 0, 0.06, 'triangle', 0.08);
  }

  found() {
    // a bright two-note chime: E5 then A5
    this.tone(659.25, 0, 0.16, 'sine', 0.18);
    this.tone(880, 0.09, 0.24, 'sine', 0.18);
    this.tone(1318.5, 0.16, 0.2, 'triangle', 0.07);
  }

  wrong() {
    // a soft low buzz
    this.tone(160, 0, 0.18, 'sawtooth', 0.08);
    this.tone(110, 0.05, 0.2, 'sawtooth', 0.07);
  }

  hint() {
    this.tone(523.25, 0, 0.12, 'sine', 0.12);
    this.tone(783.99, 0.1, 0.16, 'sine', 0.12);
  }

  win() {
    // C - E - G - C fanfare
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => this.tone(f, i * 0.13, 0.3, 'triangle', 0.16));
    this.tone(1318.5, 0.55, 0.4, 'sine', 0.1);
  }

  tick() {
    this.tone(980, 0, 0.05, 'square', 0.05);
  }
}

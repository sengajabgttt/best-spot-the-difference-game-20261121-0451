// game.js — the hunt itself: state machine, clicks, markers, particles,
// timer, hints, score, overlays, and the ?shot= states used for screenshots.
// The two panels are drawn fresh every frame from the same scene code:
// panel A plain, panel B with the level's mods, so they can only differ
// in exactly the seven differences.

import { LEVELS, PANEL_W, PANEL_H } from './levels.js';
import { SoundBank } from './sound.js';

const $ = (id) => document.getElementById(id);
const WRONG_PENALTY = 5;
const FIND_POINTS = 100;

function fmtTime(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export class SpotGame {
  constructor() {
    this.sound = new SoundBank();
    this.canvasL = $('canvas-left');
    this.canvasR = $('canvas-right');
    this.ctxL = this.canvasL.getContext('2d');
    this.ctxR = this.canvasR.getContext('2d');
    this.state = 'start';
    this.levelIndex = 0;
    this.selectedLevel = 0;
    this.totalScore = 0;
    this.scoreAtLevelStart = 0;
    this.levelScore = 0;
    this.found = [];
    this.hintsLeft = 0;
    this.timeLeft = 0;
    this.lastTick = 0;
    this.lastShownSecond = -1;
    this.particles = [];
    this.wrongMarks = [];
    this.hintPulse = null;
    this.shakeUntil = 0;
    this.raf = 0;
    this.wireUi();
    this.buildLevelPicker();
    this.showOverlay('start');
    this.drawPanels();
    this.raf = requestAnimationFrame((t) => this.loop(t));
    this.applyShotParam();
  }

  get level() {
    return LEVELS[this.levelIndex];
  }

  // --- setup ------------------------------------------------------------

  buildLevelPicker() {
    const picker = $('level-picker');
    picker.innerHTML = '';
    LEVELS.forEach((lv, i) => {
      const b = document.createElement('button');
      b.className = 'level-card' + (i === 0 ? ' selected' : '');
      b.type = 'button';
      b.innerHTML =
        `<div class="lvl-num">LEVEL ${lv.id}</div>` +
        `<div class="lvl-name">${lv.name}</div>` +
        `<div class="lvl-meta">${lv.timeLimit / 60} mnt · ${lv.hints} hint</div>`;
      b.addEventListener('click', () => {
        this.selectedLevel = i;
        picker.querySelectorAll('.level-card').forEach((c) => c.classList.remove('selected'));
        b.classList.add('selected');
        this.sound.click();
      });
      picker.appendChild(b);
    });
  }

  wireUi() {
    $('btn-play').addEventListener('click', () => this.startLevel(this.selectedLevel));
    $('btn-hint').addEventListener('click', () => this.useHint());
    $('btn-pause').addEventListener('click', () => this.togglePause());
    $('btn-restart').addEventListener('click', () => this.startLevel(this.levelIndex));
    $('btn-levels').addEventListener('click', () => this.backToStart());
    $('btn-next').addEventListener('click', () => this.nextLevel());
    $('btn-replay').addEventListener('click', () => this.startLevel(this.levelIndex));
    $('btn-retry').addEventListener('click', () => this.startLevel(this.levelIndex));
    $('btn-timeout-levels').addEventListener('click', () => this.backToStart());
    $('btn-resume').addEventListener('click', () => this.togglePause());
    $('btn-again').addEventListener('click', () => this.backToStart());
    $('btn-help').addEventListener('click', () => this.showOverlay('help'));
    $('btn-close-help').addEventListener('click', () => this.hideOverlays());
    $('btn-sound').addEventListener('click', () => this.toggleSound());
    for (const [canvas, side] of [[this.canvasL, 'left'], [this.canvasR, 'right']]) {
      canvas.addEventListener('click', (ev) => this.onPanelClick(ev, side));
    }
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'h' || ev.key === 'H') this.useHint();
      else if (ev.key === 'p' || ev.key === 'P' || ev.key === 'Escape') this.togglePause();
      else if (ev.key === 'r' || ev.key === 'R') {
        if (this.state === 'playing') this.startLevel(this.levelIndex);
      } else if (ev.key === 'm' || ev.key === 'M') this.toggleSound();
    });
  }

  // --- ?shot= states (deterministic setups for screenshots) --------------
  // ?shot=play1&found=4&time=151 — level 1 mid-hunt, 4 found, 2:31 left.
  // ?shot=play2&found=3 — level 2 mid-hunt. ?shot=win1 — level 1 complete.
  applyShotParam() {
    const q = new URLSearchParams(location.search);
    const shot = q.get('shot');
    if (!shot) return;
    const found = Math.max(0, parseInt(q.get('found') || '0', 10));
    const time = q.get('time') ? parseInt(q.get('time'), 10) : null;
    if (shot.startsWith('play')) {
      const idx = Math.min(LEVELS.length - 1, Math.max(0, parseInt(shot.slice(4), 10) - 1));
      this.startLevel(idx, { silent: true });
      for (let i = 0; i < Math.min(found, this.level.diffs.length); i++) {
        this.markFound(i, { silent: true });
      }
      if (time !== null) this.timeLeft = time;
      this.state = 'playing';
      this.hideOverlays();
      this.updateHud();
    } else if (shot.startsWith('win')) {
      const idx = Math.min(LEVELS.length - 1, Math.max(0, parseInt(shot.slice(3), 10) - 1));
      this.startLevel(idx, { silent: true });
      this.timeLeft = Math.floor(this.level.timeLimit * 0.6);
      for (let i = 0; i < this.level.diffs.length; i++) this.markFound(i, { silent: true });
    }
  }

  // --- flow ---------------------------------------------------------------

  startLevel(idx, opts = {}) {
    this.levelIndex = idx;
    this.levelScore = 0;
    this.scoreAtLevelStart = this.totalScore;
    this.found = this.level.diffs.map(() => null);
    this.hintsLeft = this.level.hints;
    this.timeLeft = this.level.timeLimit;
    this.particles = [];
    this.wrongMarks = [];
    this.hintPulse = null;
    this.lastShownSecond = -1;
    this.state = 'playing';
    this.hideOverlays();
    $('hud').classList.remove('hidden');
    $('hud-level').textContent = `${this.level.id} · ${this.level.name}`;
    $('hint-count').textContent = `(${this.hintsLeft})`;
    $('btn-hint').disabled = this.hintsLeft <= 0;
    this.updateHud();
    if (!opts.silent) this.sound.click();
  }

  backToStart() {
    this.state = 'start';
    this.totalScore = 0;
    this.hideOverlays();
    this.showOverlay('start');
    $('hud').classList.add('hidden');
    this.drawPanels();
  }

  nextLevel() {
    if (this.levelIndex + 1 < LEVELS.length) {
      this.startLevel(this.levelIndex + 1);
    } else {
      this.showDone();
    }
  }

  finishLevel() {
    const bonus = Math.floor(this.timeLeft) * 5;
    this.levelScore += bonus;
    this.totalScore = this.scoreAtLevelStart + this.levelScore;
    const frac = this.timeLeft / this.level.timeLimit;
    const stars = frac > 0.5 ? 3 : frac > 0.25 ? 2 : 1;
    this.state = 'win';
    $('win-stars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    $('win-title').textContent =
      stars === 3 ? 'Luar biasa!' : stars === 2 ? 'Hebat!' : 'Ketemu semua!';
    $('win-detail').textContent =
      `Level ${this.level.id} · ${this.level.name}: 7 dari 7 perbedaan ketemu.`;
    $('win-score').textContent =
      `Skor level: ${this.levelScore} (termasuk bonus waktu +${bonus}) · Total: ${this.totalScore}`;
    $('btn-next').textContent =
      this.levelIndex + 1 < LEVELS.length ? 'Level Berikutnya ▶' : 'Lihat Hasil Akhir 🏆';
    this.showOverlay('win');
    this.sound.win();
    this.updateHud();
  }

  showDone() {
    this.state = 'done';
    $('done-score').textContent = `Skor akhir kamu: ${this.totalScore} poin`;
    this.showOverlay('done');
  }

  timeOut() {
    this.state = 'timeout';
    const foundCount = this.found.filter(Boolean).length;
    $('timeout-detail').textContent =
      `Level ${this.level.id} · ${this.level.name}: baru ketemu ${foundCount} dari 7 perbedaan.`;
    this.showOverlay('timeout');
    this.sound.wrong();
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.showOverlay('pause');
    } else if (this.state === 'paused') {
      this.state = 'playing';
      this.hideOverlays();
    }
  }

  toggleSound() {
    this.sound.ensure();
    this.sound.setMuted(!this.sound.muted);
    $('btn-sound').textContent = this.sound.muted ? '🔇' : '🔊';
  }

  // --- play ---------------------------------------------------------------

  onPanelClick(ev, side) {
    if (this.state !== 'playing') return;
    const canvas = side === 'left' ? this.canvasL : this.canvasR;
    const rect = canvas.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * PANEL_W;
    const y = ((ev.clientY - rect.top) / rect.height) * PANEL_H;
    const hit = this.findDiffAt(x, y);
    if (hit >= 0) {
      if (!this.found[hit]) this.markFound(hit, { x, y });
      return;
    }
    this.registerWrong(x, y, side);
  }

  findDiffAt(x, y) {
    for (let i = 0; i < this.level.diffs.length; i++) {
      const d = this.level.diffs[i];
      const dx = x - d.x, dy = y - d.y;
      if (dx * dx + dy * dy <= d.r * d.r) return i;
      if (d.alt) {
        const ax = x - d.alt.x, ay = y - d.alt.y;
        if (ax * ax + ay * ay <= d.alt.r * d.alt.r) return i;
      }
    }
    return -1;
  }

  markFound(i, opts = {}) {
    const d = this.level.diffs[i];
    this.found[i] = { at: performance.now(), x: opts.x ?? d.x, y: opts.y ?? d.y };
    this.levelScore += FIND_POINTS;
    this.totalScore = this.scoreAtLevelStart + this.levelScore;
    const pos = this.markerPos(i);
    this.burst(pos.x, pos.y);
    if (!opts.silent) {
      this.sound.found();
      this.showToast(d.label, false);
    }
    this.updateHud();
    if (this.found.every(Boolean)) this.finishLevel();
  }

  markerPos(i) {
    return this.level.diffs[i];
  }

  registerWrong(x, y, side) {
    this.timeLeft = Math.max(0, this.timeLeft - WRONG_PENALTY);
    this.wrongMarks.push({ x, y, side, at: performance.now() });
    this.shakeUntil = performance.now() + 350;
    this.sound.wrong();
    this.showToast(`Bukan itu! −${WRONG_PENALTY} detik`, true);
    const panel = side === 'left' ? $('panel-left') : $('panel-right');
    panel.classList.remove('shake');
    void panel.offsetWidth;
    panel.classList.add('shake');
    this.updateHud();
  }

  useHint() {
    if (this.state !== 'playing' || this.hintsLeft <= 0) return;
    const remaining = this.level.diffs.map((d, i) => (this.found[i] ? -1 : i)).filter((i) => i >= 0);
    if (!remaining.length) return;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    this.hintsLeft -= 1;
    this.hintPulse = { diff: pick, until: performance.now() + 2500 };
    $('hint-count').textContent = `(${this.hintsLeft})`;
    $('btn-hint').disabled = this.hintsLeft <= 0;
    this.sound.hint();
    this.showToast('Hint: lihat lingkaran yang berdenyut!', false);
  }

  burst(x, y) {
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 90;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 30,
        life: 0.7 + Math.random() * 0.3,
        born: performance.now(),
        size: 3 + Math.random() * 4,
      });
    }
  }

  // --- rendering ------------------------------------------------------------

  drawPanels() {
    this.level.draw(this.ctxL, {});
    this.level.draw(this.ctxR, this.level.mods);
    this.drawMarkers(this.ctxL, 'left');
    this.drawMarkers(this.ctxR, 'right');
    this.drawHint(this.ctxL, 'left');
    this.drawHint(this.ctxR, 'right');
    this.drawParticles(this.ctxL, 'left');
    this.drawParticles(this.ctxR, 'right');
    this.drawWrongMarks(this.ctxL, 'left');
    this.drawWrongMarks(this.ctxR, 'right');
  }

  markerXY(i, side) {
    const d = this.level.diffs[i];
    if (side === 'left' && d.alt) return d.alt;
    return d;
  }

  drawMarkers(ctx, side) {
    const now = performance.now();
    this.found.forEach((f, i) => {
      if (!f) return;
      const p = this.markerXY(i, side);
      const age = (now - f.at) / 400;
      const pop = age < 1 ? 1 + (1 - age) * 0.35 : 1;
      const r = (this.level.diffs[i].r + 6) * pop;
      ctx.save();
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#f2b705';
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.stroke();
      // check mark
      ctx.strokeStyle = '#2b7a1e';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p.x - r * 0.45, p.y);
      ctx.lineTo(p.x - r * 0.1, p.y + r * 0.38);
      ctx.lineTo(p.x + r * 0.5, p.y - r * 0.35);
      ctx.stroke();
      ctx.restore();
    });
  }

  drawHint(ctx, side) {
    if (!this.hintPulse) return;
    const now = performance.now();
    if (now > this.hintPulse.until) {
      this.hintPulse = null;
      return;
    }
    const p = this.markerXY(this.hintPulse.diff, side);
    const pulse = 1 + 0.18 * Math.sin(now / 160);
    const r = (this.level.diffs[this.hintPulse.diff].r + 10) * pulse;
    ctx.save();
    ctx.globalAlpha = 0.75 + 0.25 * Math.sin(now / 160);
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 7]);
    ctx.strokeStyle = '#f2b705';
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawParticles(ctx, side) {
    const now = performance.now();
    this.particles = this.particles.filter((pt) => now - pt.born < pt.life * 1000);
    for (const pt of this.particles) {
      const age = (now - pt.born) / 1000;
      const px = pt.x + pt.vx * age;
      const py = pt.y + pt.vy * age + 60 * age * age;
      ctx.globalAlpha = Math.max(0, 1 - age / pt.life);
      ctx.fillStyle = '#f2b705';
      ctx.beginPath();
      ctx.arc(px, py, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawWrongMarks(ctx, side) {
    const now = performance.now();
    this.wrongMarks = this.wrongMarks.filter((m) => now - m.at < 700);
    for (const m of this.wrongMarks) {
      if (m.side !== side) continue;
      const alpha = 1 - (now - m.at) / 700;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#d64541';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(m.x - 12, m.y - 12);
      ctx.lineTo(m.x + 12, m.y + 12);
      ctx.moveTo(m.x + 12, m.y - 12);
      ctx.lineTo(m.x - 12, m.y + 12);
      ctx.stroke();
      ctx.restore();
    }
  }

  // --- HUD & overlays ---------------------------------------------------------

  updateHud() {
    const foundCount = this.found.filter(Boolean).length;
    $('hud-found').textContent = `${foundCount} / ${this.level.diffs.length}`;
    $('hud-score').textContent = String(this.totalScore);
    $('hud-time').textContent = fmtTime(this.timeLeft);
    $('hud-time').classList.toggle('low', this.timeLeft <= 30 && this.state === 'playing');
    const pct = Math.max(0, (this.timeLeft / this.level.timeLimit) * 100);
    $('timebar-fill').style.width = `${pct}%`;
    $('timebar-fill').classList.toggle('low', this.timeLeft <= 30);
  }

  showToast(text, bad) {
    const toast = $('toast');
    toast.textContent = text;
    toast.classList.toggle('bad', bad);
    toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toast.classList.remove('show'), 1400);
  }

  showOverlay(name) {
    this.hideOverlays();
    $(`overlay-${name}`).classList.remove('hidden');
  }

  hideOverlays() {
    for (const name of ['start', 'win', 'timeout', 'pause', 'done', 'help']) {
      $(`overlay-${name}`).classList.add('hidden');
    }
  }

  // --- main loop ---------------------------------------------------------------

  loop(t) {
    const dt = this.lastTick ? (t - this.lastTick) / 1000 : 0;
    this.lastTick = t;
    if (this.state === 'playing') {
      this.timeLeft -= dt;
      if (this.timeLeft <= 10 && this.timeLeft + dt > 10) this.sound.tick();
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.updateHud();
        this.drawPanels();
        this.timeOut();
      } else {
        const sec = Math.ceil(this.timeLeft);
        if (sec !== this.lastShownSecond) {
          this.lastShownSecond = sec;
          this.updateHud();
        }
      }
    }
    this.drawPanels();
    this.raf = requestAnimationFrame((nt) => this.loop(nt));
  }
}

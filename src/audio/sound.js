// Dashboard sound effects, synthesized at runtime with the Web Audio API.
// No recorded audio is shipped: every blip, swoosh and chime below is an
// original synthesized approximation of the feel of the console menus.

let ctx = null;
let master = null;
let enabled = true;
let volume = 0.7;
let lastPlayed = {};

function ensureContext() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = volume;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    master.connect(comp);
    comp.connect(ctx.destination);
  } catch {
    ctx = null;
  }
  return ctx;
}

function tone(freq, { at = 0, dur = 0.08, type = 'sine', gain = 0.2, to = null, attack = 0.004 } = {}) {
  const t0 = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

let noiseBuffer = null;
function noise({ at = 0, dur = 0.2, from = 500, to = 2500, q = 1.2, gain = 0.15, type = 'bandpass' } = {}) {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const t0 = ctx.currentTime + at;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(from, t0);
  f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

const SOUNDS = {
  move() {
    tone(1480, { dur: 0.05, gain: 0.07, type: 'triangle' });
    noise({ dur: 0.03, from: 5000, to: 3000, gain: 0.03, q: 2 });
  },
  hover() {
    tone(1480, { dur: 0.04, gain: 0.035, type: 'triangle' });
  },
  select() {
    tone(784, { dur: 0.07, gain: 0.12, type: 'triangle' });
    tone(1175, { at: 0.045, dur: 0.12, gain: 0.11, type: 'sine' });
  },
  back() {
    tone(1046, { dur: 0.12, gain: 0.1, type: 'triangle', to: 620 });
  },
  pivot() {
    noise({ dur: 0.22, from: 700, to: 3200, gain: 0.09, q: 0.9 });
    tone(520, { dur: 0.1, gain: 0.04, type: 'sine', to: 760 });
  },
  open() {
    tone(523, { dur: 0.08, gain: 0.08, type: 'sine' });
    tone(784, { at: 0.05, dur: 0.16, gain: 0.08, type: 'sine' });
    noise({ dur: 0.18, from: 900, to: 4000, gain: 0.04 });
  },
  guide() {
    tone(392, { dur: 0.12, gain: 0.08, type: 'sine', to: 784 });
    tone(988, { at: 0.08, dur: 0.22, gain: 0.07, type: 'sine' });
    noise({ dur: 0.25, from: 600, to: 3000, gain: 0.05 });
  },
  close() {
    tone(784, { dur: 0.14, gain: 0.07, type: 'sine', to: 392 });
    noise({ dur: 0.18, from: 3000, to: 700, gain: 0.04 });
  },
  toggle() {
    tone(988, { dur: 0.05, gain: 0.08, type: 'square' });
    tone(1318, { at: 0.04, dur: 0.06, gain: 0.05, type: 'triangle' });
  },
  key() {
    tone(1900, { dur: 0.03, gain: 0.05, type: 'triangle' });
  },
  error() {
    tone(196, { dur: 0.16, gain: 0.08, type: 'square' });
  },
  toast() {
    tone(659, { dur: 0.35, gain: 0.08, type: 'sine' });
    tone(988, { at: 0.09, dur: 0.4, gain: 0.08, type: 'sine' });
    tone(1318, { at: 0.18, dur: 0.55, gain: 0.06, type: 'sine' });
  },
  achievement() {
    tone(392, { dur: 0.18, gain: 0.12, type: 'sine', to: 784 });
    tone(1046, { at: 0.16, dur: 0.5, gain: 0.08, type: 'sine' });
    tone(1568, { at: 0.24, dur: 0.6, gain: 0.06, type: 'sine' });
    tone(2093, { at: 0.32, dur: 0.7, gain: 0.04, type: 'sine' });
    noise({ at: 0.12, dur: 0.5, from: 2000, to: 6000, gain: 0.03 });
  },
  boot() {
    noise({ dur: 1.4, from: 200, to: 2400, gain: 0.05, q: 0.7 });
    tone(196, { dur: 1.6, gain: 0.08, type: 'sine', attack: 0.4 });
    tone(294, { at: 0.35, dur: 1.4, gain: 0.06, type: 'sine', attack: 0.3 });
    tone(587, { at: 0.75, dur: 1.2, gain: 0.05, type: 'sine', attack: 0.15 });
    tone(880, { at: 1.0, dur: 1.2, gain: 0.04, type: 'sine', attack: 0.1 });
  },
  power() {
    tone(660, { dur: 0.6, gain: 0.08, type: 'sine', to: 110 });
  },
};

export const sound = {
  unlock() {
    const c = ensureContext();
    if (c && c.state === 'suspended') c.resume().catch(() => {});
  },
  setEnabled(v) {
    enabled = !!v;
  },
  setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    if (master && ctx) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.02);
  },
  play(name, { force = false } = {}) {
    if ((!enabled && !force) || !SOUNDS[name]) return;
    const c = ensureContext();
    if (!c || c.state !== 'running') return;
    const now = performance.now();
    if (now - (lastPlayed[name] || 0) < 35) return;
    lastPlayed[name] = now;
    try {
      SOUNDS[name]();
    } catch {
      /* audio is best-effort */
    }
  },
};

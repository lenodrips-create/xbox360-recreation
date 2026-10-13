// Maps physical inputs (keyboard + gamepad) to controller actions.

export const KEYMAP = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Enter: 'a',
  ' ': 'a',
  Escape: 'b',
  Backspace: 'b',
  x: 'x',
  X: 'x',
  y: 'y',
  Y: 'y',
  q: 'lb',
  Q: 'lb',
  PageUp: 'lb',
  e: 'rb',
  E: 'rb',
  PageDown: 'rb',
  g: 'guide',
  G: 'guide',
  Home: 'guide',
  m: 'mute',
  M: 'mute',
  F1: 'help',
  '?': 'help',
  h: 'help',
  H: 'help',
  Tab: 'tab',
};

// Standard gamepad mapping (Xbox 360 / Xbox controllers on most browsers).
const PAD_BUTTONS = {
  0: 'a',
  1: 'b',
  2: 'x',
  3: 'y',
  4: 'lb',
  5: 'rb',
  8: 'back',
  9: 'start',
  12: 'up',
  13: 'down',
  14: 'left',
  15: 'right',
  16: 'guide',
};

const REPEATABLE = new Set(['up', 'down', 'left', 'right']);

// Polls connected gamepads and emits actions with D-pad style auto-repeat.
export function startGamepadLoop(emit) {
  let raf = 0;
  const held = new Map(); // action -> { since, last }
  const DELAY = 380;
  const RATE = 110;

  function poll() {
    raf = 0;
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const active = new Set();
    for (const pad of pads) {
      if (!pad) continue;
      pad.buttons.forEach((b, i) => {
        const act = PAD_BUTTONS[i];
        if (act && (b.pressed || b.value > 0.6)) active.add(act);
      });
      const [lx = 0, ly = 0] = pad.axes;
      const dead = 0.55;
      if (lx > dead) active.add('right');
      else if (lx < -dead) active.add('left');
      if (ly > dead) active.add('down');
      else if (ly < -dead) active.add('up');
    }
    const now = performance.now();
    for (const act of active) {
      const h = held.get(act);
      if (!h) {
        held.set(act, { since: now, last: now });
        emit(act, false);
      } else if (REPEATABLE.has(act) && now - h.since > DELAY && now - h.last > RATE) {
        h.last = now;
        emit(act, true);
      }
    }
    for (const act of [...held.keys()]) if (!active.has(act)) held.delete(act);
    if (pads && [...pads].some(Boolean)) raf = requestAnimationFrame(poll);
  }

  const onConnect = () => {
    if (!raf) raf = requestAnimationFrame(poll);
  };
  window.addEventListener('gamepadconnected', onConnect);
  onConnect();
  return () => {
    window.removeEventListener('gamepadconnected', onConnect);
    if (raf) cancelAnimationFrame(raf);
  };
}

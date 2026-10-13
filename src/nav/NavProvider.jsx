import { createContext, useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { KEYMAP, startGamepadLoop } from './input.js';
import { OPPOSITE, defaultCandidate, ensureVisible, findNext, getCandidates } from './spatial.js';
import { sound } from '../audio/sound.js';

// A "layer" is an input scope: the dashboard, each pushed screen, the Guide,
// dialogs and the on-screen keyboard. Only the top-most enabled layer
// receives controller actions, exactly like the console's modal stack.
class LayerManager {
  constructor() {
    this.layers = new Map();
    this.seq = 0;
    this.topId = null;
    this.lastMove = null;
    this.global = null;
    this.pending = false;
  }

  register(layer) {
    layer.order = ++this.seq;
    this.layers.set(layer.id, layer);
    this.schedule();
  }

  unregister(id) {
    this.layers.delete(id);
    this.schedule();
  }

  update() {
    this.schedule();
  }

  top() {
    let best = null;
    for (const l of this.layers.values()) {
      if (!l.opts.enabled || !l.root) continue;
      if (!best || l.opts.priority > best.opts.priority || (l.opts.priority === best.opts.priority && l.order > best.order)) best = l;
    }
    return best;
  }

  schedule() {
    if (this.pending) return;
    this.pending = true;
    queueMicrotask(() => {
      this.pending = false;
      this.sync();
    });
  }

  sync() {
    const top = this.top();
    const id = top ? top.id : null;
    if (id !== this.topId) {
      this.topId = id;
      if (top) this.restore(top);
    } else if (top && !top.root.contains(document.activeElement)) {
      this.restore(top);
    }
  }

  isUsable(el, root) {
    return el && el.isConnected && root.contains(el) && !el.closest('[inert]') && !el.disabled;
  }

  restore(layer) {
    const root = layer.root;
    if (!root) return;
    let el = layer.lastEl;
    if (!this.isUsable(el, root)) {
      el = layer.lastNavId ? root.querySelector(`[data-nav-id="${CSS.escape(layer.lastNavId)}"]`) : null;
    }
    if (!this.isUsable(el, root)) el = layer.opts.initialFocus ? layer.opts.initialFocus() : null;
    if (!this.isUsable(el, root)) el = defaultCandidate(root);
    if (el) this.focus(el, false);
  }

  focus(el, smooth = true) {
    if (!el) return;
    el.focus({ preventScroll: true });
    ensureVisible(el, smooth);
  }

  focusedIn(layer) {
    const a = document.activeElement;
    return a && layer.root.contains(a) && a.hasAttribute('data-nav') ? a : null;
  }

  dispatch(action, meta = {}) {
    const top = this.top();
    if (!top) {
      if (this.global) this.global(action, null);
      return;
    }
    const focused = this.focusedIn(top);
    if (top.opts.onAction && top.opts.onAction(action, focused, meta) === true) return;

    if ((action === 'left' || action === 'right') && focused && focused.hasAttribute('data-adjust')) {
      focused.dispatchEvent(new CustomEvent('nav-adjust', { detail: action === 'left' ? -1 : 1 }));
      return;
    }

    switch (action) {
      case 'up':
      case 'down':
      case 'left':
      case 'right':
        this.move(top, action, focused);
        return;
      case 'tab':
        this.tab(top, focused, meta.shift);
        return;
      case 'a':
        if (focused) {
          pressFx(focused);
          focused.click();
        } else this.restore(top);
        return;
      case 'b':
      case 'back':
        if (top.opts.onBack) top.opts.onBack();
        return;
      default:
        if (!top.opts.blockGlobal && this.global) this.global(action, top);
    }
  }

  move(top, dir, focused) {
    if (!focused) {
      this.restore(top);
      return;
    }
    const cands = getCandidates(top.root);
    const lm = this.lastMove;
    const preferred = lm && lm.to === focused && lm.dir === OPPOSITE[dir] ? lm.from : null;
    const next = findNext(focused, dir, cands, preferred);
    if (next) {
      this.lastMove = { from: focused, to: next, dir };
      this.focus(next);
      sound.play('move');
    } else if (top.opts.onEdge) {
      top.opts.onEdge(dir, focused);
    }
  }

  tab(top, focused, back) {
    const cands = getCandidates(top.root);
    if (!cands.length) return;
    const i = focused ? cands.indexOf(focused) : -1;
    const next = cands[(i + (back ? -1 : 1) + cands.length) % cands.length];
    this.focus(next);
    sound.play('move');
  }
}

export function pressFx(el) {
  el.classList.remove('is-pressed');
  // Force reflow so the animation restarts on repeated presses.
  void el.offsetWidth;
  el.classList.add('is-pressed');
  setTimeout(() => el.classList.remove('is-pressed'), 180);
}

const NavContext = createContext(null);

export function NavProvider({ children }) {
  const mgrRef = useRef(null);
  if (!mgrRef.current) mgrRef.current = new LayerManager();
  const mgr = mgrRef.current;

  useEffect(() => {
    let lastRepeat = 0;
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      sound.unlock();
      const top = mgr.top();
      if (top && top.opts.onRawKey && top.opts.onRawKey(e)) {
        e.preventDefault();
        return;
      }
      const action = KEYMAP[e.key];
      if (!action) return;
      e.preventDefault();
      if (e.repeat) {
        const now = performance.now();
        if (now - lastRepeat < 75) return;
        lastRepeat = now;
      }
      mgr.dispatch(action, { repeat: e.repeat, shift: e.shiftKey, source: 'key' });
    };

    const onPointerMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      const el = e.target.closest && e.target.closest('[data-nav]');
      if (!el || el === document.activeElement) return;
      const top = mgr.top();
      if (!top || !top.root.contains(el) || el.closest('[inert]') || el.disabled) return;
      if (el.closest('[data-layer]') !== top.root) return;
      el.focus({ preventScroll: true });
      sound.play('hover');
    };

    const onPointerDown = () => sound.unlock();

    let focusCheck = 0;
    const onFocusOut = () => {
      cancelAnimationFrame(focusCheck);
      focusCheck = requestAnimationFrame(() => {
        const top = mgr.top();
        if (!top) return;
        const a = document.activeElement;
        if (!a || a === document.body || !top.root.contains(a)) mgr.restore(top);
      });
    };

    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('focusout', onFocusOut);
    const stopPad = startGamepadLoop((action, repeat) => {
      sound.unlock();
      mgr.dispatch(action === 'start' ? 'a' : action, { repeat, source: 'pad' });
    });
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('focusout', onFocusOut);
      cancelAnimationFrame(focusCheck);
      stopPad();
    };
  }, [mgr]);

  return <NavContext.Provider value={mgr}>{children}</NavContext.Provider>;
}

export function useNav() {
  return useContext(NavContext);
}

// Registers an input layer. Attach the returned ref to the layer's root.
export function useLayer(opts) {
  const mgr = useContext(NavContext);
  const ref = useRef(null);
  const layerRef = useRef(null);
  if (!layerRef.current) {
    layerRef.current = { id: Symbol('layer'), root: null, lastEl: null, lastNavId: null, opts: {} };
  }
  const { priority = 0, enabled = true } = opts;
  layerRef.current.opts = { ...opts, priority, enabled };

  useLayoutEffect(() => {
    const layer = layerRef.current;
    const root = ref.current;
    layer.root = root;
    root.setAttribute('data-layer', '');
    const onFocusIn = (e) => {
      const t = e.target;
      if (t && t.hasAttribute && t.hasAttribute('data-nav')) {
        layer.lastEl = t;
        layer.lastNavId = t.getAttribute('data-nav-id');
      }
    };
    root.addEventListener('focusin', onFocusIn);
    mgr.register(layer);
    return () => {
      root.removeEventListener('focusin', onFocusIn);
      mgr.unregister(layer.id);
    };
  }, [mgr]);

  useLayoutEffect(() => {
    mgr.update();
  }, [mgr, enabled, priority]);

  return { ref, layer: layerRef.current, mgr };
}

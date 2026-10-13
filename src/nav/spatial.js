// Geometry helpers for D-pad style spatial navigation.
// Every navigable element carries a `data-nav` attribute. Candidates are
// searched inside the active layer only, so overlays never leak focus.

export const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

function visible(el) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

export function getCandidates(root) {
  if (!root) return [];
  const list = root.querySelectorAll('[data-nav]');
  const out = [];
  for (const el of list) {
    if (el.disabled) continue;
    if (el.closest('[inert]')) continue;
    if (el.closest('[data-layer]') !== root) continue;
    if (!visible(el)) continue;
    out.push(el);
  }
  return out;
}

export function defaultCandidate(root) {
  const cands = getCandidates(root);
  return cands.find((el) => el.hasAttribute('data-nav-default')) || cands[0] || null;
}

function rel(a, b, dir) {
  const horiz = dir === 'left' || dir === 'right';
  let primary;
  if (dir === 'right') primary = b.left - a.right;
  else if (dir === 'left') primary = a.left - b.right;
  else if (dir === 'down') primary = b.top - a.bottom;
  else primary = a.top - b.bottom;

  const [a1, a2, b1, b2] = horiz ? [a.top, a.bottom, b.top, b.bottom] : [a.left, a.right, b.left, b.right];
  const overlap = Math.min(a2, b2) - Math.max(a1, b1);
  const ac = (a1 + a2) / 2;
  const bc = (b1 + b2) / 2;
  return { primary, overlap, perpGap: Math.max(0, -overlap), centerOffset: Math.abs(ac - bc) };
}

function inDirection(a, b, dir, strict) {
  const tol = 2;
  if (strict) {
    if (dir === 'right') return b.left >= a.right - tol;
    if (dir === 'left') return b.right <= a.left + tol;
    if (dir === 'down') return b.top >= a.bottom - tol;
    return b.bottom <= a.top + tol;
  }
  const acx = (a.left + a.right) / 2;
  const acy = (a.top + a.bottom) / 2;
  const bcx = (b.left + b.right) / 2;
  const bcy = (b.top + b.bottom) / 2;
  if (dir === 'right') return bcx > acx + 4;
  if (dir === 'left') return bcx < acx - 4;
  if (dir === 'down') return bcy > acy + 4;
  return bcy < acy - 4;
}

function score(a, b, dir) {
  const { primary, overlap, perpGap, centerOffset } = rel(a, b, dir);
  const p = Math.max(0, primary);
  // Strongly prefer items that share a row/column with the current one.
  return p + perpGap * 3 + (overlap > 0 ? centerOffset * 0.15 : 600 + centerOffset * 0.4);
}

export function findNext(current, dir, cands, preferred) {
  const a = current.getBoundingClientRect();
  if (preferred && preferred !== current && cands.includes(preferred)) {
    const b = preferred.getBoundingClientRect();
    if (inDirection(a, b, dir, true) && rel(a, b, dir).overlap > 0) return preferred;
  }
  for (const strict of [true, false]) {
    let best = null;
    let bestScore = Infinity;
    for (const el of cands) {
      if (el === current) continue;
      const b = el.getBoundingClientRect();
      if (!inDirection(a, b, dir, strict)) continue;
      const s = score(a, b, dir);
      if (s < bestScore) {
        bestScore = s;
        best = el;
      }
    }
    if (best) return best;
  }
  return null;
}

// When entering a page from the side (pivot change), pick the item nearest
// to the edge we came from, vertically aligned with the previous focus.
export function entryCandidate(cands, dir, refRect) {
  if (!cands.length) return null;
  const rects = cands.map((el) => [el, el.getBoundingClientRect()]);
  let edge;
  if (dir === 'right') {
    edge = Math.min(...rects.map(([, r]) => r.left));
    rects.splice(0, rects.length, ...rects.filter(([, r]) => r.left <= edge + 24));
  } else {
    edge = Math.max(...rects.map(([, r]) => r.right));
    rects.splice(0, rects.length, ...rects.filter(([, r]) => r.right >= edge - 24));
  }
  if (!refRect) {
    rects.sort((x, y) => x[1].top - y[1].top);
    return rects[0][0];
  }
  const cy = (refRect.top + refRect.bottom) / 2;
  let best = rects[0][0];
  let bestD = Infinity;
  for (const [el, r] of rects) {
    const d = cy >= r.top && cy <= r.bottom ? 0 : Math.min(Math.abs(cy - r.top), Math.abs(cy - r.bottom));
    if (d < bestD) {
      bestD = d;
      best = el;
    }
  }
  return best;
}

// Keep the focused element inside its scroll container (data-scroll="x|y").
export function ensureVisible(el, smooth = true) {
  const sc = el.closest('[data-scroll]');
  if (!sc) return;
  const box = sc.getBoundingClientRect();
  const scale = sc.offsetWidth ? box.width / sc.offsetWidth : 1;
  const r = el.getBoundingClientRect();
  const pad = Number(sc.dataset.scrollPad || 48);
  const behavior = smooth ? 'smooth' : 'auto';
  if (sc.dataset.scroll === 'x') {
    const left = (r.left - box.left) / scale;
    const right = (r.right - box.left) / scale;
    let target = sc.scrollLeft;
    if (left < pad) target += left - pad;
    else if (right > sc.clientWidth - pad) target += right - (sc.clientWidth - pad);
    if (Math.abs(target - sc.scrollLeft) > 1) sc.scrollTo({ left: target, behavior });
  } else {
    const top = (r.top - box.top) / scale;
    const bottom = (r.bottom - box.top) / scale;
    let target = sc.scrollTop;
    if (top < pad) target += top - pad;
    else if (bottom > sc.clientHeight - pad) target += bottom - (sc.clientHeight - pad);
    if (Math.abs(target - sc.scrollTop) > 1) sc.scrollTo({ top: target, behavior });
  }
}

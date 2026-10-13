import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useLayer } from '../nav/NavProvider.jsx';
import { entryCandidate, getCandidates } from '../nav/spatial.js';
import { sound } from '../audio/sound.js';
import { useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';
import HomePivot from '../pivots/HomePivot.jsx';
import SocialPivot from '../pivots/SocialPivot.jsx';
import SettingsPivot from '../pivots/SettingsPivot.jsx';
import { Btn } from './ui.jsx';

// Left edge of each channel name for each selected channel, measured from
// the captures: the header row drifts left as you move right.
const HEADER_X = [
  [251, 437, 623],
  [239, 417, 608],
  [190, 373, 549],
];

const PIVOTS = [
  { id: 'home', label: 'home', Comp: HomePivot },
  { id: 'social', label: 'social', Comp: SocialPivot },
  { id: 'settings', label: 'settings', Comp: SettingsPivot },
];

// All channels sit on one horizontal strip; the current one starts at
// CONTENT_X and its neighbours peek in, dimmed, at the screen edges.
const CONTENT_X = 320;
const PAGE_PITCH = 1510;

export default function Dashboard() {
  const ui = useUI();
  const { state } = useStore();
  const reduceMotion = state.settings.reduceMotion;
  const covered = ui.stack.length > 0;
  const index = ui.pivot;
  const pagesRef = useRef([]);
  const prevRef = useRef(index);
  const pendingEntry = useRef(null);
  const pivotFocus = useRef({});

  const switchTo = useCallback(
    (next, entry = null) => {
      if (next === ui.pivot || next < 0 || next >= PIVOTS.length) return;
      pendingEntry.current = { dir: entry?.dir || (next > ui.pivot ? 'right' : 'left'), rect: entry?.rect || null };
      sound.play('pivot');
      ui.setPivot(next);
    },
    [ui],
  );

  const pageCandidates = (root, page) => getCandidates(root).filter((el) => page.contains(el));

  const { ref, mgr } = useLayer({
    priority: 0,
    enabled: !covered,
    onEdge: (dir, focused) => {
      if (dir === 'left') switchTo(index - 1, { dir: 'left', rect: focused.getBoundingClientRect() });
      else if (dir === 'right') switchTo(index + 1, { dir: 'right', rect: focused.getBoundingClientRect() });
    },
    onAction: (action) => {
      if (action === 'lb') {
        switchTo(index - 1);
        return true;
      }
      if (action === 'rb') {
        switchTo(index + 1);
        return true;
      }
      return false;
    },
    onBack: () => {
      if (index !== 0) switchTo(0);
    },
  });

  // Remember the last focused tile per channel.
  useEffect(() => {
    const root = ref.current;
    const onFocusIn = (e) => {
      const page = e.target.closest('[data-pivot]');
      if (page) pivotFocus.current[page.dataset.pivot] = e.target;
    };
    root.addEventListener('focusin', onFocusIn);
    return () => root.removeEventListener('focusin', onFocusIn);
  }, [ref]);

  useLayoutEffect(() => {
    const prev = prevRef.current;
    if (prev === index) return;
    prevRef.current = index;
    const root = ref.current;
    const page = pagesRef.current[index];
    const pe = pendingEntry.current || { dir: index > prev ? 'right' : 'left', rect: null };
    pendingEntry.current = null;
    if (covered || !page) return;
    const cands = pageCandidates(root, page);
    let target = null;
    if (pe.rect) target = entryCandidate(cands, pe.dir, pe.rect);
    if (!target) {
      const remembered = pivotFocus.current[PIVOTS[index].id];
      target = remembered && cands.includes(remembered) ? remembered : cands.find((el) => el.hasAttribute('data-nav-default')) || cands[0];
    }
    if (target) mgr.focus(target, false);
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fade the dashboard in when the console finishes booting.
  const prevPower = useRef(ui.power);
  useLayoutEffect(() => {
    const was = prevPower.current;
    prevPower.current = ui.power;
    if (was === 'on' || ui.power !== 'on' || reduceMotion || !ref.current) return;
    ref.current.animate(
      [
        { opacity: 0, transform: 'translateX(60px)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 600, easing: 'cubic-bezier(.1,.9,.2,1)' },
    );
  }, [ui.power]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mouse wheel + touch swipe move between channels.
  const wheelLock = useRef(0);
  const onWheel = (e) => {
    if (covered) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 25) return;
    const now = performance.now();
    if (now < wheelLock.current) return;
    wheelLock.current = now + 450;
    sound.unlock();
    switchTo(index + (d > 0 ? 1 : -1));
  };

  const swipe = useRef(null);
  const suppressClick = useRef(0);
  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse') return;
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || covered) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      suppressClick.current = performance.now() + 400;
      switchTo(index + (dx < 0 ? 1 : -1));
    }
  };
  const onClickCapture = (e) => {
    if (performance.now() < suppressClick.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div
      ref={ref}
      className={`dash pv-${PIVOTS[index].id} ${covered ? 'is-covered' : ''}`}
      inert={covered ? true : undefined}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (swipe.current = null)}
      onClickCapture={onClickCapture}
    >
      <nav className="pivots" aria-label="Dashboard channels">
        {PIVOTS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            tabIndex={-1}
            className={`pivot-h ${i === index ? 'is-active' : ''}`}
            style={{ transform: `translate3d(${HEADER_X[index][i]}px,0,0)` }}
            onClick={() => {
              sound.unlock();
              switchTo(i);
            }}
          >
            {p.label}
          </button>
        ))}
      </nav>
      <div className={`strip ${reduceMotion ? 'no-anim' : ''}`} style={{ transform: `translate3d(${CONTENT_X - index * PAGE_PITCH}px, 0, 0)` }}>
        {PIVOTS.map((p, i) => {
          const current = i === index;
          const { Comp } = p;
          return (
            <section
              key={p.id}
              ref={(el) => (pagesRef.current[i] = el)}
              data-pivot={p.id}
              className={`page page-${p.id} ${current ? 'is-current' : 'is-off'}`}
              style={{ left: i * PAGE_PITCH }}
              inert={current ? undefined : true}
              aria-hidden={current ? undefined : true}
            >
              <Comp active={current && !covered} />
            </section>
          );
        })}
      </div>
      {index > 0 && (
        <button
          type="button"
          tabIndex={-1}
          className="peek peek-left"
          aria-label={`Go to ${PIVOTS[index - 1].label}`}
          onClick={() => switchTo(index - 1)}
        />
      )}
      {index < PIVOTS.length - 1 && (
        <button
          type="button"
          tabIndex={-1}
          className="peek peek-right"
          aria-label={`Go to ${PIVOTS[index + 1].label}`}
          onClick={() => switchTo(index + 1)}
        />
      )}
      <div className="dash-hints">
        <button type="button" tabIndex={-1} className="hint" onClick={() => mgr.dispatch('a')}>
          <Btn b="a" />
          <span>Select</span>
        </button>
      </div>
    </div>
  );
}

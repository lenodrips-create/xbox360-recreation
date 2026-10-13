import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLayer } from '../nav/NavProvider.jsx';
import { entryCandidate, getCandidates } from '../nav/spatial.js';
import { sound } from '../audio/sound.js';
import { useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';
import BingPivot from '../pivots/BingPivot.jsx';
import HomePivot from '../pivots/HomePivot.jsx';
import SocialPivot from '../pivots/SocialPivot.jsx';
import GamesPivot from '../pivots/GamesPivot.jsx';
import AppsPivot from '../pivots/AppsPivot.jsx';
import SettingsPivot from '../pivots/SettingsPivot.jsx';

export const PIVOTS = [
  { id: 'bing', label: 'bing', Comp: BingPivot },
  { id: 'home', label: 'home', Comp: HomePivot },
  { id: 'social', label: 'social', Comp: SocialPivot },
  { id: 'games', label: 'games', Comp: GamesPivot },
  { id: 'apps', label: 'apps', Comp: AppsPivot },
  { id: 'settings', label: 'settings', Comp: SettingsPivot },
];

const EASE_OUT = 'cubic-bezier(.1,.9,.2,1)';

// Metro-style entrance: tiles slide in from the side, staggered by column.
function animateEntry(page, dir, baseDelay = 70) {
  const items = page.querySelectorAll('[data-anim]');
  const width = page.offsetWidth || 1632;
  items.forEach((el) => {
    const x = el.offsetLeft;
    const lead = dir > 0 ? x : width - x - el.offsetWidth;
    el.animate(
      [
        { opacity: 0, transform: `translateX(${dir * 300}px)` },
        { opacity: 1, transform: 'translateX(0)' },
      ],
      { duration: 520, delay: baseDelay + (Math.max(0, lead) / width) * 150, easing: EASE_OUT, fill: 'backwards' },
    );
  });
}

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
  const exitAnims = useRef([]);
  const [leavingIdx, setLeavingIdx] = useState(null);
  const leaveTimer = useRef(0);

  const switchTo = useCallback(
    (next, entry = null) => {
      if (next === ui.pivot || next < 0 || next >= PIVOTS.length) return;
      pendingEntry.current = { dir: entry?.dir || (next > ui.pivot ? 'right' : 'left'), rect: entry?.rect || null };
      sound.play('pivot');
      clearTimeout(leaveTimer.current);
      setLeavingIdx(ui.pivot);
      leaveTimer.current = setTimeout(() => setLeavingIdx(null), 240);
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
      if (index !== 1) switchTo(1);
    },
  });

  // Remember the last focused tile per pivot.
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
    const old = pagesRef.current[prev];
    const pe = pendingEntry.current || { dir: index > prev ? 'right' : 'left', rect: null };
    pendingEntry.current = null;

    if (!covered && page) {
      const cands = pageCandidates(root, page);
      let target = null;
      if (pe.rect) target = entryCandidate(cands, pe.dir, pe.rect);
      if (!target) {
        const remembered = pivotFocus.current[PIVOTS[index].id];
        target = remembered && cands.includes(remembered) ? remembered : cands.find((el) => el.hasAttribute('data-nav-default')) || cands[0];
      }
      if (target) mgr.focus(target, false);
    }

    exitAnims.current.forEach((a) => a.cancel());
    exitAnims.current = [];
    if (reduceMotion || !page) return;
    const dx = pe.dir === 'right' ? 1 : -1;
    if (old) {
      exitAnims.current.push(
        old.animate(
          [
            { opacity: 1, transform: 'translateX(0)' },
            { opacity: 0, transform: `translateX(${-dx * 180}px)` },
          ],
          { duration: 220, easing: 'cubic-bezier(.5,0,.9,.6)', fill: 'forwards' },
        ),
      );
    }
    animateEntry(page, dx);
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tiles fly in when the console finishes booting.
  const prevPower = useRef(ui.power);
  useLayoutEffect(() => {
    const was = prevPower.current;
    prevPower.current = ui.power;
    if (was === 'on' || ui.power !== 'on' || reduceMotion) return;
    const page = pagesRef.current[index];
    if (page) animateEntry(page, 1, 120);
  }, [ui.power]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (leavingIdx === null) {
      exitAnims.current.forEach((a) => a.cancel());
      exitAnims.current = [];
    }
  }, [leavingIdx]);

  useEffect(() => () => clearTimeout(leaveTimer.current), []);

  // Mouse wheel + touch swipe move between pivots.
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
      className={`dash ${covered ? 'is-covered' : ''}`}
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
            onClick={() => {
              sound.unlock();
              switchTo(i);
            }}
          >
            {p.label}
          </button>
        ))}
      </nav>
      <div className="pages">
        {PIVOTS.map((p, i) => {
          const current = i === index;
          const leaving = i === leavingIdx && !current;
          const { Comp } = p;
          return (
            <section
              key={p.id}
              ref={(el) => (pagesRef.current[i] = el)}
              data-pivot={p.id}
              className={`page ${current ? 'is-current' : leaving ? 'is-leaving' : 'is-off'}`}
              inert={current ? undefined : true}
              aria-hidden={current ? undefined : true}
            >
              <Comp active={current && !covered} />
            </section>
          );
        })}
      </div>
    </div>
  );
}

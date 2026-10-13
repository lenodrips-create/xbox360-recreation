import { memo, useEffect, useId, useMemo, useRef, useState } from 'react';
import { THEME_BY_ID } from '../data/themes.js';
import { gamerscoreOf, useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';
import { sound } from '../audio/sound.js';
import Gamerpic from './Gamerpic.jsx';
import { GIcon } from './ui.jsx';

// ---- Theme background (cross-fades between themes) -----------------------
const Ribbons = memo(function Ribbons({ color, opacity }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const a = `rba${uid}`;
  const b = `rbb${uid}`;
  return (
    <svg className="bg-ribbons" viewBox="0 0 1920 1080" preserveAspectRatio="none" aria-hidden="true" style={{ opacity }}>
      <defs>
        <linearGradient id={a} x1="0" x2="1">
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset=".35" stopColor={color} stopOpacity="1" />
          <stop offset=".8" stopColor={color} stopOpacity=".7" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={b} x1="0" x2="1">
          <stop offset="0" stopColor={color} stopOpacity=".2" />
          <stop offset=".6" stopColor={color} stopOpacity=".9" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <g>
        <path d="M-200 930 C 400 760, 1100 800, 2120 470 L2120 600 C 1150 900, 480 860, -200 1010 Z" fill={`url(#${a})`} />
        <path d="M-200 1010 C 600 860, 1260 930, 2120 690 L2120 724 C 1260 960, 620 900, -200 1046 Z" fill={`url(#${b})`} />
        <path d="M-200 760 C 500 690, 1240 720, 2120 380 L2120 398 C 1240 740, 520 712, -200 778 Z" fill={`url(#${b})`} opacity=".7" />
      </g>
    </svg>
  );
});

export function Background() {
  const { state } = useStore();
  const themeId = state.settings.theme;
  const [layers, setLayers] = useState([{ key: 0, id: themeId }]);
  const keyRef = useRef(0);

  useEffect(() => {
    setLayers((ls) => {
      if (ls[ls.length - 1].id === themeId) return ls;
      keyRef.current += 1;
      return [...ls, { key: keyRef.current, id: themeId }];
    });
    const t = setTimeout(() => setLayers((ls) => ls.slice(-1)), 900);
    return () => clearTimeout(t);
  }, [themeId]);

  return (
    <div className="bg-root" aria-hidden="true">
      {layers.map((l, i) => {
        const theme = THEME_BY_ID[l.id] || THEME_BY_ID.default;
        return (
          <div key={l.key} className={`bg-layer ${i > 0 ? 'is-new' : ''} ${theme.drift ? 'is-drift' : ''}`} style={{ background: theme.base }}>
            <Ribbons color={theme.ribbons} opacity={theme.ribbonOpacity} />
          </div>
        );
      })}
    </div>
  );
}

// ---- Profile corner (top right) -----------------------------------------
export function ProfileCorner() {
  const { state } = useStore();
  const ui = useUI();
  const score = useMemo(() => gamerscoreOf(state.unlocked), [state.unlocked]);
  const { profile } = state;
  if (!state.signedIn) {
    return (
      <button
        type="button"
        tabIndex={-1}
        className="profile-corner is-out"
        onClick={() => {
          sound.play('select');
          ui.push('signin');
        }}
      >
        <span className="pc-text">
          <span className="pc-tag">Sign In</span>
          <span className="pc-score">Not signed in</span>
        </span>
        <span className="pc-empty" />
      </button>
    );
  }
  return (
    <button
      type="button"
      tabIndex={-1}
      className="profile-corner"
      title="Open the Xbox Guide (G)"
      onClick={() => {
        sound.play('guide');
        ui.setGuideOpen(true);
      }}
    >
      <span className="pc-text">
        <span className="pc-tag">{profile.gamertag}</span>
        <span className="pc-score">
          <GIcon size={22} />
          {score.toLocaleString('en-US')}
        </span>
      </span>
      <Gamerpic id={profile.gamerpic} avatar={profile.avatar} size={80} />
    </button>
  );
}

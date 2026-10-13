import { memo, useId } from 'react';
import { GAMERPIC_BY_ID } from '../data/gamerpics.js';
import Avatar from './Avatar.jsx';

const W = '#ffffff';

const GLYPHS = {
  orb: (id) => (
    <g>
      <circle cx="32" cy="32" r="21" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="3" />
      <circle cx="32" cy="32" r="16" fill={`url(#orb${id})`} />
    </g>
  ),
  bolt: () => <path d="M36 8L16 36h13l-4 20 22-29H34z" fill={W} />,
  planet: () => (
    <g>
      <circle cx="32" cy="32" r="13" fill={W} />
      <ellipse cx="32" cy="34" rx="24" ry="7" fill="none" stroke={W} strokeWidth="3.5" transform="rotate(-18 32 34)" />
    </g>
  ),
  paw: () => (
    <g fill={W}>
      <ellipse cx="32" cy="40" rx="12" ry="10" />
      <ellipse cx="18" cy="27" rx="5" ry="6.5" />
      <ellipse cx="27" cy="19" rx="5" ry="6.5" />
      <ellipse cx="37" cy="19" rx="5" ry="6.5" />
      <ellipse cx="46" cy="27" rx="5" ry="6.5" />
    </g>
  ),
  leaf: () => (
    <g>
      <path d="M14 50C12 26 28 12 52 12c0 24-14 40-38 38z" fill={W} />
      <path d="M16 48L44 20" stroke="rgba(0,0,0,.25)" strokeWidth="2.5" />
    </g>
  ),
  flame: () => <path d="M32 6c4 10 14 16 14 30a14 14 0 0 1-28 0c0-8 5-12 7-18 2 5 5 7 7 7-1-7-1-13 0-19z" fill={W} />,
  snow: () => (
    <g stroke={W} strokeWidth="4" strokeLinecap="round">
      {[0, 60, 120].map((a) => (
        <g key={a} transform={`rotate(${a} 32 32)`}>
          <path d="M32 9v46M26 14l6 6 6-6M26 50l6-6 6 6" fill="none" />
        </g>
      ))}
    </g>
  ),
  star: () => <path d="M32 7l7.3 15 16.4 2.3-11.9 11.6 2.8 16.4L32 44.6l-14.6 7.7 2.8-16.4L8.3 24.3l16.4-2.3z" fill={W} />,
  rocket: () => (
    <g>
      <path d="M32 6c10 8 13 20 10 34H22c-3-14 0-26 10-34z" fill={W} />
      <circle cx="32" cy="22" r="5" fill="rgba(0,0,0,.3)" />
      <path d="M22 32l-8 12 9-2M42 32l8 12-9-2" fill={W} />
      <path d="M27 44l5 12 5-12z" fill="#ffd166" />
    </g>
  ),
  gear: () => (
    <g fill={W}>
      {[0, 45, 90, 135].map((a) => (
        <rect key={a} x="28" y="8" width="8" height="48" rx="2" transform={`rotate(${a} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="16" />
      <circle cx="32" cy="32" r="6" fill="rgba(0,0,0,.35)" />
    </g>
  ),
  ghost: () => (
    <g>
      <path d="M14 54V30a18 18 0 0 1 36 0v24l-6-5-6 5-6-5-6 5-6-5z" fill={W} />
      <circle cx="25" cy="30" r="4" fill="#2a2440" />
      <circle cx="39" cy="30" r="4" fill="#2a2440" />
    </g>
  ),
  crown: () => (
    <g>
      <path d="M10 46l-2-28 13 11 11-17 11 17 13-11-2 28z" fill={W} />
      <rect x="10" y="48" width="44" height="6" rx="2" fill={W} />
      <circle cx="32" cy="36" r="3.5" fill="#c0392b" />
    </g>
  ),
  note: () => (
    <g fill={W}>
      <path d="M26 44V14l22-5v28" fill="none" stroke={W} strokeWidth="4.5" strokeLinejoin="round" />
      <ellipse cx="20" cy="45" rx="8" ry="6.5" />
      <ellipse cx="42" cy="38" rx="8" ry="6.5" />
    </g>
  ),
  sun: () => (
    <g>
      <circle cx="32" cy="32" r="11" fill={W} />
      <g stroke={W} strokeWidth="4" strokeLinecap="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <path key={a} d="M32 8v7" transform={`rotate(${a} 32 32)`} />
        ))}
      </g>
    </g>
  ),
  diamond: () => (
    <g>
      <path d="M12 24l10-12h20l10 12-20 28z" fill={W} />
      <path d="M12 24h40M22 12l10 40 10-40" stroke="rgba(0,0,0,.2)" strokeWidth="2" fill="none" />
    </g>
  ),
  heart: () => <path d="M32 54S8 40 8 24a12 12 0 0 1 24-4 12 12 0 0 1 24 4c0 16-24 30-24 30z" fill={W} />,
};

function Gamerpic({ id, avatar, size = 64, className = '' }) {
  const raw = useId();
  const uid = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  const pic = GAMERPIC_BY_ID[id] || GAMERPIC_BY_ID.orb;
  const isAvatar = pic.glyph === 'avatar' && avatar;
  if (pic.src) {
    return (
      <span className={`gamerpic ${className}`} style={{ width: size, height: size }}>
        <img src={pic.src} alt="" width={size} height={size} draggable={false} style={{ display: 'block', width: '100%', height: '100%' }} />
      </span>
    );
  }
  return (
    <span className={`gamerpic ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
        <defs>
          <linearGradient id={`bg${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={pic.from} />
            <stop offset="1" stopColor={pic.to} />
          </linearGradient>
          <radialGradient id={`orb${uid}`} cx="38%" cy="34%" r="70%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".6" stopColor="#d9dedb" />
            <stop offset="1" stopColor="#8b948d" />
          </radialGradient>
        </defs>
        <rect width="64" height="64" fill={`url(#bg${uid})`} />
        <rect width="64" height="32" fill="rgba(255,255,255,.12)" />
        {!isAvatar && (GLYPHS[pic.glyph] || GLYPHS.orb)(uid)}
      </svg>
      {isAvatar && <Avatar config={avatar} crop="head" className="gamerpic-avatar" />}
    </span>
  );
}

export default memo(Gamerpic);

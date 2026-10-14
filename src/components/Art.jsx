import { memo, useId } from 'react';
import Icon from './Icon.jsx';

// Generated placeholder artwork. Each motif is plain SVG geometry tinted
// by a hue, so the library looks varied without any copyrighted images.

const hsl = (h, s, l, a = 1) => `hsla(${((h % 360) + 360) % 360}, ${s}%, ${l}%, ${a})`;

function Motif({ motif, hue }) {
  const hi = hsl(hue + 25, 85, 70, 0.55);
  const mid = hsl(hue + 10, 70, 45, 0.6);
  switch (motif) {
    case 'rings':
      return (
        <g fill="none">
          {[40, 80, 120, 160, 200, 240].map((r, i) => (
            <circle key={r} cx="300" cy="120" r={r} stroke={i % 2 ? hi : mid} strokeWidth={14 - i} />
          ))}
          <circle cx="300" cy="120" r="22" fill={hsl(hue + 40, 90, 80, 0.85)} />
        </g>
      );
    case 'stripes':
      return (
        <g transform="rotate(-28 200 150)">
          {[-120, -40, 40, 120, 200, 280, 360].map((x, i) => (
            <rect key={x} x={x} y="-200" width={i % 2 ? 26 : 50} height="700" fill={i % 2 ? hi : mid} />
          ))}
        </g>
      );
    case 'peaks':
      return (
        <g>
          <circle cx="290" cy="90" r="44" fill={hsl(hue + 40, 95, 78, 0.9)} />
          <path d="M0 240 L80 140 L150 210 L230 110 L320 220 L400 150 L400 300 L0 300Z" fill={hsl(hue, 45, 30, 0.85)} />
          <path d="M0 270 L60 210 L140 260 L210 190 L300 270 L400 210 L400 300 L0 300Z" fill={hsl(hue - 10, 50, 18, 0.95)} />
        </g>
      );
    case 'grid':
      return (
        <g>
          <rect x="0" y="0" width="400" height="160" fill={hsl(hue + 30, 90, 60, 0.18)} />
          <circle cx="200" cy="160" r="70" fill={hsl(hue + 40, 95, 70, 0.6)} />
          <rect x="0" y="160" width="400" height="140" fill={hsl(hue, 60, 10, 0.75)} />
          {[-400, -280, -160, -40, 80, 200, 320, 440, 560, 680, 800].map((x) => (
            <path key={x} d={`M200 160 L${x} 300`} stroke={hi} strokeWidth="2" />
          ))}
          {[170, 185, 205, 232, 265].map((y) => (
            <path key={y} d={`M0 ${y} L400 ${y}`} stroke={hi} strokeWidth="2" />
          ))}
        </g>
      );
    case 'burst':
      return (
        <g>
          {Array.from({ length: 18 }, (_, i) => (
            <path key={i} d="M120 180 L600 150 L600 210 Z" fill={i % 2 ? hi : mid} opacity=".5" transform={`rotate(${i * 20} 120 180)`} />
          ))}
          <circle cx="120" cy="180" r="40" fill={hsl(hue + 40, 95, 80, 0.85)} />
        </g>
      );
    default:
      return (
        <g fill="none" strokeWidth="18">
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M-20 ${120 + i * 40} C 80 ${60 + i * 40}, 160 ${200 + i * 40}, 260 ${130 + i * 40} S 380 ${80 + i * 40}, 440 ${140 + i * 40}`}
              stroke={i % 2 ? hi : mid}
            />
          ))}
        </g>
      );
  }
}

export const PlaceholderArt = memo(function PlaceholderArt({ hue = 120, motif = 'waves', className = '' }) {
  const gid = `ph${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg className={`ph-art ${className}`} viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={hsl(hue, 60, 30)} />
          <stop offset="1" stopColor={hsl(hue + 35, 70, 14)} />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${gid})`} />
      <Motif motif={motif} hue={hue} />
      <rect width="400" height="300" fill="url(#ph-vignette)" />
    </svg>
  );
});

// Shared defs (vignette) rendered once at the app root.
export function ArtDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <linearGradient id="ph-vignette" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(0,0,0,0)" />
          <stop offset=".6" stopColor="rgba(0,0,0,0)" />
          <stop offset="1" stopColor="rgba(0,0,0,.55)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Retail-style case art with the familiar green header band.
export const BoxArt = memo(function BoxArt({ game, className = '', showTitle = true }) {
  return (
    <div className={`boxart ${className}`}>
      <div className="boxart-band">
        <span className="boxart-orb" />
        <span className="boxart-brand">XBOX 360</span>
      </div>
      <div className="boxart-art">
        {game.cover ? (
          <img className="boxart-shot" src={game.cover} alt="" draggable={false} />
        ) : (
          <PlaceholderArt hue={game.hue} motif={game.motif} />
        )}
        {showTitle && (
          <div className="boxart-title">
            <span>{game.title.replace(/ \d+$/, '')}</span>
            <strong>{game.title.match(/\d+$/)?.[0]}</strong>
          </div>
        )}
      </div>
    </div>
  );
});

export const AppIcon = memo(function AppIcon({ app, size = 72 }) {
  return (
    <span className="app-icon" style={{ background: app.color }}>
      <Icon name={app.glyph} size={size} strokeWidth={2.2} />
    </span>
  );
});

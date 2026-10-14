import { ICONS } from '../data/icons.js';

// White glyphs traced from the reference captures (see src/data/icons.js).

function Paths({ icon }) {
  return (
    <>
      <path d={icon.d} fillRule="evenodd" />
      {icon.s && <path d={icon.s} fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />}
    </>
  );
}

// A glyph sized by its own bounding box (status bar, badges). `size` is the
// larger side; `tight` drops the square padding around narrow glyphs.
export default function Glyph({ name, size = 64, tight = false, className = '', style }) {
  const icon = ICONS[name];
  if (!icon) return null;
  const [x, y, w, h] = icon.b;
  const side = Math.max(w, h);
  const vb = tight ? `${x} ${y} ${w} ${h}` : `${(x - (side - w) / 2).toFixed(2)} ${(y - (side - h) / 2).toFixed(2)} ${side} ${side}`;
  const width = tight ? (size * w) / side : size;
  const height = tight ? (size * h) / side : size;
  return (
    <svg className={`glyph ${className}`} width={width} height={height} viewBox={vb} fill="currentColor" aria-hidden="true" style={style}>
      <Paths icon={icon} />
    </svg>
  );
}

// A tile's glyph drawn in the tile's own frame, so its size and position
// inside the tile match the capture exactly.
export function TileArt({ name }) {
  const icon = ICONS[name];
  if (!icon) return null;
  return (
    <svg
      className="tile-icon-art"
      data-icon={name}
      viewBox={`0 0 ${icon.f[0]} ${icon.f[1]}`}
      preserveAspectRatio="xMidYMid meet"
      fill="currentColor"
      aria-hidden="true"
    >
      <Paths icon={icon} />
    </svg>
  );
}

// Gamerscore badge: the traced ringed G.
export function GBadge({ size = 26, big = false }) {
  return <Glyph name={big ? 'g-big' : 'g'} size={size} tight className="g-badge" />;
}

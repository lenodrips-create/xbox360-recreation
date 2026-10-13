// Solid white glyphs in the style of the 2013-2015 dashboard tiles.
// Original vector drawings on a 64x64 grid; holes use the even-odd rule.

function gearPath(cx, cy, rOuter, rInner, teeth, hole) {
  const pts = [];
  const step = (Math.PI * 2) / (teeth * 2);
  for (let i = 0; i < teeth * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a0 = i * step - step / 2;
    const a1 = i * step + step / 2;
    pts.push([cx + r * Math.cos(a0), cy + r * Math.sin(a0)], [cx + r * Math.cos(a1), cy + r * Math.sin(a1)]);
  }
  const ring = `M${pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L')} Z`;
  return `${ring} M${cx + hole} ${cy} A${hole} ${hole} 0 1 0 ${cx - hole} ${cy} A${hole} ${hole} 0 1 0 ${cx + hole} ${cy} Z`;
}

// "Xbox person" silhouette: round head and a body with a sloped shoulder.
const person = (x, y, s = 1) =>
  `M${x + 16 * s} ${y} a${9 * s} ${9 * s} 0 1 1 -0.01 0 Z ` +
  `M${x} ${y + 21 * s} h${23 * s} q${6 * s} 0 ${6 * s} ${6 * s} v${25 * s} h${-15 * s} v${-12 * s} l${-14 * s} ${-13 * s} Z`;

const G = {
  person: <path d={person(17, 4, 1.08)} />,
  pin: (
    <g transform="rotate(42 32 32)">
      <rect x="23" y="5" width="18" height="7" rx="1.5" />
      <path d="M27 12h10l1 17H26z" />
      <path d="M18 29h28l-3 6H21z" />
      <rect x="30.5" y="35" width="3" height="24" rx="1.5" />
    </g>
  ),
  recent: (
    <g fill="none" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="32" cy="32" r="22" />
      <path d="M32 18v15h10" />
    </g>
  ),
  games: (
    <path
      fillRule="evenodd"
      d="M16 18h32c7 0 11 7 12 16l2 12c1 7-6 10-10 5l-7-8H19l-7 8c-4 5-11 2-10-5l2-12c1-9 5-16 12-16z
         M17 27h4v4h4v4h-4v4h-4v-4h-4v-4h4z
         M44 27a2.6 2.6 0 1 0 0.01 0z M50 33a2.6 2.6 0 1 0 0.01 0z M38 33a2.6 2.6 0 1 0 0.01 0z M44 38a2.6 2.6 0 1 0 0.01 0z"
    />
  ),
  apps: (
    <>
      <rect x="4" y="19" width="31" height="24" />
      <rect x="38" y="19" width="22" height="10.5" />
      <rect x="38" y="32.5" width="22" height="10.5" />
    </>
  ),
  profile: (
    <>
      <path fillRule="evenodd" d="M14 6h36v52H14z M18.5 10.5h27v31h-27z" />
      <circle cx="32" cy="24" r="5" />
      <path d="M24 41.5l1-9q0.6-3.5 4-3.5h6q3.4 0 4 3.5l1 9z" />
    </>
  ),
  account: (
    <>
      <path d={person(8, 4, 0.95)} />
      <path fillRule="evenodd" d={gearPath(47, 47, 12, 9, 8, 4)} />
    </>
  ),
  friends: <path d={person(17, 4, 1.08)} />,
  activity: (
    <>
      <path d={person(4, 4, 0.55)} />
      <path fillRule="evenodd" d="M30 6h30v20H30z M34 11h22v3H34z M34 17h15v3H34z" />
      <path d={person(4, 34, 0.55)} />
      <path d={person(34, 34, 0.55)} />
    </>
  ),
  store: (
    <>
      <path d="M13 24h38l-3 34H16z" />
      <path d="M23 25v-6a9 9 0 0 1 18 0v6" fill="none" stroke="#fff" strokeWidth="4.5" />
    </>
  ),
  signin: (
    <>
      <path d={person(6, 2, 0.95)} />
      <path
        fillRule="evenodd"
        d="M46 34a12 12 0 1 0 0.01 0z M46 37.5a8.5 8.5 0 1 1 -0.01 0z M44.4 40h3.2v6.4H54v3.2h-6.4V56h-3.2v-6.4H38v-3.2h6.4z"
      />
    </>
  ),
  system: <path fillRule="evenodd" d="M25 6h14q3 0 3 3l-3 44q-0.2 3-3 3h-8q-2.8 0-3-3L22 9q0-3 3-3z M32 35a3 3 0 1 0 0.01 0z" />,
  preferences: (
    <>
      {[16, 26, 36, 46].map((y) => (
        <g key={y}>
          <circle cx="11" cy={y} r="3.6" />
          <rect x="19" y={y - 2.6} width="38" height="5.2" rx="1" />
        </g>
      ))}
    </>
  ),
  kinect: (
    <>
      <path
        fillRule="evenodd"
        d="M10 25h44a6 6 0 0 1 0 12H10a6 6 0 0 1 0-12z M20 28.2a2.8 2.8 0 1 0 0.01 0z M32 28.2a2.8 2.8 0 1 0 0.01 0z M44 28.2a2.8 2.8 0 1 0 0.01 0z"
      />
      <rect x="29" y="37" width="6" height="4" />
      <rect x="22" y="41" width="20" height="3" rx="1.5" />
    </>
  ),
  privacy: (
    <>
      <rect x="15" y="28" width="34" height="28" rx="3" />
      <path d="M22 29v-7a10 10 0 0 1 20 0v7" fill="none" stroke="#fff" strokeWidth="6" />
    </>
  ),
  family: (
    <>
      <path d={person(4, 3, 0.95)} />
      <path d={person(34, 26, 0.68)} />
    </>
  ),
  power: (
    <g fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round">
      <path d="M21 17a20 20 0 1 0 22 0" />
      <path d="M32 7v22" />
    </g>
  ),
  disc: <path fillRule="evenodd" d="M32 6a26 26 0 1 0 0.01 0z M32 22a10 10 0 1 1 -0.01 0z M32 28a4 4 0 1 0 0.01 0z" />,
  mail: (
    <>
      <path d="M6 13h52L32 33z" />
      <path d="M6 19l26 19 26-19v32H6z" />
    </>
  ),
};

export default function Glyph({ name, size = 64, className = '', style }) {
  return (
    <svg className={`glyph ${className}`} width={size} height={size} viewBox="0 0 64 64" fill="#fff" aria-hidden="true" style={style}>
      {G[name] || G.person}
    </svg>
  );
}

// Gamerscore badge: a solid disc with the G knocked out.
export function GBadge({ size = 26 }) {
  return (
    <svg className="g-badge" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11.5" fill="currentColor" />
      <path d="M16.6 8.6A5.6 5.6 0 1 0 17.6 13.2H12.4" fill="none" stroke="rgba(0,0,0,.55)" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

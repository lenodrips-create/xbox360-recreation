import { memo, useId } from 'react';

// Stylised full-body avatar drawn in SVG (original artwork). Big head,
// small body and soft shading, in the spirit of 2008-2013 console avatars.

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const f = (c) => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
  r = f(r);
  g = f(g);
  b = f(b);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const TORSO = { slim: 84, average: 98, broad: 114 };

function HairBack({ style, color }) {
  if (style === 'long') return <path d="M58 118 Q54 46 120 42 Q186 46 182 118 L188 222 Q152 236 120 230 Q88 236 52 222 Z" fill={color} />;
  if (style === 'bob') return <path d="M56 118 Q52 46 120 44 Q188 46 184 118 L188 176 Q170 188 148 180 L92 180 Q70 188 52 176 Z" fill={color} />;
  if (style === 'ponytail')
    return (
      <g>
        <ellipse cx="176" cy="150" rx="17" ry="40" transform="rotate(-18 176 150)" fill={color} />
        <ellipse cx="166" cy="104" rx="9" ry="7" fill={shade(color, -0.35)} />
      </g>
    );
  if (style === 'curly') return <ellipse cx="120" cy="104" rx="72" ry="66" fill={color} />;
  return null;
}

function HairFront({ style, color }) {
  const dark = shade(color, -0.25);
  switch (style) {
    case 'short':
      return <path d="M60 118 Q56 52 120 48 Q184 52 180 118 Q170 90 148 84 Q120 96 92 84 Q70 90 60 118 Z" fill={color} />;
    case 'spiky':
      return (
        <path
          d="M60 118 L54 84 L74 90 L70 58 L92 72 L96 42 L114 66 L124 34 L134 64 L152 42 L156 72 L174 58 L170 90 L188 84 L180 118 Q166 90 120 90 Q74 90 60 118 Z"
          fill={color}
        />
      );
    case 'swept':
      return (
        <g>
          <path d="M60 122 Q54 54 118 48 Q182 48 182 110 Q166 82 136 82 Q104 84 78 104 Q66 112 60 122 Z" fill={color} />
          <path d="M86 70 Q120 54 166 76" stroke={dark} strokeWidth="3" fill="none" opacity=".5" />
        </g>
      );
    case 'curly':
      return (
        <g fill={color}>
          {[
            [66, 98, 16],
            [76, 74, 17],
            [96, 58, 18],
            [120, 52, 18],
            [144, 58, 18],
            [164, 74, 17],
            [174, 98, 16],
            [104, 80, 14],
            [136, 80, 14],
          ].map(([x, y, r]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
          ))}
        </g>
      );
    case 'long':
      return <path d="M60 126 Q56 50 120 46 Q184 50 180 126 Q172 82 126 76 Q118 92 100 96 Q72 102 60 126 Z" fill={color} />;
    case 'bob':
      return <path d="M60 122 Q56 48 120 46 Q184 48 180 122 Q178 100 168 98 L72 98 Q62 100 60 122 Z" fill={color} />;
    case 'ponytail':
      return <path d="M60 118 Q56 50 120 46 Q184 50 180 118 Q160 78 120 78 Q80 78 60 118 Z" fill={color} />;
    case 'mohawk':
      return (
        <g>
          <path d="M64 112 Q62 62 120 56 Q178 62 176 112 Q170 84 120 80 Q70 84 64 112 Z" fill={color} opacity=".35" />
          <path d="M106 60 L108 22 L118 36 L124 14 L132 36 L142 22 L136 62 Q120 70 106 60 Z" fill={color} />
        </g>
      );
    case 'buzz':
      return <path d="M62 112 Q60 56 120 52 Q180 56 178 112 Q170 80 120 76 Q70 80 62 112 Z" fill={color} opacity=".85" />;
    default:
      return null;
  }
}

function Eyes({ style, color }) {
  const pos = [98, 142];
  if (style === 'happy') {
    return (
      <g className="av-eyes">
        {pos.map((x) => (
          <path key={x} d={`M${x - 10} 131 Q${x} 118 ${x + 10} 131`} stroke="#2a1d16" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        ))}
      </g>
    );
  }
  const big = style === 'wide';
  const rx = big ? 13 : 11;
  const ry = style === 'narrow' ? 7 : big ? 15 : 13;
  const ir = big ? 8.5 : style === 'narrow' ? 6 : 7.5;
  return (
    <g className="av-eyes">
      {pos.map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="128" rx={rx} ry={ry} fill="#fff" />
          <circle cx={x + 1} cy="129" r={ir} fill={color} />
          <circle cx={x + 1} cy="129" r={ir * 0.5} fill="#111" />
          <circle cx={x + 4} cy="125" r="2.4" fill="#fff" />
          <ellipse cx={x} cy="128" rx={rx} ry={ry} fill="none" stroke="rgba(0,0,0,.25)" strokeWidth="1.5" />
        </g>
      ))}
    </g>
  );
}

function Mouth({ style }) {
  switch (style) {
    case 'grin':
      return (
        <g>
          <path d="M103 150 Q120 172 137 150 Z" fill="#fff" stroke="#7a3b2e" strokeWidth="3" strokeLinejoin="round" />
        </g>
      );
    case 'neutral':
      return <path d="M110 157 L130 157" stroke="#7a3b2e" strokeWidth="3.5" strokeLinecap="round" />;
    case 'open':
      return (
        <g>
          <ellipse cx="120" cy="156" rx="10" ry="8" fill="#6a2a22" />
          <ellipse cx="120" cy="160" rx="6" ry="3" fill="#d9707a" />
        </g>
      );
    default:
      return <path d="M106 151 Q120 164 134 151" stroke="#7a3b2e" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
  }
}

function Accessory({ kind, color }) {
  switch (kind) {
    case 'glasses':
      return (
        <g stroke="#1e1e1e" strokeWidth="4" fill="rgba(255,255,255,.12)">
          <rect x="82" y="116" width="32" height="25" rx="7" />
          <rect x="126" y="116" width="32" height="25" rx="7" />
          <path d="M114 126 L126 126" fill="none" />
          <path d="M82 124 L64 120 M158 124 L176 120" fill="none" />
        </g>
      );
    case 'cap':
      return (
        <g>
          <path d="M56 104 Q56 38 120 38 Q184 38 184 104 Q150 92 120 92 Q90 92 56 104 Z" fill={color} />
          <path d="M150 96 Q204 92 218 106 Q190 112 146 106 Z" fill={shade(color, -0.25)} />
          <circle cx="120" cy="40" r="5" fill={shade(color, -0.3)} />
        </g>
      );
    case 'headphones':
      return (
        <g>
          <path d="M58 122 Q56 32 120 32 Q184 32 182 122" stroke="#2b2b2b" strokeWidth="9" fill="none" />
          <rect x="44" y="104" width="22" height="42" rx="9" fill="#2b2b2b" />
          <rect x="174" y="104" width="22" height="42" rx="9" fill="#2b2b2b" />
          <rect x="48" y="112" width="6" height="26" rx="3" fill="#5db12b" />
          <rect x="186" y="112" width="6" height="26" rx="3" fill="#5db12b" />
        </g>
      );
    case 'beanie':
      return (
        <g>
          <path d="M56 104 Q56 34 120 34 Q184 34 184 104 Z" fill={color} />
          <rect x="54" y="92" width="132" height="20" rx="8" fill={shade(color, -0.2)} />
          <circle cx="120" cy="32" r="11" fill={shade(color, 0.3)} />
        </g>
      );
    default:
      return null;
  }
}

function Avatar({ config, className = '', pose = 'idle', delay = 0, title, crop }) {
  const raw = useId();
  const uid = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  const c = config;
  const skin = c.skin;
  const skinDark = shade(skin, -0.18);
  const shirt = c.topColor;
  const shirtDark = shade(shirt, -0.22);
  const pants = c.bottomColor;
  const tw = TORSO[c.body] || TORSO.average;
  const sw = tw / 2;
  const ww = sw - 9;
  const legLen = 124 * (c.height || 1);
  const hipY = 300;
  const footY = hipY + legLen;
  const offsetY = 466 - (footY + 14);
  const longSleeve = c.top === 'hoodie' || c.top === 'jacket';
  const shorts = c.bottoms === 'shorts';
  const legW = 30;
  const lx = 120 - 4 - legW;
  const rx = 120 + 4;
  const accColor = c.top === 'jacket' ? shade(shirt, -0.1) : c.accessory === 'beanie' ? '#c0392b' : '#2f6fb5';

  const leftShoulder = 120 - sw + 10;
  const rightShoulder = 120 + sw - 10;

  return (
    <svg
      className={`avatar pose-${pose} ${className}`}
      viewBox={crop === 'head' ? `30 ${offsetY + 14} 180 180` : '0 0 240 480'}
      role="img"
      aria-label={title || 'Avatar'}
      style={{ '--av-delay': `${delay}s` }}
    >
      <defs>
        <radialGradient id={`sk${uid}`} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor={shade(skin, 0.18)} />
          <stop offset=".65" stopColor={skin} />
          <stop offset="1" stopColor={skinDark} />
        </radialGradient>
        <linearGradient id={`sh${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor={shade(shirt, 0.12)} />
          <stop offset=".55" stopColor={shirt} />
          <stop offset="1" stopColor={shirtDark} />
        </linearGradient>
        <linearGradient id={`pa${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor={shade(pants, 0.15)} />
          <stop offset="1" stopColor={shade(pants, -0.2)} />
        </linearGradient>
        <clipPath id={`tc${uid}`}>
          <path
            d={`M${120 - sw} 210 Q${120 - sw} 194 ${120 - sw + 16} 194 L${120 + sw - 16} 194 Q${120 + sw} 194 ${120 + sw} 210 L${120 + ww} 304 L${120 - ww} 304 Z`}
          />
        </clipPath>
      </defs>

      <g transform={`translate(0 ${offsetY})`}>
        <g className="av-body" style={{ transformOrigin: `120px ${footY + offsetY}px` }}>
          {/* legs */}
          <g>
            {[lx, rx].map((x) => (
              <g key={x}>
                <rect x={x} y={hipY - 8} width={legW} height={legLen} rx="12" fill={shorts ? skin : `url(#pa${uid})`} />
                {shorts && <rect x={x - 1} y={hipY - 8} width={legW + 2} height={legLen * 0.42} rx="10" fill={`url(#pa${uid})`} />}
                {!shorts && c.bottoms === 'cargo' && (
                  <rect x={x + 4} y={hipY + legLen * 0.35} width={legW - 8} height="22" rx="3" fill={shade(pants, -0.15)} />
                )}
              </g>
            ))}
            {/* shoes */}
            <ellipse cx={lx + legW / 2 - 6} cy={footY + 2} rx="22" ry="12" fill={c.shoeColor} stroke="rgba(0,0,0,.25)" strokeWidth="2" />
            <ellipse cx={rx + legW / 2 + 6} cy={footY + 2} rx="22" ry="12" fill={c.shoeColor} stroke="rgba(0,0,0,.25)" strokeWidth="2" />
            <rect x={lx - 16} y={footY + 6} width="44" height="6" rx="3" fill="rgba(0,0,0,.25)" />
            <rect x={rx + 2} y={footY + 6} width="44" height="6" rx="3" fill="rgba(0,0,0,.25)" />
          </g>

          {/* arms (behind torso) */}
          <g className="av-arm av-arm-l" style={{ transformOrigin: `${leftShoulder}px ${206 + offsetY}px` }}>
            <path
              d={`M${leftShoulder} 206 L${leftShoulder - 14} 292`}
              stroke={longSleeve ? `url(#sh${uid})` : skin}
              strokeWidth="22"
              strokeLinecap="round"
            />
            {!longSleeve && <path d={`M${leftShoulder} 206 L${leftShoulder - 6} 246`} stroke={shirt} strokeWidth="25" strokeLinecap="round" />}
            <circle cx={leftShoulder - 15} cy="300" r="12" fill={skin} />
          </g>
          <g className="av-arm av-arm-r" style={{ transformOrigin: `${rightShoulder}px ${206 + offsetY}px` }}>
            <path
              d={`M${rightShoulder} 206 L${rightShoulder + 14} 292`}
              stroke={longSleeve ? `url(#sh${uid})` : skin}
              strokeWidth="22"
              strokeLinecap="round"
            />
            {!longSleeve && <path d={`M${rightShoulder} 206 L${rightShoulder + 6} 246`} stroke={shirt} strokeWidth="25" strokeLinecap="round" />}
            <circle cx={rightShoulder + 15} cy="300" r="12" fill={skin} />
          </g>

          {/* neck */}
          <rect x="108" y="170" width="24" height="34" rx="8" fill={skinDark} />

          {/* torso */}
          <g clipPath={`url(#tc${uid})`}>
            <rect x="40" y="190" width="160" height="120" fill={`url(#sh${uid})`} />
            {c.top === 'stripe' &&
              [214, 238, 262, 286].map((y) => <rect key={y} x="40" y={y} width="160" height="10" fill="rgba(255,255,255,.55)" />)}
            {c.top === 'logo' && (
              <g>
                <circle cx="120" cy="244" r="18" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="6" />
                <circle cx="120" cy="244" r="7" fill="rgba(255,255,255,.85)" />
              </g>
            )}
            {c.top === 'hoodie' && (
              <g>
                <path d={`M${120 - 30} 272 L${120 + 30} 272 L${120 + 24} 300 L${120 - 24} 300 Z`} fill={shirtDark} opacity=".6" />
                <path d="M112 200 L110 236 M128 200 L130 236" stroke="#f2f2f2" strokeWidth="3" />
              </g>
            )}
            {c.top === 'jacket' && (
              <g>
                <path d="M110 194 L120 304 L130 194 Z" fill="#f2f2f2" />
                <path d="M120 200 L120 304" stroke={shirtDark} strokeWidth="3" />
                <rect x={120 - sw} y="190" width="10" height="120" fill="rgba(255,255,255,.75)" />
                <rect x={120 + sw - 10} y="190" width="10" height="120" fill="rgba(255,255,255,.75)" />
              </g>
            )}
            <rect x="40" y="292" width="160" height="14" fill="rgba(0,0,0,.12)" />
          </g>
          {c.top === 'hoodie' && <path d={`M${120 - 34} 200 Q120 222 ${120 + 34} 200 Q120 206 ${120 - 34} 200 Z`} fill={shirtDark} />}
          {c.top !== 'hoodie' && <path d="M108 194 Q120 210 132 194" stroke="rgba(0,0,0,.18)" strokeWidth="4" fill="none" />}

          {/* head */}
          <g className="av-head" style={{ transformOrigin: `120px ${186 + offsetY}px` }}>
            <HairBack style={c.hair} color={c.hairColor} />
            <ellipse cx="60" cy="128" rx="10" ry="14" fill={skinDark} />
            <ellipse cx="180" cy="128" rx="10" ry="14" fill={skinDark} />
            <ellipse cx="120" cy="116" rx="60" ry="66" fill={`url(#sk${uid})`} />
            <ellipse cx="88" cy="150" rx="9" ry="5" fill="#ff8a8a" opacity=".18" />
            <ellipse cx="152" cy="150" rx="9" ry="5" fill="#ff8a8a" opacity=".18" />
            <Eyes style={c.eyes} color={c.eyeColor} />
            <path
              d="M86 108 Q98 101 110 106 M130 106 Q142 101 154 108"
              stroke={c.hair === 'bald' ? skinDark : shade(c.hairColor, -0.1)}
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
            />
            <path d="M118 134 Q113 144 121 146" stroke={skinDark} strokeWidth="3" fill="none" strokeLinecap="round" />
            <Mouth style={c.mouth} />
            <HairFront style={c.hair} color={c.hairColor} />
            <Accessory kind={c.accessory} color={accColor} />
          </g>
        </g>
      </g>
    </svg>
  );
}

export default memo(Avatar);

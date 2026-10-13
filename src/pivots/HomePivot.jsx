import { useMemo } from 'react';
import { Tile } from '../components/ui.jsx';
import Glyph from '../components/Glyph.jsx';
import { PlaceholderArt } from '../components/Art.jsx';
import { GAME_BY_ID } from '../data/games.js';
import { useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';

// A deterministic QR-style pattern (decorative, encodes nothing).
function QrPattern({ size = 234 }) {
  const cells = useMemo(() => {
    const n = 29;
    const out = [];
    let s = 1337;
    const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    const inFinder = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
    const inCenter = (x, y) => Math.abs(x - 14) < 5 && Math.abs(y - 14) < 5;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && !inCenter(x, y) && rnd() > 0.52) out.push([x, y]);
    return { n, out };
  }, []);
  const { n, out } = cells;
  const finder = (x, y) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="7" height="7" fill="#fff" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#000" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="#fff" />
    </g>
  );
  return (
    <svg className="qr" width={size} height={size} viewBox={`-1 -1 ${n + 2} ${n + 2}`} shapeRendering="crispEdges" aria-hidden="true">
      <rect x="-1" y="-1" width={n + 2} height={n + 2} fill="#000" />
      {out.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#fff" />
      ))}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
      <circle cx="14.5" cy="14.5" r="4.6" fill="#000" stroke="#fff" strokeWidth="0.9" />
      <circle cx="14.5" cy="14.5" r="2.6" fill="#fff" />
    </svg>
  );
}

export default function HomePivot() {
  const ui = useUI();
  const { actions } = useStore();
  const game = GAME_BY_ID.g01;

  return (
    <div className="grid-home">
      <Tile
        id="home-play"
        at={[1, 1, 1, 1]}
        variant="art"
        className="tile-play-game"
        onSelect={() => {
          actions.touchRecent(`game:${game.id}`);
          ui.push('launch', { kind: 'game', id: game.id });
        }}
        ariaLabel={`Play ${game.title}`}
        label={`Play ${game.title}`}
      >
        <PlaceholderArt hue={game.hue} motif={game.motif} />
        <Glyph name="disc" size={34} className="tile-glyph tr disc" />
      </Tile>
      <Tile id="home-pins" at={[1, 2, 1, 1]} label="My Pins" onSelect={() => ui.push('pins')}>
        <Glyph name="pin" size={84} className="tile-glyph" />
      </Tile>
      <Tile
        id="home-ad"
        at={[2, 1, 2, 2]}
        variant="art"
        className="tile-ad"
        onSelect={() => ui.push('offer', { id: 'games-01' })}
        ariaLabel="Featured"
      >
        <PlaceholderArt hue={212} motif="burst" />
        <span className="ad-placeholder">Spotlight placeholder</span>
      </Tile>
      <Tile
        id="home-promo"
        at={[4, 1, 2, 2]}
        variant="promo"
        className="tile-promo"
        isDefault
        onSelect={() => ui.push('marketplace', { category: 'games' })}
        ariaLabel="Experience next-gen performance. Upgrade Today."
      >
        <QrPattern />
        <span className="promo-text">
          Experience next-gen performance.
          <br />
          Upgrade Today.
        </span>
      </Tile>
      <Tile id="home-recent" at={[1, 3, 1, 1]} label="Recent" onSelect={() => ui.push('recent')}>
        <Glyph name="recent" size={80} className="tile-glyph" />
      </Tile>
      <Tile id="home-games" at={[2, 3, 1, 1]} label="My Games" onSelect={() => ui.push('games')}>
        <Glyph name="games" size={84} className="tile-glyph" />
      </Tile>
      <Tile id="home-apps" at={[3, 3, 1, 1]} label="My Apps" onSelect={() => ui.push('apps')}>
        <Glyph name="apps" size={84} className="tile-glyph" />
      </Tile>
      <Tile id="home-profile" at={[4, 3, 1, 1]} label="Profile" onSelect={() => ui.push('profile')}>
        <Glyph name="profile" size={80} className="tile-glyph" />
      </Tile>
      <Tile id="home-account" at={[5, 3, 1, 1]} label="Account" onSelect={() => ui.push('settings.account')}>
        <Glyph name="account" size={80} className="tile-glyph" />
      </Tile>
    </div>
  );
}

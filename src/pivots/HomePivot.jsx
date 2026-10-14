import { Tile } from '../components/ui.jsx';
import { TileArt } from '../components/Glyph.jsx';
import { BoxArt, PlaceholderArt } from '../components/Art.jsx';
import { REF } from '../data/reference.js';
import { useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';
import { useLibrary } from '../games/LibraryProvider.jsx';

// Covers for the spotlight before any game has been added.
const SAMPLE_COVERS = [
  { id: 's1', title: '', hue: 118, motif: 'burst' },
  { id: 's2', title: '', hue: 205, motif: 'rings' },
  { id: 's3', title: '', hue: 28, motif: 'waves' },
];

// The game played last, otherwise the newest one added.
function useLastGame() {
  const { state } = useStore();
  const { games, byId } = useLibrary();
  const key = state.recent.find((k) => k.startsWith('game:') && byId[k.slice(5)]);
  if (key) return byId[key.slice(5)];
  return games.reduce((newest, g) => (!newest || g.addedAt > newest.addedAt ? g : newest), null);
}

function Spotlight({ games }) {
  const newest = [...games].sort((a, b) => b.addedAt - a.addedAt).slice(0, 3);
  const covers = newest.length ? newest : SAMPLE_COVERS;
  return (
    <div className="spotlight">
      <div className="spotlight-fan" aria-hidden="true">
        {covers.map((g, i) => (
          <div key={g.id} className={`spotlight-card c${i}`}>
            <BoxArt game={g} showTitle={!!newest.length} />
          </div>
        ))}
      </div>
      <div className="spotlight-copy">
        <span className="spotlight-kicker">{games.length ? 'my games' : 'bring your own games'}</span>
        <span className="spotlight-head">
          {games.length ? `${games.length} ${games.length === 1 ? 'game' : 'games'} on this device` : 'Play web games from your device'}
        </span>
        <span className="spotlight-sub">{games.length ? `Newest: ${newest[0].title}` : 'Load an .html file, a .zip or a folder'}</span>
      </div>
    </div>
  );
}

export default function HomePivot() {
  const ui = useUI();
  const { games } = useLibrary();
  const last = useLastGame();

  return (
    <div className="grid-home">
      {last ? (
        <Tile
          id="home-play"
          at={[1, 1, 1, 1]}
          variant="art"
          className="tile-play-game"
          onSelect={() => ui.push('play', { id: last.id })}
          ariaLabel={`Play ${last.title}`}
        >
          <PlaceholderArt hue={last.hue} motif={last.motif} className="tile-img" />
          <span className="play-disc" aria-hidden="true" />
          <span className="tile-label">Play {last.title}</span>
        </Tile>
      ) : (
        <Tile id="home-play" at={[1, 1, 1, 1]} className="tile-add" icon="plus" label="Add a Game" onSelect={() => ui.push('addGame')} />
      )}
      <Tile id="home-pins" at={[1, 2, 1, 1]} label="My Pins" onSelect={() => ui.push('pins')}>
        <TileArt name="pin" />
      </Tile>
      <Tile
        id="home-ad"
        at={[2, 1, 2, 2]}
        variant="art"
        className="tile-ad"
        onSelect={() => ui.push(games.length ? 'games' : 'addGame')}
        ariaLabel={games.length ? 'My Games' : 'Add a game'}
      >
        <Spotlight games={games} />
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
        <img className="qr" src={REF.qr} alt="" width={225} height={225} draggable={false} />
        <span className="promo-text">
          Experience next-gen performance.
          <br />
          Upgrade Today.
        </span>
      </Tile>
      <Tile id="home-recent" at={[1, 3, 1, 1]} label="Recent" onSelect={() => ui.push('recent')}>
        <TileArt name="recent" />
      </Tile>
      <Tile id="home-games" at={[2, 3, 1, 1]} label="My Games" onSelect={() => ui.push('games')}>
        <TileArt name="games" />
      </Tile>
      <Tile id="home-apps" at={[3, 3, 1, 1]} label="My Apps" onSelect={() => ui.push('apps')}>
        <TileArt name="apps" />
      </Tile>
      <Tile id="home-profile" at={[4, 3, 1, 1]} label="Profile" onSelect={() => ui.push('profile')}>
        <TileArt name="profile" />
      </Tile>
      <Tile id="home-account" at={[5, 3, 1, 1]} label="Account" onSelect={() => ui.push('settings.account')}>
        <TileArt name="account" />
      </Tile>
    </div>
  );
}

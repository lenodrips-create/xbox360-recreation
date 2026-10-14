import { Tile } from '../components/ui.jsx';
import { TileArt } from '../components/Glyph.jsx';
import { PlaceholderArt } from '../components/Art.jsx';
import { REF } from '../data/reference.js';
import { useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';
import { useLibrary } from '../games/LibraryProvider.jsx';

// The game played last, otherwise the newest one added.
function useLastGame() {
  const { state } = useStore();
  const { games, byId } = useLibrary();
  const key = state.recent.find((k) => k.startsWith('game:') && byId[k.slice(5)]);
  if (key) return byId[key.slice(5)];
  return games.reduce((newest, g) => (!newest || g.addedAt > newest.addedAt ? g : newest), null);
}

export default function HomePivot() {
  const ui = useUI();
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
          {last.cover ? (
            <img className="tile-img" src={last.cover} alt="" draggable={false} />
          ) : (
            <PlaceholderArt hue={last.hue} motif={last.motif} className="tile-img" />
          )}
          <span className="play-disc" aria-hidden="true" />
          <span className="tile-label">Play {last.title}</span>
        </Tile>
      ) : (
        <Tile id="home-play" at={[1, 1, 1, 1]} className="tile-add" icon="plus" label="Add ROMs" onSelect={() => ui.push('addGame')} />
      )}
      <Tile id="home-pins" at={[1, 2, 1, 1]} label="My Pins" onSelect={() => ui.push('pins')}>
        <TileArt name="pin" />
      </Tile>
      <Tile id="home-ad" at={[2, 1, 2, 2]} variant="art" className="tile-ad" snd={null} ariaLabel="Xbox Series X and Xbox Series S">
        <img className="tile-img" src={REF.ad} alt="" draggable={false} />
      </Tile>
      <Tile
        id="home-promo"
        at={[4, 1, 2, 2]}
        variant="promo"
        className="tile-promo"
        isDefault
        snd={null}
        ariaLabel="Experience next-gen performance. Upgrade Today."
      >
        <img className="tile-img" src={REF.promoBg} alt="" draggable={false} />
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

import { Tile } from '../components/ui.jsx';
import { TileArt } from '../components/Glyph.jsx';
import { REF } from '../data/reference.js';
import { GAME_BY_ID } from '../data/games.js';
import { useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';

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
      >
        <img className="tile-img" src={REF.play} alt="" draggable={false} />
        <span className="play-disc" aria-hidden="true" />
        <span className="tile-label">Play {game.title}</span>
      </Tile>
      <Tile id="home-pins" at={[1, 2, 1, 1]} label="My Pins" onSelect={() => ui.push('pins')}>
        <TileArt name="pin" />
      </Tile>
      <Tile id="home-ad" at={[2, 1, 2, 2]} variant="art" className="tile-ad" snd={null} ariaLabel="Featured">
        <img className="tile-img" src={REF.spotlight} alt="" draggable={false} />
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

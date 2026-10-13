import { Tile } from '../components/ui.jsx';
import Glyph from '../components/Glyph.jsx';
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
        <img className="tile-img" src={REF.spotlight} alt="" draggable={false} />
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
        <img className="qr" src={REF.qr} alt="" width={236} height={236} draggable={false} />
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

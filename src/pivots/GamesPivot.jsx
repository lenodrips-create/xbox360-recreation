import { useMemo } from 'react';
import { GIcon, Tile } from '../components/ui.jsx';
import { BoxArt, PlaceholderArt } from '../components/Art.jsx';
import { GAMES, GAME_BY_ID } from '../data/games.js';
import { gamerscoreOf, useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';

export default function GamesPivot() {
  const ui = useUI();
  const { state } = useStore();
  const score = useMemo(() => gamerscoreOf(state.unlocked), [state.unlocked]);
  const recentGames = state.recent.filter((k) => k.startsWith('game:')).map((k) => GAME_BY_ID[k.slice(5)]);
  const fill = GAMES.filter((g) => !recentGames.includes(g));
  const covers = [...recentGames, ...fill].slice(0, 4);
  const featured = GAME_BY_ID.g08;

  return (
    <div className="grid12">
      <Tile
        id="games-featured"
        at={[1, 1, 4, 4]}
        variant="art"
        className="tile-hero"
        isDefault
        onSelect={() => ui.push('game', { id: featured.id })}
        ariaLabel={featured.title}
      >
        <PlaceholderArt hue={featured.hue} motif={featured.motif} className="hero-bg" />
        <BoxArt game={featured} className="hero-box" />
        <span className="hero-info">
          <span className="hero-kicker">featured</span>
          <span className="hero-title">{featured.title}</span>
        </span>
      </Tile>
      <Tile id="games-demos" at={[1, 5, 2, 2]} icon="disc" label="game demos" onSelect={() => ui.push('marketplace', { category: 'demos' })} />
      <Tile id="games-market" at={[3, 5, 2, 2]} icon="bag" label="game marketplace" onSelect={() => ui.push('marketplace', { category: 'games' })} />

      <Tile id="games-mine" at={[5, 1, 4, 2]} className="tile-mygames" onSelect={() => ui.push('games')} ariaLabel="my games">
        <span className="mini-covers">
          {GAMES.slice(0, 5).map((g) => (
            <BoxArt key={g.id} game={g} showTitle={false} className="mini" />
          ))}
        </span>
        <span className="tile-label">my games</span>
        <span className="tile-sub">{GAMES.length} games</span>
      </Tile>
      <Tile
        id="games-achievements"
        at={[5, 3, 2, 2]}
        icon="trophy"
        label="achievements"
        sub={
          <>
            <GIcon size={16} /> {score.toLocaleString('en-US')}
          </>
        }
        onSelect={() => ui.push('achievementsAll')}
      />
      <Tile
        id="games-avatar"
        at={[7, 3, 2, 2]}
        variant="dark"
        icon="avatar"
        label="avatar marketplace"
        onSelect={() => ui.push('marketplace', { category: 'avatar' })}
      />
      <Tile id="games-arcade" at={[5, 5, 4, 2]} variant="art" onSelect={() => ui.push('marketplace', { category: 'arcade' })} ariaLabel="arcade">
        <PlaceholderArt hue={268} motif="grid" />
        <span className="art-label art-label-lg">arcade</span>
      </Tile>

      {covers.map((g, i) => (
        <Tile
          key={g.id}
          id={`games-cover-${i}`}
          at={[9 + (i % 2) * 2, 1 + Math.floor(i / 2) * 3, 2, 3]}
          variant="cover"
          onSelect={() => ui.push('game', { id: g.id })}
          ariaLabel={g.title}
        >
          <BoxArt game={g} />
        </Tile>
      ))}
    </div>
  );
}

import { Tile } from '../components/ui.jsx';
import { AppIcon, PlaceholderArt } from '../components/Art.jsx';
import { APPS } from '../data/catalog.js';
import { useUI } from '../state/ui.jsx';

const SLOTS = [
  [7, 3],
  [1, 5],
  [3, 5],
  [5, 5],
  [7, 5],
  [9, 1],
  [11, 1],
  [9, 3],
];

export default function AppsPivot() {
  const ui = useUI();
  const featured = APPS[0];
  return (
    <div className="grid12">
      <Tile
        id="apps-featured"
        at={[1, 1, 4, 4]}
        variant="app-hero"
        isDefault
        onSelect={() => ui.push('app', { id: featured.id })}
        ariaLabel={featured.title}
        style={{ '--app': featured.color }}
      >
        <span className="app-hero-icon">
          <AppIcon app={featured} size={170} />
        </span>
        <span className="hero-info">
          <span className="hero-kicker">featured app</span>
          <span className="hero-title">{featured.title}</span>
        </span>
      </Tile>
      <Tile id="apps-mine" at={[5, 1, 4, 2]} icon="apps" label="my apps" sub={`${APPS.length} apps`} onSelect={() => ui.push('apps')} />
      <Tile id="apps-market" at={[5, 3, 2, 2]} icon="bag" label="apps marketplace" onSelect={() => ui.push('marketplace', { category: 'apps' })} />
      {APPS.slice(1).map((app, i) => (
        <Tile
          key={app.id}
          id={`apps-${app.id}`}
          at={[SLOTS[i][0], SLOTS[i][1], 2, 2]}
          variant="app"
          style={{ '--app': app.color }}
          label={app.title.toLowerCase()}
          onSelect={() => ui.push('app', { id: app.id })}
        >
          <AppIcon app={app} size={80} />
        </Tile>
      ))}
      <Tile
        id="apps-recent"
        at={[11, 3, 2, 2]}
        variant="dark"
        icon="clock"
        label="recent apps"
        onSelect={() => ui.push('recent', { filter: 'app' })}
      />
      <Tile id="apps-spotlight" at={[9, 5, 4, 2]} variant="art" onSelect={() => ui.push('marketplace', { category: 'apps' })} ariaLabel="new apps">
        <PlaceholderArt hue={190} motif="waves" />
        <span className="art-label art-label-lg">new apps coming soon</span>
      </Tile>
    </div>
  );
}

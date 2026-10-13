import { Tile } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import { PlaceholderArt } from '../components/Art.jsx';
import { useUI } from '../state/ui.jsx';

const TRENDING = [
  { q: 'Game Title 03', hue: 300, motif: 'rings' },
  { q: 'avatar', hue: 40, motif: 'burst' },
  { q: 'theme', hue: 200, motif: 'waves' },
  { q: 'achievements', hue: 110, motif: 'peaks' },
];

const BROWSE = [
  { q: 'game', label: 'games', icon: 'controller' },
  { q: 'app', label: 'apps', icon: 'apps' },
  { q: 'friend', label: 'friends', icon: 'friends' },
  { q: 'settings', label: 'settings', icon: 'gear' },
];

export async function runSearch(ui, initial = '') {
  const q = await ui.keyboard({ title: 'Search with bing', value: initial, maxLength: 40 });
  if (q && q.trim()) ui.push('search', { q: q.trim() });
}

export default function BingPivot() {
  const ui = useUI();
  return (
    <div className="grid12">
      <Tile id="bing-search" at={[1, 1, 8, 2]} variant="search" isDefault onSelect={() => runSearch(ui)} ariaLabel="Search">
        <span className="bing-mark">bing</span>
        <span className="search-box">
          <span className="search-placeholder">Search games, apps, friends and settings</span>
          <Icon name="search" size={44} />
        </span>
      </Tile>
      <Tile
        id="bing-voice"
        at={[9, 1, 4, 2]}
        icon="mic"
        label="say “xbox bing”"
        sub="Voice search"
        onSelect={() => {
          ui.notify({ kind: 'info', title: 'Kinect not detected', text: 'Type your search instead', force: true });
          runSearch(ui);
        }}
      />
      {TRENDING.map((t, i) => (
        <Tile
          key={t.q}
          id={`bing-trend-${i}`}
          at={[1 + i * 3, 3, 3, 2]}
          variant="art"
          onSelect={() => ui.push('search', { q: t.q })}
          ariaLabel={`Search ${t.q}`}
        >
          <PlaceholderArt hue={t.hue} motif={t.motif} />
          <span className="art-kicker">trending</span>
          <span className="art-label">{t.q}</span>
        </Tile>
      ))}
      {BROWSE.map((b, i) => (
        <Tile
          key={b.q}
          id={`bing-browse-${i}`}
          at={[1 + i * 3, 5, 3, 2]}
          variant={i % 2 ? 'dark' : 'green'}
          icon={b.icon}
          label={`browse ${b.label}`}
          onSelect={() => ui.push('search', { q: b.q })}
        />
      ))}
    </div>
  );
}

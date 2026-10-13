import { useEffect, useMemo, useState } from 'react';
import { APPS, APP_BY_ID, MARKET_CATEGORIES, OFFERS, OFFER_BY_ID } from '../data/catalog.js';
import { GAMES } from '../data/games.js';
import { FRIENDS } from '../data/social.js';
import { useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';
import { sound } from '../audio/sound.js';
import { useNav } from '../nav/NavProvider.jsx';
import { AppIcon, PlaceholderArt } from '../components/Art.jsx';
import Gamerpic from '../components/Gamerpic.jsx';
import Icon from '../components/Icon.jsx';
import { ProgressBar, Row, Screen, Stars, Tile } from '../components/ui.jsx';
import { Empty, HScroll, InfoPanel, MenuList } from './common.jsx';

// ---- Apps -------------------------------------------------------------------
export function AppLibrary({ active }) {
  const ui = useUI();
  const { state, actions } = useStore();
  return (
    <Screen
      active={active}
      kicker="apps"
      title="My Apps"
      hints={[
        { btn: 'a', label: 'Select' },
        { btn: 'b', label: 'Back' },
        { btn: 'y', label: 'Pin / Unpin' },
      ]}
      onAction={(action, focused) => {
        if (action === 'y' && focused?.dataset.navId?.startsWith('applib-')) {
          const key = `app:${focused.dataset.navId.slice(7)}`;
          const pinned = state.pins.includes(key);
          actions.togglePin(key);
          sound.play('toggle');
          ui.notify({ kind: 'info', title: pinned ? 'Unpinned' : 'Pinned to Home', text: APP_BY_ID[key.slice(4)].title, icon: 'pin', force: true });
          return true;
        }
        return false;
      }}
    >
      <div className="lib-meta">{APPS.length} apps · placeholders ready for real apps</div>
      <HScroll rows={2}>
        {APPS.map((a, i) => (
          <Tile
            key={a.id}
            id={`applib-${a.id}`}
            variant="app"
            className="lib-tile"
            style={{ '--app': a.color }}
            isDefault={i === 0}
            label={a.title.toLowerCase()}
            onSelect={() => ui.push('app', { id: a.id })}
          >
            <AppIcon app={a} size={96} />
            {state.pins.includes(`app:${a.id}`) && (
              <span className="lib-flags">
                <Icon name="pin" size={22} />
              </span>
            )}
          </Tile>
        ))}
      </HScroll>
    </Screen>
  );
}

export function AppDetail({ active, params }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const app = APP_BY_ID[params.id];
  const key = `app:${app.id}`;
  const pinned = state.pins.includes(key);
  const togglePin = () => {
    actions.togglePin(key);
    sound.play('toggle');
    ui.notify({ kind: 'info', title: pinned ? 'Unpinned' : 'Pinned to Home', text: app.title, icon: 'pin', force: true });
  };
  return (
    <Screen
      active={active}
      kicker="apps"
      title={app.title}
      hints={[
        { btn: 'a', label: 'Select' },
        { btn: 'b', label: 'Back' },
        { btn: 'y', label: pinned ? 'Unpin' : 'Pin' },
      ]}
      onAction={(action) => {
        if (action === 'y') {
          togglePin();
          return true;
        }
        return false;
      }}
    >
      <div className="detail">
        <div className="detail-art detail-app" style={{ background: app.color }}>
          <AppIcon app={app} size={180} />
        </div>
        <div className="detail-tiles">
          <Tile
            id="ad-launch"
            at={[1, 1, 2, 1]}
            className="tile-play"
            isDefault
            icon="play"
            label="launch"
            onSelect={() => {
              actions.touchRecent(key);
              ui.push('launch', { kind: 'app', id: app.id });
            }}
          />
          <Tile id="ad-pin" at={[1, 2, 1, 1]} icon="pin" label={pinned ? 'unpin from home' : 'pin to home'} onSelect={togglePin} snd={null} />
          <Tile
            id="ad-market"
            at={[2, 2, 1, 1]}
            variant="dark"
            icon="bag"
            label="more apps"
            onSelect={() => ui.push('marketplace', { category: 'apps' })}
          />
        </div>
        <div className="detail-info">
          <dl className="facts">
            <dt>Category</dt>
            <dd>{app.category}</dd>
            <dt>Publisher</dt>
            <dd>{app.publisher}</dd>
            <dt>Size</dt>
            <dd>{app.size} MB</dd>
            <dt>Requires</dt>
            <dd>Xbox LIVE (simulated)</dd>
          </dl>
          <p className="detail-desc">{app.description}</p>
        </div>
      </div>
    </Screen>
  );
}

// ---- Marketplace ------------------------------------------------------------
export function Marketplace({ active, params }) {
  const ui = useUI();
  const nav = useNav();
  const { state } = useStore();
  const [cat, setCat] = useState(params.category || 'games');
  const category = MARKET_CATEGORIES.find((c) => c.id === cat) || MARKET_CATEGORIES[0];
  const offers = OFFERS.filter((o) => o.category === category.id);
  return (
    <Screen
      active={active}
      kicker="marketplace"
      title={category.label}
      hints={[
        { btn: 'a', label: 'Select' },
        { btn: 'b', label: 'Back' },
        { btn: 'lb', label: 'Category' },
        { btn: 'rb', label: 'Category' },
      ]}
      onAction={(action) => {
        if (action === 'lb' || action === 'rb') {
          const i = MARKET_CATEGORIES.findIndex((c) => c.id === category.id);
          const next = MARKET_CATEGORIES[(i + (action === 'rb' ? 1 : -1) + MARKET_CATEGORIES.length) % MARKET_CATEGORIES.length];
          sound.play('pivot');
          setCat(next.id);
          return true;
        }
        return false;
      }}
    >
      <div className="market">
        <div className="market-cats">
          {MARKET_CATEGORIES.map((c) => (
            <Row
              key={c.id}
              id={`cat-${c.id}`}
              label={c.label}
              icon={c.icon}
              value={c.id === category.id ? `${offers.length} items` : null}
              isDefault={c.id === category.id}
              className={c.id === category.id ? 'is-current' : ''}
              onSelect={(e) => {
                if (c.id !== category.id) {
                  setCat(c.id);
                  return;
                }
                const first = e.currentTarget.closest('.market')?.querySelector('.market-grid [data-nav]');
                if (first) nav.focus(first, false);
              }}
              snd="toggle"
            />
          ))}
        </div>
        <HScroll rows={2} className="market-grid">
          {offers.map((o) => (
            <Tile
              key={o.id}
              id={`offer-${o.id}`}
              variant="art"
              className="offer-tile"
              onSelect={() => ui.push('offer', { id: o.id })}
              ariaLabel={o.title}
            >
              <PlaceholderArt hue={o.hue} motif={o.motif} />
              <span className="offer-price">{state.downloads.includes(o.id) ? 'Downloaded' : o.price}</span>
              <span className="art-label">{o.title}</span>
            </Tile>
          ))}
        </HScroll>
      </div>
    </Screen>
  );
}

export function Offer({ active, params }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const offer = OFFER_BY_ID[params.id];
  const owned = state.downloads.includes(offer.id);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (progress === null) return undefined;
    if (progress >= 100) {
      actions.download(offer.id);
      setProgress(null);
      ui.notify({ kind: 'info', title: 'Download complete', text: offer.title, icon: 'download', force: true });
      return undefined;
    }
    const t = setTimeout(() => setProgress((p) => Math.min(100, p + 7)), 140);
    return () => clearTimeout(t);
  }, [progress]); // eslint-disable-line react-hooks/exhaustive-deps

  const buy = async () => {
    if (owned || progress !== null) return;
    const free = offer.price === 'Free';
    const ok = await ui.confirm({
      title: free ? 'Confirm Download' : 'Confirm Purchase',
      message: free
        ? `Download ${offer.title}? (${offer.size})`
        : `Buy ${offer.title} for ${offer.price}? This is a simulation — no points are spent.`,
      confirmLabel: free ? 'Confirm Download' : 'Confirm Purchase',
      cancelLabel: 'Cancel',
    });
    if (ok) setProgress(0);
  };

  return (
    <Screen active={active} kicker="marketplace" title={offer.title}>
      <div className="offer">
        <div className="offer-art">
          <PlaceholderArt hue={offer.hue} motif={offer.motif} />
          <span className="offer-art-label">{offer.title}</span>
        </div>
        <div className="offer-side">
          <div className="offer-meta">
            <Stars value={offer.rating} />
            <span>{offer.size}</span>
            <span className="offer-price-big">{owned ? 'Downloaded' : offer.price}</span>
          </div>
          <p className="detail-desc">{offer.description}</p>
          {progress !== null && (
            <div className="offer-progress">
              <span>Downloading… {progress}%</span>
              <ProgressBar value={progress} />
            </div>
          )}
          <div className="menu">
            <Row
              id="offer-buy"
              isDefault
              icon={owned ? 'check' : 'download'}
              label={owned ? 'Downloaded' : progress !== null ? 'Downloading…' : offer.price === 'Free' ? 'Download' : `Buy for ${offer.price}`}
              onSelect={owned ? () => ui.notify({ kind: 'info', title: 'Already downloaded', text: offer.title, icon: 'check', force: true }) : buy}
            />
            {owned && (
              <Row
                id="offer-remove"
                icon="trash"
                label="Remove Download"
                onSelect={() => {
                  actions.removeDownload(offer.id);
                  ui.notify({ kind: 'info', title: 'Download removed', text: offer.title, icon: 'trash', force: true });
                }}
              />
            )}
            <Row
              id="offer-more"
              icon="bag"
              label={`More ${MARKET_CATEGORIES.find((c) => c.id === offer.category)?.label}`}
              onSelect={() => ui.replace('marketplace', { category: offer.category })}
            />
          </div>
        </div>
      </div>
    </Screen>
  );
}

export function Gold({ active }) {
  const ui = useUI();
  const { state } = useStore();
  const items = [
    {
      id: 'gold-status',
      label: 'Membership Status',
      value: state.profile.tier === 'gold' ? 'Gold · Active' : 'Free',
      icon: 'gold',
      onSelect: () => ui.notify({ kind: 'info', title: 'Xbox LIVE Gold', text: 'Your membership is active (simulated)', icon: 'gold', force: true }),
    },
    { id: 'gold-renew', label: 'Renewal', value: 'Auto-renew on', icon: 'refresh', onSelect: () => ui.push('settings.account') },
    { id: 'gold-deals', label: 'Deals with Gold', icon: 'bag', onSelect: () => ui.push('marketplace', { category: 'arcade' }) },
    { id: 'gold-free', label: 'Free Games (placeholder)', icon: 'controller', onSelect: () => ui.push('marketplace', { category: 'games' }) },
  ];
  const [focus, setFocus] = useState(items[0]);
  return (
    <Screen active={active} kicker="home" title="Xbox LIVE Gold">
      <div className="split">
        <MenuList items={items} onFocusItem={setFocus} />
        <InfoPanel icon="gold" title={focus.label} className="gold-panel">
          <p>Online multiplayer, party chat across games, early access to demos and exclusive deals — all simulated in this recreation.</p>
          <p className="info-dim">Member since {state.profile.memberSince}</p>
        </InfoPanel>
      </div>
    </Screen>
  );
}

export async function runSearch(ui, initial = '') {
  const q = await ui.keyboard({ title: 'Search', value: initial, maxLength: 40 });
  if (q && q.trim()) ui.push('search', { q: q.trim() });
}

// ---- Search (bing) ----------------------------------------------------------
const SETTINGS_INDEX = [
  ['Profile', 'settings.profile', 'person'],
  ['System Settings', 'settings.system', 'gear'],
  ['Console Settings', 'settings.console', 'gear'],
  ['Display', 'settings.display', 'monitor'],
  ['Audio and dashboard sounds', 'settings.audio', 'speaker'],
  ['Storage', 'settings.storage', 'hdd'],
  ['Network', 'settings.network', 'network'],
  ['Preferences', 'settings.prefs', 'sliders'],
  ['Account', 'settings.account', 'card'],
  ['Family Settings', 'settings.family', 'family'],
  ['Theme', 'settings.theme', 'palette'],
  ['Avatar editor', 'avatar', 'avatar'],
  ['Gamer picture', 'gamerpic', 'photo'],
  ['Achievements', 'achievementsAll', 'trophy'],
  ['Messages', 'messages', 'message'],
  ['Friends', 'friends', 'friends'],
  ['Restore defaults (reset)', 'settings.system', 'refresh'],
];

export function Search({ active, params }) {
  const ui = useUI();
  const q = params.q.toLowerCase();
  const results = useMemo(() => {
    const out = [];
    GAMES.forEach((g) => {
      if (`${g.title} ${g.genre} game`.toLowerCase().includes(q))
        out.push({ id: `s-${g.id}`, label: g.title, value: 'Game', icon: 'controller', run: () => ui.push('game', { id: g.id }) });
    });
    APPS.forEach((a) => {
      if (`${a.title} ${a.category} app`.toLowerCase().includes(q))
        out.push({ id: `s-${a.id}`, label: a.title, value: 'App', icon: 'apps', run: () => ui.push('app', { id: a.id }) });
    });
    FRIENDS.forEach((f) => {
      if (`${f.gamertag} friend`.toLowerCase().includes(q))
        out.push({ id: `s-${f.id}`, label: f.gamertag, value: 'Friend', icon: 'person', friend: f, run: () => ui.push('friend', { id: f.id }) });
    });
    SETTINGS_INDEX.forEach(([label, screen, icon]) => {
      if (`${label} settings`.toLowerCase().includes(q))
        out.push({ id: `s-set-${label}`, label, value: 'Settings', icon, run: () => ui.push(screen) });
    });
    OFFERS.forEach((o) => {
      if (o.title.toLowerCase().includes(q) || o.category.includes(q))
        out.push({ id: `s-${o.id}`, label: o.title, value: 'Marketplace', icon: 'bag', run: () => ui.push('offer', { id: o.id }) });
    });
    return out.slice(0, 40);
  }, [q, ui]);

  return (
    <Screen
      active={active}
      kicker="search"
      title={`“${params.q}”`}
      hints={[
        { btn: 'a', label: 'Select' },
        { btn: 'b', label: 'Back' },
        { btn: 'y', label: 'New Search' },
      ]}
      onAction={(action) => {
        if (action === 'y') {
          sound.play('select');
          ui.pop();
          runSearch(ui, params.q);
          return true;
        }
        return false;
      }}
    >
      <div className="lib-meta">
        {results.length} result{results.length === 1 ? '' : 's'}
      </div>
      {results.length === 0 ? (
        <Empty icon="search" title="No results" text="Try “game”, “app”, a gamertag or a setting like “theme”.">
          <div className="empty-actions">
            <Row
              id="search-again"
              label="Search Again"
              icon="search"
              isDefault
              onSelect={() => {
                ui.pop();
                runSearch(ui, params.q);
              }}
            />
          </div>
        </Empty>
      ) : (
        <div className="search-results" data-scroll="y" data-scroll-pad="16">
          {results.map((r, i) => (
            <Row
              key={r.id}
              id={r.id}
              label={r.label}
              value={r.value}
              isDefault={i === 0}
              icon={r.friend ? undefined : r.icon}
              onSelect={r.run}
              right={r.friend ? <Gamerpic id={r.friend.gamerpic} size={44} className="row-pic" /> : null}
            />
          ))}
        </div>
      )}
    </Screen>
  );
}

// ---- Media placeholders (Guide > Media) -------------------------------------
export function Media({ active, params }) {
  const ui = useUI();
  const label = params.kind === 'music' ? 'Music' : params.kind === 'pictures' ? 'Pictures' : 'Videos';
  const icon = params.kind === 'music' ? 'music' : params.kind === 'pictures' ? 'photo' : 'video';
  return (
    <Screen active={active} kicker="media" title={`${label} Library`}>
      <Empty icon={icon} title={`No ${label.toLowerCase()} yet`} text="Media apps and libraries are placeholders in this recreation.">
        <div className="empty-actions">
          <Row id="media-apps" label="Browse My Apps" icon="apps" isDefault onSelect={() => ui.replace('apps')} />
          <Row id="media-back" label="Back to Dashboard" icon="home" onSelect={() => ui.home()} snd="back" />
        </div>
      </Empty>
    </Screen>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { GAMES, GAME_BY_ID } from '../data/games.js';
import { APP_BY_ID } from '../data/catalog.js';
import { gameProgress, gamerscoreOf, useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';
import { openContent, parseKey } from '../state/content.js';
import { sound } from '../audio/sound.js';
import { useLayer } from '../nav/NavProvider.jsx';
import { AppIcon, BoxArt } from '../components/Art.jsx';
import Icon from '../components/Icon.jsx';
import { ButtonHints, GIcon, ProgressBar, Row, Screen, Tile, formatDate } from '../components/ui.jsx';
import { Empty, HScroll } from './common.jsx';

const ACH_GLYPHS = ['trophy', 'star', 'bolt', 'controller', 'friends', 'clock', 'gold', 'globe'];

function AchievementIcon({ game, ach, unlocked, size = 64 }) {
  return (
    <span className={`ach-icon ${unlocked ? '' : 'is-locked'}`} style={{ width: size, height: size, '--h': game.hue + (ach.icon % 4) * 18 }}>
      <Icon name={unlocked ? ACH_GLYPHS[ach.icon % ACH_GLYPHS.length] : 'lock'} size={size * 0.62} strokeWidth={2.4} />
    </span>
  );
}

// ---- Library helpers ----------------------------------------------------
function ContentTile({ itemKey, idPrefix, uninstalled, pinned, onSelect, isDefault }) {
  const { type, item } = parseKey(itemKey);
  if (!item) return null;
  return (
    <Tile
      id={`${idPrefix}-${itemKey}`}
      variant={type === 'game' ? 'cover' : 'app'}
      className="lib-tile"
      style={type === 'app' ? { '--app': item.color } : undefined}
      onSelect={onSelect}
      isDefault={isDefault}
      ariaLabel={item.title}
      label={type === 'app' ? item.title.toLowerCase() : undefined}
    >
      {type === 'game' ? <BoxArt game={item} /> : <AppIcon app={item} size={96} />}
      {(uninstalled || pinned) && (
        <span className="lib-flags">
          {pinned && <Icon name="pin" size={22} />}
          {uninstalled && <span className="lib-flag">not installed</span>}
        </span>
      )}
    </Tile>
  );
}

function usePinToggle() {
  const { state, actions } = useStore();
  const ui = useUI();
  return (key) => {
    const { item } = parseKey(key);
    const pinned = state.pins.includes(key);
    actions.togglePin(key);
    sound.play('toggle');
    ui.notify({ kind: 'info', title: pinned ? 'Unpinned' : 'Pinned to Home', text: item?.title, icon: 'pin', force: true });
  };
}

function keyFromFocused(el, prefix) {
  const id = el && el.dataset.navId;
  return id && id.startsWith(`${prefix}-`) ? id.slice(prefix.length + 1) : null;
}

// ---- My Games -----------------------------------------------------------
const SORTS = ['Recent', 'A–Z', 'Gamerscore'];

export function GameLibrary({ active }) {
  const ui = useUI();
  const { state } = useStore();
  const togglePin = usePinToggle();
  const [sort, setSort] = useState(0);
  const games = useMemo(() => {
    const list = [...GAMES];
    if (sort === 0) {
      const order = state.recent.filter((k) => k.startsWith('game:')).map((k) => k.slice(5));
      list.sort((a, b) => {
        const ia = order.indexOf(a.id);
        const ib = order.indexOf(b.id);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      });
    } else if (sort === 1) list.sort((a, b) => a.title.localeCompare(b.title));
    else list.sort((a, b) => gameProgress(state.unlocked, b.id).earned - gameProgress(state.unlocked, a.id).earned);
    return list;
  }, [sort, state.recent, state.unlocked]);

  return (
    <Screen
      active={active}
      kicker="games"
      title="My Games"
      hints={[
        { btn: 'a', label: 'Select' },
        { btn: 'b', label: 'Back' },
        { btn: 'x', label: `Sort: ${SORTS[sort]}` },
        { btn: 'y', label: 'Pin / Unpin' },
      ]}
      onAction={(action, focused) => {
        if (action === 'x') {
          sound.play('toggle');
          setSort((s) => (s + 1) % SORTS.length);
          return true;
        }
        if (action === 'y') {
          const key = keyFromFocused(focused, 'lib');
          if (key) togglePin(key);
          return true;
        }
        return false;
      }}
    >
      <div className="lib-meta">
        {GAMES.length} games · sorted by {SORTS[sort].toLowerCase()}
      </div>
      <HScroll rows={2}>
        {games.map((g, i) => {
          const key = `game:${g.id}`;
          return (
            <ContentTile
              key={key}
              itemKey={key}
              idPrefix="lib"
              isDefault={i === 0}
              pinned={state.pins.includes(key)}
              uninstalled={state.uninstalled.includes(key)}
              onSelect={() => ui.push('game', { id: g.id })}
            />
          );
        })}
      </HScroll>
    </Screen>
  );
}

// ---- Game detail ----------------------------------------------------------
export function GameDetail({ active, params }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const game = GAME_BY_ID[params.id];
  const key = `game:${game.id}`;
  const pinned = state.pins.includes(key);
  const installed = !state.uninstalled.includes(key);
  const prog = gameProgress(state.unlocked, game.id);
  const togglePin = usePinToggle();
  const [installing, setInstalling] = useState(null);

  useEffect(() => {
    if (installing === null) return undefined;
    if (installing >= 100) {
      actions.install(key);
      setInstalling(null);
      ui.notify({ kind: 'info', title: 'Installation complete', text: game.title, icon: 'download', force: true });
      return undefined;
    }
    const t = setTimeout(() => setInstalling((p) => Math.min(100, p + 9)), 160);
    return () => clearTimeout(t);
  }, [installing]); // eslint-disable-line react-hooks/exhaustive-deps

  const play = () => {
    if (!installed) {
      if (installing === null) setInstalling(0);
      return;
    }
    actions.touchRecent(key);
    ui.push('launch', { kind: 'game', id: game.id });
  };

  const manage = async () => {
    if (installed) {
      const ok = await ui.confirm({
        title: 'Delete Game',
        message: `Delete ${game.title} (${game.size} GB) from the hard drive? Saved games and achievements are kept.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      });
      if (ok) {
        actions.uninstall(key);
        ui.notify({ kind: 'info', title: 'Deleted from hard drive', text: game.title, icon: 'trash', force: true });
      }
    } else if (installing === null) setInstalling(0);
  };

  return (
    <Screen
      active={active}
      kicker="games"
      title={game.title}
      hints={[
        { btn: 'a', label: 'Select' },
        { btn: 'b', label: 'Back' },
        { btn: 'y', label: pinned ? 'Unpin' : 'Pin' },
      ]}
      onAction={(action) => {
        if (action === 'y') {
          togglePin(key);
          return true;
        }
        return false;
      }}
    >
      <div className="detail">
        <div className="detail-art">
          <BoxArt game={game} />
        </div>
        <div className="detail-tiles">
          <Tile
            id="gd-play"
            at={[1, 1, 2, 1]}
            className="tile-play"
            isDefault
            icon={installed ? 'play' : 'download'}
            label={installed ? 'play' : installing !== null ? `installing ${installing}%` : 'install'}
            onSelect={play}
          >
            {installing !== null && <ProgressBar value={installing} className="tile-progress" />}
          </Tile>
          <Tile
            id="gd-ach"
            at={[1, 2, 1, 1]}
            variant="dark"
            className="tile-ach"
            onSelect={() => ui.push('achievements', { id: game.id })}
            ariaLabel="achievements"
          >
            <span className="ta-count">
              {prog.count}/{prog.of}
            </span>
            <span className="ta-score">
              <GIcon size={18} /> {prog.earned}/{prog.total}
            </span>
            <ProgressBar value={prog.earned} max={prog.total} className="tile-progress" />
            <span className="tile-label">achievements</span>
          </Tile>
          <Tile
            id="gd-pin"
            at={[2, 2, 1, 1]}
            icon="pin"
            label={pinned ? 'unpin from home' : 'pin to home'}
            onSelect={() => togglePin(key)}
            snd={null}
          />
          <Tile
            id="gd-addons"
            at={[1, 3, 1, 1]}
            variant="light"
            icon="plus"
            label="add-ons"
            className="tile-short"
            onSelect={() => ui.push('marketplace', { category: 'addons' })}
          />
          <Tile
            id="gd-manage"
            at={[2, 3, 1, 1]}
            variant="light"
            icon={installed ? 'trash' : 'download'}
            label={installed ? 'delete' : 'install'}
            className="tile-short"
            onSelect={manage}
          />
        </div>
        <div className="detail-info">
          <dl className="facts">
            <dt>Genre</dt>
            <dd>{game.genre}</dd>
            <dt>Publisher</dt>
            <dd>{game.publisher}</dd>
            <dt>Developer</dt>
            <dd>{game.developer}</dd>
            <dt>Released</dt>
            <dd>{game.released}</dd>
            <dt>Rating</dt>
            <dd>
              <span className="rating-chip">{game.rating}</span>
            </dd>
            <dt>Players</dt>
            <dd>{game.players}</dd>
            <dt>Xbox LIVE</dt>
            <dd>{game.online}</dd>
            <dt>Size</dt>
            <dd>
              {game.size} GB {installed ? '· installed' : '· not installed'}
            </dd>
          </dl>
          <p className="detail-desc">{game.description}</p>
        </div>
      </div>
    </Screen>
  );
}

// ---- Achievements (per game) --------------------------------------------
const FILTERS = ['All', 'Unlocked', 'Locked'];

export function Achievements({ active, params }) {
  const ui = useUI();
  const { state } = useStore();
  const game = GAME_BY_ID[params.id];
  const map = state.unlocked[game.id] || {};
  const prog = gameProgress(state.unlocked, game.id);
  const [filter, setFilter] = useState(0);
  const [focusId, setFocusId] = useState(null);
  const list = game.achievements.filter((a) => (filter === 0 ? true : filter === 1 ? !!map[a.id] : !map[a.id]));
  const current = list.find((a) => a.id === focusId) || list[0];

  return (
    <Screen
      active={active}
      kicker={game.title}
      title="Achievements"
      hints={[
        { btn: 'a', label: 'Details' },
        { btn: 'b', label: 'Back' },
        { btn: 'x', label: `Show: ${FILTERS[filter]}` },
      ]}
      onAction={(action) => {
        if (action === 'x') {
          sound.play('toggle');
          setFilter((f) => (f + 1) % FILTERS.length);
          return true;
        }
        return false;
      }}
    >
      <div className="ach-summary">
        <span>
          {prog.count} of {prog.of} achievements
        </span>
        <span className="ach-summary-g">
          <GIcon size={22} /> {prog.earned} / {prog.total}
        </span>
        <ProgressBar value={prog.earned} max={prog.total} />
      </div>
      <div className="split split-ach">
        <div className="ach-list" data-scroll="y" data-scroll-pad="16">
          {list.length === 0 && <div className="menu-empty">Nothing to show for this filter.</div>}
          {list.map((a, i) => {
            const un = !!map[a.id];
            return (
              <button
                key={a.id}
                type="button"
                tabIndex={-1}
                data-nav=""
                data-nav-id={`ach-${a.id}`}
                data-nav-default={i === 0 ? '' : undefined}
                className={`ach-row ${un ? 'is-unlocked' : ''}`}
                onFocus={() => setFocusId(a.id)}
                onClick={() => {
                  sound.play('select');
                  ui.confirm({
                    title: `${a.name} · ${a.g}G`,
                    message: un ? `${a.desc} Unlocked ${formatDate(map[a.id])}.` : `Locked. ${a.desc}`,
                    options: [{ label: 'OK', value: true }],
                  });
                }}
              >
                <AchievementIcon game={game} ach={a} unlocked={un} size={60} />
                <span className="ach-name">{a.name}</span>
                <span className="ach-g">
                  {a.g}
                  <GIcon size={16} />
                </span>
              </button>
            );
          })}
        </div>
        {current && (
          <aside className="info-panel ach-detail">
            <AchievementIcon game={game} ach={current} unlocked={!!map[current.id]} size={168} />
            <h2 className="info-title">{current.name}</h2>
            <div className="ach-detail-g">
              <GIcon size={22} /> {current.g}
            </div>
            <p>{map[current.id] ? current.desc : `Locked: ${current.desc}`}</p>
            <p className="info-dim">{map[current.id] ? `Unlocked ${formatDate(map[current.id])}` : 'Not yet unlocked'}</p>
          </aside>
        )}
      </div>
    </Screen>
  );
}

// ---- Achievements (all games) ---------------------------------------------
export function AchievementsAll({ active }) {
  const ui = useUI();
  const { state } = useStore();
  const score = gamerscoreOf(state.unlocked);
  const rows = GAMES.map((g) => ({ g, p: gameProgress(state.unlocked, g.id) })).sort((a, b) => b.p.earned - a.p.earned);
  return (
    <Screen active={active} kicker={state.profile.gamertag} title="Achievements">
      <div className="ach-summary">
        <span>{rows.length} games</span>
        <span className="ach-summary-g">
          <GIcon size={22} /> {score.toLocaleString('en-US')} gamerscore
        </span>
      </div>
      <div className="game-progress-list" data-scroll="y" data-scroll-pad="16">
        {rows.map(({ g, p }, i) => (
          <button
            key={g.id}
            type="button"
            tabIndex={-1}
            data-nav=""
            data-nav-id={`aa-${g.id}`}
            data-nav-default={i === 0 ? '' : undefined}
            className="gp-row"
            onClick={() => {
              sound.play('select');
              ui.push('achievements', { id: g.id });
            }}
          >
            <BoxArt game={g} showTitle={false} className="gp-art" />
            <span className="gp-title">{g.title}</span>
            <span className="gp-count">
              {p.count} of {p.of} achievements
            </span>
            <span className="gp-score">
              <GIcon size={18} /> {p.earned} / {p.total}
            </span>
            <ProgressBar value={p.earned} max={p.total} className="gp-bar" />
          </button>
        ))}
      </div>
    </Screen>
  );
}

// ---- Launch (placeholder game/app running) --------------------------------
export function Launch({ active, params }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const isGame = params.kind === 'game';
  const item = isGame ? GAME_BY_ID[params.id] : APP_BY_ID[params.id];
  const [phase, setPhase] = useState('loading');
  const quit = () => ui.pop();
  const { ref, layer, mgr } = useLayer({ priority: 10, enabled: active, onBack: quit });

  useEffect(() => {
    const t = setTimeout(() => setPhase('running'), 2300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase === 'running' && active) mgr.restore(layer);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Simulate earning the next locked achievement a few seconds in.
  useEffect(() => {
    if (!isGame || phase !== 'running') return undefined;
    const t = setTimeout(() => {
      const map = state.unlocked[item.id] || {};
      const next = item.achievements.find((a) => !map[a.id]);
      if (next) {
        actions.unlock(item.id, next.id);
        ui.notify({ kind: 'achievement', title: 'Achievement unlocked', text: `${next.g}G – ${next.name}`, force: true });
      }
    }, 2500);
    return () => clearTimeout(t);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section ref={ref} className="screen screen-launch">
      {phase === 'loading' ? (
        <div className="launch-loading">
          <span className="launch-ring" />
          <span className="launch-text">Loading {item.title}…</span>
        </div>
      ) : (
        <div className="launch-running">
          <div className="launch-art">{isGame ? <BoxArt game={item} /> : <AppIcon app={item} size={140} />}</div>
          <div className="launch-copy">
            <h1>{item.title}</h1>
            <p>
              This {isGame ? 'game' : 'app'} is a placeholder. No {isGame ? 'game' : 'app'} content is included in this recreation yet — it will plug
              in here later.
            </p>
            <div className="launch-actions">
              <Row id="launch-quit" label="Return to Xbox Dashboard" icon="home" isDefault onSelect={quit} snd="back" />
              <Row id="launch-guide" label="Open Xbox Guide" icon="controller" onSelect={() => ui.setGuideOpen(true)} snd="guide" />
            </div>
          </div>
        </div>
      )}
      <ButtonHints
        hints={[
          { btn: 'b', label: 'Quit to Dashboard' },
          { btn: 'guide', label: 'Guide' },
        ]}
      />
    </section>
  );
}

// ---- Recent & Pins --------------------------------------------------------
export function Recent({ active, params }) {
  const ui = useUI();
  const { state } = useStore();
  const togglePin = usePinToggle();
  const keys = state.recent.filter((k) => !params.filter || k.startsWith(`${params.filter}:`));
  return (
    <Screen
      active={active}
      kicker="home"
      title={params.filter === 'app' ? 'Recent Apps' : 'Recent'}
      hints={[
        { btn: 'a', label: 'Select' },
        { btn: 'b', label: 'Back' },
        { btn: 'y', label: 'Pin / Unpin' },
      ]}
      onAction={(action, focused) => {
        if (action === 'y') {
          const key = keyFromFocused(focused, 'rec');
          if (key) togglePin(key);
          return true;
        }
        return false;
      }}
    >
      {keys.length === 0 ? (
        <Empty icon="clock" title="Nothing here yet" text="Games and apps you use show up here.">
          <div className="empty-actions">
            <Row id="rec-browse" label="Go to My Games" isDefault onSelect={() => ui.replace('games')} />
          </div>
        </Empty>
      ) : (
        <HScroll rows={2}>
          {keys.map((k, i) => (
            <ContentTile key={k} itemKey={k} idPrefix="rec" isDefault={i === 0} pinned={state.pins.includes(k)} onSelect={() => openContent(ui, k)} />
          ))}
        </HScroll>
      )}
    </Screen>
  );
}

export function Pins({ active }) {
  const ui = useUI();
  const { state } = useStore();
  const togglePin = usePinToggle();
  return (
    <Screen
      active={active}
      kicker="home"
      title="Pins"
      hints={[
        { btn: 'a', label: 'Select' },
        { btn: 'b', label: 'Back' },
        { btn: 'y', label: 'Unpin' },
      ]}
      onAction={(action, focused) => {
        if (action === 'y') {
          const key = keyFromFocused(focused, 'pin');
          if (key) togglePin(key);
          return true;
        }
        return false;
      }}
    >
      {state.pins.length === 0 ? (
        <Empty icon="pin" title="No pins yet" text="Press Y on a game or app to pin it here.">
          <div className="empty-actions">
            <Row id="pins-games" label="Browse My Games" isDefault onSelect={() => ui.replace('games')} />
            <Row id="pins-apps" label="Browse My Apps" onSelect={() => ui.replace('apps')} />
          </div>
        </Empty>
      ) : (
        <HScroll rows={2}>
          {state.pins.map((k, i) => (
            <ContentTile key={k} itemKey={k} idPrefix="pin" isDefault={i === 0} onSelect={() => openContent(ui, k)} />
          ))}
        </HScroll>
      )}
    </Screen>
  );
}

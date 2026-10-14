import { useEffect, useMemo, useRef, useState } from 'react';
import { APP_BY_ID } from '../data/catalog.js';
import { useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';
import { openContent, parseKey } from '../state/content.js';
import { buildInlineGame } from '../games/inline.js';
import { useLibrary } from '../games/LibraryProvider.jsx';
import { sound } from '../audio/sound.js';
import { useLayer } from '../nav/NavProvider.jsx';
import { AppIcon, BoxArt } from '../components/Art.jsx';
import Icon from '../components/Icon.jsx';
import { ButtonHints, Row, Screen, Tile, formatDate, formatSize } from '../components/ui.jsx';
import { Empty, HScroll, InfoPanel, MenuScreen } from './common.jsx';

// ---- Library helpers ----------------------------------------------------
function ContentTile({ itemKey, item, type, idPrefix, pinned, onSelect, isDefault }) {
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
      {pinned && (
        <span className="lib-flags">
          <Icon name="pin" size={22} />
        </span>
      )}
    </Tile>
  );
}

function usePinToggle() {
  const { state, actions } = useStore();
  const { byId } = useLibrary();
  const ui = useUI();
  return (key) => {
    const { item } = parseKey(key, byId);
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

// Keys from Recent or Pins that still point at something (deleted games drop out).
function useLiveKeys(keys) {
  const { byId } = useLibrary();
  return keys.map((key) => ({ key, ...parseKey(key, byId) })).filter((k) => k.item);
}

// ---- My Games -----------------------------------------------------------
const SORTS = ['Recent', 'A–Z'];

export function GameLibrary({ active }) {
  const ui = useUI();
  const { state } = useStore();
  const library = useLibrary();
  const togglePin = usePinToggle();
  const [sort, setSort] = useState(0);
  const games = useMemo(() => {
    const list = [...library.games];
    if (sort === 0) {
      const order = state.recent.filter((k) => k.startsWith('game:')).map((k) => k.slice(5));
      const rank = (g) => {
        const i = order.indexOf(g.id);
        return i < 0 ? order.length : i;
      };
      list.sort((a, b) => rank(a) - rank(b) || b.addedAt - a.addedAt);
    } else list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [library.games, sort, state.recent]);

  if (!games.length) {
    return (
      <Screen active={active} kicker="games" title="My Games">
        <Empty icon="controller" title="No games yet" text="Load a web game from this device: an .html file, a .zip, or a folder with an index.html.">
          <div className="empty-actions">
            <Row id="lib-add-file" icon="plus" label="Load HTML File or .zip" isDefault onSelect={library.pickFiles} />
            <Row id="lib-add-folder" icon="hdd" label="Load a Folder" onSelect={library.pickFolder} />
          </div>
        </Empty>
      </Screen>
    );
  }

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
        {games.length} {games.length === 1 ? 'game' : 'games'} · sorted by {SORTS[sort].toLowerCase()}
      </div>
      <HScroll rows={2}>
        <Tile id="lib-add" className="lib-tile lib-add" icon="plus" label="add game" onSelect={() => ui.push('addGame')} />
        {games.map((g, i) => {
          const key = `game:${g.id}`;
          return (
            <ContentTile
              key={key}
              itemKey={key}
              item={g}
              type="game"
              idPrefix="lib"
              isDefault={i === 0}
              pinned={state.pins.includes(key)}
              onSelect={() => ui.push('game', { id: g.id })}
            />
          );
        })}
      </HScroll>
    </Screen>
  );
}

// ---- Add a game -----------------------------------------------------------
export function AddGame({ active }) {
  const library = useLibrary();
  const items = [
    {
      id: 'add-file',
      label: 'HTML File or .zip',
      icon: 'plus',
      desc: 'Pick one or more .html files, or .zip files with a game inside. Each one becomes its own game.',
      onSelect: library.pickFiles,
    },
    {
      id: 'add-folder',
      label: 'Folder',
      icon: 'hdd',
      desc: 'Pick a folder with an index.html and the images, sounds and scripts it uses.',
      onSelect: library.pickFolder,
    },
  ];
  return (
    <MenuScreen
      active={active}
      kicker="games"
      title="Add a Game"
      items={items}
      aside={(current) => (
        <InfoPanel icon={current.icon} title={current.label}>
          <p>{current.desc}</p>
          <p className="info-dim">
            {library.busy
              ? 'Adding…'
              : 'Games are saved in this browser only. You can also drag files or folders onto the dashboard. While playing, hold Esc or press Home to open the Guide.'}
          </p>
        </InfoPanel>
      )}
    />
  );
}

// ---- Game detail ----------------------------------------------------------
const SOURCES = { html: 'HTML file', zip: '.zip file', folder: 'Folder' };

export function GameDetail({ active, params }) {
  const ui = useUI();
  const { state } = useStore();
  const library = useLibrary();
  const game = library.byId[params.id];
  const key = `game:${params.id}`;
  const pinned = state.pins.includes(key);
  const togglePin = usePinToggle();

  if (!game) {
    return (
      <Screen active={active} kicker="games" title="Game Not Found">
        <Empty icon="info" title="This game isn't on this device anymore" text="Press B to go back." />
      </Screen>
    );
  }

  const rename = async () => {
    const v = await ui.keyboard({ title: 'Rename Game', value: game.title, maxLength: 60 });
    if (v === null || !v.trim()) return;
    await library.rename(game.id, v.trim());
    ui.notify({ kind: 'info', title: 'Game renamed', text: v.trim(), icon: 'controller', force: true });
  };

  const remove = async () => {
    const ok = await ui.confirm({
      title: 'Delete Game',
      message: `Delete ${game.title} from this device? Its saved progress is deleted too. You can load it again later.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
    });
    if (!ok) return;
    await library.remove(game.id);
    ui.pop();
    ui.notify({ kind: 'info', title: 'Game deleted', text: game.title, icon: 'trash', force: true });
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
            icon="play"
            label="play"
            onSelect={() => ui.push('play', { id: game.id })}
          />
          <Tile
            id="gd-pin"
            at={[1, 2, 1, 1]}
            icon="pin"
            label={pinned ? 'unpin from home' : 'pin to home'}
            onSelect={() => togglePin(key)}
            snd={null}
          />
          <Tile id="gd-rename" at={[2, 2, 1, 1]} icon="edit" label="rename" onSelect={rename} />
          <Tile id="gd-delete" at={[1, 3, 2, 1]} variant="light" icon="trash" label="delete" className="tile-short" onSelect={remove} />
        </div>
        <div className="detail-info">
          <dl className="facts">
            <dt>Added</dt>
            <dd>{formatDate(game.addedAt)}</dd>
            <dt>Loaded from</dt>
            <dd>{SOURCES[game.source] || 'This device'}</dd>
            <dt>Starts at</dt>
            <dd className="facts-path">{game.entry}</dd>
            <dt>Files</dt>
            <dd>{game.fileCount}</dd>
            <dt>Size</dt>
            <dd>{formatSize(game.size)}</dd>
          </dl>
          <p className="detail-desc">Stored in this browser only. Progress the game saves stays here too, kept apart from your other games.</p>
        </div>
      </div>
    </Screen>
  );
}

// ---- Playing a game -------------------------------------------------------
const GUIDE_HOLD_MS = 700;

// The game runs full screen in a frame served by public/sw.js. It gets every
// key and button except the Guide: hold Esc, press Home, or press the
// controller's Guide or Back button to open the Guide.
export function PlayGame({ active, params }) {
  const ui = useUI();
  const { actions } = useStore();
  const library = useLibrary();
  const game = library.byId[params.id];
  const frameRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  // 'sw': served by public/sw.js; 'inline': built in the page (see games/inline.js)
  // when the service worker is missing or didn't answer the frame.
  const [mode, setMode] = useState(null);
  const [inlineSrc, setInlineSrc] = useState(null);
  const [failed, setFailed] = useState(null);
  useEffect(() => {
    if (!mode && library.player === 'ready') setMode('sw');
    else if (!mode && library.player === 'unsupported') setMode('inline');
  }, [library.player, mode]);
  useEffect(() => {
    if (mode !== 'inline' || !game) return undefined;
    let cleanup = null;
    let cancelled = false;
    buildInlineGame(game).then(
      (r) => {
        if (cancelled) return r.cleanup();
        cleanup = r.cleanup;
        if (r.src) setInlineSrc(r.src);
        else setFailed("This game's start page is missing.");
      },
      (err) => !cancelled && setFailed(`Couldn't open the game (${(err && err.message) || err}).`),
    );
    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, [mode, game]);
  const live = useRef({ ui, active });
  live.current = { ui, active };

  const openGuide = () => {
    if (live.current.ui.guideOpen || !live.current.active) return;
    sound.play('guide');
    live.current.ui.setGuideOpen(true);
  };
  const guideRef = useRef(openGuide);
  guideRef.current = openGuide;

  const { ref } = useLayer({
    priority: 10,
    enabled: active,
    initialFocus: () => frameRef.current,
    // B and every other button belong to the game.
    onBack: () => {},
    onAction: (action) => {
      if (action === 'guide') return false;
      if (action === 'back') openGuide();
      return true;
    },
  });

  useEffect(() => {
    if (game) actions.touchRecent(`game:${game.id}`);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onLoad = () => {
    const frame = frameRef.current;
    if (!frame) return;
    if (mode === 'sw') {
      // Without the service worker the host's own 404 page loads instead.
      let served = true;
      try {
        served = !!frame.contentWindow.__x360Served;
      } catch {
        /* cross-origin: the game navigated elsewhere */
      }
      if (!served) {
        setMode('inline');
        return;
      }
    }
    if (!loaded) {
      setLoaded(true);
      ui.notify({ kind: 'info', title: 'Hold Esc for the Guide', text: 'Or press Home', icon: 'controller', force: true });
    }
    try {
      const win = frame.contentWindow;
      let hold = 0;
      win.addEventListener(
        'keydown',
        (e) => {
          if (e.key === 'Home') {
            e.preventDefault();
            guideRef.current();
          } else if (e.key === 'Escape' && !e.repeat) {
            clearTimeout(hold);
            hold = setTimeout(() => guideRef.current(), GUIDE_HOLD_MS);
          }
        },
        true,
      );
      win.addEventListener('keyup', (e) => e.key === 'Escape' && clearTimeout(hold), true);
      win.addEventListener('blur', () => clearTimeout(hold));
    } catch {
      /* the game navigated away to another site; the Guide button still works */
    }
    if (live.current.active && !live.current.ui.guideOpen) frame.focus();
  };

  let body;
  if (!game) body = <Empty icon="info" title="This game isn't on this device anymore" text="Open the Guide to go back." />;
  else if (failed) body = <Empty icon="info" title="This game couldn't start" text={failed} />;
  else if (mode === 'sw' || (mode === 'inline' && inlineSrc)) {
    const src =
      mode === 'inline' ? inlineSrc : new URL(`play/${game.id}/${game.entry.split('/').map(encodeURIComponent).join('/')}`, document.baseURI).href;
    body = (
      <iframe
        key={mode}
        ref={frameRef}
        className={`play-frame ${loaded ? 'is-loaded' : ''}`}
        src={src}
        title={game.title}
        onLoad={onLoad}
        allow="autoplay; fullscreen; gamepad; clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms allow-modals allow-downloads allow-popups"
      />
    );
  }

  return (
    <section ref={ref} className="screen screen-play">
      {body}
      {game && !loaded && !failed && (
        <div className="launch-loading">
          <span className="launch-ring" />
          <span className="launch-text">Loading {game.title}…</span>
        </div>
      )}
    </section>
  );
}

// ---- Launch (placeholder app running) ---------------------------------------
export function Launch({ active, params }) {
  const ui = useUI();
  const app = APP_BY_ID[params.id];
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

  return (
    <section ref={ref} className="screen screen-launch">
      {phase === 'loading' ? (
        <div className="launch-loading">
          <span className="launch-ring" />
          <span className="launch-text">Loading {app.title}…</span>
        </div>
      ) : (
        <div className="launch-running">
          <div className="launch-art">
            <AppIcon app={app} size={140} />
          </div>
          <div className="launch-copy">
            <h1>{app.title}</h1>
            <p>This app is a placeholder. No app content is included in this recreation yet.</p>
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
  const { byId } = useLibrary();
  const togglePin = usePinToggle();
  const keys = useLiveKeys(state.recent.filter((k) => !params.filter || k.startsWith(`${params.filter}:`)));
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
          {keys.map(({ key, item, type }, i) => (
            <ContentTile
              key={key}
              itemKey={key}
              item={item}
              type={type}
              idPrefix="rec"
              isDefault={i === 0}
              pinned={state.pins.includes(key)}
              onSelect={() => openContent(ui, key, byId)}
            />
          ))}
        </HScroll>
      )}
    </Screen>
  );
}

export function Pins({ active }) {
  const ui = useUI();
  const { state } = useStore();
  const { byId } = useLibrary();
  const togglePin = usePinToggle();
  const keys = useLiveKeys(state.pins);
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
      {keys.length === 0 ? (
        <Empty icon="pin" title="No pins yet" text="Press Y on a game or app to pin it here.">
          <div className="empty-actions">
            <Row id="pins-games" label="Browse My Games" isDefault onSelect={() => ui.replace('games')} />
            <Row id="pins-apps" label="Browse My Apps" onSelect={() => ui.replace('apps')} />
          </div>
        </Empty>
      ) : (
        <HScroll rows={2}>
          {keys.map(({ key, item, type }, i) => (
            <ContentTile
              key={key}
              itemKey={key}
              item={item}
              type={type}
              idPrefix="pin"
              isDefault={i === 0}
              onSelect={() => openContent(ui, key, byId)}
            />
          ))}
        </HScroll>
      )}
    </Screen>
  );
}

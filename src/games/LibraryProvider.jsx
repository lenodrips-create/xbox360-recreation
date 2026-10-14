import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { deleteGame, listGames, saveGame, updateGame } from './db.js';
import { gamesFromDrop, gamesFromFiles, gamesFromFolder } from './importer.js';
import { useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';
import { sound } from '../audio/sound.js';

// The player's own games: HTML files, zips and folders loaded from their
// device. Kept in this browser only (IndexedDB) and served to the game frame
// by public/sw.js.
const LibraryContext = createContext(null);

const gameStoragePrefix = (id) => `x360:game:${id}:`;

function registerPlayer() {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return Promise.reject(new Error('unsupported'));
  return navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then(() => navigator.serviceWorker.ready);
}

export function LibraryProvider({ children }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const [games, setGames] = useState([]);
  const [ready, setReady] = useState(false);
  const [player, setPlayer] = useState('starting');
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef(null);
  const folderInput = useRef(null);

  // Imports finish after the screen that started them may have changed.
  const live = useRef({ ui, state });
  live.current = { ui, state };

  useEffect(() => {
    listGames()
      .then((list) => setGames(list.sort((a, b) => a.addedAt - b.addedAt)))
      .catch(() => {})
      .finally(() => setReady(true));
    registerPlayer().then(
      () => setPlayer('ready'),
      () => setPlayer('unsupported'),
    );
  }, []);

  const add = useCallback(async (job) => {
    setBusy(true);
    try {
      const { games: built, errors } = await job;
      const saved = [];
      for (const g of built) {
        try {
          await saveGame(g.meta, g.files);
          saved.push(g.meta);
        } catch {
          errors.push(`Not enough space to save ${g.meta.title}`);
        }
      }
      const u = live.current.ui;
      if (saved.length) {
        setGames((list) => [...list, ...saved]);
        navigator.storage?.persist?.().catch(() => {});
        sound.play('toast');
        const top = u.stack.at(-1);
        const open = top && top.type === 'addGame' ? u.replace : u.push;
        if (saved.length === 1) {
          u.notify({ kind: 'info', title: 'Game added', text: saved[0].title, icon: 'controller', force: true });
          open('game', { id: saved[0].id });
        } else {
          u.notify({
            kind: 'info',
            title: `${saved.length} games added`,
            text: saved.map((m) => m.title).join(', '),
            icon: 'controller',
            force: true,
          });
          open('games');
        }
      }
      for (const message of errors) {
        sound.play('error');
        u.notify({ kind: 'info', title: "Couldn't add that game", text: message, icon: 'info', force: true });
      }
    } finally {
      setBusy(false);
    }
  }, []);

  const pickFiles = useCallback(() => fileInput.current?.click(), []);
  const pickFolder = useCallback(() => folderInput.current?.click(), []);

  const rename = useCallback(async (id, title) => {
    let next = null;
    setGames((list) =>
      list.map((g) => {
        if (g.id !== id) return g;
        next = { ...g, title };
        return next;
      }),
    );
    if (next) await updateGame(next);
  }, []);

  const remove = useCallback(
    async (id) => {
      await deleteGame(id);
      try {
        const prefix = gameStoragePrefix(id);
        Object.keys(localStorage)
          .filter((k) => k.startsWith(prefix))
          .forEach((k) => localStorage.removeItem(k));
      } catch {
        /* storage unavailable */
      }
      actions.forget(`game:${id}`);
      setGames((list) => list.filter((g) => g.id !== id));
    },
    [actions],
  );

  // Drag files or folders onto the dashboard to add them.
  useEffect(() => {
    const accepts = (e) => {
      const { ui: u, state: s } = live.current;
      return u.power === 'on' && s.onboarded && e.dataTransfer && [...e.dataTransfer.types].includes('Files');
    };
    let depth = 0;
    const onEnter = (e) => {
      if (!accepts(e)) return;
      depth += 1;
      setDragging(true);
    };
    const onLeave = () => {
      depth = Math.max(0, depth - 1);
      if (!depth) setDragging(false);
    };
    const onOver = (e) => {
      if (accepts(e)) e.preventDefault();
    };
    const onDrop = (e) => {
      depth = 0;
      setDragging(false);
      if (!accepts(e)) return;
      e.preventDefault();
      const entries = [...e.dataTransfer.items].map((item) => item.webkitGetAsEntry?.()).filter(Boolean);
      add(entries.length ? gamesFromDrop(entries) : gamesFromFiles(e.dataTransfer.files));
    };
    window.addEventListener('dragenter', onEnter);
    window.addEventListener('dragleave', onLeave);
    window.addEventListener('dragover', onOver);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onEnter);
      window.removeEventListener('dragleave', onLeave);
      window.removeEventListener('dragover', onOver);
      window.removeEventListener('drop', onDrop);
    };
  }, [add]);

  const value = useMemo(
    () => ({
      games,
      byId: Object.fromEntries(games.map((g) => [g.id, g])),
      ready,
      player,
      busy,
      dragging,
      pickFiles,
      pickFolder,
      rename,
      remove,
    }),
    [games, ready, player, busy, dragging, pickFiles, pickFolder, rename, remove],
  );

  const onPicked = (read) => (e) => {
    const files = e.target.files;
    if (files && files.length) add(read(files));
    e.target.value = '';
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
      <input ref={fileInput} type="file" accept=".html,.htm,.zip" multiple hidden onChange={onPicked(gamesFromFiles)} />
      <input ref={folderInput} type="file" webkitdirectory="" hidden onChange={onPicked(gamesFromFolder)} />
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  return useContext(LibraryContext);
}

// Loaded games live in IndexedDB: one record per game in `games`, and every
// file as a Blob in `files`, keyed "<gameId>/<path>". public/sw.js opens the
// same database to serve those files to the game, so keep the two in step.
const DB_NAME = 'x360-library';
const DB_VERSION = 1;

let dbPromise = null;

function open() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('games')) db.createObjectStore('games', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('files')) db.createObjectStore('files');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

function finished(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('Saving the game was cancelled'));
  });
}

export async function listGames() {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = db.transaction('games').objectStore('games').getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Files are stored as plain bytes ({ type, data }) rather than Blobs: some
// Safari versions can't put a Blob into IndexedDB. Older saves hold Blobs.
export const asBlob = (rec) => (rec instanceof Blob ? rec : rec && rec.data ? new Blob([rec.data], { type: rec.type || '' }) : null);

export async function saveGame(meta, files) {
  const records = [];
  for (const [path, blob] of files) records.push([path, { type: blob.type, data: await blob.arrayBuffer() }]);
  const db = await open();
  const tx = db.transaction(['games', 'files'], 'readwrite');
  const store = tx.objectStore('files');
  for (const [path, rec] of records) store.put(rec, `${meta.id}/${path}`);
  tx.objectStore('games').put(meta);
  return finished(tx);
}

// Every file of a game as Map<path, Blob>.
export async function readGameFiles(id) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const out = new Map();
    const range = IDBKeyRange.bound(`${id}/`, `${id}/\uffff`);
    const req = db.transaction('files').objectStore('files').openCursor(range);
    req.onsuccess = () => {
      const cur = req.result;
      if (!cur) return resolve(out);
      out.set(String(cur.key).slice(id.length + 1), asBlob(cur.value));
      cur.continue();
    };
    req.onerror = () => reject(req.error);
  });
}

export async function updateGame(meta) {
  const db = await open();
  const tx = db.transaction('games', 'readwrite');
  tx.objectStore('games').put(meta);
  return finished(tx);
}

export async function deleteGame(id) {
  const db = await open();
  const tx = db.transaction(['games', 'files'], 'readwrite');
  tx.objectStore('games').delete(id);
  tx.objectStore('files').delete(IDBKeyRange.bound(`${id}/`, `${id}/￿`));
  return finished(tx);
}

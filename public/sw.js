// Serves games loaded into the dashboard. Their files live in IndexedDB (see
// src/games/db.js); a game opened at play/<id>/<path> gets every file from
// there, so relative links, scripts, images and sounds work as they would on
// a web server. Nothing here touches the network.
const DB_NAME = 'x360-library';
const DB_VERSION = 1;
const PLAY = new URL('play/', self.registration.scope).pathname;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(PLAY)) return;
  event.respondWith(serve(url.pathname.slice(PLAY.length), event.request));
});

let dbPromise = null;
function openDb() {
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

function read(db, store, key) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(store).objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const notFound = () => new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });

async function serve(rest, request) {
  const slash = rest.indexOf('/');
  const id = slash < 0 ? rest : rest.slice(0, slash);
  let path;
  try {
    path = slash < 0 ? '' : decodeURIComponent(rest.slice(slash + 1));
  } catch {
    return notFound();
  }
  const db = await openDb();
  if (!path) {
    const meta = await read(db, 'games', id);
    if (!meta) return notFound();
    path = meta.entry;
  } else if (path.endsWith('/')) path += 'index.html';

  // Stored as { type, data } bytes (older saves: a Blob); see src/games/db.js.
  const rec = await read(db, 'files', `${id}/${path}`);
  const blob = rec instanceof Blob ? rec : rec && rec.data ? new Blob([rec.data], { type: rec.type || '' }) : null;
  if (!blob) return notFound();
  const headers = { 'Content-Type': blob.type || 'application/octet-stream', 'Cache-Control': 'no-store' };

  if (/\.html?$/i.test(path)) {
    headers['Content-Type'] = 'text/html; charset=utf-8';
    return new Response(inject(await blob.text(), id), { headers });
  }

  // Audio and video ask for byte ranges; Safari won't play media without them.
  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('Range') || '');
  if (range && (range[1] || range[2])) {
    const size = blob.size;
    let start = range[1] ? Number(range[1]) : size - Number(range[2]);
    let end = range[1] && range[2] ? Number(range[2]) : size - 1;
    start = Math.max(0, start);
    end = Math.min(end, size - 1);
    if (start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    return new Response(blob.slice(start, end + 1), {
      status: 206,
      headers: { ...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes' },
    });
  }
  return new Response(blob, { headers: { ...headers, 'Accept-Ranges': 'bytes' } });
}

// Runs first in every page of a game: gives the game its own localStorage, so
// it can't read or clear the dashboard's profile or another game's saves.
function bootstrap(prefix) {
  try {
    var real = window.localStorage;
    var own = function () {
      var out = [];
      for (var i = 0; i < real.length; i++) {
        var k = real.key(i);
        if (k && k.indexOf(prefix) === 0) out.push(k.slice(prefix.length));
      }
      return out;
    };
    var api = {
      getItem: function (k) {
        return real.getItem(prefix + k);
      },
      setItem: function (k, v) {
        real.setItem(prefix + k, String(v));
      },
      removeItem: function (k) {
        real.removeItem(prefix + k);
      },
      clear: function () {
        own().forEach(function (k) {
          real.removeItem(prefix + k);
        });
      },
      key: function (i) {
        var keys = own();
        return i < keys.length ? keys[i] : null;
      },
    };
    var storage = new Proxy(api, {
      get: function (t, k) {
        if (k === 'length') return own().length;
        if (k in t) return t[k];
        if (typeof k !== 'string') return undefined;
        var v = real.getItem(prefix + k);
        return v === null ? undefined : v;
      },
      set: function (t, k, v) {
        api.setItem(k, v);
        return true;
      },
      deleteProperty: function (t, k) {
        api.removeItem(k);
        return true;
      },
      has: function (t, k) {
        return k in t || real.getItem(prefix + String(k)) !== null;
      },
      ownKeys: function () {
        return own();
      },
      getOwnPropertyDescriptor: function (t, k) {
        var v = real.getItem(prefix + String(k));
        return v === null ? undefined : { value: v, writable: true, enumerable: true, configurable: true };
      },
    });
    Object.defineProperty(window, 'localStorage', { configurable: true, get: () => storage });
  } catch {
    /* storage unavailable: leave it as it is */
  }
}

function inject(html, id) {
  // __x360Served tells the dashboard this frame really came from here.
  const tag = `<script>window.__x360Served=1;(${bootstrap})(${JSON.stringify(`x360:game:${id}:`)})</script>`;
  const m = /<head(\s[^>]*)?>/i.exec(html) || /<html(\s[^>]*)?>/i.exec(html) || /<!doctype[^>]*>/i.exec(html);
  if (!m) return tag + html;
  const at = m.index + m[0].length;
  return html.slice(0, at) + tag + html.slice(at);
}

import { readGameFiles } from './db.js';

// Fallback player for when public/sw.js can't serve a game (no service worker,
// or it didn't answer the frame): every file becomes a blob: URL and the
// references between them (HTML attributes, CSS url(), and quoted paths in
// scripts, which covers imports and fetches) are rewritten to point at those
// URLs. Returns the entry page's URL and a cleanup function.

const TEXT = /\.(html?|css|m?js|json|svg|txt|xml|webmanifest)$/i;
const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

function typeOf(path, blob) {
  if (/\.html?$/i.test(path)) return 'text/html';
  if (/\.m?js$/i.test(path)) return 'text/javascript';
  if (/\.css$/i.test(path)) return 'text/css';
  if (/\.svg$/i.test(path)) return 'image/svg+xml';
  if (/\.json$/i.test(path)) return 'application/json';
  return blob.type || 'text/plain';
}

function resolve(from, ref) {
  if (!ref || EXTERNAL.test(ref.trim())) return null;
  try {
    const u = new URL(ref.trim(), `https://game.invalid/${from}`);
    return decodeURIComponent(u.pathname.slice(1));
  } catch {
    return null;
  }
}

// Same localStorage namespacing as public/sw.js (keep the two in step).
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
    });
    Object.defineProperty(window, 'localStorage', { configurable: true, get: () => storage });
  } catch {
    /* storage unavailable */
  }
}

// Paths built while the game runs (fetch, XHR, images, audio) can't be
// rewritten ahead of time, so map them at runtime instead.
function shim(map, entry) {
  var dir = entry.slice(0, entry.lastIndexOf('/') + 1);
  var lookup = function (u) {
    if (typeof u !== 'string' || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(u)) return u;
    try {
      var p = decodeURIComponent(new URL(u, 'https://game.invalid/' + dir).pathname.slice(1));
      return map[p] || u;
    } catch {
      return u;
    }
  };
  var f = window.fetch;
  if (f)
    window.fetch = function (input, init) {
      return f.call(this, typeof input === 'string' ? lookup(input) : input, init);
    };
  var open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (m, u) {
    var args = Array.prototype.slice.call(arguments);
    args[1] = lookup(u);
    return open.apply(this, args);
  };
  [HTMLImageElement, HTMLMediaElement, HTMLScriptElement, HTMLSourceElement].forEach(function (C) {
    var d = C && Object.getOwnPropertyDescriptor(C.prototype, 'src');
    if (d && d.set)
      Object.defineProperty(C.prototype, 'src', {
        configurable: true,
        get: d.get,
        set: function (v) {
          d.set.call(this, lookup(v));
        },
      });
  });
}

export async function buildInlineGame(game) {
  const files = await readGameFiles(game.id);
  const urls = new Map();
  const made = [];
  const url = (path, blob) => {
    const u = URL.createObjectURL(blob);
    made.push(u);
    urls.set(path, u);
    return u;
  };

  // Binary files first; text files are rewritten on demand (depth first).
  for (const [path, blob] of files) if (!TEXT.test(path)) url(path, blob);
  const busy = new Set();
  const urlFor = async (path) => {
    if (urls.has(path)) return urls.get(path);
    if (!files.has(path) || busy.has(path)) return null; // missing, or a cycle
    busy.add(path);
    const blob = files.get(path);
    const text = await rewrite(path, await blob.text());
    return url(path, new Blob([text], { type: typeOf(path, blob) }));
  };
  // Imports resolve against the script, fetches against the page: try both.
  const swap = async (from, ref) => {
    for (const base of from === game.entry ? [from] : [from, game.entry]) {
      const path = resolve(base, ref);
      const u = path && (await urlFor(path));
      if (u) return u;
    }
    return null;
  };
  const replaceAsync = async (text, re, fn) => {
    const parts = [];
    let last = 0;
    for (const m of text.matchAll(re)) {
      parts.push(text.slice(last, m.index), await fn(m));
      last = m.index + m[0].length;
    }
    parts.push(text.slice(last));
    return parts.join('');
  };
  const css = (from, text) => replaceAsync(text, /url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, async (m) => `url("${(await swap(from, m[2])) || m[2]}")`);
  const strings = (from, text) =>
    replaceAsync(text, /(['"`])([^'"`\n\r]{1,300}?\.[a-z0-9]{1,6})\1/gi, async (m) => {
      const u = await swap(from, m[2]);
      return u ? `${m[1]}${u}${m[1]}` : m[0];
    });

  async function rewrite(path, text) {
    if (/\.css$/i.test(path)) return css(path, text);
    if (/\.m?js$/i.test(path)) return strings(path, text);
    if (/\.html?$/i.test(path)) {
      let out = await replaceAsync(text, /\b(src|href|poster|data)\s*=\s*(['"])([^'"]*)\2/gi, async (m) => {
        const u = await swap(path, m[3]);
        return u ? `${m[1]}=${m[2]}${u}${m[2]}` : m[0];
      });
      out = await replaceAsync(out, /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi, async (m) => m[1] + (await css(path, m[2])) + m[3]);
      out = await replaceAsync(
        out,
        /(<script\b(?![^>]*\bsrc=)[^>]*>)([\s\S]*?)(<\/script>)/gi,
        async (m) => m[1] + (await strings(path, m[2])) + m[3],
      );
      out = await replaceAsync(out, /style\s*=\s*(['"])([^'"]*url\([^'"]*)\1/gi, async (m) => `style=${m[1]}${await css(path, m[2])}${m[1]}`);
      const map = Object.fromEntries(urls);
      // Esc and Home go to the dashboard first (as in public/sw.js).
      const tag = `<script>window.addEventListener('keydown',function(e){if(e.key==='Escape'||e.key==='Home'){try{parent.postMessage({x360:'guide'},'*')}catch(_){}}},true);(${bootstrap})(${JSON.stringify(`x360:game:${game.id}:`)});(${shim})(${JSON.stringify(map)},${JSON.stringify(game.entry)})</script>`;
      const head = /<head(\s[^>]*)?>/i.exec(out) || /<html(\s[^>]*)?>/i.exec(out);
      return head ? out.slice(0, head.index + head[0].length) + tag + out.slice(head.index + head[0].length) : tag + out;
    }
    return text;
  }

  // Everything else first, so the entry page can carry the complete map.
  for (const path of files.keys()) if (path !== game.entry) await urlFor(path);
  const entry = await urlFor(game.entry);
  return { src: entry, cleanup: () => made.forEach((u) => URL.revokeObjectURL(u)) };
}

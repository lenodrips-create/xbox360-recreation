import { unzip } from 'fflate';
import { typeFor } from './mime.js';

// Turns what the player picked (HTML files, .zip files or a folder) into
// games: { meta, files }, where files maps each relative path to a Blob.

const JUNK = /(^|\/)(__MACOSX|\.DS_Store|Thumbs\.db|desktop\.ini)(\/|$)/i;
const PAGE = /\.html?$/i;
const MOTIFS = ['rings', 'stripes', 'peaks', 'grid', 'burst', 'waves'];

class ImportError extends Error {}

const depth = (path) => path.split('/').length;
const byDepthThenName = (a, b) => depth(a.path) - depth(b.path) || a.path.localeCompare(b.path);

function hash(text) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

function newId() {
  const raw = globalThis.crypto?.randomUUID ? crypto.randomUUID().replace(/-/g, '') : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `h${raw.slice(0, 12)}`;
}

function readTitle(html) {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  if (!m) return '';
  return m[1]
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
}

// Drops a folder that wraps everything (zips usually have one) and picks the
// start page: the shallowest index.html, otherwise the shallowest page.
async function buildGame(name, entries, source) {
  let list = entries.filter((e) => e.path && !e.path.endsWith('/') && !JUNK.test(e.path));
  while (list.length && list.every((e) => e.path.includes('/'))) {
    const root = list[0].path.slice(0, list[0].path.indexOf('/') + 1);
    if (!list.every((e) => e.path.startsWith(root))) break;
    list = list.map((e) => ({ ...e, path: e.path.slice(root.length) }));
  }
  const pages = list.filter((e) => PAGE.test(e.path)).sort(byDepthThenName);
  if (!pages.length) throw new ImportError(`No HTML file found in ${name}`);
  const entry = pages.find((e) => /(^|\/)index\.html?$/i.test(e.path)) || pages[0];

  const files = new Map();
  let size = 0;
  for (const e of list) {
    const blob = e.blob instanceof Blob ? e.blob.slice(0, e.blob.size, typeFor(e.path)) : new Blob([e.blob], { type: typeFor(e.path) });
    files.set(e.path, blob);
    size += blob.size;
  }
  const title = readTitle(await files.get(entry.path).text()) || name.replace(/\.(html?|zip)$/i, '');
  const h = hash(title);
  return {
    meta: {
      id: newId(),
      title,
      entry: entry.path,
      size,
      fileCount: files.size,
      source,
      addedAt: Date.now(),
      hue: h % 360,
      motif: MOTIFS[h % MOTIFS.length],
    },
    files,
  };
}

function unzipFile(file) {
  return file.arrayBuffer().then(
    (buf) =>
      new Promise((resolve, reject) => {
        unzip(new Uint8Array(buf), (err, out) => {
          if (err) reject(new ImportError(`${file.name} isn't a readable .zip`));
          else resolve(Object.entries(out).map(([path, data]) => ({ path, blob: data })));
        });
      }),
  );
}

// What a file is, by name or (when phones rename files) by its first bytes.
async function kindOf(file) {
  if (/\.zip$/i.test(file.name)) return 'zip';
  if (PAGE.test(file.name)) return 'html';
  const head = new Uint8Array(await file.slice(0, 512).arrayBuffer());
  if (head[0] === 0x50 && head[1] === 0x4b) return 'zip';
  const text = new TextDecoder().decode(head).trimStart().toLowerCase();
  if (text.startsWith('<!doctype html') || text.startsWith('<html') || /<(head|body|script|canvas)[\s>]/.test(text)) return 'html';
  return null;
}

async function fromFile(file) {
  const kind = await kindOf(file);
  if (kind === 'zip') return buildGame(file.name, await unzipFile(file), 'zip');
  if (kind === 'html') {
    const name = PAGE.test(file.name) ? file.name : `${file.name || 'game'}.html`;
    return buildGame(name, [{ path: name, blob: file }], 'html');
  }
  throw new ImportError(`${file.name} isn't an HTML file or a .zip`);
}

async function collect(jobs) {
  const games = [];
  const errors = [];
  for (const job of jobs) {
    try {
      games.push(await job());
    } catch (err) {
      errors.push(err instanceof ImportError ? err.message : `Couldn't read a file (${err.message || err})`);
    }
  }
  return { games, errors };
}

// HTML or .zip files from the file picker: one game each.
export function gamesFromFiles(fileList) {
  return collect([...fileList].map((file) => () => fromFile(file)));
}

// A folder from the folder picker: one game.
export function gamesFromFolder(fileList) {
  const files = [...fileList];
  if (!files.length) return Promise.resolve({ games: [], errors: [] });
  const entries = files.map((f) => ({ path: f.webkitRelativePath || f.name, blob: f }));
  const name = entries[0].path.split('/')[0];
  return collect([() => buildGame(name, entries, 'folder')]);
}

function readDirectory(dir, prefix) {
  return new Promise((resolve, reject) => {
    const reader = dir.createReader();
    const all = [];
    const next = () =>
      reader.readEntries((batch) => {
        if (!batch.length) resolve(all);
        else {
          all.push(...batch);
          next();
        }
      }, reject);
    next();
  }).then(async (children) => {
    const out = [];
    for (const child of children) {
      const path = `${prefix}${child.name}`;
      if (child.isDirectory) out.push(...(await readDirectory(child, `${path}/`)));
      else out.push({ path, blob: await new Promise((res, rej) => child.file(res, rej)) });
    }
    return out;
  });
}

// Dropped items. Call webkitGetAsEntry() inside the drop event and pass the
// entries here; dropped folders become one game each.
export function gamesFromDrop(entries) {
  return collect(
    entries.map((entry) => async () => {
      if (entry.isDirectory) return buildGame(entry.name, await readDirectory(entry, ''), 'folder');
      return fromFile(await new Promise((res, rej) => entry.file(res, rej)));
    }),
  );
}

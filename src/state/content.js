import { APP_BY_ID } from '../data/catalog.js';

// Content keys look like "game:h3f9c…" (a loaded game) or "app:a03".
// Pass the library's byId map; keys for deleted games resolve to no item.
export function parseKey(key, gamesById) {
  const [type, id] = key.split(':');
  const item = type === 'game' ? gamesById[id] : type === 'app' ? APP_BY_ID[id] : null;
  return { type, id, item };
}

export function openContent(ui, key, gamesById) {
  const { type, id, item } = parseKey(key, gamesById);
  if (!item) return;
  ui.push(type === 'game' ? 'game' : 'app', { id });
}

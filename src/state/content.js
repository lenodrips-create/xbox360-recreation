import { GAME_BY_ID } from '../data/games.js';
import { APP_BY_ID } from '../data/catalog.js';

// Content keys look like "game:g01" or "app:a03".
export function parseKey(key) {
  const [type, id] = key.split(':');
  const item = type === 'game' ? GAME_BY_ID[id] : type === 'app' ? APP_BY_ID[id] : null;
  return { type, id, item };
}

export function openContent(ui, key) {
  const { type, id, item } = parseKey(key);
  if (!item) return;
  ui.push(type === 'game' ? 'game' : 'app', { id });
}

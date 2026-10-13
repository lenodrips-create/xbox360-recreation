// Gamer pictures: original vector glyphs over gradient backgrounds.
import { REF } from './reference.js';

export const GAMERPICS = [
  { id: 'reference', name: 'Default', from: '#111111', to: '#000000', src: REF.gamerpic },
  { id: 'orb', name: 'Green Orb', from: '#7ed957', to: '#2f7d12', glyph: 'orb' },
  { id: 'bolt', name: 'Bolt', from: '#ffd35c', to: '#e07b00', glyph: 'bolt' },
  { id: 'planet', name: 'Planet', from: '#6a7dff', to: '#25206b', glyph: 'planet' },
  { id: 'paw', name: 'Paw', from: '#ff9ccf', to: '#c2185b', glyph: 'paw' },
  { id: 'leaf', name: 'Leaf', from: '#b8f08a', to: '#3d8b1f', glyph: 'leaf' },
  { id: 'flame', name: 'Flame', from: '#ff8a50', to: '#b71c1c', glyph: 'flame' },
  { id: 'snow', name: 'Snowflake', from: '#c6ecff', to: '#3b82c4', glyph: 'snow' },
  { id: 'star', name: 'Star', from: '#fff27a', to: '#d49a00', glyph: 'star' },
  { id: 'rocket', name: 'Rocket', from: '#7fd6ff', to: '#1b4f8a', glyph: 'rocket' },
  { id: 'gear', name: 'Gear', from: '#c9ced4', to: '#4d555e', glyph: 'gear' },
  { id: 'ghost', name: 'Ghost', from: '#8e86b5', to: '#2a2440', glyph: 'ghost' },
  { id: 'crown', name: 'Crown', from: '#ffe08a', to: '#8a5a00', glyph: 'crown' },
  { id: 'note', name: 'Music Note', from: '#e29bff', to: '#5b1f8a', glyph: 'note' },
  { id: 'sun', name: 'Sunburst', from: '#ffe36e', to: '#ff7a2f', glyph: 'sun' },
  { id: 'diamond', name: 'Diamond', from: '#9ff5ff', to: '#1386a8', glyph: 'diamond' },
  { id: 'heart', name: 'Heart', from: '#ff9a9a', to: '#c0283c', glyph: 'heart' },
  { id: 'avatar', name: 'My Avatar', from: '#d9e8f5', to: '#7ea6c9', glyph: 'avatar' },
];

export const GAMERPIC_BY_ID = Object.fromEntries(GAMERPICS.map((g) => [g.id, g]));

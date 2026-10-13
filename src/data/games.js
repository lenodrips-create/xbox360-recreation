// Placeholder game library. Every title here is a stand-in slot: swap the
// `title`, `publisher`, `description` and art fields for real content later.
// Art is generated at runtime from `hue` + `motif` (see PlaceholderArt).

const GENRES = ['Action', 'Racing', 'Shooter', 'Sports', 'RPG', 'Platformer', 'Puzzle', 'Fighting', 'Adventure', 'Strategy', 'Music', 'Family'];
const MOTIFS = ['rings', 'stripes', 'peaks', 'grid', 'burst', 'waves'];
const RATINGS = ['E', 'E10+', 'T', 'T', 'M', 'E'];

const ACH_NAMES = [
  ['First Steps', 'Complete the opening chapter.'],
  ['Getting Warmer', 'Finish any level without restarting.'],
  ['Collector', 'Find 25 hidden items.'],
  ['Sharpshooter', 'Hit 50 targets in a row.'],
  ['Marathon', 'Play for a total of 10 hours.'],
  ['Teamwork', 'Win a co-op match with a friend.'],
  ['Explorer', 'Visit every area on the map.'],
  ['Speed Demon', 'Beat a stage under par time.'],
  ['Untouchable', 'Clear a level without taking damage.'],
  ['Night Owl', 'Play a session after midnight.'],
  ['Big Spender', 'Spend 10,000 in-game coins.'],
  ['Social Butterfly', 'Play an online match with 8 players.'],
  ['Fully Loaded', 'Unlock every upgrade.'],
  ['Survivor', 'Survive 20 waves.'],
  ['High Roller', 'Reach the top of the leaderboard.'],
  ['Old Habits', 'Return after a week away.'],
  ['Perfectionist', 'Earn gold medals on every stage.'],
  ['Completionist', 'Finish the game on the hardest difficulty.'],
];

const G_STEPS = [10, 15, 20, 25, 30, 50, 100];

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeAchievements(n, seed, total) {
  const rand = mulberry(seed);
  const list = [];
  const count = 12 + Math.floor(rand() * 7);
  let sum = 0;
  for (let i = 0; i < count; i++) {
    const [name, desc] = ACH_NAMES[i % ACH_NAMES.length];
    const g = G_STEPS[Math.floor(rand() * (i === count - 1 ? 7 : 5))];
    sum += g;
    list.push({ id: `g${n}a${String(i + 1).padStart(2, '0')}`, name, desc, g, icon: i % 8 });
  }
  // Scale so each game totals its advertised gamerscore (multiples of 5).
  const k = total / sum;
  list.forEach((a) => {
    a.g = Math.max(5, Math.round((a.g * k) / 5) * 5);
  });
  let diff = total - list.reduce((s, a) => s + a.g, 0);
  const byValue = [...list].sort((x, y) => y.g - x.g);
  let i = 0;
  while (diff !== 0 && i < 1000) {
    const a = byValue[i % byValue.length];
    const step = diff > 0 ? 5 : -5;
    if (a.g + step >= 5) {
      a.g += step;
      diff -= step;
    }
    i++;
  }
  return list;
}

export const GAMES = Array.from({ length: 12 }, (_, i) => {
  const n = String(i + 1).padStart(2, '0');
  const total = i % 4 === 3 ? 400 : i % 5 === 2 ? 200 : 1000;
  return {
    id: `g${n}`,
    kind: 'game',
    title: `Game Title ${n}`,
    short: `Game ${n}`,
    genre: GENRES[i % GENRES.length],
    publisher: 'Publisher Name',
    developer: 'Developer Studio',
    released: `${['Mar', 'Jun', 'Sep', 'Nov', 'Feb', 'Oct'][i % 6]} ${2011 + (i % 3)}`,
    rating: RATINGS[i % RATINGS.length],
    players: i % 3 === 0 ? '1-4 players' : i % 3 === 1 ? '1 player' : '1-2 players',
    online: i % 2 === 0 ? 'Online multiplayer 2-16' : 'Online co-op 2',
    size: [6.8, 7.4, 3.1, 0.9, 6.2, 1.4, 7.9, 4.5, 2.2, 6.6, 0.6, 5.3][i],
    arcade: i % 4 === 3,
    hue: (i * 137 + 200) % 360,
    motif: MOTIFS[i % MOTIFS.length],
    description:
      'This is a placeholder entry for a future game. Replace this text with the official description, ' +
      'features and credits when real content is added to the library.',
    total,
    achievements: makeAchievements(n, 7919 * (i + 3), total),
  };
});

export const GAME_BY_ID = Object.fromEntries(GAMES.map((g) => [g.id, g]));

// Deterministic "already unlocked" achievements for a lived-in profile.
export function seedUnlocked() {
  const out = {};
  const base = Date.UTC(2013, 9, 20);
  GAMES.forEach((g, gi) => {
    const rand = mulberry(31 * (gi + 11));
    const ratio = [0.75, 0.5, 0.35, 0.6, 0.2, 0.9, 0.45, 0.3, 0.15, 0.55, 0.0, 0.25][gi];
    const map = {};
    g.achievements.forEach((a, ai) => {
      if (ai === 0 && ratio > 0) map[a.id] = base - (gi * 9 + 40) * 86400000;
      else if (rand() < ratio) map[a.id] = base - Math.floor(rand() * 600 + gi * 7) * 86400000;
    });
    out[g.id] = map;
  });
  return out;
}

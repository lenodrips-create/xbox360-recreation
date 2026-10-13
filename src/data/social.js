// Fictional friends, messages and beacons. None of these gamertags belong
// to real accounts — they are invented for this offline simulation.
import { randomAvatar } from './avatar.js';

const F = (id, gamertag, gamerpic, presence, activity, extra = {}) => ({
  id,
  gamertag,
  gamerpic,
  presence,
  activity,
  avatar: { ...randomAvatar(id.length * 17 + gamertag.charCodeAt(0) * 3 + gamertag.length), ...(extra.avatar || {}) },
  gamerscore: extra.gamerscore ?? 10000,
  motto: extra.motto ?? '',
  bio: extra.bio ?? '',
  location: extra.location ?? '',
  zone: extra.zone ?? 'Recreation',
  rep: extra.rep ?? 4,
  tier: extra.tier ?? 'gold',
  games: extra.games ?? ['g01', 'g02'],
  beacon: extra.beacon ?? null,
});

export const FRIENDS = [
  F('f01', 'PixelDrifter', 'bolt', 'online', 'Playing Game Title 03', {
    gamerscore: 48210,
    motto: 'Drift first, ask later.',
    bio: 'Racing nerd. Co-op anytime after 8pm.',
    location: 'Lakeside',
    zone: 'Pro',
    rep: 5,
    games: ['g03', 'g01', 'g07', 'g02'],
    beacon: { game: 'g03', text: 'Need two more for co-op tonight!' },
    avatar: { hair: 'spiky', hairColor: '#e0b862', top: 'jacket', topColor: '#c0392b', accessory: 'headphones', skin: '#eec1a0' },
  }),
  F('f02', 'LunarLlama', 'planet', 'online', 'Xbox Dashboard', {
    gamerscore: 23105,
    motto: 'To the moon, slowly.',
    bio: 'Mostly puzzle games and late-night arcade runs.',
    location: 'Harbor City',
    games: ['g07', 'g09', 'g12'],
    avatar: { hair: 'long', hairColor: '#2a1d16', top: 'hoodie', topColor: '#8e44ad', accessory: 'none', skin: '#b97f57' },
  }),
  F('f03', 'Mochi Mayhem', 'paw', 'online', 'Playing Game Title 07', {
    gamerscore: 61980,
    motto: 'Achievement hunter. Send tips.',
    bio: 'Completionist. 100% or bust.',
    location: 'Maple Grove',
    zone: 'Underground',
    rep: 5,
    games: ['g07', 'g01', 'g05', 'g10', 'g04'],
    beacon: { game: 'g07', text: 'Boosting the online achievements, join up' },
    avatar: { hair: 'bob', hairColor: '#d04f9a', top: 'stripe', topColor: '#f0f0f0', accessory: 'glasses', skin: '#f6d7c3' },
  }),
  F('f04', 'TurboTortoise', 'leaf', 'away', 'Away', {
    gamerscore: 12560,
    motto: 'Slow and steady wins.',
    bio: 'Weekend gamer.',
    location: 'Riverside',
    games: ['g02', 'g06'],
    avatar: { hair: 'buzz', hairColor: '#2a1d16', top: 'tee', topColor: '#4fa821', accessory: 'cap', skin: '#8d5a3b' },
  }),
  F('f05', 'GhostPepper22', 'flame', 'online', 'Playing Game Title 01', {
    gamerscore: 35740,
    motto: 'Too hot to handle.',
    bio: 'Shooters, fighters and spicy food.',
    location: 'Desert Springs',
    zone: 'Pro',
    games: ['g01', 'g03', 'g08'],
    avatar: { hair: 'mohawk', hairColor: '#b5472c', top: 'jacket', topColor: '#2b2b2b', accessory: 'none', skin: '#d9a27c' },
  }),
  F('f06', 'Frostbyte', 'snow', 'busy', 'Watching a video', {
    gamerscore: 18300,
    motto: 'Stay frosty.',
    bio: 'Strategy and sims.',
    location: 'North Ridge',
    games: ['g10', 'g09'],
    avatar: { hair: 'swept', hairColor: '#d8d8d8', top: 'hoodie', topColor: '#2f6fb5', accessory: 'beanie', skin: '#f6d7c3' },
  }),
  F('f07', 'NoScopeNana', 'star', 'offline', 'Last seen 2 hours ago', {
    gamerscore: 72015,
    motto: 'Grandma has aim.',
    bio: 'Been gaming since cartridges.',
    location: 'Sunnyvale Heights',
    zone: 'Family',
    rep: 5,
    games: ['g01', 'g03', 'g05'],
    avatar: { hair: 'curly', hairColor: '#d8d8d8', top: 'tee', topColor: '#e67e22', accessory: 'glasses', skin: '#eec1a0' },
  }),
  F('f08', 'Quasar Kid', 'rocket', 'offline', 'Last seen yesterday', {
    gamerscore: 9045,
    motto: 'Brightest thing in the sky.',
    bio: 'New to Xbox LIVE, add me!',
    location: 'Orbit Park',
    games: ['g12', 'g11'],
    tier: 'silver',
    avatar: { hair: 'ponytail', hairColor: '#3a63c9', top: 'logo', topColor: '#f1c40f', accessory: 'none', skin: '#d9a27c' },
  }),
  F('f09', 'RustyWrench7', 'gear', 'offline', 'Last seen 3 days ago', {
    gamerscore: 27430,
    motto: "If it ain't broke, mod it.",
    bio: 'Mechanic by day, racer by night.',
    location: 'Old Town',
    games: ['g02', 'g08'],
    avatar: { hair: 'short', hairColor: '#5a3825', top: 'jacket', topColor: '#3b3b3b', accessory: 'cap', skin: '#b97f57' },
  }),
  F('f10', 'SilentBanshee', 'ghost', 'online', 'Playing Game Title 05', {
    gamerscore: 41120,
    motto: '...',
    bio: 'Stealth games only.',
    location: 'Fog Hollow',
    zone: 'Underground',
    games: ['g05', 'g01'],
    avatar: { hair: 'long', hairColor: '#2a1d16', top: 'hoodie', topColor: '#2b2b2b', accessory: 'headphones', skin: '#f6d7c3' },
  }),
  F('f11', 'Captain Cobalt', 'crown', 'offline', 'Last seen 5 hours ago', {
    gamerscore: 15880,
    motto: 'Set sail for high scores.',
    bio: 'Party chat legend.',
    location: 'Port Azure',
    games: ['g06', 'g09'],
    avatar: { hair: 'swept', hairColor: '#9a6a3a', top: 'stripe', topColor: '#2f6fb5', accessory: 'none', skin: '#eec1a0' },
  }),
  F('f12', 'BitCrusher', 'note', 'away', 'Away', {
    gamerscore: 30215,
    motto: 'Chiptune forever.',
    bio: 'Rhythm games and synths.',
    location: 'Neon District',
    games: ['g11', 'g04'],
    avatar: { hair: 'curly', hairColor: '#2a1d16', top: 'logo', topColor: '#8e44ad', accessory: 'headphones', skin: '#5e3a26' },
  }),
];

export const FRIEND_BY_ID = Object.fromEntries(FRIENDS.map((f) => [f.id, f]));

const H = 3600000;
export function seedMessages() {
  const now = Date.now();
  return [
    {
      id: 'm1',
      from: 'f01',
      at: now - 0.6 * H,
      read: false,
      kind: 'text',
      body: 'You up for co-op tonight? I set a beacon for Game Title 03. Bring snacks.',
    },
    {
      id: 'm2',
      from: 'system',
      at: now - 5 * H,
      read: false,
      kind: 'text',
      subject: 'Welcome back to Xbox LIVE',
      body: 'This is a simulated Xbox LIVE message. Nothing here connects to real services — enjoy the nostalgia!',
    },
    {
      id: 'm3',
      from: 'f03',
      at: now - 22 * H,
      read: true,
      kind: 'invite',
      game: 'g07',
      body: 'Game invite: join me in Game Title 07. Online achievements are way easier with two.',
    },
    {
      id: 'm4',
      from: 'f05',
      at: now - 30 * H,
      read: true,
      kind: 'voice',
      body: '[Voice message · 0:12] Hey! Rematch later? I swear the lag got me.',
    },
    { id: 'm5', from: 'f02', at: now - 50 * H, read: true, kind: 'friend', body: 'Friend request accepted. Hi! Saw you on the leaderboard.' },
    { id: 'm6', from: 'f07', at: now - 96 * H, read: true, kind: 'text', body: 'Grandma just beat your high score again. Better practice, kiddo.' },
  ];
}

export const AUTO_REPLIES = [
  'Ha, nice. Catch you online later!',
  'Sounds good, send me a party invite.',
  "brb grabbing a snack, then I'm in",
  'LOL. GG though.',
  "Deal. Beacon me when you're on.",
];

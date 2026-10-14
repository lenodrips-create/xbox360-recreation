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
  beacon: extra.beacon ?? null,
});

// What friends are shown doing in the simulation. Not tied to any game.
export const ACTIVITIES = ['Playing a game', 'Xbox Dashboard', 'Watching a video', 'Listening to music', 'In a party'];

export const FRIENDS = [
  F('f01', 'PixelDrifter', 'bolt', 'online', 'Playing a game', {
    gamerscore: 48210,
    motto: 'Drift first, ask later.',
    bio: 'Racing nerd. Co-op anytime after 8pm.',
    location: 'Lakeside',
    zone: 'Pro',
    rep: 5,
    beacon: { text: 'Need two more for co-op tonight!' },
    avatar: { hair: 'spiky', hairColor: '#e0b862', top: 'jacket', topColor: '#c0392b', accessory: 'headphones', skin: '#eec1a0' },
  }),
  F('f02', 'LunarLlama', 'planet', 'online', 'Xbox Dashboard', {
    gamerscore: 23105,
    motto: 'To the moon, slowly.',
    bio: 'Mostly puzzle games and late-night arcade runs.',
    location: 'Harbor City',
    avatar: { hair: 'long', hairColor: '#2a1d16', top: 'hoodie', topColor: '#8e44ad', accessory: 'none', skin: '#b97f57' },
  }),
  F('f03', 'Mochi Mayhem', 'paw', 'online', 'Playing a game', {
    gamerscore: 61980,
    motto: 'Achievement hunter. Send tips.',
    bio: 'Completionist. 100% or bust.',
    location: 'Maple Grove',
    zone: 'Underground',
    rep: 5,
    beacon: { text: 'Boosting the online achievements, join up' },
    avatar: { hair: 'bob', hairColor: '#d04f9a', top: 'stripe', topColor: '#f0f0f0', accessory: 'glasses', skin: '#f6d7c3' },
  }),
  F('f04', 'TurboTortoise', 'leaf', 'away', 'Away', {
    gamerscore: 12560,
    motto: 'Slow and steady wins.',
    bio: 'Weekend gamer.',
    location: 'Riverside',
    avatar: { hair: 'buzz', hairColor: '#2a1d16', top: 'tee', topColor: '#4fa821', accessory: 'cap', skin: '#8d5a3b' },
  }),
  F('f05', 'GhostPepper22', 'flame', 'online', 'Playing a game', {
    gamerscore: 35740,
    motto: 'Too hot to handle.',
    bio: 'Shooters, fighters and spicy food.',
    location: 'Desert Springs',
    zone: 'Pro',
    avatar: { hair: 'mohawk', hairColor: '#b5472c', top: 'jacket', topColor: '#2b2b2b', accessory: 'none', skin: '#d9a27c' },
  }),
  F('f06', 'Frostbyte', 'snow', 'busy', 'Watching a video', {
    gamerscore: 18300,
    motto: 'Stay frosty.',
    bio: 'Strategy and sims.',
    location: 'North Ridge',
    avatar: { hair: 'swept', hairColor: '#d8d8d8', top: 'hoodie', topColor: '#2f6fb5', accessory: 'beanie', skin: '#f6d7c3' },
  }),
  F('f07', 'NoScopeNana', 'star', 'offline', 'Last seen 2 hours ago', {
    gamerscore: 72015,
    motto: 'Grandma has aim.',
    bio: 'Been gaming since cartridges.',
    location: 'Sunnyvale Heights',
    zone: 'Family',
    rep: 5,
    avatar: { hair: 'curly', hairColor: '#d8d8d8', top: 'tee', topColor: '#e67e22', accessory: 'glasses', skin: '#eec1a0' },
  }),
  F('f08', 'Quasar Kid', 'rocket', 'offline', 'Last seen yesterday', {
    gamerscore: 9045,
    motto: 'Brightest thing in the sky.',
    bio: 'New to Xbox LIVE, add me!',
    location: 'Orbit Park',
    tier: 'silver',
    avatar: { hair: 'ponytail', hairColor: '#3a63c9', top: 'logo', topColor: '#f1c40f', accessory: 'none', skin: '#d9a27c' },
  }),
  F('f09', 'RustyWrench7', 'gear', 'offline', 'Last seen 3 days ago', {
    gamerscore: 27430,
    motto: "If it ain't broke, mod it.",
    bio: 'Mechanic by day, racer by night.',
    location: 'Old Town',
    avatar: { hair: 'short', hairColor: '#5a3825', top: 'jacket', topColor: '#3b3b3b', accessory: 'cap', skin: '#b97f57' },
  }),
  F('f10', 'SilentBanshee', 'ghost', 'online', 'Playing a game', {
    gamerscore: 41120,
    motto: '...',
    bio: 'Stealth games only.',
    location: 'Fog Hollow',
    zone: 'Underground',
    avatar: { hair: 'long', hairColor: '#2a1d16', top: 'hoodie', topColor: '#2b2b2b', accessory: 'headphones', skin: '#f6d7c3' },
  }),
  F('f11', 'Captain Cobalt', 'crown', 'offline', 'Last seen 5 hours ago', {
    gamerscore: 15880,
    motto: 'Set sail for high scores.',
    bio: 'Party chat legend.',
    location: 'Port Azure',
    avatar: { hair: 'swept', hairColor: '#9a6a3a', top: 'stripe', topColor: '#2f6fb5', accessory: 'none', skin: '#eec1a0' },
  }),
  F('f12', 'BitCrusher', 'note', 'away', 'Away', {
    gamerscore: 30215,
    motto: 'Chiptune forever.',
    bio: 'Rhythm games and synths.',
    location: 'Neon District',
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
      body: 'You up for co-op tonight? I set a beacon. Bring snacks.',
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
      kind: 'text',
      body: 'Party later? Send me an invite when you get on.',
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

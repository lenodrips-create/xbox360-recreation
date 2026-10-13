import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { DEFAULT_AVATAR } from '../data/avatar.js';
import { GAMES, GAME_BY_ID, seedUnlocked } from '../data/games.js';
import { seedMessages } from '../data/social.js';

const STORAGE_KEY = 'x360-metro-dashboard:v1';

function createDefaultState() {
  return {
    version: 2,
    signedIn: true,
    profile: {
      gamertag: 'LavendFilms',
      name: 'Alex Rivera',
      motto: 'Respawn. Repeat.',
      bio: 'Couch co-op veteran. Collector of 5G achievements. Always up for a party chat.',
      location: 'Pacific Northwest',
      zone: 'Recreation',
      gamerpic: 'reference',
      avatar: { ...DEFAULT_AVATAR },
      rep: 5,
      tier: 'gold',
      memberSince: 2006,
      points: 1600,
      balance: 0,
    },
    settings: {
      theme: 'default',
      sound: true,
      volume: 70,
      notifications: true,
      friendAlerts: true,
      spotlightAutoplay: true,
      reduceMotion: false,
      bootAnimation: true,
      clock24: false,
      brightness: 50,
      contrast: 50,
      safeArea: 100,
      resolution: '1080p',
      screenFormat: 'Widescreen',
      colorSpace: 'Auto',
      audioOutput: 'Digital Stereo',
      language: 'English',
      locale: 'United States',
      autoSignIn: true,
      powerMode: 'Instant-On',
      autoUpdate: true,
      family: { safeguards: false, games: 'Off', video: 'Off', timer: 'Off', online: 'Allowed' },
      privacy: { profile: 'Everyone', voice: 'Friends Only', presence: 'Everyone' },
    },
    pins: ['game:g01', 'app:a01', 'game:g05'],
    recent: ['game:g01', 'game:g04', 'app:a02', 'game:g07', 'game:g02', 'app:a05', 'game:g10', 'game:g03'],
    unlocked: seedUnlocked(),
    messages: seedMessages().map((m) => ({ ...m, read: true })),
    removedFriends: [],
    myBeacon: null,
    uninstalled: ['game:g11', 'game:g12'],
    downloads: [],
    cacheClearedAt: null,
  };
}

function mergeSaved(defaults, saved) {
  if (!saved || typeof saved !== 'object' || saved.version !== defaults.version) return defaults;
  return {
    ...defaults,
    ...saved,
    profile: {
      ...defaults.profile,
      ...saved.profile,
      avatar: { ...defaults.profile.avatar, ...(saved.profile && saved.profile.avatar) },
    },
    settings: {
      ...defaults.settings,
      ...saved.settings,
      family: { ...defaults.settings.family, ...(saved.settings && saved.settings.family) },
      privacy: { ...defaults.settings.privacy, ...(saved.settings && saved.settings.privacy) },
    },
  };
}

function loadState() {
  const defaults = createDefaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return mergeSaved(defaults, JSON.parse(raw));
  } catch {
    return defaults;
  }
}

function toggleIn(list, key) {
  return list.includes(key) ? list.filter((k) => k !== key) : [key, ...list];
}

function reducer(state, action) {
  switch (action.type) {
    case 'profile':
      return { ...state, profile: { ...state.profile, ...action.patch } };
    case 'avatar':
      return { ...state, profile: { ...state.profile, avatar: { ...state.profile.avatar, ...action.patch } } };
    case 'settings':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'family':
      return { ...state, settings: { ...state.settings, family: { ...state.settings.family, ...action.patch } } };
    case 'privacy':
      return { ...state, settings: { ...state.settings, privacy: { ...state.settings.privacy, ...action.patch } } };
    case 'pin':
      return { ...state, pins: toggleIn(state.pins, action.key) };
    case 'recent':
      return { ...state, recent: [action.key, ...state.recent.filter((k) => k !== action.key)].slice(0, 12) };
    case 'unlock': {
      const game = state.unlocked[action.game] || {};
      if (game[action.ach]) return state;
      return { ...state, unlocked: { ...state.unlocked, [action.game]: { ...game, [action.ach]: Date.now() } } };
    }
    case 'msgRead':
      return { ...state, messages: state.messages.map((m) => (m.id === action.id ? { ...m, read: true } : m)) };
    case 'msgDelete':
      return { ...state, messages: state.messages.filter((m) => m.id !== action.id) };
    case 'msgAdd':
      return { ...state, messages: [action.message, ...state.messages] };
    case 'friendRemove':
      return { ...state, removedFriends: [...new Set([...state.removedFriends, action.id])] };
    case 'friendsRestore':
      return { ...state, removedFriends: [] };
    case 'beacon':
      return { ...state, myBeacon: action.beacon };
    case 'uninstall':
      return { ...state, uninstalled: [...new Set([...state.uninstalled, action.key])] };
    case 'install':
      return { ...state, uninstalled: state.uninstalled.filter((k) => k !== action.key) };
    case 'download':
      return state.downloads.includes(action.id) ? state : { ...state, downloads: [...state.downloads, action.id] };
    case 'removeDownload':
      return { ...state, downloads: state.downloads.filter((d) => d !== action.id) };
    case 'clearCache':
      return { ...state, cacheClearedAt: Date.now() };
    case 'signIn':
      return { ...state, signedIn: action.value };
    case 'reset':
      return createDefaultState();
    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        /* storage unavailable (private mode) - preferences stay in memory */
      }
    }, 250);
    return () => clearTimeout(t);
  }, [state]);

  const actions = useMemo(
    () => ({
      updateProfile: (patch) => dispatch({ type: 'profile', patch }),
      updateAvatar: (patch) => dispatch({ type: 'avatar', patch }),
      updateSettings: (patch) => dispatch({ type: 'settings', patch }),
      updateFamily: (patch) => dispatch({ type: 'family', patch }),
      updatePrivacy: (patch) => dispatch({ type: 'privacy', patch }),
      togglePin: (key) => dispatch({ type: 'pin', key }),
      touchRecent: (key) => dispatch({ type: 'recent', key }),
      unlock: (game, ach) => dispatch({ type: 'unlock', game, ach }),
      readMessage: (id) => dispatch({ type: 'msgRead', id }),
      deleteMessage: (id) => dispatch({ type: 'msgDelete', id }),
      addMessage: (message) => dispatch({ type: 'msgAdd', message }),
      removeFriend: (id) => dispatch({ type: 'friendRemove', id }),
      restoreFriends: () => dispatch({ type: 'friendsRestore' }),
      setBeacon: (beacon) => dispatch({ type: 'beacon', beacon }),
      uninstall: (key) => dispatch({ type: 'uninstall', key }),
      install: (key) => dispatch({ type: 'install', key }),
      download: (id) => dispatch({ type: 'download', id }),
      removeDownload: (id) => dispatch({ type: 'removeDownload', id }),
      clearCache: () => dispatch({ type: 'clearCache' }),
      setSignedIn: (value) => dispatch({ type: 'signIn', value }),
      reset: () => {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        dispatch({ type: 'reset' });
      },
    }),
    [],
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}

// ---- selectors -----------------------------------------------------------

export function gamerscoreOf(unlocked) {
  let total = 0;
  for (const g of GAMES) {
    const map = unlocked[g.id] || {};
    for (const a of g.achievements) if (map[a.id]) total += a.g;
  }
  return total;
}

export function gameProgress(unlocked, gameId) {
  const g = GAME_BY_ID[gameId];
  const map = unlocked[gameId] || {};
  let earned = 0;
  let count = 0;
  for (const a of g.achievements) {
    if (map[a.id]) {
      earned += a.g;
      count++;
    }
  }
  return { earned, count, total: g.total, of: g.achievements.length };
}

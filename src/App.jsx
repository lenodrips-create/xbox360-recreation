import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NavProvider, useNav } from './nav/NavProvider.jsx';
import { StoreProvider, useStore } from './state/store.jsx';
import { UIProvider, useUI } from './state/ui.jsx';
import { sound } from './audio/sound.js';
import { THEME_BY_ID } from './data/themes.js';
import { FRIENDS } from './data/social.js';
import { GAMES } from './data/games.js';
import { ArtDefs } from './components/Art.jsx';
import { Background, ProfileCorner } from './components/Chrome.jsx';
import Dashboard from './components/Dashboard.jsx';
import ScreenStack from './screens/ScreenStack.jsx';
import Guide from './overlays/Guide.jsx';
import DialogHost from './overlays/Dialog.jsx';
import KeyboardHost from './overlays/Keyboard.jsx';
import ToastHost from './overlays/Toasts.jsx';
import HelpOverlay from './overlays/Help.jsx';
import PowerOverlay from './overlays/Power.jsx';

const W = 1920;
const H = 1080;

function useStageScale() {
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return scale;
}

// Simulated Xbox LIVE activity: friends come online, change games, and
// reply to messages you send. Entirely local.
function useLiveSimulation() {
  const ui = useUI();
  const { state } = useStore();
  const presenceRef = useRef(ui.presence);
  presenceRef.current = ui.presence;
  const { notify, setFriendPresence, power } = ui;
  const signedIn = state.signedIn;
  const removed = state.removedFriends;

  useEffect(() => {
    if (power !== 'on' || !signedIn) return undefined;
    const tick = () => {
      const pool = FRIENDS.filter((f) => !removed.includes(f.id));
      const offline = pool.filter((f) => presenceRef.current[f.id].presence === 'offline');
      const online = pool.filter((f) => presenceRef.current[f.id].presence === 'online');
      const r = Math.random();
      if (r < 0.55 && offline.length) {
        const f = offline[Math.floor(Math.random() * offline.length)];
        const g = GAMES[Math.floor(Math.random() * GAMES.length)];
        setFriendPresence(f.id, { presence: 'online', activity: `Playing ${g.title}` });
        notify({ kind: 'friend', title: `${f.gamertag} is online`, text: `Playing ${g.title}`, friend: f.id });
      } else if (r < 0.8 && online.length) {
        const f = online[Math.floor(Math.random() * online.length)];
        const g = GAMES[Math.floor(Math.random() * GAMES.length)];
        setFriendPresence(f.id, { activity: `Playing ${g.title}` });
      } else if (online.length > 3) {
        const f = online[Math.floor(Math.random() * online.length)];
        setFriendPresence(f.id, { presence: 'offline', activity: 'Last seen just now' });
      }
    };
    const t = setInterval(tick, 55000);
    return () => clearInterval(t);
  }, [power, signedIn, removed, notify, setFriendPresence]);
}

function Console() {
  const { state, actions } = useStore();
  const ui = useUI();
  const nav = useNav();
  const scale = useStageScale();
  const { settings } = state;
  const theme = THEME_BY_ID[settings.theme] || THEME_BY_ID.default;

  useEffect(() => {
    sound.setEnabled(settings.sound);
    sound.setVolume(settings.volume / 100);
  }, [settings.sound, settings.volume]);

  // Global controller actions (Guide button, help, mute).
  useEffect(() => {
    nav.global = (action) => {
      if (ui.power !== 'on') return;
      if (action === 'guide') {
        sound.play('guide');
        ui.setGuideOpen(true);
      } else if (action === 'help') {
        sound.play('open');
        ui.setHelpOpen(true);
      } else if (action === 'mute') {
        const next = !settings.sound;
        actions.updateSettings({ sound: next });
        sound.setEnabled(next);
        if (next) sound.play('toggle');
        ui.notify({
          kind: 'info',
          title: next ? 'Dashboard sounds on' : 'Dashboard sounds off',
          text: 'Press M to toggle',
          icon: next ? 'speaker' : 'mute',
          force: true,
        });
      }
    };
  });

  useLiveSimulation();

  // Clicking empty space must not steal focus from the selected tile.
  const keepFocus = (e) => {
    if (!e.target.closest('[data-nav]')) e.preventDefault();
  };
  // Right-click (or the mouse "back" side button) acts like the B button.
  const backClick = (e) => {
    e.preventDefault();
    sound.unlock();
    nav.dispatch('b');
  };
  const sideButton = (e) => {
    if (e.button === 3) backClick(e);
  };

  const bri = 0.6 + (settings.brightness / 100) * 0.8;
  const con = 0.6 + (settings.contrast / 100) * 0.8;
  const filtered = settings.brightness !== 50 || settings.contrast !== 50;
  const safe = settings.safeArea / 100;

  return (
    <div className="viewport">
      <div
        className={`stage theme-${theme.mode} ${settings.reduceMotion ? 'reduce-motion' : ''} power-${ui.power}`}
        style={{ '--scale': scale, filter: filtered ? `brightness(${bri}) contrast(${con})` : undefined }}
        onMouseDown={keepFocus}
        onContextMenu={backClick}
        onMouseUp={sideButton}
      >
        <ArtDefs />
        <Background />
        <div className="safe" style={safe !== 1 ? { transform: `scale(${safe})` } : undefined}>
          <Dashboard />
          <ScreenStack />
          <ProfileCorner />
        </div>
        <Guide />
        <DialogHost />
        <KeyboardHost />
        <HelpOverlay />
        <ToastHost />
        <PowerOverlay />
      </div>
      <div className="rotate-hint" aria-hidden="true">
        Rotate your device for the full-screen dashboard
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <UIProvider>
        <NavProvider>
          <Console />
        </NavProvider>
      </UIProvider>
    </StoreProvider>
  );
}

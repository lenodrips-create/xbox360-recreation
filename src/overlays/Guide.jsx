import { useEffect, useMemo, useState } from 'react';
import { useLayer } from '../nav/NavProvider.jsx';
import { useUI } from '../state/ui.jsx';
import { gamerscoreOf, useStore } from '../state/store.jsx';
import { sound } from '../audio/sound.js';
import { FRIENDS } from '../data/social.js';
import Icon from '../components/Icon.jsx';
import Gamerpic from '../components/Gamerpic.jsx';
import { ButtonHints, GIcon, Row } from '../components/ui.jsx';

const TABS = [
  { id: 'media', label: 'Media', icon: 'film' },
  { id: 'games', label: 'Games & Apps', icon: 'controller' },
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'friends', label: 'Friends & Party', icon: 'friends' },
  { id: 'settings', label: 'Settings', icon: 'gear' },
];

function useClock(h24) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);
  return now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: !h24 });
}

function GuidePanel() {
  const ui = useUI();
  const { state, actions } = useStore();
  const [tab, setTab] = useState(2);
  const [dir, setDir] = useState(0);
  const clock = useClock(state.settings.clock24);
  const score = useMemo(() => gamerscoreOf(state.unlocked), [state.unlocked]);
  const unread = state.messages.filter((m) => !m.read).length;
  const online = FRIENDS.filter((f) => !state.removedFriends.includes(f.id) && ui.presence[f.id]?.presence !== 'offline').length;

  const close = (snd = true) => {
    if (snd) sound.play('close');
    ui.setGuideOpen(false);
  };
  const go = (fn) => () => {
    ui.setGuideOpen(false);
    fn();
  };
  const switchTab = (d) => {
    const next = tab + d;
    if (next < 0 || next >= TABS.length) return;
    sound.play('pivot');
    setDir(d);
    setTab(next);
  };

  const { ref, mgr } = useLayer({
    priority: 140,
    onBack: () => close(),
    onEdge: (d) => {
      if (d === 'left') switchTab(-1);
      if (d === 'right') switchTab(1);
    },
    onAction: (action) => {
      if (action === 'guide') {
        close();
        return true;
      }
      if (action === 'lb') {
        switchTab(-1);
        return true;
      }
      if (action === 'rb') {
        switchTab(1);
        return true;
      }
      if (action === 'y') {
        sound.play('select');
        ui.setGuideOpen(false);
        ui.home(0);
        return true;
      }
      return false;
    },
  });

  // Focus the first row whenever the tab changes.
  useEffect(() => {
    const first = ref.current && ref.current.querySelector('.guide-list [data-nav]');
    if (first) mgr.focus(first, false);
  }, [tab, mgr, ref]);

  const toggleTray = () => {
    const open = !ui.trayOpen;
    ui.setTrayOpen(open);
    ui.notify({
      kind: 'info',
      title: open ? 'Disc tray opened' : 'Disc tray closed',
      text: open ? 'No disc inserted' : 'Reading disc… no disc found',
      icon: 'tray',
      force: true,
    });
  };

  const signOut = async () => {
    ui.setGuideOpen(false);
    const ok = await ui.confirm({
      title: 'Sign Out',
      message: `Are you sure you want to sign out ${state.profile.gamertag}?`,
      confirmLabel: 'Sign Out',
      cancelLabel: 'Cancel',
    });
    if (ok) {
      actions.setSignedIn(false);
      ui.home(0);
      ui.notify({ kind: 'info', title: `${state.profile.gamertag} signed out`, icon: 'signin', force: true });
    }
  };

  const turnOff = async () => {
    ui.setGuideOpen(false);
    const ok = await ui.confirm({
      title: 'Turn Off Console',
      message: 'Turn off the console? Your preferences are saved automatically.',
      confirmLabel: 'Turn Off',
      cancelLabel: 'Cancel',
    });
    if (ok) {
      sound.play('power');
      ui.home(0);
      ui.setPower('off');
    }
  };

  const items = {
    media: [
      { id: 'g-video', label: 'Video Library', icon: 'video', run: go(() => ui.push('media', { kind: 'video' })) },
      { id: 'g-music', label: 'Music Library', icon: 'music', run: go(() => ui.push('media', { kind: 'music' })) },
      { id: 'g-pictures', label: 'Picture Library', icon: 'photo', run: go(() => ui.push('media', { kind: 'pictures' })) },
      { id: 'g-tray', label: ui.trayOpen ? 'Close Tray' : 'Open Tray', icon: 'tray', run: toggleTray },
    ],
    games: [
      { id: 'g-ach', label: 'Achievements', icon: 'trophy', run: go(() => ui.push('achievementsAll')) },
      { id: 'g-mygames', label: 'My Games', icon: 'controller', run: go(() => ui.push('games')) },
      { id: 'g-myapps', label: 'My Apps', icon: 'apps', run: go(() => ui.push('apps')) },
      { id: 'g-recent', label: 'Recent', icon: 'clock', run: go(() => ui.push('recent')) },
      { id: 'g-market', label: 'Game Marketplace', icon: 'bag', run: go(() => ui.push('marketplace', { category: 'games' })) },
    ],
    home: [
      { id: 'g-home', label: 'Xbox Home', icon: 'home', run: go(() => ui.home(0)) },
      { id: 'g-msgs', label: 'Messages', value: unread ? `${unread} new` : null, icon: 'message', run: go(() => ui.push('messages')) },
      { id: 'g-profile', label: 'My Profile', icon: 'person', run: go(() => ui.push('profile')) },
      { id: 'g-beacons', label: 'Beacons & Activity', icon: 'beacon', run: go(() => ui.push('beacons')) },
      {
        id: 'g-signout',
        label: state.signedIn ? 'Sign Out' : 'Sign In',
        icon: 'signin',
        run: state.signedIn ? signOut : go(() => ui.push('signin')),
      },
    ],
    friends: [
      { id: 'g-friends', label: 'Friends', value: `${online} online`, icon: 'friends', run: go(() => ui.push('friends')) },
      { id: 'g-party', label: ui.party ? 'Party' : 'Start a Party', icon: 'party', run: go(() => ui.push('party')) },
      { id: 'g-compose', label: 'Create Message', icon: 'message', run: go(() => ui.push('compose', {})) },
      { id: 'g-recentplayers', label: 'Recent Players', icon: 'clock', run: go(() => ui.push('friends', { recent: true })) },
    ],
    settings: [
      { id: 'g-set-profile', label: 'Profile', icon: 'person', run: go(() => ui.push('settings.profile')) },
      { id: 'g-set-prefs', label: 'Preferences', icon: 'sliders', run: go(() => ui.push('settings.prefs')) },
      { id: 'g-set-system', label: 'System Settings', icon: 'gear', run: go(() => ui.push('settings.system')) },
      {
        id: 'g-mute',
        label: state.settings.sound ? 'Mute Dashboard Sounds' : 'Unmute Dashboard Sounds',
        icon: state.settings.sound ? 'mute' : 'speaker',
        run: () => {
          const next = !state.settings.sound;
          actions.updateSettings({ sound: next });
          sound.setEnabled(next);
          if (next) sound.play('toggle');
        },
      },
      { id: 'g-help', label: 'Help & Controls', icon: 'help', run: go(() => ui.setHelpOpen(true)) },
      { id: 'g-about', label: 'About', icon: 'info', run: go(() => ui.push('settings.about')) },
      { id: 'g-off', label: 'Turn Off Console', icon: 'power', run: turnOff },
    ],
  };

  const current = TABS[tab];
  return (
    <div className="guide-overlay" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div ref={ref} className="guide" role="dialog" aria-modal="true" aria-label="Xbox Guide">
        <div className="guide-tabs">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              tabIndex={-1}
              className={`guide-tab ${i === tab ? 'is-active' : ''}`}
              onClick={() => {
                if (i !== tab) {
                  sound.play('pivot');
                  setDir(i > tab ? 1 : -1);
                  setTab(i);
                }
              }}
              aria-label={t.label}
            >
              {t.id === 'home' ? (
                <span className="guide-home-orb">
                  <span />
                </span>
              ) : (
                <Icon name={t.icon} size={34} />
              )}
            </button>
          ))}
        </div>
        <div key={tab} className={`guide-pane ${dir > 0 ? 'from-right' : dir < 0 ? 'from-left' : ''}`}>
          <h2 className="guide-heading">{current.label}</h2>
          {current.id === 'home' && (
            <div className="guide-profile">
              <Gamerpic id={state.profile.gamerpic} avatar={state.profile.avatar} size={96} />
              <div>
                <div className="guide-tag">{state.signedIn ? state.profile.gamertag : 'Not signed in'}</div>
                <div className="guide-score">
                  <GIcon size={20} /> {score.toLocaleString('en-US')}
                </div>
                <div className="guide-tier">Xbox LIVE {state.profile.tier === 'gold' ? 'Gold' : 'Free'}</div>
              </div>
            </div>
          )}
          <div className="guide-list">
            {items[current.id].map((it, i) => (
              <Row key={it.id} id={it.id} label={it.label} icon={it.icon} value={it.value} isDefault={i === 0} onSelect={it.run} />
            ))}
          </div>
        </div>
        <div className="guide-foot">
          <span className="guide-clock">{clock}</span>
          <span className="guide-battery" aria-label="Controller battery">
            <i />
            <i />
            <i />
          </span>
        </div>
        <ButtonHints
          hints={[
            { btn: 'a', label: 'Select' },
            { btn: 'b', label: 'Back' },
            { btn: 'y', label: 'Xbox Home' },
          ]}
        />
      </div>
    </div>
  );
}

export default function Guide() {
  const ui = useUI();
  if (!ui.guideOpen || ui.power !== 'on') return null;
  return <GuidePanel />;
}

import { useEffect, useState } from 'react';
import { APPS } from '../data/catalog.js';
import { THEMES, THEME_BY_ID } from '../data/themes.js';
import { isValidGamertag, useStore } from '../state/store.jsx';
import { useLibrary } from '../games/LibraryProvider.jsx';
import { useUI } from '../state/ui.jsx';
import { sound } from '../audio/sound.js';
import Gamerpic from '../components/Gamerpic.jsx';
import Icon from '../components/Icon.jsx';
import { GIcon, ProgressBar, Row, Screen, formatSize } from '../components/ui.jsx';
import { Empty, InfoPanel, MenuScreen } from './common.jsx';

// ---- Profile ------------------------------------------------------------------
export function ProfileSettings({ active }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const p = state.profile;

  const edit = (field, title, maxLength) => async () => {
    const v = await ui.keyboard({ title, value: p[field], maxLength });
    if (v !== null) {
      actions.updateProfile({ [field]: v.trim() });
      ui.notify({ kind: 'info', title: 'Profile updated', text: title, icon: 'person', force: true });
    }
  };
  const editTag = async () => {
    const v = await ui.keyboard({ title: 'Change Gamertag', value: p.gamertag, maxLength: 15 });
    if (v === null) return;
    const tag = v.trim();
    if (!isValidGamertag(tag)) {
      sound.play('error');
      ui.notify({ kind: 'info', title: 'Gamertag too short', text: 'Use 3 to 15 characters', icon: 'info', force: true });
      return;
    }
    actions.updateProfile({ gamertag: tag });
    ui.notify({ kind: 'signin', title: `Gamertag changed to ${tag}`, text: 'Free in this simulation', force: true });
  };

  const items = [
    {
      id: 'pf-tag',
      label: 'Gamertag',
      value: p.gamertag,
      icon: 'controller',
      desc: 'Your public name on Xbox LIVE. 3–15 characters.',
      onSelect: editTag,
    },
    {
      id: 'pf-pic',
      label: 'Gamer Picture',
      icon: 'photo',
      desc: 'Choose the picture shown next to your gamertag.',
      onSelect: () => ui.push('gamerpic'),
    },
    {
      id: 'pf-avatar',
      label: 'Avatar',
      icon: 'avatar',
      desc: 'Change your avatar’s style, features and clothes.',
      onSelect: () => ui.push('avatar'),
    },
    {
      id: 'pf-motto',
      label: 'Motto',
      value: p.motto,
      icon: 'chat',
      desc: 'A short phrase friends see on your profile.',
      onSelect: edit('motto', 'Motto', 21),
    },
    { id: 'pf-name', label: 'Name', value: p.name, icon: 'person', desc: 'Your real name (optional).', onSelect: edit('name', 'Name', 30) },
    {
      id: 'pf-location',
      label: 'Location',
      value: p.location,
      icon: 'globe',
      desc: 'Where in the world you play.',
      onSelect: edit('location', 'Location', 40),
    },
    {
      id: 'pf-bio',
      label: 'Bio',
      value: p.bio ? `${p.bio.slice(0, 16)}…` : '',
      icon: 'list',
      desc: p.bio || 'Tell people about yourself.',
      onSelect: edit('bio', 'Bio', 200),
    },
    {
      id: 'pf-zone',
      kind: 'option',
      label: 'Gamer Zone',
      value: p.zone,
      options: ['Recreation', 'Pro', 'Family', 'Underground'],
      icon: 'controller',
      desc: 'Describes the kind of player you are.',
      onChange: (v) => actions.updateProfile({ zone: v }),
    },
    {
      id: 'pf-theme',
      label: 'Theme',
      value: THEME_BY_ID[state.settings.theme]?.name,
      icon: 'palette',
      desc: 'Change your dashboard background.',
      onSelect: () => ui.push('settings.theme'),
    },
    {
      id: 'pf-privacy',
      label: 'Privacy Settings',
      icon: 'lock',
      desc: 'Control who can see your profile, voice and online status.',
      onSelect: () => ui.push('settings.privacy'),
    },
  ];
  return (
    <MenuScreen
      active={active}
      kicker="settings"
      title="Profile"
      items={items}
      aside={(cur) => (
        <InfoPanel className="profile-aside">
          <div className="pc-head">
            <Gamerpic id={p.gamerpic} avatar={p.avatar} size={120} />
            <div>
              <div className="pc-big-tag">{p.gamertag}</div>
              <div className="pc-line">
                <GIcon size={20} /> {state.profile.gamerscore.toLocaleString('en-US')}
              </div>
              <div className="pc-line">“{p.motto || '—'}”</div>
            </div>
          </div>
          <h2 className="info-title">{cur?.label}</h2>
          <p>{cur?.desc}</p>
        </InfoPanel>
      )}
    />
  );
}

export function PrivacySettings({ active }) {
  const { state, actions } = useStore();
  const pv = state.settings.privacy;
  const opts = ['Everyone', 'Friends Only', 'Blocked'];
  const items = [
    {
      id: 'pv-profile',
      kind: 'option',
      label: 'Profile Viewing',
      value: pv.profile,
      options: opts,
      icon: 'person',
      desc: 'Who can see your profile details.',
      onChange: (v) => actions.updatePrivacy({ profile: v }),
    },
    {
      id: 'pv-voice',
      kind: 'option',
      label: 'Voice and Text',
      value: pv.voice,
      options: opts,
      icon: 'mic',
      desc: 'Who can talk to you and send messages.',
      onChange: (v) => actions.updatePrivacy({ voice: v }),
    },
    {
      id: 'pv-presence',
      kind: 'option',
      label: 'Online Status',
      value: pv.presence,
      options: opts,
      icon: 'network',
      desc: 'Who can see when you are online.',
      onChange: (v) => actions.updatePrivacy({ presence: v }),
    },
  ];
  return <MenuScreen active={active} kicker="profile" title="Privacy Settings" items={items} />;
}

// ---- System -----------------------------------------------------------------
export function SystemSettings({ active }) {
  const ui = useUI();
  const { actions } = useStore();
  const reset = async () => {
    const ok = await ui.confirm({
      title: 'Restore Defaults',
      message: 'Reset your profile, theme, settings, pins and messages to their original state? Games you loaded are kept. This can’t be undone.',
      confirmLabel: 'Restore Defaults',
      cancelLabel: 'Cancel',
    });
    if (ok) {
      actions.reset();
      ui.setParty(null);
      ui.home(0);
      ui.notify({ kind: 'info', title: 'Defaults restored', text: 'Everything is back to factory settings', icon: 'refresh', force: true });
    }
  };
  const items = [
    {
      id: 'sys-console',
      label: 'Console Settings',
      icon: 'gear',
      desc: 'Display, audio, language, clock and system information.',
      onSelect: () => ui.push('settings.console'),
    },
    {
      id: 'sys-kinect',
      label: 'Kinect Settings',
      icon: 'kinect',
      desc: 'Kinect sensor setup (no sensor detected).',
      onSelect: () =>
        ui.notify({ kind: 'info', title: 'Kinect sensor not detected', text: 'Connect a sensor to use Kinect', icon: 'kinect', force: true }),
    },
    {
      id: 'sys-storage',
      label: 'Storage',
      icon: 'hdd',
      desc: 'Manage the hard drive, memory units, USB storage and cloud saves.',
      onSelect: () => ui.push('settings.storage'),
    },
    {
      id: 'sys-network',
      label: 'Network Settings',
      icon: 'network',
      desc: 'Test your Xbox LIVE connection (simulated).',
      onSelect: () => ui.push('settings.network'),
    },
    {
      id: 'sys-about',
      label: 'About',
      icon: 'info',
      desc: 'Who made this recreation, and where your data is kept.',
      onSelect: () => ui.push('settings.about'),
    },
    {
      id: 'sys-initial',
      label: 'Initial Setup',
      icon: 'refresh',
      desc: 'Replay the start-up sequence.',
      onSelect: () => {
        ui.home(0);
        ui.setPower('booting');
      },
    },
    {
      id: 'sys-reset',
      label: 'Restore Defaults',
      icon: 'trash',
      desc: 'Reset this dashboard to its default profile, theme and settings. Games you loaded are kept.',
      onSelect: reset,
    },
  ];
  return <MenuScreen active={active} kicker="settings" title="System Settings" items={items} />;
}

export function ConsoleSettings({ active }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const s = state.settings;
  const set = (patch) => actions.updateSettings(patch);
  const items = [
    {
      id: 'cs-display',
      label: 'Display',
      value: `${s.resolution} · ${s.screenFormat}`,
      icon: 'monitor',
      desc: 'Resolution, brightness, contrast and screen size.',
      onSelect: () => ui.push('settings.display'),
    },
    {
      id: 'cs-audio',
      label: 'Audio',
      value: s.sound ? 'Sounds on' : 'Muted',
      icon: 'speaker',
      desc: 'Dashboard sounds, volume and audio output.',
      onSelect: () => ui.push('settings.audio'),
    },
    {
      id: 'cs-language',
      kind: 'option',
      label: 'Language',
      value: s.language,
      options: ['English', 'Français', 'Deutsch', 'Español', 'Italiano', 'Português', '日本語'],
      icon: 'language',
      desc: 'Dashboard language (labels stay in English in this recreation).',
      onChange: (v) => set({ language: v }),
    },
    {
      id: 'cs-locale',
      kind: 'option',
      label: 'Locale',
      value: s.locale,
      options: ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan'],
      icon: 'globe',
      desc: 'Region used for Marketplace and Xbox LIVE.',
      onChange: (v) => set({ locale: v }),
    },
    {
      id: 'cs-clock',
      kind: 'toggle',
      label: '24-Hour Clock',
      value: s.clock24,
      icon: 'clock',
      desc: 'Shows the time in the Guide using 24-hour format.',
      onChange: (v) => set({ clock24: v }),
    },
    {
      id: 'cs-power',
      kind: 'option',
      label: 'Power Mode',
      value: s.powerMode,
      options: ['Instant-On', 'Energy Saving'],
      icon: 'power',
      desc: 'Instant-On keeps updates downloading while the console is off.',
      onChange: (v) => set({ powerMode: v }),
    },
    {
      id: 'cs-updates',
      kind: 'toggle',
      label: 'Automatic Updates',
      value: s.autoUpdate,
      icon: 'download',
      desc: 'Download game and system updates automatically.',
      onChange: (v) => set({ autoUpdate: v }),
    },
    {
      id: 'cs-startup',
      kind: 'toggle',
      label: 'Startup Animation',
      value: s.bootAnimation,
      icon: 'play',
      desc: 'Show the start-up animation when the dashboard loads.',
      onChange: (v) => set({ bootAnimation: v }),
    },
    {
      id: 'cs-info',
      label: 'System Info',
      icon: 'info',
      desc: 'Console and dashboard version information.',
      onSelect: () => ui.push('settings.info'),
    },
  ];
  return <MenuScreen active={active} kicker="system" title="Console Settings" items={items} />;
}

export function DisplaySettings({ active }) {
  const { state, actions } = useStore();
  const s = state.settings;
  const set = (patch) => actions.updateSettings(patch);
  const items = [
    {
      id: 'ds-res',
      kind: 'option',
      label: 'Resolution',
      value: s.resolution,
      options: ['1080p', '1080i', '720p', '1360 x 768', '1280 x 1024'],
      icon: 'monitor',
      desc: 'HDTV output resolution (simulated; the page always renders natively).',
      onChange: (v) => set({ resolution: v }),
    },
    {
      id: 'ds-format',
      kind: 'option',
      label: 'Screen Format',
      value: s.screenFormat,
      options: ['Widescreen', 'Letterbox'],
      icon: 'film',
      desc: 'Widescreen is the native 16:9 layout (simulated).',
      onChange: (v) => set({ screenFormat: v }),
    },
    {
      id: 'ds-bright',
      kind: 'slider',
      label: 'Brightness',
      value: s.brightness,
      min: 0,
      max: 100,
      step: 5,
      icon: 'sun',
      desc: 'Adjust overall picture brightness. Use ◀ ▶ to change.',
      onChange: (v) => set({ brightness: v }),
    },
    {
      id: 'ds-contrast',
      kind: 'slider',
      label: 'Contrast',
      value: s.contrast,
      min: 0,
      max: 100,
      step: 5,
      icon: 'monitor',
      desc: 'Adjust picture contrast. Use ◀ ▶ to change.',
      onChange: (v) => set({ contrast: v }),
    },
    {
      id: 'ds-safe',
      kind: 'slider',
      label: 'Screen Size',
      value: s.safeArea,
      min: 85,
      max: 100,
      step: 1,
      format: (v) => `${v}%`,
      icon: 'monitor',
      desc: 'Shrink the dashboard if the edges are cut off by your TV (overscan).',
      onChange: (v) => set({ safeArea: v }),
    },
    {
      id: 'ds-color',
      kind: 'option',
      label: 'HDMI Color Space',
      value: s.colorSpace,
      options: ['Auto', 'YCbCr709', 'RGB'],
      icon: 'palette',
      desc: 'Color space used over HDMI (simulated).',
      onChange: (v) => set({ colorSpace: v }),
    },
    {
      id: 'ds-motion',
      kind: 'toggle',
      label: 'Reduce Motion',
      value: s.reduceMotion,
      icon: 'sliders',
      desc: 'Turns off sliding and fading transitions.',
      onChange: (v) => set({ reduceMotion: v }),
    },
    {
      id: 'ds-reset',
      label: 'Reset Display Settings',
      icon: 'refresh',
      desc: 'Restore brightness, contrast and screen size to default.',
      onSelect: () => set({ brightness: 50, contrast: 50, safeArea: 100, resolution: '1080p', screenFormat: 'Widescreen', colorSpace: 'Auto' }),
    },
  ];
  return (
    <MenuScreen
      active={active}
      kicker="console settings"
      title="Display"
      items={items}
      aside={(cur) => (
        <InfoPanel title={cur?.label} className="display-aside">
          <div className="calibration">
            {['#000', '#222', '#444', '#666', '#888', '#aaa', '#ccc', '#fff'].map((c) => (
              <span key={c} style={{ background: c }} />
            ))}
          </div>
          <div className="calibration color">
            {['#c0392b', '#e67e22', '#f1c40f', '#4fa821', '#16a085', '#2f6fb5', '#8e44ad', '#d04f9a'].map((c) => (
              <span key={c} style={{ background: c }} />
            ))}
          </div>
          <p>{cur?.desc}</p>
        </InfoPanel>
      )}
    />
  );
}

export function AudioSettings({ active }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const s = state.settings;
  const set = (patch) => actions.updateSettings(patch);
  const items = [
    {
      id: 'au-sound',
      kind: 'toggle',
      label: 'Dashboard Sounds',
      value: s.sound,
      icon: s.sound ? 'speaker' : 'mute',
      desc: 'Menu, navigation and notification sounds. Press M anywhere to mute.',
      onChange: (v) => {
        set({ sound: v });
        sound.setEnabled(v);
        if (v) sound.play('toggle');
      },
    },
    {
      id: 'au-volume',
      kind: 'slider',
      label: 'Sound Volume',
      value: s.volume,
      min: 0,
      max: 100,
      step: 10,
      icon: 'speaker',
      desc: 'Volume of dashboard sounds.',
      onChange: (v) => {
        set({ volume: v });
        sound.setVolume(v / 100);
        sound.play('select');
      },
    },
    {
      id: 'au-test',
      label: 'Play Test Sounds',
      icon: 'music',
      desc: 'Plays the notification and achievement sounds.',
      onSelect: () => {
        sound.play('toast', { force: true });
        setTimeout(() => sound.play('achievement', { force: true }), 700);
        ui.notify({
          kind: 'info',
          title: 'Playing test sounds',
          text: s.sound ? `Volume ${s.volume}%` : 'Dashboard sounds are off; test plays anyway',
          icon: 'music',
          force: true,
        });
      },
      snd: null,
    },
    {
      id: 'au-output',
      kind: 'option',
      label: 'Digital Output',
      value: s.audioOutput,
      options: ['Digital Stereo', 'Dolby Digital 5.1', 'Dolby Digital with WMA Pro'],
      icon: 'speaker',
      desc: 'Audio format sent to your receiver (simulated).',
      onChange: (v) => set({ audioOutput: v }),
    },
  ];
  return <MenuScreen active={active} kicker="console settings" title="Audio" items={items} />;
}

export function SystemInfo({ active }) {
  const ui = useUI();
  const { state } = useStore();
  const rows = [
    ['Console', 'Xbox 360 S (simulated)'],
    ['Dashboard', '2.0.16547.0 · Metro'],
    ['Console ID', 'SIM-0000-0360-2012'],
    ['Serial Number', '000000000000 (placeholder)'],
    ['AV Cable', 'HDMI'],
    ['Resolution', state.settings.resolution],
    ['Language', state.settings.language],
    ['Storage', 'Hard Drive 250 GB'],
    ['Renderer', 'React · Web Audio · SVG'],
  ];
  return (
    <Screen active={active} kicker="console settings" title="System Info">
      <div className="split">
        <dl className="facts facts-lg">
          {rows.map(([k, v]) => (
            <div key={k} className="fact-row">
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="menu">
          <Row id="si-ok" label="OK" icon="check" isDefault onSelect={() => ui.pop()} snd={null} />
        </div>
      </div>
    </Screen>
  );
}

// ---- About --------------------------------------------------------------------
export function About({ active }) {
  const ui = useUI();
  return (
    <Screen active={active} kicker="settings" title="About">
      <div className="split">
        <div className="about">
          <p className="about-lead">A fan-made recreation of the Xbox 360 dashboard, built for the web.</p>
          <h2 className="about-head">Created by</h2>
          <ul className="about-credits">
            <li>Lennon Hellman</li>
            <li>Gunner Castle</li>
          </ul>
          <p className="about-note">
            Your profile and progress are saved in this browser only. Not affiliated with or endorsed by Microsoft. Xbox, Xbox 360 and Xbox LIVE are
            trademarks of Microsoft.
          </p>
        </div>
        <div className="menu">
          <Row id="about-ok" label="OK" icon="check" isDefault onSelect={() => ui.pop()} snd={null} />
        </div>
      </div>
    </Screen>
  );
}

// ---- Storage ------------------------------------------------------------------
function storageBreakdown(state, games) {
  const loaded = games.reduce((s, g) => s + g.size, 0) / 1024 ** 3;
  const apps = APPS.reduce((s, a) => s + a.size, 0) / 1024;
  const downloads = state.downloads.length * 0.35;
  const cache = state.cacheClearedAt ? 0.1 : 2.4;
  return [
    { id: 'games', label: 'Games and Apps', gb: loaded + apps, color: '#5db12b' },
    { id: 'saves', label: 'Saved Games', gb: 3.6, color: '#2f6fb5' },
    { id: 'profiles', label: 'Profiles', gb: 0.4, color: '#e67e22' },
    { id: 'downloads', label: 'Demos and Downloads', gb: downloads + 1.2, color: '#8e44ad' },
    { id: 'media', label: 'Videos and Music', gb: 6.8, color: '#c0392b' },
    { id: 'themes', label: 'Themes and Gamer Pictures', gb: 0.6, color: '#16a085' },
    { id: 'system', label: 'System Items', gb: 4.2 + cache, color: '#7f8c8d' },
  ];
}

const DEVICES = [
  { id: 'hdd', label: 'Hard Drive', icon: 'hdd', total: 250 },
  { id: 'usb', label: 'USB Storage Device', icon: 'usb', total: 16 },
  { id: 'mu', label: 'Memory Unit', icon: 'memory', total: 4 },
  { id: 'cloud', label: 'Cloud Saved Games', icon: 'cloud', total: 2 },
];

export function StorageSettings({ active }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const { games } = useLibrary();
  const parts = storageBreakdown(state, games);
  const used = parts.reduce((s, p) => s + p.gb, 0);
  const sizes = { hdd: used, usb: 3.1, mu: 0.8, cloud: 0.4 };
  const [focus, setFocus] = useState('hdd');
  const dev = DEVICES.find((d) => d.id === focus) || DEVICES[0];

  const clearCache = async () => {
    const ok = await ui.confirm({
      title: 'Clear System Cache',
      message: 'Clearing the system cache can fix some problems. Game updates may need to be downloaded again. Continue?',
      confirmLabel: 'Yes',
      cancelLabel: 'No',
    });
    if (ok) {
      actions.clearCache();
      ui.notify({ kind: 'info', title: 'System cache cleared', icon: 'refresh', force: true });
    }
  };

  return (
    <Screen
      active={active}
      kicker="system"
      title="Storage"
      hints={[
        { btn: 'a', label: 'Select' },
        { btn: 'b', label: 'Back' },
        { btn: 'y', label: 'Clear Cache' },
      ]}
      onAction={(action) => {
        if (action === 'y') {
          sound.play('select');
          clearCache();
          return true;
        }
        return false;
      }}
    >
      <div className="split">
        <div className="menu">
          {DEVICES.map((d, i) => (
            <Row
              key={d.id}
              id={`st-${d.id}`}
              icon={d.icon}
              label={d.label}
              value={`${(d.total - sizes[d.id]).toFixed(1)} GB free`}
              isDefault={i === 0}
              onFocus={() => setFocus(d.id)}
              onSelect={() => ui.push('settings.storageDevice', { id: d.id })}
            />
          ))}
          <Row id="st-cache" icon="refresh" label="Clear System Cache" onFocus={() => setFocus('hdd')} onSelect={clearCache} />
        </div>
        <InfoPanel icon={dev.icon} title={dev.label}>
          <div className="storage-total">
            {sizes[dev.id].toFixed(1)} GB used of {dev.total} GB
          </div>
          {dev.id === 'hdd' ? (
            <>
              <div className="storage-bar">
                {parts.map((p) => (
                  <span key={p.id} style={{ width: `${(p.gb / dev.total) * 100}%`, background: p.color }} title={p.label} />
                ))}
              </div>
              <ul className="storage-legend">
                {parts.map((p) => (
                  <li key={p.id}>
                    <i style={{ background: p.color }} />
                    {p.label}
                    <span>{p.gb.toFixed(1)} GB</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <ProgressBar value={sizes[dev.id]} max={dev.total} className="storage-single" />
          )}
        </InfoPanel>
      </div>
    </Screen>
  );
}

export function StorageDevice({ active, params }) {
  const ui = useUI();
  const library = useLibrary();
  const dev = DEVICES.find((d) => d.id === params.id) || DEVICES[0];
  if (dev.id !== 'hdd') {
    const items = [
      {
        id: 'sd-saves',
        label: 'Saved Games',
        value: dev.id === 'cloud' ? '0.4 GB' : '0.6 GB',
        icon: 'cloud',
        desc: 'Placeholder saved games.',
        onSelect: () => ui.notify({ kind: 'info', title: 'Saved games are placeholders', icon: 'info', force: true }),
      },
      {
        id: 'sd-format',
        label: dev.id === 'cloud' ? 'Sync Now' : 'Format',
        icon: dev.id === 'cloud' ? 'refresh' : 'trash',
        desc: dev.id === 'cloud' ? 'Sync saves with the (simulated) cloud.' : 'Erase everything on this device (simulated, nothing is deleted).',
        onSelect: async () => {
          if (dev.id === 'cloud') {
            ui.notify({ kind: 'info', title: 'Cloud saves are up to date', icon: 'cloud', force: true });
            return;
          }
          const ok = await ui.confirm({
            title: `Format ${dev.label}`,
            message: 'Format this device? (Simulated — nothing is erased.)',
            confirmLabel: 'Format',
            cancelLabel: 'Cancel',
          });
          if (ok) ui.notify({ kind: 'info', title: `${dev.label} formatted`, text: 'Simulated', icon: 'check', force: true });
        },
      },
    ];
    return <MenuScreen active={active} kicker="storage" title={dev.label} items={items} />;
  }
  if (!library.games.length) {
    return (
      <Screen active={active} kicker="storage" title="Hard Drive · Games">
        <Empty icon="controller" title="No games stored" text="Games you load from this device are listed here.">
          <div className="empty-actions">
            <Row id="sd-add" icon="plus" label="Add a Game" isDefault onSelect={() => ui.replace('addGame')} />
          </div>
        </Empty>
      </Screen>
    );
  }
  const items = library.games.map((g) => ({
    id: `sd-${g.id}`,
    label: g.title,
    value: formatSize(g.size),
    icon: 'controller',
    desc: `Select to delete ${g.title} and its saved progress from this browser.`,
    onSelect: async () => {
      const ok = await ui.confirm({
        title: 'Delete Game',
        message: `Delete ${g.title} (${formatSize(g.size)}) and its saved progress?`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      });
      if (!ok) return;
      await library.remove(g.id);
      ui.notify({ kind: 'info', title: 'Game deleted', text: g.title, icon: 'trash', force: true });
    },
  }));
  return <MenuScreen active={active} kicker="storage" title="Hard Drive · Games" items={items} />;
}

// ---- Network ------------------------------------------------------------------
const NET_STEPS = ['Network Adapter', 'Network', 'IP Address', 'Internet', 'Xbox LIVE', 'NAT Type: Open'];

export function NetworkSettings({ active }) {
  const ui = useUI();
  const [step, setStep] = useState(-1);
  useEffect(() => {
    if (step < 0 || step >= NET_STEPS.length) return undefined;
    const t = setTimeout(() => setStep((s) => s + 1), 520);
    return () => clearTimeout(t);
  }, [step]);
  useEffect(() => {
    if (step === NET_STEPS.length)
      ui.notify({ kind: 'info', title: 'Connected to Xbox LIVE', text: 'Simulated connection test passed', icon: 'network', force: true });
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Screen active={active} kicker="system" title="Network Settings">
      <div className="split">
        <div className="menu">
          <Row
            id="net-test"
            icon="network"
            label={step >= 0 && step < NET_STEPS.length ? 'Testing…' : 'Test Xbox LIVE Connection'}
            isDefault
            onSelect={() => setStep(0)}
          />
          <Row
            id="net-wired"
            icon="globe"
            label="Wired Network"
            value="Connected"
            onSelect={() => ui.notify({ kind: 'info', title: 'Wired network', text: 'Connected (simulated)', icon: 'network', force: true })}
          />
          <Row
            id="net-wireless"
            icon="network"
            label="Wireless Network"
            value="Not configured"
            onSelect={() =>
              ui.notify({ kind: 'info', title: 'Wireless network', text: 'No wireless networks found (simulated)', icon: 'network', force: true })
            }
          />
        </div>
        <InfoPanel icon="network" title="Connection Test">
          <ul className="net-steps">
            {NET_STEPS.map((s, i) => (
              <li key={s} className={step > i ? 'ok' : step === i ? 'run' : ''}>
                <span className="net-mark">{step > i ? '✓' : step === i ? '…' : '·'}</span>
                {s}
              </li>
            ))}
          </ul>
          <p className="info-dim">No real network requests are made — everything is simulated locally.</p>
        </InfoPanel>
      </div>
    </Screen>
  );
}

// ---- Preferences / Account / Family -------------------------------------------
export function Preferences({ active }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const s = state.settings;
  const set = (patch) => actions.updateSettings(patch);
  const items = [
    {
      id: 'pr-sound',
      kind: 'toggle',
      label: 'Dashboard Sounds',
      value: s.sound,
      icon: s.sound ? 'speaker' : 'mute',
      desc: 'Menu and notification sounds. Press M anywhere to toggle.',
      onChange: (v) => {
        set({ sound: v });
        sound.setEnabled(v);
        if (v) sound.play('toggle');
      },
    },
    {
      id: 'pr-notify',
      kind: 'toggle',
      label: 'Notifications',
      value: s.notifications,
      icon: 'message',
      desc: 'Pop-up notifications for messages and friends.',
      onChange: (v) => set({ notifications: v }),
    },
    {
      id: 'pr-friends',
      kind: 'toggle',
      label: 'Friend Online Alerts',
      value: s.friendAlerts,
      icon: 'friends',
      desc: 'Show a notification when a friend comes online.',
      onChange: (v) => set({ friendAlerts: v }),
    },
    {
      id: 'pr-spot',
      kind: 'toggle',
      label: 'Spotlight Auto-Rotate',
      value: s.spotlightAutoplay,
      icon: 'refresh',
      desc: 'Cycle the spotlight tile on the home channel.',
      onChange: (v) => set({ spotlightAutoplay: v }),
    },
    {
      id: 'pr-motion',
      kind: 'toggle',
      label: 'Reduce Motion',
      value: s.reduceMotion,
      icon: 'sliders',
      desc: 'Turns off sliding and fading animations.',
      onChange: (v) => set({ reduceMotion: v }),
    },
    {
      id: 'pr-boot',
      kind: 'toggle',
      label: 'Startup Animation',
      value: s.bootAnimation,
      icon: 'play',
      desc: 'Play the start-up animation on load.',
      onChange: (v) => set({ bootAnimation: v }),
    },
    {
      id: 'pr-theme',
      label: 'Theme',
      value: THEME_BY_ID[s.theme]?.name,
      icon: 'palette',
      desc: 'Choose a dashboard theme.',
      onSelect: () => ui.push('settings.theme'),
    },
    {
      id: 'pr-help',
      label: 'Help & Controls',
      icon: 'help',
      desc: 'Keyboard, mouse, touch and controller mappings.',
      onSelect: () => ui.setHelpOpen(true),
    },
    {
      id: 'pr-reset',
      label: 'Restore Defaults',
      icon: 'trash',
      desc: 'Reset everything saved by this dashboard.',
      onSelect: () => ui.push('settings.system'),
    },
  ];
  return <MenuScreen active={active} kicker="settings" title="Preferences" items={items} />;
}

export function AccountSettings({ active }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const p = state.profile;
  const redeem = async () => {
    const code = await ui.keyboard({ title: 'Enter 25-character code', value: '', maxLength: 29 });
    if (code === null) return;
    if (code.replace(/[^a-z0-9]/gi, '').length === 25) {
      actions.updateProfile({ points: p.points + 400 });
      ui.notify({ kind: 'info', title: 'Code redeemed', text: '400 Microsoft Points added (simulated)', icon: 'gold', force: true });
    } else {
      sound.play('error');
      ui.notify({ kind: 'info', title: 'That code isn’t valid', text: 'Codes have 25 letters and numbers', icon: 'info', force: true });
    }
  };
  const items = [
    {
      id: 'ac-member',
      label: 'Membership',
      value: p.tier === 'gold' ? 'Xbox LIVE Gold' : 'Xbox LIVE Free',
      icon: 'gold',
      desc: 'Your simulated Xbox LIVE membership.',
      onSelect: () => ui.push('gold'),
    },
    {
      id: 'ac-tier',
      kind: 'option',
      label: 'Membership Tier',
      value: p.tier,
      options: [
        { value: 'gold', label: 'Gold' },
        { value: 'free', label: 'Free' },
      ],
      icon: 'card',
      desc: 'Switch between Gold and Free (no charges — this is a mock).',
      onChange: (v) => actions.updateProfile({ tier: v }),
    },
    {
      id: 'ac-points',
      label: 'Microsoft Points',
      value: `${p.points.toLocaleString('en-US')} MSP`,
      icon: 'bag',
      desc: 'Simulated points balance.',
      onSelect: () => ui.notify({ kind: 'info', title: `${p.points} Microsoft Points`, text: 'Simulated balance', icon: 'bag', force: true }),
    },
    { id: 'ac-redeem', label: 'Redeem Code', icon: 'key', desc: 'Enter any 25 letters and numbers to add 400 simulated points.', onSelect: redeem },
    {
      id: 'ac-history',
      label: 'Download History',
      value: `${state.downloads.length} items`,
      icon: 'download',
      desc: 'Everything you downloaded from Marketplace.',
      onSelect: () => ui.push('marketplace', { category: 'games' }),
    },
    {
      id: 'ac-billing',
      label: 'Billing Options',
      icon: 'card',
      desc: 'No payment information is stored or requested.',
      onSelect: () => ui.notify({ kind: 'info', title: 'No billing in this simulation', icon: 'card', force: true }),
    },
  ];
  return <MenuScreen active={active} kicker="settings" title="Account" items={items} />;
}

export function FamilySettings({ active }) {
  const { state, actions } = useStore();
  const f = state.settings.family;
  const set = (patch) => actions.updateFamily(patch);
  const items = [
    {
      id: 'fm-safe',
      kind: 'toggle',
      label: 'Console Safeguards',
      value: f.safeguards,
      icon: 'lock',
      desc: 'Turn family controls on for this console.',
      onChange: (v) => set({ safeguards: v }),
    },
    {
      id: 'fm-games',
      kind: 'option',
      label: 'Game Ratings',
      value: f.games,
      options: ['Off', 'Everyone', 'Everyone 10+', 'Teen', 'Mature'],
      icon: 'rating',
      desc: 'Highest game rating allowed without a pass code.',
      onChange: (v) => set({ games: v }),
    },
    {
      id: 'fm-video',
      kind: 'option',
      label: 'Video Ratings',
      value: f.video,
      options: ['Off', 'G', 'PG', 'PG-13', 'R'],
      icon: 'film',
      desc: 'Highest movie rating allowed.',
      onChange: (v) => set({ video: v }),
    },
    {
      id: 'fm-timer',
      kind: 'option',
      label: 'Family Timer',
      value: f.timer,
      options: ['Off', '1 hour daily', '2 hours daily', '10 hours weekly'],
      icon: 'timer',
      desc: 'Limit how long the console can be used.',
      onChange: (v) => set({ timer: v }),
    },
    {
      id: 'fm-online',
      kind: 'option',
      label: 'Xbox LIVE Access',
      value: f.online,
      options: ['Allowed', 'Blocked'],
      icon: 'network',
      desc: 'Allow or block Xbox LIVE.',
      onChange: (v) => set({ online: v }),
    },
  ];
  return <MenuScreen active={active} kicker="settings" title="Family Settings" items={items} />;
}

// ---- Theme -------------------------------------------------------------------
export function ThemeSettings({ active }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const current = state.settings.theme;
  return (
    <Screen active={active} kicker="settings" title="Theme">
      <div className="lib-meta">Select a theme to apply it. Themes change the dashboard background.</div>
      <div className="theme-grid">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            tabIndex={-1}
            data-nav=""
            data-nav-id={`th-${t.id}`}
            data-nav-default={t.id === current ? '' : undefined}
            className={`theme-card theme-${t.mode} ${t.id === current ? 'is-current' : ''}`}
            onClick={() => {
              sound.play('select');
              actions.updateSettings({ theme: t.id });
              ui.notify({ kind: 'info', title: 'Theme applied', text: t.name, icon: 'palette', force: true });
            }}
          >
            <span className="theme-card-bg" style={{ background: t.base }} />
            <span className="theme-card-mini">
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className="theme-card-name">
              {t.name}
              {t.id === current && <Icon name="check" size={26} strokeWidth={3} />}
            </span>
          </button>
        ))}
      </div>
    </Screen>
  );
}

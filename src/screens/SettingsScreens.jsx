import { useState } from 'react';
import { APPS } from '../data/catalog.js';
import { THEMES, THEME_BY_ID } from '../data/themes.js';
import { isValidGamertag, useStore } from '../state/store.jsx';
import { useLibrary } from '../games/LibraryProvider.jsx';
import { useUI } from '../state/ui.jsx';
import { sound } from '../audio/sound.js';
import Gamerpic from '../components/Gamerpic.jsx';
import Icon from '../components/Icon.jsx';
import { GIcon, ProgressBar, Row, Screen, formatSize } from '../components/ui.jsx';
import { InfoPanel, MenuScreen } from './common.jsx';

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
// Wipes the profile, theme, settings and pins after confirming. Used by Preferences.
export async function restoreDefaults(ui, actions) {
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
}

const onOff = (v) => (v ? 'On' : 'Off');

// The console's right-hand panel: the focused setting's current value, then what it does.
function SettingPanel({ item }) {
  const raw = item?.current ?? item?.value;
  const text = typeof raw === 'boolean' ? onOff(raw) : raw;
  return (
    <InfoPanel>
      <h2 className="info-title">Current Setting</h2>
      {text && <p className="setting-value">{text}</p>}
      <p>{item?.desc}</p>
    </InfoPanel>
  );
}
const panel = (cur) => <SettingPanel item={cur} />;

function clockText(clock24) {
  const d = new Date();
  const date = d.toLocaleDateString('en-GB');
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: !clock24 });
  return `${date} · ${time}`;
}

// Pick-one lists the console opens from a row (HDTV Settings, Reference Levels, ...).
const CHOICES = {
  hdtv: {
    title: 'HDTV Settings',
    key: 'resolution',
    options: ['Optimal Resolution', '480p', '720p', '1080i', '1080p', '1024 x 768', '1360 x 768'],
    desc: 'Select a high definition output setting. When you change your console’s output setting, if the picture does not appear within 15 seconds, the console will revert to its original settings.',
  },
  reference: {
    title: 'Reference Levels',
    key: 'referenceLevel',
    options: ['Standard', 'Intermediate', 'Expanded'],
    desc: 'Adjust the range of your console’s reference level to match your TV. If you choose a setting that’s not supported by your TV, picture quality may be degraded.',
  },
  hdmi: {
    title: 'HDMI Color Space',
    key: 'colorSpace',
    options: ['Auto', 'Source', 'RGB', 'YCbCr709', 'YCbCr601'],
    desc: 'Automatically use RGB or YCbCr based on HDMI recommendations for resolutions and content type.',
  },
  digital: {
    title: 'Digital Output',
    key: 'audioOutput',
    options: ['Digital Stereo', 'Dolby Digital 5.1', 'Dolby Digital with WMA Pro'],
    desc: 'Choose the digital audio output type for your system. This setting only applies to optical digital and HDMI audio outputs.',
  },
  remote: {
    title: 'Remote Control',
    key: 'remote',
    options: ['Both Remotes', 'Xbox 360 Media Remote'],
    desc: 'Select Both Remotes to use the Xbox 360 Media Remote and a Windows Media Center remote. Select Xbox 360 Media Remote to only use that remote.',
  },
  autoOff: {
    title: 'Auto-Off',
    key: 'autoOff',
    options: ['Never', '30 Minutes', '1 Hour', '2 Hours', '4 Hours'],
    desc: 'Turn the console off automatically after it has been idle for this long.',
  },
};

export function ChoiceSettings({ active, params }) {
  const { state, actions } = useStore();
  const choice = CHOICES[params.id] || CHOICES.hdtv;
  const current = state.settings[choice.key];
  const items = choice.options.map((o, i) => ({
    id: `ch-${i}`,
    label: o,
    icon: o === current ? 'check' : undefined,
    onSelect: () => actions.updateSettings({ [choice.key]: o }),
  }));
  return (
    <MenuScreen
      active={active}
      kicker="console settings"
      title={choice.title}
      items={items}
      aside={() => <SettingPanel item={{ current, desc: choice.desc }} />}
    />
  );
}

export function SystemSettings({ active }) {
  const ui = useUI();
  const items = [
    {
      id: 'sys-console',
      label: 'Console Settings',
      icon: 'gear',
      desc: 'Change your Xbox 360 console settings, including display, audio, language, and remote control.',
      onSelect: () => ui.push('settings.console'),
    },
    {
      id: 'sys-kinect',
      label: 'Kinect Settings',
      icon: 'kinect',
      desc: 'Change your Kinect settings or fix problems with the Kinect Tuner.',
      onSelect: () => ui.push('settings.kinect'),
    },
    {
      id: 'sys-storage',
      label: 'Storage',
      icon: 'hdd',
      desc: 'Move or delete saved games, profiles, and other items on Xbox 360 storage devices.',
      onSelect: () => ui.push('settings.storage'),
    },
    {
      id: 'sys-network',
      label: 'Network Settings',
      icon: 'network',
      desc: 'Connect to Xbox LIVE or your home network. Set up wireless connections and test network settings.',
      onSelect: () => ui.push('settings.network'),
    },
    {
      id: 'sys-computers',
      label: 'Computers',
      icon: 'monitor',
      desc: 'Connect to a Windows Media Center PC to watch and record TV shows, view your digital photos, and listen to music.',
      onSelect: () => ui.push('settings.computers'),
    },
    {
      id: 'sys-tv',
      label: 'TV',
      icon: 'monitor',
      desc: 'Change your TV provider.',
      onSelect: () => ui.push('settings.tv'),
    },
    {
      id: 'sys-vision',
      label: 'Xbox Live Vision',
      icon: 'video',
      desc: 'Change the settings for your Xbox Live Vision camera.',
      onSelect: () => ui.push('settings.vision'),
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
  ];
  return <MenuScreen active={active} kicker="settings" title="System Settings" items={items} aside={panel} />;
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
      current: `${s.resolution} Widescreen HDMI`,
      icon: 'monitor',
      desc: 'Set the display to match your TV. Connect an Xbox 360 HD AV Cable to configure high definition display modes.',
      onSelect: () => ui.push('settings.display'),
    },
    {
      id: 'cs-audio',
      label: 'Audio',
      current: `${s.audioOutput} · Sound Effects ${onOff(s.sound)}`,
      icon: 'speaker',
      desc: 'Change your audio and sound settings.',
      onSelect: () => ui.push('settings.audio'),
    },
    {
      id: 'cs-language',
      label: 'Language and Locale',
      current: `${s.language} · ${s.locale}`,
      icon: 'language',
      desc: 'Change your language and locale settings.',
      onSelect: () => ui.push('settings.language'),
    },
    {
      id: 'cs-clock',
      label: 'Clock',
      current: clockText(s.clock24),
      icon: 'clock',
      desc: 'Set the date, time, and other clock settings.',
      onSelect: () => ui.push('settings.clock'),
    },
    {
      id: 'cs-startup',
      label: 'Startup and Shutdown',
      current: `Auto-Off After ${s.autoOff} · Background Downloads ${onOff(s.backgroundDownloads)}`,
      icon: 'power',
      desc: 'Change your settings for starting up and shutting down your console.',
      onSelect: () => ui.push('settings.startup'),
    },
    {
      id: 'cs-autoplay',
      kind: 'toggle',
      label: 'Auto-Play',
      value: s.autoPlay,
      icon: 'disc',
      desc: 'Start a disc or media automatically when you insert it.',
      onChange: (v) => set({ autoPlay: v }),
    },
    {
      id: 'cs-updates',
      kind: 'toggle',
      label: 'Auto-Downloads',
      value: s.autoUpdate,
      icon: 'download',
      desc: 'Automatically update games and apps without requiring you to confirm.',
      onChange: (v) => set({ autoUpdate: v }),
    },
    {
      id: 'cs-remote',
      label: 'Remote Control',
      current: s.remote,
      icon: 'sliders',
      desc: 'Change your Xbox 360 remote control settings.',
      onSelect: () => ui.push('settings.choice', { id: 'remote' }),
    },
    {
      id: 'cs-devices',
      label: 'Connected Devices',
      current: `SmartGlass apps ${onOff(s.smartGlass)} · Play To ${onOff(s.playTo)}`,
      icon: 'network',
      desc: 'Make your console available to smartphones, tablets, and PCs.',
      onSelect: () => ui.push('settings.devices'),
    },
  ];
  return <MenuScreen active={active} kicker="system" title="Console Settings" items={items} aside={panel} />;
}

export function KinectSettings({ active }) {
  const ui = useUI();
  const items = [
    {
      id: 'kn-sensor',
      label: 'Sensor',
      current: 'Sensor Disconnected',
      icon: 'kinect',
      disabled: true,
      desc: 'Change your Kinect settings or fix problems with the Kinect Tuner.',
    },
    { id: 'kn-mic', label: 'Chat Microphone', icon: 'mic', disabled: true, desc: 'Needs a connected Kinect sensor.' },
    { id: 'kn-speech', label: 'Speech Recognition', icon: 'mic', disabled: true, desc: 'Needs a connected Kinect sensor.' },
    {
      id: 'kn-tuner',
      label: 'Kinect Tuner',
      icon: 'kinect',
      desc: 'Calibrate your Kinect sensor for the best tracking.',
      onSelect: () =>
        ui.notify({ kind: 'info', title: 'Kinect sensor not detected', text: 'Connect a sensor to use Kinect', icon: 'kinect', force: true }),
    },
    { id: 'kn-id', label: 'Kinect ID Setup', icon: 'person', disabled: true, desc: 'Needs a connected Kinect sensor.' },
  ];
  return <MenuScreen active={active} kicker="system" title="Kinect Settings" items={items} aside={panel} />;
}

export function Computers({ active }) {
  const ui = useUI();
  const items = [
    {
      id: 'cp-wmc',
      label: 'Windows Media Center',
      current: 'Not connected',
      icon: 'monitor',
      desc: 'Your console isn’t connected to a Windows Media Center PC. Connect one to watch and record TV shows, view your digital photos, and listen to music.',
      onSelect: () => ui.notify({ kind: 'info', title: 'No Windows Media Center PC found', icon: 'monitor', force: true }),
    },
  ];
  return <MenuScreen active={active} kicker="system" title="Computers" items={items} aside={panel} />;
}

export function TVSettings({ active }) {
  return (
    <MenuScreen
      active={active}
      kicker="system"
      title="TV"
      items={[]}
      aside={() => (
        <InfoPanel>
          <p>Change your TV provider.</p>
        </InfoPanel>
      )}
    />
  );
}

export function XboxLiveVision({ active }) {
  const { state, actions } = useStore();
  const s = state.settings;
  const set = (patch) => actions.updateSettings(patch);
  const items = [
    {
      id: 'lv-room',
      kind: 'option',
      label: 'Room',
      value: s.visionRoom,
      options: ['Auto (Default)', 'Small Room', 'Large Room'],
      icon: 'video',
      desc: 'Can’t detect your Xbox Live Vision camera. Make sure your camera is connected directly to the console. To focus, use the ring on the camera lens.',
      onChange: (v) => set({ visionRoom: v }),
    },
    {
      id: 'lv-light',
      kind: 'option',
      label: 'Lighting',
      value: s.visionLighting,
      options: ['Daylight', 'Fluorescent', 'Incandescent', 'Low Light'],
      icon: 'sun',
      desc: 'Choose the lighting that matches the room where you play.',
      onChange: (v) => set({ visionLighting: v }),
    },
    {
      id: 'lv-flicker',
      kind: 'option',
      label: 'Fluorescent Anti-Flicker',
      value: s.visionAntiFlicker,
      options: ['On', 'Off'],
      icon: 'sun',
      desc: 'Reduces flicker from fluorescent lights.',
      onChange: (v) => set({ visionAntiFlicker: v }),
    },
  ];
  return <MenuScreen active={active} kicker="system" title="Xbox Live Vision" items={items} aside={panel} />;
}

export function DisplaySettings({ active }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const s = state.settings;
  const set = (patch) => actions.updateSettings(patch);
  const items = [
    {
      id: 'ds-hdtv',
      label: 'HDTV Settings',
      current: `${s.resolution} ${s.screenFormat} HDMI`,
      icon: 'monitor',
      desc: 'Set the display to match your TV. Connect an Xbox 360 HD AV Cable to configure high definition display modes.',
      onSelect: () => ui.push('settings.choice', { id: 'hdtv' }),
    },
    {
      id: 'ds-format',
      label: 'Screen Format',
      current: s.screenFormat,
      icon: 'film',
      disabled: true,
      desc: 'Set the display to match your TV. Connect an Xbox 360 HD AV Cable to configure high definition display modes.',
    },
    {
      id: 'ds-reference',
      label: 'Reference Levels',
      current: s.referenceLevel,
      icon: 'sliders',
      desc: CHOICES.reference.desc,
      onSelect: () => ui.push('settings.choice', { id: 'reference' }),
    },
    {
      id: 'ds-color',
      label: 'HDMI Color Space',
      current: s.colorSpace,
      icon: 'palette',
      desc: CHOICES.hdmi.desc,
      onSelect: () => ui.push('settings.choice', { id: 'hdmi' }),
    },
    {
      id: 'ds-discovery',
      kind: 'toggle',
      label: 'Display Discovery',
      value: s.displayDiscovery,
      icon: 'monitor',
      desc: 'Let your console detect the display modes your TV supports.',
      onChange: (v) => set({ displayDiscovery: v }),
    },
    {
      id: 'ds-saver',
      kind: 'toggle',
      label: 'Screen Saver',
      value: s.screenSaver,
      icon: 'monitor',
      desc: 'Dim the dashboard after a period of inactivity.',
      onChange: (v) => set({ screenSaver: v }),
    },
  ];
  return <MenuScreen active={active} kicker="console settings" title="Display" items={items} aside={panel} />;
}

export function AudioSettings({ active }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const s = state.settings;
  const set = (patch) => actions.updateSettings(patch);
  const items = [
    {
      id: 'au-output',
      label: 'Digital Output',
      current: s.audioOutput,
      icon: 'speaker',
      desc: CHOICES.digital.desc,
      onSelect: () => ui.push('settings.choice', { id: 'digital' }),
    },
    {
      id: 'au-effects',
      kind: 'toggle',
      label: 'Sound Effects',
      value: s.sound,
      icon: s.sound ? 'speaker' : 'mute',
      desc: 'Play sounds for menus, navigation and notifications. Press M anywhere to mute.',
      onChange: (v) => {
        set({ sound: v });
        sound.setEnabled(v);
        if (v) sound.play('toggle');
      },
    },
    {
      id: 'au-ratings',
      kind: 'toggle',
      label: 'Ratings Collection Sound',
      value: s.ratingsSound,
      icon: 'rating',
      desc: 'Play a sound when the console collects ratings for a game or movie.',
      onChange: (v) => set({ ratingsSound: v }),
    },
  ];
  return <MenuScreen active={active} kicker="console settings" title="Audio" items={items} aside={panel} />;
}

export function LanguageSettings({ active }) {
  const { state, actions } = useStore();
  const s = state.settings;
  const set = (patch) => actions.updateSettings(patch);
  const items = [
    {
      id: 'lg-language',
      kind: 'option',
      label: 'Language',
      value: s.language,
      options: ['English', 'Français', 'Deutsch', 'Español', 'Italiano', 'Português', '日本語'],
      icon: 'language',
      desc: 'Dashboard language (labels stay in English in this recreation).',
      onChange: (v) => set({ language: v }),
    },
    {
      id: 'lg-locale',
      kind: 'option',
      label: 'Locale',
      value: s.locale,
      options: ['United Kingdom', 'United States', 'Canada', 'Australia', 'Germany', 'France', 'Japan'],
      icon: 'globe',
      desc: 'Region used for Marketplace and Xbox LIVE.',
      onChange: (v) => set({ locale: v }),
    },
  ];
  return <MenuScreen active={active} kicker="console settings" title="Language and Locale" items={items} aside={panel} />;
}

export function ClockSettings({ active }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const s = state.settings;
  const items = [
    {
      id: 'ck-now',
      label: 'Date and Time',
      current: clockText(s.clock24),
      icon: 'clock',
      desc: 'Set the date, time, and other clock settings. The clock follows this browser.',
      onSelect: () => ui.notify({ kind: 'info', title: 'Clock follows this browser', icon: 'clock', force: true }),
    },
    {
      id: 'ck-24',
      kind: 'toggle',
      label: '24-Hour Clock',
      value: s.clock24,
      icon: 'clock',
      desc: 'Shows the time in the Guide using 24-hour format.',
      onChange: (v) => actions.updateSettings({ clock24: v }),
    },
  ];
  return <MenuScreen active={active} kicker="console settings" title="Clock" items={items} aside={panel} />;
}

export function StartupSettings({ active }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const s = state.settings;
  const items = [
    {
      id: 'sh-off',
      label: 'Auto-Off',
      current: s.autoOff,
      icon: 'timer',
      desc: CHOICES.autoOff.desc,
      onSelect: () => ui.push('settings.choice', { id: 'autoOff' }),
    },
    {
      id: 'sh-downloads',
      kind: 'toggle',
      label: 'Background Downloads',
      value: s.backgroundDownloads,
      icon: 'download',
      desc: 'Keep downloading games and apps while the console is off.',
      onChange: (v) => actions.updateSettings({ backgroundDownloads: v }),
    },
  ];
  return <MenuScreen active={active} kicker="console settings" title="Startup and Shutdown" items={items} aside={panel} />;
}

export function DevicesSettings({ active }) {
  const { state, actions } = useStore();
  const s = state.settings;
  const set = (patch) => actions.updateSettings(patch);
  const items = [
    {
      id: 'dv-smartglass',
      kind: 'toggle',
      label: 'Xbox SmartGlass Apps',
      value: s.smartGlass,
      icon: 'network',
      desc: 'Make your console available to smartphones, tablets, and PCs.',
      onChange: (v) => set({ smartGlass: v }),
    },
    {
      id: 'dv-playto',
      kind: 'toggle',
      label: 'Play To',
      value: s.playTo,
      icon: 'play',
      desc: 'Let other devices on your network send media to this console.',
      onChange: (v) => set({ playTo: v }),
    },
  ];
  return <MenuScreen active={active} kicker="console settings" title="Connected Devices" items={items} aside={panel} />;
}

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
  { id: 'hdd', label: 'Hard Drive', icon: 'hdd', total: 27.8 },
  { id: 'cloud', label: 'Cloud Saved Games', icon: 'cloud', total: 2 },
  { id: 'x360', label: 'Xbox 360', icon: 'usb', total: 1500 },
];
const freeText = (gb) => (gb >= 100 ? Math.round(gb) : gb.toFixed(1));
const ALL_DEVICES = { id: 'all', label: 'All Devices', icon: 'hdd', total: DEVICES.reduce((s, d) => s + d.total, 0) };

async function clearSystemCache(ui, actions) {
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
}

export function StorageSettings({ active }) {
  const ui = useUI();
  const { state } = useStore();
  const { games } = useLibrary();
  const parts = storageBreakdown(state, games);
  const used = parts.reduce((s, p) => s + p.gb, 0);
  const sizes = { hdd: used, cloud: 0.3, x360: 94 };
  sizes.all = sizes.hdd + sizes.cloud + sizes.x360;
  const [focus, setFocus] = useState('hdd');
  const dev = focus === 'all' ? ALL_DEVICES : DEVICES.find((d) => d.id === focus) || DEVICES[0];

  return (
    <Screen
      active={active}
      kicker="system"
      title="Storage"
      hints={[
        { btn: 'a', label: 'Select' },
        { btn: 'b', label: 'Back' },
        { btn: 'y', label: 'Device Options' },
      ]}
      onAction={(action) => {
        if (action === 'y') {
          sound.play('select');
          if (focus !== 'all') ui.push('settings.storageDevice', { id: focus });
          return true;
        }
        return false;
      }}
    >
      <div className="split">
        <div className="menu">
          <Row
            id="st-all"
            icon={ALL_DEVICES.icon}
            label={ALL_DEVICES.label}
            value={`${DEVICES.length} devices`}
            isDefault
            onFocus={() => setFocus('all')}
            onSelect={() => setFocus('all')}
          />
          {DEVICES.map((d) => (
            <Row
              key={d.id}
              id={`st-${d.id}`}
              icon={d.icon}
              label={d.label}
              value={`${freeText(d.total - sizes[d.id])} GB free`}
              onFocus={() => setFocus(d.id)}
              onSelect={() => ui.push('settings.storageDevice', { id: d.id })}
            />
          ))}
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
  const { actions } = useStore();
  const library = useLibrary();
  const dev = DEVICES.find((d) => d.id === params.id) || DEVICES[0];
  const cacheItem = {
    id: 'sd-cache',
    label: 'Clear System Cache',
    icon: 'refresh',
    desc: 'Clearing the system cache can fix some problems. Game updates may need to be downloaded again.',
    onSelect: () => clearSystemCache(ui, actions),
  };
  if (dev.id !== 'hdd') {
    const items = [
      {
        id: 'sd-saves',
        label: 'Saved Games',
        value: dev.id === 'cloud' ? '0.3 GB' : '94.0 GB',
        icon: 'cloud',
        desc: 'Placeholder saved games.',
        onSelect: () => ui.notify({ kind: 'info', title: 'Saved games are placeholders', icon: 'info', force: true }),
      },
      {
        id: 'sd-format',
        label: dev.id === 'cloud' ? 'Sync Now' : 'Format',
        icon: dev.id === 'cloud' ? 'refresh' : 'trash',
        desc: dev.id === 'cloud' ? 'Sync saves with the (simulated) cloud.' : 'Erase everything on this device (simulated, nothing is erased).',
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
  const gameItems = library.games.length
    ? library.games.map((g) => ({
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
      }))
    : [
        { id: 'sd-empty', label: 'No games stored', disabled: true, desc: 'Games you load from this device are listed here.' },
        {
          id: 'sd-add',
          label: 'Add a Game',
          icon: 'plus',
          desc: 'Load a web game from a file, a zip, or a folder.',
          onSelect: () => ui.replace('addGame'),
        },
      ];
  return <MenuScreen active={active} kicker="storage" title="Hard Drive · Games" items={[...gameItems, cacheItem]} />;
}

// ---- Network ------------------------------------------------------------------
export function NetworkSettings({ active }) {
  const ui = useUI();
  const items = [
    {
      id: 'net-wired',
      label: 'Wired Network',
      current: 'Connected',
      icon: 'network',
      desc: 'Your console is connected to your home network with a cable.',
      onSelect: () => ui.notify({ kind: 'info', title: 'Wired network', text: 'Connected (simulated)', icon: 'network', force: true }),
    },
    {
      id: 'net-wireless',
      label: 'Wireless Network',
      current: 'Not configured',
      icon: 'network',
      desc: 'Set up a wireless connection to your home network.',
      onSelect: () =>
        ui.notify({ kind: 'info', title: 'Wireless network', text: 'No wireless networks found (simulated)', icon: 'network', force: true }),
    },
  ];
  return <MenuScreen active={active} kicker="system" title="Available Networks" items={items} aside={panel} />;
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
      onSelect: () => restoreDefaults(ui, actions),
    },
    {
      id: 'pr-about',
      label: 'About',
      icon: 'info',
      desc: 'Who made this recreation, and where your data is kept.',
      onSelect: () => ui.push('settings.about'),
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

import { Tile } from '../components/ui.jsx';
import Gamerpic from '../components/Gamerpic.jsx';
import Avatar from '../components/Avatar.jsx';
import { THEME_BY_ID } from '../data/themes.js';
import { useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';

export default function SettingsPivot() {
  const ui = useUI();
  const { state } = useStore();
  const theme = THEME_BY_ID[state.settings.theme] || THEME_BY_ID.default;
  const { profile } = state;
  return (
    <div className="grid12">
      <Tile id="set-profile" at={[1, 1, 4, 4]} className="tile-profile" isDefault onSelect={() => ui.push('settings.profile')} ariaLabel="profile">
        <span className="tp-pic">
          <Gamerpic id={profile.gamerpic} avatar={profile.avatar} size={176} />
        </span>
        <span className="tp-tag">{profile.gamertag}</span>
        <span className="tp-motto">“{profile.motto || 'No motto yet'}”</span>
        <span className="tile-label">profile</span>
      </Tile>
      <Tile id="set-system" at={[5, 1, 2, 2]} icon="gear" label="system" onSelect={() => ui.push('settings.system')} />
      <Tile id="set-preferences" at={[7, 1, 2, 2]} icon="sliders" label="preferences" onSelect={() => ui.push('settings.prefs')} />
      <Tile id="set-account" at={[5, 3, 2, 2]} icon="card" label="account" onSelect={() => ui.push('settings.account')} />
      <Tile id="set-family" at={[7, 3, 2, 2]} icon="family" label="family" onSelect={() => ui.push('settings.family')} />
      <Tile
        id="set-theme"
        at={[5, 5, 4, 2]}
        variant="theme"
        className={theme.mode === 'light' ? 'is-light' : ''}
        onSelect={() => ui.push('settings.theme')}
        ariaLabel="theme"
      >
        <span className="theme-swatch" style={{ background: theme.base }} />
        <span className="theme-mini">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="tile-label">theme</span>
        <span className="tile-sub">{theme.name}</span>
      </Tile>
      <Tile id="set-avatar" at={[1, 5, 4, 2]} variant="avatar" onSelect={() => ui.push('avatar')} ariaLabel="change avatar">
        <span className="avatar-strip">
          <Avatar config={profile.avatar} delay={1.2} />
        </span>
        <span className="tile-label">change avatar</span>
        <span className="tile-sub">Style, features and clothes</span>
      </Tile>
      <Tile id="set-display" at={[9, 1, 2, 2]} variant="dark" icon="monitor" label="display" onSelect={() => ui.push('settings.display')} />
      <Tile id="set-storage" at={[11, 1, 2, 2]} variant="dark" icon="hdd" label="storage" onSelect={() => ui.push('settings.storage')} />
      <Tile
        id="set-audio"
        at={[9, 3, 2, 2]}
        variant="dark"
        icon={state.settings.sound ? 'speaker' : 'mute'}
        label="audio"
        onSelect={() => ui.push('settings.audio')}
      />
      <Tile id="set-network" at={[11, 3, 2, 2]} variant="dark" icon="network" label="network" onSelect={() => ui.push('settings.network')} />
      <Tile
        id="set-help"
        at={[9, 5, 4, 2]}
        variant="light"
        icon="help"
        label="help & controls"
        sub="Keyboard, mouse, touch and controller"
        onSelect={() => ui.setHelpOpen(true)}
      />
    </div>
  );
}

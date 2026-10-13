import { Tile } from '../components/ui.jsx';
import Glyph from '../components/Glyph.jsx';
import { sound } from '../audio/sound.js';
import { useUI } from '../state/ui.jsx';

export default function SettingsPivot() {
  const ui = useUI();

  const turnOff = async () => {
    const ok = await ui.confirm({
      title: 'Turn Off',
      message: 'Turn off the console? Your preferences are saved automatically.',
      confirmLabel: 'Turn Off',
      cancelLabel: 'Cancel',
    });
    if (ok) {
      sound.play('power');
      ui.setPower('off');
    }
  };

  return (
    <div className="grid-settings">
      <Tile id="set-system" label="System" isDefault onSelect={() => ui.push('settings.system')}>
        <Glyph name="system" size={92} className="tile-glyph" />
      </Tile>
      <Tile id="set-profile" label="Profile" onSelect={() => ui.push('settings.profile')}>
        <Glyph name="profile" size={92} className="tile-glyph" />
      </Tile>
      <Tile id="set-preferences" label="Preferences" onSelect={() => ui.push('settings.prefs')}>
        <Glyph name="preferences" size={92} className="tile-glyph" />
      </Tile>
      <Tile
        id="set-kinect"
        label="Kinect"
        className="is-unavailable"
        snd="error"
        onSelect={() =>
          ui.notify({
            kind: 'info',
            title: 'Kinect sensor not detected',
            text: 'Connect a Kinect sensor to use these settings',
            icon: 'kinect',
            force: true,
          })
        }
      >
        <Glyph name="kinect" size={92} className="tile-glyph" />
      </Tile>
      <Tile id="set-account" label="Account" onSelect={() => ui.push('settings.account')}>
        <Glyph name="account" size={92} className="tile-glyph" />
      </Tile>
      <Tile id="set-privacy" label="Privacy" onSelect={() => ui.push('settings.privacy')}>
        <Glyph name="privacy" size={92} className="tile-glyph" />
      </Tile>
      <Tile id="set-family" label="Family" onSelect={() => ui.push('settings.family')}>
        <Glyph name="family" size={92} className="tile-glyph" />
      </Tile>
      <Tile id="set-turnoff" label="Turn Off" onSelect={turnOff}>
        <Glyph name="power" size={92} className="tile-glyph" />
      </Tile>
    </div>
  );
}

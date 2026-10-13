import { Tile } from '../components/ui.jsx';
import { TileArt } from '../components/Glyph.jsx';
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
        <TileArt name="system" />
      </Tile>
      <Tile id="set-profile" label="Profile" onSelect={() => ui.push('settings.profile')}>
        <TileArt name="s-profile" />
      </Tile>
      <Tile id="set-preferences" label="Preferences" onSelect={() => ui.push('settings.prefs')}>
        <TileArt name="preferences" />
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
        <TileArt name="kinect" />
      </Tile>
      <Tile id="set-account" label="Account" onSelect={() => ui.push('settings.account')}>
        <TileArt name="s-account" />
      </Tile>
      <Tile id="set-privacy" label="Privacy" onSelect={() => ui.push('settings.privacy')}>
        <TileArt name="privacy" />
      </Tile>
      <Tile id="set-family" label="Family" onSelect={() => ui.push('settings.family')}>
        <TileArt name="family" />
      </Tile>
      <Tile id="set-turnoff" label="Turn Off" onSelect={turnOff}>
        <TileArt name="power" />
      </Tile>
    </div>
  );
}

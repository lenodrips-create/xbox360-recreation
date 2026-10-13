import { useEffect } from 'react';
import { useLayer } from '../nav/NavProvider.jsx';
import { useUI } from '../state/ui.jsx';
import { useStore } from '../state/store.jsx';
import { sound } from '../audio/sound.js';

const BOOT_MS = 2700;

// Original boot sequence: a glowing orb and light ribbons, then fade in.
function Boot() {
  const ui = useUI();
  const { setPower } = ui;
  const finish = () => setPower('on');
  const { ref } = useLayer({ priority: 400, blockGlobal: true, onBack: finish, onAction: () => (finish(), true) });
  useEffect(() => {
    sound.play('boot');
    const t = setTimeout(() => setPower('on'), BOOT_MS);
    return () => clearTimeout(t);
  }, [setPower]);
  return (
    <div ref={ref} className="boot" onClick={finish} role="presentation">
      <div className="boot-glow" />
      <div className="boot-ribbon r1" />
      <div className="boot-ribbon r2" />
      <div className="boot-ribbon r3" />
      <div className="boot-orb">
        <span />
      </div>
      <div className="boot-flash" />
    </div>
  );
}

function Off() {
  const ui = useUI();
  const on = () => {
    sound.unlock();
    ui.setPower('booting');
  };
  const { ref } = useLayer({ priority: 400, blockGlobal: true, onBack: on, onAction: () => (on(), true) });
  return (
    <div ref={ref} className="power-off" onClick={on} role="button" tabIndex={-1}>
      <div className="power-ring">
        <span />
      </div>
      <p>Press any key or click to turn on</p>
    </div>
  );
}

export default function PowerOverlay() {
  const ui = useUI();
  const { state } = useStore();
  const { power, setPower } = ui;
  const skip = !state.settings.bootAnimation;

  useEffect(() => {
    if (power === 'booting' && skip) setPower('on');
  }, [power, skip, setPower]);

  if (power === 'off') return <Off />;
  if (power === 'booting' && !skip) return <Boot />;
  return null;
}

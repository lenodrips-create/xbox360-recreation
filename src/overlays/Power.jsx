import { useEffect, useRef, useState } from 'react';
import { useLayer } from '../nav/NavProvider.jsx';
import { useUI } from '../state/ui.jsx';
import { useStore } from '../state/store.jsx';
import { sound } from '../audio/sound.js';
import { REF } from '../data/reference.js';

// The intro video plays full screen, then fades into the dashboard. Browsers
// block sound until the page has been interacted with, so the first load may
// start muted (click to turn the sound on); turning the console on from the
// "off" screen always plays with sound.
function Boot() {
  const ui = useUI();
  const { setPower } = ui;
  const videoRef = useRef(null);
  const [ending, setEnding] = useState(false);
  const [muted, setMuted] = useState(false);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    setEnding(true);
    setTimeout(() => setPower('on'), 450);
  };

  const { ref } = useLayer({ priority: 400, blockGlobal: true, onBack: finish, onAction: () => (finish(), true) });

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return undefined;
    v.muted = false;
    v.play().catch(() => {
      v.muted = true;
      setMuted(true);
      v.play().catch(() => finish());
    });
    // Safety net if the video can't load or stalls.
    const t = setTimeout(finish, 14000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onClick = () => {
    const v = videoRef.current;
    if (muted && v) {
      v.muted = false;
      setMuted(false);
      return;
    }
    finish();
  };

  return (
    <div ref={ref} className={`boot ${ending ? 'is-ending' : ''}`} onClick={onClick} role="presentation">
      <video ref={videoRef} className="boot-video" playsInline preload="auto" onEnded={finish}>
        <source src={REF.introWebm} type="video/webm" />
        <source src={REF.intro} type="video/mp4" onError={finish} />
      </video>
      {muted && <div className="boot-unmute">Click for sound · press any key to skip</div>}
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

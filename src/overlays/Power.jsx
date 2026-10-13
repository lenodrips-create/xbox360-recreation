import { useEffect, useRef, useState } from 'react';
import { useLayer } from '../nav/NavProvider.jsx';
import { useUI } from '../state/ui.jsx';
import { useStore } from '../state/store.jsx';
import { sound } from '../audio/sound.js';
import { REF } from '../data/reference.js';

// The intro video plays full screen with sound, then fades into the
// dashboard. It is never played muted: when the browser refuses to start
// audio before the page has been interacted with, the console waits on a
// "press any button" standby screen and the intro starts, with sound, on
// that first press. Turning the console on from the "off" screen always
// plays it straight away.
function Boot() {
  const ui = useUI();
  const { setPower } = ui;
  const videoRef = useRef(null);
  const [ending, setEnding] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const done = useRef(false);
  const safety = useRef(0);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    clearTimeout(safety.current);
    setEnding(true);
    setTimeout(() => setPower('on'), 450);
  };

  const play = (fromGesture) => {
    const v = videoRef.current;
    if (!v || done.current) return;
    sound.unlock();
    v.muted = false;
    v.volume = 1;
    if (fromGesture) v.currentTime = 0;
    v.play().then(
      () => {
        setWaiting(false);
        // Safety net only for a video that stalls part way through.
        clearTimeout(safety.current);
        safety.current = setTimeout(finish, 20000);
      },
      (err) => {
        if (err && err.name === 'NotAllowedError') setWaiting(true);
        else if (err && err.name !== 'AbortError') finish();
      },
    );
  };

  // The intro can't be skipped: every input is swallowed until it ends. While
  // waiting for the first press, any key starts it.
  const waitingRef = useRef(false);
  waitingRef.current = waiting;
  const { ref } = useLayer({
    priority: 400,
    blockGlobal: true,
    onBack: () => {},
    onAction: () => {
      if (waitingRef.current) play(true);
      return true;
    },
    onRawKey: (e) => {
      if (/^F\d+$/.test(e.key)) return false;
      if (waitingRef.current && !e.repeat) play(true);
      return true;
    },
  });

  useEffect(() => {
    play(false);
    return () => clearTimeout(safety.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={ref}
      className={`boot ${ending ? 'is-ending' : ''} ${waiting ? 'is-waiting' : ''}`}
      onClick={() => waiting && play(true)}
      role="presentation"
    >
      <video ref={videoRef} className="boot-video" playsInline preload="auto" onEnded={finish}>
        <source src={REF.introWebm} type="video/webm" />
        <source src={REF.intro} type="video/mp4" onError={() => setTimeout(finish, 300)} />
      </video>
      {waiting && (
        <div className="boot-standby">
          <div className="power-ring">
            <span />
          </div>
          <p>Press any button to start</p>
        </div>
      )}
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

import { useEffect } from 'react';
import { sound } from '../audio/sound.js';
import { REF } from '../data/reference.js';

// The green-orb "signed in to Xbox LIVE" notification shown when the start-up
// cutscene ends, recreated from the console capture with the current gamertag.
// The chime leads the orb by a quarter of a second, as on the console.
export default function SigninToast({ gamertag, onDone }) {
  useEffect(() => {
    sound.play('signin');
    const t = setTimeout(onDone, 3400);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="signin-toast" role="status" aria-live="polite">
      <div className="st-pill">
        <span className="st-text">
          {gamertag} signed
          <br />
          in to Xbox LIVE
        </span>
      </div>
      <div className="st-orb" aria-hidden="true">
        <img src={REF.orbX} alt="" draggable={false} />
        <img className="st-orb-system" src={REF.orbSystem} alt="" draggable={false} />
      </div>
    </div>
  );
}

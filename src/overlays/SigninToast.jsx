import { REF } from '../data/reference.js';

// The console's green-orb notification, recreated from a capture: the orb
// pops in, the pill unrolls, the orb flips to a second icon and back, then it
// all folds away (about 3 seconds). `pic` replaces the second icon (a friend's
// gamer picture, for example).
export function XboxNotice({ line1, line2, pic, delay = 0.05 }) {
  return (
    <div className="signin-toast" role="status" aria-live="polite" style={{ '--st-delay': `${delay}s` }}>
      <div className="st-pill">
        <span className="st-text">
          {line1}
          {line2 && <br />}
          {line2}
        </span>
      </div>
      <div className="st-orb" aria-hidden="true">
        <img src={REF.orbX} alt="" draggable={false} />
        {pic ? <span className="st-orb-pic">{pic}</span> : <img className="st-orb-system" src={REF.orbSystem} alt="" draggable={false} />}
      </div>
    </div>
  );
}

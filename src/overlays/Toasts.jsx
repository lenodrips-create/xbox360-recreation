import { useEffect } from 'react';
import { sound } from '../audio/sound.js';
import { useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';
import { FRIEND_BY_ID } from '../data/social.js';
import Gamerpic from '../components/Gamerpic.jsx';
import Icon from '../components/Icon.jsx';

const LIFE_MS = 5200;

function ToastOrb({ toast, profile }) {
  if (toast.kind === 'friend' && toast.friend) {
    const f = FRIEND_BY_ID[toast.friend];
    return <Gamerpic id={f.gamerpic} avatar={f.avatar} size={64} />;
  }
  if (toast.kind === 'signin') return <Gamerpic id={profile.gamerpic} avatar={profile.avatar} size={64} />;
  if (toast.kind === 'achievement') return <Icon name="trophy" size={44} strokeWidth={2.6} />;
  if (toast.kind === 'message') return <Icon name="message" size={42} strokeWidth={2.6} />;
  return <Icon name={toast.icon || 'info'} size={42} strokeWidth={2.6} />;
}

// Bottom-centre notification pill: the orb pops in, then the bar unrolls.
export default function ToastHost() {
  const ui = useUI();
  const { state } = useStore();
  const toast = ui.toasts[0];
  const { dismissToast } = ui;

  useEffect(() => {
    if (!toast) return undefined;
    sound.play(toast.kind === 'achievement' ? 'achievement' : 'toast');
    const t = setTimeout(() => dismissToast(toast.key), LIFE_MS);
    return () => clearTimeout(t);
  }, [toast, dismissToast]);

  if (!toast) return null;
  return (
    <div className="toast-wrap" aria-live="polite">
      <div key={toast.key} className={`toast toast-${toast.kind}`} data-toast={toast.key}>
        <span className="toast-orb">
          <ToastOrb toast={toast} profile={state.profile} />
        </span>
        <span className="toast-bar">
          <span className="toast-title">{toast.title}</span>
          {toast.text && <span className="toast-text">{toast.text}</span>}
        </span>
      </div>
    </div>
  );
}

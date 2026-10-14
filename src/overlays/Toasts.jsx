import { useEffect } from 'react';
import { sound } from '../audio/sound.js';
import { FRIEND_BY_ID } from '../data/social.js';
import Gamerpic from '../components/Gamerpic.jsx';
import { useUI } from '../state/ui.jsx';
import { XboxNotice } from './SigninToast.jsx';

const LIFE_MS = 3200;

// Every notification uses the console's green-orb pill and notification sound
// (sign-ins keep their own chime).
export default function ToastHost() {
  const ui = useUI();
  const toast = ui.toasts[0];
  const { dismissToast } = ui;

  useEffect(() => {
    if (!toast) return undefined;
    sound.play(toast.kind === 'signin' ? 'signin' : 'notify');
    const t = setTimeout(() => dismissToast(toast.key), LIFE_MS);
    return () => clearTimeout(t);
  }, [toast, dismissToast]);

  if (!toast) return null;
  const f = toast.kind === 'friend' && toast.friend ? FRIEND_BY_ID[toast.friend] : null;
  return (
    <XboxNotice
      key={toast.key}
      line1={toast.title}
      line2={toast.text}
      pic={f ? <Gamerpic id={f.gamerpic} avatar={f.avatar} size={56} /> : null}
      delay={toast.kind === 'signin' ? 0.25 : 0.05}
    />
  );
}

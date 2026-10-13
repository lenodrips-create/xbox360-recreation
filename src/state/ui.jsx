import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { FRIENDS } from '../data/social.js';
import { sound } from '../audio/sound.js';
import { useStore } from './store.jsx';

// Transient UI state: the screen stack, overlays, toasts and simulated
// Xbox LIVE presence. Nothing in here is persisted.
const UIContext = createContext(null);

const EXIT_MS = 260;

export function UIProvider({ children }) {
  const { state } = useStore();
  const notificationsOn = state.settings.notifications;
  const friendAlertsOn = state.settings.friendAlerts;

  const keyRef = useRef(0);
  const [stack, setStack] = useState([]);
  const [leaving, setLeaving] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const [osk, setOsk] = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [power, setPower] = useState('booting');
  const [pivot, setPivot] = useState(0);
  const [party, setParty] = useState(null);
  const [trayOpen, setTrayOpen] = useState(false);
  const [presence, setPresence] = useState(() =>
    Object.fromEntries(FRIENDS.map((f) => [f.id, { presence: 'offline', activity: 'Last seen recently' }])),
  );

  const stackRef = useRef(stack);
  stackRef.current = stack;

  const push = useCallback((type, params = {}) => {
    keyRef.current += 1;
    const entry = { key: keyRef.current, type, params };
    setStack((s) => [...s, entry]);
  }, []);

  const replace = useCallback((type, params = {}) => {
    keyRef.current += 1;
    const entry = { key: keyRef.current, type, params };
    setStack((s) => [...s.slice(0, -1), entry]);
  }, []);

  const retire = useCallback((entries) => {
    if (!entries.length) return;
    setLeaving((l) => [...l, ...entries]);
    setTimeout(() => {
      setLeaving((l) => l.filter((e) => !entries.includes(e)));
    }, EXIT_MS);
  }, []);

  const pop = useCallback(
    (count = 1) => {
      const s = stackRef.current;
      if (!s.length) return;
      const n = Math.min(count, s.length);
      const removed = s.slice(s.length - n);
      // Only the visible (top) screen animates out.
      retire([removed[removed.length - 1]]);
      setStack(s.slice(0, s.length - n));
      sound.play('back');
    },
    [retire],
  );

  const home = useCallback(
    (pivotIndex) => {
      const s = stackRef.current;
      if (s.length) retire([s[s.length - 1]]);
      setStack([]);
      if (typeof pivotIndex === 'number') setPivot(pivotIndex);
    },
    [retire],
  );

  const notify = useCallback(
    (toast) => {
      if (!toast.force) {
        if (!notificationsOn) return;
        if (toast.kind === 'friend' && !friendAlertsOn) return;
      }
      keyRef.current += 1;
      const entry = { ...toast, key: keyRef.current };
      setToasts((t) => {
        // Quick feedback ("info") shows immediately and replaces older info
        // toasts; an interrupted notification (achievement, friend…) shows
        // again right after. Real notifications queue up like on the console.
        if (entry.kind === 'info') return [entry, ...t.filter((x) => x.kind !== 'info')];
        return [...t, entry].slice(0, 6);
      });
    },
    [notificationsOn, friendAlertsOn],
  );

  const dismissToast = useCallback((key) => setToasts((t) => t.filter((x) => x.key !== key)), []);

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        keyRef.current += 1;
        setDialog({
          ...opts,
          id: keyRef.current,
          options: opts.options || [
            { label: opts.confirmLabel || 'Yes', value: true },
            { label: opts.cancelLabel || 'No', value: false },
          ],
          resolve: (v) => {
            setDialog(null);
            resolve(v);
          },
        });
      }),
    [],
  );

  const keyboard = useCallback(
    (opts) =>
      new Promise((resolve) => {
        keyRef.current += 1;
        setOsk({
          id: keyRef.current,
          title: opts.title || 'Enter Text',
          value: opts.value || '',
          maxLength: opts.maxLength || 60,
          multiline: !!opts.multiline,
          resolve: (v) => {
            setOsk(null);
            resolve(v);
          },
        });
      }),
    [],
  );

  const setFriendPresence = useCallback((id, patch) => {
    setPresence((p) => ({ ...p, [id]: { ...p[id], ...patch } }));
  }, []);

  const value = useMemo(
    () => ({
      stack,
      leaving,
      push,
      pop,
      replace,
      home,
      toasts,
      notify,
      dismissToast,
      dialog,
      confirm,
      osk,
      keyboard,
      guideOpen,
      setGuideOpen,
      helpOpen,
      setHelpOpen,
      power,
      setPower,
      pivot,
      setPivot,
      party,
      setParty,
      presence,
      setFriendPresence,
      trayOpen,
      setTrayOpen,
    }),
    [
      stack,
      leaving,
      push,
      pop,
      replace,
      home,
      toasts,
      notify,
      dismissToast,
      dialog,
      confirm,
      osk,
      keyboard,
      guideOpen,
      helpOpen,
      power,
      pivot,
      party,
      presence,
      setFriendPresence,
      trayOpen,
    ],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  return useContext(UIContext);
}

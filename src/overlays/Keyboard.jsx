import { useRef, useState } from 'react';
import { useLayer } from '../nav/NavProvider.jsx';
import { useUI } from '../state/ui.jsx';
import { sound } from '../audio/sound.js';
import { ButtonHints } from '../components/ui.jsx';

const LETTERS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '?'],
];
const SYMBOLS = [
  ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
  ['-', '_', '=', '+', '[', ']', '{', '}', ';', ':'],
  ['"', '/', '\\', '|', '<', '>', '~', '`', '€', '£'],
  ['¡', '¿', '«', '»', '…', '·', '°', '©', '®', '™'],
];

// On-screen keyboard modelled on the console's text entry screen. Works with
// D-pad/Enter, mouse, touch, and direct typing on a physical keyboard.
function Keyboard({ osk }) {
  const [text, setText] = useState(osk.value);
  const [shift, setShift] = useState(false);
  const [symbols, setSymbols] = useState(false);
  const doneRef = useRef(null);
  const textRef = useRef(text);
  textRef.current = text;

  const insert = (ch) => {
    setText((t) => (t.length >= osk.maxLength ? t : t + ch));
    sound.play('key');
  };
  const backspace = () => {
    setText((t) => t.slice(0, -1));
    sound.play('key');
  };
  const submit = () => {
    sound.play('select');
    osk.resolve(textRef.current);
  };
  const cancel = () => {
    sound.play('back');
    osk.resolve(null);
  };

  const { ref, mgr } = useLayer({
    priority: 150,
    blockGlobal: true,
    onBack: cancel,
    onAction: (action) => {
      if (action === 'x') {
        backspace();
        return true;
      }
      if (action === 'y') {
        insert(' ');
        return true;
      }
      if (action === 'lb' || action === 'rb') {
        setShift((s) => !s);
        return true;
      }
      return false;
    },
    onRawKey: (e) => {
      if (e.key === 'Escape') {
        cancel();
        return true;
      }
      if (e.key === 'Backspace') {
        backspace();
        return true;
      }
      if (e.key.length === 1) {
        insert(e.key);
        // Typing on a real keyboard parks focus on Done, so Enter submits.
        if (doneRef.current && document.activeElement !== doneRef.current) mgr.focus(doneRef.current, false);
        return true;
      }
      return false;
    },
  });

  const rows = symbols ? SYMBOLS : LETTERS;
  const key = (ch, r, c) => {
    const label = shift && !symbols ? ch.toUpperCase() : ch;
    return (
      <button
        key={`${r}-${c}`}
        type="button"
        tabIndex={-1}
        data-nav=""
        data-nav-id={`k-${r}-${c}`}
        data-nav-default={r === 1 && c === 0 ? '' : undefined}
        className="osk-key"
        onClick={() => {
          insert(label);
          if (shift) setShift(false);
        }}
      >
        {label}
      </button>
    );
  };

  const action = (id, label, onClick, cls = '', refProp) => (
    <button
      ref={refProp}
      type="button"
      tabIndex={-1}
      data-nav=""
      data-nav-id={id}
      className={`osk-key osk-action ${cls}`}
      onClick={() => {
        onClick();
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="osk-overlay">
      <div ref={ref} className="osk" role="dialog" aria-modal="true" aria-label={osk.title}>
        <h2 className="osk-title">{osk.title}</h2>
        <div className="osk-field">
          <span className="osk-text">{text}</span>
          <span className="osk-caret" />
          <span className="osk-count">
            {text.length}/{osk.maxLength}
          </span>
        </div>
        <div className="osk-body">
          <div className="osk-grid">
            {rows.map((row, r) => (
              <div className="osk-row" key={r}>
                {row.map((ch, c) => key(ch, r, c))}
              </div>
            ))}
            <div className="osk-row">
              {action('k-space', 'Space', () => insert(' '), 'osk-space')}
              {action('k-back', '⌫ Backspace', backspace, 'osk-wide')}
            </div>
          </div>
          <div className="osk-side">
            {action('k-done', 'Done', submit, 'osk-done', doneRef)}
            {action(
              'k-shift',
              shift ? 'Shift (on)' : 'Shift',
              () => {
                sound.play('toggle');
                setShift((s) => !s);
              },
              shift ? 'is-on' : '',
            )}
            {action('k-sym', symbols ? 'Letters' : 'Symbols', () => {
              sound.play('toggle');
              setSymbols((s) => !s);
            })}
            {action('k-clear', 'Clear', () => {
              sound.play('key');
              setText('');
            })}
            {action('k-cancel', 'Cancel', cancel)}
          </div>
        </div>
        <ButtonHints
          hints={[
            { btn: 'a', label: 'Select' },
            { btn: 'b', label: 'Cancel' },
            { btn: 'x', label: 'Backspace' },
            { btn: 'y', label: 'Space' },
          ]}
        />
      </div>
    </div>
  );
}

export default function KeyboardHost() {
  const ui = useUI();
  if (!ui.osk) return null;
  return <Keyboard key={ui.osk.id} osk={ui.osk} />;
}

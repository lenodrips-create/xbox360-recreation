import { useLayer } from '../nav/NavProvider.jsx';
import { useUI } from '../state/ui.jsx';
import { sound } from '../audio/sound.js';
import { Btn, Row } from '../components/ui.jsx';

const ROWS = [
  ['D-pad / Left stick', 'Arrow keys', 'Move between tiles and menu items', 'up'],
  ['A', 'Enter or Space', 'Select / open', 'a'],
  ['B', 'Esc or Backspace', 'Back', 'b'],
  ['X', 'X', 'Context action (shown at the bottom of a screen)', 'x'],
  ['Y', 'Y', 'Context action (pin, Xbox Home in the Guide)', 'y'],
  ['LB / RB', 'Q / E or Page Up / Page Down', 'Previous / next dashboard channel', 'lb'],
  ['Guide button', 'G or Home', 'Open the Xbox Guide', 'guide'],
  ['—', 'M', 'Mute or unmute dashboard sounds', 'mute'],
  ['—', 'F1, H or ?', 'Show this help', 'help'],
];

function HelpPanel() {
  const ui = useUI();
  const close = () => {
    sound.play('close');
    ui.setHelpOpen(false);
  };
  const { ref } = useLayer({ priority: 300, onBack: close, blockGlobal: true });
  return (
    <div className="help-overlay" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div ref={ref} className="help" role="dialog" aria-modal="true" aria-label="Help and controls">
        <h2>Help &amp; Controls</h2>
        <p className="help-intro">
          Use a keyboard, mouse, touch screen or a connected Xbox controller. Mouse: hover to select, click to open, right-click to go back, scroll
          the wheel to change channel. Touch: tap to open, swipe left or right to change channel. Click your gamerpic to open the Guide.
        </p>
        <table className="help-table">
          <thead>
            <tr>
              <th>Controller</th>
              <th>Keyboard</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([pad, key, what, b]) => (
              <tr key={what}>
                <td>
                  {['a', 'b', 'x', 'y', 'lb'].includes(b) ? <Btn b={b} /> : null} {pad}
                </td>
                <td>
                  <kbd>{key}</kbd>
                </td>
                <td>{what}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="help-actions">
          <Row id="help-close" label="Got it" isDefault onSelect={close} />
        </div>
      </div>
    </div>
  );
}

export default function HelpOverlay() {
  const ui = useUI();
  if (!ui.helpOpen) return null;
  return <HelpPanel />;
}

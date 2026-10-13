import { useLayer } from '../nav/NavProvider.jsx';
import { useUI } from '../state/ui.jsx';
import { Row } from '../components/ui.jsx';
import { sound } from '../audio/sound.js';

function Dialog({ dialog }) {
  const cancelValue = dialog.cancelValue !== undefined ? dialog.cancelValue : dialog.options[dialog.options.length - 1].value;
  const { ref } = useLayer({
    priority: 160,
    onBack: () => {
      sound.play('back');
      dialog.resolve(cancelValue);
    },
  });
  return (
    <div className="dialog-overlay">
      <div ref={ref} className="dialog" role="dialog" aria-modal="true" aria-label={dialog.title}>
        <div className="dialog-text">
          <h2>{dialog.title}</h2>
          {dialog.message && <p>{dialog.message}</p>}
        </div>
        <div className="dialog-actions">
          {dialog.options.map((o, i) => (
            <Row key={o.label} id={`dlg-${i}`} label={o.label} isDefault={i === 0} onSelect={() => dialog.resolve(o.value)} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DialogHost() {
  const ui = useUI();
  if (!ui.dialog) return null;
  return <Dialog key={ui.dialog.id} dialog={ui.dialog} />;
}

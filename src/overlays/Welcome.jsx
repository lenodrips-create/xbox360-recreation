import { useState } from 'react';
import { useLayer } from '../nav/NavProvider.jsx';
import { isValidGamertag, useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';
import { sound } from '../audio/sound.js';
import { Row } from '../components/ui.jsx';

// First launch: ask for a gamertag and, optionally, a name. Both are saved in
// this browser only, with the rest of the profile; there are no accounts,
// passwords or admin controls. It can't be dismissed without a gamertag.
function Welcome() {
  const ui = useUI();
  const { actions } = useStore();
  const [tag, setTag] = useState('');
  const [name, setName] = useState('');
  const ready = isValidGamertag(tag);

  const { ref } = useLayer({ priority: 120, blockGlobal: true });

  const editTag = async () => {
    const v = await ui.keyboard({ title: 'Choose a Gamertag', value: tag, maxLength: 15 });
    if (v === null) return;
    const next = v.trim();
    if (!isValidGamertag(next)) {
      sound.play('error');
      ui.notify({ kind: 'info', title: 'Gamertag too short', text: 'Use 3 to 15 characters', icon: 'info', force: true });
      return;
    }
    setTag(next);
  };
  const editName = async () => {
    const v = await ui.keyboard({ title: 'Your Name', value: name, maxLength: 30 });
    if (v !== null) setName(v.trim());
  };
  const finish = () => {
    actions.completeOnboarding({ gamertag: tag, name });
    ui.notify({ kind: 'signin', title: `${tag} signed in`, text: 'Welcome to Xbox LIVE', force: true });
  };

  return (
    <div className="dialog-overlay welcome-overlay">
      <div ref={ref} className="dialog" role="dialog" aria-modal="true" aria-label="Welcome">
        <div className="dialog-text">
          <h2>Welcome</h2>
          <p>Choose a gamertag to get started, and add your name if you like.</p>
          <p className="welcome-note">Both stay on this device. There are no accounts or passwords, and nothing is sent anywhere.</p>
        </div>
        <div className="dialog-actions">
          <Row id="welcome-tag" icon="controller" label="Gamertag" value={tag || 'Required'} isDefault onSelect={editTag} />
          <Row id="welcome-name" icon="person" label="Name" value={name || 'Optional'} onSelect={editName} />
          <Row id="welcome-done" icon="check" label="Done" disabled={!ready} onSelect={finish} />
        </div>
      </div>
    </div>
  );
}

export default function WelcomeHost() {
  const ui = useUI();
  const { state } = useStore();
  if (ui.power !== 'on' || state.onboarded) return null;
  return <Welcome />;
}

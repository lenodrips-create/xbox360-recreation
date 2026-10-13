import { useState } from 'react';
import { AVATAR_CATEGORIES, AVATAR_OPTIONS, randomAvatar } from '../data/avatar.js';
import { GAMERPICS } from '../data/gamerpics.js';
import { useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';
import { sound } from '../audio/sound.js';
import Avatar from '../components/Avatar.jsx';
import Gamerpic from '../components/Gamerpic.jsx';
import Icon from '../components/Icon.jsx';
import { Row, Screen } from '../components/ui.jsx';

const isColor = (v) => typeof v === 'string' && v.startsWith('#');

export function AvatarEditor({ active }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const saved = state.profile.avatar;
  const [draft, setDraft] = useState(saved);
  const [bump, setBump] = useState(0);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const change = (key, dir) => {
    const opts = AVATAR_OPTIONS[key];
    const i = Math.max(
      0,
      opts.findIndex((o) => o.value === draft[key]),
    );
    const next = opts[(i + dir + opts.length) % opts.length];
    setDraft((d) => ({ ...d, [key]: next.value }));
    setBump((b) => b + 1);
  };

  const save = () => {
    actions.updateAvatar(draft);
    ui.notify({ kind: 'info', title: 'Avatar saved', text: 'Looking good!', icon: 'avatar', force: true });
    ui.pop();
  };

  const back = async () => {
    if (!dirty) {
      ui.pop();
      return;
    }
    sound.play('open');
    const choice = await ui.confirm({
      title: 'Save Changes?',
      message: 'Do you want to save the changes to your avatar?',
      options: [
        { label: 'Save and Exit', value: 'save' },
        { label: 'Exit Without Saving', value: 'discard' },
        { label: 'Keep Editing', value: null },
      ],
    });
    if (choice === 'save') save();
    else if (choice === 'discard') ui.pop();
  };

  return (
    <Screen
      active={active}
      kicker="avatar editor"
      title="Change My Avatar"
      onBack={back}
      hints={[
        { btn: 'a', label: 'Next Option' },
        { btn: 'b', label: 'Back' },
        { btn: 'x', label: 'Randomize' },
        { btn: 'y', label: 'Save' },
      ]}
      onAction={(action) => {
        if (action === 'x') {
          sound.play('toggle');
          setDraft(randomAvatar(Math.floor(Math.random() * 100000)));
          setBump((b) => b + 1);
          return true;
        }
        if (action === 'y') {
          sound.play('select');
          save();
          return true;
        }
        return false;
      }}
    >
      <div className="avatar-editor">
        <div className="ae-stage">
          <span className="ae-floor" />
          <div key={bump} className="ae-figure">
            <Avatar config={draft} pose={bump ? 'wave' : 'idle'} />
          </div>
          {dirty && <span className="ae-dirty">Unsaved changes</span>}
        </div>
        <div className="menu ae-menu" data-scroll="y" data-scroll-pad="24">
          {AVATAR_CATEGORIES.map((c, i) => {
            const opts = AVATAR_OPTIONS[c.key];
            const opt = opts.find((o) => o.value === draft[c.key]) || opts[0];
            return (
              <Row
                key={c.key}
                id={`ae-${c.key}`}
                label={c.label}
                isDefault={i === 0}
                snd="toggle"
                onSelect={() => change(c.key, 1)}
                adjust={(d) => {
                  sound.play('move');
                  change(c.key, d);
                }}
                right={
                  <span className="option">
                    <span className="option-arrow">‹</span>
                    {isColor(opt.value) && <span className="swatch" style={{ background: opt.value }} />}
                    <span className="option-value">{opt.label}</span>
                    <span className="option-arrow">›</span>
                  </span>
                }
              />
            );
          })}
          <Row
            id="ae-random"
            icon="refresh"
            label="Randomize"
            snd="toggle"
            onSelect={() => {
              setDraft(randomAvatar(Math.floor(Math.random() * 100000)));
              setBump((b) => b + 1);
            }}
          />
          <Row
            id="ae-revert"
            icon="reply"
            label="Undo All Changes"
            onSelect={() => {
              setDraft(saved);
              setBump((b) => b + 1);
            }}
          />
          <Row id="ae-save" icon="check" label="Save and Exit" onSelect={save} />
        </div>
      </div>
    </Screen>
  );
}

export function GamerpicPicker({ active }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const current = state.profile.gamerpic;
  return (
    <Screen active={active} kicker="profile" title="Change Gamer Picture">
      <div className="lib-meta">Choose a picture. “My Avatar” uses a headshot of your avatar.</div>
      <div className="pic-grid">
        {GAMERPICS.map((g) => (
          <button
            key={g.id}
            type="button"
            tabIndex={-1}
            data-nav=""
            data-nav-id={`gp-${g.id}`}
            data-nav-default={g.id === current ? '' : undefined}
            className={`pic-card ${g.id === current ? 'is-current' : ''}`}
            onClick={() => {
              sound.play('select');
              actions.updateProfile({ gamerpic: g.id });
              ui.notify({ kind: 'signin', title: 'Gamer picture changed', text: g.name, force: true });
              ui.pop();
            }}
          >
            <Gamerpic id={g.id} avatar={state.profile.avatar} size={150} />
            <span className="pic-name">
              {g.name}
              {g.id === current && <Icon name="check" size={22} strokeWidth={3} />}
            </span>
          </button>
        ))}
      </div>
    </Screen>
  );
}

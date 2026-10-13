import { useRef } from 'react';
import { useUI } from '../state/ui.jsx';
import { SCREENS } from './registry.js';
import { Empty } from './common.jsx';
import { Screen } from '../components/ui.jsx';

function Missing({ active }) {
  return (
    <Screen active={active} title="Coming Soon">
      <Empty icon="info" title="This area isn't available yet" text="Press B to go back." />
    </Screen>
  );
}

function ScreenHost({ entry, top, leaving }) {
  const wasCovered = useRef(false);
  const state = leaving ? 'leaving' : top ? 'top' : 'covered';
  const returning = state === 'top' && wasCovered.current;
  if (state === 'covered') wasCovered.current = true;
  const Comp = SCREENS[entry.type] || Missing;
  return (
    <div className={`screen-host is-${state} ${returning ? 'is-return' : ''}`} data-screen={entry.type} inert={state === 'top' ? undefined : true}>
      <Comp active={state === 'top'} params={entry.params} />
    </div>
  );
}

export default function ScreenStack() {
  const ui = useUI();
  // One keyed list so a popped screen keeps its state while it animates out.
  const hosts = [
    ...ui.stack.map((entry, i) => ({ entry, top: i === ui.stack.length - 1, leaving: false })),
    ...ui.leaving.map((entry) => ({ entry, top: false, leaving: true })),
  ];
  return (
    <div className="screens">
      {hosts.map(({ entry, top, leaving }) => (
        <ScreenHost key={entry.key} entry={entry} top={top} leaving={leaving} />
      ))}
    </div>
  );
}

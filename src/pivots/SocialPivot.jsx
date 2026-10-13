import { useMemo } from 'react';
import { Tile } from '../components/ui.jsx';
import Glyph, { GBadge } from '../components/Glyph.jsx';
import Avatar from '../components/Avatar.jsx';
import Icon from '../components/Icon.jsx';
import { sound } from '../audio/sound.js';
import { gamerscoreOf, useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';

// Avatar awards shown next to the gamertag (placeholder items).
const AWARDS = [
  { icon: 'star', color: '#6b5a3a' },
  { icon: 'bolt', color: '#4a4a4a' },
  { icon: 'joystick', color: '#5b4630' },
  { icon: 'trophy', color: '#7a5226' },
  { icon: 'disc', color: '#5a4a32' },
  { icon: 'music', color: '#6a4a2a' },
  { icon: 'gold', color: '#3f4f2f', badge: true },
];

export default function SocialPivot() {
  const ui = useUI();
  const { state } = useStore();
  const score = useMemo(() => gamerscoreOf(state.unlocked), [state.unlocked]);
  const { profile } = state;

  return (
    <div className="social">
      <div className="social-col">
        <Tile id="soc-friends" label="Friends" isDefault onSelect={() => ui.push('friends')}>
          <Glyph name="friends" size={46} className="tile-glyph tr" />
        </Tile>
        <Tile id="soc-activity" label="Activity Feed" onSelect={() => ui.push('beacons')}>
          <Glyph name="activity" size={50} className="tile-glyph tr" />
        </Tile>
        <Tile id="soc-store" label="Avatar Store" onSelect={() => ui.push('marketplace', { category: 'avatar' })}>
          <Glyph name="store" size={46} className="tile-glyph tr" />
        </Tile>
        <Tile id="soc-signin" label="Sign In or Out" onSelect={() => ui.push('signin')}>
          <Glyph name="signin" size={50} className="tile-glyph tr" />
        </Tile>
      </div>

      <button
        type="button"
        tabIndex={-1}
        data-nav=""
        data-nav-id="soc-me"
        className="social-me"
        onClick={() => {
          sound.play('select');
          ui.push('profile');
        }}
        aria-label={`${profile.gamertag} profile`}
      >
        <span className="social-tag">{profile.gamertag}</span>
        <span className="social-score">
          {score.toLocaleString('en-US')} <GBadge size={46} />
        </span>
        <span className="awards">
          {Array.from({ length: 9 }, (_, i) => {
            const a = AWARDS[i];
            return (
              <span key={i} className={`award ${a ? '' : 'is-empty'} ${a?.badge ? 'is-badge' : ''}`}>
                {a && <Icon name={a.icon} size={36} strokeWidth={3} style={{ color: a.color }} />}
              </span>
            );
          })}
        </span>
        <span className="social-avatar">
          <Avatar config={profile.avatar} delay={0.6} />
        </span>
      </button>

      <p className="social-copy">Xbox is more fun with friends.</p>
    </div>
  );
}

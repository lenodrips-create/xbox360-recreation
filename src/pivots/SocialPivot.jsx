import { useMemo } from 'react';
import { Tile } from '../components/ui.jsx';
import Glyph, { GBadge } from '../components/Glyph.jsx';
import Avatar from '../components/Avatar.jsx';
import { REF } from '../data/reference.js';
import { DEFAULT_AVATAR } from '../data/avatar.js';
import { sound } from '../audio/sound.js';
import { gamerscoreOf, useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';

export default function SocialPivot() {
  const ui = useUI();
  const { state } = useStore();
  const score = useMemo(() => gamerscoreOf(state.unlocked), [state.unlocked]);
  const { profile } = state;
  // Until the avatar is customised, show the avatar from the reference capture.
  const stockAvatar = JSON.stringify(profile.avatar) === JSON.stringify(DEFAULT_AVATAR);

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
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className={`award ${REF.awards[i] ? '' : 'is-empty'}`}>
              {REF.awards[i] && <img src={REF.awards[i]} alt="" draggable={false} />}
            </span>
          ))}
        </span>
        {stockAvatar ? (
          <img className="social-avatar-img" src={REF.avatar} alt="" draggable={false} />
        ) : (
          <span className="social-avatar">
            <Avatar config={profile.avatar} delay={0.6} />
          </span>
        )}
      </button>

      <p className="social-copy">Xbox is more fun with friends.</p>
    </div>
  );
}

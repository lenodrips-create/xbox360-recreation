import { useMemo } from 'react';
import { Tile } from '../components/ui.jsx';
import Glyph, { GBadge } from '../components/Glyph.jsx';
import Avatar from '../components/Avatar.jsx';
import { sound } from '../audio/sound.js';
import { REF } from '../data/reference.js';
import { DEFAULT_AVATAR } from '../data/avatar.js';
import { gamerscoreOf, useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';

const AWARD_NAMES = ['Bone', 'Iron Sword', 'Pickaxe', 'Crafting Table', 'Wood Block', 'Book', 'Badge'];

// A focusable element on the social channel that isn't a tile.
function SocialButton({ id, className = '', label, onSelect, children }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      data-nav=""
      data-nav-id={id}
      data-anim=""
      aria-label={label}
      className={`soc-btn ${className}`}
      onClick={() => {
        sound.play('select');
        onSelect();
      }}
    >
      {children}
    </button>
  );
}

export default function SocialPivot() {
  const ui = useUI();
  const { state } = useStore();
  const score = useMemo(() => gamerscoreOf(state.unlocked), [state.unlocked]);
  const { profile } = state;
  // Until the avatar is customised, show the avatar from the reference capture.
  const stockAvatar = JSON.stringify(profile.avatar) === JSON.stringify(DEFAULT_AVATAR);

  const openAward = async (i) => {
    const choice = await ui.confirm({
      title: AWARD_NAMES[i],
      message: 'Avatar award. Your avatar can wear this item.',
      options: [
        { label: 'Change Avatar', value: 'wear' },
        { label: 'OK', value: null },
      ],
    });
    if (choice === 'wear') ui.push('avatar');
  };

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

      <SocialButton id="soc-tag" className="soc-tag" label={`${profile.gamertag} profile`} onSelect={() => ui.push('profile')}>
        <span className="social-tag">{profile.gamertag}</span>
        <span className="social-score">
          {score.toLocaleString('en-US')} <GBadge size={46} />
        </span>
      </SocialButton>

      <div className="awards">
        {Array.from({ length: 9 }, (_, i) =>
          REF.awards[i] ? (
            <SocialButton key={i} id={`soc-award-${i + 1}`} className="award" label={AWARD_NAMES[i]} onSelect={() => openAward(i)}>
              <img src={REF.awards[i]} alt="" draggable={false} />
            </SocialButton>
          ) : (
            <SocialButton
              key={i}
              id={`soc-award-${i + 1}`}
              className="award is-empty"
              label="Empty award slot"
              onSelect={() => ui.push('marketplace', { category: 'avatar' })}
            />
          ),
        )}
      </div>

      <SocialButton id="soc-avatar" className="soc-avatar" label="Change avatar" onSelect={() => ui.push('avatar')}>
        {stockAvatar ? (
          <img className="social-avatar-img" src={REF.avatar} alt="" draggable={false} />
        ) : (
          <span className="social-avatar">
            <Avatar config={profile.avatar} delay={0.6} />
          </span>
        )}
      </SocialButton>

      <SocialButton id="soc-copy" className="soc-copy" label="Find friends" onSelect={() => ui.push('friends')}>
        Xbox is more fun with friends.
      </SocialButton>
    </div>
  );
}

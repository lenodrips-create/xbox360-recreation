import { Tile } from '../components/ui.jsx';
import { GBadge, TileArt } from '../components/Glyph.jsx';
import Avatar from '../components/Avatar.jsx';
import { REF } from '../data/reference.js';
import { DEFAULT_AVATAR } from '../data/avatar.js';
import { useStore } from '../state/store.jsx';

const AWARD_NAMES = ['Bone', 'Iron Sword', 'Pickaxe', 'Crafting Table', 'Wood Block', 'Book', 'Badge'];

// Everything on the social channel can be selected (it zooms and plays the
// hover sound) but nothing opens another screen.
function SocialButton({ id, className = '', label, children }) {
  return (
    <button type="button" tabIndex={-1} data-nav="" data-nav-id={id} data-anim="" aria-label={label} className={`soc-btn ${className}`}>
      {children}
    </button>
  );
}

export default function SocialPivot() {
  const { state } = useStore();
  const { profile } = state;
  // Until the avatar is customised, show the avatar from the reference capture.
  const stockAvatar = JSON.stringify(profile.avatar) === JSON.stringify(DEFAULT_AVATAR);

  return (
    <div className="social">
      <div className="social-col">
        <Tile id="soc-friends" snd={null} label="Friends" isDefault>
          <TileArt name="friends" />
        </Tile>
        <Tile id="soc-activity" snd={null} label="Activity Feed">
          <TileArt name="activity" />
        </Tile>
        <Tile id="soc-store" snd={null} label="Avatar Store">
          <TileArt name="store" />
        </Tile>
        <Tile id="soc-signin" snd={null} label="Sign In or Out">
          <TileArt name="signin" />
        </Tile>
      </div>

      <SocialButton id="soc-tag" className="soc-tag" label={`${profile.gamertag} profile`}>
        <span className="social-tag">{profile.gamertag}</span>
        <span className="social-score">
          {profile.gamerscore.toLocaleString('en-US')} <GBadge size={46} big />
        </span>
      </SocialButton>

      <div className="awards">
        {Array.from({ length: 9 }, (_, i) =>
          REF.awards[i] ? (
            <SocialButton key={i} id={`soc-award-${i + 1}`} className="award" label={AWARD_NAMES[i]}>
              <img src={REF.awards[i]} alt="" draggable={false} />
            </SocialButton>
          ) : (
            <SocialButton key={i} id={`soc-award-${i + 1}`} className="award is-empty" label="Empty award slot" />
          ),
        )}
      </div>

      <SocialButton id="soc-avatar" className="soc-avatar" label="Change avatar">
        {stockAvatar ? (
          <img className="social-avatar-img" src={REF.avatar} alt="" draggable={false} />
        ) : (
          <span className="social-avatar">
            <Avatar config={profile.avatar} delay={0.6} />
          </span>
        )}
      </SocialButton>

      <SocialButton id="soc-copy" className="soc-copy" label="Find friends">
        Xbox is more fun with friends.
      </SocialButton>
    </div>
  );
}

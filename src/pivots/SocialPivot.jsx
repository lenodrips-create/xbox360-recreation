import { useMemo } from 'react';
import { GIcon, Tile } from '../components/ui.jsx';
import Avatar from '../components/Avatar.jsx';
import { sound } from '../audio/sound.js';
import { FRIENDS } from '../data/social.js';
import { GAME_BY_ID } from '../data/games.js';
import { gamerscoreOf, useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';

function SceneAvatar({ id, config, name, status, bubble, onSelect, me, delay, slot }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      data-nav=""
      data-nav-id={id}
      data-nav-default={me ? '' : undefined}
      data-anim=""
      className={`scene-av ${me ? 'is-me' : ''}`}
      style={{ '--slot': slot }}
      onClick={() => {
        sound.play('select');
        onSelect();
      }}
      aria-label={name}
    >
      {bubble && (
        <span className="scene-bubble" style={{ animationDelay: `${delay * 3}s` }}>
          {bubble}
        </span>
      )}
      <span className="scene-figure">
        <span className="scene-shadow" />
        <Avatar config={config} delay={delay} />
      </span>
      <span className="scene-name">{name}</span>
      <span className="scene-status">{status}</span>
    </button>
  );
}

export default function SocialPivot() {
  const ui = useUI();
  const { state } = useStore();
  const score = useMemo(() => gamerscoreOf(state.unlocked), [state.unlocked]);
  const friends = FRIENDS.filter((f) => !state.removedFriends.includes(f.id));
  const online = friends.filter((f) => ui.presence[f.id]?.presence !== 'offline');
  const featured = [...online, ...friends.filter((f) => !online.includes(f))].slice(0, 3);
  const unread = state.messages.filter((m) => !m.read).length;
  const beacon = state.myBeacon;

  return (
    <div className="grid12">
      <div className="social-scene" style={{ gridArea: '1 / 1 / span 6 / span 6' }}>
        <SceneAvatar
          id="soc-me"
          me
          slot={0}
          config={state.profile.avatar}
          name={state.profile.gamertag}
          status={
            <>
              <GIcon size={18} /> {score.toLocaleString('en-US')}
            </>
          }
          bubble={beacon ? `Beacon: ${GAME_BY_ID[beacon.game]?.title}` : null}
          delay={0}
          onSelect={() => ui.push('profile')}
        />
        {featured.map((f, i) => {
          const pr = ui.presence[f.id];
          return (
            <SceneAvatar
              key={f.id}
              id={`soc-friend-${f.id}`}
              slot={i + 1}
              config={f.avatar}
              name={f.gamertag}
              status={pr.presence === 'offline' ? 'Offline' : pr.activity}
              bubble={f.beacon ? f.beacon.text : pr.presence !== 'offline' ? pr.activity : null}
              delay={i + 1}
              onSelect={() => ui.push('friend', { id: f.id })}
            />
          );
        })}
      </div>
      <Tile id="soc-friends" at={[7, 1, 3, 2]} icon="friends" label="friends" sub={`${online.length} online`} onSelect={() => ui.push('friends')} />
      <Tile
        id="soc-messages"
        at={[10, 1, 3, 2]}
        icon="message"
        label="messages"
        sub={unread ? `${unread} new` : 'No new messages'}
        onSelect={() => ui.push('messages')}
      />
      <Tile id="soc-beacons" at={[7, 3, 3, 2]} icon="beacon" label="beacons & activity" onSelect={() => ui.push('beacons')} />
      <Tile
        id="soc-party"
        at={[10, 3, 3, 2]}
        icon="party"
        label="party"
        sub={ui.party ? `${ui.party.members.length + 1} in party` : 'Start a party'}
        onSelect={() => ui.push('party')}
      />
      <Tile id="soc-achievements" at={[7, 5, 3, 2]} icon="trophy" label="achievements" onSelect={() => ui.push('achievementsAll')} />
      <Tile id="soc-signin" at={[10, 5, 3, 2]} variant="dark" icon="signin" label="sign in or out" onSelect={() => ui.push('signin')} />
    </div>
  );
}

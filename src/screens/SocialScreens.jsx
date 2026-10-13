import { useEffect, useMemo, useState } from 'react';
import { AUTO_REPLIES, FRIENDS, FRIEND_BY_ID } from '../data/social.js';
import { GAMES, GAME_BY_ID } from '../data/games.js';
import { gameProgress, gamerscoreOf, useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';
import { sound } from '../audio/sound.js';
import Avatar from '../components/Avatar.jsx';
import Gamerpic from '../components/Gamerpic.jsx';
import Icon from '../components/Icon.jsx';
import { BoxArt } from '../components/Art.jsx';
import { GIcon, ProgressBar, Row, Screen, Stars, presenceLabel, timeAgo } from '../components/ui.jsx';
import { Empty, InfoPanel } from './common.jsx';

function useFriends() {
  const { state } = useStore();
  const ui = useUI();
  return useMemo(() => {
    const order = { online: 0, busy: 1, away: 2, offline: 3 };
    return FRIENDS.filter((f) => !state.removedFriends.includes(f.id))
      .map((f) => ({ ...f, ...ui.presence[f.id] }))
      .sort((a, b) => order[a.presence] - order[b.presence] || a.gamertag.localeCompare(b.gamertag));
  }, [state.removedFriends, ui.presence]);
}

function statusLine(f) {
  if (f.presence === 'offline' || f.activity === presenceLabel(f.presence)) return f.activity;
  return `${presenceLabel(f.presence)} · ${f.activity}`;
}

function PresenceDot({ p }) {
  return <span className={`presence-dot p-${p}`} aria-label={presenceLabel(p)} />;
}

function FriendRow({ f, id, isDefault, onFocus, onSelect }) {
  return (
    <Row
      id={id}
      isDefault={isDefault}
      onFocus={onFocus}
      onSelect={onSelect}
      className="friend-row"
      label={
        <span className="fr-text">
          <span className="fr-tag">{f.gamertag}</span>
          <span className="fr-status">
            <PresenceDot p={f.presence} />
            {statusLine(f)}
          </span>
        </span>
      }
      icon={null}
    >
      <Gamerpic id={f.gamerpic} avatar={f.avatar} size={52} className="row-pic row-pic-left" />
    </Row>
  );
}

function FriendAside({ f }) {
  if (!f) return null;
  return (
    <aside className="info-panel friend-aside">
      <div className="fa-figure">
        <span className="scene-shadow" />
        <Avatar config={f.avatar} pose="wave" />
      </div>
      <div className="fa-text">
        <h2 className="info-title">{f.gamertag}</h2>
        <div className="fa-score">
          <GIcon size={20} /> {f.gamerscore.toLocaleString('en-US')}
        </div>
        <div className="fa-status">
          <PresenceDot p={f.presence} /> {f.activity}
        </div>
        {f.motto && <p className="fa-motto">“{f.motto}”</p>}
      </div>
    </aside>
  );
}

// ---- Friends list -------------------------------------------------------------
export function Friends({ active, params }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const friends = useFriends();
  const list = params.recent ? [...friends].sort((a, b) => a.id.localeCompare(b.id)).slice(0, 6) : friends;
  const [focusId, setFocusId] = useState(list[0]?.id);
  const focused = list.find((f) => f.id === focusId) || list[0];
  const online = friends.filter((f) => f.presence !== 'offline').length;

  return (
    <Screen
      active={active}
      kicker="social"
      title={params.recent ? 'Recent Players' : 'Friends'}
      hints={[
        { btn: 'a', label: 'View Profile' },
        { btn: 'b', label: 'Back' },
        { btn: 'x', label: 'Send Message' },
        { btn: 'y', label: 'Invite to Party' },
      ]}
      onAction={(action, el) => {
        const id = el?.dataset.navId?.startsWith('fl-') ? el.dataset.navId.slice(3) : null;
        if (!id) return false;
        if (action === 'x') {
          sound.play('select');
          ui.push('compose', { to: id });
          return true;
        }
        if (action === 'y') {
          sound.play('select');
          inviteToParty(ui, FRIEND_BY_ID[id]);
          return true;
        }
        return false;
      }}
    >
      <div className="lib-meta">
        {friends.length} friends · {online} online
      </div>
      <div className="split">
        <div className="menu friend-list" data-scroll="y" data-scroll-pad="20">
          {list.map((f, i) => (
            <FriendRow
              key={f.id}
              f={f}
              id={`fl-${f.id}`}
              isDefault={i === 0}
              onFocus={() => setFocusId(f.id)}
              onSelect={() => ui.push('friend', { id: f.id })}
            />
          ))}
          {state.removedFriends.length > 0 && !params.recent && (
            <Row
              id="fl-restore"
              icon="refresh"
              label={`Restore Removed Friends (${state.removedFriends.length})`}
              onSelect={() => {
                actions.restoreFriends();
                ui.notify({ kind: 'info', title: 'Friends restored', icon: 'friends', force: true });
              }}
            />
          )}
          {list.length === 0 && <div className="menu-empty">No friends yet.</div>}
        </div>
        <FriendAside f={focused} />
      </div>
    </Screen>
  );
}

// ---- Party ------------------------------------------------------------------
export function inviteToParty(ui, f) {
  if (!f) return;
  const party = ui.party || { members: [], invited: [] };
  if (party.members.includes(f.id)) {
    ui.notify({ kind: 'info', title: `${f.gamertag} is already in your party`, icon: 'party', force: true });
    return;
  }
  if (!ui.party) ui.setParty({ members: [], invited: [f.id] });
  else ui.setParty((p) => ({ ...p, invited: [...new Set([...(p.invited || []), f.id])] }));
  ui.notify({ kind: 'info', title: 'Party invitation sent', text: f.gamertag, icon: 'party', force: true });
  const online = ui.presence[f.id]?.presence !== 'offline';
  setTimeout(() => {
    ui.setParty((p) => {
      if (!p) return p;
      const invited = (p.invited || []).filter((x) => x !== f.id);
      return online ? { ...p, invited, members: [...new Set([...p.members, f.id])] } : { ...p, invited };
    });
    ui.notify({
      kind: 'friend',
      friend: f.id,
      title: online ? `${f.gamertag} joined your party` : `${f.gamertag} didn't respond`,
      text: online ? 'Party chat' : 'They appear to be offline',
      force: true,
    });
  }, 3200);
}

export function Party({ active }) {
  const ui = useUI();
  const { state } = useStore();
  const party = ui.party;
  const members = party ? party.members.map((id) => FRIEND_BY_ID[id]) : [];

  const leave = async () => {
    const ok = await ui.confirm({
      title: 'Leave Party',
      message: 'Leave this party? Everyone else will stay in it.',
      confirmLabel: 'Leave Party',
      cancelLabel: 'Cancel',
    });
    if (ok) {
      ui.setParty(null);
      ui.notify({ kind: 'info', title: 'You left the party', icon: 'party', force: true });
    }
  };

  return (
    <Screen active={active} kicker="social" title="Party">
      <div className="split">
        <div className="menu">
          {!party ? (
            <Row
              id="party-start"
              icon="party"
              label="Start a Party"
              isDefault
              onSelect={() => {
                ui.setParty({ members: [], invited: [] });
                ui.notify({ kind: 'info', title: 'Party started', text: 'Invite friends to chat', icon: 'party', force: true });
              }}
            />
          ) : (
            <>
              <Row
                id="party-invite"
                icon="plus"
                label="Invite Friends"
                isDefault
                onSelect={() => ui.push('pickFriend', { title: 'Invite to Party', onPick: (id) => inviteToParty(ui, FRIEND_BY_ID[id]) })}
              />
              <Row
                id="party-chat"
                icon="mic"
                label="Party Chat"
                value="Headset not connected"
                onSelect={() =>
                  ui.notify({ kind: 'info', title: 'No headset detected', text: 'Party chat is simulated', icon: 'party', force: true })
                }
              />
              {members.map((f) => (
                <Row key={f.id} id={`party-${f.id}`} label={f.gamertag} value="In party" onSelect={() => ui.push('friend', { id: f.id })}>
                  <Gamerpic id={f.gamerpic} avatar={f.avatar} size={44} className="row-pic row-pic-left" />
                </Row>
              ))}
              <Row id="party-leave" icon="signin" label="Leave Party" onSelect={leave} />
            </>
          )}
        </div>
        <InfoPanel icon="party" title={party ? `${members.length + 1} in party` : 'No party'}>
          <div className="party-members">
            {party && (
              <div className="pm">
                <Gamerpic id={state.profile.gamerpic} avatar={state.profile.avatar} size={64} />
                <span>{state.profile.gamertag} (you)</span>
              </div>
            )}
            {members.map((f) => (
              <div className="pm" key={f.id}>
                <Gamerpic id={f.gamerpic} avatar={f.avatar} size={64} />
                <span>{f.gamertag}</span>
              </div>
            ))}
            {party && (party.invited || []).length > 0 && <p className="info-dim">Waiting for {party.invited.length} invited friend(s)…</p>}
            {!party && <p>Start a party to chat with up to 8 friends across games and apps.</p>}
          </div>
        </InfoPanel>
      </div>
    </Screen>
  );
}

// ---- Friend profile -------------------------------------------------------
function friendProgress(friend, gameId) {
  const g = GAME_BY_ID[gameId];
  let h = 0;
  for (const ch of friend.id + gameId) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  const ratio = friend.games.includes(gameId) ? 0.25 + (h % 70) / 100 : 0;
  return Math.round((g.total * ratio) / 5) * 5;
}

export function FriendProfile({ active, params }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const base = FRIEND_BY_ID[params.id];
  const f = { ...base, ...ui.presence[base.id] };
  const removed = state.removedFriends.includes(f.id);

  const remove = async () => {
    const ok = await ui.confirm({
      title: 'Remove Friend',
      message: `Remove ${f.gamertag} from your friends list?`,
      confirmLabel: 'Remove',
      cancelLabel: 'Cancel',
    });
    if (ok) {
      actions.removeFriend(f.id);
      ui.notify({ kind: 'info', title: 'Friend removed', text: f.gamertag, icon: 'friends', force: true });
      ui.pop();
    }
  };

  return (
    <Screen active={active} kicker="profile" title={f.gamertag}>
      <div className="profile-layout">
        <div className="profile-figure">
          <span className="scene-shadow" />
          <Avatar config={f.avatar} pose="wave" />
        </div>
        <div className="profile-card">
          <div className="pc-head">
            <Gamerpic id={f.gamerpic} avatar={f.avatar} size={112} />
            <div>
              <div className="pc-big-tag">{f.gamertag}</div>
              <div className="pc-line">
                <GIcon size={20} /> {f.gamerscore.toLocaleString('en-US')}
              </div>
              <div className="pc-line">
                <PresenceDot p={f.presence} /> {statusLine(f)}
              </div>
            </div>
          </div>
          <dl className="facts">
            <dt>Motto</dt>
            <dd>{f.motto || '—'}</dd>
            <dt>Reputation</dt>
            <dd>
              <Stars value={f.rep} />
            </dd>
            <dt>Zone</dt>
            <dd>{f.zone}</dd>
            <dt>Location</dt>
            <dd>{f.location || '—'}</dd>
            <dt>Membership</dt>
            <dd>{f.tier === 'gold' ? 'Xbox LIVE Gold' : 'Xbox LIVE Free'}</dd>
            <dt>Bio</dt>
            <dd>{f.bio || '—'}</dd>
          </dl>
        </div>
        <div className="menu profile-actions">
          <Row id="fp-msg" icon="message" label="Send Message" isDefault onSelect={() => ui.push('compose', { to: f.id })} />
          <Row id="fp-party" icon="party" label="Invite to Party" onSelect={() => inviteToParty(ui, f)} />
          <Row id="fp-compare" icon="compare" label="Compare Games" onSelect={() => ui.push('compare', { id: f.id })} />
          {f.beacon && (
            <Row
              id="fp-beacon"
              icon="beacon"
              label="View Beacon"
              value={GAME_BY_ID[f.beacon.game].short}
              onSelect={() => ui.notify({ kind: 'friend', friend: f.id, title: `${f.gamertag}'s beacon`, text: f.beacon.text, force: true })}
            />
          )}
          {f.presence === 'online' && f.activity.startsWith('Playing') && (
            <Row
              id="fp-join"
              icon="controller"
              label="Join Game"
              onSelect={() => {
                const g = GAMES.find((x) => f.activity.includes(x.title));
                if (g) ui.push('game', { id: g.id });
              }}
            />
          )}
          {!removed && <Row id="fp-remove" icon="trash" label="Remove Friend" onSelect={remove} />}
        </div>
      </div>
    </Screen>
  );
}

export function Compare({ active, params }) {
  const ui = useUI();
  const { state } = useStore();
  const f = FRIEND_BY_ID[params.id];
  const rows = GAMES.map((g) => ({ g, mine: gameProgress(state.unlocked, g.id).earned, theirs: friendProgress(f, g.id) })).filter(
    (r) => r.mine || r.theirs,
  );
  return (
    <Screen active={active} kicker={`you vs ${f.gamertag}`} title="Compare Games">
      <div className="compare-head">
        <span>Game</span>
        <span className="cmp-who">
          <Gamerpic id={state.profile.gamerpic} avatar={state.profile.avatar} size={40} /> You
        </span>
        <span className="cmp-who">
          <Gamerpic id={f.gamerpic} avatar={f.avatar} size={40} /> {f.gamertag}
        </span>
      </div>
      <div className="compare-list" data-scroll="y" data-scroll-pad="16">
        {rows.map(({ g, mine, theirs }, i) => (
          <button
            key={g.id}
            type="button"
            tabIndex={-1}
            data-nav=""
            data-nav-id={`cmp-${g.id}`}
            data-nav-default={i === 0 ? '' : undefined}
            className="cmp-row"
            onClick={() => {
              sound.play('select');
              ui.push('achievements', { id: g.id });
            }}
          >
            <BoxArt game={g} showTitle={false} className="gp-art" />
            <span className="gp-title">{g.title}</span>
            <span className={`cmp-val ${mine >= theirs ? 'is-lead' : ''}`}>
              <GIcon size={16} /> {mine}
              <ProgressBar value={mine} max={g.total} />
            </span>
            <span className={`cmp-val ${theirs > mine ? 'is-lead' : ''}`}>
              <GIcon size={16} /> {theirs}
              <ProgressBar value={theirs} max={g.total} />
            </span>
          </button>
        ))}
      </div>
    </Screen>
  );
}

// ---- My profile ---------------------------------------------------------------
export function MyProfile({ active }) {
  const ui = useUI();
  const { state } = useStore();
  const p = state.profile;
  const score = gamerscoreOf(state.unlocked);
  return (
    <Screen active={active} kicker="profile" title="My Profile">
      <div className="profile-layout">
        <div className="profile-figure">
          <span className="scene-shadow" />
          <Avatar config={p.avatar} pose="wave" />
        </div>
        <div className="profile-card">
          <div className="pc-head">
            <Gamerpic id={p.gamerpic} avatar={p.avatar} size={112} />
            <div>
              <div className="pc-big-tag">{p.gamertag}</div>
              <div className="pc-line">
                <GIcon size={20} /> {score.toLocaleString('en-US')}
              </div>
              <div className="pc-line">
                Xbox LIVE {p.tier === 'gold' ? 'Gold' : 'Free'} · since {p.memberSince}
              </div>
            </div>
          </div>
          <dl className="facts">
            <dt>Name</dt>
            <dd>{p.name || '—'}</dd>
            <dt>Motto</dt>
            <dd>{p.motto || '—'}</dd>
            <dt>Reputation</dt>
            <dd>
              <Stars value={p.rep} />
            </dd>
            <dt>Zone</dt>
            <dd>{p.zone}</dd>
            <dt>Location</dt>
            <dd>{p.location || '—'}</dd>
            <dt>Bio</dt>
            <dd>{p.bio || '—'}</dd>
          </dl>
        </div>
        <div className="menu profile-actions">
          <Row id="mp-edit" icon="person" label="Edit Profile" isDefault onSelect={() => ui.push('settings.profile')} />
          <Row id="mp-avatar" icon="avatar" label="Change Avatar" onSelect={() => ui.push('avatar')} />
          <Row id="mp-pic" icon="photo" label="Change Gamer Picture" onSelect={() => ui.push('gamerpic')} />
          <Row id="mp-ach" icon="trophy" label="Achievements" onSelect={() => ui.push('achievementsAll')} />
          <Row id="mp-beacon" icon="beacon" label="Beacons & Activity" onSelect={() => ui.push('beacons')} />
        </div>
      </div>
    </Screen>
  );
}

// ---- Messages -----------------------------------------------------------------
function senderOf(m) {
  if (m.from === 'system') return { name: 'Xbox LIVE', pic: 'orb' };
  if (m.from === 'me') return { name: 'You', pic: 'orb' };
  const f = FRIEND_BY_ID[m.from];
  return { name: f.gamertag, pic: f.gamerpic, avatar: f.avatar, friend: f };
}

const KIND_LABEL = { text: 'Message', voice: 'Voice Message', invite: 'Game Invite', friend: 'Friend Request' };

export function Messages({ active }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const msgs = state.messages;
  const [focusId, setFocusId] = useState(msgs[0]?.id);
  const current = msgs.find((m) => m.id === focusId) || msgs[0];

  const del = async (id) => {
    const ok = await ui.confirm({ title: 'Delete Message', message: 'Delete this message?', confirmLabel: 'Delete', cancelLabel: 'Cancel' });
    if (ok) {
      actions.deleteMessage(id);
      ui.notify({ kind: 'info', title: 'Message deleted', icon: 'trash', force: true });
    }
  };

  return (
    <Screen
      active={active}
      kicker="social"
      title="Messages"
      hints={[
        { btn: 'a', label: 'Open' },
        { btn: 'b', label: 'Back' },
        { btn: 'x', label: 'Delete' },
        { btn: 'y', label: 'Create Message' },
      ]}
      onAction={(action, el) => {
        if (action === 'y') {
          sound.play('select');
          ui.push('compose', {});
          return true;
        }
        const id = el?.dataset.navId?.startsWith('msg-') ? el.dataset.navId.slice(4) : null;
        if (action === 'x' && id) {
          del(id);
          return true;
        }
        return false;
      }}
    >
      <div className="lib-meta">
        {msgs.length} messages · {msgs.filter((m) => !m.read).length} unread
      </div>
      <div className="split">
        <div className="menu msg-list" data-scroll="y" data-scroll-pad="20">
          <Row id="msg-new" icon="plus" label="Create Message" onSelect={() => ui.push('compose', {})} />
          {msgs.map((m, i) => {
            const s = senderOf(m);
            return (
              <Row
                key={m.id}
                id={`msg-${m.id}`}
                isDefault={i === 0}
                className={`msg-row ${m.read ? '' : 'is-unread'}`}
                onFocus={() => setFocusId(m.id)}
                onSelect={() => {
                  actions.readMessage(m.id);
                  ui.push('message', { id: m.id });
                }}
                label={
                  <span className="fr-text">
                    <span className="fr-tag">{s.name}</span>
                    <span className="fr-status">
                      {KIND_LABEL[m.kind]} · {timeAgo(m.at)}
                    </span>
                  </span>
                }
                right={!m.read ? <span className="unread-dot" aria-label="unread" /> : null}
              >
                <Gamerpic id={s.pic} avatar={s.avatar} size={52} className="row-pic row-pic-left" />
              </Row>
            );
          })}
        </div>
        {current ? (
          <InfoPanel title={senderOf(current).name} className="msg-preview">
            <p className="info-dim">
              {KIND_LABEL[current.kind]} · {timeAgo(current.at)}
            </p>
            {current.subject && <p className="msg-subject">{current.subject}</p>}
            <p className="msg-body">{current.body}</p>
          </InfoPanel>
        ) : (
          <Empty icon="message" title="No messages" text="Press Y to create one." />
        )}
      </div>
    </Screen>
  );
}

export function Message({ active, params }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const m = state.messages.find((x) => x.id === params.id);
  useEffect(() => {
    if (m && !m.read) actions.readMessage(m.id);
  }, [m, actions]);
  if (!m) {
    return (
      <Screen active={active} kicker="messages" title="Message">
        <Empty icon="message" title="This message was deleted" />
      </Screen>
    );
  }
  const s = senderOf(m);
  const del = async () => {
    const ok = await ui.confirm({ title: 'Delete Message', message: 'Delete this message?', confirmLabel: 'Delete', cancelLabel: 'Cancel' });
    if (ok) {
      ui.pop();
      actions.deleteMessage(m.id);
      ui.notify({ kind: 'info', title: 'Message deleted', icon: 'trash', force: true });
    }
  };
  return (
    <Screen active={active} kicker="messages" title={KIND_LABEL[m.kind]}>
      <div className="split">
        <div className="message-card">
          <div className="pc-head">
            <Gamerpic id={s.pic} avatar={s.avatar} size={96} />
            <div>
              <div className="pc-big-tag">{s.name}</div>
              <div className="pc-line">{timeAgo(m.at)}</div>
            </div>
          </div>
          {m.subject && <p className="msg-subject">{m.subject}</p>}
          <p className="msg-body msg-body-lg">{m.body}</p>
        </div>
        <div className="menu">
          {s.friend && <Row id="mv-reply" icon="reply" label="Reply" isDefault onSelect={() => ui.push('compose', { to: s.friend.id })} />}
          {m.kind === 'invite' && <Row id="mv-join" icon="controller" label="Join Game" onSelect={() => ui.push('game', { id: m.game })} />}
          {s.friend && <Row id="mv-profile" icon="person" label="View Profile" onSelect={() => ui.push('friend', { id: s.friend.id })} />}
          <Row id="mv-delete" icon="trash" label="Delete" isDefault={!s.friend} onSelect={del} />
        </div>
      </div>
    </Screen>
  );
}

export function Compose({ active, params }) {
  const ui = useUI();
  const { actions } = useStore();
  const [to, setTo] = useState(params.to || null);
  const [text, setText] = useState('');
  const friend = to ? FRIEND_BY_ID[to] : null;

  const editText = async () => {
    const v = await ui.keyboard({ title: 'Message', value: text, maxLength: 250 });
    if (v !== null) setText(v);
  };
  const send = () => {
    if (!friend) {
      sound.play('error');
      ui.notify({ kind: 'info', title: 'Choose a recipient first', icon: 'person', force: true });
      return;
    }
    if (!text.trim()) {
      sound.play('error');
      ui.notify({ kind: 'info', title: 'Your message is empty', icon: 'message', force: true });
      return;
    }
    ui.pop();
    ui.notify({ kind: 'info', icon: 'message', title: 'Message sent', text: `To ${friend.gamertag}`, force: true });
    const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
    setTimeout(() => {
      actions.addMessage({ id: `m${Date.now()}`, from: friend.id, at: Date.now(), read: false, kind: 'text', body: reply });
      ui.notify({ kind: 'friend', friend: friend.id, title: `New message from ${friend.gamertag}`, text: reply });
    }, 7000);
  };

  return (
    <Screen active={active} kicker="messages" title="Create Message">
      <div className="split">
        <div className="menu">
          <Row
            id="cm-to"
            icon="person"
            label="To"
            value={friend ? friend.gamertag : 'Choose a friend'}
            isDefault={!friend}
            onSelect={() => ui.push('pickFriend', { title: 'Send To', onPick: (id) => setTo(id) })}
          />
          <Row
            id="cm-text"
            icon="message"
            label="Message"
            value={text ? `${text.slice(0, 22)}${text.length > 22 ? '…' : ''}` : 'Add text'}
            isDefault={!!friend}
            onSelect={editText}
          />
          <Row id="cm-send" icon="check" label="Send" onSelect={send} />
          <Row id="cm-cancel" icon="trash" label="Discard" onSelect={() => ui.pop()} snd="back" />
        </div>
        <InfoPanel title={friend ? `To: ${friend.gamertag}` : 'New message'} className="msg-preview">
          <p className="msg-body msg-body-lg">{text || <span className="info-dim">Your message will appear here.</span>}</p>
        </InfoPanel>
      </div>
    </Screen>
  );
}

// ---- Pickers ---------------------------------------------------------------
export function PickFriend({ active, params }) {
  const ui = useUI();
  const friends = useFriends().filter((f) => !params.onlineOnly || f.presence !== 'offline');
  return (
    <Screen active={active} kicker="choose a friend" title={params.title || 'Friends'}>
      {friends.length === 0 ? (
        <Empty icon="friends" title="Nobody is online" text="Try again later." />
      ) : (
        <div className="menu friend-list wide-list" data-scroll="y" data-scroll-pad="20">
          {friends.map((f, i) => (
            <FriendRow
              key={f.id}
              f={f}
              id={`pf-${f.id}`}
              isDefault={i === 0}
              onSelect={() => {
                ui.pop();
                params.onPick(f.id);
              }}
            />
          ))}
        </div>
      )}
    </Screen>
  );
}

export function PickGame({ active, params }) {
  const ui = useUI();
  return (
    <Screen active={active} kicker="choose a game" title={params.title || 'Games'}>
      <div className="menu wide-list" data-scroll="y" data-scroll-pad="20">
        {GAMES.map((g, i) => (
          <Row
            key={g.id}
            id={`pg-${g.id}`}
            label={g.title}
            value={g.genre}
            isDefault={i === 0}
            onSelect={() => {
              ui.pop();
              params.onPick(g.id);
            }}
          >
            <BoxArt game={g} showTitle={false} className="row-box" />
          </Row>
        ))}
      </div>
    </Screen>
  );
}

// ---- Beacons & activity -----------------------------------------------------
const ACTIVITY = [
  ['f03', 'unlocked “Completionist”', 'g07', 2],
  ['f01', 'set a beacon', 'g03', 3],
  ['f05', 'earned 150G', 'g01', 5],
  ['f10', 'started playing', 'g05', 8],
  ['f02', 'unlocked “Explorer”', 'g09', 20],
  ['f07', 'beat a friend’s score', 'g03', 26],
];

export function Beacons({ active }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const friends = useFriends();
  const withBeacons = friends.filter((f) => f.beacon);
  const mine = state.myBeacon;

  const setBeacon = () =>
    ui.push('pickGame', {
      title: 'Set a Beacon',
      onPick: async (gameId) => {
        const text = await ui.keyboard({ title: `Beacon message for ${GAME_BY_ID[gameId].title}`, value: 'Anyone want to play?', maxLength: 60 });
        if (text === null) return;
        actions.setBeacon({ game: gameId, text: text || 'Anyone want to play?', at: Date.now() });
        ui.notify({ kind: 'info', title: 'Beacon set', text: GAME_BY_ID[gameId].title, icon: 'beacon', force: true });
      },
    });

  const manage = async () => {
    const choice = await ui.confirm({
      title: 'Your Beacon',
      message: `${GAME_BY_ID[mine.game].title}: “${mine.text}”`,
      options: [
        { label: 'Change Beacon', value: 'change' },
        { label: 'Clear Beacon', value: 'clear' },
        { label: 'Cancel', value: null },
      ],
    });
    if (choice === 'change') setBeacon();
    if (choice === 'clear') {
      actions.setBeacon(null);
      ui.notify({ kind: 'info', title: 'Beacon cleared', icon: 'beacon', force: true });
    }
  };

  return (
    <Screen active={active} kicker="social" title="Beacons & Activity">
      <div className="split">
        <div className="menu" data-scroll="y" data-scroll-pad="20">
          <div className="menu-section">your beacon</div>
          {mine ? (
            <Row id="bc-mine" icon="beacon" label={GAME_BY_ID[mine.game].title} value={`“${mine.text}”`} isDefault onSelect={manage} />
          ) : (
            <Row id="bc-set" icon="plus" label="Set a Beacon" isDefault onSelect={setBeacon} />
          )}
          <div className="menu-section">friends' beacons</div>
          {withBeacons.map((f) => (
            <Row
              key={f.id}
              id={`bc-${f.id}`}
              label={f.gamertag}
              value={GAME_BY_ID[f.beacon.game].short}
              onSelect={() => ui.push('friend', { id: f.id })}
            >
              <Gamerpic id={f.gamerpic} avatar={f.avatar} size={44} className="row-pic row-pic-left" />
            </Row>
          ))}
          <div className="menu-section">recent activity</div>
          {ACTIVITY.filter(([fid]) => !state.removedFriends.includes(fid)).map(([fid, what, gid, hours]) => {
            const f = FRIEND_BY_ID[fid];
            return (
              <Row
                key={fid + what}
                id={`act-${fid}-${gid}`}
                label={`${f.gamertag} ${what}`}
                value={`${hours}h ago`}
                onSelect={() => ui.push('game', { id: gid })}
              >
                <Gamerpic id={f.gamerpic} avatar={f.avatar} size={44} className="row-pic row-pic-left" />
              </Row>
            );
          })}
        </div>
        <InfoPanel icon="beacon" title="Beacons">
          <p>
            Beacons let friends know which game you want to play. They appear above your avatar on the social channel and in your friends' activity
            feeds.
          </p>
          {withBeacons.map((f) => (
            <p key={f.id} className="beacon-quote">
              <strong>{f.gamertag}</strong> · {GAME_BY_ID[f.beacon.game].title}
              <br />“{f.beacon.text}”
            </p>
          ))}
        </InfoPanel>
      </div>
    </Screen>
  );
}

// ---- Sign in or out -------------------------------------------------------
export function SignInOut({ active }) {
  const ui = useUI();
  const { state, actions } = useStore();
  const p = state.profile;
  const signOut = async () => {
    const ok = await ui.confirm({ title: 'Sign Out', message: `Sign out ${p.gamertag}?`, confirmLabel: 'Sign Out', cancelLabel: 'Cancel' });
    if (ok) {
      actions.setSignedIn(false);
      ui.notify({ kind: 'info', title: `${p.gamertag} signed out`, icon: 'signin', force: true });
    }
  };
  const signIn = () => {
    actions.setSignedIn(true);
    ui.notify({ kind: 'signin', title: `${p.gamertag} signed in`, text: 'Welcome to Xbox LIVE', force: true });
    ui.pop();
  };
  return (
    <Screen active={active} kicker="social" title={state.signedIn ? 'Sign In or Out' : 'Sign In'}>
      <div className="signin">
        <button
          type="button"
          tabIndex={-1}
          data-nav=""
          data-nav-id="si-profile"
          data-nav-default=""
          className={`signin-card ${state.signedIn ? 'is-in' : ''}`}
          onClick={() => {
            sound.play('select');
            if (state.signedIn) signOut();
            else signIn();
          }}
        >
          <Gamerpic id={p.gamerpic} avatar={p.avatar} size={180} />
          <span className="signin-tag">{p.gamertag}</span>
          <span className="signin-state">{state.signedIn ? 'Signed in · select to sign out' : 'Select to sign in'}</span>
        </button>
        <div className="menu">
          {state.signedIn ? (
            <Row id="si-out" icon="signin" label="Sign Out" onSelect={signOut} />
          ) : (
            <Row id="si-in" icon="signin" label="Sign In" onSelect={signIn} />
          )}
          <Row
            id="si-auto"
            icon="refresh"
            label="Automatic Sign-In"
            value={state.settings.autoSignIn ? 'On' : 'Off'}
            onSelect={() => actions.updateSettings({ autoSignIn: !state.settings.autoSignIn })}
            snd="toggle"
          />
          <Row id="si-settings" icon="person" label="Profile Settings" onSelect={() => ui.push('settings.profile')} />
        </div>
      </div>
      <p className="signin-note">
        <Icon name="info" size={26} /> Only one local profile exists in this recreation. Signing out keeps all of your saved data.
      </p>
    </Screen>
  );
}

import { useEffect, useState } from 'react';
import { Tile } from '../components/ui.jsx';
import { AppIcon, BoxArt, PlaceholderArt } from '../components/Art.jsx';
import Avatar from '../components/Avatar.jsx';
import { OFFER_BY_ID, SPOTLIGHT } from '../data/catalog.js';
import { useStore } from '../state/store.jsx';
import { useUI } from '../state/ui.jsx';
import { openContent, parseKey } from '../state/content.js';

export function openSpotlight(ui, target) {
  if (target.type === 'offer') ui.push('offer', { id: target.id });
  else ui.push('marketplace', { category: target.category });
}

export function SpotlightTile({ id, at, slides = SPOTLIGHT, active }) {
  const ui = useUI();
  const { state } = useStore();
  const [i, setI] = useState(0);
  const autoplay = state.settings.spotlightAutoplay;
  useEffect(() => {
    if (!autoplay || !active) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [autoplay, active, slides.length]);
  const slide = slides[i];
  return (
    <Tile id={id} at={at} variant="art" className="tile-spotlight" onSelect={() => openSpotlight(ui, slide.target)} ariaLabel={slide.title}>
      {slides.map((s, n) => (
        <span key={s.id} className={`spot-slide ${n === i ? 'is-on' : ''}`}>
          <PlaceholderArt hue={s.hue} motif={s.motif} />
        </span>
      ))}
      <span className="spot-caption">
        <span className="spot-kicker">spotlight</span>
        <span className="spot-title">{slide.title}</span>
        <span className="spot-sub">{slide.sub}</span>
      </span>
      <span className="spot-dots">
        {slides.map((s, n) => (
          <span key={s.id} className={n === i ? 'on' : ''} />
        ))}
      </span>
    </Tile>
  );
}

function PromoTile({ id, at, offerId, label }) {
  const ui = useUI();
  const offer = OFFER_BY_ID[offerId];
  return (
    <Tile id={id} at={at} variant="art" onSelect={() => ui.push('offer', { id: offerId })} ariaLabel={offer.title}>
      <PlaceholderArt hue={offer.hue} motif={offer.motif} />
      <span className="art-label">{label || offer.title}</span>
    </Tile>
  );
}

export default function HomePivot({ active }) {
  const ui = useUI();
  const { state } = useStore();
  const lastKey = state.recent[0] || 'game:g01';
  const last = parseKey(lastKey);
  const pinCount = state.pins.length;

  return (
    <div className="grid12">
      <Tile
        id="home-hero"
        at={[1, 1, 4, 4]}
        variant="art"
        className="tile-hero"
        isDefault
        onSelect={() => openContent(ui, lastKey)}
        ariaLabel={last.item?.title}
      >
        {last.type === 'game' ? (
          <>
            <PlaceholderArt hue={last.item.hue} motif={last.item.motif} className="hero-bg" />
            <BoxArt game={last.item} className="hero-box" />
          </>
        ) : (
          <span className="hero-app" style={{ background: last.item?.color }}>
            <AppIcon app={last.item} size={150} />
          </span>
        )}
        <span className="hero-info">
          <span className="hero-kicker">{last.type === 'game' ? 'play' : 'launch'}</span>
          <span className="hero-title">{last.item?.title}</span>
        </span>
      </Tile>
      <Tile id="home-recent" at={[1, 5, 2, 2]} icon="clock" label="recent" onSelect={() => ui.push('recent')} />
      <Tile id="home-pins" at={[3, 5, 2, 2]} icon="pin" label="pins" sub={`${pinCount} pinned`} onSelect={() => ui.push('pins')} />

      <SpotlightTile id="home-spotlight" at={[5, 1, 4, 4]} active={active} />
      <Tile id="home-gold" at={[5, 5, 2, 2]} variant="gold" icon="gold" label="Xbox LIVE Gold" onSelect={() => ui.push('gold')} />
      <Tile id="home-market" at={[7, 5, 2, 2]} icon="bag" label="marketplace" onSelect={() => ui.push('marketplace', { category: 'games' })} />

      <PromoTile id="home-promo-1" at={[9, 1, 2, 2]} offerId="arcade-02" />
      <PromoTile id="home-promo-2" at={[11, 1, 2, 2]} offerId="addons-03" />
      <PromoTile id="home-promo-3" at={[9, 3, 2, 2]} offerId="demos-01" />
      <PromoTile id="home-promo-4" at={[11, 3, 2, 2]} offerId="themes-04" />
      <Tile
        id="home-avatar"
        at={[9, 5, 4, 2]}
        variant="avatar"
        onSelect={() => ui.push('marketplace', { category: 'avatar' })}
        ariaLabel="avatar marketplace"
      >
        <span className="avatar-strip">
          <Avatar config={state.profile.avatar} delay={0.4} />
        </span>
        <span className="tile-label">avatar marketplace</span>
        <span className="tile-sub">New items every week</span>
      </Tile>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { sound } from '../audio/sound.js';
import { useLayer, useNav } from '../nav/NavProvider.jsx';
import { useUI } from '../state/ui.jsx';
import Icon from './Icon.jsx';

// ---- Tile -----------------------------------------------------------------
// `at` = [column, row, colSpan, rowSpan] on the 12x6 dashboard grid.
export function Tile({
  id,
  at,
  variant = 'green',
  icon,
  label,
  sub,
  children,
  onSelect,
  snd = 'select',
  className = '',
  style,
  isDefault,
  badge,
  ariaLabel,
}) {
  const gridArea = at ? `${at[1]} / ${at[0]} / span ${at[3]} / span ${at[2]}` : undefined;
  return (
    <button
      type="button"
      tabIndex={-1}
      data-nav=""
      data-nav-id={id}
      data-nav-default={isDefault ? '' : undefined}
      data-tile=""
      data-anim=""
      aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
      className={`tile tile-${variant} ${className}`}
      style={{ gridArea, ...style }}
      onClick={(e) => {
        if (snd) sound.play(snd);
        if (onSelect) onSelect(e);
      }}
    >
      <span className="tile-face">
        {children}
        {!children && icon && <Icon name={icon} size={76} className="tile-icon" strokeWidth={2.2} />}
        {label && <span className="tile-label">{label}</span>}
        {sub && <span className="tile-sub">{sub}</span>}
      </span>
      {badge != null && badge !== 0 && <span className="tile-badge">{badge}</span>}
    </button>
  );
}

// ---- Menu rows ---------------------------------------------------------------
export function Row({ id, label, value, icon, onSelect, onFocus, isDefault, snd = 'select', className = '', adjust, children, disabled, right }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!adjust) return undefined;
    const el = ref.current;
    const h = (e) => adjust(e.detail);
    el.addEventListener('nav-adjust', h);
    return () => el.removeEventListener('nav-adjust', h);
  }, [adjust]);
  return (
    <button
      ref={ref}
      type="button"
      tabIndex={-1}
      data-nav=""
      data-nav-id={id}
      data-nav-default={isDefault ? '' : undefined}
      data-adjust={adjust ? '' : undefined}
      aria-disabled={disabled || undefined}
      className={`row ${disabled ? 'is-disabled' : ''} ${className}`}
      onFocus={onFocus}
      onClick={(e) => {
        if (disabled) {
          sound.play('error');
          return;
        }
        if (snd) sound.play(snd);
        if (onSelect) onSelect(e);
      }}
    >
      {icon && <Icon name={icon} size={36} className="row-icon" />}
      <span className="row-label">{label}</span>
      {children}
      {value != null && <span className="row-value">{value}</span>}
      {right}
    </button>
  );
}

export function ToggleRow({ id, label, value, onChange, onFocus, isDefault, onText = 'On', offText = 'Off' }) {
  const flip = () => onChange(!value);
  return (
    <Row
      id={id}
      label={label}
      onFocus={onFocus}
      isDefault={isDefault}
      snd="toggle"
      onSelect={flip}
      adjust={() => {
        sound.play('toggle');
        flip();
      }}
      right={
        <span className={`switch ${value ? 'is-on' : ''}`}>
          <span className="switch-text">{value ? onText : offText}</span>
          <span className="switch-track">
            <span className="switch-knob" />
          </span>
        </span>
      }
    />
  );
}

export function OptionRow({ id, label, value, options, onChange, onFocus, isDefault }) {
  const idx = Math.max(
    0,
    options.findIndex((o) => (o.value ?? o) === value),
  );
  const opt = options[idx];
  const step = (d) => {
    const next = options[(idx + d + options.length) % options.length];
    onChange(next.value ?? next);
  };
  return (
    <Row
      id={id}
      label={label}
      onFocus={onFocus}
      isDefault={isDefault}
      snd="toggle"
      onSelect={() => step(1)}
      adjust={(d) => {
        sound.play('move');
        step(d);
      }}
      right={
        <span className="option">
          <span className="option-arrow" aria-hidden="true">
            ‹
          </span>
          <span className="option-value">{opt ? (opt.label ?? opt) : ''}</span>
          <span className="option-arrow" aria-hidden="true">
            ›
          </span>
        </span>
      }
    />
  );
}

export function SliderRow({ id, label, value, min = 0, max = 100, step = 5, onChange, onFocus, isDefault, format }) {
  const clamp = (v) => Math.max(min, Math.min(max, v));
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <Row
      id={id}
      label={label}
      onFocus={onFocus}
      isDefault={isDefault}
      snd="toggle"
      onSelect={() => onChange(value >= max ? min : clamp(value + step))}
      adjust={(d) => {
        const v = clamp(value + d * step);
        if (v !== value) {
          sound.play('move');
          onChange(v);
        }
      }}
      right={
        <span className="slider">
          <span className="slider-track">
            <span className="slider-fill" style={{ width: `${pct}%` }} />
          </span>
          <span className="slider-value">{format ? format(value) : value}</span>
        </span>
      }
    />
  );
}

// ---- Controller button glyphs + hint bar ------------------------------------
export function Btn({ b }) {
  return <span className={`btn-glyph btn-${b}`}>{b === 'lb' ? 'LB' : b === 'rb' ? 'RB' : b.toUpperCase()}</span>;
}

export function ButtonHints({ hints }) {
  const nav = useNav();
  if (!hints || !hints.length) return null;
  return (
    <div className="hints">
      {hints.map((h) => (
        <button
          key={h.btn + h.label}
          type="button"
          tabIndex={-1}
          className="hint"
          onClick={() => {
            sound.unlock();
            nav.dispatch(h.btn);
          }}
        >
          <Btn b={h.btn} />
          <span>{h.label}</span>
        </button>
      ))}
    </div>
  );
}

const DEFAULT_HINTS = [
  { btn: 'a', label: 'Select' },
  { btn: 'b', label: 'Back' },
];

// ---- Screen shell -------------------------------------------------------
export function Screen({ active, title, kicker, hints = DEFAULT_HINTS, onAction, onBack, onEdge, initialFocus, className = '', children }) {
  const ui = useUI();
  const { ref } = useLayer({
    priority: 10,
    enabled: active,
    onAction,
    onEdge,
    initialFocus,
    onBack: onBack || (() => ui.pop()),
  });
  return (
    <section ref={ref} className={`screen ${className}`}>
      <header className="screen-head">
        {kicker && <div className="screen-kicker">{kicker}</div>}
        <h1 className="screen-title">{title}</h1>
      </header>
      <div className="screen-body">{children}</div>
      <ButtonHints hints={hints} />
    </section>
  );
}

// Gamerscore "G" glyph.
export function GIcon({ size = 22 }) {
  return (
    <svg className="g-icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <text
        x="12"
        y="17.2"
        textAnchor="middle"
        fontSize="15.5"
        fontWeight="800"
        fill="currentColor"
        fontFamily="Segoe UI, Open Sans, Arial, sans-serif"
      >
        G
      </text>
    </svg>
  );
}

export function Stars({ value, max = 5 }) {
  return (
    <span className="stars" aria-label={`${value} of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < value ? 'on' : ''}>
          ★
        </span>
      ))}
    </span>
  );
}

export function ProgressBar({ value, max = 100, className = '' }) {
  const pct = max ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <span className={`progress ${className}`}>
      <span className="progress-fill" style={{ width: `${pct}%` }} />
    </span>
  );
}

export function presenceLabel(p) {
  return p === 'online' ? 'Online' : p === 'away' ? 'Away' : p === 'busy' ? 'Busy' : 'Offline';
}

export function timeAgo(ts) {
  const d = Date.now() - ts;
  const m = Math.round(d / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} minute${m === 1 ? '' : 's'} ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const days = Math.round(h / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric' });
}

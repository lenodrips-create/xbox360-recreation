import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { OptionRow, Row, Screen, SliderRow, ToggleRow } from '../components/ui.jsx';

// Renders one menu item description as the matching row component.
export function MenuItem({ item, onFocus, isDefault }) {
  const common = { id: item.id, label: item.label, onFocus, isDefault };
  switch (item.kind) {
    case 'toggle':
      return <ToggleRow {...common} value={item.value} onChange={item.onChange} onText={item.onText} offText={item.offText} />;
    case 'option':
      return <OptionRow {...common} value={item.value} options={item.options} onChange={item.onChange} />;
    case 'slider':
      return (
        <SliderRow {...common} value={item.value} min={item.min} max={item.max} step={item.step} onChange={item.onChange} format={item.format} />
      );
    default:
      return <Row {...common} icon={item.icon} value={item.value} onSelect={item.onSelect} disabled={item.disabled} snd={item.snd} />;
  }
}

export function MenuList({ items, onFocusItem, className = '' }) {
  return (
    <div className={`menu ${className}`} data-scroll="y" data-scroll-pad="20">
      {items.map((item, i) =>
        item.section ? (
          <div key={item.section} className="menu-section">
            {item.section}
          </div>
        ) : (
          <MenuItem key={item.id} item={item} isDefault={i === 0 || item.isDefault} onFocus={() => onFocusItem && onFocusItem(item)} />
        ),
      )}
    </div>
  );
}

export function InfoPanel({ icon, title, children, className = '' }) {
  return (
    <aside className={`info-panel ${className}`}>
      {icon && <Icon name={icon} size={96} strokeWidth={1.8} className="info-icon" />}
      {title && <h2 className="info-title">{title}</h2>}
      <div className="info-body">{children}</div>
    </aside>
  );
}

// Standard settings-style screen: a list of rows on the left and a panel
// describing the focused row on the right.
export function MenuScreen({ active, title, kicker, items, aside, hints, onAction, icon }) {
  const firstItem = items.find((i) => !i.section);
  const [focused, setFocused] = useState(firstItem ? firstItem.id : null);
  const current = items.find((i) => i.id === focused) || firstItem;
  return (
    <Screen active={active} title={title} kicker={kicker} hints={hints} onAction={onAction}>
      <div className="split">
        <MenuList items={items} onFocusItem={(it) => setFocused(it.id)} />
        {aside ? (
          aside(current)
        ) : (
          <InfoPanel icon={current?.icon || icon} title={current?.label}>
            <p>{current?.desc}</p>
          </InfoPanel>
        )}
      </div>
    </Screen>
  );
}

export function HScroll({ rows = 2, children, className = '' }) {
  return (
    <div className={`hscroll ${className}`} data-scroll="x" data-scroll-pad="60">
      <div className="hgrid" style={{ gridTemplateRows: `repeat(${rows}, auto)` }}>
        {children}
      </div>
    </div>
  );
}

export function Empty({ icon = 'info', title, text, children }) {
  return (
    <div className="empty">
      <Icon name={icon} size={88} strokeWidth={1.8} />
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}

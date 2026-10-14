// Original line icons (48x48 grid) used on tiles, lists and the Guide.
const P = {
  friends: (
    <>
      <circle cx="18" cy="16" r="7" />
      <path d="M5 40c0-8 6-13 13-13s13 5 13 13" />
      <circle cx="33" cy="14" r="5.5" />
      <path d="M31 26c6.5-1 12 3 12 11" />
    </>
  ),
  message: (
    <>
      <rect x="5" y="11" width="38" height="27" rx="2" />
      <path d="M6 13l18 14 18-14" />
    </>
  ),
  party: (
    <>
      <path d="M10 28v-4a14 14 0 0 1 28 0v4" />
      <rect x="6" y="27" width="8" height="12" rx="2" />
      <rect x="34" y="27" width="8" height="12" rx="2" />
      <path d="M38 39c0 3-4 5-10 5h-3" />
    </>
  ),
  beacon: (
    <>
      <circle cx="24" cy="22" r="4" />
      <path d="M24 26v16" />
      <path d="M15 13a13 13 0 0 0 0 18M33 13a13 13 0 0 1 0 18" />
      <path d="M9 7a21 21 0 0 0 0 30M39 7a21 21 0 0 1 0 30" />
    </>
  ),
  trophy: (
    <>
      <path d="M15 7h18v10a9 9 0 0 1-18 0z" />
      <path d="M15 10H8c0 7 3 10 8 10M33 10h7c0 7-3 10-8 10" />
      <path d="M24 26v8M16 41h16M18 41l2-7h8l2 7" />
    </>
  ),
  person: (
    <>
      <circle cx="24" cy="15" r="8" />
      <path d="M8 42c0-9 7-15 16-15s16 6 16 15" />
    </>
  ),
  gear: (
    <>
      <circle cx="24" cy="24" r="6" />
      <path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2" />
      <circle cx="24" cy="24" r="13" />
    </>
  ),
  sliders: (
    <>
      <path d="M8 12h32M8 24h32M8 36h32" />
      <circle cx="16" cy="12" r="4" fill="currentColor" />
      <circle cx="31" cy="24" r="4" fill="currentColor" />
      <circle cx="21" cy="36" r="4" fill="currentColor" />
    </>
  ),
  key: (
    <>
      <circle cx="15" cy="24" r="8" />
      <path d="M23 24h20M37 24v7M42 24v5" />
    </>
  ),
  card: (
    <>
      <rect x="5" y="11" width="38" height="26" rx="3" />
      <path d="M5 18h38M11 30h10" />
    </>
  ),
  family: (
    <>
      <path d="M6 22L24 7l18 15" />
      <path d="M11 19v22h26V19" />
      <path d="M24 36s-7-4.5-7-9a3.5 3.5 0 0 1 7-1 3.5 3.5 0 0 1 7 1c0 4.5-7 9-7 9z" />
    </>
  ),
  palette: (
    <>
      <path d="M24 6C13 6 5 14 5 24c0 9 7 16 15 16 3 0 4-2 3-4s0-5 3-5h6c6 0 11-4 11-10C43 13 35 6 24 6z" />
      <circle cx="15" cy="21" r="2.5" fill="currentColor" />
      <circle cx="22" cy="14" r="2.5" fill="currentColor" />
      <circle cx="31" cy="15" r="2.5" fill="currentColor" />
      <circle cx="36" cy="22" r="2.5" fill="currentColor" />
    </>
  ),
  controller: (
    <>
      <path d="M14 15h20c5 0 8 4 9 10l1 7c.5 4-3.5 6-6 3l-4-5H14l-4 5c-2.5 3-6.5 1-6-3l1-7c1-6 4-10 9-10z" />
      <path d="M14 20v7M10.5 23.5h7" />
      <circle cx="33" cy="21" r="1.6" fill="currentColor" />
      <circle cx="37" cy="25" r="1.6" fill="currentColor" />
    </>
  ),
  joystick: (
    <>
      <rect x="8" y="30" width="32" height="10" rx="2" />
      <path d="M24 30V16" />
      <circle cx="24" cy="12" r="6" />
    </>
  ),
  bag: (
    <>
      <path d="M9 16h30l-2 26H11z" />
      <path d="M17 19v-6a7 7 0 0 1 14 0v6" />
    </>
  ),
  apps: (
    <>
      <rect x="7" y="7" width="14" height="14" rx="1" />
      <rect x="27" y="7" width="14" height="14" rx="1" />
      <rect x="7" y="27" width="14" height="14" rx="1" />
      <rect x="27" y="27" width="14" height="14" rx="1" />
    </>
  ),
  search: (
    <>
      <circle cx="20" cy="20" r="12" />
      <path d="M29 29l12 12" />
    </>
  ),
  clock: (
    <>
      <circle cx="24" cy="24" r="17" />
      <path d="M24 13v11l8 5" />
    </>
  ),
  pin: (
    <>
      <path d="M17 6h14l-2 12 7 7H12l7-7z" />
      <path d="M24 25v17" />
    </>
  ),
  disc: (
    <>
      <circle cx="24" cy="24" r="17" />
      <circle cx="24" cy="24" r="4" />
      <path d="M24 13a11 11 0 0 1 11 11" />
    </>
  ),
  gold: (
    <>
      <circle cx="24" cy="20" r="12" />
      <path d="M24 13l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" fill="currentColor" stroke="none" />
      <path d="M17 30l-3 12 10-5 10 5-3-12" />
    </>
  ),
  avatar: (
    <>
      <circle cx="24" cy="13" r="8" />
      <path d="M14 42V30c0-5 4-8 10-8s10 3 10 8v12" />
      <path d="M14 30l-5 6M34 30l5 6" />
    </>
  ),
  power: (
    <>
      <path d="M24 6v17" />
      <path d="M14 12a16 16 0 1 0 20 0" />
    </>
  ),
  globe: (
    <>
      <circle cx="24" cy="24" r="17" />
      <path d="M7 24h34M24 7c6 6 6 28 0 34M24 7c-6 6-6 28 0 34" />
    </>
  ),
  hdd: (
    <>
      <rect x="6" y="12" width="36" height="24" rx="3" />
      <path d="M6 28h36" />
      <circle cx="35" cy="32" r="1.5" fill="currentColor" />
    </>
  ),
  usb: (
    <>
      <rect x="15" y="16" width="18" height="26" rx="2" />
      <rect x="18" y="6" width="12" height="10" />
      <path d="M21 10v2M27 10v2" />
    </>
  ),
  memory: (
    <>
      <path d="M12 6h18l8 8v28H12z" />
      <path d="M17 34h14M17 28h14" />
    </>
  ),
  cloud: <path d="M14 36h22a8 8 0 0 0 0-16 11 11 0 0 0-21-2A9 9 0 0 0 14 36z" />,
  monitor: (
    <>
      <rect x="5" y="8" width="38" height="25" rx="2" />
      <path d="M18 41h12M24 33v8" />
    </>
  ),
  speaker: (
    <>
      <path d="M8 18h8l10-8v28l-10-8H8z" />
      <path d="M32 17a9 9 0 0 1 0 14M36 12a15 15 0 0 1 0 24" />
    </>
  ),
  mute: (
    <>
      <path d="M8 18h8l10-8v28l-10-8H8z" />
      <path d="M32 19l10 10M42 19L32 29" />
    </>
  ),
  info: (
    <>
      <circle cx="24" cy="24" r="17" />
      <path d="M24 22v11" />
      <circle cx="24" cy="15.5" r="1.6" fill="currentColor" />
    </>
  ),
  check: <path d="M9 25l9 9 21-21" />,
  lock: (
    <>
      <rect x="10" y="21" width="28" height="20" rx="2" />
      <path d="M16 21v-6a8 8 0 0 1 16 0v6" />
    </>
  ),
  play: <path d="M15 9l24 15-24 15z" fill="currentColor" />,
  music: (
    <>
      <path d="M19 35V11l20-4v24" />
      <circle cx="14" cy="35" r="5" />
      <circle cx="34" cy="31" r="5" />
    </>
  ),
  video: (
    <>
      <rect x="5" y="12" width="28" height="24" rx="2" />
      <path d="M33 21l10-6v18l-10-6" />
    </>
  ),
  signin: (
    <>
      <path d="M27 7h12v34H27" />
      <path d="M7 24h22M21 16l8 8-8 8" />
    </>
  ),
  plus: <path d="M24 9v30M9 24h30" />,
  edit: (
    <>
      <path d="M10 38l3-11L32 8l8 8-19 19-11 3z" />
      <path d="M28 12l8 8" />
    </>
  ),
  trash: (
    <>
      <path d="M8 12h32M19 12V7h10v5" />
      <path d="M12 12l2 29h20l2-29" />
    </>
  ),
  reply: (
    <>
      <path d="M19 12L7 23l12 11" />
      <path d="M7 23h20c8 0 13 5 13 13" />
    </>
  ),
  chevronLeft: <path d="M30 8L14 24l16 16" />,
  chevronRight: <path d="M18 8l16 16-16 16" />,
  star: <path d="M24 6l5.4 11 12 1.8-8.7 8.5 2 12L24 33.6 13.3 39.3l2-12-8.7-8.5 12-1.8z" />,
  home: (
    <>
      <path d="M6 22L24 7l18 15" />
      <path d="M11 19v22h10V30h6v11h10V19" />
    </>
  ),
  tray: (
    <>
      <path d="M6 30h36v10H6z" />
      <path d="M24 8v16M17 17l7 7 7-7" />
    </>
  ),
  download: (
    <>
      <path d="M24 7v24M15 22l9 9 9-9" />
      <path d="M8 36v5h32v-5" />
    </>
  ),
  help: (
    <>
      <circle cx="24" cy="24" r="17" />
      <path d="M18.5 19a5.5 5.5 0 1 1 8 5c-2 1-2.5 2.5-2.5 4.5" />
      <circle cx="24" cy="34" r="1.6" fill="currentColor" />
    </>
  ),
  compare: (
    <>
      <path d="M8 16h28M30 10l6 6-6 6" />
      <path d="M40 32H12M18 26l-6 6 6 6" />
    </>
  ),
  mic: (
    <>
      <rect x="18" y="6" width="12" height="22" rx="6" />
      <path d="M11 22a13 13 0 0 0 26 0M24 35v7M17 42h14" />
    </>
  ),
  refresh: (
    <>
      <path d="M39 18A16 16 0 0 0 9 20" />
      <path d="M39 8v10H29" />
      <path d="M9 30a16 16 0 0 0 30-2" />
      <path d="M9 40V30h10" />
    </>
  ),
  list: <path d="M8 12h32M8 24h32M8 36h32" />,
  sort: <path d="M14 8v32M8 34l6 6 6-6M28 12h14M28 22h10M28 32h6" />,
  film: (
    <>
      <rect x="6" y="8" width="36" height="32" rx="2" />
      <path d="M14 8v32M34 8v32M6 16h8M6 24h8M6 32h8M34 16h8M34 24h8M34 32h8" />
    </>
  ),
  photo: (
    <>
      <rect x="5" y="9" width="38" height="30" rx="2" />
      <path d="M5 33l11-11 9 9 6-6 12 12" />
      <circle cx="32" cy="18" r="3" />
    </>
  ),
  chat: (
    <>
      <path d="M6 9h36v23H20l-9 8v-8H6z" />
    </>
  ),
  bolt: <path d="M27 5L10 27h12l-3 16 18-23H25z" />,
  sun: (
    <>
      <circle cx="24" cy="24" r="8" />
      <path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2" />
    </>
  ),
  note: (
    <>
      <path d="M18 36V10l18-3v24" />
      <circle cx="13" cy="36" r="5" />
      <circle cx="31" cy="31" r="5" />
    </>
  ),
  network: (
    <>
      <path d="M6 18a26 26 0 0 1 36 0M11 24a19 19 0 0 1 26 0M16 30a12 12 0 0 1 16 0" />
      <circle cx="24" cy="36" r="2.5" fill="currentColor" />
    </>
  ),
  kinect: (
    <>
      <rect x="6" y="16" width="36" height="10" rx="5" />
      <circle cx="16" cy="21" r="2" fill="currentColor" />
      <circle cx="32" cy="21" r="2" fill="currentColor" />
      <path d="M20 26v8h8v-8M16 38h16" />
    </>
  ),
  language: (
    <>
      <path d="M6 10h18M15 6v4M9 10c1 7 6 12 13 14M21 10c-1 7-6 12-13 14" />
      <path d="M26 42l8-20 8 20M29 35h10" />
    </>
  ),
  rating: (
    <>
      <rect x="9" y="6" width="30" height="36" rx="2" />
      <path d="M16 16h16M16 24h16M16 32h9" />
    </>
  ),
  timer: (
    <>
      <circle cx="24" cy="27" r="15" />
      <path d="M24 27v-8M19 5h10M24 5v7" />
    </>
  ),
};

export default function Icon({ name, size = 48, className = '', strokeWidth = 2.4, style }) {
  const glyph = P[name] || P.info;
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      {glyph}
    </svg>
  );
}

// Content types for game files. Zip entries carry no type, and the service
// worker serves each file with the type stored here, so module scripts, wasm
// and media load correctly.
const TYPES = {
  html: 'text/html',
  htm: 'text/html',
  js: 'text/javascript',
  mjs: 'text/javascript',
  cjs: 'text/javascript',
  css: 'text/css',
  json: 'application/json',
  map: 'application/json',
  txt: 'text/plain',
  xml: 'application/xml',
  csv: 'text/csv',
  wasm: 'application/wasm',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  bmp: 'image/bmp',
  mp3: 'audio/mpeg',
  ogg: 'audio/ogg',
  oga: 'audio/ogg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  flac: 'audio/flac',
  opus: 'audio/ogg',
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  webm: 'video/webm',
  ogv: 'video/ogg',
  ttf: 'font/ttf',
  otf: 'font/otf',
  woff: 'font/woff',
  woff2: 'font/woff2',
  glb: 'model/gltf-binary',
  gltf: 'model/gltf+json',
};

export function typeFor(path) {
  const dot = path.lastIndexOf('.');
  const ext = dot < 0 ? '' : path.slice(dot + 1).toLowerCase();
  return TYPES[ext] || 'application/octet-stream';
}

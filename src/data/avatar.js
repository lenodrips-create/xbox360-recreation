// Avatar customization options. Avatars are drawn as original SVG art in
// components/Avatar.jsx; these lists drive the avatar editor.

export const AVATAR_OPTIONS = {
  body: [
    { value: 'slim', label: 'Slim' },
    { value: 'average', label: 'Average' },
    { value: 'broad', label: 'Broad' },
  ],
  height: [
    { value: 0.92, label: 'Short' },
    { value: 1, label: 'Average' },
    { value: 1.06, label: 'Tall' },
  ],
  skin: [
    { value: '#f6d7c3', label: 'Porcelain' },
    { value: '#eec1a0', label: 'Light' },
    { value: '#d9a27c', label: 'Warm' },
    { value: '#b97f57', label: 'Tan' },
    { value: '#8d5a3b', label: 'Brown' },
    { value: '#5e3a26', label: 'Deep' },
  ],
  hair: [
    { value: 'short', label: 'Short Crop' },
    { value: 'spiky', label: 'Spiky' },
    { value: 'swept', label: 'Side Swept' },
    { value: 'curly', label: 'Curly' },
    { value: 'long', label: 'Long' },
    { value: 'bob', label: 'Bob' },
    { value: 'ponytail', label: 'Ponytail' },
    { value: 'mohawk', label: 'Mohawk' },
    { value: 'buzz', label: 'Buzz Cut' },
    { value: 'bald', label: 'Bald' },
  ],
  hairColor: [
    { value: '#2a1d16', label: 'Black Brown' },
    { value: '#5a3825', label: 'Chestnut' },
    { value: '#9a6a3a', label: 'Light Brown' },
    { value: '#e0b862', label: 'Blond' },
    { value: '#b5472c', label: 'Auburn' },
    { value: '#d8d8d8', label: 'Silver' },
    { value: '#3a63c9', label: 'Electric Blue' },
    { value: '#d04f9a', label: 'Magenta' },
    { value: '#5db12b', label: 'Green' },
  ],
  eyes: [
    { value: 'round', label: 'Round' },
    { value: 'wide', label: 'Wide' },
    { value: 'happy', label: 'Happy' },
    { value: 'narrow', label: 'Narrow' },
  ],
  eyeColor: [
    { value: '#4a7ab0', label: 'Blue' },
    { value: '#5b8a3c', label: 'Green' },
    { value: '#6b4426', label: 'Brown' },
    { value: '#7b8b95', label: 'Grey' },
    { value: '#2e1f14', label: 'Dark' },
  ],
  mouth: [
    { value: 'smile', label: 'Smile' },
    { value: 'grin', label: 'Grin' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'open', label: 'Excited' },
  ],
  top: [
    { value: 'tee', label: 'T-Shirt' },
    { value: 'stripe', label: 'Striped Tee' },
    { value: 'hoodie', label: 'Hoodie' },
    { value: 'jacket', label: 'Track Jacket' },
    { value: 'logo', label: 'Ring Tee' },
  ],
  topColor: [
    { value: '#2f6fb5', label: 'Blue' },
    { value: '#4fa821', label: 'Green' },
    { value: '#c0392b', label: 'Red' },
    { value: '#f0f0f0', label: 'White' },
    { value: '#2b2b2b', label: 'Black' },
    { value: '#e67e22', label: 'Orange' },
    { value: '#8e44ad', label: 'Purple' },
    { value: '#f1c40f', label: 'Yellow' },
  ],
  bottoms: [
    { value: 'jeans', label: 'Jeans' },
    { value: 'cargo', label: 'Cargo Pants' },
    { value: 'shorts', label: 'Shorts' },
  ],
  bottomColor: [
    { value: '#2c3e5a', label: 'Denim' },
    { value: '#3b3b3b', label: 'Charcoal' },
    { value: '#7a6a4f', label: 'Khaki' },
    { value: '#1d1d1d', label: 'Black' },
    { value: '#5f7f9f', label: 'Light Denim' },
  ],
  shoeColor: [
    { value: '#efefef', label: 'White' },
    { value: '#262626', label: 'Black' },
    { value: '#b33a2b', label: 'Red' },
    { value: '#3a6fb0', label: 'Blue' },
  ],
  accessory: [
    { value: 'none', label: 'None' },
    { value: 'glasses', label: 'Glasses' },
    { value: 'cap', label: 'Cap' },
    { value: 'headphones', label: 'Headphones' },
    { value: 'beanie', label: 'Beanie' },
  ],
};

export const AVATAR_CATEGORIES = [
  { key: 'body', label: 'Body Type' },
  { key: 'height', label: 'Height' },
  { key: 'skin', label: 'Skin Tone' },
  { key: 'hair', label: 'Hair Style' },
  { key: 'hairColor', label: 'Hair Color' },
  { key: 'eyes', label: 'Eyes' },
  { key: 'eyeColor', label: 'Eye Color' },
  { key: 'mouth', label: 'Mouth' },
  { key: 'top', label: 'Top' },
  { key: 'topColor', label: 'Top Color' },
  { key: 'bottoms', label: 'Bottoms' },
  { key: 'bottomColor', label: 'Bottoms Color' },
  { key: 'shoeColor', label: 'Shoes' },
  { key: 'accessory', label: 'Accessory' },
];

export const DEFAULT_AVATAR = {
  body: 'average',
  height: 1,
  skin: '#eec1a0',
  hair: 'spiky',
  hairColor: '#5a3825',
  eyes: 'round',
  eyeColor: '#4a7ab0',
  mouth: 'smile',
  top: 'logo',
  topColor: '#4fa821',
  bottoms: 'jeans',
  bottomColor: '#2c3e5a',
  shoeColor: '#efefef',
  accessory: 'none',
};

export function randomAvatar(seed) {
  let s = seed * 9301 + 49297;
  const pick = (list) => {
    s = (s * 9301 + 49297) % 233280;
    return list[Math.floor((s / 233280) * list.length)].value;
  };
  const out = {};
  for (const key of Object.keys(AVATAR_OPTIONS)) out[key] = pick(AVATAR_OPTIONS[key]);
  return out;
}

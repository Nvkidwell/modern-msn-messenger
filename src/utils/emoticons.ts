export interface Emoticon {
  shortcut: string;
  name: string;
  emoji: string;
  category: 'angst' | 'faces' | 'dark' | 'scene';
}

export const SCENE_EMOTICONS: Emoticon[] = [
  { shortcut: 'xD', name: 'Rawr XD', emoji: '😆', category: 'scene' },
  { shortcut: 'XD', name: 'Classic XD', emoji: '😆', category: 'scene' },
  { shortcut: '>_<', name: 'Angst Squint', emoji: '😣', category: 'angst' },
  { shortcut: 'T_T', name: 'Crying Tears', emoji: '😭', category: 'angst' },
  { shortcut: 'x_x', name: 'Dead Inside', emoji: '😵', category: 'angst' },
  { shortcut: '-_-', name: 'Whatever / Unimpressed', emoji: '😑', category: 'angst' },
  { shortcut: 'O_o', name: 'Perplexed / Sarcastic', emoji: '🤨', category: 'faces' },
  { shortcut: ':-P', name: 'Tongue Out', emoji: '😜', category: 'faces' },
  { shortcut: ':P', name: 'Tongue Out Short', emoji: '😛', category: 'faces' },
  { shortcut: ';)', name: 'Cynical Wink', emoji: '😉', category: 'faces' },
  { shortcut: ':(', name: 'Sad', emoji: '🥺', category: 'faces' },
  { shortcut: ':$', name: 'Blushing Emo', emoji: '😳', category: 'faces' },
  { shortcut: '8)', name: 'Shades in Dark', emoji: '😎', category: 'faces' },
  { shortcut: '(L)', name: 'Black Bleeding Heart', emoji: '🖤', category: 'dark' },
  { shortcut: '(U)', name: 'Shattered Heart', emoji: '💔', category: 'dark' },
  { shortcut: '(6)', name: 'Devil Horns', emoji: '😈', category: 'dark' },
  { shortcut: '(X)', name: 'Poison Skull', emoji: '☠️', category: 'dark' },
  { shortcut: '(V)', name: 'Vampire Bat', emoji: '🦇', category: 'dark' },
  { shortcut: '(W)', name: 'Wilted Rose', emoji: '🥀', category: 'dark' },
  { shortcut: '(K)', name: 'Black Lipstick Kiss', emoji: '💋', category: 'dark' },
  { shortcut: '(8)', name: 'Screamo Music Note', emoji: '🎶', category: 'scene' },
  { shortcut: '(R)', name: 'Rawr Dinosaur', emoji: '🦖', category: 'scene' },
  { shortcut: '(P)', name: 'Safety Pin', emoji: '🧷', category: 'scene' },
  { shortcut: '(B)', name: 'Energy Drink / Can', emoji: '🥫', category: 'scene' },
  { shortcut: '(G)', name: 'Black Guitar', emoji: '🎸', category: 'scene' },
  { shortcut: '(*)', name: 'Dark Star', emoji: '⭐', category: 'scene' },
  { shortcut: '(S)', name: 'Crescent Moon', emoji: '🌙', category: 'dark' },
  { shortcut: '(@)', name: 'Black Cat', emoji: '🐈‍⬛', category: 'dark' },
  { shortcut: '(Y)', name: 'Thumbs Up', emoji: '👍', category: 'faces' },
  { shortcut: '(N)', name: 'Thumbs Down', emoji: '👎', category: 'faces' },
];

export function parseEmoticons(text: string): string {
  if (!text) return '';
  let result = text;
  
  // Sort shortcuts by length descending so longer tokens match first
  const sorted = [...SCENE_EMOTICONS].sort((a, b) => b.shortcut.length - a.shortcut.length);
  
  for (const item of sorted) {
    const escaped = item.shortcut.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    result = result.replace(regex, item.emoji);
  }
  return result;
}

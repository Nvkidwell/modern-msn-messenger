export interface AvatarOption {
  id: string;
  name: string;
  emoji: string;
  bgGradient: string;
  borderColor: string;
}

export const DEFAULT_AVATARS: AvatarOption[] = [
  { id: 'skull', name: 'Poison Skull', emoji: '☠️', bgGradient: 'from-slate-800 to-black', borderColor: 'border-rose-500' },
  { id: 'bat', name: 'Vampire Bat', emoji: '🦇', bgGradient: 'from-purple-950 to-black', borderColor: 'border-fuchsia-500' },
  { id: 'blackheart', name: 'Bleeding Heart', emoji: '🖤', bgGradient: 'from-rose-950 to-black', borderColor: 'border-rose-600' },
  { id: 'guitar', name: 'Black Gibson Guitar', emoji: '🎸', bgGradient: 'from-red-900 to-slate-950', borderColor: 'border-red-500' },
  { id: 'rose', name: 'Black Rose', emoji: '🥀', bgGradient: 'from-zinc-900 to-black', borderColor: 'border-zinc-500' },
  { id: 'spider', name: 'Black Widow', emoji: '🕷️', bgGradient: 'from-slate-900 to-neutral-950', borderColor: 'border-cyan-500' },
  { id: 'dino', name: 'Rawr Dinosaur', emoji: '🦖', bgGradient: 'from-emerald-950 to-black', borderColor: 'border-emerald-400' },
  { id: 'eye', name: 'Heavy Eyeliner', emoji: '👁️', bgGradient: 'from-indigo-950 to-black', borderColor: 'border-indigo-400' },
  { id: 'cassette', name: 'Mixtape 2006', emoji: '📼', bgGradient: 'from-fuchsia-950 to-black', borderColor: 'border-pink-500' },
  { id: 'lightning', name: 'Static Shock', emoji: '⚡', bgGradient: 'from-amber-950 to-black', borderColor: 'border-amber-400' },
  { id: 'alien', name: 'Glitch Alien', emoji: '👽', bgGradient: 'from-teal-950 to-black', borderColor: 'border-teal-400' },
  { id: 'ghost', name: 'Phantom', emoji: '👻', bgGradient: 'from-neutral-800 to-black', borderColor: 'border-neutral-400' },
  { id: 'flame', name: 'Toxic Fire', emoji: '🔥', bgGradient: 'from-orange-950 to-black', borderColor: 'border-orange-500' },
  { id: 'coffee', name: 'Black Coffee', emoji: '☕', bgGradient: 'from-stone-900 to-black', borderColor: 'border-stone-500' },
  { id: 'star', name: 'Inverted Star', emoji: '⭐', bgGradient: 'from-purple-900 to-black', borderColor: 'border-purple-400' },
];

export const SCENE_USERNAMES = [
  'xX_ShadowOfTomorrow_Xx',
  'crying_in_heavy_eyeliner',
  'rawr_means_iloveyou_xD',
  'scenecore_royalty_06',
  'panic_at_the_bedroom',
  'bulletproof_heartbreak',
  'vampire_freak_99',
  'razorblade_glitter',
  'black_parade_dropout',
  'taking_back_myself',
  'broken_doll_xoxo',
  'bloody_converse_kid',
  'side_bangs_and_angst',
  'screamo_lullaby',
  'dead_inside_since_2004',
];

export const SCENE_QUOTES = [
  '~*~ I\'m not okay, but it\'s fine because nobody listens anyway ~*~',
  '♫ Hawthorne Heights - Ohio Is For Lovers ♫ [So cut my wrists and black my eyes]',
  'Top 8 is finalized. DO NOT message me asking why you dropped to 7.',
  '(8) My Chemical Romance - Helena (8) <3 so long and goodnight',
  'My heart is like my coffee: pitch black and bitter 🖤',
  'xD RAWR means I love you in dinosaur!! Don\'t be a hater!!',
  '♫ Taking Back Sunday - MakeDamnSure ♫ [I just wanna break you down so badly]',
  'Currently screaming into a pillow while listening to The Used',
  '★·.·´¯`·.·★ If you can\'t handle me at my angst, leave my page ★·.·´¯`·.·★',
  '♫ Paramore - Misery Business (8) [Woah, I never meant to brag]',
  'BRB dyeing my hair neon purple in the bathroom sink',
  'You\'re either in my Top 8 or you\'re dead to me.',
];

export function getRandomProfile() {
  const name = SCENE_USERNAMES[Math.floor(Math.random() * SCENE_USERNAMES.length)];
  const email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@deadvox.net`;
  const avatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)].id;
  const quote = SCENE_QUOTES[Math.floor(Math.random() * SCENE_QUOTES.length)];

  return { name, email, avatar, quote };
}

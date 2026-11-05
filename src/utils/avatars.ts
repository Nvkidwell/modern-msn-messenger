export const AVATAR_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#6366f1', // indigo
];

export const FRIENDLY_NAMES = [
  'Alex',
  'Jordan',
  'Taylor',
  'Morgan',
  'Sam',
  'Casey',
  'Riley',
  'Jamie',
  'Avery',
  'Quinn',
  'Cameron',
  'Dakota',
];

export function getRandomName(): string {
  const name = FRIENDLY_NAMES[Math.floor(Math.random() * FRIENDLY_NAMES.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `${name}_${num}`;
}

export function getRandomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export function getInitials(name: string): string {
  if (!name) return 'G';
  const parts = name.trim().split(/[\s_]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

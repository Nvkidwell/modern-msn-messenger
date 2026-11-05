export const STANDARD_EMOJIS = [
  '😊', '😂', '🤣', '😍', '😎', '🤔', '🥺', '😭',
  '👍', '👎', '👏', '🙌', '🙏', '❤️', '🔥', '✨',
  '🎉', '🚀', '💯', '💬', '☕', '🍕', '👀', '💡',
];

const SHORTCUTS: Record<string, string> = {
  ':)': '😊',
  ':-)': '😊',
  ':D': '😃',
  ':-D': '😃',
  ';)': '😉',
  ';-)': '😉',
  '<3': '❤️',
  ':(': '🙁',
  ':-(': '🙁',
  ':P': '😛',
  ':-P': '😛',
  ':O': '😮',
  ':-O': '😮',
  'xD': '😆',
  'XD': '😆',
};

export function parseEmoticons(text: string): string {
  if (!text) return '';
  let result = text;
  for (const [shortcut, emoji] of Object.entries(SHORTCUTS)) {
    const escaped = shortcut.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\s)${escaped}(?=\\s|$)`, 'g');
    result = result.replace(regex, `$1${emoji}`);
  }
  return result;
}

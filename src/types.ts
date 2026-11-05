export type UserStatus = 'online' | 'busy' | 'away' | 'lurking' | 'moshpit' | 'dead' | 'offline';

export type UserMood = 
  | '🖤 Melancholy'
  | '⚡ Hyperactive (Rawr xD)'
  | '🎸 Mosh Pit Ready'
  | '☕ Overcaffeinated'
  | '🌧️ Emo Tears'
  | '💀 Dead Inside'
  | '🦇 Lurking in Shadows'
  | '🗡️ Vengeful'
  | '✨ Glitter & Gloom'
  | '🎧 Blast Screamo';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: UserStatus;
  mood: string;
  personalMessage: string;
  currentSong?: string;
  fontColor?: string;
  isBot?: boolean;
}

export type MessageType = 'text' | 'nudge' | 'wink' | 'ink' | 'system' | 'image';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderEmail: string;
  fontColor?: string;
  type: MessageType;
  content: string; // text message, or image base64, or wink/effect ID
  timestamp: number;
  targetUserId?: string;
  roomId: string;
}

export interface WinkData {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  avatar?: string;
  timestamp: number;
}

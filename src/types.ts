export interface Message {
  id: string;
  senderName: string;
  content: string;
  timestamp: number;
  type?: 'text' | 'image';
  avatarColor?: string;
}

export interface UserProfile {
  name: string;
  avatarColor: string;
}

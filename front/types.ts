
export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  text: string;
  timestamp: number;
  isRead?: boolean; 
}

export interface Channel {
  id: string;
  name: string;
  avatarUrl?: string; 
  lastMessagePreview?: string;
  lastMessageTimestamp?: number;
  unreadCount: number;
  members: User[];
}

export type ScreenType =
  | 'splash'
  | 'login'
  | 'signup'
  | 'main_chats'
  | 'chat_room'
  | 'voice_call'
  | 'video_call'
  | 'incoming_call'
  | 'reconnect_call'
  | 'friends'
  | 'profile'
  | 'settings'
  | 'call_history'
  | 'notifications';

export type BottomTabType = 'chats' | 'friends' | 'calls' | 'notifications' | 'more';

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  statusText?: string;
  isOnline: boolean;
  lastSeen?: string;
  phone?: string;
  email?: string;
  postsCount?: number;
  followersCount?: number;
  friendsCount?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text?: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'audio';
  mediaUrl?: string;
  audioDuration?: string;
}

export interface Conversation {
  id: string;
  peerUser: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isGroup?: boolean;
  groupName?: string;
  lastMessageType?: 'text' | 'image' | 'audio';
  messages: ChatMessage[];
}

export interface StoryItem {
  id: string;
  user: User;
  hasUnread: boolean;
}

export interface FriendRequest {
  id: string;
  user: User;
  requestedAt: string;
}

export interface CallLogItem {
  id: string;
  peerUser: User;
  type: 'incoming' | 'outgoing' | 'missed' | 'declined';
  media: 'audio' | 'video';
  timestamp: string;
  duration?: string;
}

export interface ActiveCallState {
  id: string;
  roomId: string;
  peerUser: User;
  callType: 'audio' | 'video';
  status: 'incoming' | 'connected' | 'reconnecting' | 'disconnected_waiting' | 'ended';
  startedAt: number;
  durationSeconds: number;
  isMuted: boolean;
  isSpeaker: boolean;
  isVideoEnabled: boolean;
  isFrontCamera: boolean;
  gracePeriodExpiresAt: number; // 60 minutes after disconnect
  disconnectReason?: string;
  isMinimized: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'message' | 'call' | 'friend_request' | 'system';
  read: boolean;
}

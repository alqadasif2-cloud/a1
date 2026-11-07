import { User, Conversation, FriendRequest, CallLogItem, StoryItem, NotificationItem } from '../types';

export const currentUser: User = {
  id: 'user_me',
  name: 'أحمد محمد',
  username: 'ahmed123',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  bio: 'أحب التواصل مع الأصدقاء 😊',
  statusText: 'متصل الآن',
  isOnline: true,
  postsCount: 35,
  followersCount: 120,
  friendsCount: 248,
  phone: '+966 50 123 4567',
  email: 'ahmed.mohamed@example.com',
};

// Users matching reference design
export const mockUsers: Record<string, User> = {
  ahmed: {
    id: 'u_ahmed',
    name: 'أحمد محمد',
    username: 'ahmed_m',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'مهندس برمجيات | محب للتصوير والسفر',
    isOnline: true,
    lastSeen: 'متصل الآن',
  },
  sara: {
    id: 'u_sara',
    name: 'سارة أحمد',
    username: 'sara_a',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    bio: 'تصميم واجهات المستخدم والفنون الرقمية ✨',
    isOnline: true,
    lastSeen: 'متصل الآن',
  },
  group: {
    id: 'u_group',
    name: 'مجموعة الأصدقاء',
    username: 'friends_group',
    avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80',
    bio: 'محادثة الأصدقاء اليومية والمخططات ☕',
    isOnline: true,
    lastSeen: 'نشط الآن',
  },
  mohamed: {
    id: 'u_mohamed',
    name: 'محمد علي',
    username: 'mohamed_ali',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'طالب هندسة | شغوف بالذكاء الاصطناعي',
    isOnline: false,
    lastSeen: 'آخر ظهور منذ ساعة',
  },
  layla: {
    id: 'u_layla',
    name: 'ليلى خالد',
    username: 'layla_k',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    bio: 'كاتبة ومصممة جرافيك 📚',
    isOnline: true,
    lastSeen: 'متصل الآن',
  },
  lana: {
    id: 'u_lana',
    name: 'لانا',
    username: 'lana_style',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    bio: 'صانعة محتوى | يوميات وفن',
    isOnline: true,
  },
  ali: {
    id: 'u_ali',
    name: 'علي حسن',
    username: 'ali_hassan',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    bio: 'مطور تطبيقات سحابية',
    isOnline: false,
    lastSeen: 'آخر ظهور منذ ساعتين',
  },
};

export const initialStories: StoryItem[] = [
  { id: 's1', user: mockUsers.mohamed, hasUnread: true },
  { id: 's2', user: mockUsers.sara, hasUnread: true },
  { id: 's3', user: mockUsers.lana, hasUnread: true },
  { id: 's4', user: mockUsers.layla, hasUnread: false },
];

export const initialConversations: Conversation[] = [
  {
    id: 'conv_ahmed',
    peerUser: mockUsers.ahmed,
    lastMessage: 'ممتاز، شكراً لك 😊',
    lastMessageTime: '9:32',
    unreadCount: 0,
    lastMessageType: 'text',
    messages: [
      {
        id: 'm1',
        senderId: 'u_ahmed',
        text: 'السلام عليكم 😊',
        timestamp: '9:20',
        status: 'read',
        type: 'text',
      },
      {
        id: 'm2',
        senderId: 'user_me',
        text: 'وعليكم السلام كيف حالك؟',
        timestamp: '9:21',
        status: 'read',
        type: 'text',
      },
      {
        id: 'm3',
        senderId: 'u_ahmed',
        text: 'بخير، شكراً لك ماذا تفعل الآن؟',
        timestamp: '9:22',
        status: 'read',
        type: 'text',
      },
      {
        id: 'm4',
        senderId: 'user_me',
        text: '',
        timestamp: '9:22',
        status: 'read',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'm5',
        senderId: 'u_ahmed',
        text: '',
        timestamp: '9:23',
        status: 'read',
        type: 'audio',
        audioDuration: '0:22',
      },
      {
        id: 'm6',
        senderId: 'u_ahmed',
        text: 'ممتاز، شكراً لك 😊',
        timestamp: '9:23',
        status: 'read',
        type: 'text',
      },
    ],
  },
  {
    id: 'conv_sara',
    peerUser: mockUsers.sara,
    lastMessage: 'أرسل لك الصورة',
    lastMessageTime: '8:45',
    unreadCount: 0,
    lastMessageType: 'image',
    messages: [
      {
        id: 'sm1',
        senderId: 'u_sara',
        text: 'مرحباً، أرسل لك الصورة الجديدة للتصميم',
        timestamp: '8:40',
        status: 'read',
        type: 'text',
      },
      {
        id: 'sm2',
        senderId: 'u_sara',
        text: '',
        timestamp: '8:45',
        status: 'read',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'conv_group',
    peerUser: mockUsers.group,
    groupName: 'مجموعة الأصدقاء',
    isGroup: true,
    lastMessage: 'أحمد: متفقين على اللقاء؟',
    lastMessageTime: '7:20',
    unreadCount: 5,
    lastMessageType: 'text',
    messages: [
      {
        id: 'gm1',
        senderId: 'u_ahmed',
        text: 'أحمد: متفقين على اللقاء؟',
        timestamp: '7:20',
        status: 'read',
        type: 'text',
      },
    ],
  },
  {
    id: 'conv_mohamed',
    peerUser: mockUsers.mohamed,
    lastMessage: 'حسناً، أراك لاحقاً',
    lastMessageTime: '6:18',
    unreadCount: 0,
    lastMessageType: 'text',
    messages: [
      {
        id: 'mm1',
        senderId: 'u_mohamed',
        text: 'حسناً، أراك لاحقاً',
        timestamp: '6:18',
        status: 'read',
        type: 'text',
      },
    ],
  },
  {
    id: 'conv_layla',
    peerUser: mockUsers.layla,
    lastMessage: 'رسالة صوتية',
    lastMessageTime: '5:50',
    unreadCount: 0,
    lastMessageType: 'audio',
    messages: [
      {
        id: 'lm1',
        senderId: 'u_layla',
        text: '',
        timestamp: '5:50',
        status: 'read',
        type: 'audio',
        audioDuration: '0:35',
      },
    ],
  },
];

export const initialFriendRequests: FriendRequest[] = [
  {
    id: 'fr1',
    user: mockUsers.ali,
    requestedAt: 'يرغب بإضافتك كصديق',
  },
];

export const initialFriendsList: User[] = [
  mockUsers.sara,
  mockUsers.mohamed,
  mockUsers.layla,
  mockUsers.ahmed,
];

export const initialCallLogs: CallLogItem[] = [
  {
    id: 'cl1',
    peerUser: mockUsers.ahmed,
    type: 'outgoing',
    media: 'audio',
    timestamp: 'اليوم، 9:15 ص',
    duration: '04:12',
  },
  {
    id: 'cl2',
    peerUser: mockUsers.sara,
    type: 'incoming',
    media: 'video',
    timestamp: 'اليوم، 8:30 ص',
    duration: '12:45',
  },
  {
    id: 'cl3',
    peerUser: mockUsers.mohamed,
    type: 'missed',
    media: 'audio',
    timestamp: 'أمس، 11:20 م',
  },
  {
    id: 'cl4',
    peerUser: mockUsers.layla,
    type: 'incoming',
    media: 'audio',
    timestamp: 'أمس، 4:10 م',
    duration: '02:08',
  },
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'طلب صداقة جديد',
    description: 'علي حسن أرسل لك طلب صداقة',
    time: 'منذ 10 دقائق',
    type: 'friend_request',
    read: false,
  },
  {
    id: 'n2',
    title: 'مكالمة فائتة',
    description: 'مكالمة صوتية فائتة من محمد علي',
    time: 'منذ ساعتين',
    type: 'call',
    read: false,
  },
  {
    id: 'n3',
    title: 'رسائل جديدة في المجموعة',
    description: '5 رسائل غير مقروءة في مجموعة الأصدقاء',
    time: 'منذ 3 ساعات',
    type: 'message',
    read: true,
  },
];

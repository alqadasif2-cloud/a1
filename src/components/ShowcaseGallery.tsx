import React from 'react';
import { ScreenType, User, Conversation } from '../types';
import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { MainChatsScreen } from '../screens/MainChatsScreen';
import { ChatConversationScreen } from '../screens/ChatConversationScreen';
import { VoiceCallScreen } from '../screens/VoiceCallScreen';
import { IncomingCallScreen } from '../screens/IncomingCallScreen';
import { FriendsListScreen } from '../screens/FriendsListScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ReconnectCallScreen } from '../screens/ReconnectCallScreen';
import { VideoCallScreen } from '../screens/VideoCallScreen';
import { mockUsers, initialConversations, initialStories, initialFriendRequests, initialFriendsList, currentUser } from '../data/mockData';
import { Sparkles, Play, Maximize2 } from 'lucide-react';

interface ShowcaseGalleryProps {
  onSelectScreen: (screen: ScreenType) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const ShowcaseGallery: React.FC<ShowcaseGalleryProps> = ({
  onSelectScreen,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const dummyCallState = {
    id: '#AM-84920',
    roomId: 'AM-ROOM-92',
    peerUser: mockUsers.ahmed,
    callType: 'audio' as const,
    status: 'connected' as const,
    startedAt: Date.now() - 60000,
    durationSeconds: 15,
    isMuted: false,
    isSpeaker: true,
    isVideoEnabled: true,
    isFrontCamera: true,
    gracePeriodExpiresAt: Date.now() + 3600 * 1000,
    isMinimized: false,
  };

  const screensConfig = [
    {
      id: 'splash' as ScreenType,
      title: 'شاشة البداية',
      component: (
        <SplashScreen
          onStart={() => onSelectScreen('main_chats')}
          onLogin={() => onSelectScreen('login')}
        />
      ),
    },
    {
      id: 'login' as ScreenType,
      title: 'تسجيل الدخول',
      component: (
        <LoginScreen
          onLoginSuccess={() => onSelectScreen('main_chats')}
        />
      ),
    },
    {
      id: 'main_chats' as ScreenType,
      title: 'الشاشة الرئيسية',
      component: (
        <MainChatsScreen
          conversations={initialConversations}
          stories={initialStories}
          onSelectConversation={() => onSelectScreen('chat_room')}
          onNavigateTab={(tab) => {
            if (tab === 'friends') onSelectScreen('friends');
            if (tab === 'more') onSelectScreen('profile');
          }}
        />
      ),
    },
    {
      id: 'chat_room' as ScreenType,
      title: 'واجهة المحادثة',
      component: (
        <ChatConversationScreen
          conversation={initialConversations[0]}
          onBack={() => onSelectScreen('main_chats')}
          onStartAudioCall={() => onSelectScreen('voice_call')}
          onStartVideoCall={() => onSelectScreen('video_call')}
          onSendMessage={() => {}}
        />
      ),
    },
    {
      id: 'voice_call' as ScreenType,
      title: 'مكالمة صوتية',
      component: (
        <VoiceCallScreen
          callState={dummyCallState}
          onEndCall={() => onSelectScreen('main_chats')}
          onToggleMute={() => {}}
          onToggleSpeaker={() => {}}
          onMinimize={() => onSelectScreen('main_chats')}
          onSimulateDisconnect={() => onSelectScreen('reconnect_call')}
        />
      ),
    },
    {
      id: 'incoming_call' as ScreenType,
      title: 'مكالمة واردة',
      component: (
        <IncomingCallScreen
          caller={mockUsers.sara}
          callType="video"
          onAccept={() => onSelectScreen('voice_call')}
          onDecline={() => onSelectScreen('main_chats')}
        />
      ),
    },
    {
      id: 'reconnect_call' as ScreenType,
      title: 'استعادة المكالمة (60 دقيقة)',
      badge: 'ميزة حصرية',
      component: (
        <ReconnectCallScreen
          callState={{
            ...dummyCallState,
            status: 'disconnected_waiting',
          }}
          onReturnToCall={() => onSelectScreen('voice_call')}
          onLeaveTemporarily={() => onSelectScreen('main_chats')}
          onEndCallForEveryone={() => onSelectScreen('main_chats')}
        />
      ),
    },
    {
      id: 'friends' as ScreenType,
      title: 'قائمة الأصدقاء',
      component: (
        <FriendsListScreen
          friendRequests={initialFriendRequests}
          friends={initialFriendsList}
          onAcceptRequest={() => {}}
          onDeclineRequest={() => {}}
          onSelectFriend={() => onSelectScreen('chat_room')}
          onStartAudioCall={() => onSelectScreen('voice_call')}
          onStartVideoCall={() => onSelectScreen('video_call')}
          onNavigateTab={(tab) => {
            if (tab === 'chats') onSelectScreen('main_chats');
            if (tab === 'more') onSelectScreen('profile');
          }}
        />
      ),
    },
    {
      id: 'profile' as ScreenType,
      title: 'الملف الشخصي',
      component: (
        <ProfileScreen
          user={currentUser}
          onNavigateTab={(tab) => {
            if (tab === 'chats') onSelectScreen('main_chats');
            if (tab === 'friends') onSelectScreen('friends');
          }}
          onOpenSettings={() => onSelectScreen('settings')}
        />
      ),
    },
    {
      id: 'settings' as ScreenType,
      title: 'الإعدادات',
      component: (
        <SettingsScreen
          onBack={() => onSelectScreen('profile')}
          onLogout={() => onSelectScreen('login')}
          isDarkMode={isDarkMode}
          onToggleDarkMode={onToggleDarkMode}
        />
      ),
    },
  ];

  return (
    <div className="w-full py-8 px-4 sm:px-8 bg-slate-950 text-slate-100 min-h-screen">
      {/* Gallery Header */}
      <div className="max-w-7xl mx-auto mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>الدليل البصري والشاشات المطابقة للصورة المرجعية</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          واجهات تطبيق A«»M الفخمة
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
          تم تنفيذ كل شاشة ظاهرة في التصميم المرجعي كشاشة تفاعلية حقيقية مستقلة مع الحفاظ على الألوان البنفسجية، وتدرجات الإضاءة، والشعار الملكي، ونظام استعادة الاتصال لمدة 60 دقيقة. اضغط على أي شاشة لتشغيلها وتجربتها مباشرة.
        </p>
      </div>

      {/* Grid of Phones matching the user's uploaded reference layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8 items-start">
        {screensConfig.map((item) => (
          <div
            key={item.id}
            className="flex flex-col items-center group cursor-pointer"
            onClick={() => onSelectScreen(item.id)}
          >
            {/* Phone Mini Frame */}
            <div className="relative w-full aspect-[9/19] rounded-[36px] p-2 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border border-purple-500/30 shadow-[0_15px_35px_rgba(0,0,0,0.6)] group-hover:shadow-[0_20px_45px_rgba(147,51,234,0.35)] group-hover:border-purple-400 transition-all duration-300 overflow-hidden transform group-hover:-translate-y-1">
              {/* Dynamic Island Cutout */}
              <div className="absolute top-3 inset-x-0 z-30 flex justify-center pointer-events-none">
                <div className="w-20 h-4 bg-black rounded-full" />
              </div>

              {/* Status bar mock */}
              <div className="absolute top-2 inset-x-4 z-20 flex justify-between text-[9px] font-bold text-white/80 pointer-events-none">
                <span>9:41</span>
                <span>LTE 100%</span>
              </div>

              {/* Screen Body */}
              <div className="w-full h-full rounded-[28px] overflow-hidden pointer-events-none scale-100 origin-top bg-slate-900">
                {item.component}
              </div>

              {/* Hover overlay with "تشغيل الشاشة" */}
              <div className="absolute inset-0 bg-purple-950/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 z-40 rounded-[36px]">
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
                <span className="text-xs font-bold text-white bg-black/60 px-3 py-1 rounded-full border border-white/20">
                  تشغيل وتجربة الشاشة
                </span>
              </div>
            </div>

            {/* Label Under Phone matching reference screenshot */}
            <div className="mt-3.5 flex items-center gap-1.5 text-center">
              <span className="text-sm font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                {item.title}
              </span>
              {item.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600/60 text-purple-200 border border-purple-400/50 font-bold">
                  {item.badge}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

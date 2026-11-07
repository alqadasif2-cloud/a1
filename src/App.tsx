import React, { useState, useEffect } from 'react';
import {
  ScreenType,
  BottomTabType,
  ActiveCallState,
  Conversation,
  User,
  ChatMessage,
  FriendRequest,
} from './types';
import {
  currentUser as fallbackCurrentUser,
  mockUsers,
  initialConversations,
  initialStories,
  initialFriendRequests,
  initialFriendsList,
  initialCallLogs,
  initialNotifications,
} from './data/mockData';
import { PhoneFrame } from './components/PhoneFrame';
import { ShowcaseGallery } from './components/ShowcaseGallery';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { MainChatsScreen } from './screens/MainChatsScreen';
import { ChatConversationScreen } from './screens/ChatConversationScreen';
import { VoiceCallScreen } from './screens/VoiceCallScreen';
import { VideoCallScreen } from './screens/VideoCallScreen';
import { IncomingCallScreen } from './screens/IncomingCallScreen';
import { ReconnectCallScreen } from './screens/ReconnectCallScreen';
import { FriendsListScreen } from './screens/FriendsListScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { CallHistoryScreen } from './screens/CallHistoryScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { soundEffects } from './utils/audio';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  syncUserProfile,
  subscribeToFriendRequests,
  acceptRealFriendRequest,
  declineRealFriendRequest,
  subscribeToConversations,
  subscribeToMessages,
  sendRealChatMessage,
  getOrCreateRealConversation,
} from './services/chatService';
import {
  initiateRealCall,
  answerRealCall,
  subscribeToIncomingCalls,
  reportRealDisconnect,
  restoreRealCallSession,
  endRealCall,
} from './services/callService';
import {
  Smartphone,
  LayoutGrid,
  Maximize2,
  Moon,
  Sun,
  PhoneIncoming,
  WifiOff,
  Database,
  CloudCheck,
} from 'lucide-react';

export default function App() {
  // App view modes
  const [viewMode, setViewMode] = useState<'simulator' | 'gallery' | 'fullscreen'>('simulator');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Active User & Authentication
  const [currentUser, setCurrentUser] = useState<User>(fallbackCurrentUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Active Screen
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('main_chats');
  const [activeTab, setActiveTab] = useState<BottomTabType>('chats');

  // Application Data States linked to Cloud Firestore
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversation, setActiveConversation] = useState<Conversation>(initialConversations[0]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(initialFriendRequests);
  const [friends, setFriends] = useState<User[]>(initialFriendsList);
  const [callLogs, setCallLogs] = useState(initialCallLogs);
  const [notifications, setNotifications] = useState(initialNotifications);

  // Active Call Session State (with 60-minute grace period tracking)
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);

  // Synchronize Dark Mode class on HTML document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Real Firebase Authentication State Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fUser) => {
      if (fUser) {
        setIsAuthenticated(true);
        const loggedUser: User = {
          id: fUser.uid,
          name: fUser.displayName || 'أحمد محمد',
          username: fUser.email ? fUser.email.split('@')[0] : 'ahmed123',
          avatar: fUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          email: fUser.email || '',
          isOnline: true,
          lastSeen: 'متصل الآن',
        };
        setCurrentUser(loggedUser);
        await syncUserProfile(loggedUser);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Real-Time Listeners for Cloud Firestore (Friend Requests, Conversations, Calls)
  useEffect(() => {
    if (!isAuthenticated || !auth.currentUser || !currentUser?.id) return;
    if (currentUser.id !== auth.currentUser.uid) return;

    // 1. Listen for real friend requests in Firestore
    const unsubReqs = subscribeToFriendRequests(currentUser.id, (reqs) => {
      setFriendRequests(reqs);
      if (reqs.length > 0) {
        setNotifications((prev) => [
          {
            id: `notif_${Date.now()}`,
            title: 'طلب صداقة وارد',
            description: `${reqs[0].user.name} أرسل لك طلب صداقة`,
            time: 'الآن',
            type: 'friend_request',
            read: false,
          },
          ...prev,
        ]);
      }
    });

    // 2. Listen for real conversations in Firestore
    const unsubConvs = subscribeToConversations(currentUser.id, (realConvs) => {
      if (realConvs.length > 0) {
        setConversations(realConvs);
      }
    });

    // 3. Listen for incoming WebRTC calls in Firestore
    const unsubCalls = subscribeToIncomingCalls(currentUser.id, (incoming) => {
      if (incoming && incoming.status === 'incoming') {
        setActiveCall(incoming);
        setCurrentScreen('incoming_call');
      }
    });

    return () => {
      unsubReqs();
      unsubConvs();
      unsubCalls();
    };
  }, [isAuthenticated, currentUser?.id]);

  // Real-time messages listener for active conversation
  useEffect(() => {
    if (!isAuthenticated || !auth.currentUser || !activeConversation?.id) return;
    if (activeConversation.id.startsWith('conv_')) return;

    const unsubMsgs = subscribeToMessages(activeConversation.id, (msgs) => {
      if (msgs.length > 0) {
        setActiveConversation((prev) => ({
          ...prev,
          messages: msgs,
        }));
      }
    });
    return () => unsubMsgs();
  }, [isAuthenticated, activeConversation?.id]);

  // Tab navigation handler
  const handleNavigateTab = (tab: BottomTabType) => {
    setActiveTab(tab);
    if (tab === 'chats') setCurrentScreen('main_chats');
    else if (tab === 'friends') setCurrentScreen('friends');
    else if (tab === 'calls') setCurrentScreen('call_history');
    else if (tab === 'notifications') setCurrentScreen('notifications');
    else if (tab === 'more') setCurrentScreen('profile');
  };

  // Chat selection
  const handleSelectConversation = async (conv: Conversation) => {
    const realConvId = await getOrCreateRealConversation(currentUser, conv.peerUser);
    const updatedConv = { ...conv, id: realConvId };
    setActiveConversation(updatedConv);
    setCurrentScreen('chat_room');
  };

  // Send real message to Cloud Firestore
  const handleSendMessage = async (convId: string, newMsgPartial: Partial<ChatMessage>) => {
    soundEffects.playMessageSent();
    await sendRealChatMessage(convId, {
      ...newMsgPartial,
      senderId: currentUser.id,
    });
  };

  // Start Real WebRTC Audio Call
  const handleStartAudioCall = async (peer: User) => {
    soundEffects.playCallConnected();
    const callId = await initiateRealCall(currentUser, peer, 'audio');
    const newCall: ActiveCallState = {
      id: callId,
      roomId: `AM-ROOM-${Math.floor(1000 + Math.random() * 9000)}`,
      peerUser: peer,
      callType: 'audio',
      status: 'connected',
      startedAt: Date.now(),
      durationSeconds: 0,
      isMuted: false,
      isSpeaker: true,
      isVideoEnabled: false,
      isFrontCamera: true,
      gracePeriodExpiresAt: Date.now() + 60 * 60 * 1000,
      isMinimized: false,
    };
    setActiveCall(newCall);
    setCurrentScreen('voice_call');
  };

  // Start Real WebRTC Video Call
  const handleStartVideoCall = async (peer: User) => {
    soundEffects.playCallConnected();
    const callId = await initiateRealCall(currentUser, peer, 'video');
    const newCall: ActiveCallState = {
      id: callId,
      roomId: `AM-ROOM-${Math.floor(1000 + Math.random() * 9000)}`,
      peerUser: peer,
      callType: 'video',
      status: 'connected',
      startedAt: Date.now(),
      durationSeconds: 0,
      isMuted: false,
      isSpeaker: true,
      isVideoEnabled: true,
      isFrontCamera: true,
      gracePeriodExpiresAt: Date.now() + 60 * 60 * 1000,
      isMinimized: false,
    };
    setActiveCall(newCall);
    setCurrentScreen('video_call');
  };

  // Accept incoming call
  const handleAcceptIncomingCall = async () => {
    if (activeCall) {
      await answerRealCall(activeCall.id, activeCall.callType);
      setActiveCall({ ...activeCall, status: 'connected' });
      setCurrentScreen(activeCall.callType === 'video' ? 'video_call' : 'voice_call');
    }
  };

  // Decline incoming call
  const handleDeclineIncomingCall = async () => {
    soundEffects.playCallEnd();
    if (activeCall) {
      await endRealCall(activeCall.id);
    }
    setActiveCall(null);
    setCurrentScreen('main_chats');
  };

  // Internet Disconnect (Triggers 60-Minute Recovery Screen and marks server state)
  const handleSimulateDisconnect = async () => {
    soundEffects.playDisconnectAlert();
    if (activeCall) {
      await reportRealDisconnect(activeCall.id);
      setActiveCall({
        ...activeCall,
        status: 'disconnected_waiting',
        gracePeriodExpiresAt: Date.now() + 60 * 60 * 1000,
        disconnectReason: 'فقدان اتصال شبكة الإنترنت',
      });
      setCurrentScreen('reconnect_call');
    } else {
      const fallbackCall: ActiveCallState = {
        id: '#CALL-84920',
        roomId: 'AM-ROOM-92',
        peerUser: mockUsers.ahmed,
        callType: 'audio',
        status: 'disconnected_waiting',
        startedAt: Date.now() - 120000,
        durationSeconds: 120,
        isMuted: false,
        isSpeaker: true,
        isVideoEnabled: false,
        isFrontCamera: true,
        gracePeriodExpiresAt: Date.now() + 60 * 60 * 1000,
        isMinimized: false,
      };
      setActiveCall(fallbackCall);
      setCurrentScreen('reconnect_call');
    }
  };

  // Return to Call (Restore Call Session within 60 minutes)
  const handleReturnToCall = async () => {
    soundEffects.playCallConnected();
    if (activeCall) {
      await restoreRealCallSession(activeCall.id);
      setActiveCall({
        ...activeCall,
        status: 'connected',
        isMinimized: false,
      });
      setCurrentScreen(activeCall.callType === 'video' ? 'video_call' : 'voice_call');
    }
  };

  // End Call permanently
  const handleEndCall = async () => {
    soundEffects.playCallEnd();
    if (activeCall) {
      await endRealCall(activeCall.id);
      setCallLogs((prev) => [
        {
          id: `cl_${Date.now()}`,
          peerUser: activeCall.peerUser,
          type: 'outgoing',
          media: activeCall.callType,
          timestamp: 'الآن',
          duration: `${Math.floor(activeCall.durationSeconds / 60)} دقيقة`,
        },
        ...prev,
      ]);
    }
    setActiveCall(null);
    setCurrentScreen('main_chats');
  };

  // Minimize call to background
  const handleMinimizeCall = () => {
    if (activeCall) {
      setActiveCall({
        ...activeCall,
        isMinimized: true,
      });
      setCurrentScreen('main_chats');
    }
  };

  // Friend Request Accept/Decline (Strictly without deleting/blocking)
  const handleAcceptFriendRequest = async (reqId: string) => {
    const req = friendRequests.find((r) => r.id === reqId);
    if (req) {
      await acceptRealFriendRequest(reqId, req.user.id, currentUser.id);
      setFriends((prev) => [req.user, ...prev]);
      setFriendRequests((prev) => prev.filter((r) => r.id !== reqId));
    }
  };

  const handleDeclineFriendRequest = async (reqId: string) => {
    await declineRealFriendRequest(reqId);
    setFriendRequests((prev) => prev.filter((r) => r.id !== reqId));
  };

  // Render the current screen component
  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return (
          <SplashScreen
            onStart={() => setCurrentScreen('main_chats')}
            onLogin={() => setCurrentScreen('login')}
          />
        );

      case 'login':
        return (
          <LoginScreen
            onLoginSuccess={(loggedUser) => {
              setCurrentUser(loggedUser);
              setIsAuthenticated(true);
              setCurrentScreen('main_chats');
            }}
            onBackToSplash={() => setCurrentScreen('splash')}
          />
        );

      case 'main_chats':
        return (
          <MainChatsScreen
            conversations={conversations}
            stories={initialStories}
            onSelectConversation={handleSelectConversation}
            onNavigateTab={handleNavigateTab}
            onOpenNotifications={() => setCurrentScreen('notifications')}
          />
        );

      case 'chat_room':
        return (
          <ChatConversationScreen
            conversation={activeConversation}
            onBack={() => setCurrentScreen('main_chats')}
            onStartAudioCall={handleStartAudioCall}
            onStartVideoCall={handleStartVideoCall}
            onSendMessage={handleSendMessage}
          />
        );

      case 'voice_call':
        return activeCall ? (
          <VoiceCallScreen
            callState={activeCall}
            onEndCall={handleEndCall}
            onToggleMute={() =>
              setActiveCall({ ...activeCall, isMuted: !activeCall.isMuted })
            }
            onToggleSpeaker={() =>
              setActiveCall({ ...activeCall, isSpeaker: !activeCall.isSpeaker })
            }
            onMinimize={handleMinimizeCall}
            onSimulateDisconnect={handleSimulateDisconnect}
          />
        ) : (
          <SplashScreen
            onStart={() => setCurrentScreen('main_chats')}
            onLogin={() => setCurrentScreen('login')}
          />
        );

      case 'video_call':
        return activeCall ? (
          <VideoCallScreen
            callState={activeCall}
            onEndCall={handleEndCall}
            onToggleMute={() =>
              setActiveCall({ ...activeCall, isMuted: !activeCall.isMuted })
            }
            onToggleVideo={() =>
              setActiveCall({ ...activeCall, isVideoEnabled: !activeCall.isVideoEnabled })
            }
            onToggleSpeaker={() =>
              setActiveCall({ ...activeCall, isSpeaker: !activeCall.isSpeaker })
            }
            onMinimize={handleMinimizeCall}
            onSimulateDisconnect={handleSimulateDisconnect}
          />
        ) : (
          <SplashScreen
            onStart={() => setCurrentScreen('main_chats')}
            onLogin={() => setCurrentScreen('login')}
          />
        );

      case 'incoming_call':
        return (
          <IncomingCallScreen
            caller={activeCall?.peerUser || mockUsers.sara}
            callType={activeCall?.callType || 'video'}
            onAccept={handleAcceptIncomingCall}
            onDecline={handleDeclineIncomingCall}
          />
        );

      case 'reconnect_call':
        return activeCall ? (
          <ReconnectCallScreen
            callState={activeCall}
            onReturnToCall={handleReturnToCall}
            onLeaveTemporarily={() => {
              setActiveCall({ ...activeCall, isMinimized: true });
              setCurrentScreen('main_chats');
            }}
            onEndCallForEveryone={handleEndCall}
          />
        ) : (
          <SplashScreen
            onStart={() => setCurrentScreen('main_chats')}
            onLogin={() => setCurrentScreen('login')}
          />
        );

      case 'friends':
        return (
          <FriendsListScreen
            currentUser={currentUser}
            friendRequests={friendRequests}
            friends={friends}
            onAcceptRequest={handleAcceptFriendRequest}
            onDeclineRequest={handleDeclineFriendRequest}
            onSelectFriend={async (friend) => {
              const existingConv = conversations.find((c) => c.peerUser.id === friend.id) || {
                id: `conv_${friend.id}`,
                peerUser: friend,
                lastMessage: '',
                lastMessageTime: 'الآن',
                unreadCount: 0,
                messages: [],
              };
              await handleSelectConversation(existingConv);
            }}
            onStartAudioCall={handleStartAudioCall}
            onStartVideoCall={handleStartVideoCall}
            onNavigateTab={handleNavigateTab}
          />
        );

      case 'profile':
        return (
          <ProfileScreen
            user={currentUser}
            onNavigateTab={handleNavigateTab}
            onOpenSettings={() => setCurrentScreen('settings')}
            onBack={() => setCurrentScreen('main_chats')}
          />
        );

      case 'settings':
        return (
          <SettingsScreen
            onBack={() => setCurrentScreen('profile')}
            onLogout={() => {
              auth.signOut();
              setIsAuthenticated(false);
              setCurrentScreen('login');
            }}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />
        );

      case 'call_history':
        return (
          <CallHistoryScreen
            callLogs={callLogs}
            onStartAudioCall={handleStartAudioCall}
            onStartVideoCall={handleStartVideoCall}
            onNavigateTab={handleNavigateTab}
          />
        );

      case 'notifications':
        return (
          <NotificationsScreen
            notifications={notifications}
            onNavigateTab={handleNavigateTab}
            onClearAll={() => setNotifications([])}
            onBack={() => setCurrentScreen('main_chats')}
          />
        );

      default:
        return (
          <MainChatsScreen
            conversations={conversations}
            stories={initialStories}
            onSelectConversation={handleSelectConversation}
            onNavigateTab={handleNavigateTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Application Control Toolbar */}
      <header className="sticky top-0 z-50 bg-[#120527]/95 border-b border-purple-900/60 backdrop-blur-md px-4 py-2.5 flex items-center justify-between text-xs">
        {/* Brand Lockup & Cloud Active Pill */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center font-black text-white shadow-md">
            A«»M
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm tracking-tight font-['Cairo']">
                A«»M تواصل .. بلا حدود
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                سحابي حي (Firestore)
              </span>
            </div>
            <span className="text-[10px] text-purple-300 font-medium hidden sm:inline">
              متصل بقاعدة البيانات السحابية الحقيقية مع نظام استعادة المكالمات 60 دقيقة
            </span>
          </div>
        </div>

        {/* View Modes Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-purple-950/80 rounded-xl border border-purple-800/80">
          <button
            onClick={() => setViewMode('simulator')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
              viewMode === 'simulator'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-300 hover:text-white'
            }`}
            title="الهاتف التفاعلي"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">الهاتف التفاعلي</span>
          </button>

          <button
            onClick={() => setViewMode('gallery')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
              viewMode === 'gallery'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-300 hover:text-white'
            }`}
            title="معرض جميع الشاشات (مطابق للصورة)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden md:inline">معرض الشاشات (المرجع)</span>
          </button>

          <button
            onClick={() => setViewMode('fullscreen')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
              viewMode === 'fullscreen'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-300 hover:text-white'
            }`}
            title="ملء الشاشة"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">ملء الشاشة</span>
          </button>
        </div>

        {/* Quick Simulation Triggers */}
        <div className="flex items-center gap-2">
          {/* Incoming Call trigger */}
          <button
            onClick={() => {
              setActiveCall({
                id: `call_${Date.now()}`,
                roomId: 'AM-ROOM-92',
                peerUser: mockUsers.sara,
                callType: 'video',
                status: 'incoming',
                startedAt: Date.now(),
                durationSeconds: 0,
                isMuted: false,
                isSpeaker: true,
                isVideoEnabled: true,
                isFrontCamera: true,
                gracePeriodExpiresAt: Date.now() + 3600 * 1000,
                isMinimized: false,
              });
              setCurrentScreen('incoming_call');
            }}
            className="px-2.5 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-700/60 text-purple-200 font-semibold flex items-center gap-1.5 transition-all text-[11px]"
            title="مكالمة واردة"
          >
            <PhoneIncoming className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">مكالمة واردة</span>
          </button>

          {/* Simulate 60-Minute Disconnect trigger */}
          <button
            onClick={handleSimulateDisconnect}
            className="px-2.5 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900/80 border border-amber-600/50 text-amber-200 font-bold flex items-center gap-1.5 transition-all text-[11px]"
            title="انقطاع الإنترنت واختبار استعادة 60 دقيقة"
          >
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">انقطاع 60 دقيقة</span>
          </button>

          {/* Dark / Light Mode */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-700/60 text-purple-200"
            title="تبديل المظهر"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-300" />}
          </button>
        </div>
      </header>

      {/* Main Body depending on ViewMode */}
      <main className="flex-1 flex flex-col items-center justify-center relative">
        {viewMode === 'gallery' ? (
          /* Multi-Screen Reference Showcase matching uploaded image */
          <ShowcaseGallery
            onSelectScreen={(screen) => {
              setCurrentScreen(screen);
              setViewMode('simulator');
            }}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />
        ) : viewMode === 'fullscreen' ? (
          /* Fullscreen App Mode */
          <div className="w-full h-[calc(100vh-53px)] flex flex-col bg-slate-900 overflow-hidden">
            {renderScreen()}
          </div>
        ) : (
          /* Authentic Mobile Phone Frame Simulator */
          <div className="w-full flex-1 flex flex-col items-center justify-center p-3 sm:p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1d063a] via-[#0d021b] to-[#05000a]">
            {/* Quick Screen Selector Pills Bar */}
            <div className="mb-3 max-w-xl w-full flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1">
              {[
                { id: 'splash' as ScreenType, label: 'البداية' },
                { id: 'login' as ScreenType, label: 'تسجيل الدخول' },
                { id: 'main_chats' as ScreenType, label: 'الرئيسية' },
                { id: 'chat_room' as ScreenType, label: 'المحادثة' },
                { id: 'voice_call' as ScreenType, label: 'مكالمة صوتية' },
                { id: 'video_call' as ScreenType, label: 'مكالمة فيديو' },
                { id: 'incoming_call' as ScreenType, label: 'مكالمة واردة' },
                { id: 'reconnect_call' as ScreenType, label: 'استعادة 60د' },
                { id: 'friends' as ScreenType, label: 'الأصدقاء' },
                { id: 'profile' as ScreenType, label: 'الملف الشخصي' },
                { id: 'settings' as ScreenType, label: 'الإعدادات' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentScreen(s.id);
                    if (s.id === 'voice_call' && !activeCall) {
                      handleStartAudioCall(mockUsers.ahmed);
                    } else if (s.id === 'video_call' && !activeCall) {
                      handleStartVideoCall(mockUsers.ahmed);
                    } else if (s.id === 'reconnect_call' && !activeCall) {
                      handleSimulateDisconnect();
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    currentScreen === s.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-purple-950/60 hover:bg-purple-900 text-purple-300 border border-purple-800/60'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* The Phone Device Frame */}
            <PhoneFrame
              activeCall={activeCall}
              onRestoreCall={handleReturnToCall}
            >
              {renderScreen()}
            </PhoneFrame>
          </div>
        )}
      </main>
    </div>
  );
}

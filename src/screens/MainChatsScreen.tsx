import React, { useState } from 'react';
import { Conversation, StoryItem, BottomTabType } from '../types';
import { Search, Bell, Plus, CheckCheck, Camera, Mic, Volume2 } from 'lucide-react';
import { BottomNavBar } from '../components/BottomNavBar';
import { LogoAM } from '../components/LogoAM';

interface MainChatsScreenProps {
  conversations: Conversation[];
  stories: StoryItem[];
  onSelectConversation: (conv: Conversation) => void;
  onNavigateTab: (tab: BottomTabType) => void;
  onStartNewChat?: () => void;
  onOpenNotifications?: () => void;
}

export const MainChatsScreen: React.FC<MainChatsScreenProps> = ({
  conversations,
  stories,
  onSelectConversation,
  onNavigateTab,
  onOpenNotifications,
}) => {
  const [topSegment, setTopSegment] = useState<'chats' | 'friends' | 'calls'>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  const filteredConversations = conversations.filter((c) => {
    const name = c.isGroup ? c.groupName || '' : c.peerUser.name;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 select-none">
      {/* Top Header with Royal Purple Gradient */}
      <div className="bg-gradient-to-b from-[#2a0b54] to-[#3f127e] text-white pt-3 pb-3 px-4 shadow-md shrink-0">
        {/* Top Brand Bar */}
        <div className="flex items-center justify-between">
          {/* Logo A«»M */}
          <div className="flex items-center gap-2">
            <LogoAM size="sm" showTagline={false} theme="dark" horizontal />
          </div>

          {/* Header Action Icons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 text-purple-200 transition-colors"
              title="بحث"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenNotifications || (() => onNavigateTab('notifications'))}
              className="relative p-1.5 rounded-full hover:bg-white/10 active:scale-95 text-purple-200 transition-colors"
              title="الإشعارات"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[#2a0b54]" />
            </button>
          </div>
        </div>

        {/* Search input expandable */}
        {showSearchInput && (
          <div className="mt-2.5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في المحادثات..."
              className="w-full py-1.5 px-3.5 rounded-xl bg-white/15 text-white placeholder-purple-200/70 text-xs focus:outline-none focus:ring-1 focus:ring-purple-300"
              autoFocus
            />
          </div>
        )}

        {/* Top 3 Segment Tabs (المحادثات | الأصدقاء | المكالمات) */}
        <div className="flex items-center justify-center gap-2 mt-3 px-1">
          <button
            onClick={() => {
              setTopSegment('chats');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all text-center ${
              topSegment === 'chats'
                ? 'bg-white text-purple-900 shadow-sm'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            المحادثات
          </button>
          <button
            onClick={() => {
              setTopSegment('friends');
              onNavigateTab('friends');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all text-center ${
              topSegment === 'friends'
                ? 'bg-white text-purple-900 shadow-sm'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            الأصدقاء
          </button>
          <button
            onClick={() => {
              setTopSegment('calls');
              onNavigateTab('calls');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all text-center ${
              topSegment === 'calls'
                ? 'bg-white text-purple-900 shadow-sm'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            المكالمات
          </button>
        </div>
      </div>

      {/* Main Content Area (Stories + Chats) */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
        {/* Stories / Quick Contacts Carousel */}
        <div className="py-3 px-3.5 bg-slate-50/60 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5">
            {/* Add Story Button */}
            <div className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
              <div className="w-13 h-13 rounded-full border-2 border-dashed border-purple-500/80 dark:border-purple-400/80 flex items-center justify-center bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 group-hover:bg-purple-100 transition-colors">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">إضافة</span>
            </div>

            {/* Friend Stories */}
            {stories.map((story) => (
              <div
                key={story.id}
                onClick={() => {
                  const targetConv = conversations.find(
                    (c) => c.peerUser.id === story.user.id
                  );
                  if (targetConv) onSelectConversation(targetConv);
                }}
                className="flex flex-col items-center gap-1 shrink-0 cursor-pointer"
              >
                <div
                  className={`relative p-0.5 rounded-full ${
                    story.hasUnread
                      ? 'bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 shadow-sm'
                      : 'border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <img
                    src={story.user.avatar}
                    alt={story.user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-900"
                    referrerPolicy="no-referrer"
                  />
                  {story.user.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                  )}
                </div>
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[56px] text-center">
                  {story.user.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredConversations.map((conv) => {
            const displayName = conv.isGroup ? conv.groupName : conv.peerUser.name;
            const displayAvatar = conv.peerUser.avatar;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
              >
                {/* Avatar and status */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={displayAvatar}
                      alt={displayName}
                      className="w-12 h-12 rounded-full object-cover shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    {conv.peerUser.isOnline && !conv.isGroup && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    )}
                  </div>

                  {/* Name and last message preview */}
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {displayName}
                    </span>

                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {/* Icon indicator for media messages */}
                      {conv.lastMessageType === 'image' && (
                        <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                          <Camera className="w-3.5 h-3.5" />
                          <span>أرسل لك الصورة</span>
                        </span>
                      )}
                      {conv.lastMessageType === 'audio' && (
                        <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                          <Mic className="w-3.5 h-3.5" />
                          <span>رسالة صوتية</span>
                        </span>
                      )}
                      {conv.lastMessageType === 'text' && (
                        <span className="truncate">{conv.lastMessage}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Time and Unread Badge */}
                <div className="flex flex-col items-end gap-1.5 shrink-0 pl-1">
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    {conv.lastMessageTime}
                  </span>
                  {conv.unreadCount > 0 ? (
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                      {conv.unreadCount}
                    </span>
                  ) : (
                    <CheckCheck className="w-3.5 h-3.5 text-purple-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab="chats"
        onTabChange={onNavigateTab}
        unreadCount={5}
      />
    </div>
  );
};

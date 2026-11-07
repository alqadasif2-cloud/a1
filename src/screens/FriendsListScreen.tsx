import React, { useState } from 'react';
import { User, FriendRequest, BottomTabType } from '../types';
import { UserPlus, Search, Check, X, MessageSquare, Phone, Video } from 'lucide-react';
import { BottomNavBar } from '../components/BottomNavBar';
import { LogoAM } from '../components/LogoAM';

import { searchUsersInFirestore, sendRealFriendRequest } from '../services/chatService';

interface FriendsListScreenProps {
  currentUser?: User;
  friendRequests: FriendRequest[];
  friends: User[];
  onAcceptRequest: (reqId: string) => void;
  onDeclineRequest: (reqId: string) => void;
  onSelectFriend: (friend: User) => void;
  onStartAudioCall: (peer: User) => void;
  onStartVideoCall: (peer: User) => void;
  onNavigateTab: (tab: BottomTabType) => void;
}

export const FriendsListScreen: React.FC<FriendsListScreenProps> = ({
  currentUser,
  friendRequests,
  friends,
  onAcceptRequest,
  onDeclineRequest,
  onSelectFriend,
  onStartAudioCall,
  onStartVideoCall,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addNotice, setAddNotice] = useState('');

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchUsersInFirestore(newUsername, currentUser?.id || 'me');
      setSearchResults(results);
      if (results.length === 0) {
        setAddNotice('لم يتم العثور على مستخدم بهذا الاسم في قاعدة البيانات');
      } else {
        setAddNotice('');
      }
    } catch {
      setAddNotice('حدث خطأ أثناء البحث');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequestToUser = async (targetUser: User) => {
    if (!currentUser) return;
    try {
      await sendRealFriendRequest(currentUser, targetUser.id);
      setAddNotice(`تم إرسال طلب الصداقة إلى ${targetUser.name} بنجاح عبر السحابة!`);
      setTimeout(() => {
        setAddNotice('');
        setShowAddModal(false);
        setSearchResults([]);
      }, 1500);
    } catch {
      setAddNotice('تعذر إرسال الطلب');
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 select-none">
      {/* Top Royal Purple Header */}
      <div className="bg-gradient-to-b from-[#2a0b54] to-[#3f127e] text-white pt-3 pb-3 px-4 shadow-md shrink-0">
        <div className="flex items-center justify-between">
          <LogoAM size="sm" showTagline={false} theme="dark" horizontal />

          <button
            onClick={() => setShowAddModal(true)}
            className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 text-purple-200 transition-colors"
            title="إضافة صديق جديد"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar matching reference */}
        <div className="mt-3 relative flex items-center">
          <div className="absolute right-3.5 text-purple-300 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث عن أصدقاء..."
            className="w-full pr-10 pl-4 py-2 rounded-2xl bg-white/15 text-white placeholder-purple-200/70 text-xs focus:outline-none focus:ring-1 focus:ring-purple-300 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Main Content (Requests + Friends List) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-white dark:bg-slate-900">
        {/* Friend Requests Section matching reference */}
        {friendRequests.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span className="text-purple-600 dark:text-purple-400">✦</span>
                <span>طلبات الصداقة ({friendRequests.length})</span>
              </h3>
            </div>

            <div className="space-y-2">
              {friendRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-purple-50/60 dark:bg-slate-800/80 border border-purple-100 dark:border-slate-700/80 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.user.avatar}
                      alt={req.user.name}
                      className="w-11 h-11 rounded-full object-cover border border-purple-200 dark:border-purple-800"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {req.user.name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {req.requestedAt}
                      </span>
                    </div>
                  </div>

                  {/* Accept / Decline Buttons matching reference */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAcceptRequest(req.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      قبول
                    </button>
                    <button
                      onClick={() => onDeclineRequest(req.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-650 active:scale-95 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
                    >
                      رفض
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List Section matching reference */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              أصدقائي ({friends.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {filteredFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
              >
                {/* User info */}
                <div
                  onClick={() => onSelectFriend(friend)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <div className="relative shrink-0">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-12 h-12 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {friend.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {friend.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {friend.lastSeen || (friend.isOnline ? 'متصل الآن' : 'غير متصل')}
                    </span>
                  </div>
                </div>

                {/* Direct action buttons (Chat, Voice, Video) */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onSelectFriend(friend)}
                    className="p-2 rounded-full hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-600 dark:text-purple-400 transition-colors"
                    title="محادثة"
                  >
                    <MessageSquare className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => onStartAudioCall(friend)}
                    className="p-2 rounded-full hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-600 dark:text-purple-400 transition-colors"
                    title="مكالمة صوتية"
                  >
                    <Phone className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => onStartVideoCall(friend)}
                    className="p-2 rounded-full hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-600 dark:text-purple-400 transition-colors"
                    title="مكالمة فيديو"
                  >
                    <Video className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Friend Modal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">إضافة صديق جديد</h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addNotice && (
              <div className="p-3 mb-3 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{addNotice}</span>
              </div>
            )}

            <form onSubmit={handleSearchUsers} className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ابحث بالاسم أو اسم المستخدم في قاعدة بيانات A«»M:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="ابحث عن اسم المستخدم..."
                  className="flex-1 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all shrink-0"
                >
                  {isSearching ? 'جاري البحث...' : 'بحث'}
                </button>
              </div>
            </form>

            {/* Live Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                  المستخدمون المطابقون:
                </span>
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-650"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold truncate">{user.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">@{user.username}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSendRequestToUser(user)}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold shrink-0"
                    >
                      إضافة
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavBar
        activeTab="friends"
        onTabChange={onNavigateTab}
        unreadCount={5}
      />
    </div>
  );
};

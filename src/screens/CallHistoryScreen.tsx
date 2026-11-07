import React, { useState } from 'react';
import { CallLogItem, User, BottomTabType } from '../types';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Video,
  Plus,
  Search,
} from 'lucide-react';
import { BottomNavBar } from '../components/BottomNavBar';
import { LogoAM } from '../components/LogoAM';

interface CallHistoryScreenProps {
  callLogs: CallLogItem[];
  onStartAudioCall: (peer: User) => void;
  onStartVideoCall: (peer: User) => void;
  onNavigateTab: (tab: BottomTabType) => void;
}

export const CallHistoryScreen: React.FC<CallHistoryScreenProps> = ({
  callLogs,
  onStartAudioCall,
  onStartVideoCall,
  onNavigateTab,
}) => {
  const [filter, setFilter] = useState<'all' | 'missed'>('all');

  const filteredLogs = callLogs.filter((log) => {
    if (filter === 'missed') return log.type === 'missed';
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 select-none">
      {/* Top Header */}
      <div className="bg-gradient-to-b from-[#2a0b54] to-[#3f127e] text-white pt-3 pb-3 px-4 shadow-md shrink-0">
        <div className="flex items-center justify-between">
          <LogoAM size="sm" showTagline={false} theme="dark" horizontal />

          <button
            onClick={() => onNavigateTab('friends')}
            className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 text-purple-200 transition-colors"
            title="بدء مكالمة جديدة"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center justify-center gap-2 mt-3 px-1">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all text-center ${
              filter === 'all'
                ? 'bg-white text-purple-900 shadow-sm'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            كل المكالمات
          </button>
          <button
            onClick={() => setFilter('missed')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all text-center ${
              filter === 'missed'
                ? 'bg-white text-purple-900 shadow-sm'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            الفائتة
          </button>
        </div>
      </div>

      {/* Call Logs List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900 p-2">
        {filteredLogs.map((log) => {
          const isMissed = log.type === 'missed';

          return (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={log.peerUser.avatar}
                  alt={log.peerUser.name}
                  className="w-12 h-12 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />

                <div className="flex flex-col">
                  <span
                    className={`text-sm font-bold ${
                      isMissed ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {log.peerUser.name}
                  </span>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {log.type === 'incoming' && (
                      <PhoneIncoming className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                    {log.type === 'outgoing' && (
                      <PhoneOutgoing className="w-3.5 h-3.5 text-blue-500" />
                    )}
                    {log.type === 'missed' && (
                      <PhoneMissed className="w-3.5 h-3.5 text-rose-500" />
                    )}

                    <span>{log.timestamp}</span>
                    {log.duration && (
                      <span className="font-mono text-[11px] text-purple-600 dark:text-purple-400">
                        • {log.duration}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Redial Buttons */}
              <div className="flex items-center gap-1">
                {log.media === 'video' ? (
                  <button
                    onClick={() => onStartVideoCall(log.peerUser)}
                    className="p-2 rounded-full hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-600 dark:text-purple-400 transition-colors"
                    title="إعادة الاتصال فيديو"
                  >
                    <Video className="w-4.5 h-4.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => onStartAudioCall(log.peerUser)}
                    className="p-2 rounded-full hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-600 dark:text-purple-400 transition-colors"
                    title="إعادة الاتصال صوتياً"
                  >
                    <Phone className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab="calls"
        onTabChange={onNavigateTab}
        unreadCount={5}
      />
    </div>
  );
};

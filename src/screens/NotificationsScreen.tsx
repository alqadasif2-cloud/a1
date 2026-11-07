import React from 'react';
import { NotificationItem, BottomTabType } from '../types';
import { Bell, Check, Trash2, ArrowRight } from 'lucide-react';
import { BottomNavBar } from '../components/BottomNavBar';
import { LogoAM } from '../components/LogoAM';

interface NotificationsScreenProps {
  notifications: NotificationItem[];
  onNavigateTab: (tab: BottomTabType) => void;
  onClearAll?: () => void;
  onBack?: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  notifications,
  onNavigateTab,
  onClearAll,
  onBack,
}) => {
  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 select-none">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#2a0b54] to-[#3f127e] text-white pt-3 pb-3 px-4 shadow-md shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1 rounded-full hover:bg-white/10 text-purple-200"
              >
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
            )}
            <LogoAM size="sm" showTagline={false} theme="dark" horizontal />
          </div>

          <h2 className="text-sm font-bold">الإشعارات</h2>

          {onClearAll && (
            <button
              onClick={onClearAll}
              className="text-xs text-purple-200 hover:text-white"
            >
              مسح الكل
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-white dark:bg-slate-900">
        {notifications.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <Bell className="w-10 h-10 mb-2 opacity-40 text-purple-500" />
            <p className="text-xs">لا توجد إشعارات جديدة</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                !item.read
                  ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/60'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 text-right">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {item.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar
        activeTab="notifications"
        onTabChange={onNavigateTab}
        unreadCount={5}
      />
    </div>
  );
};

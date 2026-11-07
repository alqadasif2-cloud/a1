import React from 'react';
import { MessageSquare, Users, Phone, Bell, User } from 'lucide-react';
import { BottomTabType } from '../types';

interface BottomNavBarProps {
  activeTab: BottomTabType;
  onTabChange: (tab: BottomTabType) => void;
  unreadCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  unreadCount = 5,
}) => {
  const tabs = [
    {
      id: 'chats' as BottomTabType,
      label: 'المحادثات',
      icon: MessageSquare,
      badge: unreadCount,
    },
    {
      id: 'friends' as BottomTabType,
      label: 'الأصدقاء',
      icon: Users,
    },
    {
      id: 'calls' as BottomTabType,
      label: 'المكالمات',
      icon: Phone,
    },
    {
      id: 'notifications' as BottomTabType,
      label: 'الإشعارات',
      icon: Bell,
      badge: 2,
    },
    {
      id: 'more' as BottomTabType,
      label: 'المزيد',
      icon: User,
    },
  ];

  return (
    <nav className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80 px-2 py-1.5 flex items-center justify-around shrink-0 z-30 transition-colors">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              isActive
                ? 'text-purple-600 dark:text-purple-400 font-bold scale-105'
                : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5 stroke-[2.2]" />
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                  {tab.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight font-sans">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

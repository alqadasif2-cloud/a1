import React, { useState } from 'react';
import { User, BottomTabType } from '../types';
import {
  ArrowRight,
  Video,
  Phone,
  Camera,
  Settings,
  Shield,
  Info,
  ChevronLeft,
  Edit3,
  Check,
} from 'lucide-react';
import { BottomNavBar } from '../components/BottomNavBar';

interface ProfileScreenProps {
  user: User;
  onNavigateTab: (tab: BottomTabType) => void;
  onOpenSettings: () => void;
  onBack?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onNavigateTab,
  onOpenSettings,
  onBack,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || 'أحب التواصل مع الأصدقاء 😊');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSaveProfile = () => {
    setIsEditing(false);
    setStatusMessage('تم تحديث الملف الشخصي بنجاح!');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 select-none">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Panoramic Sunset Mountain Banner matching reference */}
        <div className="relative w-full h-40 bg-gradient-to-r from-amber-600 via-purple-700 to-indigo-900 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
            alt="صورة الغلاف"
            className="w-full h-full object-cover opacity-85 filter brightness-105"
            referrerPolicy="no-referrer"
          />

          {/* Top Banner Navigation Icons */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between text-white z-10">
            {onBack ? (
              <button
                onClick={onBack}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-all"
              >
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => alert('بدء مكالمة فيديو')}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-all"
              >
                <Video className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => alert('بدء مكالمة صوتية')}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-all"
              >
                <Phone className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Card Body */}
        <div className="relative px-5 pt-0 pb-6 -mt-14 flex flex-col items-center text-center">
          {/* Avatar with Camera badge */}
          <div className="relative">
            <img
              src={user.avatar}
              alt={name}
              className="w-26 h-26 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-xl"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => alert('تغيير الصورة الشخصية')}
              className="absolute bottom-1 right-1 p-2 rounded-full bg-purple-700 hover:bg-purple-600 text-white shadow-md transition-all active:scale-95"
              title="تعديل الصورة"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* User Names & Bio */}
          {isEditing ? (
            <div className="w-full max-w-xs mt-3 space-y-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم"
                className="w-full text-center px-3 py-1.5 rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-800 text-sm font-bold"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="نبذة تعريفية"
                rows={2}
                className="w-full text-center px-3 py-1.5 rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-800 text-xs"
              />
              <button
                onClick={handleSaveProfile}
                className="w-full py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold"
              >
                حفظ التغييرات
              </button>
            </div>
          ) : (
            <div className="mt-2.5">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {name}
              </h2>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-mono font-medium dir-ltr inline-block">
                @{user.username}
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xs font-medium">
                {bio}
              </p>

              {/* Status pill matching reference */}
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>متصل الآن</span>
              </div>
            </div>
          )}

          {statusMessage && (
            <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Stats Row matching reference */}
          <div className="w-full max-w-xs grid grid-cols-3 gap-2 mt-5 py-3 px-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm">
            <div className="flex flex-col items-center">
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                {user.postsCount || 35}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                المشاركات
              </span>
            </div>
            <div className="flex flex-col items-center border-x border-slate-100 dark:border-slate-700">
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                {user.followersCount || 120}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                المتابعون
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                {user.friendsCount || 248}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                الأصدقاء
              </span>
            </div>
          </div>

          {/* Action Buttons Row matching reference */}
          <div className="w-full max-w-xs flex items-center gap-2.5 mt-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" />
              <span>تعديل الملف الشخصي</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 transition-all"
              title="الإعدادات"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items List matching reference */}
          <div className="w-full max-w-xs mt-5 space-y-2 text-right">
            <button
              onClick={onOpenSettings}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700 transition-all text-xs font-bold"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400">
                  <Shield className="w-4.5 h-4.5" />
                </div>
                <span>الخصوصية والأمان</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={onOpenSettings}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700 transition-all text-xs font-bold"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                  <Settings className="w-4.5 h-4.5" />
                </div>
                <span>الإعدادات</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => alert('تطبيق A«»M للتواصل الاجتماعي والمكالمات الفورية - الإصدار 2.0.0')}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700 transition-all text-xs font-bold"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
                  <Info className="w-4.5 h-4.5" />
                </div>
                <span>حول التطبيق</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab="more"
        onTabChange={onNavigateTab}
        unreadCount={5}
      />
    </div>
  );
};

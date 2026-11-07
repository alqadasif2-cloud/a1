import React, { useState } from 'react';
import {
  ArrowRight,
  Shield,
  Bell,
  Music,
  Moon,
  Sun,
  Globe,
  Smartphone,
  User,
  Headphones,
  Info,
  ChevronLeft,
  LogOut,
  Check,
} from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const settingsMenuItems = [
    {
      id: 'privacy',
      title: 'الخصوصية والأمان',
      icon: Shield,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-950/80',
      desc: 'آخر ظهور، من يستطيع الاتصال بك، والتشفير السحابي',
    },
    {
      id: 'notifications',
      title: 'الإشعارات',
      icon: Bell,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-950/80',
      desc: 'إشعارات الرسائل والمكالمات ونغمات التنبيه',
    },
    {
      id: 'sound',
      title: 'الصوت والرنين',
      icon: Music,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-950/80',
      desc: 'نغمات A«»M المخصصة، الاهتزاز، صوت المفاتيح',
    },
    {
      id: 'theme',
      title: 'المظهر',
      icon: isDarkMode ? Moon : Sun,
      color: 'text-amber-500 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-950/80',
      desc: isDarkMode ? 'الوضع الليلي مفعّل' : 'الوضع النهاري مفعّل',
      isToggle: true,
    },
    {
      id: 'language',
      title: 'اللغة',
      icon: Globe,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-100 dark:bg-teal-950/80',
      desc: 'العربية (افتراضي)',
    },
    {
      id: 'devices',
      title: 'إدارة الأجهزة',
      icon: Smartphone,
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-100 dark:bg-violet-950/80',
      desc: 'الجلسات النشطة والأجهزة المسجلة',
    },
    {
      id: 'account',
      title: 'الحساب',
      icon: User,
      color: 'text-purple-700 dark:text-purple-300',
      bgColor: 'bg-purple-100 dark:bg-purple-950/80',
      desc: 'رقم الهاتف، اسم المستخدم، والبريد الإلكتروني',
    },
    {
      id: 'support',
      title: 'المساعدة والدعم',
      icon: Headphones,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-950/80',
      desc: 'الأسئلة الشائعة، التبليغ عن مشكلة، التواصل معنا',
    },
    {
      id: 'about',
      title: 'حول التطبيق',
      icon: Info,
      color: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-sky-100 dark:bg-sky-950/80',
      desc: 'الإصدار 2.0.0 A«»M - تواصل بلا حدود',
    },
  ];

  return (
    <div className="w-full h-full min-h-[640px] flex flex-col justify-between overflow-y-auto bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 select-none p-4 transition-colors">
      {/* Header matching reference */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
            title="رجوع"
          >
            <ArrowRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>

          <h1 className="text-lg font-black text-slate-900 dark:text-white">
            الإعدادات
          </h1>

          <div className="w-8" />
        </div>

        {/* Menu Items List */}
        <div className="mt-3 space-y-1">
          {settingsMenuItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (item.id === 'theme') {
                    onToggleDarkMode();
                  } else {
                    setActiveModal(item.id);
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-800 cursor-pointer transition-all border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${item.bgColor} ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {item.desc}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.id === 'theme' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleDarkMode();
                      }}
                      className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                        isDarkMode ? 'bg-purple-600 justify-start' : 'bg-slate-300 justify-end'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center text-slate-800">
                        {isDarkMode ? <Moon className="w-3 h-3 text-purple-600" /> : <Sun className="w-3 h-3 text-amber-500" />}
                      </div>
                    </button>
                  ) : (
                    <ChevronLeft className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout Button matching reference */}
      <div className="pt-4 pb-2">
        <button
          onClick={() => {
            if (window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
              onLogout();
            }
          }}
          className="w-full py-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/80 text-rose-600 dark:text-rose-400 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99]"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>

      {/* Modal for setting detail inspection */}
      {activeModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {settingsMenuItems.find((s) => s.id === activeModal)?.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              تم ضبط إعدادات {settingsMenuItems.find((s) => s.id === activeModal)?.title} وفق أفضل معايير الأمان والتشفير الخاصة بهوية A«»M.
            </p>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-purple-700 dark:text-purple-300 text-xs font-semibold mb-4">
              ✓ كافة الخيارات نشطة ومحفوظة سحابياً
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
            >
              تم
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

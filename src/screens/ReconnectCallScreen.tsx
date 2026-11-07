import React, { useState, useEffect } from 'react';
import { ActiveCallState } from '../types';
import {
  WifiOff,
  RotateCcw,
  PhoneOff,
  Clock,
  ShieldCheck,
  Server,
  Activity,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface ReconnectCallScreenProps {
  callState: ActiveCallState;
  onReturnToCall: () => void;
  onLeaveTemporarily: () => void;
  onEndCallForEveryone: () => void;
}

export const ReconnectCallScreen: React.FC<ReconnectCallScreenProps> = ({
  callState,
  onReturnToCall,
  onLeaveTemporarily,
  onEndCallForEveryone,
}) => {
  // 60-minute countdown (3600 seconds)
  const initialSecondsLeft = Math.max(
    0,
    Math.floor((callState.gracePeriodExpiresAt - Date.now()) / 1000)
  ) || 3590;

  const [secondsLeft, setSecondsLeft] = useState(initialSecondsLeft);
  const [isReconnectingAttempt, setIsReconnectingAttempt] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hours > 0) {
      return `${hours}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleReturnClick = () => {
    setIsReconnectingAttempt(true);
    soundEffects.playCallConnected();
    setTimeout(() => {
      setIsReconnectingAttempt(false);
      onReturnToCall();
    }, 1200);
  };

  return (
    <div className="relative w-full h-full min-h-[640px] flex flex-col justify-between overflow-y-auto bg-[#0a0318] text-white p-5 select-none">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#45127d] via-[#1a0636] to-[#070114] z-0" />

      {/* Top Bar with Session ID & Status */}
      <div className="relative z-10 flex items-center justify-between text-xs border-b border-purple-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-bold text-amber-300">انقطاع اتصال مؤقت</span>
        </div>
        <div className="text-[11px] font-mono text-purple-300/80 bg-purple-950/60 px-2.5 py-1 rounded-md border border-purple-800/40">
          ID: {callState.id || '#AM-84920'}
        </div>
      </div>

      {/* Center Informational Card */}
      <div className="relative z-10 flex flex-col items-center my-auto py-4 text-center">
        {/* Pulsing Disconnect Icon with User Avatar */}
        <div className="relative mb-5">
          <div className="w-28 h-28 rounded-full border-2 border-amber-400/50 p-1 flex items-center justify-center bg-purple-950/40 relative">
            <img
              src={callState.peerUser.avatar}
              alt={callState.peerUser.name}
              className="w-full h-full rounded-full object-cover filter brightness-90"
              referrerPolicy="no-referrer"
            />
            {/* Warning Badge */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
              <WifiOff className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Status text */}
        <h2 className="text-xl font-black text-white">
          فقد الطرف الآخر الاتصال مؤقتاً
        </h2>
        <p className="text-xs text-purple-200/90 max-w-xs mt-1.5 leading-relaxed">
          انقطع اتصال <span className="font-bold text-white">{callState.peerUser.name}</span>. لا تقلق، غرفة المكالمة محفوظة على خوادم A«»M لمدة <span className="text-amber-300 font-bold">60 دقيقة كاملة</span> بانتظار عودته.
        </p>

        {/* 60-Minute Countdown Clock Display */}
        <div className="mt-5 p-4 rounded-2xl bg-purple-950/70 border border-purple-500/30 backdrop-blur-md w-full max-w-xs shadow-lg">
          <div className="flex items-center justify-center gap-2 text-xs text-purple-300 font-semibold mb-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>الوقت المتبقي لانتهاء مهلة الاستعادة:</span>
          </div>
          <div className="text-3xl font-mono font-black text-amber-300 tracking-wider">
            {formatCountdown(secondsLeft)}
          </div>
          <div className="text-[10px] text-purple-300/70 mt-1">
            تبقى الجلسة نشطة حتى: 60 دقيقة من وقت الانقطاع
          </div>
        </div>

        {/* Session Technical Badges */}
        <div className="grid grid-cols-2 gap-2 w-full max-w-xs mt-4 text-[11px] font-mono">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-right">
            <Server className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="flex flex-col truncate">
              <span className="text-[10px] text-purple-300">غرفة الاتصال</span>
              <span className="text-white font-bold truncate">{callState.roomId || 'AM-ROOM-92'}</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-right">
            <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-purple-300">نبض الخادم</span>
              <span className="text-emerald-300 font-bold">نشط ومرصود</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: The required Return to Call, Leave, and End For All */}
      <div className="relative z-10 flex flex-col gap-2.5 pt-2">
        {/* Prominent "العودة إلى المكالمة" Button */}
        <button
          onClick={handleReturnClick}
          disabled={isReconnectingAttempt}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:opacity-95 active:scale-[0.99] text-white font-black text-base shadow-[0_4px_24px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2.5 transition-all"
        >
          {isReconnectingAttempt ? (
            <>
              <RotateCcw className="w-5 h-5 animate-spin" />
              <span>جاري استعادة الجلسة والتحقق من الهوية...</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
              <span className="text-lg">العودة إلى المكالمة</span>
            </>
          )}
        </button>

        {/* Secondary Actions Row */}
        <div className="flex items-center gap-2">
          {/* Temporary Leave (keeps session alive in background) */}
          <button
            onClick={onLeaveTemporarily}
            className="flex-1 py-3 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700/50 text-purple-200 text-xs font-bold transition-all text-center"
          >
            المغادرة المؤقتة (مع حفظ الجلسة)
          </button>

          {/* End Call for Everyone (permanently closes room) */}
          <button
            onClick={() => {
              if (window.confirm('هل تريد إنهاء جلسة المكالمة نهائياً لجميع المشاركين؟')) {
                soundEffects.playCallEnd();
                onEndCallForEveryone();
              }
            }}
            className="flex-1 py-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>إنهاء للجميع</span>
          </button>
        </div>
      </div>
    </div>
  );
};

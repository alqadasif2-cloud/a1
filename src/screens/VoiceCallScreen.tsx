import React, { useState, useEffect } from 'react';
import { ActiveCallState } from '../types';
import { Mic, MicOff, Volume2, VolumeX, PhoneOff, Minimize2, WifiOff, Sparkles } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface VoiceCallScreenProps {
  callState: ActiveCallState;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onMinimize: () => void;
  onSimulateDisconnect: () => void;
}

export const VoiceCallScreen: React.FC<VoiceCallScreenProps> = ({
  callState,
  onEndCall,
  onToggleMute,
  onToggleSpeaker,
  onMinimize,
  onSimulateDisconnect,
}) => {
  const [seconds, setSeconds] = useState(callState.durationSeconds || 0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="relative w-full h-full min-h-[640px] flex flex-col justify-between overflow-hidden bg-[#090314] text-white select-none">
      {/* Deep Space Radial Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#3a0d63] via-[#16052b] to-[#070112] z-0" />

      {/* Top Controls Bar */}
      <div className="relative z-10 pt-4 px-5 flex items-center justify-between">
        <button
          onClick={onMinimize}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-purple-200 transition-all backdrop-blur-md"
          title="تصغير المكالمة"
        >
          <Minimize2 className="w-4.5 h-4.5" />
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/60 text-[11px] text-purple-200 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>A«»M HD VOICE</span>
        </div>

        {/* Simulate Disconnect Button to test 60-min recovery */}
        <button
          onClick={() => {
            soundEffects.playDisconnectAlert();
            onSimulateDisconnect();
          }}
          className="p-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 transition-all"
          title="اختبار انقطاع الإنترنت (مهلة 60 دقيقة)"
        >
          <WifiOff className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">انقطاع</span>
        </button>
      </div>

      {/* Center Avatar & Concentric Glowing Rings */}
      <div className="relative z-10 flex flex-col items-center my-auto">
        {/* Pulsating Orbital Halos */}
        <div className="relative flex items-center justify-center">
          {/* Outer ring */}
          <div className="absolute w-64 h-64 rounded-full border border-purple-500/20 animate-ping [animation-duration:3s]" />
          {/* Middle ring */}
          <div className="absolute w-52 h-52 rounded-full border-2 border-purple-400/30 shadow-[0_0_30px_rgba(168,85,247,0.3)] animate-pulse" />
          {/* Inner ring */}
          <div className="absolute w-40 h-40 rounded-full bg-purple-600/20 blur-xl" />

          {/* Peer Avatar */}
          <div className="relative z-10 p-1.5 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-400 to-pink-500 shadow-[0_0_35px_rgba(168,85,247,0.6)]">
            <img
              src={callState.peerUser.avatar}
              alt={callState.peerUser.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-[#0e0420]"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Caller Info */}
        <div className="mt-6 text-center">
          <h2 className="text-2xl font-black text-white tracking-wide">
            {callState.peerUser.name}
          </h2>
          <p className="text-sm text-purple-300 mt-1 font-medium">
            مكالمة صوتية مشفرة
          </p>
          <p className="text-lg font-mono font-bold text-white/90 mt-2 tracking-widest">
            {formatDuration(seconds)}
          </p>
        </div>
      </div>

      {/* Bottom Controls Bar (Mic, Speaker, End) */}
      <div className="relative z-10 pb-10 px-8 flex flex-col items-center gap-4">
        <div className="w-full flex items-center justify-around max-w-xs mx-auto">
          {/* Mic Toggle */}
          <button
            onClick={onToggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg ${
              callState.isMuted
                ? 'bg-rose-500/90 text-white'
                : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
            }`}
            title={callState.isMuted ? 'إلغاء كتم الصوت' : 'كتم الميكروفون'}
          >
            {callState.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Speaker Toggle */}
          <button
            onClick={onToggleSpeaker}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg ${
              callState.isSpeaker
                ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
            }`}
            title={callState.isSpeaker ? 'مكبر الصوت مفعّل' : 'تفعيل مكبر الصوت'}
          >
            {callState.isSpeaker ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>

          {/* End Call Button (Red) */}
          <button
            onClick={() => {
              soundEffects.playCallEnd();
              onEndCall();
            }}
            className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center shadow-[0_0_25px_rgba(225,29,72,0.6)] transition-all"
            title="إنهاء المكالمة"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>

        {/* Reconnection note hint */}
        <div className="text-[11px] text-purple-300/60 text-center flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>ميزة الحفاظ على الجلسة لمدة 60 دقيقة مفعلة تلقائياً</span>
        </div>
      </div>
    </div>
  );
};

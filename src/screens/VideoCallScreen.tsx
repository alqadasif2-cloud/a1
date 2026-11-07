import React, { useState, useEffect } from 'react';
import { ActiveCallState } from '../types';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Minimize2,
  RefreshCw,
  WifiOff,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface VideoCallScreenProps {
  callState: ActiveCallState;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  onMinimize: () => void;
  onSimulateDisconnect: () => void;
}

export const VideoCallScreen: React.FC<VideoCallScreenProps> = ({
  callState,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  onMinimize,
  onSimulateDisconnect,
}) => {
  const [seconds, setSeconds] = useState(callState.durationSeconds || 0);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

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
    <div className="relative w-full h-full min-h-[640px] flex flex-col justify-between overflow-hidden bg-slate-950 text-white select-none">
      {/* Remote Video Stream (or high-def portrait) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={callState.peerUser.avatar}
          alt={callState.peerUser.name}
          className="w-full h-full object-cover filter brightness-95 scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/60 pointer-events-none" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 pt-4 px-4 flex items-center justify-between">
        <button
          onClick={onMinimize}
          className="p-2 rounded-full bg-black/40 hover:bg-black/60 active:scale-95 text-white backdrop-blur-md transition-all"
          title="تصغير"
        >
          <Minimize2 className="w-4.5 h-4.5" />
        </button>

        {/* Peer Info & Duration */}
        <div className="flex flex-col items-center bg-black/40 px-3.5 py-1 rounded-full backdrop-blur-md border border-white/10">
          <span className="text-xs font-bold">{callState.peerUser.name}</span>
          <span className="text-[11px] font-mono text-purple-200">
            {formatDuration(seconds)}
          </span>
        </div>

        {/* Simulate Disconnect Button */}
        <button
          onClick={() => {
            soundEffects.playDisconnectAlert();
            onSimulateDisconnect();
          }}
          className="p-2 rounded-full bg-amber-500/30 hover:bg-amber-500/40 text-amber-300 border border-amber-400/50 backdrop-blur-md text-[10px] font-bold flex items-center gap-1 transition-all"
          title="اختبار انقطاع الإنترنت (مهلة 60 دقيقة)"
        >
          <WifiOff className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">انقطاع</span>
        </button>
      </div>

      {/* Picture-in-Picture Local Camera View */}
      <div className="relative z-10 mx-4 my-auto self-end">
        <div className="w-24 h-36 rounded-2xl overflow-hidden border-2 border-purple-500 shadow-2xl relative bg-slate-800">
          {callState.isVideoEnabled ? (
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
              alt="كاميرتي"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400">
              <VideoOff className="w-6 h-6 mb-1 text-slate-500" />
              <span className="text-[9px]">الكاميرا معطلة</span>
            </div>
          )}

          {/* Switch Camera Button on PiP */}
          <button
            onClick={() => setIsFrontCamera(!isFrontCamera)}
            className="absolute bottom-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 text-[10px]"
            title="تبديل الكاميرا"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Bottom Call Controls Bar */}
      <div className="relative z-10 pb-8 px-6 flex flex-col items-center gap-3">
        <div className="w-full max-w-sm flex items-center justify-around bg-black/50 backdrop-blur-xl py-3 px-4 rounded-3xl border border-white/10 shadow-2xl">
          {/* Flip Camera */}
          <button
            onClick={() => setIsFrontCamera(!isFrontCamera)}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
            title="تبديل الكاميرا الأمامية/الخلفية"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          {/* Video Toggle */}
          <button
            onClick={onToggleVideo}
            className={`p-3 rounded-full transition-all active:scale-95 ${
              !callState.isVideoEnabled
                ? 'bg-rose-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={callState.isVideoEnabled ? 'إيقاف الفيديو' : 'تشغيل الفيديو'}
          >
            {callState.isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Mic Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-3 rounded-full transition-all active:scale-95 ${
              callState.isMuted
                ? 'bg-rose-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={callState.isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
          >
            {callState.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Speaker Toggle */}
          <button
            onClick={onToggleSpeaker}
            className={`p-3 rounded-full transition-all active:scale-95 ${
              callState.isSpeaker
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="مكبر الصوت"
          >
            {callState.isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={() => {
              soundEffects.playCallEnd();
              onEndCall();
            }}
            className="p-3 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-lg transition-all"
            title="إنهاء المكالمة"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import { User } from '../types';
import { Phone, PhoneOff, Video, ChevronUp } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface IncomingCallScreenProps {
  caller: User;
  callType: 'audio' | 'video';
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallScreen: React.FC<IncomingCallScreenProps> = ({
  caller,
  callType,
  onAccept,
  onDecline,
}) => {
  useEffect(() => {
    soundEffects.startIncomingRingtone();
    return () => {
      soundEffects.stopRingtone();
    };
  }, []);

  const handleAccept = () => {
    soundEffects.stopRingtone();
    soundEffects.playCallConnected();
    onAccept();
  };

  const handleDecline = () => {
    soundEffects.stopRingtone();
    soundEffects.playCallEnd();
    onDecline();
  };

  return (
    <div className="relative w-full h-full min-h-[640px] flex flex-col justify-between overflow-hidden bg-[#0a0316] text-white select-none">
      {/* Background Cosmic Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#411072] via-[#1a0636] to-[#080112] z-0" />

      {/* Top Title: مكالمة واردة */}
      <div className="relative z-10 pt-10 text-center">
        <span className="text-xs uppercase tracking-widest text-purple-300 font-semibold">
          مكالمة واردة
        </span>
      </div>

      {/* Center Caller Profile */}
      <div className="relative z-10 flex flex-col items-center my-auto">
        {/* Glowing Avatar */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-48 h-48 rounded-full border-2 border-purple-400/40 animate-ping [animation-duration:2.5s]" />
          <div className="absolute w-40 h-40 rounded-full bg-purple-500/25 blur-xl" />

          <div className="relative z-10 p-1.5 rounded-full bg-gradient-to-tr from-purple-400 via-pink-400 to-indigo-400 shadow-[0_0_35px_rgba(168,85,247,0.5)]">
            <img
              src={caller.avatar}
              alt={caller.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-[#120527]"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Name and Call Type */}
        <div className="mt-6 text-center">
          <h2 className="text-2xl font-black text-white tracking-wide">
            {caller.name}
          </h2>
          <div className="flex items-center justify-center gap-1.5 text-sm text-purple-200 mt-1 font-medium">
            {callType === 'video' ? (
              <>
                <Video className="w-4 h-4 text-purple-300" />
                <span>مكالمة فيديو فائقة الوضوح</span>
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 text-purple-300" />
                <span>مكالمة صوتية A«»M</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Answer / Decline Controls matching reference */}
      <div className="relative z-10 pb-12 px-10 flex flex-col items-center gap-6">
        {/* Swipe / Tap to answer hint */}
        <div
          onClick={handleAccept}
          className="flex flex-col items-center gap-1 text-purple-200/80 cursor-pointer animate-bounce hover:text-white transition-colors"
        >
          <ChevronUp className="w-5 h-5" />
          <span className="text-xs font-semibold">اسحب للرد أو اضغط</span>
        </div>

        {/* Buttons Row (Accept Green | Decline Red) */}
        <div className="w-full flex items-center justify-around max-w-xs mx-auto">
          {/* Decline (Red) */}
          <button
            onClick={handleDecline}
            className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center shadow-[0_0_25px_rgba(225,29,72,0.5)] transition-all"
            title="رفض المكالمة"
          >
            <PhoneOff className="w-7 h-7" />
          </button>

          {/* Accept (Green) */}
          <button
            onClick={handleAccept}
            className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.6)] animate-pulse transition-all"
            title="قبول المكالمة"
          >
            <Phone className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};

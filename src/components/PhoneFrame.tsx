import React from 'react';
import { Wifi, BatteryMedium, Signal, PhoneCall, RotateCcw } from 'lucide-react';
import { ActiveCallState } from '../types';

interface PhoneFrameProps {
  children: React.ReactNode;
  activeCall: ActiveCallState | null;
  onRestoreCall?: () => void;
  className?: string;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  activeCall,
  onRestoreCall,
  className = '',
}) => {
  return (
    <div
      className={`relative mx-auto rounded-[48px] p-3.5 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.15)] max-w-[390px] w-full aspect-[9/19.5] min-h-[760px] flex flex-col overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Outer Titanium Bezel Highlights */}
      <div className="absolute inset-0 rounded-[48px] pointer-events-none border border-white/20" />

      {/* Screen Container with rounded corners */}
      <div className="relative w-full h-full rounded-[38px] overflow-hidden bg-slate-900 flex flex-col shadow-inner">
        {/* Dynamic Island / Speaker cutout */}
        <div className="absolute top-2.5 inset-x-0 z-40 flex items-center justify-between px-7 pointer-events-none select-none">
          {/* Time (matching reference: 9:41) */}
          <span className="text-[13px] font-bold font-sans tracking-tight text-white/90 drop-shadow-sm">
            9:41
          </span>

          {/* Dynamic Island Pill */}
          <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center gap-1.5 px-2 shadow-md">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800" />
            <div className="w-2 h-2 rounded-full bg-[#10072b]" />
          </div>

          {/* Status Bar Icons: Signal, Wifi, Battery */}
          <div className="flex items-center gap-1.5 text-white/90">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="w-5 h-2.5 border border-white/80 rounded-sm p-0.5 flex items-center">
              <div className="w-full h-full bg-white rounded-xs" />
            </div>
          </div>
        </div>

        {/* Floating Call Session Recovery Banner (if call is active & minimized or connection dropped) */}
        {activeCall && activeCall.status !== 'ended' && activeCall.isMinimized && onRestoreCall && (
          <div className="absolute top-11 inset-x-3 z-50 animate-in slide-in-from-top-4 duration-300">
            <div
              onClick={onRestoreCall}
              className={`p-2.5 rounded-2xl flex items-center justify-between shadow-2xl cursor-pointer border backdrop-blur-md transition-all ${
                activeCall.status === 'disconnected_waiting'
                  ? 'bg-amber-950/90 border-amber-500/60 text-amber-200'
                  : 'bg-purple-950/90 border-purple-500/60 text-purple-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      activeCall.status === 'disconnected_waiting' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${
                      activeCall.status === 'disconnected_waiting' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                </span>

                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-white">
                    {activeCall.status === 'disconnected_waiting'
                      ? 'انقطاع مؤقت - مهلة 60 دقيقة'
                      : `مكالمة جارية: ${activeCall.peerUser.name}`}
                  </span>
                  <span className="text-[10px] opacity-80 font-mono">
                    {activeCall.status === 'disconnected_waiting'
                      ? 'غرفة الاتصال محفوظة سحابياً'
                      : 'اضغط للعودة إلى واجهة المكالمة'}
                  </span>
                </div>
              </div>

              <button className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm">
                <RotateCcw className="w-3 h-3" />
                <span>العودة للمكالمة</span>
              </button>
            </div>
          </div>
        )}

        {/* Screen Children with top padding for status bar */}
        <div className="w-full h-full pt-8 flex flex-col overflow-hidden relative">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="absolute bottom-1 inset-x-0 z-40 flex justify-center pointer-events-none pb-1">
          <div className="w-32 h-1 bg-white/40 dark:bg-white/30 rounded-full" />
        </div>
      </div>
    </div>
  );
};

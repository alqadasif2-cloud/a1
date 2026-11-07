import React from 'react';
import { LogoAM } from '../components/LogoAM';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onStart: () => void;
  onLogin: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart, onLogin }) => {
  return (
    <div className="relative w-full h-full min-h-[640px] flex flex-col justify-between overflow-hidden bg-[#0c041a] text-white select-none">
      {/* Background Cosmic Deep Space & Nebula */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#4a127a] via-[#1a0636] to-[#070112] z-0" />

      {/* Subtle Star Particles */}
      <div className="absolute inset-0 opacity-40 pointer-events-none z-0">
        <div className="absolute top-[12%] left-[18%] w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        <div className="absolute top-[28%] right-[14%] w-1 h-1 bg-purple-200 rounded-full" />
        <div className="absolute top-[35%] left-[30%] w-2 h-2 bg-purple-300 rounded-full blur-[1px] animate-pulse" />
        <div className="absolute top-[48%] right-[22%] w-1.5 h-1.5 bg-white rounded-full opacity-60" />
        <div className="absolute top-[60%] left-[15%] w-1 h-1 bg-purple-300 rounded-full" />
        <div className="absolute top-[18%] right-[32%] w-1.5 h-1.5 bg-cyan-200 rounded-full animate-ping duration-1000" />
      </div>

      {/* Top Status Bar Spacer */}
      <div className="relative z-10 pt-10 px-6 flex items-center justify-between text-xs text-purple-300/60 font-mono">
        <span>A«»M NETWORK</span>
        <span className="flex items-center gap-1.5 text-purple-300">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> V2.0
        </span>
      </div>

      {/* Center Hero: Crown + Orbital Logo + A«»M + Tagline */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto px-6 text-center">
        {/* Ambient Halo */}
        <div className="absolute w-64 h-64 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <LogoAM size="hero" showTagline={true} theme="dark" />
        </div>
      </div>

      {/* Bottom Area: Digital Glowing World Map Grid + Action Button */}
      <div className="relative z-10 w-full pb-8 px-6 flex flex-col items-center">
        {/* Stylized Digital Global Network Grid (Matching Reference) */}
        <div className="relative w-full h-44 mb-4 overflow-hidden rounded-2xl flex items-center justify-center">
          {/* Subtle World Map Silhouette SVG with Cyan/Purple Nodes */}
          <svg
            viewBox="0 0 500 240"
            className="w-full h-full opacity-80 filter drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            fill="none"
          >
            {/* Latitude / Longitude lines */}
            <ellipse cx="250" cy="160" rx="220" ry="80" stroke="#7e22ce" strokeWidth="0.8" opacity="0.4" strokeDasharray="3 3" />
            <ellipse cx="250" cy="180" rx="190" ry="60" stroke="#9333ea" strokeWidth="0.8" opacity="0.4" />
            <path d="M 50 160 Q 250 80 450 160" stroke="#a855f7" strokeWidth="1" opacity="0.5" />
            <path d="M 80 180 Q 250 110 420 180" stroke="#c084fc" strokeWidth="0.8" opacity="0.4" />

            {/* Continents Geometric Polygon approximation */}
            <path
              d="M 120 70 L 160 65 L 180 85 L 160 110 L 130 115 L 110 90 Z"
              fill="#581c87"
              opacity="0.35"
            />
            <path
              d="M 220 55 L 280 50 L 310 80 L 290 120 L 250 130 L 220 90 Z"
              fill="#6b21a8"
              opacity="0.4"
            />
            <path
              d="M 230 110 L 280 115 L 290 170 L 260 200 L 240 160 Z"
              fill="#581c87"
              opacity="0.4"
            />
            <path
              d="M 330 65 L 420 70 L 440 120 L 380 140 L 350 110 Z"
              fill="#7e22ce"
              opacity="0.35"
            />

            {/* Glowing Connection Nodes */}
            <circle cx="160" cy="85" r="3.5" fill="#38bdf8" />
            <circle cx="260" cy="75" r="4" fill="#f43f5e" />
            <circle cx="280" cy="130" r="3" fill="#a855f7" />
            <circle cx="380" cy="90" r="4.5" fill="#eab308" />
            <circle cx="340" cy="150" r="3" fill="#38bdf8" />

            {/* Connecting Arc Lines */}
            <path d="M 160 85 Q 210 50 260 75" stroke="#38bdf8" strokeWidth="1.2" opacity="0.8" />
            <path d="M 260 75 Q 320 60 380 90" stroke="#eab308" strokeWidth="1.2" opacity="0.8" />
            <path d="M 260 75 Q 270 100 280 130" stroke="#f43f5e" strokeWidth="1.2" opacity="0.8" />
            <path d="M 280 130 Q 310 150 340 150" stroke="#c084fc" strokeWidth="1" opacity="0.8" />
          </svg>

          {/* Radial Fade Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c041a] via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onStart}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 active:scale-[0.98] transition-all text-white font-bold text-base shadow-[0_4px_24px_rgba(147,51,234,0.5)] flex items-center justify-center gap-2"
          >
            <span>ابدأ الاستخدام</span>
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={onLogin}
            className="w-full py-2.5 px-6 rounded-xl text-purple-300 hover:text-white transition-colors text-sm font-medium"
          >
            لديك حساب بالفعل؟ <span className="underline font-bold text-white">تسجيل الدخول</span>
          </button>
        </div>
      </div>
    </div>
  );
};

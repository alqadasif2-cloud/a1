import React from 'react';

interface LogoAMProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showTagline?: boolean;
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
  horizontal?: boolean;
}

export const LogoAM: React.FC<LogoAMProps> = ({
  size = 'md',
  showTagline = true,
  theme = 'auto',
  className = '',
  horizontal = false,
}) => {
  // Dimension scales
  const dimensions = {
    sm: { emblemSize: 36, fontSize: 'text-lg', crownScale: 0.6, ringStroke: 2 },
    md: { emblemSize: 56, fontSize: 'text-2xl', crownScale: 0.8, ringStroke: 2.5 },
    lg: { emblemSize: 84, fontSize: 'text-3xl', crownScale: 1, ringStroke: 3 },
    xl: { emblemSize: 110, fontSize: 'text-4xl', crownScale: 1.25, ringStroke: 3.5 },
    hero: { emblemSize: 140, fontSize: 'text-5xl', crownScale: 1.5, ringStroke: 4 },
  }[size];

  const textColor =
    theme === 'dark'
      ? 'text-white'
      : theme === 'light'
      ? 'text-[#2a0b54]'
      : 'text-slate-900 dark:text-white';

  const taglineColor =
    theme === 'dark'
      ? 'text-purple-200/90'
      : theme === 'light'
      ? 'text-purple-700/80'
      : 'text-purple-700/80 dark:text-purple-200/80';

  return (
    <div
      className={`flex select-none items-center justify-center ${
        horizontal ? 'flex-row gap-3' : 'flex-col gap-1'
      } ${className}`}
    >
      {/* Emblem: Golden Crown + Capital A + Glowing Cosmic Orbit */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: dimensions.emblemSize, height: dimensions.emblemSize }}
      >
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full filter drop-shadow-[0_4px_16px_rgba(147,51,234,0.45)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Crown Gold Gradient */}
            <linearGradient id="crownGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF2A3" />
              <stop offset="35%" stopColor="#EAB308" />
              <stop offset="70%" stopColor="#CA8A04" />
              <stop offset="100%" stopColor="#FEF08A" />
            </linearGradient>

            {/* Letter 'A' Royal Violet Gradient */}
            <linearGradient id="royalVioletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="45%" stopColor="#7E22CE" />
              <stop offset="85%" stopColor="#4C1D95" />
              <stop offset="100%" stopColor="#2E1065" />
            </linearGradient>

            {/* Orbital Ring Cosmic Glow Gradient */}
            <linearGradient id="orbitGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E9D5FF" />
              <stop offset="30%" stopColor="#A855F7" />
              <stop offset="70%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>

            {/* Neon Glow Filter */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Golden Crown */}
          <g transform="translate(60, 20) scale(0.68) translate(-60, -20)">
            {/* Crown Base & Peaks */}
            <path
              d="M40 34 L43 14 L52 25 L60 10 L68 25 L77 14 L80 34 Z"
              fill="url(#crownGoldGrad)"
              stroke="#B45309"
              strokeWidth="1"
              strokeLinejoin="round"
            />
            {/* Crown Jewels (small sparkling circles on tips) */}
            <circle cx="43" cy="13" r="2.2" fill="#FEF08A" />
            <circle cx="52" cy="24" r="1.8" fill="#FEF08A" />
            <circle cx="60" cy="9" r="2.8" fill="#FFF" />
            <circle cx="68" cy="24" r="1.8" fill="#FEF08A" />
            <circle cx="77" cy="13" r="2.2" fill="#FEF08A" />
            {/* Crown Base Trim */}
            <path
              d="M39 33 Q60 36 81 33"
              stroke="#FDE047"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          {/* Background portion of the Orbital Ring (passes behind A) */}
          <path
            d="M20 72 C12 55, 38 40, 80 46 C98 49, 108 56, 106 63"
            stroke="url(#orbitGlowGrad)"
            strokeWidth={dimensions.ringStroke}
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Stylized Modern Letter 'A' */}
          <g filter="url(#neonGlow)">
            {/* Left Leg */}
            <path
              d="M60 27 L36 94 H49 L55 76 H65 L71 94 H84 L60 27 Z"
              fill="url(#royalVioletGrad)"
              stroke="#A855F7"
              strokeWidth="0.8"
            />
            {/* Inner Triangle Counter of 'A' */}
            <path
              d="M60 48 L57 66 H63 L60 48 Z"
              fill="#FFFFFF"
              opacity="0.95"
            />
            {/* Top Shine Accent */}
            <path
              d="M58 31 L60 28 L62 31 L60 33 Z"
              fill="#FFFFFF"
            />
          </g>

          {/* Foreground portion of the Orbital Ring (cuts across in front of A) */}
          <path
            d="M106 63 C102 75, 75 88, 38 84 C22 82, 14 77, 20 72"
            stroke="url(#orbitGlowGrad)"
            strokeWidth={dimensions.ringStroke + 0.5}
            strokeLinecap="round"
            filter="url(#neonGlow)"
          />

          {/* Sparkle star points on the ring */}
          <circle cx="102" cy="65" r="2" fill="#FFFFFF" />
          <circle cx="26" cy="79" r="1.5" fill="#E9D5FF" />
        </svg>
      </div>

      {/* Typography: A«»M */}
      <div className="flex flex-col items-center">
        <div
          className={`font-black tracking-tight leading-none ${dimensions.fontSize} ${textColor} flex items-center justify-center font-['Plus_Jakarta_Sans',sans-serif]`}
        >
          <span className="font-extrabold">A</span>
          <span className="mx-0.5 text-purple-600 dark:text-purple-400 font-bold opacity-90 scale-95">«»</span>
          <span className="font-extrabold">M</span>
        </div>

        {/* Tagline */}
        {showTagline && !horizontal && (
          <span
            className={`text-xs font-medium tracking-wide mt-1.5 ${taglineColor}`}
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            تواصل .. بلا حدود
          </span>
        )}
      </div>
    </div>
  );
};

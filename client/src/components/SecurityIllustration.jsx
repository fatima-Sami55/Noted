import React from 'react';

export function SecurityIllustration() {
  return (
    <div className="w-full flex justify-center mb-6 select-none">
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-44 h-44 drop-shadow-xl group/illust"
      >
        <defs>
          {/* Main Circle Gradient */}
          <linearGradient id="bgGrad" x1="15" y1="15" x2="175" y2="175" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          {/* Yellow Accent Circle Gradient */}
          <linearGradient id="yellowCircleGrad" x1="102" y1="97" x2="178" y2="173" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          {/* Avatar Clip Path */}
          <clipPath id="avatarClip">
            <circle cx="95" cy="95" r="80" />
          </clipPath>
        </defs>

        {/* 1. Main Background Circle and Clipped Avatar */}
        <g clipPath="url(#avatarClip)">
          {/* Background Solid Gradient */}
          <circle cx="95" cy="95" r="80" fill="url(#bgGrad)" />

          {/* Neck */}
          <rect x="79" y="110" width="32" height="35" fill="#cf9e7e" />
          {/* Inner Collar Neck Skin */}
          <path d="M 80 135 L 95 151 L 110 135 Z" fill="#cf9e7e" />
          
          {/* Left Collar Flap */}
          <path d="M 78 135 L 95 156 L 86 156 Z" fill="#ffffff" />
          {/* Right Collar Flap */}
          <path d="M 112 135 L 95 156 L 104 156 Z" fill="#e2e8f0" />

          {/* Shirt Left (Shaded) */}
          <path d="M 20 175 C 35 142, 65 135, 95 135 L 95 190 L 20 190 Z" fill="#be185d" />
          {/* Shirt Right (Bright) */}
          <path d="M 95 135 C 125 135, 155 142, 170 175 L 170 190 L 95 190 Z" fill="#db2777" />

          {/* Left Ear */}
          <rect x="58" y="70" width="8" height="18" rx="4" fill="#e8be9e" />
          {/* Right Ear */}
          <rect x="124" y="70" width="8" height="18" rx="4" fill="#e8be9e" />

          {/* Head (Cheeks/Chin) */}
          <path d="M 65 55 H 125 V 85 C 125 108, 112 121, 95 121 C 78 121, 65 108, 65 85 Z" fill="#e8be9e" />

          {/* Hair (Comb-over styled quiff) */}
          <path
            d="M 63 78 L 63 50 C 63 28, 75 16, 88 16 C 105 16, 127 25, 127 50 L 127 78 L 122 78 L 122 55 L 68 55 L 68 78 Z"
            fill="#0d2a4a"
          />
        </g>

        {/* 2. Outer White Border Ring */}
        <circle cx="95" cy="95" r="80" stroke="#ffffff" strokeWidth="4" fill="none" />

        {/* 3. Interactive Floating Yellow Circle & Padlock Section */}
        <g className="transition-all duration-500 origin-[140px_135px] group-hover/illust:scale-108 group-hover/illust:rotate-3">
          {/* Yellow Accent Circle */}
          <circle
            cx="140"
            cy="135"
            r="38"
            fill="url(#yellowCircleGrad)"
            stroke="#ffffff"
            strokeWidth="4"
            className="drop-shadow-lg"
          />

          {/* Flat Lock Shadow (shifted slightly down/right) */}
          <rect x="125" y="127" width="34" height="26" rx="5" fill="#d97706" opacity="0.6" />

          {/* Shackle (Arch) */}
          <path
            d="M 129 125 V 115 A 11 11 0 0 1 151 115 V 125"
            stroke="#ffffff"
            strokeWidth="5.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Lock Body */}
          <rect x="123" y="124" width="34" height="26" rx="5" fill="#1e293b" />

          {/* Keyhole Details */}
          <circle cx="140" cy="133" r="3" fill="#0f172a" />
          <path d="M 138.5 135 L 141.5 135 L 143 143 L 137 143 Z" fill="#0f172a" />
        </g>
      </svg>
    </div>
  );
}

export default SecurityIllustration;

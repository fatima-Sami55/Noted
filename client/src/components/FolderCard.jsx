import React from 'react';

const getFolderHash = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const COMPOSITIONS = [
  // 1. Abstract overlapping circles (indigo + amber)
  (
    <svg className="w-full h-full" viewBox="0 0 240 195" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="195" fill="#eef2ff" />
      <circle cx="90" cy="90" r="52" fill="#818cf8" opacity="0.75" />
      <circle cx="150" cy="105" r="48" fill="#fbbf24" opacity="0.8" />
      <circle cx="120" cy="65" r="32" fill="#4f46e5" opacity="0.55" />
    </svg>
  ),
  // 2. Geometric grid pattern (rose + coral)
  (
    <svg className="w-full h-full" viewBox="0 0 240 195" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="195" fill="#fff1f2" />
      <path d="M0 0H240V195H0V0Z" fill="url(#grid-pattern)" />
      <defs>
        <pattern id="grid-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
          <rect width="30" height="30" fill="none" stroke="#fecdd3" strokeWidth="1" />
          <rect x="5" y="5" width="20" height="20" rx="3" fill="#fda4af" opacity="0.65" />
          <circle cx="15" cy="15" r="4" fill="#f43f5e" />
        </pattern>
      </defs>
    </svg>
  ),
  // 3. Flowing wave lines (sky + teal)
  (
    <svg className="w-full h-full" viewBox="0 0 240 195" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="195" fill="#f0f9ff" />
      <path d="M-20 120 C 40 80, 100 160, 160 100 C 220 40, 260 100, 280 80 L280 195 L-20 195 Z" fill="#06b6d4" opacity="0.25" />
      <path d="M-20 145 C 50 105, 80 165, 150 115 C 210 65, 250 135, 280 105 L280 195 L-20 195 Z" fill="#0d9488" opacity="0.45" />
      <path d="M-20 160 C 30 140, 90 190, 160 150 C 220 110, 260 170, 280 150 L280 195 L-20 195 Z" fill="#38bdf8" opacity="0.3" />
    </svg>
  ),
  // 4. Scattered dots constellation (violet + pink)
  (
    <svg className="w-full h-full" viewBox="0 0 240 195" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="195" fill="#faf5ff" />
      <line x1="40" y1="50" x2="100" y2="130" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="4 4" />
      <line x1="100" y1="130" x2="180" y2="80" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="4 4" />
      <line x1="180" y1="80" x2="140" y2="30" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="4 4" />
      <line x1="140" y1="30" x2="40" y2="50" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="40" cy="50" r="12" fill="#d8b4fe" />
      <circle cx="40" cy="50" r="6" fill="#a855f7" />
      <circle cx="100" cy="130" r="16" fill="#fbcfe8" />
      <circle cx="100" cy="130" r="8" fill="#ec4899" />
      <circle cx="180" cy="80" r="10" fill="#e9d5ff" />
      <circle cx="180" cy="80" r="4" fill="#c084fc" />
      <circle cx="140" cy="30" r="14" fill="#fce7f3" />
      <circle cx="140" cy="30" r="6" fill="#f472b6" />
    </svg>
  ),
  // 5. Diagonal stripe composition (emerald + lime)
  (
    <svg className="w-full h-full" viewBox="0 0 240 195" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="195" fill="#ecfdf5" />
      <path d="M-50 195 L120 -50 H160 L-10 195 Z" fill="#34d399" opacity="0.35" />
      <path d="M0 195 L170 -50 H210 L40 195 Z" fill="#a3e635" opacity="0.4" />
      <path d="M50 195 L220 -50 H260 L90 195 Z" fill="#059669" opacity="0.25" />
      <circle cx="185" cy="135" r="26" fill="#10b981" opacity="0.55" />
      <circle cx="65" cy="65" r="18" fill="#84cc16" opacity="0.45" />
    </svg>
  ),
  // 6. Concentric arcs (orange + yellow)
  (
    <svg className="w-full h-full" viewBox="0 0 240 195" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="195" fill="#fff7ed" />
      <circle cx="120" cy="195" r="110" stroke="#fb923c" strokeWidth="12" fill="none" opacity="0.75" />
      <circle cx="120" cy="195" r="80" stroke="#facc15" strokeWidth="8" fill="none" opacity="0.8" />
      <circle cx="120" cy="195" r="50" stroke="#ea580c" strokeWidth="6" fill="none" opacity="0.55" />
      <circle cx="120" cy="195" r="25" fill="#f59e0b" />
    </svg>
  )
];

export function FolderCard({ name, noteCount, lastEdited, onClick }) {
  const hash = getFolderHash(name);
  const composition = COMPOSITIONS[hash % COMPOSITIONS.length];

  return (
    <div 
      onClick={onClick}
      className="notebook-card w-full max-w-[240px] h-[300px] bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#ede9e3]/60 cursor-pointer overflow-hidden flex flex-col relative select-none"
    >
      {/* Cover Illustration Area (Top 65%) */}
      <div className="h-[65%] w-full relative overflow-hidden bg-slate-50 flex-shrink-0">
        {composition}
        {/* Red elastic band - full height of illustration area */}
        <div className="absolute left-[30%] top-0 bottom-0 w-[6px] bg-[#e63946] shadow-[1px_0_4px_rgba(0,0,0,0.15)] z-10" />
      </div>

      {/* Title & Metadata Area (Bottom 35%) */}
      <div className="h-[35%] bg-white p-4 flex flex-col justify-between border-t border-[#ede9e3]/50">
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-serif font-bold text-lg text-slate-800 leading-tight truncate">
            {name}
          </h3>
          <span className="text-[11px] font-sans text-slate-400 font-semibold whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 flex-shrink-0">
            {noteCount} Sheets
          </span>
        </div>
        <div className="text-[10px] font-sans text-slate-400 font-medium">
          Last edited {lastEdited || 'recently'}
        </div>
      </div>
    </div>
  );
}

export default FolderCard;

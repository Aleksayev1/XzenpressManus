import React from 'react';

interface ZenAvatarProps {
  state: 'idle' | 'listening' | 'speaking';
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const ZenAvatar: React.FC<ZenAvatarProps> = ({ state, onClick, size = 'lg' }) => {
  // ── Compact / Header Mode (38px) ──
  if (size === 'sm') {
    return (
      <div 
        onClick={onClick}
        className="relative flex items-center justify-center cursor-pointer group flex-shrink-0"
        style={{ width: '38px', height: '38px' }}
        title={`Robozinho Zen (${state})`}
      >
        {/* Subtle glow ring */}
        <div 
          className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none
            ${state === 'idle' ? 'bg-purple-500/20 animate-pulse' : ''}
            ${state === 'listening' ? 'bg-emerald-500/40 animate-ping' : ''}
            ${state === 'speaking' ? 'bg-pink-500/40 animate-pulse scale-110' : ''}
          `}
        />
        {/* Core circle */}
        <div 
          className={`relative z-10 w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr transition-all duration-500 overflow-hidden shadow-md
            ${state === 'idle' ? 'from-purple-600 via-indigo-600 to-pink-500 shadow-purple-500/30' : ''}
            ${state === 'listening' ? 'from-emerald-500 via-teal-500 to-cyan-400 shadow-emerald-500/40 scale-105' : ''}
            ${state === 'speaking' ? 'from-pink-500 via-purple-600 to-indigo-500 shadow-pink-500/50 scale-110' : ''}
          `}
        >
          <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden relative flex items-center justify-center">
            <img 
              src="/robo-zen-meditando.png" 
              alt="Robozinho Zen"
              className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform"
            />
            {/* Overlay Indicator */}
            <div 
              className={`absolute inset-0 bg-gradient-to-t pointer-events-none transition-opacity duration-500
                ${state === 'idle' ? 'from-purple-900/40 via-transparent to-transparent opacity-60' : ''}
                ${state === 'listening' ? 'from-emerald-900/50 via-transparent to-transparent opacity-80' : ''}
                ${state === 'speaking' ? 'from-pink-900/40 via-transparent to-transparent opacity-60' : ''}
              `}
            />
          </div>
        </div>
        {/* Status dot */}
        <div 
          className={`absolute -bottom-0.5 -right-0.5 z-20 w-3 h-3 rounded-full border-2 border-slate-900 flex items-center justify-center
            ${state === 'idle' ? 'bg-purple-500' : ''}
            ${state === 'listening' ? 'bg-emerald-400 animate-pulse' : ''}
            ${state === 'speaking' ? 'bg-pink-400 animate-bounce' : ''}
          `}
        >
          <div className="w-1 h-1 rounded-full bg-white" />
        </div>
      </div>
    );
  }

  const isMd = size === 'md';
  const containerDim = isMd ? '124px' : '180px';
  const ring1Dim = isMd 
    ? (state === 'idle' ? 'w-30 h-30' : state === 'listening' ? 'w-32 h-32' : 'w-34 h-34')
    : (state === 'idle' ? 'w-44 h-44' : state === 'listening' ? 'w-48 h-48' : 'w-52 h-52');
  const ring2Dim = isMd 
    ? (state === 'idle' ? 'w-26 h-26' : state === 'listening' ? 'w-28 h-28' : 'w-30 h-30')
    : (state === 'idle' ? 'w-40 h-40' : state === 'listening' ? 'w-44 h-44' : 'w-48 h-48');
  const coreDim = isMd ? 'w-24 h-24' : 'w-36 h-36';

  return (
    <div 
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer group"
      style={{ width: containerDim, height: containerDim }}
    >
      {/* BACKGROUND WAVE GLOWS (Spotify / Siri style) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Ring 1 - Deep Glow */}
        <div 
          className={`absolute rounded-full border border-purple-500/30 bg-purple-500/5 transition-all duration-1000 ease-in-out
            ${ring1Dim}
            ${state === 'idle' ? 'animate-pulse opacity-40' : ''}
            ${state === 'listening' ? 'animate-ping opacity-60 bg-emerald-500/5 border-emerald-500/30' : ''}
            ${state === 'speaking' ? 'animate-pulse scale-105 border-purple-500/50 bg-purple-500/10' : ''}
          `}
          style={{
            animationDuration: state === 'speaking' ? '1.2s' : state === 'listening' ? '2s' : '4s'
          }}
        />
        
        {/* Ring 2 - Morphing/Pulsing Waves */}
        <div 
          className={`absolute rounded-full border-2 border-dashed transition-all duration-700
            ${ring2Dim}
            ${state === 'idle' ? 'border-purple-400/20 rotate-180 animate-[spin_20s_linear_infinite]' : ''}
            ${state === 'listening' ? 'border-emerald-400/40 animate-[spin_4s_linear_infinite] scale-110' : ''}
            ${state === 'speaking' ? 'border-purple-400/60 animate-[ping_1.5s_ease-in-out_infinite]' : ''}
          `}
        />

        {/* Ring 3 - Glowing Energy Waves (Spotify DJ DJX style) */}
        {state === 'speaking' && (
          <>
            <div className={`absolute ${isMd ? 'w-28 h-28' : 'w-44 h-44'} rounded-full border border-pink-500/60 animate-[ping_2s_ease-in-out_infinite]`} />
            <div className={`absolute ${isMd ? 'w-26 h-26' : 'w-40 h-40'} rounded-full border-2 border-indigo-400/50 animate-[pulse_0.8s_ease-in-out_infinite]`} />
          </>
        )}
        
        {state === 'listening' && (
          <div className={`absolute ${isMd ? 'w-26 h-26' : 'w-40 h-40'} rounded-full border border-emerald-400/60 animate-pulse`} />
        )}
      </div>

      {/* CORE AVATAR CONTAINER */}
      <div 
        className={`relative z-10 ${coreDim} rounded-full p-1 bg-gradient-to-tr transition-all duration-500 overflow-hidden shadow-2xl
          ${state === 'idle' ? 'from-purple-600 via-indigo-600 to-pink-500 shadow-purple-500/20' : ''}
          ${state === 'listening' ? 'from-emerald-500 via-teal-500 to-cyan-400 shadow-emerald-500/30 scale-105' : ''}
          ${state === 'speaking' ? 'from-pink-500 via-purple-600 to-indigo-500 shadow-pink-500/40 scale-110' : ''}
        `}
      >
        {/* Inner Mask */}
        <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden relative flex items-center justify-center">
          {/* meditando robot image */}
          <img 
            src="/robo-zen-meditando.png" 
            alt="Zen Robot Avatar"
            className="w-full h-full object-cover transition-transform duration-500 scale-105 group-hover:scale-110"
          />

          {/* Glowing Overlay Indicator */}
          <div 
            className={`absolute inset-0 bg-gradient-to-t pointer-events-none transition-opacity duration-500
              ${state === 'idle' ? 'from-purple-900/40 via-transparent to-transparent opacity-60' : ''}
              ${state === 'listening' ? 'from-emerald-900/50 via-transparent to-transparent opacity-80' : ''}
              ${state === 'speaking' ? 'from-pink-900/40 via-transparent to-transparent opacity-60' : ''}
            `}
          />
        </div>
      </div>

      {/* MINI STATE BADGE */}
      <div 
        className={`absolute ${isMd ? 'bottom-1 right-1 w-4 h-4' : 'bottom-3 right-3 w-5 h-5'} z-20 rounded-full border-2 border-slate-900 shadow-lg flex items-center justify-center transition-all duration-500
          ${state === 'idle' ? 'bg-purple-500 shadow-purple-500/50' : ''}
          ${state === 'listening' ? 'bg-emerald-500 shadow-emerald-500/50 scale-110' : ''}
          ${state === 'speaking' ? 'bg-pink-500 shadow-pink-500/50 scale-110 animate-bounce' : ''}
        `}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      </div>
    </div>
  );
};
export default ZenAvatar;

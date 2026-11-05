import React from 'react';
import { Skull, Sparkles, Minus, Square, X, UserCheck } from 'lucide-react';

interface HeaderProps {
  onEditProfile: () => void;
  onResetSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onEditProfile, onResetSession }) => {
  return (
    <header className="h-11 bg-gradient-to-r from-zinc-950 via-slate-900 to-black text-white flex items-center justify-between px-3.5 select-none shadow-xl border-b border-rose-500/30 backdrop-blur-md">
      {/* Brand & Rawr Heart */}
      <div className="flex items-center space-x-2.5">
        <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-rose-950/60 border border-rose-500/40 shadow-inner group cursor-pointer" onClick={onEditProfile} title="DEADVOX Profile">
          <span className="text-base transform group-hover:scale-125 transition-transform">🖤</span>
          <span className="absolute -top-1 -right-1 text-[10px]">⚡</span>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="font-extrabold tracking-wider text-sm bg-gradient-to-r from-rose-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-1">
            DEADVOX
          </span>
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 tracking-widest hidden sm:inline">
            v2006.X
          </span>
        </div>
      </div>

      {/* Slogan banner */}
      <div className="hidden md:flex items-center text-xs text-zinc-400 font-mono tracking-tight">
        <Skull className="w-3.5 h-3.5 mr-1.5 text-rose-500 animate-pulse" />
        <span>a place for the misunderstood • post with zero login</span>
      </div>

      {/* Action Controls (NO sound toggle, purely visual) */}
      <div className="flex items-center space-x-2">
        {/* Switch Persona / Identity button */}
        <button
          onClick={onEditProfile}
          className="text-xs bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 px-2.5 py-1 rounded-md transition border border-rose-500/30 flex items-center gap-1.5 hover:shadow-[0_0_10px_rgba(244,63,94,0.3)]"
          title="Switch persona, avatar, or mood"
        >
          <UserCheck className="w-3.5 h-3.5 text-rose-400" />
          <span className="font-semibold text-[11px]">My Persona</span>
        </button>

        <div className="h-4 w-px bg-zinc-800 mx-1" />

        {/* Retro Window buttons */}
        <div className="flex items-center space-x-1">
          <button
            className="w-6 h-6 flex items-center justify-center hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition"
            title="Minimize"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            className="w-6 h-6 flex items-center justify-center hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition"
            title="Maximize"
          >
            <Square className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={onResetSession}
            className="w-6 h-6 flex items-center justify-center hover:bg-rose-600 rounded text-zinc-400 hover:text-white transition"
            title="Leave The Void"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </header>
  );
};

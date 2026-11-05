import React from 'react';
import { Skull, Radio, Users } from 'lucide-react';

interface HeaderProps {
  onlineCount: number;
  userName: string;
  onShuffleName: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onlineCount, userName, onShuffleName }) => {
  return (
    <header className="h-12 bg-gradient-to-r from-zinc-950 via-slate-900 to-black text-white flex items-center justify-between px-3 md:px-4 select-none shadow-xl border-b border-rose-500/30 flex-shrink-0 z-20">
      {/* Brand & Rawr Heart */}
      <div className="flex items-center space-x-2">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/40 shadow-inner">
          <span className="text-lg">🖤</span>
          <span className="absolute -top-1 -right-1 text-[10px]">⚡</span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-baseline space-x-1.5">
            <span className="font-extrabold tracking-wider text-sm md:text-base bg-gradient-to-r from-rose-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              DEADVOX
            </span>
            <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
              • Open Chat Wall
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 font-mono -mt-0.5 sm:hidden">
            Open Chat • No Login
          </span>
        </div>
      </div>

      {/* Center status pill */}
      <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
        <span className="hidden xs:inline">Live:</span>
        <span className="font-bold text-emerald-400">{onlineCount}</span>
        <span className="hidden sm:inline text-zinc-500">freaks</span>
      </div>

      {/* Right: Quick Name tag & Shuffle */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onShuffleName}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-mono transition active:scale-95 hover:shadow-[0_0_10px_rgba(244,63,94,0.3)]"
          title="Click to roll a new scene name"
        >
          <span className="text-[11px] font-bold truncate max-w-[110px] sm:max-w-[160px]">
            {userName}
          </span>
          <span className="text-[10px] opacity-70">🎲</span>
        </button>
      </div>
    </header>
  );
};

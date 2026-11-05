import React from 'react';
import { MessageSquare, Users, Moon, Sun, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onlineCount: number;
  userName: string;
  onShuffleName: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onlineCount,
  userName,
  onShuffleName,
  isDark,
  onToggleTheme,
}) => {
  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between select-none shadow-xs flex-shrink-0 z-20">
      {/* Brand */}
      <div className="flex items-center space-x-2.5">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
              OpenChat
            </h1>
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{onlineCount} online</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
            Simple public messaging • All posts saved permanently
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-2">
        {/* Name pill */}
        <button
          onClick={onShuffleName}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition"
          title="Click to change your display name"
        >
          <span className="text-slate-400 text-[11px]">You:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 max-w-[100px] truncate">
            {userName}
          </span>
          <RefreshCw className="w-3 h-3 text-slate-400" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { ToastNotification } from '../types';
import { DEFAULT_AVATARS } from '../utils/avatars';
import { X, Skull } from 'lucide-react';

interface ToastAlertProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
  onClickToast?: (toast: ToastNotification) => void;
}

export const ToastAlert: React.FC<ToastAlertProps> = ({ toasts, onDismiss, onClickToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full select-none">
      {toasts.map((toast) => {
        const avatar = toast.avatar ? DEFAULT_AVATARS.find((a) => a.id === toast.avatar) : null;

        return (
          <div
            key={toast.id}
            onClick={() => onClickToast && onClickToast(toast)}
            className="pointer-events-auto bg-zinc-950/95 border-2 border-rose-500/60 rounded-2xl p-3 shadow-2xl flex items-start space-x-3 animate-toast-in cursor-pointer transition transform hover:scale-102 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]"
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {avatar ? (
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatar.bgGradient} flex items-center justify-center text-xl shadow-md border border-zinc-700`}>
                  {avatar.emoji}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-900 to-black flex items-center justify-center text-xl shadow-md text-rose-400 border border-rose-700">
                  🖤
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                  <Skull className="w-3 h-3 text-rose-500" />
                  {toast.title}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(toast.id);
                  }}
                  className="text-zinc-500 hover:text-white p-0.5 rounded transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <div className="text-xs font-bold text-zinc-100 truncate mt-0.5 font-msn">
                {toast.message}
              </div>

              <div className="text-[10px] text-zinc-500 font-mono mt-1">
                DEADVOX • Just now
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

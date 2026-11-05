import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../types';
import { DEFAULT_AVATARS } from '../utils/avatars';
import { parseEmoticons } from '../utils/emoticons';
import { AVAILABLE_WINKS } from '../utils/winks';
import { Zap, ShieldAlert, Sparkles } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  typingUsers: string[];
  isNudging: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  typingUsers,
  isNudging,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div
      ref={scrollRef}
      className={`flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gradient-to-b from-black via-zinc-950 to-zinc-900 transition-transform ${
        isNudging ? 'animate-scream' : ''
      }`}
    >
      {/* Welcome Banner */}
      <div className="text-center py-2 px-3 sm:px-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 max-w-lg mx-auto font-mono select-none">
        <div className="font-bold text-rose-400 flex items-center justify-center gap-1 mb-0.5 text-xs sm:text-sm">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>DEADVOX • Permanent Open Chat Wall</span>
        </div>
        <div className="text-[11px] text-zinc-500">
          All messages are saved permanently. Anyone can post without signing in.
        </div>
      </div>

      {/* Message Stream */}
      {messages.map((msg, index) => {
        const isNudge = msg.type === 'nudge';
        const isWink = msg.type === 'wink';
        const isInk = msg.type === 'ink';
        const isImage = msg.type === 'image';
        const avatar = DEFAULT_AVATARS.find((a) => a.id === msg.senderAvatar) || DEFAULT_AVATARS[0];

        // SCREAM Event Banner
        if (isNudge) {
          return (
            <div
              key={msg.id}
              className="my-2 py-2 px-3 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-300 text-xs font-extrabold flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-bounce-in font-mono"
            >
              <Zap className="w-4 h-4 fill-rose-500 animate-pulse flex-shrink-0" />
              <span className="truncate">
                — {msg.senderName} JUST SCREAMED! —
              </span>
              <span className="text-[10px] text-rose-400/80 font-normal ml-1 flex-shrink-0">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          );
        }

        // Scene Blast Event Banner
        if (isWink) {
          const winkData = AVAILABLE_WINKS.find((w) => w.id === msg.content);
          return (
            <div
              key={msg.id}
              className="my-2 py-2 px-3 rounded-xl bg-purple-950/70 border border-fuchsia-500/50 text-fuchsia-300 text-xs font-bold flex items-center justify-center space-x-2 shadow-[0_0_10px_rgba(217,70,239,0.3)] font-mono"
            >
              <span className="text-base sm:text-lg flex-shrink-0">{winkData?.icon || '⚡'}</span>
              <span className="truncate">
                {msg.senderName} triggered Scene Blast: "{winkData?.name || 'Blast'}"
              </span>
              <span className="text-[10px] text-fuchsia-400 font-normal ml-1 flex-shrink-0">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          );
        }

        // Standard Message Item
        return (
          <div
            key={msg.id}
            className="flex items-start space-x-2.5 sm:space-x-3 group animate-bounce-in"
          >
            {/* Avatar badge */}
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br ${avatar.bgGradient} flex items-center justify-center text-base sm:text-lg flex-shrink-0 shadow-md border border-zinc-800 mt-0.5`}>
              <span>{avatar.emoji}</span>
            </div>

            {/* Content container */}
            <div className="flex-1 min-w-0">
              {/* Header: <Name> writes: [time] */}
              <div className="flex items-baseline space-x-1.5 text-xs font-mono">
                <span
                  style={{ color: msg.fontColor || '#ff007f' }}
                  className="font-bold truncate max-w-[140px] sm:max-w-xs"
                >
                  &lt;{msg.senderName}&gt;
                </span>
                <span className="text-zinc-600 text-[10px]">
                  {formatDate(msg.timestamp)} {formatTime(msg.timestamp)}
                </span>
              </div>

              {/* Message content */}
              <div className="mt-0.5 text-sm sm:text-base text-zinc-100 break-words leading-relaxed">
                {isInk || isImage ? (
                  <div className="mt-1">
                    <img
                      src={msg.content}
                      alt="Doodle"
                      onClick={() => setLightboxImage(msg.content)}
                      className="max-h-56 sm:max-h-64 rounded-xl border border-zinc-700 shadow-md cursor-zoom-in hover:opacity-95 transition"
                    />
                    <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                      {isInk ? 'Sharpie Scribble' : 'Image attachment'} (Tap to enlarge)
                    </span>
                  </div>
                ) : (
                  <p
                    style={{ color: msg.fontColor || 'inherit' }}
                    className="whitespace-pre-wrap select-text font-msn"
                  >
                    {parseEmoticons(msg.content)}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Real-time typing notification */}
      {typingUsers.length > 0 && (
        <div className="flex items-center space-x-2 text-xs italic text-rose-400/80 animate-pulse py-1 font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>
            {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} writing...
          </span>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-3 cursor-zoom-out backdrop-blur-xs"
        >
          <img
            src={lightboxImage}
            alt="Full size"
            className="max-w-full max-h-full rounded-2xl shadow-2xl border-2 border-rose-500/50"
          />
        </div>
      )}
    </div>
  );
};

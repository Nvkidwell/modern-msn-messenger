import React, { useRef, useEffect, useState } from 'react';
import { Message, User } from '../types';
import { DEFAULT_AVATARS } from '../utils/avatars';
import { parseEmoticons } from '../utils/emoticons';
import { AVAILABLE_WINKS } from '../utils/winks';
import { Zap, Radio, Skull, Guitar, ShieldAlert, Sparkles } from 'lucide-react';

interface ChatWindowProps {
  activeChatId: string;
  users: User[];
  currentUser: User;
  messages: Message[];
  typingUsers: string[];
  onSendNudge: () => void;
  isNudging: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  activeChatId,
  users,
  currentUser,
  messages,
  typingUsers,
  onSendNudge,
  isNudging,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const isVoid = activeChatId === 'the_void';
  const targetUser = !isVoid ? users.find((u) => u.id === activeChatId) : null;
  const avatar = targetUser ? (DEFAULT_AVATARS.find((a) => a.id === targetUser.avatar) || DEFAULT_AVATARS[0]) : null;

  // Filter messages
  const chatMessages = messages.filter((m) => {
    if (isVoid) {
      return m.roomId === 'the_void';
    } else {
      return (
        (m.senderId === currentUser.id && m.targetUserId === activeChatId) ||
        (m.senderId === activeChatId && (m.targetUserId === currentUser.id || !m.targetUserId))
      );
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, typingUsers]);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col h-full bg-zinc-950 transition-transform ${isNudging ? 'animate-scream' : ''}`}>
      {/* Top Header */}
      <div className="p-3 bg-gradient-to-r from-zinc-900 via-zinc-950 to-black border-b border-zinc-800 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="relative flex-shrink-0">
            {isVoid ? (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-900 via-rose-950 to-black flex items-center justify-center text-rose-400 shadow-md border border-rose-500/40">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
            ) : (
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatar?.bgGradient} flex items-center justify-center text-2xl shadow-md border border-zinc-700`}>
                {targetUser?.isBot ? <Skull className="w-6 h-6 text-rose-400" /> : <span>{avatar?.emoji}</span>}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-sm text-zinc-100 truncate tracking-wide">
                {isVoid ? 'THE VOID (Public Wall)' : targetUser?.name || 'Contact'}
              </h2>
              {!isVoid && targetUser?.status && (
                <span className="text-[11px] text-zinc-400 font-mono">
                  &lt;{targetUser.status}&gt;
                </span>
              )}
            </div>

            <div className="text-xs text-zinc-400 truncate italic mt-0.5 flex items-center gap-1 font-mono">
              {isVoid ? (
                <span>Public board • No login required • Unfiltered live chatter</span>
              ) : (
                <>
                  {targetUser?.currentSong ? (
                    <span className="flex items-center gap-1 text-rose-400 not-italic font-semibold">
                      <Guitar className="w-3 h-3" />
                      {targetUser.currentSong}
                    </span>
                  ) : (
                    <span>{parseEmoticons(targetUser?.personalMessage || targetUser?.mood || targetUser?.email || '')}</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action button: SCREAM */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={onSendNudge}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-[0_0_12px_rgba(244,63,94,0.5)] transition transform hover:scale-105 active:scale-95"
            title="SCREAM! Shakes everyone's screen!"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>SCREAM (!)</span>
          </button>
        </div>
      </div>

      {/* Message History */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-black via-zinc-950 to-zinc-900"
      >
        {/* Welcome Alert */}
        <div className="text-center py-2.5 px-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 max-w-lg mx-auto font-mono select-none">
          <div className="font-bold text-rose-400 flex items-center justify-center gap-1.5 mb-0.5">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>DEADVOX • The Underground Wire</span>
          </div>
          <div>Post freely without signing up. Send lyrics, Scene Blasts, scribbles, and screams.</div>
        </div>

        {/* Messages */}
        {chatMessages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isNudge = msg.type === 'nudge';
          const isWink = msg.type === 'wink';
          const isInk = msg.type === 'ink';
          const isImage = msg.type === 'image';

          // SCREAM Banner
          if (isNudge) {
            return (
              <div
                key={msg.id}
                className="my-2 py-2 px-3 rounded-xl bg-rose-950/80 border-2 border-rose-600 text-rose-300 text-xs font-extrabold flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-bounce-in font-mono"
              >
                <Zap className="w-4 h-4 fill-rose-500 animate-pulse" />
                <span>
                  {isMe ? '— YOU JUST SCREAMED! —' : `— ${msg.senderName} JUST SCREAMED AT YOU! —`}
                </span>
                <span className="text-[10px] text-rose-400/80 font-normal ml-2">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            );
          }

          // Scene Blast Banner
          if (isWink) {
            const winkData = AVAILABLE_WINKS.find((w) => w.id === msg.content);
            return (
              <div
                key={msg.id}
                className="my-2 py-2 px-3 rounded-xl bg-purple-950/70 border border-fuchsia-500/50 text-fuchsia-300 text-xs font-bold flex items-center justify-center space-x-2 shadow-[0_0_10px_rgba(217,70,239,0.3)] font-mono"
              >
                <span className="text-lg">{winkData?.icon || '⚡'}</span>
                <span>
                  {isMe
                    ? `You triggered Scene Blast: "${winkData?.name || 'Blast'}"`
                    : `${msg.senderName} summoned Scene Blast: "${winkData?.name || 'Blast'}"`}
                </span>
                <span className="text-[10px] text-fuchsia-400 font-normal ml-2">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            );
          }

          // Standard Chat Message format: "<Sender> screams:" or "<Sender> writes:"
          return (
            <div key={msg.id} className="flex flex-col group items-start">
              <div className="flex items-center space-x-1.5 text-xs font-mono font-bold">
                <span
                  style={{ color: msg.fontColor || (isMe ? '#ff007f' : '#00f0ff') }}
                  className="hover:underline cursor-pointer"
                >
                  &lt;{msg.senderName}&gt;
                </span>
                <span className="text-zinc-500 font-normal">
                  writes:
                </span>
                <span className="text-[10px] text-zinc-600 font-mono opacity-0 group-hover:opacity-100 transition">
                  ({formatTime(msg.timestamp)})
                </span>
              </div>

              {/* Message Body */}
              <div className="ml-3 mt-1 text-sm text-zinc-200 max-w-2xl break-words">
                {isInk || isImage ? (
                  <div className="mt-1">
                    <img
                      src={msg.content}
                      alt="Attachment"
                      onClick={() => setLightboxImage(msg.content)}
                      className="max-h-60 rounded-xl border border-zinc-700 shadow-md cursor-zoom-in hover:opacity-95 transition"
                    />
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {isInk ? 'Sharpie Scribble Graffiti' : 'Image attachment'}
                    </div>
                  </div>
                ) : (
                  <p
                    style={{ color: msg.fontColor || 'inherit' }}
                    className="leading-relaxed font-normal whitespace-pre-wrap select-text font-msn"
                  >
                    {parseEmoticons(msg.content)}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Real-time typing notification */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-xs italic text-rose-400/80 animate-pulse py-1 font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>
              {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} scribbling in their diary...
            </span>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-xs"
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

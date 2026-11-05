import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../types';
import { parseEmoticons } from '../utils/emoticons';
import { getInitials } from '../utils/avatars';

interface ChatWindowProps {
  messages: Message[];
  currentUserName: string;
  typingUsers: string[];
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  currentUserName,
  typingUsers,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

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
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return `Today at ${formatTime(ts)}`;
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950"
    >
      {/* Empty State */}
      {messages.length === 0 && (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
          No messages yet. Be the first to post!
        </div>
      )}

      {/* Message List */}
      {messages.map((msg) => {
        const isMe = msg.senderName.trim().toLowerCase() === currentUserName.trim().toLowerCase();
        const initials = getInitials(msg.senderName);
        const avatarBg = msg.avatarColor || '#3b82f6';

        return (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 group ${
              isMe ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar Circle */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs flex-shrink-0 mt-0.5"
              style={{ backgroundColor: avatarBg }}
            >
              {initials}
            </div>

            {/* Bubble Container */}
            <div className={`max-w-[80%] sm:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {/* Header: Sender & Time */}
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-1 px-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {msg.senderName}
                </span>
                <span className="text-[11px] text-slate-400">
                  {formatDate(msg.timestamp)}
                </span>
              </div>

              {/* Message Box */}
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm sm:text-base break-words shadow-xs ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-tl-xs'
                }`}
              >
                {msg.type === 'image' ? (
                  <div>
                    <img
                      src={msg.content}
                      alt="Attachment"
                      onClick={() => setLightboxImage(msg.content)}
                      className="max-h-64 rounded-xl cursor-zoom-in hover:opacity-95 transition"
                    />
                    <span className="text-[11px] opacity-70 block mt-1">Click to view full image</span>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed select-text">
                    {parseEmoticons(msg.content)}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="flex items-center space-x-2 text-xs text-slate-400 italic py-1 px-2">
          <div className="flex space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
          </div>
          <span>
            {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
          </span>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={lightboxImage}
            alt="Full size"
            className="max-w-full max-h-full rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

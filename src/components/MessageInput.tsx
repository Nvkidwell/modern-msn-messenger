import React, { useState, useRef } from 'react';
import { Send, Image, Smile, Edit2, Check } from 'lucide-react';
import { STANDARD_EMOJIS } from '../utils/emoticons';

interface MessageInputProps {
  userName: string;
  onChangeUserName: (name: string) => void;
  onSendMessage: (content: string, type?: 'text' | 'image') => void;
  onTyping: (isTyping: boolean) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  userName,
  onChangeUserName,
  onSendMessage,
  onTyping,
}) => {
  const [text, setText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    onTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      onTyping(false);
    }, 1500);
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(text.trim(), 'text');
    setText('');
    onTyping(false);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    setText((prev) => `${prev}${emoji}`);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      onChangeUserName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Please choose an image under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onSendMessage(dataUrl, 'image');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0 pb-safe">
      {/* Top row: Name setting */}
      <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200/60 dark:border-slate-800 text-xs flex items-center justify-between text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-2">
          <span>Posting as:</span>
          {isEditingName ? (
            <div className="flex items-center space-x-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
                autoFocus
                className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-blue-500 text-xs text-slate-900 dark:text-white font-medium focus:outline-none w-32"
              />
              <button
                onClick={handleSaveName}
                className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTempName(userName);
                setIsEditingName(true);
              }}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              title="Click to edit name"
            >
              <span>{userName}</span>
              <Edit2 className="w-3 h-3 opacity-60" />
            </button>
          )}
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:inline">
          No sign in needed
        </span>
      </div>

      {/* Main input area */}
      <div className="p-3 flex items-end space-x-2 relative">
        {/* Emoji dropdown tray */}
        {showEmojis && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowEmojis(false)} />
            <div className="absolute bottom-16 left-3 z-40 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2.5 w-64 grid grid-cols-6 gap-1.5 animate-in fade-in zoom-in-95 duration-100">
              {STANDARD_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleInsertEmoji(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Action icons */}
        <div className="flex items-center space-x-1 pb-1">
          <button
            onClick={() => setShowEmojis(!showEmojis)}
            className={`p-2 rounded-xl transition ${
              showEmojis
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Attach photo"
          >
            <Image className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Text Area */}
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Write a message... (Press Enter to send)"
            className="w-full resize-none px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-850 transition"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className={`h-11 px-4 sm:px-5 rounded-2xl font-semibold text-sm flex items-center justify-center space-x-1.5 transition flex-shrink-0 ${
            text.trim()
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/30'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
};

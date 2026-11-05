import React, { useState, useRef } from 'react';
import { Smile, Zap, Sparkles, PenTool, Image, Send, Palette, Dices } from 'lucide-react';
import { EmoticonPicker } from './EmoticonPicker';
import { AVAILABLE_WINKS } from '../utils/winks';

interface MessageInputProps {
  userName: string;
  onChangeUserName: (name: string) => void;
  onShuffleUserName: () => void;
  onSendMessage: (content: string, type?: 'text' | 'image') => void;
  onSendNudge: () => void;
  onSendWink: (winkId: string) => void;
  onOpenInk: () => void;
  onTyping: (isTyping: boolean) => void;
  fontColor: string;
  onChangeFontColor: (color: string) => void;
  nudgeCooldown: number;
}

const SCENE_FONT_COLORS = [
  { label: 'Hot Scene Pink', value: '#ff007f' },
  { label: 'Toxic Acid Lime', value: '#39ff14' },
  { label: 'Cyanide Cyan', value: '#00f0ff' },
  { label: 'Blood Crimson', value: '#e11d48' },
  { label: 'Velvet Purple', value: '#c084fc' },
  { label: 'Electric Amber', value: '#fbbf24' },
  { label: 'Ghost White', value: '#f8fafc' },
];

export const MessageInput: React.FC<MessageInputProps> = ({
  userName,
  onChangeUserName,
  onShuffleUserName,
  onSendMessage,
  onSendNudge,
  onSendWink,
  onOpenInk,
  onTyping,
  fontColor,
  onChangeFontColor,
  nudgeCooldown,
}) => {
  const [text, setText] = useState('');
  const [showEmoticons, setShowEmoticons] = useState(false);
  const [showWinksMenu, setShowWinksMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

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

  const handleInsertEmoticon = (shortcut: string) => {
    setText((prev) => (prev ? `${prev} ${shortcut} ` : `${shortcut} `));
    if (textareaRef.current) textareaRef.current.focus();
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
    <div className="border-t border-zinc-800 bg-zinc-950 flex-shrink-0 select-none pb-safe">
      {/* Top Bar: Inline Name Badge & Quick Tools */}
      <div className="flex items-center justify-between px-2.5 sm:px-3 py-1 bg-zinc-900/90 border-b border-zinc-800/80 text-xs">
        {/* Inline editable name */}
        <div className="flex items-center space-x-1.5 min-w-0">
          <span className="text-[10px] text-zinc-500 font-mono hidden xs:inline">Posting as:</span>
          {isEditingName ? (
            <input
              type="text"
              value={userName}
              onChange={(e) => onChangeUserName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingName(false);
              }}
              autoFocus
              className="bg-zinc-800 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500 text-xs font-mono focus:outline-none w-28 sm:w-36"
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="text-rose-400 hover:text-rose-300 font-mono font-bold text-xs truncate max-w-[120px] sm:max-w-[160px] underline decoration-dotted underline-offset-2"
              title="Click to change your handle"
            >
              {userName}
            </button>
          )}

          <button
            onClick={onShuffleUserName}
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition"
            title="Roll random handle"
          >
            <Dices className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action icons row */}
        <div className="flex items-center space-x-0.5 sm:space-x-1">
          {/* Font Color */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-1.5 hover:bg-zinc-800 rounded-md transition text-zinc-300"
              title="Text Color"
            >
              <Palette className="w-4 h-4" style={{ color: fontColor }} />
            </button>

            {showColorPicker && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowColorPicker(false)} />
                <div className="absolute bottom-8 right-0 z-40 bg-zinc-900 border border-zinc-700 rounded-xl p-2 shadow-2xl flex items-center space-x-1.5 animate-bounce-in">
                  {SCENE_FONT_COLORS.map((fc) => (
                    <button
                      key={fc.value}
                      onClick={() => {
                        onChangeFontColor(fc.value);
                        setShowColorPicker(false);
                      }}
                      className={`w-6 h-6 rounded-full border-2 transition transform hover:scale-125 ${
                        fontColor === fc.value ? 'ring-2 ring-rose-500 scale-110 border-white' : 'border-zinc-700'
                      }`}
                      style={{ backgroundColor: fc.value }}
                      title={fc.label}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Emoticons */}
          <div className="relative">
            <button
              onClick={() => setShowEmoticons(!showEmoticons)}
              className="p-1.5 hover:bg-zinc-800 rounded-md transition text-pink-400"
              title="Insert Emojis"
            >
              <Smile className="w-4 h-4" />
            </button>

            <EmoticonPicker
              isOpen={showEmoticons}
              onClose={() => setShowEmoticons(false)}
              onSelect={handleInsertEmoticon}
            />
          </div>

          {/* Scene Blasts */}
          <div className="relative">
            <button
              onClick={() => setShowWinksMenu(!showWinksMenu)}
              className="p-1.5 hover:bg-zinc-800 rounded-md transition text-rose-400"
              title="Scene Blasts"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {showWinksMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowWinksMenu(false)} />
                <div className="absolute bottom-8 right-0 z-40 w-56 sm:w-60 bg-zinc-900 border border-zinc-700 rounded-xl p-2 shadow-2xl animate-bounce-in">
                  <div className="text-[10px] font-bold text-zinc-500 px-2 py-1 uppercase tracking-wider border-b border-zinc-800 mb-1 font-mono">
                    Scene Blasts
                  </div>
                  <div className="space-y-1">
                    {AVAILABLE_WINKS.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => {
                          onSendWink(w.id);
                          setShowWinksMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-zinc-800 text-left transition group"
                      >
                        <span className="text-lg">{w.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-zinc-100 group-hover:text-rose-300">{w.name}</div>
                          <div className="text-[9px] text-zinc-500 truncate">{w.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Scribble Graffiti */}
          <button
            onClick={onOpenInk}
            className="p-1.5 hover:bg-zinc-800 rounded-md transition text-cyan-400"
            title="Sharpie Scribble"
          >
            <PenTool className="w-4 h-4" />
          </button>

          {/* Image Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 hover:bg-zinc-800 rounded-md transition text-zinc-400 hover:text-white"
            title="Upload Photo"
          >
            <Image className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* SCREAM Button */}
          <button
            onClick={onSendNudge}
            disabled={nudgeCooldown > 0}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-mono font-extrabold text-[11px] transition shadow-xs ${
              nudgeCooldown > 0
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_8px_rgba(244,63,94,0.4)] animate-pulse'
            }`}
            title="Shake screen!"
          >
            <Zap className="w-3 h-3 fill-current" />
            <span className="hidden xs:inline">SCREAM</span>
            {nudgeCooldown > 0 && <span>({nudgeCooldown}s)</span>}
          </button>
        </div>
      </div>

      {/* Main Text Input & Big Post Button */}
      <div className="p-2 sm:p-2.5 flex items-end space-x-2">
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Write a message, lyrics, or scream into the void..."
            style={{ color: fontColor }}
            className="w-full resize-none p-2 sm:p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 focus:outline-none focus:border-rose-500 text-sm font-medium transition placeholder:text-zinc-600 font-msn"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className={`h-12 px-5 sm:px-6 rounded-xl font-mono font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition shadow-lg flex-shrink-0 ${
            text.trim()
              ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white transform hover:scale-102 active:scale-95 shadow-rose-600/30'
              : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Post</span>
        </button>
      </div>
    </div>
  );
};

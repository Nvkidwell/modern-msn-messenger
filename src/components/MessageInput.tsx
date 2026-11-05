import React, { useState, useRef } from 'react';
import { Smile, Zap, Sparkles, PenTool, Image, Send, Palette } from 'lucide-react';
import { EmoticonPicker } from './EmoticonPicker';
import { AVAILABLE_WINKS } from '../utils/winks';

interface MessageInputProps {
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
    <div className="relative border-t border-zinc-800 bg-zinc-950 select-none">
      {/* Rich Action Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-zinc-300 text-xs">
        <div className="flex items-center space-x-1">
          {/* Custom Font Color Picker */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-1.5 hover:bg-zinc-800 rounded-md transition flex items-center gap-1 border border-zinc-800"
              title="Change Scene Font Color"
            >
              <Palette className="w-4 h-4" style={{ color: fontColor }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fontColor }} />
            </button>

            {showColorPicker && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowColorPicker(false)} />
                <div className="absolute bottom-8 left-0 z-40 bg-zinc-900 border border-zinc-700 rounded-xl p-2 shadow-2xl flex items-center space-x-1.5 animate-bounce-in">
                  {SCENE_FONT_COLORS.map((fc) => (
                    <button
                      key={fc.value}
                      onClick={() => {
                        onChangeFontColor(fc.value);
                        setShowColorPicker(false);
                      }}
                      className={`w-6 h-6 rounded-full border-2 transition transform hover:scale-125 ${
                        fontColor === fc.value ? 'ring-2 ring-rose-500 scale-110 border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: fc.value }}
                      title={fc.label}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="h-4 w-px bg-zinc-800 mx-1" />

          {/* Emoticon Picker Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowEmoticons(!showEmoticons)}
              className={`p-1.5 hover:bg-zinc-800 rounded-md transition flex items-center gap-1 ${
                showEmoticons ? 'bg-rose-950 text-rose-400 border border-rose-500/50' : ''
              }`}
              title="Add Scene Emoticon (xD, >_<, 🖤)"
            >
              <Smile className="w-4 h-4 text-pink-400" />
            </button>

            <EmoticonPicker
              isOpen={showEmoticons}
              onClose={() => setShowEmoticons(false)}
              onSelect={handleInsertEmoticon}
            />
          </div>

          {/* Scene Blasts / Effects Selector */}
          <div className="relative">
            <button
              onClick={() => setShowWinksMenu(!showWinksMenu)}
              className={`p-1.5 hover:bg-zinc-800 rounded-md transition flex items-center gap-1 ${
                showWinksMenu ? 'bg-rose-950 text-rose-400 border border-rose-500/50' : ''
              }`}
              title="Summon Scene Blast!"
            >
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span className="text-[11px] font-bold hidden sm:inline font-mono">Blasts</span>
            </button>

            {showWinksMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowWinksMenu(false)} />
                <div className="absolute bottom-8 left-0 z-40 w-60 bg-zinc-900 border border-zinc-700 rounded-xl p-2 shadow-2xl animate-bounce-in">
                  <div className="text-[10px] font-bold text-zinc-500 px-2 py-1 uppercase tracking-wider border-b border-zinc-800 mb-1 font-mono">
                    Select a Scene Blast
                  </div>
                  <div className="space-y-1">
                    {AVAILABLE_WINKS.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => {
                          onSendWink(w.id);
                          setShowWinksMenu(false);
                        }}
                        className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-left transition group"
                      >
                        <span className="text-xl group-hover:scale-125 transition-transform">{w.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-zinc-100 group-hover:text-rose-300">{w.name}</div>
                          <div className="text-[10px] text-zinc-500 truncate">{w.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Scribble / Graffiti Ink Button */}
          <button
            onClick={onOpenInk}
            className="p-1.5 hover:bg-zinc-800 rounded-md transition flex items-center gap-1"
            title="Sharpie Scribble Doodle"
          >
            <PenTool className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] font-bold hidden sm:inline font-mono">Scribble</span>
          </button>

          {/* Send Image Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 hover:bg-zinc-800 rounded-md transition"
            title="Upload Photo / Meme"
          >
            <Image className="w-4 h-4 text-zinc-400 hover:text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Big SCREAM Button */}
        <div>
          <button
            onClick={onSendNudge}
            disabled={nudgeCooldown > 0}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-extrabold text-xs transition shadow-sm font-mono ${
              nudgeCooldown > 0
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700'
                : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)] animate-pulse hover:scale-105 active:scale-95'
            }`}
            title={nudgeCooldown > 0 ? `Ready in ${nudgeCooldown}s` : 'SCREAM! Violent screen shake!'}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>SCREAM{nudgeCooldown > 0 ? ` (${nudgeCooldown}s)` : '!'}</span>
          </button>
        </div>
      </div>

      {/* Input area & Send button */}
      <div className="p-2.5 flex items-end space-x-2">
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Write a message, lyrics, or spill your guts... (Enter to post, Shift+Enter for newline)"
            style={{ color: fontColor }}
            className="w-full resize-none p-2 rounded-xl border border-zinc-800 bg-zinc-900 focus:outline-none focus:border-rose-500 text-sm font-medium transition placeholder:text-zinc-600 font-msn"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className={`h-11 px-5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg font-mono ${
            text.trim()
              ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white transform hover:scale-102 active:scale-98 shadow-rose-600/30'
              : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Post</span>
        </button>
      </div>
    </div>
  );
};

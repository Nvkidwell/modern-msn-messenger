import React, { useState } from 'react';
import { SCENE_EMOTICONS, Emoticon } from '../utils/emoticons';

interface EmoticonPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (shortcut: string) => void;
}

export const EmoticonPicker: React.FC<EmoticonPickerProps> = ({ isOpen, onClose, onSelect }) => {
  const [category, setCategory] = useState<'all' | 'angst' | 'faces' | 'dark' | 'scene'>('all');

  if (!isOpen) return null;

  const filtered: Emoticon[] = category === 'all' 
    ? SCENE_EMOTICONS 
    : SCENE_EMOTICONS.filter((e: Emoticon) => e.category === category);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute bottom-12 left-0 z-50 w-72 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-700 p-2.5 animate-bounce-in font-mono">
        {/* Category tabs */}
        <div className="flex space-x-1 border-b border-zinc-800 pb-2 mb-2 text-[10px] font-bold text-zinc-400">
          {(['all', 'angst', 'dark', 'scene', 'faces'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-2 py-0.5 rounded-md capitalize transition ${
                category === cat
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'hover:bg-zinc-800 text-zinc-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto p-1">
          {filtered.map((item: Emoticon, idx: number) => (
            <button
              key={`${item.shortcut}-${idx}`}
              onClick={() => {
                onSelect(item.shortcut);
                onClose();
              }}
              title={`${item.shortcut} - ${item.name}`}
              className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-rose-950/70 border border-transparent hover:border-rose-500/40 transition transform hover:scale-125"
            >
              <span>{item.emoji}</span>
            </button>
          ))}
        </div>

        <div className="mt-2 pt-1.5 border-t border-zinc-800 text-[10px] text-zinc-500 text-center">
          Click to insert scene shortcut {'(xD, >_<, 🖤)'}
        </div>
      </div>
    </>
  );
};

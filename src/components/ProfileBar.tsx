import React, { useState } from 'react';
import { User, UserStatus, UserMood } from '../types';
import { DEFAULT_AVATARS } from '../utils/avatars';
import { ChevronDown, Edit2, Check, Guitar, Smile } from 'lucide-react';
import { parseEmoticons } from '../utils/emoticons';

interface ProfileBarProps {
  currentUser: User;
  onUpdateProfile: (updated: Partial<User>) => void;
  onOpenEditModal: () => void;
}

const STATUS_CONFIG: Record<UserStatus, { label: string; dotClass: string }> = {
  online: { label: 'Online', dotClass: 'bg-emerald-500 shadow-[0_0_8px_#10b981]' },
  busy: { label: 'Do Not Disturb', dotClass: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' },
  away: { label: 'Away (Writing Poetry)', dotClass: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' },
  lurking: { label: 'Lurking In Shadows', dotClass: 'bg-purple-500 shadow-[0_0_8px_#a855f7]' },
  moshpit: { label: 'In The Mosh Pit', dotClass: 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' },
  dead: { label: 'Dead Inside', dotClass: 'bg-zinc-600 shadow-[0_0_8px_#52525b]' },
  offline: { label: 'Invisible', dotClass: 'bg-zinc-700' },
};

const MOOD_OPTIONS: UserMood[] = [
  '🖤 Melancholy',
  '⚡ Hyperactive (Rawr xD)',
  '🎸 Mosh Pit Ready',
  '☕ Overcaffeinated',
  '🌧️ Emo Tears',
  '💀 Dead Inside',
  '🦇 Lurking in Shadows',
  '🗡️ Vengeful',
  '✨ Glitter & Gloom',
  '🎧 Blast Screamo',
];

export const ProfileBar: React.FC<ProfileBarProps> = ({
  currentUser,
  onUpdateProfile,
  onOpenEditModal,
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showMoodMenu, setShowMoodMenu] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [personalMsg, setPersonalMsg] = useState(currentUser.personalMessage || '');

  const avatarInfo = DEFAULT_AVATARS.find((a) => a.id === currentUser.avatar) || DEFAULT_AVATARS[0];
  const currentStatus = STATUS_CONFIG[currentUser.status] || STATUS_CONFIG.online;

  const handleSaveMessage = () => {
    setIsEditingMessage(false);
    onUpdateProfile({ personalMessage: personalMsg });
  };

  const handleMusicStatus = () => {
    const sceneSongs = [
      'Hawthorne Heights - Ohio Is For Lovers',
      'My Chemical Romance - Helena',
      'Taking Back Sunday - MakeDamnSure',
      'Paramore - Misery Business',
      'The Used - The Taste of Ink',
      'AFI - Miss Murder',
      'Fall Out Boy - Sugar, We\'re Goin Down',
      'Evanescence - Bring Me To Life',
      'Silverstein - Smile In Your Sleep',
      'From First To Last - Note To Self',
      'Pierce The Veil - King For A Day',
    ];
    const randomSong = sceneSongs[Math.floor(Math.random() * sceneSongs.length)];
    const newMsg = `(8) listening to: ${randomSong} (8)`;
    setPersonalMsg(newMsg);
    onUpdateProfile({ personalMessage: newMsg, currentSong: randomSong });
  };

  return (
    <div className="bg-gradient-to-b from-zinc-900 to-black p-3 border-b border-zinc-800 shadow-md select-none">
      <div className="flex items-center space-x-3.5">
        {/* Avatar with Scene Studded Frame */}
        <div
          onClick={onOpenEditModal}
          className="relative group cursor-pointer flex-shrink-0"
          title="Click to change your display picture"
        >
          <div className="w-14 h-14 rounded-xl bg-zinc-950 p-0.5 shadow-xl border-2 border-rose-500/50 group-hover:border-rose-400 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.5)] transition duration-300">
            <div className={`w-full h-full rounded-[10px] bg-gradient-to-br ${avatarInfo.bgGradient} flex items-center justify-center text-2xl relative overflow-hidden`}>
              <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] select-none">{avatarInfo.emoji}</span>
              <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 pointer-events-none rounded-t-[10px]" />
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute -bottom-1 -right-1 ring-2 ring-black rounded-full">
            <div className={`w-4 h-4 rounded-full ${currentStatus.dotClass} flex items-center justify-center`} />
          </div>
        </div>

        {/* User Details */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Name & Status dropdown */}
          <div className="flex items-center space-x-2">
            <span
              onClick={onOpenEditModal}
              className="font-bold text-zinc-100 text-sm truncate hover:text-rose-400 cursor-pointer flex items-center gap-1 transition"
              title="Click to edit screen name"
            >
              {currentUser.name}
            </span>

            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 transition"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dotClass}`} />
                <span className="truncate">&lt;{currentStatus.label}&gt;</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {showStatusMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} />
                  <div className="absolute left-0 mt-1.5 w-48 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-700 py-1 z-50 animate-bounce-in text-xs font-mono">
                    {(Object.keys(STATUS_CONFIG) as UserStatus[]).map((st) => {
                      const cfg = STATUS_CONFIG[st];
                      const active = currentUser.status === st;
                      return (
                        <button
                          key={st}
                          onClick={() => {
                            onUpdateProfile({ status: st });
                            setShowStatusMenu(false);
                          }}
                          className={`w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-zinc-800 text-left transition ${
                            active ? 'font-bold text-rose-400 bg-zinc-800/60' : 'text-zinc-300'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
                          <span className="flex-1 truncate">{cfg.label}</span>
                          {active && <Check className="w-3.5 h-3.5 text-rose-400" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Row 2: Mood Badge & Email */}
          <div className="flex items-center space-x-2 mt-0.5 text-[11px]">
            {/* Mood selector dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMoodMenu(!showMoodMenu)}
                className="px-1.5 py-0.2 rounded bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 font-mono text-[10px] flex items-center gap-1 transition"
                title="Change your current mood"
              >
                <span>Mood: {currentUser.mood || '🖤 Melancholy'}</span>
                <ChevronDown className="w-2.5 h-2.5 opacity-60" />
              </button>

              {showMoodMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMoodMenu(false)} />
                  <div className="absolute left-0 mt-1.5 w-52 bg-zinc-900 border border-zinc-700 rounded-xl py-1 shadow-2xl z-50 text-[11px] font-mono">
                    <div className="px-3 py-1 text-[9px] uppercase font-bold text-zinc-500 tracking-wider border-b border-zinc-800">
                      Set Your Mood
                    </div>
                    {MOOD_OPTIONS.map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          onUpdateProfile({ mood: m });
                          setShowMoodMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-rose-300 transition"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <span className="text-zinc-600 font-mono text-[10px] truncate">
              {currentUser.email}
            </span>
          </div>

          {/* Row 3: Personal Status quote / Lyric quote */}
          <div className="mt-1 flex items-center space-x-1.5">
            {isEditingMessage ? (
              <div className="flex items-center space-x-1 w-full max-w-sm">
                <input
                  type="text"
                  value={personalMsg}
                  onChange={(e) => setPersonalMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveMessage();
                    if (e.key === 'Escape') setIsEditingMessage(false);
                  }}
                  autoFocus
                  placeholder="Type song lyrics or away message..."
                  className="text-xs px-2 py-0.5 rounded border border-rose-500 bg-zinc-900 text-zinc-100 w-full focus:outline-none focus:ring-1 focus:ring-rose-400 font-mono"
                />
                <button
                  onClick={handleSaveMessage}
                  className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingMessage(true)}
                className="group flex items-center space-x-1.5 text-xs text-zinc-400 italic hover:text-rose-400 cursor-pointer truncate max-w-sm transition"
                title="Click to edit personal quote"
              >
                <span className="truncate">
                  {currentUser.personalMessage ? (
                    parseEmoticons(currentUser.personalMessage)
                  ) : (
                    <span className="text-zinc-600 not-italic">&lt;Click to write song lyrics or away status&gt;</span>
                  )}
                </span>
                <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition flex-shrink-0 text-zinc-500" />
              </div>
            )}

            {/* Song Shuffle Button */}
            <button
              onClick={handleMusicStatus}
              className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition flex-shrink-0"
              title="Shuffle Scene / Emo Now Playing status (8) Song (8)"
            >
              <Guitar className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

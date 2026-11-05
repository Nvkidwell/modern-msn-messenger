import React, { useState } from 'react';
import { User, UserMood } from '../types';
import { DEFAULT_AVATARS, getRandomProfile } from '../utils/avatars';
import { Dices, Sparkles, ArrowRight, X, Skull } from 'lucide-react';

interface JoinModalProps {
  isOpen: boolean;
  onJoin: (profile: Partial<User>) => void;
  currentUser?: User;
  isEditMode?: boolean;
  onClose?: () => void;
}

const MOODS: UserMood[] = [
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

export const JoinModal: React.FC<JoinModalProps> = ({
  isOpen,
  onJoin,
  currentUser,
  isEditMode = false,
  onClose,
}) => {
  const [name, setName] = useState(currentUser?.name || 'crying_in_heavy_eyeliner');
  const [email, setEmail] = useState(currentUser?.email || 'eyeliner@deadvox.net');
  const [avatar, setAvatar] = useState(currentUser?.avatar || 'blackheart');
  const [mood, setMood] = useState(currentUser?.mood || '🖤 Melancholy');
  const [personalMessage, setPersonalMessage] = useState(
    currentUser?.personalMessage || '~*~ I\'m not okay, but nobody listens anyway ~*~'
  );
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (!isOpen) return null;

  const handleRollRandom = () => {
    const random = getRandomProfile();
    setName(random.name);
    setEmail(random.email);
    setAvatar(random.avatar);
    setPersonalMessage(random.quote);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSigningIn(true);

    setTimeout(() => {
      onJoin({
        name: name.trim(),
        email: email.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@deadvox.net`,
        avatar,
        mood,
        personalMessage: personalMessage.trim(),
      });
      setIsSigningIn(false);
      if (onClose) onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-bounce-in select-none">
      <div className="bg-zinc-950 rounded-3xl shadow-2xl border-2 border-rose-500/50 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-950 via-rose-950 to-black p-6 text-white text-center relative border-b border-zinc-800">
          {isEditMode && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 transition text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="w-16 h-16 mx-auto rounded-2xl bg-black/60 border-2 border-rose-500/40 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(244,63,94,0.3)] transform -rotate-6 hover:rotate-0 transition duration-300">
            🖤
          </div>

          <h2 className="text-xl font-extrabold mt-3 tracking-wider bg-gradient-to-r from-rose-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            {isEditMode ? 'Update Your Persona' : 'DEADVOX — Enter The Void'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            {isEditMode
              ? 'Update your screen handle, avatar, or mood'
              : 'No login. No passwords. No posers. Just raw unfiltered chat.'}
          </p>

          {!isEditMode && (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={handleRollRandom}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-mono font-bold transition border border-rose-500/40 shadow-sm transform hover:scale-105 active:scale-95"
              >
                <Dices className="w-4 h-4 text-rose-400" />
                <span>🎲 Roll Scene Persona</span>
              </button>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Handle */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-300 mb-1 uppercase tracking-wider">
              Screen Handle
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!isEditMode) {
                  setEmail(`${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')}@deadvox.net`);
                }
              }}
              required
              placeholder="e.g. xX_Broken_Echo_Xx"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-rose-500 font-mono transition"
            />
          </div>

          {/* Email / Wire ID */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-400 mb-1 uppercase tracking-wider">
              Wire Address (Optional)
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="handle@deadvox.net"
              className="w-full px-3.5 py-2 rounded-xl text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          {/* Mood Selector */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-300 mb-1 uppercase tracking-wider">
              Your Current Mood
            </label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value as UserMood)}
              className="w-full px-3.5 py-2 rounded-xl text-xs font-mono bg-zinc-900 border border-zinc-800 text-rose-300 focus:outline-none focus:border-rose-500"
            >
              {MOODS.map((m) => (
                <option key={m} value={m} className="bg-zinc-950 text-zinc-200">
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Status Quote / Lyrics */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-300 mb-1 uppercase tracking-wider">
              Song Lyrics or Away Message
            </label>
            <input
              type="text"
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              placeholder="(8) Hawthorne Heights - Ohio Is For Lovers (8)"
              className="w-full px-3.5 py-2 rounded-xl text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          {/* Avatar Grid */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-300 mb-2 uppercase tracking-wider">
              Pick Your Display Picture
            </label>
            <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1.5 rounded-xl border border-zinc-800 bg-black">
              {DEFAULT_AVATARS.map((av) => (
                <button
                  type="button"
                  key={av.id}
                  onClick={() => setAvatar(av.id)}
                  className={`p-1.5 rounded-xl flex flex-col items-center justify-center transition transform hover:scale-110 ${
                    avatar === av.id
                      ? 'border-2 border-rose-500 bg-rose-950/40 shadow-[0_0_10px_rgba(244,63,94,0.4)] scale-105'
                      : 'border border-zinc-800 hover:border-zinc-700 opacity-70'
                  }`}
                  title={av.name}
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${av.bgGradient} flex items-center justify-center text-xl`}>
                    {av.emoji}
                  </div>
                  <span className="text-[9px] font-mono text-zinc-400 truncate w-full text-center mt-1">
                    {av.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSigningIn || !name.trim()}
              className="w-full py-3 rounded-xl font-mono font-extrabold text-sm bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] flex items-center justify-center space-x-2 transition transform hover:scale-101 active:scale-99"
            >
              {isSigningIn ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Entering The Void...</span>
                </div>
              ) : (
                <>
                  <Skull className="w-4 h-4 text-rose-300" />
                  <span>{isEditMode ? 'Save Persona' : 'Enter DEADVOX'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { User } from '../types';
import { DEFAULT_AVATARS } from '../utils/avatars';
import { parseEmoticons } from '../utils/emoticons';
import { Search, ChevronDown, ChevronRight, Flame, Skull, Zap, Radio } from 'lucide-react';

interface ContactListProps {
  users: User[];
  currentUser: User;
  activeChatId: string; // 'the_void' or userId
  onSelectChat: (chatId: string) => void;
  unreadCounts: Record<string, number>;
  onQuickNudge: (targetUser: User) => void;
}

export const ContactList: React.FC<ContactListProps> = ({
  users,
  currentUser,
  activeChatId,
  onSelectChat,
  unreadCounts,
  onQuickNudge,
}) => {
  const [search, setSearch] = useState('');
  const [onlineOpen, setOnlineOpen] = useState(true);
  const [offlineOpen, setOfflineOpen] = useState(true);

  const otherUsers = users.filter((u) => u.id !== currentUser.id);

  const filteredUsers = otherUsers.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.personalMessage && u.personalMessage.toLowerCase().includes(q))
    );
  });

  const onlineBuddies = filteredUsers.filter((u) => u.status !== 'offline');
  const offlineBuddies = filteredUsers.filter((u) => u.status === 'offline');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-500 shadow-[0_0_6px_#10b981]';
      case 'busy': return 'bg-rose-500 shadow-[0_0_6px_#f43f5e]';
      case 'away': return 'bg-amber-500 shadow-[0_0_6px_#f59e0b]';
      case 'lurking': return 'bg-purple-500 shadow-[0_0_6px_#a855f7]';
      case 'moshpit': return 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]';
      default: return 'bg-zinc-600';
    }
  };

  const renderContactItem = (buddy: User) => {
    const avatar = DEFAULT_AVATARS.find((a) => a.id === buddy.avatar) || DEFAULT_AVATARS[0];
    const isSelected = activeChatId === buddy.id;
    const unread = unreadCounts[buddy.id] || 0;

    return (
      <div
        key={buddy.id}
        onClick={() => onSelectChat(buddy.id)}
        className={`group relative flex items-center space-x-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all ${
          isSelected
            ? 'bg-rose-950/60 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
            : 'hover:bg-zinc-850/70 border border-transparent hover:border-zinc-800'
        }`}
      >
        {/* Avatar with status glow dot */}
        <div className="relative flex-shrink-0">
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${avatar.bgGradient} flex items-center justify-center text-lg shadow-sm border border-zinc-700`}>
            {buddy.isBot ? <Skull className="w-5 h-5 text-rose-400" /> : <span>{avatar.emoji}</span>}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-black ${getStatusColor(
              buddy.status
            )}`}
          />
        </div>

        {/* Contact info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 truncate">
              <span
                className={`text-xs font-bold truncate ${
                  isSelected
                    ? 'text-rose-300'
                    : 'text-zinc-200 group-hover:text-rose-400 transition'
                }`}
              >
                {buddy.name}
              </span>
              {buddy.isBot && (
                <span className="text-[9px] px-1 rounded bg-rose-950 text-rose-300 font-mono font-bold uppercase tracking-wider border border-rose-800">
                  TOP 8 BOT
                </span>
              )}
            </div>

            {/* Unread badge */}
            {unread > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-bounce-in shadow-[0_0_8px_#f43f5e]">
                {unread}
              </span>
            )}
          </div>

          {/* Personal message / lyrics */}
          <div className="text-[11px] text-zinc-400 truncate italic mt-0.5">
            {buddy.personalMessage ? parseEmoticons(buddy.personalMessage) : (buddy.mood || buddy.email)}
          </div>
        </div>

        {/* Quick action: SCREAM button on hover */}
        <div className="hidden group-hover:flex items-center space-x-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickNudge(buddy);
            }}
            className="p-1 rounded bg-zinc-800 hover:bg-rose-900/60 text-rose-400 border border-zinc-700 transition"
            title="SCREAM at this user!"
          >
            <Zap className="w-3.5 h-3.5 fill-rose-500" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800 select-none overflow-hidden">
      {/* Search Buddy Bar */}
      <div className="p-2.5 border-b border-zinc-800/80">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search scene kids & freaks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-rose-500 text-zinc-200 placeholder-zinc-600 font-mono transition"
          />
        </div>
      </div>

      {/* Main Groups & Buddies */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2.5 text-xs">
        {/* Pinned: THE VOID (Public Chatroom) */}
        <div
          onClick={() => onSelectChat('the_void')}
          className={`flex items-center space-x-3 p-2.5 rounded-xl cursor-pointer transition-all ${
            activeChatId === 'the_void'
              ? 'bg-gradient-to-r from-rose-900 via-rose-950 to-black text-white border border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
              : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 shadow-sm'
          }`}
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${
            activeChatId === 'the_void' ? 'bg-rose-600 text-white shadow-[0_0_10px_#f43f5e]' : 'bg-zinc-800 text-rose-400'
          }`}>
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs tracking-wider flex items-center gap-1">
                <span>THE VOID</span>
                <Flame className="w-3.5 h-3.5 text-rose-500" />
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                activeChatId === 'the_void' ? 'bg-rose-500/40 text-rose-200' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                {users.length} live
              </span>
            </div>
            <div className="text-[11px] truncate mt-0.5 text-zinc-400 font-mono">
              Public Wall • Anyone can post with zero login
            </div>
          </div>
          {unreadCounts['the_void'] > 0 && activeChatId !== 'the_void' && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-bounce-in shadow-[0_0_8px_#f43f5e]">
              {unreadCounts['the_void']}
            </span>
          )}
        </div>

        {/* Group: Online Scene Kids */}
        <div>
          <button
            onClick={() => setOnlineOpen(!onlineOpen)}
            className="flex items-center justify-between w-full px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 hover:text-rose-400 transition font-mono"
          >
            <div className="flex items-center space-x-1">
              {onlineOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <span>Top 8 & Scene Kids</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              ({onlineBuddies.length})
            </span>
          </button>

          {onlineOpen && (
            <div className="mt-1 space-y-1">
              {onlineBuddies.length === 0 ? (
                <div className="text-center py-3 text-[11px] text-zinc-600 italic font-mono">
                  No freaks online right now
                </div>
              ) : (
                onlineBuddies.map(renderContactItem)
              )}
            </div>
          )}
        </div>

        {/* Group: Offline Phantoms */}
        {offlineBuddies.length > 0 && (
          <div>
            <button
              onClick={() => setOfflineOpen(!offlineOpen)}
              className="flex items-center justify-between w-full px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-400 transition font-mono"
            >
              <div className="flex items-center space-x-1">
                {offlineOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <span>Offline Phantoms</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-600">
                ({offlineBuddies.length})
              </span>
            </button>

            {offlineOpen && (
              <div className="mt-1 space-y-1 opacity-60">
                {offlineBuddies.map(renderContactItem)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="p-2 border-t border-zinc-800/80 bg-black/40 text-[10px] text-zinc-500 font-mono text-center">
        Open 2 tabs to test real-time chat between freaks
      </div>
    </div>
  );
};

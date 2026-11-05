import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { User, Message, ToastNotification, UserStatus } from './types';
import { Header } from './components/Header';
import { ProfileBar } from './components/ProfileBar';
import { ContactList } from './components/ContactList';
import { ChatWindow } from './components/ChatWindow';
import { MessageInput } from './components/MessageInput';
import { InkCanvas } from './components/InkCanvas';
import { WinkPlayer } from './components/WinkPlayer';
import { ToastAlert } from './components/ToastAlert';
import { JoinModal } from './components/JoinModal';

export const App: React.FC = () => {
  // User identity state (stored in localStorage)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('deadvox_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Chat & Realtime state
  const [users, setUsers] = useState<User[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('the_void');
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [typingMap, setTypingMap] = useState<Record<string, boolean>>({});

  // SCREAM & Scene Blast animation states (SILENT - NO AUDIO)
  const [isNudging, setIsNudging] = useState(false);
  const [nudgeCooldown, setNudgeCooldown] = useState(0);
  const [activeWink, setActiveWink] = useState<{ winkId: string; senderName: string } | null>(null);

  // Scribble Graffiti modal
  const [isInkOpen, setIsInkOpen] = useState(false);

  // Toast notifications (SILENT)
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Scene font color preference
  const [fontColor, setFontColor] = useState('#ff007f');

  // Mobile layout tab switcher ('contacts' | 'chat')
  const [mobileTab, setMobileTab] = useState<'contacts' | 'chat'>('chat');

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);

  // Scream cooldown timer
  useEffect(() => {
    if (nudgeCooldown <= 0) return;
    const interval = setInterval(() => {
      setNudgeCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [nudgeCooldown]);

  // Prompt join modal if no persona exists
  useEffect(() => {
    if (!currentUser) {
      setIsJoinModalOpen(true);
    }
  }, [currentUser]);

  // Socket & BroadcastChannel Connection setup
  useEffect(() => {
    if (!currentUser) return;

    const bc = new BroadcastChannel('deadvox_bus');
    broadcastRef.current = bc;

    bc.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'message') {
        handleIncomingMessage(payload);
      } else if (type === 'nudge') {
        handleIncomingNudge(payload);
      } else if (type === 'wink') {
        handleIncomingWink(payload);
      }
    };

    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('user:join', currentUser);
    });

    socket.on('init', (data) => {
      setUsers(data.users || []);
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      }
    });

    socket.on('user:joined', (newUser: User) => {
      setUsers((prev) => {
        const exists = prev.some((u) => u.id === newUser.id);
        if (exists) return prev.map((u) => (u.id === newUser.id ? newUser : u));
        return [...prev, newUser];
      });

      showToast(`${newUser.name} has entered The Void.`, 'New Phantom', newUser.avatar);
    });

    socket.on('user:updated', (updatedUser: User) => {
      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    });

    socket.on('user:left', (data: { userId: string; name: string }) => {
      setUsers((prev) => prev.filter((u) => u.id !== data.userId));
    });

    socket.on('message:received', (message: Message) => {
      handleIncomingMessage(message);
    });

    socket.on('chat:nudged', (nudgeData) => {
      handleIncomingNudge(nudgeData);
    });

    socket.on('chat:winked', (winkData) => {
      handleIncomingWink(winkData);
    });

    socket.on('user:typing', (data: { userId: string; userName: string; isTyping: boolean; roomId: string }) => {
      if (data.userId === currentUser.id) return;
      setTypingMap((prev) => ({
        ...prev,
        [data.userName]: data.isTyping,
      }));
    });

    return () => {
      socket.disconnect();
      bc.close();
    };
  }, [currentUser?.id]);

  const showToast = (message: string, title: string = 'DEADVOX Alert', avatar?: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: ToastNotification = { id, title, message, avatar, timestamp: Date.now() };
    setToasts((prev) => [...prev.slice(-3), newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleIncomingMessage = (message: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });

    const isCurrentChat =
      (activeChatId === 'the_void' && message.roomId === 'the_void') ||
      (message.senderId === activeChatId && message.targetUserId === currentUser?.id);

    if (message.senderId !== currentUser?.id && !isCurrentChat) {
      const sourceChatId = message.roomId === 'the_void' ? 'the_void' : message.senderId;
      setUnreadCounts((prev) => ({
        ...prev,
        [sourceChatId]: (prev[sourceChatId] || 0) + 1,
      }));
      showToast(
        `${message.senderName}: ${message.type === 'text' ? message.content : `[${message.type}]`}`,
        message.roomId === 'the_void' ? 'The Void' : message.senderName,
        message.senderAvatar
      );
    }
  };

  const handleIncomingNudge = (nudgeData: { senderId: string; senderName: string; targetUserId?: string; roomId: string }) => {
    const isTargetMe = !nudgeData.targetUserId || nudgeData.targetUserId === currentUser?.id;
    const isRelevantChat =
      (activeChatId === 'the_void' && nudgeData.roomId === 'the_void') ||
      nudgeData.senderId === activeChatId ||
      nudgeData.senderId === currentUser?.id;

    if (isTargetMe && isRelevantChat) {
      setIsNudging(true);
      setTimeout(() => setIsNudging(false), 800);
    }
  };

  const handleIncomingWink = (winkData: { winkId: string; senderName: string; targetUserId?: string; roomId: string }) => {
    const isRelevantChat =
      (activeChatId === 'the_void' && winkData.roomId === 'the_void') ||
      winkData.targetUserId === currentUser?.id ||
      !winkData.targetUserId;

    if (isRelevantChat) {
      setActiveWink({
        winkId: winkData.winkId,
        senderName: winkData.senderName,
      });
    }
  };

  // Join handler
  const handleJoin = (profile: Partial<User>) => {
    const newUser: User = {
      id: currentUser?.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: profile.name || 'Anonymous Freak',
      email: profile.email || 'freak@deadvox.net',
      avatar: profile.avatar || 'blackheart',
      status: (profile.status as UserStatus) || 'online',
      mood: profile.mood || '🖤 Melancholy',
      personalMessage: profile.personalMessage || '~*~ I\'m not okay, but nobody listens anyway ~*~',
      currentSong: profile.currentSong || '',
      fontColor: fontColor,
      isBot: false,
    };

    setCurrentUser(newUser);
    localStorage.setItem('deadvox_user_profile', JSON.stringify(newUser));
    setIsJoinModalOpen(false);

    if (socketRef.current?.connected) {
      socketRef.current.emit('user:update', newUser);
    }
  };

  // Profile update handler
  const handleUpdateProfile = (updatedFields: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedFields };
    setCurrentUser(updated);
    localStorage.setItem('deadvox_user_profile', JSON.stringify(updated));

    if (socketRef.current?.connected) {
      socketRef.current.emit('user:update', updated);
    }
  };

  // Send message
  const handleSendMessage = (content: string, type: 'text' | 'image' = 'text') => {
    if (!currentUser) return;

    const messageData = {
      type,
      content,
      roomId: activeChatId === 'the_void' ? 'the_void' : 'direct',
      targetUserId: activeChatId === 'the_void' ? null : activeChatId,
    };

    if (socketRef.current?.connected) {
      socketRef.current.emit('message:send', messageData);
    } else {
      const localMsg: Message = {
        id: `msg_local_${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        senderEmail: currentUser.email,
        fontColor,
        type,
        content,
        timestamp: Date.now(),
        roomId: messageData.roomId,
        targetUserId: messageData.targetUserId || undefined,
      };
      setMessages((prev) => [...prev, localMsg]);
      broadcastRef.current?.postMessage({ type: 'message', payload: localMsg });
    }
  };

  // SCREAM (!)
  const handleSendNudge = () => {
    if (!currentUser || nudgeCooldown > 0) return;

    setNudgeCooldown(4);
    setIsNudging(true);
    setTimeout(() => setIsNudging(false), 800);

    const nudgeEvent = {
      senderId: currentUser.id,
      senderName: currentUser.name,
      targetUserId: activeChatId === 'the_void' ? null : activeChatId,
      roomId: activeChatId === 'the_void' ? 'the_void' : 'direct',
      timestamp: Date.now(),
    };

    const nudgeMsg: Message = {
      id: `nudge_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderEmail: currentUser.email,
      type: 'nudge',
      content: 'scream',
      timestamp: Date.now(),
      roomId: nudgeEvent.roomId,
      targetUserId: nudgeEvent.targetUserId || undefined,
    };
    setMessages((prev) => [...prev, nudgeMsg]);

    if (socketRef.current?.connected) {
      socketRef.current.emit('chat:nudge', nudgeEvent);
    } else {
      broadcastRef.current?.postMessage({ type: 'nudge', payload: nudgeEvent });
    }
  };

  const handleQuickNudge = (targetBuddy: User) => {
    setActiveChatId(targetBuddy.id);
    handleSendNudge();
  };

  // Scene Blast
  const handleSendWink = (winkId: string) => {
    if (!currentUser) return;

    setActiveWink({
      winkId,
      senderName: currentUser.name,
    });

    const winkEvent = {
      winkId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      targetUserId: activeChatId === 'the_void' ? null : activeChatId,
      roomId: activeChatId === 'the_void' ? 'the_void' : 'direct',
      timestamp: Date.now(),
    };

    if (socketRef.current?.connected) {
      socketRef.current.emit('chat:wink', winkEvent);
    } else {
      broadcastRef.current?.postMessage({ type: 'wink', payload: winkEvent });
    }
  };

  const handleSendInk = (imageDataUrl: string) => {
    handleSendMessage(imageDataUrl, 'image');
  };

  const handleTyping = (isTyping: boolean) => {
    if (!socketRef.current?.connected || !currentUser) return;
    socketRef.current.emit('user:typing', {
      roomId: activeChatId === 'the_void' ? 'the_void' : 'direct',
      isTyping,
    });
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setUnreadCounts((prev) => ({ ...prev, [chatId]: 0 }));
    setMobileTab('chat');
  };

  const handleResetSession = () => {
    if (confirm('Leave DEADVOX and switch persona?')) {
      localStorage.removeItem('deadvox_user_profile');
      window.location.reload();
    }
  };

  const activeTypingUsers = Object.entries(typingMap)
    .filter(([_, isTyping]) => isTyping)
    .map(([userName]) => userName);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-black font-msn text-zinc-100 select-none">
      {/* Titlebar Header */}
      <Header
        onEditProfile={() => setIsEditProfileOpen(true)}
        onResetSession={handleResetSession}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto shadow-2xl border-x border-zinc-800 bg-zinc-950">
        {/* Left Side: Contact List & User Profile */}
        <div
          className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-zinc-800 flex-shrink-0 bg-zinc-950 transition-all ${
            mobileTab === 'contacts' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {currentUser && (
            <ProfileBar
              currentUser={currentUser}
              onUpdateProfile={handleUpdateProfile}
              onOpenEditModal={() => setIsEditProfileOpen(true)}
            />
          )}

          <ContactList
            users={users}
            currentUser={currentUser || ({} as User)}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            unreadCounts={unreadCounts}
            onQuickNudge={handleQuickNudge}
          />
        </div>

        {/* Right Side: Active Chat Window & Input */}
        <div
          className={`flex-1 flex flex-col h-full bg-black overflow-hidden ${
            mobileTab === 'chat' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Mobile Back button */}
          <div className="md:hidden flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono">
            <button
              onClick={() => setMobileTab('contacts')}
              className="text-rose-400 font-bold flex items-center gap-1"
            >
              ← Back to Scene Kids
            </button>
            <span className="font-semibold text-zinc-300">
              {activeChatId === 'the_void' ? 'THE VOID' : 'Direct Wire'}
            </span>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <ChatWindow
              activeChatId={activeChatId}
              users={users}
              currentUser={currentUser || ({} as User)}
              messages={messages}
              typingUsers={activeTypingUsers}
              onSendNudge={handleSendNudge}
              isNudging={isNudging}
            />

            <MessageInput
              onSendMessage={handleSendMessage}
              onSendNudge={handleSendNudge}
              onSendWink={handleSendWink}
              onOpenInk={() => setIsInkOpen(true)}
              onTyping={handleTyping}
              fontColor={fontColor}
              onChangeFontColor={setFontColor}
              nudgeCooldown={nudgeCooldown}
            />
          </div>
        </div>
      </div>

      {/* Scribble Graffiti Canvas Modal */}
      <InkCanvas
        isOpen={isInkOpen}
        onClose={() => setIsInkOpen(false)}
        onSendInk={handleSendInk}
      />

      {/* Scene Blast Overlay (SILENT) */}
      <WinkPlayer
        activeWink={activeWink}
        onFinished={() => setActiveWink(null)}
      />

      {/* Sliding Toast Popups (SILENT) */}
      <ToastAlert
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
        onClickToast={(toast) => {
          if (toast.title.includes('Void')) {
            setActiveChatId('the_void');
          }
          setMobileTab('chat');
        }}
      />

      {/* Guest Entrance Modal */}
      <JoinModal
        isOpen={isJoinModalOpen}
        onJoin={handleJoin}
        currentUser={currentUser || undefined}
        isEditMode={false}
      />

      {/* Edit Persona Modal */}
      <JoinModal
        isOpen={isEditProfileOpen}
        onJoin={handleJoin}
        currentUser={currentUser || undefined}
        isEditMode={true}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </div>
  );
};

export default App;

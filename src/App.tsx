import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message, ToastNotification } from './types';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { MessageInput } from './components/MessageInput';
import { InkCanvas } from './components/InkCanvas';
import { WinkPlayer } from './components/WinkPlayer';
import { ToastAlert } from './components/ToastAlert';
import { SCENE_USERNAMES, DEFAULT_AVATARS } from './utils/avatars';

export const App: React.FC = () => {
  // User handle (stored in localStorage, zero login or persona required)
  const [userName, setUserName] = useState<string>(() => {
    const saved = localStorage.getItem('deadvox_username');
    if (saved) return saved;
    const random = SCENE_USERNAMES[Math.floor(Math.random() * SCENE_USERNAMES.length)];
    localStorage.setItem('deadvox_username', random);
    return random;
  });

  const [userAvatar, setUserAvatar] = useState<string>(() => {
    const saved = localStorage.getItem('deadvox_avatar');
    if (saved) return saved;
    const random = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)].id;
    localStorage.setItem('deadvox_avatar', random);
    return random;
  });

  const [fontColor, setFontColor] = useState<string>(() => {
    return localStorage.getItem('deadvox_font_color') || '#ff007f';
  });

  // Persistent messages state (cached in localStorage + synced with server disk)
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const cached = localStorage.getItem('deadvox_messages_cache');
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });

  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isNudging, setIsNudging] = useState<boolean>(false);
  const [nudgeCooldown, setNudgeCooldown] = useState<number>(0);
  const [activeWink, setActiveWink] = useState<{ winkId: string; senderName: string } | null>(null);
  const [isInkOpen, setIsInkOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

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

  // Persist messages cache in localStorage whenever updated
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('deadvox_messages_cache', JSON.stringify(messages.slice(-300)));
      } catch {}
    }
  }, [messages]);

  // Fetch persistent messages from server REST API on load
  useEffect(() => {
    fetch('/api/messages')
      .then((res) => res.json())
      .then((serverMessages: Message[]) => {
        if (Array.isArray(serverMessages) && serverMessages.length > 0) {
          setMessages((prev) => {
            const map = new Map<string, Message>();
            prev.forEach((m) => map.set(m.id, m));
            serverMessages.forEach((m) => map.set(m.id, m));
            return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
          });
        }
      })
      .catch((err) => console.log('Could not fetch /api/messages:', err));
  }, []);

  // Socket & BroadcastChannel setup
  useEffect(() => {
    const bc = new BroadcastChannel('deadvox_open_bus');
    broadcastRef.current = bc;

    bc.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'message') {
        appendMessage(payload);
      } else if (type === 'nudge') {
        triggerScream(payload.senderName);
      } else if (type === 'wink') {
        setActiveWink({ winkId: payload.winkId, senderName: payload.senderName });
      }
    };

    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('user:join', {
        name: userName,
        avatar: userAvatar,
        fontColor: fontColor,
      });
    });

    socket.on('init', (data) => {
      if (data.messages && Array.isArray(data.messages)) {
        setMessages((prev) => {
          const map = new Map<string, Message>();
          prev.forEach((m) => map.set(m.id, m));
          data.messages.forEach((m: Message) => map.set(m.id, m));
          return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
        });
      }
      if (data.users) {
        setOnlineCount(data.users.length);
      }
    });

    socket.on('users:count', (count: number) => {
      setOnlineCount(count);
    });

    socket.on('user:joined', (user) => {
      showToast(`${user.name} joined the wall.`, 'New Freak', user.avatar);
    });

    socket.on('message:received', (message: Message) => {
      appendMessage(message);
    });

    socket.on('chat:nudged', (nudgeData) => {
      triggerScream(nudgeData.senderName);
    });

    socket.on('chat:winked', (winkData) => {
      setActiveWink({ winkId: winkData.winkId, senderName: winkData.senderName });
    });

    socket.on('user:typing', (data) => {
      if (data.userName === userName) return;
      setTypingUsers((prev) => {
        if (data.isTyping && !prev.includes(data.userName)) {
          return [...prev, data.userName];
        } else if (!data.isTyping) {
          return prev.filter((u) => u !== data.userName);
        }
        return prev;
      });
    });

    return () => {
      socket.disconnect();
      bc.close();
    };
  }, [userName, userAvatar, fontColor]);

  const showToast = (message: string, title: string = 'DEADVOX Alert', avatar?: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: ToastNotification = { id, title, message, avatar, timestamp: Date.now() };
    setToasts((prev) => [...prev.slice(-3), newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const appendMessage = (message: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  };

  const triggerScream = (senderName: string) => {
    setIsNudging(true);
    setTimeout(() => setIsNudging(false), 800);
  };

  // Name update & shuffle
  const handleUpdateUserName = (newName: string) => {
    const trimmed = newName.trim() || 'Anonymous';
    setUserName(trimmed);
    localStorage.setItem('deadvox_username', trimmed);
    if (socketRef.current?.connected) {
      socketRef.current.emit('user:join', { name: trimmed, avatar: userAvatar, fontColor });
    }
  };

  const handleShuffleName = () => {
    const random = SCENE_USERNAMES[Math.floor(Math.random() * SCENE_USERNAMES.length)];
    handleUpdateUserName(random);
  };

  // Font color update
  const handleUpdateFontColor = (color: string) => {
    setFontColor(color);
    localStorage.setItem('deadvox_font_color', color);
  };

  // Post message (saves to server REST + WebSocket + Local Cache)
  const handleSendMessage = (content: string, type: 'text' | 'image' = 'text') => {
    const messagePayload = {
      senderName: userName,
      senderAvatar: userAvatar,
      fontColor: fontColor,
      type: type,
      content: content,
      roomId: 'the_void',
    };

    if (socketRef.current?.connected) {
      socketRef.current.emit('message:send', messagePayload);
    } else {
      // POST directly via HTTP REST API
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messagePayload),
      }).catch((err) => console.log('Error posting message:', err));

      // Append locally
      const localMsg: Message = {
        id: `msg_local_${Date.now()}`,
        senderId: `anon_${Date.now()}`,
        senderName: userName,
        senderAvatar: userAvatar,
        fontColor: fontColor,
        type: type,
        content: content,
        timestamp: Date.now(),
        roomId: 'the_void',
      };
      appendMessage(localMsg);
      broadcastRef.current?.postMessage({ type: 'message', payload: localMsg });
    }
  };

  // SCREAM (!)
  const handleSendNudge = () => {
    if (nudgeCooldown > 0) return;
    setNudgeCooldown(4);
    setIsNudging(true);
    setTimeout(() => setIsNudging(false), 800);

    const payload = {
      senderName: userName,
      timestamp: Date.now(),
      roomId: 'the_void',
    };

    if (socketRef.current?.connected) {
      socketRef.current.emit('chat:nudge', payload);
    } else {
      broadcastRef.current?.postMessage({ type: 'nudge', payload });
    }
  };

  // Scene Blast
  const handleSendWink = (winkId: string) => {
    setActiveWink({ winkId, senderName: userName });

    const payload = {
      winkId,
      senderName: userName,
      timestamp: Date.now(),
      roomId: 'the_void',
    };

    if (socketRef.current?.connected) {
      socketRef.current.emit('chat:wink', payload);
    } else {
      broadcastRef.current?.postMessage({ type: 'wink', payload });
    }
  };

  // Scribble Graffiti
  const handleSendInk = (imageDataUrl: string) => {
    handleSendMessage(imageDataUrl, 'image');
  };

  const handleTyping = (isTyping: boolean) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('user:typing', {
      userName: userName,
      isTyping: isTyping,
    });
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-black font-msn text-zinc-100 select-none">
      {/* Mobile-Friendly Header */}
      <Header
        onlineCount={onlineCount}
        userName={userName}
        onShuffleName={handleShuffleName}
      />

      {/* Main Open Chat Stream (The Void) */}
      <main className="flex-1 overflow-hidden flex flex-col w-full max-w-4xl mx-auto bg-zinc-950 sm:border-x sm:border-zinc-800 shadow-2xl relative">
        <ChatWindow
          messages={messages}
          typingUsers={typingUsers}
          isNudging={isNudging}
        />

        <MessageInput
          userName={userName}
          onChangeUserName={handleUpdateUserName}
          onShuffleUserName={handleShuffleName}
          onSendMessage={handleSendMessage}
          onSendNudge={handleSendNudge}
          onSendWink={handleSendWink}
          onOpenInk={() => setIsInkOpen(true)}
          onTyping={handleTyping}
          fontColor={fontColor}
          onChangeFontColor={handleUpdateFontColor}
          nudgeCooldown={nudgeCooldown}
        />
      </main>

      {/* Sharpie Scribble Graffiti Canvas Modal */}
      <InkCanvas
        isOpen={isInkOpen}
        onClose={() => setIsInkOpen(false)}
        onSendInk={handleSendInk}
      />

      {/* Scene Blast Overlay (Silent) */}
      <WinkPlayer
        activeWink={activeWink}
        onFinished={() => setActiveWink(null)}
      />

      {/* Toast Alerts (Silent) */}
      <ToastAlert
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
};

export default App;

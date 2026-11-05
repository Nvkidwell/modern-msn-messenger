import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from './types';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { MessageInput } from './components/MessageInput';
import { getRandomName, getRandomColor } from './utils/avatars';

export const App: React.FC = () => {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('openchat_theme') === 'dark';
  });

  // User identity (saved in localStorage, no login required)
  const [userName, setUserName] = useState<string>(() => {
    const saved = localStorage.getItem('openchat_username');
    if (saved) return saved;
    const random = getRandomName();
    localStorage.setItem('openchat_username', random);
    return random;
  });

  const [avatarColor] = useState<string>(() => {
    const saved = localStorage.getItem('openchat_avatar_color');
    if (saved) return saved;
    const color = getRandomColor();
    localStorage.setItem('openchat_avatar_color', color);
    return color;
  });

  // Persistent messages state (cached in localStorage + synced with server disk)
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const cached = localStorage.getItem('openchat_messages');
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });

  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('openchat_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('openchat_theme', 'light');
    }
  }, [isDark]);

  // Persist messages in localStorage whenever updated
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('openchat_messages', JSON.stringify(messages.slice(-500)));
      } catch (err) {
        console.error('Failed to cache messages to localStorage:', err);
      }
    }
  }, [messages]);

  // Helper to safely append unique messages
  const appendMessage = (message: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      const updated = [...prev, message].sort((a, b) => a.timestamp - b.timestamp);
      try {
        localStorage.setItem('openchat_messages', JSON.stringify(updated.slice(-500)));
      } catch {}
      return updated;
    });
  };

  // 1. Fetch persistent messages from server REST API on load
  const fetchServerMessages = () => {
    fetch('/api/messages')
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((serverMessages: Message[]) => {
        if (Array.isArray(serverMessages)) {
          setMessages((prev) => {
            const map = new Map<string, Message>();
            prev.forEach((m) => map.set(m.id, m));
            serverMessages.forEach((m) => map.set(m.id, m));
            const merged = Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
            try {
              localStorage.setItem('openchat_messages', JSON.stringify(merged.slice(-500)));
            } catch {}
            return merged;
          });
        }
      })
      .catch((err) => console.log('Notice: /api/messages fetch status:', err.message));
  };

  useEffect(() => {
    fetchServerMessages();
  }, []);

  // 2. Real-time WebSockets & Multi-Tab Broadcast setup
  useEffect(() => {
    const bc = new BroadcastChannel('openchat_channel');
    broadcastRef.current = bc;

    bc.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'message') {
        appendMessage(payload);
      }
    };

    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      fetchServerMessages();
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
      if (data.onlineCount) {
        setOnlineCount(data.onlineCount);
      }
    });

    socket.on('users:count', (count: number) => {
      setOnlineCount(count);
    });

    socket.on('message:received', (message: Message) => {
      appendMessage(message);
    });

    socket.on('user:typing', (data: { senderName: string; isTyping: boolean }) => {
      if (data.senderName === userName) return;
      setTypingUsers((prev) => {
        if (data.isTyping && !prev.includes(data.senderName)) {
          return [...prev, data.senderName];
        } else if (!data.isTyping) {
          return prev.filter((u) => u !== data.senderName);
        }
        return prev;
      });
    });

    return () => {
      socket.disconnect();
      bc.close();
    };
  }, [userName]);

  // Handle display name change
  const handleUpdateUserName = (newName: string) => {
    const trimmed = newName.trim() || getRandomName();
    setUserName(trimmed);
    localStorage.setItem('openchat_username', trimmed);
  };

  const handleShuffleName = () => {
    const newName = getRandomName();
    handleUpdateUserName(newName);
  };

  // Send message: GUARANTEED PERSISTENCE via Socket + REST API + LocalStorage
  const handleSendMessage = async (content: string, type: 'text' | 'image' = 'text') => {
    if (!content.trim()) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
      senderName: userName,
      content: content.trim(),
      timestamp: Date.now(),
      type: type,
      avatarColor: avatarColor,
    };

    // 1. Immediately store in local state & localStorage so user never loses it
    appendMessage(newMsg);

    // 2. Broadcast across tabs immediately
    broadcastRef.current?.postMessage({ type: 'message', payload: newMsg });

    // 3. Send to Server via Socket.IO if connected
    if (socketRef.current?.connected) {
      socketRef.current.emit('message:send', newMsg);
    }

    // 4. ALSO POST to REST API to ensure permanent disk write in server/data/messages.json
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg),
      });
    } catch (err) {
      console.log('Saved locally (network background sync):', err);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('user:typing', {
      senderName: userName,
      isTyping: isTyping,
    });
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* Header */}
      <Header
        onlineCount={onlineCount}
        userName={userName}
        onShuffleName={handleShuffleName}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* Main Chat Stream Container */}
      <main className="flex-1 overflow-hidden flex flex-col w-full max-w-3xl mx-auto bg-white dark:bg-slate-900 sm:border-x border-slate-200 dark:border-slate-800 sm:shadow-lg relative">
        <ChatWindow
          messages={messages}
          currentUserName={userName}
          typingUsers={typingUsers}
        />

        <MessageInput
          userName={userName}
          onChangeUserName={handleUpdateUserName}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
        />
      </main>
    </div>
  );
};

export default App;

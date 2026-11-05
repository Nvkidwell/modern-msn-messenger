import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  maxHttpBufferSize: 1e7,
});

const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 3000 : 3001);
const DATA_FILE = path.join(__dirname, 'data/messages.json');

// Ensure data folder exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Load persistent messages from disk
let messageHistory = [];
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    messageHistory = JSON.parse(raw);
  }
} catch (err) {
  console.error('Error reading messages.json:', err);
  messageHistory = [];
}

// Function to save messages to disk safely
function saveMessages() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(messageHistory.slice(-500), null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to messages.json:', err);
  }
}

const users = new Map(); // socketId -> User

// Raven Scene Queen Bot
const SCENE_BOT = {
  id: 'bot_raven',
  name: 'Raven_SceneQueen',
  avatar: 'eye',
  status: 'online',
  mood: '🖤 Melancholy',
  fontColor: '#ff007f',
  isBot: true,
};

function getSceneBotResponse(userMsg, userName) {
  const text = (userMsg || '').trim().toLowerCase();

  if (text.includes('scream') || text.includes('nudge') || text.includes('buzz')) {
    return `OMG ${userName}!! Why did you just SCREAM at the void?! My screen is shaking violently! >_< (6)`;
  }
  if (text === 'hi' || text === 'hello' || text === 'hey' || text.startsWith('hey')) {
    return `hey ${userName}.. rawr xD welcome to the open chat. what band are you blasting today? 🖤`;
  }
  if (text.includes('rawr') || text.includes('xd')) {
    return `xD RAWR means I love you in dinosaur!! don't let anyone tell you otherwise!! &lt;3`;
  }
  if (text.includes('top 8') || text.includes('top eight') || text.includes('top8')) {
    return `You're in my Top 8 for posting on this wall! Don't let the preps see! 🖤⚡`;
  }
  if (text.includes('song') || text.includes('music') || text.includes('band')) {
    const songs = [
      "Currently blasting: Hawthorne Heights - Ohio Is For Lovers (So cut my wrists and black my eyes.. 🎶)",
      "Vibing to: Taking Back Sunday - MakeDamnSure! Pure angst! 🖤",
      "Obsessed with: Paramore - Misery Business! Hayley Williams is iconic! 🎸",
      "Listening to: The Used - The Taste of Ink! ⚡",
      "On repeat: My Chemical Romance - Helena! 💀 So long and goodnight!",
    ];
    return songs[Math.floor(Math.random() * songs.length)];
  }
  if (text.includes('hair') || text.includes('eyeliner') || text.includes('bangs')) {
    return `Tease your side bangs until they block 70% of your vision. The true scene way. ;)`;
  }
  if (text.includes('joke')) {
    const jokes = [
      "How many scene kids does it take to change a lightbulb? None, they just sit in the dark and cry. T_T",
      "Why did the emo kid cross the road? To get away from the preps. xD",
      "What is an emo kid's favorite drink? Bitter black coffee. ☕🖤",
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  const generic = [
    `honestly ${userName}, this chat wall gets me. post as much as you want, nobody can delete our angst. 🖤`,
    `total mood. did you tease your hair today? xD`,
    `i feel that in my soul. hit that SCREAM button if you need to shake the void! ⚡`,
    `deep thoughts.. writing this down in my black leather journal. 🥀`,
    `so true. adding you to my Top 8 right now! ;)`,
  ];
  return generic[Math.floor(Math.random() * generic.length)];
}

// REST API for fetching persistent messages
app.get('/api/messages', (req, res) => {
  res.json(messageHistory);
});

// REST API for posting messages directly
app.post('/api/messages', (req, res) => {
  const { senderName, content, type = 'text', fontColor = '#ff007f', senderAvatar = 'blackheart' } = req.body;
  if (!content && type !== 'nudge') {
    return res.status(400).json({ error: 'Content required' });
  }

  const message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
    senderId: req.body.senderId || `anon_${Date.now()}`,
    senderName: senderName || 'Anonymous Freak',
    senderAvatar: senderAvatar,
    fontColor: fontColor,
    type: type,
    content: content || '',
    timestamp: Date.now(),
    roomId: 'the_void',
  };

  messageHistory.push(message);
  saveMessages();

  io.emit('message:received', message);
  res.json({ success: true, message });
});

// Socket.IO for real-time live chatter
io.on('connection', (socket) => {
  // Notify client of current messages on connect
  socket.emit('init', {
    users: [SCENE_BOT, ...Array.from(users.values())],
    messages: messageHistory,
  });

  // Client updates identity (optional, no login required)
  socket.on('user:join', (userData) => {
    const user = {
      id: userData.id || socket.id,
      socketId: socket.id,
      name: userData.name || 'Anonymous Freak',
      avatar: userData.avatar || 'blackheart',
      status: 'online',
      mood: userData.mood || '🖤 Melancholy',
      fontColor: userData.fontColor || '#ff007f',
      isBot: false,
    };
    users.set(socket.id, user);

    io.emit('user:joined', user);
    io.emit('users:count', users.size + 1);
  });

  // New message posted
  socket.on('message:send', (msgData) => {
    const user = users.get(socket.id);
    const name = msgData.senderName || user?.name || 'Anonymous Freak';
    const avatar = msgData.senderAvatar || user?.avatar || 'blackheart';
    const fontColor = msgData.fontColor || user?.fontColor || '#ff007f';

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
      senderId: user?.id || socket.id,
      senderName: name,
      senderAvatar: avatar,
      fontColor: fontColor,
      type: msgData.type || 'text',
      content: msgData.content,
      timestamp: Date.now(),
      roomId: 'the_void',
    };

    messageHistory.push(message);
    saveMessages();

    // Broadcast immediately to everyone
    io.emit('message:received', message);

    // Bot Raven logic
    const textLower = (msgData.content || '').toLowerCase();
    const shouldReply = textLower.includes('raven') ||
      textLower.includes('@raven') ||
      textLower.includes('rawr') ||
      textLower.includes('emo') ||
      textLower.includes('mcr') ||
      textLower.includes('top 8') ||
      Math.random() < 0.2; // 20% organic chance to chime in

    if (shouldReply) {
      setTimeout(() => {
        io.emit('user:typing', { userName: SCENE_BOT.name, isTyping: true });
      }, 500);

      setTimeout(() => {
        io.emit('user:typing', { userName: SCENE_BOT.name, isTyping: false });
        const replyText = getSceneBotResponse(msgData.content, name);

        const botMessage = {
          id: `msg_${Date.now()}_bot`,
          senderId: SCENE_BOT.id,
          senderName: SCENE_BOT.name,
          senderAvatar: SCENE_BOT.avatar,
          fontColor: SCENE_BOT.fontColor,
          type: 'text',
          content: replyText,
          timestamp: Date.now(),
          roomId: 'the_void',
        };

        messageHistory.push(botMessage);
        saveMessages();
        io.emit('message:received', botMessage);
      }, 1500);
    }
  });

  // SCREAM (!)
  socket.on('chat:nudge', (data) => {
    const user = users.get(socket.id);
    const name = data.senderName || user?.name || 'Someone';

    const nudgeEvent = {
      senderId: user?.id || socket.id,
      senderName: name,
      timestamp: Date.now(),
      roomId: 'the_void',
    };

    io.emit('chat:nudged', nudgeEvent);

    // Also persist scream in history
    const screamMsg = {
      id: `scream_${Date.now()}`,
      senderId: user?.id || socket.id,
      senderName: name,
      senderAvatar: user?.avatar || 'lightning',
      type: 'nudge',
      content: 'scream',
      timestamp: Date.now(),
      roomId: 'the_void',
    };
    messageHistory.push(screamMsg);
    saveMessages();
    io.emit('message:received', screamMsg);

    // Raven screams back
    setTimeout(() => {
      const botScream = {
        id: `scream_${Date.now()}_bot`,
        senderId: SCENE_BOT.id,
        senderName: SCENE_BOT.name,
        senderAvatar: SCENE_BOT.avatar,
        fontColor: SCENE_BOT.fontColor,
        type: 'text',
        content: `* SCREAMS BACK VIOLENTLY * >_< ⚡ don't break the chat wall! (6)`,
        timestamp: Date.now(),
        roomId: 'the_void',
      };
      messageHistory.push(botScream);
      saveMessages();
      io.emit('message:received', botScream);
    }, 1200);
  });

  // Scene Blast
  socket.on('chat:wink', (data) => {
    const user = users.get(socket.id);
    const name = data.senderName || user?.name || 'Someone';

    const winkEvent = {
      winkId: data.winkId,
      senderName: name,
      timestamp: Date.now(),
    };

    io.emit('chat:winked', winkEvent);

    const winkMsg = {
      id: `wink_${Date.now()}`,
      senderId: user?.id || socket.id,
      senderName: name,
      senderAvatar: user?.avatar || 'blackheart',
      type: 'wink',
      content: data.winkId,
      timestamp: Date.now(),
      roomId: 'the_void',
    };
    messageHistory.push(winkMsg);
    saveMessages();
    io.emit('message:received', winkMsg);
  });

  socket.on('user:typing', (data) => {
    const user = users.get(socket.id);
    socket.broadcast.emit('user:typing', {
      userName: data.userName || user?.name || 'Someone',
      isTyping: data.isTyping,
    });
  });

  socket.on('disconnect', () => {
    users.delete(socket.id);
    io.emit('users:count', users.size + 1);
  });
});

// Serve frontend build in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

server.listen(PORT, () => {
  console.log(`🖤⚡ DEADVOX Open Chat Wall running on http://localhost:${PORT}`);
});

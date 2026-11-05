import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
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

const users = new Map();
const messageHistory = [];

// Scene Queen Bot
const SCENE_BOT = {
  id: 'bot_raven',
  name: 'Raven_SceneQueen',
  email: 'raven@deadvox.net',
  avatar: 'eye',
  status: 'online',
  mood: '🖤 Melancholy',
  personalMessage: '(8) Hawthorne Heights - Ohio Is For Lovers (8) | Top 8 is locked!',
  currentSong: 'Taking Back Sunday - MakeDamnSure',
  fontColor: '#ff007f',
  isBot: true,
};

function getSceneBotResponse(userMsg, userName) {
  const text = (userMsg || '').trim().toLowerCase();

  if (text.includes('nudge') || text.includes('scream') || text.includes('buzz')) {
    return `OMG ${userName}!! Why did you just SCREAM at me?! My screen is shaking so hard my studded belt fell off! Take this! >_< (6)`;
  }
  if (text === 'hi' || text === 'hello' || text === 'hey' || text.startsWith('hey')) {
    return `hey ${userName}.. rawr xD welcome to DEADVOX. what band are you listening to right now?`;
  }
  if (text.includes('rawr') || text.includes('xd')) {
    return `xD RAWR means I love you in dinosaur!! don't let the preps tell you otherwise!! &lt;3`;
  }
  if (text.includes('top 8') || text.includes('top eight') || text.includes('top8')) {
    return `You want in my Top 8? First you gotta prove you know every lyric to Helena by My Chemical Romance. Are you worthy? 🖤`;
  }
  if (text.includes('song') || text.includes('music') || text.includes('band')) {
    const songs = [
      "Currently blasting: Hawthorne Heights - Ohio Is For Lovers (So cut my wrists and black my eyes.. 🎶)",
      "Vibing to: Taking Back Sunday - MakeDamnSure! Pure poetry! 🖤",
      "Obsessed with: Paramore - Misery Business! Hayley Williams is our queen! 🎸",
      "Listening to: The Used - The Taste of Ink! Certified anthem! ⚡",
      "On repeat: My Chemical Romance - I'm Not Okay (I Promise)! 💀",
    ];
    return songs[Math.floor(Math.random() * songs.length)];
  }
  if (text.includes('hair') || text.includes('eyeliner') || text.includes('bangs')) {
    return `Pro tip: use liquid waterproof eyeliner and tease your side bangs until they defy gravity. The higher the hair, the closer to Gerard Way. ;)`;
  }
  if (text.includes('joke')) {
    const jokes = [
      "How many scene kids does it take to change a lightbulb? None, they just sit in the dark and cry. T_T",
      "Why did the emo kid cross the road? To get away from the preps. xD",
      "What's an emo kid's favorite drink? Depress-o! ☕🖤",
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  if (text.includes('asl') || text.includes('a/s/l')) {
    return "17 / F / In the back of the Vans Warped Tour bus crying over Taking Back Sunday. 🖤";
  }
  if (text.includes('bye') || text.includes('brb') || text.includes('gtg')) {
    return `k bye ${userName}.. don't forget to put on your heavy eyeliner before you go out. xoxo`;
  }

  const generic = [
    `honestly ${userName}, nobody understands us anyway. that's why we're on DEADVOX. 🖤`,
    `total mood. have you updated your away message today? xD`,
    `i feel that in my soul. btw did you know you can trigger Scene Blasts and Sharpie Scribbles down below? ⚡`,
    `deep thoughts.. i should write a poem about that in my leather diary. 🥀`,
    `so true. adding you to my Top 8 right now (don't tell anyone)! ;)`,
  ];
  return generic[Math.floor(Math.random() * generic.length)];
}

io.on('connection', (socket) => {
  socket.on('user:join', (userData) => {
    const user = {
      id: userData.id || socket.id,
      socketId: socket.id,
      name: userData.name || 'Anonymous Freak',
      email: userData.email || 'freak@deadvox.net',
      avatar: userData.avatar || 'blackheart',
      status: userData.status || 'online',
      mood: userData.mood || '🖤 Melancholy',
      personalMessage: userData.personalMessage || '~*~ I\'m not okay, but nobody listens anyway ~*~',
      currentSong: userData.currentSong || '',
      fontColor: userData.fontColor || '#ff007f',
      isBot: false,
    };

    users.set(socket.id, user);

    const allUsers = [SCENE_BOT, ...Array.from(users.values())];
    socket.emit('init', {
      currentUser: user,
      users: allUsers,
      messages: messageHistory.slice(-50),
    });

    socket.broadcast.emit('user:joined', user);
  });

  socket.on('user:update', (updatedFields) => {
    const current = users.get(socket.id);
    if (!current) return;

    const updated = { ...current, ...updatedFields };
    users.set(socket.id, updated);

    io.emit('user:updated', updated);
  });

  socket.on('message:send', (msgData) => {
    const sender = users.get(socket.id);
    if (!sender) return;

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      senderEmail: sender.email,
      fontColor: sender.fontColor || '#ff007f',
      type: msgData.type || 'text',
      content: msgData.content,
      timestamp: Date.now(),
      targetUserId: msgData.targetUserId || null,
      roomId: msgData.roomId || 'the_void',
    };

    messageHistory.push(message);
    if (messageHistory.length > 200) {
      messageHistory.shift();
    }

    io.emit('message:received', message);

    const isDirectToBot = msgData.targetUserId === SCENE_BOT.id;
    const isVoidMention = msgData.roomId === 'the_void' &&
      (msgData.content.toLowerCase().includes('raven') || msgData.content.toLowerCase().includes('@raven'));

    if (isDirectToBot || isVoidMention) {
      setTimeout(() => {
        io.emit('user:typing', { userId: SCENE_BOT.id, roomId: msgData.roomId, isTyping: true });
      }, 400);

      setTimeout(() => {
        io.emit('user:typing', { userId: SCENE_BOT.id, roomId: msgData.roomId, isTyping: false });
        const replyText = getSceneBotResponse(msgData.content, sender.name);

        const botMessage = {
          id: `msg_${Date.now()}_bot`,
          senderId: SCENE_BOT.id,
          senderName: SCENE_BOT.name,
          senderAvatar: SCENE_BOT.avatar,
          senderEmail: SCENE_BOT.email,
          fontColor: SCENE_BOT.fontColor,
          type: 'text',
          content: replyText,
          timestamp: Date.now(),
          targetUserId: isDirectToBot ? sender.id : null,
          roomId: msgData.roomId,
        };

        messageHistory.push(botMessage);
        io.emit('message:received', botMessage);
      }, 1200);
    }
  });

  // Scream / Panic
  socket.on('chat:nudge', (data) => {
    const sender = users.get(socket.id);
    if (!sender) return;

    const nudgeEvent = {
      senderId: sender.id,
      senderName: sender.name,
      targetUserId: data.targetUserId || null,
      roomId: data.roomId || 'the_void',
      timestamp: Date.now(),
    };

    io.emit('chat:nudged', nudgeEvent);

    if (data.targetUserId === SCENE_BOT.id) {
      setTimeout(() => {
        const botNudge = {
          senderId: SCENE_BOT.id,
          senderName: SCENE_BOT.name,
          targetUserId: sender.id,
          roomId: data.roomId,
          timestamp: Date.now(),
        };
        io.emit('chat:nudged', botNudge);

        const botMsg = {
          id: `msg_${Date.now()}_bot_scream`,
          senderId: SCENE_BOT.id,
          senderName: SCENE_BOT.name,
          senderAvatar: SCENE_BOT.avatar,
          senderEmail: SCENE_BOT.email,
          fontColor: SCENE_BOT.fontColor,
          type: 'text',
          content: `HEY ${sender.name}!! You screamed so I am SCREAMING RIGHT BACK! Take that! >_< ⚡ (6)`,
          timestamp: Date.now(),
          targetUserId: sender.id,
          roomId: data.roomId,
        };
        messageHistory.push(botMsg);
        io.emit('message:received', botMsg);
      }, 1400);
    }
  });

  // Scene Blast / Wink
  socket.on('chat:wink', (data) => {
    const sender = users.get(socket.id);
    if (!sender) return;

    const winkEvent = {
      winkId: data.winkId,
      senderId: sender.id,
      senderName: sender.name,
      targetUserId: data.targetUserId || null,
      roomId: data.roomId || 'the_void',
      timestamp: Date.now(),
    };

    io.emit('chat:winked', winkEvent);

    const winkMsg = {
      id: `msg_wink_${Date.now()}`,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      senderEmail: sender.email,
      fontColor: sender.fontColor,
      type: 'wink',
      content: data.winkId,
      timestamp: Date.now(),
      targetUserId: data.targetUserId || null,
      roomId: data.roomId || 'the_void',
    };

    messageHistory.push(winkMsg);
    io.emit('message:received', winkMsg);
  });

  socket.on('user:typing', (data) => {
    const sender = users.get(socket.id);
    if (!sender) return;

    socket.broadcast.emit('user:typing', {
      userId: sender.id,
      userName: sender.name,
      roomId: data.roomId,
      isTyping: data.isTyping,
    });
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      io.emit('user:left', { userId: user.id, name: user.name });
    }
  });
});

const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

server.listen(PORT, () => {
  console.log(`🖤⚡ DEADVOX server running on http://localhost:${PORT}`);
});

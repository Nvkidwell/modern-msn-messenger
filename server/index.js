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
app.use(express.json({ limit: '15mb' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  maxHttpBufferSize: 1e7,
});

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'messages.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load persistent messages from disk
let messages = [];
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    messages = JSON.parse(raw);
    console.log(`Loaded ${messages.length} messages from storage.`);
  } else {
    // Initial welcome message
    messages = [
      {
        id: 'msg_welcome',
        senderName: 'System',
        content: 'Welcome to OpenChat! Post anything freely. All messages are saved permanently for everyone to see.',
        timestamp: Date.now() - 60000,
        type: 'text',
      },
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2), 'utf-8');
  }
} catch (err) {
  console.error('Error initializing messages file:', err);
  messages = [];
}

// Safe synchronous save
function saveMessagesToDisk() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages.slice(-1000), null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write messages to disk:', err);
  }
}

// REST endpoint to get all saved messages
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

// REST endpoint to post a message directly (guaranteed to save)
app.post('/api/messages', (req, res) => {
  const { senderName = 'Guest', content, type = 'text', avatarColor } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  const newMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
    senderName: senderName.trim() || 'Guest',
    content: content.trim(),
    timestamp: Date.now(),
    type: type,
    avatarColor: avatarColor || '#3b82f6',
  };

  messages.push(newMessage);
  saveMessagesToDisk();

  // Broadcast to all active websocket connections
  io.emit('message:received', newMessage);

  res.status(201).json({ success: true, message: newMessage });
});

// Track active online connections count
let activeConnections = 0;

io.on('connection', (socket) => {
  activeConnections++;
  io.emit('users:count', activeConnections);

  // Send current message history on connection
  socket.emit('init', {
    messages,
    onlineCount: activeConnections,
  });

  // Handle incoming socket message
  socket.on('message:send', (data) => {
    if (!data.content || !data.content.trim()) return;

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
      senderName: (data.senderName || 'Guest').trim(),
      content: data.content.trim(),
      timestamp: Date.now(),
      type: data.type || 'text',
      avatarColor: data.avatarColor || '#3b82f6',
    };

    messages.push(newMessage);
    saveMessagesToDisk();

    io.emit('message:received', newMessage);
  });

  // Typing indicator
  socket.on('user:typing', (data) => {
    socket.broadcast.emit('user:typing', {
      senderName: data.senderName || 'Guest',
      isTyping: data.isTyping,
    });
  });

  socket.on('disconnect', () => {
    activeConnections = Math.max(0, activeConnections - 1);
    io.emit('users:count', activeConnections);
  });
});

// Serve frontend build in production
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (req.accepts('html')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

server.listen(PORT, () => {
  console.log(`💬 OpenChat server running on http://localhost:${PORT}`);
});

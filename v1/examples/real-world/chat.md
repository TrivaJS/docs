# Chat Application - Complete Example

Real-time chat application with rooms, private messages, and presence.

## Features

- ✅ Real-time messaging (WebSocket)
- ✅ Chat rooms
- ✅ Private messages
- ✅ User presence (online/offline)
- ✅ Message history
- ✅ Typing indicators
- ✅ File sharing

## Complete Code

```javascript
import { build, get, post, listen, cache } from 'triva';
import { sign, verify } from '@triva/jwt';
import { WebSocketServer } from 'ws';
import multer from '@triva/multer';

await build({
  cache: {
    type: 'redis',
    database: { host: 'localhost', port: 6379 }
  }
});

const upload = multer({ dest: './uploads/' });

// ==================
// HTTP ENDPOINTS
// ==================

// Register/Login
post('/auth/login', async (req, res) => {
  const { username } = await req.json();
  
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }
  
  const userId = Date.now().toString();
  const user = {
    id: userId,
    username,
    createdAt: new Date().toISOString()
  };
  
  await cache.set(`user:${userId}`, user);
  await cache.set(`user:username:${username}`, user);
  
  const token = sign({ userId, username }, process.env.JWT_SECRET);
  
  res.json({ user, token });
});

// Get rooms
get('/api/rooms', async (req, res) => {
  const keys = await cache.keys('room:*');
  const rooms = await Promise.all(keys.map(k => cache.get(k)));
  res.json({ rooms: rooms.filter(Boolean) });
});

// Create room
post('/api/rooms', async (req, res) => {
  const { name } = await req.json();
  
  if (!name) {
    return res.status(400).json({ error: 'Room name required' });
  }
  
  const roomId = Date.now().toString();
  const room = {
    id: roomId,
    name,
    createdAt: new Date().toISOString()
  };
  
  await cache.set(`room:${roomId}`, room);
  
  res.status(201).json({ room });
});

// Get message history
get('/api/rooms/:roomId/messages', async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  
  const keys = await cache.keys(`message:room:${req.params.roomId}:*`);
  let messages = await Promise.all(keys.map(k => cache.get(k)));
  
  messages = messages.filter(Boolean)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-limit);
  
  res.json({ messages });
});

// Upload file
post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const fileUrl = `/uploads/${req.file.filename}`;
  
  res.json({
    url: fileUrl,
    filename: req.file.originalname,
    size: req.file.size
  });
});

// ==================
// WEBSOCKET SERVER
// ==================

const server = listen(3000);
const wss = new WebSocketServer({ server });

const connections = new Map(); // userId -> ws
const rooms = new Map(); // roomId -> Set of userIds
const typing = new Map(); // roomId -> Set of userIds

wss.on('connection', (ws) => {
  let userId = null;
  let username = null;
  
  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());
      
      // ==================
      // AUTHENTICATE
      // ==================
      if (msg.type === 'auth') {
        try {
          const payload = verify(msg.token, process.env.JWT_SECRET);
          userId = payload.userId;
          username = payload.username;
          
          connections.set(userId, ws);
          
          // Set user online
          await cache.set(`presence:${userId}`, {
            status: 'online',
            lastSeen: new Date().toISOString()
          }, 86400000);
          
          ws.send(JSON.stringify({
            type: 'auth_success',
            userId,
            username
          }));
          
          broadcastPresence(userId, 'online');
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid token'
          }));
        }
      }
      
      // ==================
      // JOIN ROOM
      // ==================
      if (msg.type === 'join') {
        const roomId = msg.roomId;
        
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }
        
        rooms.get(roomId).add(userId);
        
        // Send room history
        const keys = await cache.keys(`message:room:${roomId}:*`);
        let messages = await Promise.all(keys.map(k => cache.get(k)));
        messages = messages.filter(Boolean)
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .slice(-50);
        
        ws.send(JSON.stringify({
          type: 'history',
          roomId,
          messages
        }));
        
        // Notify others
        broadcastToRoom(roomId, {
          type: 'user_joined',
          userId,
          username,
          timestamp: new Date().toISOString()
        }, userId);
      }
      
      // ==================
      // SEND MESSAGE
      // ==================
      if (msg.type === 'message' && msg.roomId) {
        const messageId = Date.now().toString();
        const message = {
          id: messageId,
          roomId: msg.roomId,
          userId,
          username,
          content: msg.content,
          timestamp: new Date().toISOString()
        };
        
        // Save message
        await cache.set(
          `message:room:${msg.roomId}:${messageId}`,
          message,
          604800000 // 7 days
        );
        
        // Broadcast to room
        broadcastToRoom(msg.roomId, {
          type: 'message',
          message
        });
      }
      
      // ==================
      // PRIVATE MESSAGE
      // ==================
      if (msg.type === 'private') {
        const recipientWs = connections.get(msg.to);
        
        if (recipientWs) {
          const message = {
            type: 'private',
            from: userId,
            fromUsername: username,
            content: msg.content,
            timestamp: new Date().toISOString()
          };
          
          recipientWs.send(JSON.stringify(message));
          
          // Echo back to sender
          ws.send(JSON.stringify({
            ...message,
            type: 'private_sent'
          }));
          
          // Save to history
          const messageId = Date.now().toString();
          await cache.set(
            `private:${userId}:${msg.to}:${messageId}`,
            message,
            604800000
          );
        } else {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'User not online'
          }));
        }
      }
      
      // ==================
      // TYPING INDICATOR
      // ==================
      if (msg.type === 'typing') {
        const roomId = msg.roomId;
        
        if (!typing.has(roomId)) {
          typing.set(roomId, new Set());
        }
        
        if (msg.isTyping) {
          typing.get(roomId).add(userId);
        } else {
          typing.get(roomId).delete(userId);
        }
        
        broadcastToRoom(roomId, {
          type: 'typing',
          userId,
          username,
          isTyping: msg.isTyping
        }, userId);
      }
      
      // ==================
      // LEAVE ROOM
      // ==================
      if (msg.type === 'leave') {
        const roomId = msg.roomId;
        
        if (rooms.has(roomId)) {
          rooms.get(roomId).delete(userId);
          
          broadcastToRoom(roomId, {
            type: 'user_left',
            userId,
            username,
            timestamp: new Date().toISOString()
          });
        }
      }
      
    } catch (error) {
      console.error('Message error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });
  
  ws.on('close', async () => {
    if (userId) {
      connections.delete(userId);
      
      // Remove from all rooms
      rooms.forEach((users, roomId) => {
        if (users.has(userId)) {
          users.delete(userId);
          
          broadcastToRoom(roomId, {
            type: 'user_left',
            userId,
            username,
            timestamp: new Date().toISOString()
          });
        }
      });
      
      // Set offline
      await cache.set(`presence:${userId}`, {
        status: 'offline',
        lastSeen: new Date().toISOString()
      }, 86400000);
      
      broadcastPresence(userId, 'offline');
    }
  });
});

// ==================
// HELPER FUNCTIONS
// ==================

function broadcastToRoom(roomId, message, excludeUserId = null) {
  const users = rooms.get(roomId);
  if (!users) return;
  
  const payload = JSON.stringify(message);
  
  users.forEach(userId => {
    if (userId !== excludeUserId) {
      const ws = connections.get(userId);
      if (ws && ws.readyState === 1) {
        ws.send(payload);
      }
    }
  });
}

function broadcastPresence(userId, status) {
  const message = JSON.stringify({
    type: 'presence',
    userId,
    status
  });
  
  connections.forEach(ws => {
    if (ws.readyState === 1) {
      ws.send(message);
    }
  });
}

console.log('💬 Chat server running on http://localhost:3000');
```

## Client Example

```javascript
const ws = new WebSocket('ws://localhost:3000');
const token = 'YOUR_JWT_TOKEN';

ws.onopen = () => {
  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    token
  }));
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  
  switch (msg.type) {
    case 'auth_success':
      console.log('Authenticated:', msg.username);
      // Join a room
      ws.send(JSON.stringify({
        type: 'join',
        roomId: 'general'
      }));
      break;
      
    case 'history':
      console.log('Message history:', msg.messages);
      break;
      
    case 'message':
      console.log(`[${msg.message.username}]: ${msg.message.content}`);
      break;
      
    case 'private':
      console.log(`Private from ${msg.fromUsername}: ${msg.content}`);
      break;
      
    case 'typing':
      console.log(`${msg.username} is typing...`);
      break;
      
    case 'presence':
      console.log(`User ${msg.userId} is now ${msg.status}`);
      break;
  }
};

// Send message
function sendMessage(roomId, content) {
  ws.send(JSON.stringify({
    type: 'message',
    roomId,
    content
  }));
}

// Send private message
function sendPrivate(to, content) {
  ws.send(JSON.stringify({
    type: 'private',
    to,
    content
  }));
}

// Typing indicator
function setTyping(roomId, isTyping) {
  ws.send(JSON.stringify({
    type: 'typing',
    roomId,
    isTyping
  }));
}
```

## API Endpoints

### Authentication
- `POST /auth/login` - Login/register

### Rooms
- `GET /api/rooms` - List rooms
- `POST /api/rooms` - Create room
- `GET /api/rooms/:roomId/messages` - Get message history

### Files
- `POST /api/upload` - Upload file

### WebSocket Messages
- `auth` - Authenticate connection
- `join` - Join room
- `message` - Send room message
- `private` - Send private message
- `typing` - Typing indicator
- `leave` - Leave room

---

**[Back to Examples](../README.md)**

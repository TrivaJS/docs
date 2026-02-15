# WebSocket Example

Real-time communication with WebSockets and Triva.

## Installation

```bash
npm install ws
```

## Basic WebSocket Server

```javascript
import { build, get, listen } from 'triva';
import { WebSocketServer } from 'ws';

await build({ cache: { type: 'memory' } });

// HTTP route
get('/', (req, res) => {
  res.header('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>WebSocket Test</title></head>
      <body>
        <h1>WebSocket Test</h1>
        <input id="msg" placeholder="Type a message">
        <button onclick="send()">Send</button>
        <div id="messages"></div>
        <script>
          const ws = new WebSocket('ws://localhost:3000');
          
          ws.onmessage = (event) => {
            const msg = document.createElement('p');
            msg.textContent = event.data;
            messages.appendChild(msg);
          };
          
          ws.onopen = () => console.log('Connected');
          ws.onclose = () => console.log('Disconnected');
          
          function send() {
            ws.send(msg.value);
            msg.value = '';
          }
        </script>
      </body>
    </html>
  `);
});

const server = listen(3000);

// WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.send('Welcome to WebSocket server!');
  
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    
    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // OPEN
        client.send(message.toString());
      }
    });
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

console.log('Server running on http://localhost:3000');
```

## Chat Room Application

```javascript
import { build, get, post, listen } from 'triva';
import { WebSocketServer } from 'ws';

await build({ 
  cache: { 
    type: 'redis', 
    database: { host: 'localhost' } 
  } 
});

const rooms = new Map();

const server = listen(3000);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  let username = null;
  let currentRoom = null;
  
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    
    // Join room
    if (msg.type === 'join') {
      username = msg.username;
      currentRoom = msg.room;
      
      if (!rooms.has(currentRoom)) {
        rooms.set(currentRoom, new Set());
      }
      
      rooms.get(currentRoom).add(ws);
      ws.username = username;
      ws.room = currentRoom;
      
      broadcast(currentRoom, {
        type: 'system',
        text: `${username} joined the room`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Send message
    if (msg.type === 'message' && currentRoom) {
      broadcast(currentRoom, {
        type: 'message',
        username,
        text: msg.text,
        timestamp: new Date().toISOString()
      });
    }
    
    // Leave room
    if (msg.type === 'leave' && currentRoom) {
      rooms.get(currentRoom)?.delete(ws);
      broadcast(currentRoom, {
        type: 'system',
        text: `${username} left the room`,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  ws.on('close', () => {
    if (currentRoom && rooms.has(currentRoom)) {
      rooms.get(currentRoom).delete(ws);
      broadcast(currentRoom, {
        type: 'system',
        text: `${username} disconnected`,
        timestamp: new Date().toISOString()
      });
    }
  });
});

function broadcast(room, message) {
  const clients = rooms.get(room);
  if (!clients) return;
  
  const payload = JSON.stringify(message);
  
  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
}

// HTTP endpoint to get active rooms
get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.entries()).map(([name, clients]) => ({
    name,
    users: clients.size
  }));
  
  res.json({ rooms: roomList });
});

console.log('Chat server running on http://localhost:3000');
```

## Client Example

```javascript
// chat-client.js
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  // Join room
  ws.send(JSON.stringify({
    type: 'join',
    username: 'Alice',
    room: 'general'
  }));
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  
  if (msg.type === 'message') {
    console.log(`[${msg.username}]: ${msg.text}`);
  } else if (msg.type === 'system') {
    console.log(`*** ${msg.text} ***`);
  }
};

// Send message
function sendMessage(text) {
  ws.send(JSON.stringify({
    type: 'message',
    text
  }));
}

// Usage
sendMessage('Hello, everyone!');
```

## Private Messages

```javascript
wss.on('connection', (ws) => {
  const clients = new Map();
  
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    
    if (msg.type === 'register') {
      clients.set(msg.userId, ws);
      ws.userId = msg.userId;
    }
    
    if (msg.type === 'private') {
      const recipient = clients.get(msg.to);
      
      if (recipient && recipient.readyState === 1) {
        recipient.send(JSON.stringify({
          type: 'private',
          from: ws.userId,
          text: msg.text,
          timestamp: new Date().toISOString()
        }));
      }
    }
  });
});
```

## Presence Detection

```javascript
import { cache } from 'triva';

const connections = new Map();

wss.on('connection', (ws) => {
  let userId = null;
  
  ws.on('message', async (data) => {
    const msg = JSON.parse(data.toString());
    
    if (msg.type === 'authenticate') {
      userId = msg.userId;
      connections.set(userId, ws);
      
      // Mark user as online
      await cache.set(`presence:${userId}`, {
        status: 'online',
        lastSeen: new Date().toISOString()
      });
      
      // Notify others
      broadcastPresence(userId, 'online');
    }
  });
  
  ws.on('close', async () => {
    if (userId) {
      connections.delete(userId);
      
      await cache.set(`presence:${userId}`, {
        status: 'offline',
        lastSeen: new Date().toISOString()
      });
      
      broadcastPresence(userId, 'offline');
    }
  });
});

function broadcastPresence(userId, status) {
  connections.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({
        type: 'presence',
        userId,
        status
      }));
    }
  });
}
```

## Heartbeat / Keep-Alive

```javascript
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const HEARTBEAT_TIMEOUT = 35000; // 35 seconds

wss.on('connection', (ws) => {
  ws.isAlive = true;
  
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    
    if (msg.type === 'ping') {
      ws.send(JSON.stringify({ type: 'pong' }));
    }
  });
});

// Ping clients periodically
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      return ws.terminate();
    }
    
    ws.isAlive = false;
    ws.ping();
  });
}, HEARTBEAT_INTERVAL);

wss.on('close', () => {
  clearInterval(interval);
});
```

## Testing

```bash
# Install wscat for testing
npm install -g wscat

# Connect to server
wscat -c ws://localhost:3000

# Send message
> {"type":"join","username":"Alice","room":"general"}
> {"type":"message","text":"Hello!"}
```

---

**[Back to Examples](../README.md)**

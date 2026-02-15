# Hello World

The simplest Triva application possible.

## Complete Example

```javascript
import { build, get, listen } from 'triva';

// Configure server
await build({
  cache: {
    type: 'memory'
  }
});

// Define route
get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

// Start server
listen(3000);
console.log('Server running on http://localhost:3000');
```

## Step by Step

### 1. Install Triva

```bash
npm init -y
npm install triva
```

### 2. Create `server.js`

```javascript
import { build, get, listen } from 'triva';

await build({ cache: { type: 'memory' } });

get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

listen(3000);
```

### 3. Update `package.json`

```json
{
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  }
}
```

### 4. Run

```bash
npm start
```

Visit http://localhost:3000

## Response

```json
{
  "message": "Hello, World!"
}
```

## Add More Routes

```javascript
import { build, get, post, listen } from 'triva';

await build({ cache: { type: 'memory' } });

// Home
get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

// About
get('/about', (req, res) => {
  res.json({ 
    name: 'My App',
    version: '1.0.0'
  });
});

// Echo endpoint
post('/echo', async (req, res) => {
  const body = await req.json();
  res.json({ 
    received: body,
    timestamp: new Date().toISOString()
  });
});

listen(3000);
```

## With HTML Response

```javascript
get('/', (req, res) => {
  res.header('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>Hello World</title></head>
      <body>
        <h1>Hello, World!</h1>
        <p>Powered by Triva</p>
      </body>
    </html>
  `);
});
```

## With Query Parameters

```javascript
get('/greet', (req, res) => {
  const name = req.query.name || 'World';
  res.json({ message: `Hello, ${name}!` });
});

// Visit: http://localhost:3000/greet?name=Alice
// Response: { "message": "Hello, Alice!" }
```

## Complete Starter

```javascript
import { build, get, post, listen } from 'triva';

// Build server
await build({
  cache: { type: 'memory' },
  env: process.env.NODE_ENV || 'development'
});

// Routes
get('/', (req, res) => {
  res.json({
    message: 'Hello, World!',
    endpoints: [
      'GET /',
      'GET /health',
      'GET /greet?name=YourName',
      'POST /echo'
    ]
  });
});

get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    uptime: process.uptime()
  });
});

get('/greet', (req, res) => {
  const name = req.query.name || 'World';
  res.json({ message: `Hello, ${name}!` });
});

post('/echo', async (req, res) => {
  const body = await req.json();
  res.json({ 
    received: body,
    timestamp: new Date().toISOString()
  });
});

// Start
const PORT = process.env.PORT || 3000;
listen(PORT);
console.log(`🚀 Server running on http://localhost:${PORT}`);
```

## Testing

```bash
# GET request
curl http://localhost:3000

# With query parameter
curl http://localhost:3000/greet?name=Alice

# POST request
curl -X POST http://localhost:3000/echo \
  -H "Content-Type: application/json" \
  -d '{"hello":"world"}'
```

## Next Steps

- [REST API Example](rest-api.md) - Build a full CRUD API
- [Authentication](authentication.md) - Add JWT auth
- [File Upload](file-upload.md) - Handle file uploads

---

**[Back to Examples](../README.md)**

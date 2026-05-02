# First Server Tutorial

Build your first Triva server step by step.

## Step 1: Create Project

```bash
mkdir my-triva-app
cd my-triva-app
npm init -y
npm install triva
```

## Step 2: Create Server File

Create `server.js`:

```javascript
import { build, get, listen } from 'triva';

await build({
  env: 'development'
});

get('/', (req, res) => {
  res.json({ message: 'Hello from Triva!' });
});

listen(3000);
console.log('Server running on http://localhost:3000');
```

## Step 3: Run the Server

```bash
node server.js
```

Open `http://localhost:3000` and you'll see:

```json
{
  "message": "Hello from Triva!"
}
```

## Step 4: Add More Routes

```javascript
import { build, get, post, listen } from 'triva';

await build({
  env: 'development'
});

get('/', (req, res) => {
  res.json({ message: 'GET request' });
});

post('/data', (req, res) => {
  res.json({ message: 'POST request', body: req.body });
});

get('/users/:id', (req, res) => {
  res.json({ userId: req.params.id });
});

listen(3000);
```

Test with curl:

```bash
curl http://localhost:3000
curl -X POST http://localhost:3000/data -H "Content-Type: application/json" -d '{"test":"data"}'
curl http://localhost:3000/users/123
```

## Step 5: Add Configuration

```javascript
import { build, get, listen } from 'triva';

await build({
  env: 'development',
  logging: {
    enabled: true,
    level: 'info'
  },
  cache: {
    type: 'memory',
    retention: 3600
  }
});

get('/', (req, res) => {
  res.json({ message: 'Hello!' });
});

listen(3000);
```

## Step 6: Enable Caching

```javascript
import { build, get, cache, listen } from 'triva';

await build({
  env: 'development',
  cache: {
    type: 'memory',
    retention: 600
  }
});

get('/cached', async (req, res) => {
  const cached = await cache.get('mykey');
  
  if (cached) {
    return res.json({ data: cached, source: 'cache' });
  }
  
  const data = { timestamp: Date.now() };
  await cache.set('mykey', data, 60);
  
  res.json({ data, source: 'fresh' });
});

listen(3000);
```

## Common Patterns

### Error Handling

```javascript
get('/error', (req, res) => {
  try {
    throw new Error('Something went wrong');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### Query Parameters

```javascript
get('/search', (req, res) => {
  const { q, limit } = req.query;
  res.json({ query: q, limit: limit || 10 });
});
```

### Headers

```javascript
get('/headers', (req, res) => {
  res.header('X-Custom-Header', 'value');
  res.json({ received: req.headers });
});
```

## Next Steps

- [Quick Examples](https://docs.trivajs.com/quick-start/examples)
- [Routing Guide](https://docs.trivajs.com/core/routing)
- [Configuration Guide](https://docs.trivajs.com/core/configuration)

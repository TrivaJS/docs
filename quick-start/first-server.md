# First Server Tutorial

Build a small Triva app from scratch.

## Step 1: Create A Project

```bash
mkdir my-triva-app
cd my-triva-app
npm init -y
npm install triva
```

## Step 2: Create `server.js`

```javascript
import { build } from 'triva';

const app = new build({ env: 'development' });

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Triva' });
});

app.listen(3000);
```

## Step 3: Run It

```bash
node server.js
```

Then open `http://localhost:3000`.

## Step 4: Add A Route Parameter

```javascript
app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id });
});
```

## Step 5: Add A JSON POST Route

```javascript
app.post('/users', async (req, res) => {
  const body = await req.json();
  res.status(201).json({ created: body });
});
```

Try it with curl:

```bash
curl http://localhost:3000/users/42
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name":"Alice"}'
```

## Step 6: Add Cache And Throttle

```javascript
const app = new build({
  env: 'development',
  cache: {
    type: 'memory',
    retention: 300000
  },
  throttle: {
    limit: 100,
    window_ms: 60000
  }
});
```

Use a cache backend whenever you enable throttling, because the throttle middleware stores counters through the cache layer.

## Next Steps

- [Quick Examples](https://docs.trivajs.com/quick-start/examples)
- [Routing Guide](https://docs.trivajs.com/core/routing)
- [Configuration Guide](https://docs.trivajs.com/core/configuration)

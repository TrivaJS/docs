# Getting Started

Triva is a class-based Node.js HTTP framework. The normal flow is:

1. create an app with `new build(options)`
2. register routes on that app instance
3. parse request bodies explicitly with `await req.json()` or `await req.text()`
4. send a response with `res.json()`, `res.send()`, or the other response helpers
5. start the server with `app.listen(port)`

## Quick Install

```bash
npm install triva
```

## Your First Server

```javascript
import { build } from 'triva';

const app = new build({ env: 'development' });

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Triva' });
});

app.listen(3000);
```

## Next Route To Add

```javascript
app.post('/api/users', async (req, res) => {
  const body = await req.json();
  res.status(201).json({ created: body });
});
```

## What To Expect From The Core

- routing methods on the app instance
- explicit request parsing instead of automatic `req.body`
- cache adapters configured through `cache`
- optional throttling and error tracking
- HTTP or HTTPS startup from the same app class

## Next Steps

- [Installation Guide](https://docs.trivajs.com/installation)
- [First Server Tutorial](https://docs.trivajs.com/quick-start/first-server)
- [Core Concepts](https://docs.trivajs.com/core/concepts)
- [API Reference](https://docs.trivajs.com/core/api)

# Getting Started

Triva is a class-based Node.js HTTP and HTTPS framework. You create an app with `new build(...)`, register routes on that instance, and start the server with `app.listen(...)`.

## Install

```bash
npm install triva
```

Triva targets modern Node.js. Use Node 18 or newer so the runtime and extension packages behave consistently.

## Your First App

```javascript
import { build } from 'triva';

const app = new build({ env: 'development' });

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Ada' },
    { id: 2, name: 'Grace' }
  ]);
});

app.get('/api/users/:id', (req, res) => {
  const users = [
    { id: 1, name: 'Ada' },
    { id: 2, name: 'Grace' }
  ];

  const user = users.find((entry) => entry.id === Number(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

app.listen(3000);
```

## What Triva Gives You

- Route methods on the app instance: `app.get()`, `app.post()`, `app.put()`, `app.del()`, `app.patch()`, `app.all()`, and `app.route()`
- Request parsing through `await req.json()` and `await req.text()`
- Response helpers such as `res.status()`, `res.json()`, `res.send()`, `res.html()`, `res.redirect()`, and `res.sendFile()`
- Configurable cache adapters through `cache` plus the exported `cache` singleton for runtime reads and writes
- Built-in throttle, retention, and error-tracking support through constructor options
- HTTP or HTTPS startup through `protocol` and `ssl`

## Read Next

- [Installation](/installation)
- [First Server](/quick-start/first-server)
- [API Reference](/core/api)
- [Configuration](/core/configuration)

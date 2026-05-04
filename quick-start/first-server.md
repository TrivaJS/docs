# First Server

This is the shortest path from install to a working Triva app.

## Basic Example

```javascript
import { build } from 'triva';

const app = new build({ env: 'development' });
const users = [
  { id: 1, name: 'Ada' },
  { id: 2, name: 'Grace' }
];

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find((entry) => entry.id === Number(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

app.post('/api/users', async (req, res) => {
  const body = await req.json();
  const user = { id: users.length + 1, ...body };
  users.push(user);
  res.status(201).json(user);
});

app.listen(3000);
```

## What This Shows

- route registration on the app instance
- path parameters through `req.params`
- JSON body parsing through `await req.json()`
- status codes through `res.status()`

## Next Steps

- [Quick Start Examples](/quick-start/examples)
- [Routing](/core/routing)
- [Request](/core/request)
- [Response](/core/response)

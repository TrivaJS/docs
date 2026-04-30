# REST API Example

This example uses the current class-based Triva API for a small in-memory CRUD service.

## Example

```javascript
import { build } from 'triva';

const app = new build({ env: 'development' });

let users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
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

app.put('/api/users/:id', async (req, res) => {
  const index = users.findIndex((entry) => entry.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const body = await req.json();
  users[index] = { ...users[index], ...body };
  res.json(users[index]);
});

app.del('/api/users/:id', (req, res) => {
  const index = users.findIndex((entry) => entry.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users.splice(index, 1);
  res.status(204).end();
});

app.listen(3000);
```

## What It Shows

- route registration on the app instance
- route params through `req.params`
- explicit JSON parsing through `await req.json()`
- `201`, `404`, and `204` response patterns

## Related Docs

- [Routing](https://docs.trivajs.com/core/routing)
- [Request Object](https://docs.trivajs.com/core/request)
- [Response Object](https://docs.trivajs.com/core/response)

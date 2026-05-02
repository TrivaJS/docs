# REST API

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

app.put('/api/users/:id', async (req, res) => {
  const body = await req.json();
  res.json({ id: req.params.id, updated: body });
});

app.del('/api/users/:id', (req, res) => {
  res.json({ deleted: req.params.id });
});
```

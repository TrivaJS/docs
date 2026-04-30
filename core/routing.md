# Routing

Routes are registered on the app instance created by `new build(...)`.

## Basic Example

```javascript
import { build } from 'triva';

const app = new build({ env: 'development' });

app.get('/api/users', (req, res) => {
  res.json([{ id: 1, name: 'Alice' }]);
});

app.post('/api/users', async (req, res) => {
  const body = await req.json();
  res.status(201).json({ id: Date.now(), ...body });
});

app.listen(3000);
```

## Supported Methods

- `app.get()`
- `app.post()`
- `app.put()`
- `app.del()`
- `app.delete()`
- `app.patch()`
- `app.all()`

## Route Parameters

```javascript
app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id });
});

app.get('/teams/:teamId/users/:userId', (req, res) => {
  res.json(req.params);
});
```

## Query Parameters

```javascript
app.get('/search', (req, res) => {
  res.json({
    q: req.query.q || '',
    page: Number(req.query.page || 1)
  });
});
```

## Multiple Handlers

```javascript
const requireAuth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

const loadTenant = (req, res, next) => {
  req.tenant = req.headers['x-tenant-id'] || 'default';
  next();
};

app.get('/private', requireAuth, loadTenant, (req, res) => {
  res.json({ tenant: req.tenant });
});
```

## Route Builder

```javascript
app.route('/api/books/:id')
  .get((req, res) => {
    res.json({ id: req.params.id });
  })
  .put(async (req, res) => {
    const body = await req.json();
    res.json({ id: req.params.id, updates: body });
  })
  .patch(async (req, res) => {
    const body = await req.json();
    res.json({ id: req.params.id, patch: body });
  });
```

## Match All Methods

```javascript
app.all('/ping', (req, res) => {
  res.json({ method: req.method, ok: true });
});
```

## Route Order Matters

Define more specific routes before dynamic ones.

```javascript
app.get('/users/admin', (req, res) => {
  res.json({ role: 'admin' });
});

app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id });
});
```

## REST-Style Example

```javascript
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
```

## Related Docs

- [Request Object](https://docs.trivajs.com/core/request)
- [Response Object](https://docs.trivajs.com/core/response)
- [API Reference](https://docs.trivajs.com/core/api)

# Request Object

Triva starts with the native Node.js request object and adds a few routing and body helpers before your route handler runs.

## Core Properties

### `req.method`

```javascript
app.get('/inspect', (req, res) => {
  res.json({ method: req.method });
});
```

### `req.url`

```javascript
app.get('/inspect', (req, res) => {
  res.json({ url: req.url });
});
```

### `req.headers`

```javascript
app.get('/inspect', (req, res) => {
  res.json({ userAgent: req.headers['user-agent'] || null });
});
```

### `req.query`

```javascript
app.get('/search', (req, res) => {
  const page = Number(req.query.page || 1);
  res.json({ q: req.query.q || '', page });
});
```

### `req.params`

```javascript
app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id });
});
```

### `req.pathname`

```javascript
app.get('/inspect', (req, res) => {
  res.json({ pathname: req.pathname });
});
```

## Body Helpers

### `await req.json()`

Use this for JSON request bodies.

```javascript
app.post('/users', async (req, res) => {
  const body = await req.json();

  if (!body.email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  res.status(201).json({ created: body });
});
```

### `await req.text()`

Use this for raw text payloads and webhook flows.

```javascript
app.post('/webhooks/raw', async (req, res) => {
  const payload = await req.text();
  res.json({ length: payload.length });
});
```

## Important Note About Bodies

Document handlers around `req.json()` or `req.text()`. Do not rely on `req.body` in the current Triva API.

## Common Patterns

### Validate Route Input

```javascript
app.get('/users/:id', (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  res.json({ id });
});
```

### Validate Query Input

```javascript
app.get('/reports', (req, res) => {
  const limit = Math.min(Number(req.query.limit || 25), 100);
  res.json({ limit });
});
```

### Parse JSON Safely

```javascript
app.post('/sessions', async (req, res) => {
  try {
    const body = await req.json();
    res.status(201).json({ session: body });
  } catch {
    res.status(400).json({ error: 'Invalid JSON' });
  }
});
```

## Related Docs

- [Response Object](https://docs.trivajs.com/core/response)
- [Routing](https://docs.trivajs.com/core/routing)
- [API Reference](https://docs.trivajs.com/core/api)

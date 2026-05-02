# Custom Middleware

Use custom middleware when application behavior does not belong in the framework-level runtime options.

## Global Middleware

```javascript
const requestId = (req, res, next) => {
  req.requestId = `req-${Date.now()}`;
  next();
};

app.use(requestId);
```

## Authentication Guard

```javascript
const requireAuth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.get('/api/private', requireAuth, (req, res) => {
  res.json({ ok: true });
});
```

## Arrays of Handlers

```javascript
app.get('/stacked', [requestId, requireAuth], (req, res) => {
  res.json({ requestId: req.requestId });
});
```

# Error Handling

Triva lets you return explicit error responses yourself, and it also captures thrown errors during request handling.

## Manual Error Responses

```javascript
app.get('/users/:id', (req, res) => {
  const user = null;

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});
```

## Throwing Errors

```javascript
app.get('/explode', (req, res) => {
  throw new Error('Unexpected failure');
});
```

If `errorTracking` is enabled, Triva records the error through the exported `errorTracker`.

## Validation Example

```javascript
app.post('/login', async (req, res) => {
  const body = await req.json();

  if (!body.username || !body.password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  res.json({ ok: true });
});
```

## Related Docs

- [Response](/core/response)
- [Error Tracking](/middleware/error-tracking)
- [Security Policy](/policies/security)

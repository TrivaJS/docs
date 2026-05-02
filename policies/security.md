# Security Policy

## Reporting a Security Issue

If you believe you found a security issue in Triva, report it privately to the maintainers instead of posting a public exploit first.

## Safe-by-Default Guidance for Users

- use `await req.json()` or `await req.text()` and validate input before trusting it
- return explicit error responses for invalid input
- use throttle policies on public endpoints
- protect administrative routes with authentication middleware
- sanitize filenames and paths before serving or accepting files

## Example: Input Validation

```javascript
app.post('/login', async (req, res) => {
  const body = await req.json();

  if (typeof body.username !== 'string' || typeof body.password !== 'string') {
    return res.status(400).json({ error: 'Invalid credentials payload' });
  }

  res.json({ ok: true });
});
```

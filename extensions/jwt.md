# JWT Extension

## Package

`@triva/jwt`

## Install

```bash
npm install @triva/jwt
```

## Example

```javascript
import { build } from 'triva';
import { sign, protect, requireRole } from '@triva/jwt';

const app = new build({ env: 'development' });

app.post('/auth/login', async (req, res) => {
  const { username } = await req.json();

  const token = sign(
    { userId: 1, username, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ token });
});

app.get('/api/admin', protect(), requireRole('admin'), (req, res) => {
  res.json({ ok: true });
});
```

## Main Exports

- `sign(payload, secret, options?)`
- `verify(token, secret)`
- `decode(token)`
- `protect(options?)`
- `requireRole(...roles)`
- `requirePermission(...permissions)`

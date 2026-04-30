# JWT Extension

`@triva/jwt` provides token signing, verification, route protection, and role checks.

## Install

```bash
npm install @triva/jwt
```

## Basic Usage

```javascript
import { build } from 'triva';
import { sign, protect, requireRole } from '@triva/jwt';

const app = new build({ env: 'production' });

app.post('/auth/login', async (req, res) => {
  const { email, password } = await req.json();
  const user = await verifyCredentials(email, password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ token });
});

app.get('/admin', protect(), requireRole('admin'), (req, res) => {
  res.json({ ok: true });
});
```

## What It Adds

- `sign()`
- `verify()`
- `decode()`
- `protect()`
- `requireRole()`
- `requirePermission()`

## Related Docs

- [Authentication Example](https://docs.trivajs.com/examples/authentication)
- [Security Policy](https://docs.trivajs.com/policies/security)

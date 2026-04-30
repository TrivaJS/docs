# Authentication Example

A common Triva auth flow is the core framework plus the JWT extension.

## Example

```javascript
import { build } from 'triva';
import { sign, protect } from '@triva/jwt';

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

app.get('/api/profile', protect(), (req, res) => {
  res.json({ user: req.user });
});

app.listen(3000);
```

## Notes

- parse login payloads with `await req.json()`
- keep `JWT_SECRET` in environment variables
- layer `requireRole()` or `requirePermission()` after `protect()` when needed

## Related Docs

- [JWT Extension](https://docs.trivajs.com/extensions/jwt)
- [Security Policy](https://docs.trivajs.com/policies/security)

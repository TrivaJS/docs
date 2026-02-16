# @triva/jwt

JWT authentication utilities for Triva.

## Installation

```bash
npm install @triva/jwt
```

## Usage

### Sign Token

```javascript
import { sign } from '@triva/jwt';

const token = sign(
  { userId: 123, role: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

### Verify Token

```javascript
import { verify } from '@triva/jwt';

const payload = verify(token, process.env.JWT_SECRET);
console.log(payload.userId);  // 123
```

### Protect Routes

```javascript
import { get } from 'triva';
import { protect } from '@triva/jwt';

get('/protected', protect(), (req, res) => {
  // req.user contains decoded token
  res.json({ user: req.user });
});
```

### Require Role

```javascript
import { requireRole } from '@triva/jwt';

get('/admin', requireRole('admin'), (req, res) => {
  res.json({ admin: true });
});
```

## API

### sign(payload, secret, options?)

Create JWT token.

**Parameters:**
- `payload` (object) - Data to encode
- `secret` (string) - Secret key
- `options` (object) - Token options
  - `expiresIn` (string) - Expiration time

**Returns:** `string` - JWT token

### verify(token, secret)

Verify and decode JWT token.

**Parameters:**
- `token` (string) - JWT token
- `secret` (string) - Secret key

**Returns:** `object` - Decoded payload

**Throws:** Error if token invalid

### protect(options?)

Middleware to protect routes.

**Options:**
- `secret` (string) - JWT secret (or uses env.JWT_SECRET)
- `getToken` (function) - Custom token extraction

### requireRole(...roles)

Middleware to require specific roles.

**Parameters:**
- `roles` (string[]) - Required roles

## Examples

### Complete Auth System

```javascript
import { build, post, get, use } from 'triva';
import { sign, protect, requireRole } from '@triva/jwt';
import bcrypt from 'bcrypt';

await build({ cache: { type: 'memory' } });

// Login
post('/auth/login', async (req, res) => {
  const { email, password } = await req.json();
  
  const user = await db.users.findByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({ token });
});

// Protected route
get('/api/profile', protect(), (req, res) => {
  res.json({ user: req.user });
});

// Admin only
get('/api/admin', requireRole('admin'), (req, res) => {
  res.json({ admin: true });
});
```

---

**[Back to Official Extensions](README.md)**

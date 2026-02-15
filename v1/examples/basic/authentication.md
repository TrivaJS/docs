# Authentication Example

JWT authentication with Triva.

## Installation

```bash
npm install @triva/jwt bcrypt
```

## Complete Example

```javascript
import { build, post, get, use, listen } from 'triva';
import { sign, protect, requireRole } from '@triva/jwt';
import bcrypt from 'bcrypt';

// In-memory user storage
const users = new Map();

await build({
  cache: { type: 'memory' }
});

// Register
post('/auth/register', async (req, res) => {
  const { email, password, name } = await req.json();
  
  // Validation
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password required' 
    });
  }
  
  // Check if user exists
  if (users.has(email)) {
    return res.status(409).json({ 
      error: 'User already exists' 
    });
  }
  
  // Hash password
  const hash = await bcrypt.hash(password, 10);
  
  // Create user
  const user = {
    id: Date.now().toString(),
    email,
    name,
    password: hash,
    role: 'user',
    createdAt: new Date().toISOString()
  };
  
  users.set(email, user);
  
  // Generate token
  const token = sign(
    { userId: user.id, email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.status(201).json({
    user: { id: user.id, email, name, role: user.role },
    token
  });
});

// Login
post('/auth/login', async (req, res) => {
  const { email, password } = await req.json();
  
  const user = users.get(email);
  if (!user) {
    return res.status(401).json({ 
      error: 'Invalid credentials' 
    });
  }
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ 
      error: 'Invalid credentials' 
    });
  }
  
  const token = sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({
    user: { id: user.id, email: user.email, name: user.name },
    token
  });
});

// Get current user
get('/auth/me', protect(), (req, res) => {
  const user = users.get(req.user.email);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
});

// Protected route
get('/api/profile', protect(), (req, res) => {
  res.json({ 
    message: 'This is a protected route',
    user: req.user
  });
});

// Admin only route
get('/api/admin', protect(), requireRole('admin'), (req, res) => {
  res.json({ message: 'Admin access granted' });
});

listen(3000);
console.log('Auth API running on http://localhost:3000');
```

## Usage

### Register

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Access Protected Route

```bash
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## With Database

```javascript
import { build, post, get, listen, cache } from 'triva';
import { sign, protect } from '@triva/jwt';
import bcrypt from 'bcrypt';

await build({
  cache: {
    type: 'mongodb',
    database: { uri: 'mongodb://localhost:27017' }
  }
});

post('/auth/register', async (req, res) => {
  const { email, password, name } = await req.json();
  
  // Check if user exists
  const existing = await cache.get(`user:${email}`);
  if (existing) {
    return res.status(409).json({ error: 'User exists' });
  }
  
  const hash = await bcrypt.hash(password, 10);
  
  const user = {
    id: Date.now().toString(),
    email,
    name,
    password: hash,
    role: 'user'
  };
  
  await cache.set(`user:${email}`, user);
  
  const token = sign(
    { userId: user.id, email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.status(201).json({ user, token });
});
```

## With Refresh Tokens

```javascript
import { sign, verify } from '@triva/jwt';

const refreshTokens = new Set();

// Login with refresh token
post('/auth/login', async (req, res) => {
  // ... validate credentials ...
  
  const accessToken = sign(
    { userId: user.id, email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = sign(
    { userId: user.id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );
  
  refreshTokens.add(refreshToken);
  
  res.json({ accessToken, refreshToken });
});

// Refresh access token
post('/auth/refresh', async (req, res) => {
  const { refreshToken } = await req.json();
  
  if (!refreshTokens.has(refreshToken)) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  try {
    const payload = verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const accessToken = sign(
      { userId: payload.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout
post('/auth/logout', async (req, res) => {
  const { refreshToken } = await req.json();
  refreshTokens.delete(refreshToken);
  res.json({ message: 'Logged out' });
});
```

## Environment Variables

```bash
# .env
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
```

---

**[Back to Examples](../README.md)**

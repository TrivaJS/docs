# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.x.x   | Yes       |
| < 1.0   | No        |

## Reporting A Vulnerability

Do not report security vulnerabilities through public issues.

Use:

- Email: `contact@trivajs.com`
- Include: description, impact, steps to reproduce, and contact details

## Triva Security Basics

### Use HTTPS In Production

```javascript
import { build } from 'triva';
import { readFileSync } from 'fs';

const app = new build({
  protocol: 'https',
  ssl: {
    key: readFileSync('./ssl/key.pem'),
    cert: readFileSync('./ssl/cert.pem')
  }
});
```

### Validate Input Explicitly

```javascript
app.post('/api/users', async (req, res) => {
  const body = await req.json();

  if (!isValidEmail(body.email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  res.status(201).json(body);
});
```

### Enable Throttling With A Cache Backend

```javascript
const app = new build({
  cache: { type: 'memory' },
  throttle: {
    limit: 100,
    window_ms: 60000,
    ban_threshold: 5
  }
});
```

### Keep Secrets Out Of Source Control

- store `JWT_SECRET`, database credentials, and TLS material in environment variables or a secrets manager
- do not commit `.env`, `.pem`, or `.key` files

### Use Safe Cache Configuration

```javascript
const app = new build({
  cache: {
    type: 'mongodb',
    database: {
      uri: process.env.MONGODB_URI,
      database: 'triva_cache',
      collection: 'entries'
    }
  }
});
```

## Common Secure Patterns

### Sanitize User-Controlled Query Input

```javascript
app.get('/search', (req, res) => {
  const term = String(req.query.term || '');
  res.json({ term });
});
```

### Protect JSON Endpoints

```javascript
app.post('/api/action', async (req, res) => {
  const token = req.headers['x-csrf-token'];

  if (token !== process.env.CSRF_TOKEN) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  const body = await req.json();
  res.json({ ok: true, body });
});
```

## Related Docs

- [Production Deployment](https://docs.trivajs.com/deployment/production)
- [JWT Extension](https://docs.trivajs.com/extensions/jwt)

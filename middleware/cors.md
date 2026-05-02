# CORS Middleware

Cross-Origin Resource Sharing (CORS) support via the official extension.

## Installation

CORS is a separate extension package:

```bash
npm install @triva/cors
```

## Basic Setup

```javascript
import { build, use, get, listen } from 'triva';
import cors from '@triva/cors';

await build({ env: 'development' });

use(cors());

get('/api/data', (req, res) => {
  res.json({ data: 'accessible from any origin' });
});

listen(3000);
```

## Configuration

### Allow All Origins

```javascript
use(cors());
```

### Specific Origin

```javascript
use(cors({
  origin: 'https://example.com'
}));
```

### Multiple Origins

```javascript
use(cors({
  origin: ['https://example.com', 'https://app.example.com']
}));
```

### Dynamic Origin

```javascript
use(cors({
  origin: (origin) => {
    return origin.endsWith('.example.com');
  }
}));
```

## Options

### origin

Allowed origin(s).

```javascript
cors({
  origin: 'https://example.com'
})
```

### methods

Allowed HTTP methods.

```javascript
cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE']
})
```

### allowedHeaders

Allowed request headers.

```javascript
cors({
  allowedHeaders: ['Content-Type', 'Authorization']
})
```

### exposedHeaders

Headers exposed to the client.

```javascript
cors({
  exposedHeaders: ['X-Custom-Header']
})
```

### credentials

Allow credentials (cookies, auth).

```javascript
cors({
  credentials: true
})
```

### maxAge

Preflight cache duration (seconds).

```javascript
cors({
  maxAge: 86400  // 24 hours
})
```

## Common Configurations

### Public API

```javascript
import { build, use, listen } from 'triva';
import cors from '@triva/cors';

await build({ env: 'production' });

use(cors());  // Allow all origins

listen(3000);
```

### Private API

```javascript
use(cors({
  origin: 'https://app.example.com',
  credentials: true,
  methods: ['GET', 'POST']
}));
```

### Multiple Domains

```javascript
use(cors({
  origin: [
    'https://example.com',
    'https://app.example.com',
    'https://admin.example.com'
  ],
  credentials: true
}));
```

### Subdomain Wildcard

```javascript
use(cors({
  origin: (origin) => {
    return origin && origin.endsWith('.example.com');
  },
  credentials: true
}));
```

## Complete Example

```javascript
import { build, use, get, post, listen } from 'triva';
import cors from '@triva/cors';

await build({ env: 'production' });

// Enable CORS
use(cors({
  origin: ['https://example.com', 'https://app.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}));

// API routes
get('/api/users', (req, res) => {
  res.json({ users: [] });
});

post('/api/users', (req, res) => {
  res.json({ created: req.body });
});

listen(3000);
```

## Preflight Requests

CORS automatically handles OPTIONS preflight requests:

```bash
# Browser sends preflight
OPTIONS /api/users
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type

# Server responds
200 OK
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: POST
Access-Control-Allow-Headers: Content-Type
```

## Development vs Production

### Development

```javascript
await build({ env: 'development' });

use(cors());  // Allow all for easy testing
```

### Production

```javascript
await build({ env: 'production' });

use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
}));
```

## Troubleshooting

### CORS Error in Browser

```
Access to fetch at 'http://localhost:3000/api/data' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solution:** Add the origin to allowed list:

```javascript
use(cors({
  origin: 'http://localhost:5173'
}));
```

### Credentials Not Working

**Problem:** Cookies not sent cross-origin

**Solution:** Enable credentials in both client and server:

```javascript
// Server
use(cors({
  origin: 'https://example.com',
  credentials: true
}));

// Client
fetch('https://api.example.com/data', {
  credentials: 'include'
});
```

## Best Practices

1. **Restrict origins in production** - Don't use wildcard `*` with credentials
2. **Use environment variables** - Store allowed origins in env vars
3. **Enable credentials carefully** - Only when needed
4. **Set maxAge** - Cache preflight responses
5. **Specify methods** - Only allow needed HTTP methods

## Extension Repository

- GitHub: [github.com/trivajs/cors](https://github.com/trivajs/cors)
- npm: [@triva/cors](https://npmjs.com/package/@triva/cors)

## Next Steps

- [JWT Extension](https://docs.trivajs.com/extensions/jwt)
- [Custom Middleware](https://docs.trivajs.com/middleware/custom)
- [Error Tracking](https://docs.trivajs.com/middleware/error-tracking)

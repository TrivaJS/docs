# Error Handling

## Try/Catch Pattern

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

get('/api/user/:id', (req, res) => {
  try {
    const user = getUserById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

listen(3000);
```

## Async Error Handling

```javascript
import { build, get, cache, listen } from 'triva';

await build({
  env: 'development',
  cache: {
    type: 'mongodb',
    url: 'mongodb://localhost:27017/myapp'
  }
});

get('/api/posts', async (req, res) => {
  try {
    // Cache is configured with MongoDB adapter
    const posts = await cache.get('posts');
    res.json(posts);
  } catch (err) {
    console.error('Cache error:', err);
    res.status(500).json({ error: 'Cache error' });
  }
});

listen(3000);
```

## Error Middleware

```javascript
import { build, use, listen } from 'triva';

await build({ env: 'development' });

use((req, res, next) => {
  try {
    // Your code
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

listen(3000);
```

## Validation Errors

```javascript
import { build, post, listen } from 'triva';

await build({ env: 'development' });

post('/api/users', (req, res) => {
  const { email, password } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }
  
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be 8+ characters' });
  }
  
  // Create user...
  res.status(201).json({ email });
});

listen(3000);
```

## Not Found Handler

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

// Define your routes
get('/', (req, res) => res.send('Home'));
get('/about', (req, res) => res.send('About'));

// Wildcard route at the end for 404s
get('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

listen(3000);
```

## Cache Errors

```javascript
import { build, get, cache, listen } from 'triva';

await build({
  env: 'development',
  cache: {
    type: 'redis',
    url: 'redis://localhost:6379'
  }
});

get('/api/data', async (req, res) => {
  try {
    const data = await cache.get('collection');
    res.json(data);
  } catch (err) {
    if (err.code === 'CONNECTION_ERROR') {
      return res.status(503).json({ error: 'Cache unavailable' });
    }
    res.status(500).json({ error: 'Internal error' });
  }
});

listen(3000);
```

## Custom Error Class

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

get('/api/resource/:id', (req, res) => {
  try {
    const resource = findResource(req.params.id);
    if (!resource) {
      throw new AppError('Resource not found', 404);
    }
    res.json(resource);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal error' });
  }
});

listen(3000);
```

## Logging Errors

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

get('/api/data', async (req, res) => {
  try {
    const data = await fetchData();
    res.json(data);
  } catch (err) {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method
    });
    res.status(500).json({ error: 'Internal error' });
  }
});

listen(3000);
```

## Next Steps

- [Middleware Guide](https://docs.trivajs.com/core/middleware)
- [Configuration](https://docs.trivajs.com/core/configuration)

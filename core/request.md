# Request Object

The `req` object represents the HTTP request and contains properties for the request query string, parameters, body, headers, and more.

## Properties

### req.method

The HTTP method of the request.

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

get('/', (req, res) => {
  console.log(req.method); // GET
  res.json({ method: req.method });
});

listen(3000);
```

### req.url

The request URL path.

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

get('*', (req, res) => {
  console.log(req.url); // /users/123?active=true
  res.json({ url: req.url });
});

listen(3000);
```

### req.headers

Object containing request headers.

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

get('/', (req, res) => {
  const contentType = req.headers['content-type'];
  const userAgent = req.headers['user-agent'];
  const auth = req.headers['authorization'];
  
  res.json({
    contentType,
    userAgent,
    auth
  });
});

listen(3000);
```

Headers are lowercase:

```javascript
req.headers['content-type']  // correct
req.headers['Content-Type']  // undefined
```

### req.query

Object containing query string parameters.

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

get('/search', (req, res) => {
  // Request: /search?q=test&limit=10&page=2
  console.log(req.query.q);     // 'test'
  console.log(req.query.limit); // '10'
  console.log(req.query.page);  // '2'
  
  res.json(req.query);
});

listen(3000);
```

All query values are strings:

```javascript
get('/filter', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const active = req.query.active === 'true';
  
  res.json({ limit, active });
});
```

### req.params

Object containing route parameters.

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

get('/users/:id', (req, res) => {
  // Request: /users/123
  console.log(req.params.id); // '123'
  res.json({ userId: req.params.id });
});

get('/posts/:category/:slug', (req, res) => {
  // Request: /posts/tech/hello-world
  console.log(req.params.category); // 'tech'
  console.log(req.params.slug);     // 'hello-world'
  res.json(req.params);
});

listen(3000);
```

### req.body

Parsed request body (automatically parsed).

```javascript
import { build, post, listen } from 'triva';

await build({ env: 'development' });

post('/users', (req, res) => {
  // Request body: {"name":"Alice","email":"alice@example.com"}
  console.log(req.body.name);  // 'Alice'
  console.log(req.body.email); // 'alice@example.com'
  
  res.json({ received: req.body });
});

listen(3000);
```

Supports JSON and text:

```javascript
post('/data', (req, res) => {
  if (typeof req.body === 'object') {
    // JSON body
    res.json({ type: 'json', data: req.body });
  } else {
    // Text body
    res.json({ type: 'text', data: req.body });
  }
});
```

## Common Patterns

### Validate Query Parameters

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

get('/api/items', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  if (limit > 100) {
    return res.status(400).json({ error: 'Limit too high' });
  }
  
  res.json({ page, limit });
});

listen(3000);
```

### Extract Route Parameters

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

get('/api/:version/users/:id', (req, res) => {
  const { version, id } = req.params;
  
  if (version !== 'v1' && version !== 'v2') {
    return res.status(400).json({ error: 'Invalid version' });
  }
  
  res.json({ version, userId: id });
});

listen(3000);
```

### Check Headers

```javascript
import { build, post, listen } from 'triva';

await build({ env: 'development' });

post('/api/data', (req, res) => {
  const contentType = req.headers['content-type'];
  
  if (!contentType || !contentType.includes('application/json')) {
    return res.status(400).json({ error: 'JSON required' });
  }
  
  res.json({ success: true });
});

listen(3000);
```

### Authentication from Headers

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

get('/protected', (req, res) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }
  
  // Verify token...
  res.json({ authenticated: true });
});

listen(3000);
```

### Parse Body Data

```javascript
import { build, post, listen } from 'triva';

await build({ env: 'development' });

post('/register', (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  
  // Create user...
  res.status(201).json({ username, email });
});

listen(3000);
```

### Combine Parameters

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

get('/api/users/:id/posts', (req, res) => {
  const userId = req.params.id;
  const { limit, offset } = req.query;
  
  res.json({
    userId,
    limit: parseInt(limit) || 10,
    offset: parseInt(offset) || 0
  });
});

listen(3000);
```

## Request Logging

Log request details:

```javascript
import { build, use, listen } from 'triva';

await build({ env: 'development' });

use((req, res, next) => {
  console.log({
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    params: req.params,
    body: req.body
  });
  next();
});

listen(3000);
```

## Next Steps

- [Response Object](https://docs.trivajs.com/core/response)
- [Routing Guide](https://docs.trivajs.com/core/routing)
- [Middleware Guide](https://docs.trivajs.com/core/middleware)

# Response Object

The `res` object represents the HTTP response that Triva sends when it receives a request.

## Methods

### res.json(data)

Send a JSON response.

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

get('/api/user', (req, res) => {
  res.json({ id: 1, name: 'Alice' });
});

listen(3000);
```

Automatically sets `Content-Type: application/json`:

```javascript
get('/api/data', (req, res) => {
  res.json({
    status: 'success',
    data: [1, 2, 3],
    timestamp: Date.now()
  });
});
```

### res.send(text)

Send a text response.

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

get('/', (req, res) => {
  res.send('Hello World');
});

listen(3000);
```

Automatically sets `Content-Type: text/plain`:

```javascript
get('/health', (req, res) => {
  res.send('OK');
});
```

### res.status(code)

Set HTTP status code.

```javascript
import { build, get, post, listen } from 'triva';

await build({ env: 'development' });

get('/not-found', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

post('/created', (req, res) => {
  res.status(201).json({ created: true });
});

listen(3000);
```

Chain with other methods:

```javascript
res.status(500).send('Server Error');
res.status(204).send();
res.status(400).json({ error: 'Bad Request' });
```

### res.redirect(url)

Redirect to another URL.

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

get('/old-page', (req, res) => {
  res.redirect('/new-page');
});

get('/login', (req, res) => {
  res.redirect('https://auth.example.com/login');
});

listen(3000);
```

With status code:

```javascript
// 301 Permanent redirect
res.status(301).redirect('/new-url');

// 302 Temporary redirect (default)
res.redirect('/temp-url');
```

### res.header(name, value)

Set a response header.

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

get('/download', (req, res) => {
  res.header('Content-Type', 'application/pdf');
  res.header('Content-Disposition', 'attachment; filename=document.pdf');
  res.send(pdfData);
});

listen(3000);
```

Common headers:

```javascript
res.header('Cache-Control', 'no-cache');
res.header('X-Custom-Header', 'value');
res.header('Access-Control-Allow-Origin', '*');
```

## Common Response Patterns

### Success Response

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: users,
    count: users.length
  });
});

listen(3000);
```

### Error Response

```javascript
get('/api/user/:id', (req, res) => {
  const user = findUser(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      code: 'USER_NOT_FOUND'
    });
  }
  
  res.json(user);
});
```

### Created Response

```javascript
import { build, post, listen } from 'triva';

await build({ env: 'development' });

post('/api/users', (req, res) => {
  const user = createUser(req.body);
  res.status(201).json({
    message: 'User created',
    data: user
  });
});

listen(3000);
```

### No Content Response

```javascript
import { build, del, listen } from 'triva';

await build({ env: 'development' });

del('/api/users/:id', (req, res) => {
  deleteUser(req.params.id);
  res.status(204).send();
});

listen(3000);
```

### Validation Error

```javascript
import { build, post, listen } from 'triva';

await build({ env: 'development' });

post('/api/register', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      error: 'Validation failed',
      fields: {
        email: !email ? 'Required' : null,
        password: !password ? 'Required' : null
      }
    });
  }
  
  res.json({ success: true });
});

listen(3000);
```

### Unauthorized Response

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

get('/api/protected', (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }
  
  res.json({ data: 'protected' });
});

listen(3000);
```

### Server Error Response

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

get('/api/data', (req, res) => {
  try {
    const data = riskyOperation();
    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  }
});

listen(3000);
```

## Status Codes

Common HTTP status codes:

### Success (2xx)
- `200` - OK
- `201` - Created
- `204` - No Content

### Redirection (3xx)
- `301` - Moved Permanently
- `302` - Found (Temporary Redirect)

### Client Errors (4xx)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity

### Server Errors (5xx)
- `500` - Internal Server Error
- `502` - Bad Gateway
- `503` - Service Unavailable

## Response Headers

Set custom headers:

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

get('/api/data', (req, res) => {
  res.header('X-Request-ID', generateId());
  res.header('X-Response-Time', Date.now());
  res.json({ data: 'value' });
});

listen(3000);
```

CORS headers:

```javascript
get('/api/public', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.json({ public: true });
});
```

[CORS Extension](https://docs.trivajs.com/extensions/cors)

## Next Steps

- [Request Object](https://docs.trivajs.com/core/request)
- [Routing Guide](https://docs.trivajs.com/core/routing)
- [Error Handling](https://docs.trivajs.com/core/error-handling)

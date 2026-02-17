# Routing

Define how your application responds to HTTP requests.

## Basic Routes

```javascript
import { build, get, post, put, del, listen } from 'triva';

await build({ env: 'development' });

get('/', (req, res) => {
  res.send('GET request');
});

post('/data', (req, res) => {
  res.json({ received: req.body });
});

put('/update', (req, res) => {
  res.json({ updated: true });
});

del('/remove', (req, res) => {
  res.json({ deleted: true });
});

listen(3000);
```

## HTTP Methods

Triva supports all standard HTTP methods:

- `get(path, handler)` - GET requests
- `post(path, handler)` - POST requests
- `put(path, handler)` - PUT requests
- `del(path, handler)` - DELETE requests
- `patch(path, handler)` - PATCH requests

## Route Parameters

Capture values from the URL:

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.json({ userId });
});

get('/posts/:category/:id', (req, res) => {
  const { category, id } = req.params;
  res.json({ category, id });
});

listen(3000);
```

Test it:

```bash
curl http://localhost:3000/users/123
# Response: {"userId":"123"}

curl http://localhost:3000/posts/tech/456
# Response: {"category":"tech","id":"456"}
```

## Query Parameters

Access query string values:

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

get('/search', (req, res) => {
  const { q, limit, page } = req.query;
  res.json({
    query: q,
    limit: limit || 10,
    page: page || 1
  });
});

listen(3000);
```

Test it:

```bash
curl "http://localhost:3000/search?q=test&limit=20&page=2"
# Response: {"query":"test","limit":"20","page":"2"}
```

## Multiple Handlers

Chain multiple handlers for a route:

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

const authenticate = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

const logRequest = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

get('/protected', authenticate, logRequest, (req, res) => {
  res.json({ message: 'Protected data' });
});

listen(3000);
```

## Route Organization

### Inline Routes

```javascript
import { build, get, post, listen } from 'triva';

await build({ env: 'development' });

get('/users', (req, res) => res.json([]));
post('/users', (req, res) => res.json(req.body));

listen(3000);
```

### Separate Handlers

```javascript
import { build, get, post, listen } from 'triva';

await build({ env: 'development' });

const getAllUsers = (req, res) => {
  res.json({ users: [] });
};

const createUser = (req, res) => {
  res.json({ created: req.body });
};

get('/users', getAllUsers);
post('/users', createUser);

listen(3000);
```

### Controller Pattern

```javascript
import { build, get, post, put, del, listen } from 'triva';

await build({ env: 'development' });

const userController = {
  getAll: (req, res) => res.json({ users: [] }),
  create: (req, res) => res.json({ created: req.body }),
  getOne: (req, res) => res.json({ id: req.params.id }),
  update: (req, res) => res.json({ updated: req.params.id }),
  delete: (req, res) => res.json({ deleted: req.params.id })
};

get('/users', userController.getAll);
post('/users', userController.create);
get('/users/:id', userController.getOne);
put('/users/:id', userController.update);
del('/users/:id', userController.delete);

listen(3000);
```

## REST API Pattern

Standard RESTful resource routing:

```javascript
import { build, get, post, put, del, listen } from 'triva';

await build({ env: 'development' });

// GET /api/posts - List all
get('/api/posts', (req, res) => {
  res.json({ posts: [] });
});

// GET /api/posts/:id - Get one
get('/api/posts/:id', (req, res) => {
  res.json({ id: req.params.id });
});

// POST /api/posts - Create
post('/api/posts', (req, res) => {
  res.status(201).json({ created: req.body });
});

// PUT /api/posts/:id - Update
put('/api/posts/:id', (req, res) => {
  res.json({ updated: req.params.id, data: req.body });
});

// DELETE /api/posts/:id - Delete
del('/api/posts/:id', (req, res) => {
  res.json({ deleted: req.params.id });
});

listen(3000);
```

## Route Priority

Routes are matched in the order they're defined:

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

// This matches first
get('/users/admin', (req, res) => {
  res.json({ role: 'admin' });
});

// This matches if above doesn't
get('/users/:id', (req, res) => {
  res.json({ userId: req.params.id });
});

listen(3000);
```

Request to `/users/admin` will match the first route, not the second.

## Catch-All Routes

Handle 404s or default routes:

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

// Define your routes first
get('/', (req, res) => res.send('Home'));
get('/about', (req, res) => res.send('About'));

// Catch-all at the end

- [Request Object](https://docs.trivajs.com/core/request)
- [Response Object](https://docs.trivajs.com/core/response)
- [Middleware Guide](https://docs.trivajs.com/core/middleware)
- [REST API Example](https://docs.trivajs.com/examples/rest-api)

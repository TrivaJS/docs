# Routing Guide

Complete guide to URL routing, parameters, and request handling in Triva.

## Table of Contents

- [Basic Routing](#basic-routing)
- [HTTP Methods](#http-methods)
- [Route Parameters](#route-parameters)
- [Query Strings](#query-strings)
- [Request Body](#request-body)
- [Response Methods](#response-methods)
- [Route Patterns](#route-patterns)

---

## Basic Routing

### Simple Routes

```javascript
import { get, post, listen } from 'triva';

// GET request
get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

// POST request
post('/users', (req, res) => {
  res.status(201).json({ created: true });
});

listen(3000);
```

### Multiple Routes

```javascript
get('/', homeHandler);
get('/about', aboutHandler);
get('/contact', contactHandler);

post('/api/users', createUser);
put('/api/users/:id', updateUser);
del('/api/users/:id', deleteUser);
```

---

## HTTP Methods

### All Supported Methods

```javascript
import { get, post, put, del, patch } from 'triva';

// GET - Retrieve data
get('/users', (req, res) => {
  res.json({ users: [] });
});

// POST - Create data
post('/users', async (req, res) => {
  const data = await req.json();
  res.status(201).json({ user: data });
});

// PUT - Update/replace data
put('/users/:id', async (req, res) => {
  const data = await req.json();
  res.json({ updated: true });
});

// DELETE - Remove data
del('/users/:id', (req, res) => {
  res.status(204).send();
});

// PATCH - Partial update
patch('/users/:id', async (req, res) => {
  const data = await req.json();
  res.json({ patched: true });
});
```

### Method Best Practices

```javascript
// GET - Safe, cacheable, no body
get('/api/products', (req, res) => {
  res.json({ products: [] });
});

// POST - Not safe, not idempotent, has body
post('/api/products', async (req, res) => {
  const product = await req.json();
  res.status(201).json({ id: 123 });
});

// PUT - Idempotent, replaces entire resource
put('/api/products/123', async (req, res) => {
  const product = await req.json();
  res.json({ updated: true });
});

// PATCH - Idempotent, partial update
patch('/api/products/123', async (req, res) => {
  const updates = await req.json();
  res.json({ patched: true });
});

// DELETE - Idempotent, removes resource
del('/api/products/123', (req, res) => {
  res.status(204).send();
});
```

---

## Route Parameters

### Named Parameters

```javascript
// Single parameter
get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.json({ userId });
});

// Multiple parameters
get('/posts/:postId/comments/:commentId', (req, res) => {
  const { postId, commentId } = req.params;
  res.json({ postId, commentId });
});

// Nested parameters
get('/api/:version/users/:id', (req, res) => {
  const { version, id } = req.params;
  res.json({ version, id });
});
```

### Parameter Validation

```javascript
get('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);

  // Validate numeric ID
  if (isNaN(id) || id < 1) {
    return res.status(400).json({
      error: 'Invalid user ID'
    });
  }

  res.json({ userId: id });
});

// UUID validation
get('/items/:uuid', (req, res) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

  if (!uuidRegex.test(req.params.uuid)) {
    return res.status(400).json({
      error: 'Invalid UUID format'
    });
  }

  res.json({ uuid: req.params.uuid });
});
```

---

## Query Strings

### Accessing Query Parameters

```javascript
// URL: /search?q=triva&page=2&limit=20
get('/search', (req, res) => {
  const { q, page, limit } = req.query;

  res.json({
    query: q,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10
  });
});

// URL: /products?category=electronics&sort=price
get('/products', (req, res) => {
  const category = req.query.category || 'all';
  const sort = req.query.sort || 'name';

  res.json({ category, sort });
});
```

### Array Parameters

```javascript
// URL: /filter?tags=javascript&tags=node&tags=triva
get('/filter', (req, res) => {
  const tags = Array.isArray(req.query.tags)
    ? req.query.tags
    : [req.query.tags];

  res.json({ tags });
});
```

### Query Validation

```javascript
get('/api/users', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Validate ranges
  if (page < 1 || page > 1000) {
    return res.status(400).json({
      error: 'Page must be between 1 and 1000'
    });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      error: 'Limit must be between 1 and 100'
    });
  }

  res.json({ page, limit });
});
```

---

## Request Body

### JSON Bodies

```javascript
post('/api/users', async (req, res) => {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.email || !body.password) {
      return res.status(400).json({
        error: 'Email and password required'
      });
    }

    res.status(201).json({ user: body });
  } catch (error) {
    res.status(400).json({
      error: 'Invalid JSON'
    });
  }
});
```

### Text Bodies

```javascript
post('/api/text', async (req, res) => {
  const text = await req.text();

  res.json({
    length: text.length,
    preview: text.substring(0, 100)
  });
});
```

### Body Validation

```javascript
post('/api/products', async (req, res) => {
  const body = await req.json();

  // Validate schema
  const errors = [];

  if (!body.name || body.name.length < 3) {
    errors.push('Name must be at least 3 characters');
  }

  if (!body.price || typeof body.price !== 'number' || body.price < 0) {
    errors.push('Price must be a positive number');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  res.status(201).json({ product: body });
});
```

---

## Response Methods

### JSON Responses

```javascript
get('/api/data', (req, res) => {
  res.json({
    success: true,
    data: [1, 2, 3]
  });
});

// With status code
post('/api/data', (req, res) => {
  res.status(201).json({
    created: true
  });
});
```

### Text Responses

```javascript
get('/health', (req, res) => {
  res.send('OK');
});

get('/robots.txt', (req, res) => {
  res.send('User-agent: *\nDisallow: /admin/');
});
```

### Status Codes

```javascript
// 200 OK
res.json({ success: true });

// 201 Created
res.status(201).json({ id: 123 });

// 204 No Content
res.status(204).send();

// 400 Bad Request
res.status(400).json({ error: 'Invalid input' });

// 401 Unauthorized
res.status(401).json({ error: 'Not authenticated' });

// 403 Forbidden
res.status(403).json({ error: 'Access denied' });

// 404 Not Found
res.status(404).json({ error: 'Resource not found' });

// 500 Internal Server Error
res.status(500).json({ error: 'Server error' });
```

### Headers

```javascript
get('/api/data', (req, res) => {
  res.header('X-Custom-Header', 'value');
  res.header('Cache-Control', 'no-cache');
  res.json({ data: [] });
});

// Multiple headers
get('/api/secure', (req, res) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.json({ secure: true });
});
```

### Redirects

```javascript
get('/old-url', (req, res) => {
  res.redirect('/new-url');
});

// With status code
get('/moved', (req, res) => {
  res.status(301).redirect('/new-location');
});

// External redirect
get('/external', (req, res) => {
  res.redirect('https://example.com');
});
```

---

## Route Patterns

### Exact Matching

```javascript
// Matches only /users
get('/users', handler);

// Matches only /api/v1/products
get('/api/v1/products', handler);
```

### Wildcard Patterns

```javascript
// Match /api/anything
get('/api/*', (req, res) => {
  res.json({ api: true });
});

// Match /admin/anything/else
get('/admin/*', (req, res) => {
  res.json({ admin: true });
});
```

### Multiple Routes, Same Handler

```javascript
function dashboardHandler(req, res) {
  res.json({ dashboard: true });
}

get('/dashboard', dashboardHandler);
get('/admin', dashboardHandler);
get('/home', dashboardHandler);
```

### REST API Pattern

```javascript
// Resource-based routing
const userRoutes = {
  getAll: (req, res) => res.json({ users: [] }),
  getOne: (req, res) => res.json({ user: { id: req.params.id } }),
  create: async (req, res) => {
    const user = await req.json();
    res.status(201).json({ user });
  },
  update: async (req, res) => {
    const user = await req.json();
    res.json({ user });
  },
  delete: (req, res) => res.status(204).send()
};

get('/api/users', userRoutes.getAll);
get('/api/users/:id', userRoutes.getOne);
post('/api/users', userRoutes.create);
put('/api/users/:id', userRoutes.update);
del('/api/users/:id', userRoutes.delete);
```

---

## Advanced Patterns

### Versioned APIs

```javascript
// Version in URL
get('/api/v1/users', v1UsersHandler);
get('/api/v2/users', v2UsersHandler);

// Version in header
get('/api/users', (req, res) => {
  const version = req.headers['api-version'] || 'v1';

  if (version === 'v2') {
    return v2UsersHandler(req, res);
  }

  v1UsersHandler(req, res);
});
```

### Nested Resources

```javascript
// /posts/:postId/comments
get('/posts/:postId/comments', (req, res) => {
  const { postId } = req.params;
  res.json({ postId, comments: [] });
});

// /posts/:postId/comments/:commentId
get('/posts/:postId/comments/:commentId', (req, res) => {
  const { postId, commentId } = req.params;
  res.json({ postId, commentId });
});

// /users/:userId/orders/:orderId/items
get('/users/:userId/orders/:orderId/items', (req, res) => {
  const { userId, orderId } = req.params;
  res.json({ userId, orderId, items: [] });
});
```

### Pagination

```javascript
get('/api/products', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  res.json({
    data: [],
    pagination: {
      page,
      limit,
      offset,
      total: 100,
      pages: 5
    }
  });
});
```

### Filtering & Sorting

```javascript
get('/api/users', (req, res) => {
  const {
    role,          // Filter by role
    status,        // Filter by status
    sort = 'name', // Sort field
    order = 'asc'  // Sort order
  } = req.query;

  res.json({
    filters: { role, status },
    sort: { field: sort, order }
  });
});
```

---

## Best Practices

### 1. Use Meaningful URLs

```javascript
// ✅ Good - clear and descriptive
get('/api/users/:id', handler);
get('/api/products/:sku', handler);
get('/api/orders/:orderId/items', handler);

// ❌ Bad - unclear
get('/api/data/:id', handler);
get('/api/thing/:x', handler);
```

### 2. Use Correct HTTP Methods

```javascript
// ✅ Good - semantically correct
get('/api/users', getAllUsers);       // Retrieve
post('/api/users', createUser);       // Create
put('/api/users/:id', updateUser);    // Update/Replace
patch('/api/users/:id', patchUser);   // Partial Update
del('/api/users/:id', deleteUser);    // Delete

// ❌ Bad - wrong methods
get('/api/users/create', createUser);  // Should be POST
post('/api/users/delete', deleteUser); // Should be DELETE
```

### 3. Version Your APIs

```javascript
// ✅ Good - versioned
get('/api/v1/users', v1Handler);
get('/api/v2/users', v2Handler);

// Plan for changes without breaking existing clients
```

### 4. Return Appropriate Status Codes

```javascript
get('/api/users/:id', async (req, res) => {
  const user = await db.findUser(req.params.id);

  if (!user) {
    return res.status(404).json({
      error: 'User not found'
    });
  }

  res.json({ user });
});
```

### 5. Validate Input

```javascript
post('/api/users', async (req, res) => {
  const body = await req.json();

  // Validate before processing
  if (!body.email || !body.password) {
    return res.status(400).json({
      error: 'Email and password required'
    });
  }

  // Process valid data
  res.status(201).json({ user: body });
});
```

---

## Next Steps

- **[Middleware Guide](../middleware/overview.md)** - Request processing
- **[Deployment Guide](deployment.md)** - Production deployment
- **[Performance Guide](performance.md)** - Optimization

---

**Questions?** [GitHub Issues](https://github.com/trivajs/triva/issues)

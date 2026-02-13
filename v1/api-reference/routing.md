# Routing Methods

HTTP method handlers for defining routes.

## get()

Register a GET route handler.

### Signature

```javascript
get(path: string, ...handlers: RequestHandler[]): void
```

### Parameters

- `path` (string) - URL path pattern
- `handlers` (function[]) - One or more request handlers

### Example

```javascript
import { get } from 'triva';

get('/', (req, res) => {
  res.json({ message: 'Home' });
});

get('/users/:id', (req, res) => {
  res.json({ userId: req.params.id });
});
```

---

## post()

Register a POST route handler.

### Signature

```javascript
post(path: string, ...handlers: RequestHandler[]): void
```

### Example

```javascript
import { post } from 'triva';

post('/api/users', async (req, res) => {
  const data = await req.json();
  res.status(201).json({ user: data });
});
```

---

## put()

Register a PUT route handler.

### Signature

```javascript
put(path: string, ...handlers: RequestHandler[]): void
```

### Example

```javascript
import { put } from 'triva';

put('/api/users/:id', async (req, res) => {
  const data = await req.json();
  res.json({ updated: true });
});
```

---

## del()

Register a DELETE route handler.

### Signature

```javascript
del(path: string, ...handlers: RequestHandler[]): void
```

### Example

```javascript
import { del } from 'triva';

del('/api/users/:id', (req, res) => {
  res.status(204).send();
});
```

---

## patch()

Register a PATCH route handler.

### Signature

```javascript
patch(path: string, ...handlers: RequestHandler[]): void
```

### Example

```javascript
import { patch } from 'triva';

patch('/api/users/:id', async (req, res) => {
  const updates = await req.json();
  res.json({ patched: true });
});
```

---

## Path Patterns

### Exact Match

```javascript
get('/users', handler);
// Matches: /users
// Doesn't match: /users/123
```

### Parameters

```javascript
get('/users/:id', handler);
// Matches: /users/123
// req.params.id = '123'

get('/posts/:postId/comments/:commentId', handler);
// Matches: /posts/5/comments/10
// req.params = { postId: '5', commentId: '10' }
```

### Wildcards

```javascript
get('/api/*', handler);
// Matches: /api/anything
// Matches: /api/users/123
```

---

## Multiple Handlers

```javascript
import { get } from 'triva';

// Middleware then handler
get('/protected', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// Multiple middleware
get('/admin', authMiddleware, adminMiddleware, handler);
```

---

## See Also

- [Request Object](request/)
- [Response Object](response/)
- [Routing Guide](../guides/routing.md)

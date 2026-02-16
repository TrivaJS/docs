# @triva/shortcuts

Shorthand functions for common Triva operations.

[![npm version](https://img.shields.io/npm/v/@triva/shortcuts.svg)](https://npmjs.com/package/@triva/shortcuts)
[![License](https://img.shields.io/npm/l/@triva/shortcuts.svg)](LICENSE)

## Features

✅ **Concise API** - Shorter function names  
✅ **Common Patterns** - Pre-built route handlers  
✅ **JSON Responses** - Quick JSON shortcuts  
✅ **Error Handling** - Built-in error responses  
✅ **CRUD Operations** - RESTful route helpers  
✅ **Validation** - Quick validation helpers  

## Installation

```bash
npm install @triva/shortcuts
```

## Usage

### Basic Shortcuts

```javascript
import { ok, created, notFound, error } from '@triva/shortcuts';

// Instead of:
res.status(200).json({ data: 'value' });

// Use:
ok(res, { data: 'value' });

// Created response
created(res, { user: newUser });

// Not found
notFound(res, 'User not found');

// Error response
error(res, 'Something went wrong', 500);
```

## Response Shortcuts

### ok(res, data)

Send 200 OK response.

```javascript
import { ok } from '@triva/shortcuts';

get('/api/data', (req, res) => {
  ok(res, { data: [] });
});

// Equivalent to:
// res.status(200).json({ data: [] });
```

### created(res, data)

Send 201 Created response.

```javascript
import { created } from '@triva/shortcuts';

post('/api/users', async (req, res) => {
  const user = await createUser(req.body);
  created(res, { user });
});

// Equivalent to:
// res.status(201).json({ user });
```

### noContent(res)

Send 204 No Content response.

```javascript
import { noContent } from '@triva/shortcuts';

del('/api/users/:id', (req, res) => {
  deleteUser(req.params.id);
  noContent(res);
});

// Equivalent to:
// res.status(204).send();
```

### badRequest(res, message)

Send 400 Bad Request.

```javascript
import { badRequest } from '@triva/shortcuts';

post('/api/users', (req, res) => {
  if (!req.body.email) {
    return badRequest(res, 'Email is required');
  }
  // ...
});

// Equivalent to:
// res.status(400).json({ error: 'Email is required' });
```

### unauthorized(res, message)

Send 401 Unauthorized.

```javascript
import { unauthorized } from '@triva/shortcuts';

get('/api/profile', (req, res) => {
  if (!req.headers.authorization) {
    return unauthorized(res, 'Authentication required');
  }
  // ...
});
```

### forbidden(res, message)

Send 403 Forbidden.

```javascript
import { forbidden } from '@triva/shortcuts';

get('/api/admin', (req, res) => {
  if (req.user.role !== 'admin') {
    return forbidden(res, 'Admin access required');
  }
  // ...
});
```

### notFound(res, message)

Send 404 Not Found.

```javascript
import { notFound } from '@triva/shortcuts';

get('/api/users/:id', async (req, res) => {
  const user = await findUser(req.params.id);
  if (!user) {
    return notFound(res, 'User not found');
  }
  ok(res, { user });
});
```

### error(res, message, statusCode)

Send custom error response.

```javascript
import { error } from '@triva/shortcuts';

get('/api/data', async (req, res) => {
  try {
    const data = await fetchData();
    ok(res, { data });
  } catch (err) {
    error(res, err.message, 500);
  }
});

// Equivalent to:
// res.status(500).json({ error: err.message });
```

## Route Helpers

### crud(resource, handlers)

Create CRUD routes for a resource.

```javascript
import { crud } from '@triva/shortcuts';

crud('users', {
  getAll: async (req, res) => {
    const users = await db.users.findAll();
    ok(res, { users });
  },
  
  getOne: async (req, res) => {
    const user = await db.users.findById(req.params.id);
    if (!user) return notFound(res, 'User not found');
    ok(res, { user });
  },
  
  create: async (req, res) => {
    const user = await db.users.create(req.body);
    created(res, { user });
  },
  
  update: async (req, res) => {
    const user = await db.users.update(req.params.id, req.body);
    ok(res, { user });
  },
  
  delete: async (req, res) => {
    await db.users.delete(req.params.id);
    noContent(res);
  }
});

// Creates routes:
// GET    /users
// GET    /users/:id
// POST   /users
// PUT    /users/:id
// DELETE /users/:id
```

### rest(resource, controller)

Alternative REST route creator.

```javascript
import { rest } from '@triva/shortcuts';

const usersController = {
  index: async (req, res) => { /* GET /users */ },
  show: async (req, res) => { /* GET /users/:id */ },
  store: async (req, res) => { /* POST /users */ },
  update: async (req, res) => { /* PUT /users/:id */ },
  destroy: async (req, res) => { /* DELETE /users/:id */ }
};

rest('users', usersController);
```

## Validation Helpers

### required(value, field)

Check if value is required.

```javascript
import { required, badRequest } from '@triva/shortcuts';

post('/api/users', (req, res) => {
  const errors = [];
  
  required(req.body.email, 'email', errors);
  required(req.body.password, 'password', errors);
  
  if (errors.length > 0) {
    return badRequest(res, errors.join(', '));
  }
  
  // Continue...
});
```

### validate(rules, data)

Validate data against rules.

```javascript
import { validate, badRequest } from '@triva/shortcuts';

post('/api/users', async (req, res) => {
  const [valid, errors] = validate({
    email: { required: true, type: 'email' },
    password: { required: true, minLength: 8 },
    age: { type: 'number', min: 18 }
  }, req.body);
  
  if (!valid) {
    return badRequest(res, errors);
  }
  
  // Continue...
});
```

## Async Helpers

### async(fn)

Wrap async route handlers with error handling.

```javascript
import { async, error } from '@triva/shortcuts';

get('/api/data', async(async (req, res) => {
  const data = await fetchData();  // If throws, automatically caught
  ok(res, { data });
}));

// Equivalent to:
get('/api/data', async (req, res) => {
  try {
    const data = await fetchData();
    ok(res, { data });
  } catch (err) {
    error(res, err.message, 500);
  }
});
```

### asyncHandler(fn)

Alternative async wrapper with custom error handling.

```javascript
import { asyncHandler } from '@triva/shortcuts';

get('/api/data', asyncHandler(
  async (req, res) => {
    const data = await fetchData();
    ok(res, { data });
  },
  (err, req, res) => {
    // Custom error handling
    console.error(err);
    error(res, 'Failed to fetch data', 500);
  }
));
```

## Complete Examples

### Basic API with Shortcuts

```javascript
import { build, get, post, put, del } from 'triva';
import { 
  ok, created, noContent, 
  badRequest, notFound, 
  async 
} from '@triva/shortcuts';

await build({ cache: { type: 'memory' } });

// Get all users
get('/api/users', async(async (req, res) => {
  const users = await db.users.findAll();
  ok(res, { users });
}));

// Get single user
get('/api/users/:id', async(async (req, res) => {
  const user = await db.users.findById(req.params.id);
  if (!user) return notFound(res, 'User not found');
  ok(res, { user });
}));

// Create user
post('/api/users', async(async (req, res) => {
  if (!req.body.email) {
    return badRequest(res, 'Email is required');
  }
  
  const user = await db.users.create(req.body);
  created(res, { user });
}));

// Update user
put('/api/users/:id', async(async (req, res) => {
  const user = await db.users.update(req.params.id, req.body);
  if (!user) return notFound(res, 'User not found');
  ok(res, { user });
}));

// Delete user
del('/api/users/:id', async(async (req, res) => {
  const deleted = await db.users.delete(req.params.id);
  if (!deleted) return notFound(res, 'User not found');
  noContent(res);
}));
```

### CRUD with Validation

```javascript
import { crud, validate, async } from '@triva/shortcuts';

const userRules = {
  email: { required: true, type: 'email' },
  password: { required: true, minLength: 8 },
  name: { required: true, minLength: 2 }
};

crud('users', {
  getAll: async(async (req, res) => {
    const users = await db.users.findAll();
    ok(res, { users });
  }),
  
  getOne: async(async (req, res) => {
    const user = await db.users.findById(req.params.id);
    if (!user) return notFound(res);
    ok(res, { user });
  }),
  
  create: async(async (req, res) => {
    const [valid, errors] = validate(userRules, req.body);
    if (!valid) return badRequest(res, errors);
    
    const user = await db.users.create(req.body);
    created(res, { user });
  }),
  
  update: async(async (req, res) => {
    const user = await db.users.update(req.params.id, req.body);
    if (!user) return notFound(res);
    ok(res, { user });
  }),
  
  delete: async(async (req, res) => {
    const deleted = await db.users.delete(req.params.id);
    if (!deleted) return notFound(res);
    noContent(res);
  })
});
```

### Authentication Routes

```javascript
import { post, get } from 'triva';
import { ok, unauthorized, badRequest, async } from '@triva/shortcuts';
import { sign, protect } from '@triva/jwt';

// Login
post('/auth/login', async(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return badRequest(res, 'Email and password required');
  }
  
  const user = await verifyCredentials(email, password);
  if (!user) {
    return unauthorized(res, 'Invalid credentials');
  }
  
  const token = sign({ userId: user.id }, process.env.JWT_SECRET);
  ok(res, { token, user });
}));

// Get profile
get('/auth/me', protect(), async(async (req, res) => {
  const user = await db.users.findById(req.user.userId);
  if (!user) return unauthorized(res);
  ok(res, { user });
}));
```

## API Reference

### Response Functions

| Function | Status | Description |
|----------|--------|-------------|
| `ok(res, data)` | 200 | Success response |
| `created(res, data)` | 201 | Resource created |
| `noContent(res)` | 204 | No content |
| `badRequest(res, msg)` | 400 | Bad request |
| `unauthorized(res, msg)` | 401 | Unauthorized |
| `forbidden(res, msg)` | 403 | Forbidden |
| `notFound(res, msg)` | 404 | Not found |
| `error(res, msg, code)` | custom | Custom error |

### Route Helpers

| Function | Description |
|----------|-------------|
| `crud(resource, handlers)` | Create CRUD routes |
| `rest(resource, controller)` | Create REST routes |

### Validation Helpers

| Function | Description |
|----------|-------------|
| `required(value, field, errors)` | Check required field |
| `validate(rules, data)` | Validate against rules |

### Async Helpers

| Function | Description |
|----------|-------------|
| `async(fn)` | Wrap async handler |
| `asyncHandler(fn, errorHandler)` | Wrap with custom error handler |

## Best Practices

### 1. Consistent Error Handling

```javascript
// ✅ Good - consistent error responses
get('/api/data', async(async (req, res) => {
  const data = await fetchData();
  ok(res, { data });
}));

// ❌ Bad - inconsistent
get('/api/data', async (req, res) => {
  try {
    const data = await fetchData();
    res.json({ data });  // 200 implicit
  } catch (err) {
    res.status(500).send(err.message);  // Plain text
  }
});
```

### 2. Use CRUD Helper

```javascript
// ✅ Good - DRY with crud()
crud('users', handlers);

// ❌ Bad - repetitive
get('/users', getAll);
get('/users/:id', getOne);
post('/users', create);
// ... etc
```

### 3. Validate Early

```javascript
// ✅ Good - validate first
post('/api/users', async(async (req, res) => {
  const [valid, errors] = validate(rules, req.body);
  if (!valid) return badRequest(res, errors);
  
  const user = await db.users.create(req.body);
  created(res, { user });
}));
```

## License

MIT © Triva Team

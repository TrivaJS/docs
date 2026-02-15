# REST API Example

Build a complete CRUD REST API for managing todos.

## Complete Code

```javascript
import { build, get, post, put, del, listen } from 'triva';

// In-memory storage
const todos = new Map();
let nextId = 1;

// Configure server
await build({
  cache: {
    type: 'memory'
  }
});

// GET all todos
get('/api/todos', (req, res) => {
  const todoList = Array.from(todos.values());
  res.json({ todos: todoList, count: todoList.length });
});

// GET single todo
get('/api/todos/:id', (req, res) => {
  const todo = todos.get(req.params.id);
  
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  res.json({ todo });
});

// CREATE todo
post('/api/todos', async (req, res) => {
  const body = await req.json();
  
  // Validation
  if (!body.title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const todo = {
    id: String(nextId++),
    title: body.title,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  todos.set(todo.id, todo);
  
  res.status(201).json({ todo });
});

// UPDATE todo
put('/api/todos/:id', async (req, res) => {
  const todo = todos.get(req.params.id);
  
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  const body = await req.json();
  
  const updated = {
    ...todo,
    title: body.title ?? todo.title,
    completed: body.completed ?? todo.completed,
    updatedAt: new Date().toISOString()
  };
  
  todos.set(todo.id, updated);
  
  res.json({ todo: updated });
});

// DELETE todo
del('/api/todos/:id', (req, res) => {
  const deleted = todos.delete(req.params.id);
  
  if (!deleted) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  res.status(204).send();
});

// Start server
listen(3000);
console.log('🚀 REST API running on http://localhost:3000');
```

## Usage Examples

### Create Todo

```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Triva"}'
```

**Response:**
```json
{
  "todo": {
    "id": "1",
    "title": "Learn Triva",
    "completed": false,
    "createdAt": "2026-02-14T10:30:00.000Z"
  }
}
```

### Get All Todos

```bash
curl http://localhost:3000/api/todos
```

**Response:**
```json
{
  "todos": [
    {
      "id": "1",
      "title": "Learn Triva",
      "completed": false,
      "createdAt": "2026-02-14T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

### Get Single Todo

```bash
curl http://localhost:3000/api/todos/1
```

### Update Todo

```bash
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

### Delete Todo

```bash
curl -X DELETE http://localhost:3000/api/todos/1
```

## With Database

```javascript
import { build, get, post, put, del, listen, cache } from 'triva';

await build({
  cache: {
    type: 'redis',
    database: {
      host: 'localhost',
      port: 6379
    }
  }
});

// Helper functions
async function getAllTodos() {
  const keys = await cache.keys('todo:*');
  const todos = await Promise.all(
    keys.map(key => cache.get(key))
  );
  return todos.filter(Boolean);
}

// CREATE
post('/api/todos', async (req, res) => {
  const body = await req.json();
  
  if (!body.title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const id = Date.now().toString();
  const todo = {
    id,
    title: body.title,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  await cache.set(`todo:${id}`, todo);
  
  res.status(201).json({ todo });
});

// READ all
get('/api/todos', async (req, res) => {
  const todos = await getAllTodos();
  res.json({ todos, count: todos.length });
});

// READ one
get('/api/todos/:id', async (req, res) => {
  const todo = await cache.get(`todo:${req.params.id}`);
  
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  res.json({ todo });
});

// UPDATE
put('/api/todos/:id', async (req, res) => {
  const todo = await cache.get(`todo:${req.params.id}`);
  
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  const body = await req.json();
  const updated = {
    ...todo,
    ...body,
    id: todo.id,
    updatedAt: new Date().toISOString()
  };
  
  await cache.set(`todo:${req.params.id}`, updated);
  
  res.json({ todo: updated });
});

// DELETE
del('/api/todos/:id', async (req, res) => {
  const todo = await cache.get(`todo:${req.params.id}`);
  
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  await cache.delete(`todo:${req.params.id}`);
  
  res.status(204).send();
});

listen(3000);
```

## With Validation

```javascript
import { build, get, post, put, del, listen } from 'triva';

await build({ cache: { type: 'memory' } });

const todos = new Map();
let nextId = 1;

// Validation middleware
function validateTodo(req, res, next) {
  const { title } = req.body;
  
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: { title: 'Title must be a non-empty string' }
    });
  }
  
  if (title.length > 200) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: { title: 'Title must be less than 200 characters' }
    });
  }
  
  next();
}

post('/api/todos', validateTodo, async (req, res) => {
  const body = await req.json();
  
  const todo = {
    id: String(nextId++),
    title: body.title.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  todos.set(todo.id, todo);
  res.status(201).json({ todo });
});

listen(3000);
```

## With Pagination

```javascript
get('/api/todos', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const todoList = Array.from(todos.values());
  const paginated = todoList.slice(skip, skip + limit);
  
  res.json({
    todos: paginated,
    pagination: {
      page,
      limit,
      total: todoList.length,
      pages: Math.ceil(todoList.length / limit)
    }
  });
});

// Usage: /api/todos?page=2&limit=5
```

## With Filtering

```javascript
get('/api/todos', (req, res) => {
  let todoList = Array.from(todos.values());
  
  // Filter by completed status
  if (req.query.completed !== undefined) {
    const isCompleted = req.query.completed === 'true';
    todoList = todoList.filter(t => t.completed === isCompleted);
  }
  
  // Search by title
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    todoList = todoList.filter(t => 
      t.title.toLowerCase().includes(search)
    );
  }
  
  res.json({ todos: todoList, count: todoList.length });
});

// Usage: /api/todos?completed=false&search=learn
```

## Complete Production Example

```javascript
import { build, get, post, put, del, use, listen } from 'triva';

// Build
await build({
  cache: { type: 'redis', database: { host: 'localhost' } },
  throttle: { limit: 100, window_ms: 60000 },
  retention: { enabled: true }
});

// Storage
const todos = new Map();
let nextId = 1;

// Middleware
use((req, res, next) => {
  res.header('X-API-Version', '1.0.0');
  next();
});

// Error handler
async function asyncHandler(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        requestId: req.id
      });
    }
  };
}

// Routes
get('/api/todos', asyncHandler(async (req, res) => {
  const todoList = Array.from(todos.values());
  res.json({ todos: todoList });
}));

get('/api/todos/:id', asyncHandler(async (req, res) => {
  const todo = todos.get(req.params.id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  res.json({ todo });
}));

post('/api/todos', asyncHandler(async (req, res) => {
  const body = await req.json();
  
  if (!body.title) {
    return res.status(400).json({ 
      error: 'Title is required' 
    });
  }
  
  const todo = {
    id: String(nextId++),
    title: body.title,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  todos.set(todo.id, todo);
  res.status(201).json({ todo });
}));

put('/api/todos/:id', asyncHandler(async (req, res) => {
  const todo = todos.get(req.params.id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  const body = await req.json();
  const updated = {
    ...todo,
    ...body,
    id: todo.id,
    updatedAt: new Date().toISOString()
  };
  
  todos.set(todo.id, updated);
  res.json({ todo: updated });
}));

del('/api/todos/:id', asyncHandler(async (req, res) => {
  const deleted = todos.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  res.status(204).send();
}));

// Health check
get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

listen(3000);
console.log('🚀 REST API running on http://localhost:3000');
```

## Testing

```javascript
// test.js
import assert from 'assert';

const BASE_URL = 'http://localhost:3000/api';

// Create todo
const createRes = await fetch(`${BASE_URL}/todos`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Test Todo' })
});
const { todo } = await createRes.json();
assert.equal(createRes.status, 201);
assert.equal(todo.title, 'Test Todo');

// Get all todos
const listRes = await fetch(`${BASE_URL}/todos`);
const { todos } = await listRes.json();
assert.ok(Array.isArray(todos));

// Update todo
const updateRes = await fetch(`${BASE_URL}/todos/${todo.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ completed: true })
});
const { todo: updated } = await updateRes.json();
assert.equal(updated.completed, true);

// Delete todo
const deleteRes = await fetch(`${BASE_URL}/todos/${todo.id}`, {
  method: 'DELETE'
});
assert.equal(deleteRes.status, 204);

console.log('✅ All tests passed!');
```

## Next Steps

- [Authentication Example](authentication.md) - Add JWT auth
- [MongoDB Example](../database/mongodb.md) - Use real database
- [Blog API](../real-world/blog-api.md) - Complete blog backend

---

**[Back to Examples](../README.md)**

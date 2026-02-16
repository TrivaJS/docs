# Error Handling

## Try/Catch Pattern

```javascript
app.get('/api/user/:id', (req, res) => {
  try {
    const user = getUserById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

## Async Error Handling

```javascript
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await database.find('posts', {});
    res.json(posts);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});
```

## Error Middleware

```javascript
app.use((req, res, next) => {
  try {
    // Your code
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

## Validation Errors

```javascript
app.post('/api/users', (req, res) => {
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
```

## Not Found Handler

```javascript
// Define routes first
app.get('/', (req, res) => res.send('Home'));

// Catch-all at the end
app.all('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});
```

## Database Errors

```javascript
app.get('/api/data', async (req, res) => {
  try {
    const data = await app.database.find('collection', {});
    res.json(data);
  } catch (err) {
    if (err.code === 'CONNECTION_ERROR') {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    res.status(500).json({ error: 'Internal error' });
  }
});
```

## Custom Error Class

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

app.get('/api/resource/:id', (req, res) => {
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
```

## Logging Errors

```javascript
app.get('/api/data', async (req, res) => {
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
```

## Next Steps

- [Middleware Guide](https://docs.trivajs.com/core/middleware)
- [Configuration](https://docs.trivajs.com/core/configuration)

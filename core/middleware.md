# Middleware

Middleware functions process requests before route handlers.

## How It Works

```
Request → Middleware 1 → Middleware 2 → Route Handler → Response
```

## Basic Middleware

```javascript
const Triva = require('triva');
const app = new Triva();

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Hello');
});

app.listen(3000);
```

## Built-in Middleware

### Logging

```javascript
const app = new Triva({
  logging: {
    enabled: true,
    level: 'info'
  }
});
```

### Throttling

```javascript
const app = new Triva({
  throttle: {
    enabled: true,
    max: 100,
    window: 60000
  }
});
```

### Error Tracking

```javascript
const app = new Triva({
  errorTracking: true
});
```

## Custom Middleware

### Request Logging

```javascript
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
});
```

### Authentication

```javascript
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.user = verifyToken(token);
  next();
};

app.use(authenticate);
```

## Route-Specific Middleware

```javascript
const checkAdmin = (req, res, next) => {
  if (!req.user.admin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

app.get('/admin', checkAdmin, (req, res) => {
  res.json({ admin: true });
});
```

## Execution Order

```javascript
// Global middleware (runs first)
app.use(loggingMiddleware);
app.use(authMiddleware);

// Route-specific middleware
app.get('/protected', checkPermission, handler);
```

## Next Steps

- [Error Handling](https://docs.trivajs.com/core/error-handling)
- [Extensions](https://docs.trivajs.com/extensions/overview)

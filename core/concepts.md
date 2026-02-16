# Core Concepts

Triva's architecture and design principles.

## Architecture

1. HTTP Server - Handles requests
2. Router - Maps URLs to handlers
3. Middleware Stack - Processes requests/responses
4. Database Layer - Optional data persistence
5. Cache Layer - Optional performance optimization

## Request Lifecycle

```
Client Request → HTTP Server → Middleware → Route Handler → Response
```

## Basic Application

```javascript
const Triva = require('triva');
const app = new Triva();

app.get('/path', handler);
app.post('/path', handler);

app.listen(3000);
```

## Request Object

- `req.method` - HTTP method
- `req.url` - Request URL
- `req.headers` - HTTP headers
- `req.query` - Query parameters
- `req.params` - Route parameters
- `req.body` - Request body

[Request Reference](https://docs.trivajs.com/core/request)

## Response Object

- `res.json(data)` - Send JSON
- `res.send(text)` - Send text
- `res.status(code)` - Set status
- `res.redirect(url)` - Redirect
- `res.setHeader(name, value)` - Set header

[Response Reference](https://docs.trivajs.com/core/response)

## Routing

```javascript
app.get('/users', getAllUsers);
app.post('/users', createUser);
app.get('/users/:id', getUser);
```

[Routing Guide](https://docs.trivajs.com/core/routing)

## Middleware

```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

[Middleware Guide](https://docs.trivajs.com/core/middleware)

## Configuration

```javascript
const app = new Triva({
  logging: { enabled: true },
  throttle: { max: 100, window: 60000 },
  cache: { adapter: 'memory' }
});
```

[Configuration Guide](https://docs.trivajs.com/core/configuration)

## Next Steps

- [API Reference](https://docs.trivajs.com/core/api)
- [Examples](https://docs.trivajs.com/quick-start/examples)

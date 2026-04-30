# Custom Middleware

Custom middleware is the most flexible way to extend Triva request handling.

## Basic Shape

```javascript
import { build } from 'triva';

const app = new build({ env: 'development' });

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

## Add Request Context

```javascript
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.header('X-Request-Id', req.requestId);
  next();
});
```

## Block A Request Early

```javascript
app.use((req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
});
```

## Route-Specific Middleware

```javascript
const requireAdmin = (req, res, next) => {
  if (req.headers['x-role'] !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
};

app.get('/admin', requireAdmin, (req, res) => {
  res.json({ ok: true });
});
```

## Related Docs

- [Middleware Overview](https://docs.trivajs.com/middleware/overview)
- [CORS](https://docs.trivajs.com/middleware/cors)

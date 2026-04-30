# Middleware Order

Middleware runs in the order it is registered.

## Global Order

```javascript
import { build } from 'triva';

const app = new build({ env: 'development' });

app.use((req, res, next) => {
  console.log('one');
  next();
});

app.use((req, res, next) => {
  console.log('two');
  next();
});

app.get('/', (req, res) => {
  console.log('handler');
  res.send('ok');
});
```

Request flow:

1. first `app.use(...)`
2. second `app.use(...)`
3. route handler

## Route-Specific Handlers

Route-level middleware runs after global middleware and before the final handler:

```javascript
const auth = (req, res, next) => {
  console.log('auth');
  next();
};

app.get('/private', auth, (req, res) => {
  console.log('handler');
  res.json({ ok: true });
});
```

## Constructor-Wired Middleware

If you configure `throttle` or `retention`, Triva creates middleware for those concerns during app startup. Treat that middleware as part of the same request pipeline and keep your own `app.use(...)` ordering intentional.

## Short-Circuiting

Any middleware that ends the response stops the rest of the chain:

```javascript
app.use((req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
});
```

## Related Docs

- [Custom Middleware](https://docs.trivajs.com/middleware/custom)
- [Throttling](https://docs.trivajs.com/middleware/throttling)

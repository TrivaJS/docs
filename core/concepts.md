# Core Concepts

Triva is centered on a single application instance created with `new build(options)`.

## Application Model

```javascript
import { build } from 'triva';

const app = new build({ env: 'development' });

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3000);
```

The important part is that routes and middleware live on `app`. Triva is not a collection of top-level `get()` or `listen()` helpers.

## Request Lifecycle

1. Triva receives the incoming Node.js request.
2. Registered middleware runs in order.
3. The router matches the request path and method.
4. Triva attaches request helpers such as `req.params`, `req.query`, `req.pathname`, `req.json()`, and `req.text()`.
5. Your route handler runs and uses the response helpers on `res`.

## Request Parsing Is Explicit

Triva does not populate a magic `req.body` property for you. Parse the body inside handlers:

```javascript
app.post('/api/users', async (req, res) => {
  const body = await req.json();
  res.status(201).json(body);
});
```

Use `await req.text()` when the payload is plain text or a webhook signature workflow needs the raw body.

## Routing Model

```javascript
app.get('/users', listUsers);
app.post('/users', createUser);
app.get('/users/:id', showUser);
app.put('/users/:id', updateUser);
app.del('/users/:id', destroyUser);
```

Routes can also be chained with `app.route('/users/:id')` and can accept middleware handlers before the final route handler.

## Middleware Model

Middleware is the standard `(req, res, next)` shape:

```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

Triva can also wire middleware for throttling and retention from constructor options.

## Cache Layer

The exported `cache` singleton is how Triva talks to the configured adapter.

```javascript
import { build, cache } from 'triva';

const app = new build({
  cache: {
    type: 'memory',
    retention: 300000
  }
});

app.get('/reports/:id', async (req, res) => {
  const key = `report:${req.params.id}`;
  const cached = await cache.get(key);

  if (cached) {
    return res.json({ source: 'cache', data: cached });
  }

  const report = await loadReport(req.params.id);
  await cache.set(key, report, 300000);
  res.json({ source: 'origin', data: report });
});
```

## Configuration Surface

The constructor options currently in active use are:

- `env`
- `protocol`
- `ssl`
- `cache`
- `throttle`
- `retention`
- `errorTracking`
- `middleware`

## HTTPS Model

To run HTTPS directly from Triva, set `protocol: 'https'` and provide `ssl.key` and `ssl.cert`.

```javascript
import { build } from 'triva';
import { readFileSync } from 'fs';

const app = new build({
  protocol: 'https',
  ssl: {
    key: readFileSync('./ssl/key.pem'),
    cert: readFileSync('./ssl/cert.pem')
  }
});
```

## Useful Links

- [API Reference](https://docs.trivajs.com/core/api)
- [Request Object](https://docs.trivajs.com/core/request)
- [Response Object](https://docs.trivajs.com/core/response)
- [Routing](https://docs.trivajs.com/core/routing)
- [Configuration](https://docs.trivajs.com/core/configuration)

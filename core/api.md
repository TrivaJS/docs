# API Reference

This page covers the public Triva surface that is visible in the current runtime and type definitions.

## Create An App

```javascript
import { build } from 'triva';

const app = new build({ env: 'development' });
```

## Application Methods

### Routing

```javascript
app.get(path, ...handlers)
app.post(path, ...handlers)
app.put(path, ...handlers)
app.del(path, ...handlers)
app.delete(path, ...handlers)
app.patch(path, ...handlers)
app.all(path, ...handlers)
app.route(path)
```

Example:

```javascript
app.get('/api/users/:id', (req, res) => {
  res.json({ id: req.params.id });
});

app.post('/api/users', async (req, res) => {
  const body = await req.json();
  res.status(201).json(body);
});
```

### Middleware

```javascript
app.use(middleware)
```

Example:

```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

### Error and 404 Handlers

```javascript
app.setErrorHandler((err, req, res) => {
  res.status(500).json({ error: 'Internal Server Error' });
});

app.setNotFoundHandler((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});
```

### Settings and Views

```javascript
app.set(key, value)
app.get(key)
app.enable(key)
app.disable(key)
app.enabled(key)
app.disabled(key)
app.engine(ext, fn)
```

### Server Startup

```javascript
app.listen(port, callback)
```

## Request Helpers

Triva adds these helpers before your route handler runs:

- `req.params`
- `req.query`
- `req.pathname`
- `req.json()`
- `req.text()`

Example:

```javascript
app.post('/api/users/:id', async (req, res) => {
  const body = await req.json();

  res.json({
    id: req.params.id,
    search: req.query.search,
    pathname: req.pathname,
    body
  });
});
```

## Response Helpers

Triva binds these helpers onto `res`:

- `res.status(code)`
- `res.header(name, value)`
- `res.json(data)`
- `res.send(data)`
- `res.html(html)`
- `res.redirect(url, code?)`
- `res.jsonp(data, callbackParam?)`
- `res.download(filepath, filename?)`
- `res.sendFile(filepath, options?)`
- `res.render(view, locals?, callback?)`
- `res.end(data?)`

Example:

```javascript
app.get('/download', (req, res) => {
  res.download('./reports/latest.pdf');
});

app.get('/legacy', (req, res) => {
  res.redirect('/new-location', 301);
});
```

## Cache API

The exported `cache` singleton exposes the runtime cache adapter.

```javascript
import { cache } from 'triva';

await cache.set('user:1', { id: 1, name: 'Alice' }, 300000);
const user = await cache.get('user:1');
const exists = await cache.has('user:1');
const keys = await cache.keys('user:*');
await cache.delete('user:1');
await cache.clear();
const stats = await cache.stats();
```

TTL values are in milliseconds.

## Other Exports

Useful additional exports from `triva` include:

- `middleware`
- `errorTracker`
- `log`
- `cookieParser`
- `configCache`
- `createAdapter`
- `isAI`, `isBot`, `isCrawler`

## Related Docs

- [Request Object](https://docs.trivajs.com/core/request)
- [Response Object](https://docs.trivajs.com/core/response)
- [Routing](https://docs.trivajs.com/core/routing)
- [Configuration](https://docs.trivajs.com/core/configuration)

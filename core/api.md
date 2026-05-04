# API Reference

## Constructor

```javascript
import { build } from 'triva';

const app = new build({
  env: 'development',
  cache: { type: 'memory' },
  throttle: { limit: 100, window_ms: 60000 },
  retention: { enabled: true, maxEntries: 10000 },
  errorTracking: { enabled: true }
});
```

The constructor returns an application instance immediately. You do not `await` it.

## Route Methods

- `app.get(path, ...handlers)`
- `app.post(path, ...handlers)`
- `app.put(path, ...handlers)`
- `app.del(path, ...handlers)`
- `app.delete(path, ...handlers)`
- `app.patch(path, ...handlers)`
- `app.all(path, ...handlers)`
- `app.route(path)`

## Middleware and Lifecycle

- `app.use(middleware)`
- `app.listen(port, callback?)`
- `app.close(callback?)`

## Request Surface

Inside handlers, Triva gives you:

- `req.params`
- `req.query`
- `req.pathname`
- `req.cookies`
- `await req.json()`
- `await req.text()`

Do not document `req.body` as the main public API. Parse the body explicitly.

## Response Surface

- `res.status(code)`
- `res.header(name, value)`
- `res.json(data)`
- `res.send(data)`
- `res.html(html)`
- `res.redirect(url, code?)`
- `res.jsonp(data, callbackParam?)`
- `res.sendFile(filepath, options?)`
- `res.download(filepath, filename?)`
- `res.cookie(name, value, options?)`
- `res.clearCookie(name, options?)`

## Standalone Exports

Triva also exports:

- `cache`
- `configCache`
- `log`
- `errorTracker`
- `cookieParser`

## Example

```javascript
import { build, cache } from 'triva';

const app = new build({ cache: { type: 'memory' } });

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/cache/:key', async (req, res) => {
  const value = await cache.get(req.params.key);
  if (!value) {
    return res.status(404).json({ error: 'Missing cache entry' });
  }

  res.json({ key: req.params.key, value });
});
```

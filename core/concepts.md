# Concepts

## The Mental Model

Triva is built around one application instance:

1. create the app with `new build(...)`
2. register routes and middleware on that instance
3. start the server with `app.listen(...)`

## Explicit Body Parsing

Triva favors explicit request parsing:

```javascript
const body = await req.json();
const raw = await req.text();
```

That keeps examples obvious and avoids magic around body access.

## Cache as a Runtime Service

Cache configuration happens at startup:

```javascript
const app = new build({
  cache: {
    type: 'memory',
    retention: 300000
  }
});
```

Runtime cache access happens through the exported singleton:

```javascript
import { cache } from 'triva';

await cache.set('users:1', { id: 1, name: 'Ada' }, 300000);
const user = await cache.get('users:1');
```

## Middleware Strategy

Use constructor options for built-in concerns such as:

- throttle
- retention
- error tracking

Use `app.use()` or route-level handlers for application-specific behavior.

## Deployment Strategy

Switch between HTTP and HTTPS with configuration:

```javascript
const httpApp = new build({ protocol: 'http' });
const httpsApp = new build({
  protocol: 'https',
  ssl: { key, cert }
});
```

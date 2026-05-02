# Adapters

Triva ships one cache API with multiple adapter backends.

## Built-In Adapters

- `memory`
- `embedded`

These work without adding an external driver package.

## External Adapters

- `redis`
- `mongodb`
- `postgresql`
- `mysql`
- `sqlite`
- `better-sqlite3`
- `supabase`

These require the corresponding driver in your application.

## Shared Runtime API

No matter which adapter you choose, you still call:

```javascript
await cache.get('key');
await cache.set('key', { value: true }, 300000);
await cache.delete('key');
await cache.keys('prefix:*');
await cache.stats();
```

## Shared Config Shape

```javascript
const app = new build({
  cache: {
    type: 'redis',
    retention: 300000,
    database: {
      host: 'localhost',
      port: 6379
    }
  }
});
```

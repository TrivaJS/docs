# Memory

The memory adapter is the simplest way to start. It keeps cache entries in process memory.

## Configuration

```javascript
const app = new build({
  cache: {
    type: 'memory',
    retention: 300000,
    limit: 100000
  }
});
```

## Runtime Usage

```javascript
await cache.set('health:last', { ok: true }, 300000);
const value = await cache.get('health:last');
```

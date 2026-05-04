# Redis

## Configuration

```javascript
const app = new build({
  cache: {
    type: 'redis',
    retention: 300000,
    database: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    }
  }
});
```

## Runtime Usage

```javascript
await cache.set('session:123', { userId: 1 }, 3600000);
const session = await cache.get('session:123');
```

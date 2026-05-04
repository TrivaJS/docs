# PostgreSQL

## Configuration

```javascript
const app = new build({
  cache: {
    type: 'postgresql',
    retention: 1800000,
    database: {
      host: process.env.PG_HOST || 'localhost',
      port: 5432,
      database: process.env.PG_DATABASE || 'triva',
      user: process.env.PG_USER || 'postgres',
      password: process.env.PG_PASSWORD || 'postgres'
    }
  }
});
```

## Runtime Usage

```javascript
const cached = await cache.get('report:sales:2026-q2');
await cache.set('report:sales:2026-q2', report, 1800000);
```

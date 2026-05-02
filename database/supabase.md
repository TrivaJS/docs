# Supabase

## Configuration

```javascript
const app = new build({
  cache: {
    type: 'supabase',
    retention: 600000,
    database: {
      url: process.env.SUPABASE_URL,
      key: process.env.SUPABASE_KEY,
      tableName: 'triva_cache'
    }
  }
});
```

## Runtime Usage

```javascript
await cache.set('users:list', users, 600000);
const users = await cache.get('users:list');
```

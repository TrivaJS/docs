# Better-SQLite3

## Configuration

```javascript
const app = new build({
  cache: {
    type: 'better-sqlite3',
    retention: 600000,
    database: {
      filename: './cache.db'
    }
  }
});
```

## Runtime Usage

```javascript
await cache.set('products:featured', featured, 600000);
const featured = await cache.get('products:featured');
```

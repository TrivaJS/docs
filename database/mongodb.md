# MongoDB

## Configuration

```javascript
const app = new build({
  cache: {
    type: 'mongodb',
    retention: 3600000,
    database: {
      uri: process.env.MONGODB_URI,
      database: 'triva',
      collection: 'cache'
    }
  }
});
```

## Runtime Usage

```javascript
await cache.set('products:all', products, 3600000);
const products = await cache.get('products:all');
```

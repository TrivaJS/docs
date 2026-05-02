# MySQL

## Configuration

```javascript
const app = new build({
  cache: {
    type: 'mysql',
    retention: 3600000,
    database: {
      host: process.env.MYSQL_HOST || 'localhost',
      port: 3306,
      database: process.env.MYSQL_DATABASE || 'triva',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || ''
    }
  }
});
```

## Runtime Usage

```javascript
await cache.set('catalog:featured', featuredProducts, 3600000);
const featuredProducts = await cache.get('catalog:featured');
```

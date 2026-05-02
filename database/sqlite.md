# SQLite

## Configuration

```javascript
const app = new build({
  cache: {
    type: 'sqlite',
    retention: 600000,
    database: {
      filename: './cache.sqlite'
    }
  }
});
```

## Runtime Usage

```javascript
await cache.set('settings', { theme: 'dark' }, 600000);
const settings = await cache.get('settings');
```

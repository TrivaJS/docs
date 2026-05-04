# Embedded

The embedded adapter is a built-in file-backed option for local development and lightweight deployments.

## Configuration

```javascript
const app = new build({
  cache: {
    type: 'embedded',
    retention: 600000,
    database: {
      filename: './cache.json'
    }
  }
});
```

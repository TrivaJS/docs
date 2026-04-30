# CORS Extension

`@trivajs/cors` adds configurable Cross-Origin Resource Sharing middleware for Triva applications.

## Install

```bash
npm install @trivajs/cors
```

## Basic Usage

```javascript
import { build } from 'triva';
import { cors } from '@trivajs/cors';

const app = new build();

app.use(cors({
  origin: 'https://app.example.com',
  credentials: true
}));

app.get('/api/data', (req, res) => {
  res.json({ ok: true });
});

app.listen(3000);
```

## Common Options

- `origin`
- `methods`
- `allowedHeaders`
- `exposedHeaders`
- `credentials`
- `maxAge`

## Related Docs

- [Middleware CORS Guide](https://docs.trivajs.com/middleware/cors)
- [Custom Middleware](https://docs.trivajs.com/middleware/custom)

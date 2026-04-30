# CORS Middleware

Use `@trivajs/cors` when your Triva app needs Cross-Origin Resource Sharing headers.

## Install

```bash
npm install @trivajs/cors
```

## Basic Usage

```javascript
import { build } from 'triva';
import { cors } from '@trivajs/cors';

const app = new build();

app.use(cors());

app.get('/api/data', (req, res) => {
  res.json({ ok: true });
});

app.listen(3000);
```

## Restrict Origins

```javascript
app.use(cors({
  origin: 'https://app.example.com',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
```

## Route-Specific Usage

```javascript
import { corsDevMode } from '@trivajs/cors';

app.get('/api/public/data', corsDevMode(), (req, res) => {
  res.json({ public: true });
});
```

## JSON Body Example

```javascript
app.post('/api/items', cors({ origin: 'https://app.example.com' }), async (req, res) => {
  const body = await req.json();
  res.status(201).json({ created: body });
});
```

## Related Docs

- [Extension Overview](https://docs.trivajs.com/extensions/overview)
- [Custom Middleware](https://docs.trivajs.com/middleware/custom)

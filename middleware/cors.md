# CORS

Triva ships CORS as an official extension package.

## Install

```bash
npm install @trivajs/cors
```

## Basic Usage

```javascript
import { build } from 'triva';
import { cors } from '@trivajs/cors';

const app = new build({ env: 'development' });

app.use(cors());

app.get('/api/data', (req, res) => {
  res.json({ ok: true });
});
```

## Restricted Origin

```javascript
app.use(cors({
  origin: 'https://app.example.com',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Route-Level Usage

```javascript
app.get('/api/public', cors(), (req, res) => {
  res.json({ public: true });
});
```

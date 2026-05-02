# CORS Extension

## Package

`@trivajs/cors`

## Install

```bash
npm install @trivajs/cors
```

## Example

```javascript
import { build } from 'triva';
import { cors } from '@trivajs/cors';

const app = new build({ env: 'development' });

app.use(cors({
  origin: 'https://app.example.com',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Presets

The package also exposes:

- `corsDevMode()`
- `corsStrict(origin)`
- `corsMultiOrigin(origins)`
- `corsDynamic(validator)`

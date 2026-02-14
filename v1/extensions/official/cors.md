# @triva/cors

CORS (Cross-Origin Resource Sharing) middleware.

## Installation

```bash
npm install @triva/cors
```

## Usage

### Basic

```javascript
import { use } from 'triva';
import cors from '@triva/cors';

use(cors());
```

### Custom Configuration

```javascript
use(cors({
  origin: 'https://example.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  maxAge: 86400
}));
```

### Multiple Origins

```javascript
use(cors({
  origin: [
    'https://example.com',
    'https://app.example.com',
    'https://admin.example.com'
  ]
}));
```

### Dynamic Origin

```javascript
use(cors({
  origin: (origin) => {
    // Allow all subdomains
    return origin?.endsWith('.example.com');
  }
}));
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `origin` | string/array/function | '*' | Allowed origins |
| `methods` | array | ['GET','POST','PUT','DELETE'] | Allowed methods |
| `credentials` | boolean | false | Allow credentials |
| `allowedHeaders` | array | ['Content-Type','Authorization'] | Allowed headers |
| `exposedHeaders` | array | [] | Exposed headers |
| `maxAge` | number | 86400 | Preflight cache time |

## Examples

### REST API

```javascript
import { build, use, get, post } from 'triva';
import cors from '@triva/cors';

await build({ cache: { type: 'memory' } });

use(cors({
  origin: ['https://app.example.com'],
  credentials: true
}));

get('/api/data', (req, res) => {
  res.json({ data: [] });
});
```

### Public API

```javascript
use(cors({
  origin: '*',
  methods: ['GET'],
  credentials: false
}));
```

---

**[Back to Official Extensions](README.md)**

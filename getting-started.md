# Getting Started

Triva is a production-ready Node.js HTTP framework with built-in middleware, caching, and database support.

## Quick Install

```bash
npm install triva
```

## Your First Server

```javascript
import { build, get, listen } from 'triva';

await build({
  env: 'development'
});

get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

listen(3000);
```

## What's Included

- HTTP/HTTPS server
- Built-in routing: `get`, `post`, `put`, `del`, `patch`
- Middleware support (throttling, logging, error tracking)
- Database adapters (MongoDB, PostgreSQL, Redis, MySQL, SQLite, and more)
- Cache layer
- Production defaults

## Next Steps

- [Installation Guide](https://docs.trivajs.com/installation)
- [First Server Tutorial](https://docs.trivajs.com/quick-start/first-server)
- [Core Concepts](https://docs.trivajs.com/core/concepts)
- [API Reference](https://docs.trivajs.com/core/api)

## Getting Help

- GitHub: [github.com/trivajs/triva](https://github.com/trivajs/triva)
- Email: contact@trivajs.com

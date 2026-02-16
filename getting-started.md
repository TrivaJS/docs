# Getting Started

Triva is a production-ready Node.js HTTP framework with built-in middleware, caching, and database support.

## Quick Install

```bash
npm install triva
```

## Your First Server

```javascript
const Triva = require('triva');
const app = new Triva();

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.listen(3000);
console.log('Server running on http://localhost:3000');
```

## What's Included

- HTTP/HTTPS server
- Built-in routing
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

# Getting Started with Triva

Welcome to Triva - an enterprise-grade Node.js HTTP/HTTPS framework designed for performance, scalability, and developer experience.

## What is Triva?

Triva is a modern, zero-dependency HTTP/HTTPS framework that provides:

- 🚀 **High Performance** - Built on native Node.js with minimal overhead
- 🎯 **Centralized Configuration** - Everything configured in one place
- 🗄️ **Multiple Database Adapters** - Memory, SQLite, MongoDB, Redis, PostgreSQL, and more
- 🛡️ **Advanced Security** - Built-in throttling, rate limiting, and auto-ban protection
- 📊 **Comprehensive Logging** - Request tracking with User-Agent parsing
- ⚡ **Built-in Caching** - Works seamlessly with any database adapter
- 🔒 **HTTPS Support** - First-class SSL/TLS support
- 🤖 **Smart Redirects** - Automatic routing for AI, bots, and crawlers

## Who Should Use Triva?

Triva is perfect for:

- **API Developers** building RESTful services
- **Enterprise Teams** needing reliable, scalable frameworks
- **Startups** wanting to move fast without sacrificing quality
- **Anyone** tired of Express middleware hell

## Prerequisites

Before you begin, ensure you have:

- **Node.js** v18.0.0 or higher
- **npm** v8.0.0 or higher (or yarn/pnpm)
- Basic knowledge of JavaScript/TypeScript
- Familiarity with HTTP concepts

Check your versions:
```bash
node --version  # Should be v18+
npm --version   # Should be v8+
```

## Quick Start (5 Minutes)

### Step 1: Create a New Project

```bash
mkdir my-triva-app
cd my-triva-app
npm init -y
```

### Step 2: Install Triva

```bash
npm install triva
```

### Step 3: Create Your First Server

Create `server.js`:

```javascript
import { build, get, listen } from 'triva';

// Configure server
await build({
  env: 'development',
  cache: {
    type: 'memory',
    retention: 600000 // 10 minutes
  }
});

// Define routes
get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Triva!',
    timestamp: new Date().toISOString()
  });
});

get('/api/hello/:name', (req, res) => {
  res.json({ 
    greeting: `Hello, ${req.params.name}!` 
  });
});

// Start server
listen(3000);
```

### Step 4: Update package.json

Add `"type": "module"` to enable ES modules:

```json
{
  "name": "my-triva-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "triva": "^1.0.0"
  }
}
```

### Step 5: Run Your Server

```bash
npm start
```

You should see:
```
Triva HTTP server listening on port 3000 (development)
```

### Step 6: Test Your API

Open your browser or use curl:

```bash
curl http://localhost:3000/
# {"message":"Welcome to Triva!","timestamp":"2025-02-11T22:15:00.000Z"}

curl http://localhost:3000/api/hello/World
# {"greeting":"Hello, World!"}
```

🎉 **Congratulations!** You've built your first Triva application!

---

## Next Steps

### Learn the Basics

1. **[Installation Guide](INSTALLATION.md)** - Detailed installation instructions
2. **[Core Concepts](guides/core-concepts.md)** - Understanding Triva's architecture
3. **[Routing](guides/routing.md)** - Advanced routing patterns
4. **[Middleware](middleware/overview.md)** - Request/response processing

### Add Features

1. **[Database & Cache](database-and-cache/overview.md)** - Connect to databases
2. **[Throttling](middleware/throttling.md)** - Rate limiting and protection
3. **[HTTPS](guides/https.md)** - Secure your server with SSL
4. **[Error Handling](guides/error-handling.md)** - Robust error management

### Go to Production

1. **[Deployment](guides/deployment.md)** - Deploy to production
2. **[Performance](guides/performance.md)** - Optimize your application
3. **[Monitoring](guides/monitoring.md)** - Track your application health
4. **[Security](SECURITY.md)** - Best security practices

---

## Common Patterns

### Building a REST API

```javascript
import { build, get, post, put, del, listen } from 'triva';

await build({ 
  env: 'production',
  cache: { type: 'redis', host: 'localhost' },
  throttle: { limit: 100, window_ms: 60000 }
});

// CRUD operations
get('/api/users', async (req, res) => {
  const users = await db.findAll();
  res.json(users);
});

post('/api/users', async (req, res) => {
  const data = await req.json();
  const user = await db.create(data);
  res.status(201).json(user);
});

put('/api/users/:id', async (req, res) => {
  const data = await req.json();
  const user = await db.update(req.params.id, data);
  res.json(user);
});

del('/api/users/:id', async (req, res) => {
  await db.delete(req.params.id);
  res.status(204).send();
});

listen(3000);
```

### With MongoDB

```javascript
import { build, get, post, listen } from 'triva';

await build({
  cache: {
    type: 'mongodb',
    database: {
      uri: 'mongodb://localhost:27017/myapp',
      collection: 'cache'
    }
  }
});

post('/api/data', async (req, res) => {
  const data = await req.json();
  await cache.set(`user:${data.id}`, data, 3600000);
  res.status(201).json({ cached: true });
});

get('/api/data/:id', async (req, res) => {
  const cached = await cache.get(`user:${req.params.id}`);
  if (cached) {
    return res.json({ source: 'cache', data: cached });
  }
  
  const fresh = await db.findById(req.params.id);
  res.json({ source: 'database', data: fresh });
});

listen(3000);
```

### With HTTPS

```javascript
import { build, get, listen } from 'triva';
import fs from 'fs';

await build({
  protocol: 'https',
  ssl: {
    key: fs.readFileSync('./ssl/private.key'),
    cert: fs.readFileSync('./ssl/certificate.crt')
  },
  cache: { type: 'memory' }
});

get('/', (req, res) => {
  res.json({ secure: true });
});

listen(443);
```

---

## Configuration Options

Triva uses centralized configuration in the `build()` function:

```javascript
await build({
  // Environment
  env: 'development' | 'production' | 'test',
  
  // Protocol
  protocol: 'http' | 'https',
  
  // SSL (for HTTPS)
  ssl: {
    key: Buffer | string,
    cert: Buffer | string,
    ca?: Buffer | string
  },
  
  // Cache
  cache: {
    type: 'memory' | 'embedded' | 'sqlite' | 'mongodb' | 'redis' | 'postgresql' | 'supabase' | 'mysql',
    retention: number, // milliseconds
    database: {
      // Database-specific config
    }
  },
  
  // Throttling
  throttle: {
    limit: number,           // Max requests per window
    window_ms: number,       // Time window in ms
    burst_limit: number,     // Max burst requests
    ban_threshold: number,   // Violations before ban
    ban_ms: number          // Ban duration
  },
  
  // Auto-Redirect
  redirects: {
    enabled: boolean,
    redirectAI: boolean,     // Redirect AI traffic
    redirectBots: boolean,   // Redirect bot traffic
    redirectCrawlers: boolean, // Redirect crawler traffic
    destination: string | Function,
    statusCode: number,
    whitelist: string[],
    customRules: []
  },
  
  // Middleware
  middleware: {
    // Custom middleware options
  },
  
  // Error Tracking
  errorTracking: {
    enabled: boolean,
    // Error tracking config
  }
});
```

---

## Project Structure

We recommend this structure for Triva projects:

```
my-triva-app/
├── src/
│   ├── routes/          # Route handlers
│   │   ├── users.js
│   │   ├── posts.js
│   │   └── index.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js
│   │   └── validation.js
│   ├── models/          # Data models
│   │   └── User.js
│   ├── config/          # Configuration
│   │   ├── database.js
│   │   └── server.js
│   └── utils/           # Utilities
│       └── helpers.js
├── tests/               # Test files
│   ├── unit/
│   └── integration/
├── ssl/                 # SSL certificates
│   ├── private.key
│   └── certificate.crt
├── .env                 # Environment variables
├── .gitignore
├── package.json
└── server.js            # Main entry point
```

---

## Environment Variables

Use `.env` files for configuration:

```bash
# .env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/myapp
REDIS_HOST=localhost
REDIS_PORT=6379
```

Load with dotenv:

```javascript
import 'dotenv/config';
import { build, listen } from 'triva';

await build({
  env: process.env.NODE_ENV,
  cache: {
    type: 'mongodb',
    database: {
      uri: process.env.MONGODB_URI
    }
  }
});

listen(process.env.PORT || 3000);
```

---

## Troubleshooting

### Server Won't Start

**Problem:** Error about port already in use

**Solution:** Change the port or kill the process using that port:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Module Not Found Errors

**Problem:** `Cannot find module 'triva'`

**Solution:** 
1. Ensure you ran `npm install triva`
2. Check `node_modules/` exists
3. Try `npm install` again

### ES Module Errors

**Problem:** `Cannot use import statement outside a module`

**Solution:** Add `"type": "module"` to `package.json`:
```json
{
  "type": "module"
}
```

### Database Connection Fails

**Problem:** Can't connect to MongoDB/Redis/etc.

**Solution:**
1. Ensure database is running
2. Check connection string
3. Verify credentials
4. Check firewall settings

---

## Getting Help

### Documentation

- **[Full Documentation](https://docs.trivajs.com)** - Complete guides
- **[API Reference](api-reference/overview.md)** - Detailed API docs
- **[Examples](examples/)** - Code examples

### Community

- **[GitHub Issues](https://github.com/trivajs/triva/issues)** - Bug reports
- **[Discussions](https://github.com/trivajs/triva/discussions)** - Questions
- **[Discord](https://discord.gg/triva)** - Live chat
- **[Twitter](https://twitter.com/trivajs)** - Updates

### Commercial Support

Need help with your project? We offer:

- Consulting services
- Training and workshops
- Priority support
- Custom development

Contact: support@trivajs.com

---

## What's Next?

Now that you have Triva running, explore these topics:

1. **[Core Concepts](guides/core-concepts.md)** - Deep dive into Triva's architecture
2. **[Routing Guide](guides/routing.md)** - Master URL routing
3. **[Database Setup](database-and-cache/overview.md)** - Connect your database
4. **[Deployment](guides/deployment.md)** - Go to production
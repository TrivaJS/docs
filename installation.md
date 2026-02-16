# Installation

## Requirements

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher

## Verify Node.js

```bash
node --version
npm --version
```

## Install Triva

```bash
npm install triva
```

## Create Your First App

Create `server.js`:

```javascript
const Triva = require('triva');
const app = new Triva();

app.get('/', (req, res) => {
  res.json({ status: 'running' });
});

app.listen(3000);
```

## Run the Server

```bash
node server.js
```

Visit `http://localhost:3000` to see your server running.

## Optional Dependencies

### Database Adapters

Install only the adapters you need:

```bash
npm install mongodb      # MongoDB
npm install pg           # PostgreSQL  
npm install mysql2       # MySQL
npm install redis        # Redis
npm install better-sqlite3  # SQLite
```

### Extensions

```bash
npm install @triva/cors      # CORS middleware
npm install @triva/jwt       # JWT authentication  
npm install @triva/cli       # CLI tools
npm install @triva/shortcuts # Developer shortcuts
```

## TypeScript Support

Triva includes TypeScript definitions:

```bash
npm install --save-dev @types/node
```

```javascript
import Triva from 'triva';

const app = new Triva();
app.listen(3000);
```

## Next Steps

- [First Server Tutorial](https://docs.trivajs.com/quick-start/first-server)
- [Quick Examples](https://docs.trivajs.com/quick-start/examples)
- [Configuration Options](https://docs.trivajs.com/core/configuration)

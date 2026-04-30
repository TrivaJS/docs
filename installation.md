# Installation

## Requirements

- Node.js 18 or newer
- npm 8 or newer

## Install Triva

```bash
npm install triva
```

## Create A Starter App

```javascript
import { build } from 'triva';

const app = new build({ env: 'development' });

app.get('/', (req, res) => {
  res.json({ status: 'running' });
});

app.listen(3000);
```

## Run It

```bash
node server.js
```

## Optional Adapter Packages

Install only the adapters you plan to use:

```bash
npm install mongodb
npm install pg
npm install mysql2
npm install redis
npm install sqlite3
npm install better-sqlite3
npm install @supabase/supabase-js
```

## Official Extensions

```bash
npm install @trivajs/cors
npm install @triva/jwt
npm install -g @trivajs/cli
npm install @trivajs/shortcuts
```

## Next Steps

- [Getting Started](https://docs.trivajs.com/getting-started)
- [First Server Tutorial](https://docs.trivajs.com/quick-start/first-server)
- [Configuration](https://docs.trivajs.com/core/configuration)

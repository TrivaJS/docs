# Installation

## Requirements

- Node.js 18 or newer
- npm, pnpm, or yarn

## Framework Install

```bash
npm install triva
```

## Minimal Smoke Test

```javascript
import { build } from 'triva';

const app = new build({ env: 'development' });

app.get('/', (req, res) => {
  res.send('Triva is installed');
});

app.listen(3000);
```

Run the file and open `http://localhost:3000`.

## Optional Extension Packages

Install only the packages you need:

```bash
npm install @trivajs/cors
npm install @triva/jwt
npm install @trivajs/cli
npm install @trivajs/shortcuts
```

## Optional Adapter Drivers

Some cache adapters need their own driver package in your app:

- Redis
- MongoDB
- PostgreSQL
- MySQL
- SQLite
- Better-SQLite3
- Supabase

Start with the [adapter overview](/database/adapters) before wiring one into `cache`.

## HTTPS Note

If you run Triva with `protocol: 'https'`, provide `ssl.key` and `ssl.cert`:

```javascript
import fs from 'fs';
import { build } from 'triva';

const app = new build({
  protocol: 'https',
  ssl: {
    key: fs.readFileSync('./certs/localhost-key.pem'),
    cert: fs.readFileSync('./certs/localhost-cert.pem')
  }
});
```

## Read Next

- [Getting Started](/getting-started)
- [First Server](/quick-start/first-server)
- [Database Quick Start](/database/quick-start)

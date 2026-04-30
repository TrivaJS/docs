# SQLite Adapter

Use SQLite when you want a file-backed relational store without running a separate service.

## Install

```bash
npm install sqlite3
```

## Configuration

```javascript
import { build } from 'triva';

const app = new build({
  cache: {
    type: 'sqlite',
    database: {
      filename: './triva.sqlite'
    }
  }
});
```

## Example

```javascript
import { build, cache } from 'triva';

const app = new build({
  cache: {
    type: 'sqlite',
    database: {
      filename: './triva.sqlite'
    }
  }
});

app.post('/api/settings', async (req, res) => {
  const settings = await req.json();
  await cache.set('settings', settings);
  res.json({ saved: true });
});

app.get('/api/settings', async (req, res) => {
  const settings = await cache.get('settings');
  res.json({ settings });
});
```

## Related Docs

- [Better-SQLite3 Adapter](https://docs.trivajs.com/database/better-sqlite3)
- [Embedded Adapter](https://docs.trivajs.com/database/embedded)

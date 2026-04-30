# Embedded Adapter

The embedded adapter stores cache entries in a local file and can optionally encrypt that file.

## Configuration

```javascript
import { build } from 'triva';

const app = new build({
  cache: {
    type: 'embedded',
    database: {
      filename: './triva.db',
      encryptionKey: process.env.TRIVA_CACHE_KEY
    }
  }
});
```

## Notes

- no extra package install is required
- data persists across restarts
- this is still a single-node storage choice

## Example

```javascript
import { build, cache } from 'triva';

const app = new build({
  cache: {
    type: 'embedded',
    database: {
      filename: './cache.db'
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

- [SQLite Adapter](https://docs.trivajs.com/database/sqlite)
- [Memory Adapter](https://docs.trivajs.com/database/memory)

# Error Handling Example

```javascript
import { build } from 'triva';

const app = new build({
  env: 'production',
  errorTracking: { enabled: true, maxEntries: 5000 }
});

app.get('/api/users/:id', (req, res) => {
  const user = null;

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

app.get('/api/test/error', (req, res) => {
  throw new Error('Intentional test error');
});
```

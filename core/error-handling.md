# Error Handling

Triva supports both explicit route-local error handling and global error hooks.

## Route-Local Try/Catch

```javascript
import { build } from 'triva';

const app = new build({ env: 'development' });

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await loadUser(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load user' });
  }
});

app.listen(3000);
```

## Handle Invalid JSON

```javascript
app.post('/api/users', async (req, res) => {
  try {
    const body = await req.json();

    if (!body.email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    res.status(201).json(body);
  } catch {
    res.status(400).json({ error: 'Invalid JSON body' });
  }
});
```

## Global Error Handler

```javascript
app.setErrorHandler((error, req, res) => {
  console.error(error);
  res.status(500).json({
    error: 'Internal Server Error',
    path: req.url
  });
});
```

If a route throws and you do not catch it yourself, Triva forwards that failure to the error handler.

## Custom 404 Handler

```javascript
app.setNotFoundHandler((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.url
  });
});
```

## Error Tracking

```javascript
import { build, errorTracker } from 'triva';

const app = new build({
  errorTracking: {
    enabled: true,
    maxEntries: 10000
  }
});

app.get('/admin/errors', async (req, res) => {
  const errors = await errorTracker.get({ resolved: false, limit: 50 });
  res.json(errors);
});
```

## Manual Capture

```javascript
app.get('/risky', async (req, res) => {
  try {
    await performRiskyWork();
    res.json({ ok: true });
  } catch (error) {
    await errorTracker.capture(error, {
      req,
      phase: 'route',
      custom: { endpoint: '/risky' }
    });
    res.status(500).json({ error: 'Operation failed' });
  }
});
```

## Related Docs

- [Error Tracking](https://docs.trivajs.com/middleware/error-tracking)
- [Request Object](https://docs.trivajs.com/core/request)
- [Response Object](https://docs.trivajs.com/core/response)

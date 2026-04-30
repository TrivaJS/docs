# Error Handling Example

Triva works well with explicit, route-local error handling and consistent JSON error responses.

## Example

```javascript
import { build } from 'triva';

const app = new build({
  env: 'production',
  errorTracking: true
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await fetchOrder(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000);
```

## Tips

- return clear `4xx` errors for user-caused failures
- reserve `500` errors for unexpected conditions
- avoid leaking stack traces to clients
- log enough detail to debug the failure server-side

## Related Docs

- [Error Handling](https://docs.trivajs.com/core/error-handling)
- [Error Tracking Middleware](https://docs.trivajs.com/middleware/error-tracking)

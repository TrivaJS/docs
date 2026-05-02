# Middleware Order

Middleware runs in registration order.

## Example

```javascript
const first = (req, res, next) => {
  req.steps = ['first'];
  next();
};

const second = (req, res, next) => {
  req.steps.push('second');
  next();
};

app.get('/order', first, second, (req, res) => {
  res.json({ steps: req.steps });
});
```

## Constructor-Level Runtime Behavior

Built-in features such as throttle and retention are initialized from the constructor before requests are handled. Use route-level middleware for app-specific request flow.

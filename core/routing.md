# Routing

Triva routes are registered on the application instance.

## Basic Routes

```javascript
const app = new build({ env: 'development' });

app.get('/users', (req, res) => {
  res.json([]);
});

app.post('/users', async (req, res) => {
  const body = await req.json();
  res.status(201).json({ created: body });
});

app.del('/users/:id', (req, res) => {
  res.json({ deleted: req.params.id });
});
```

## Parameters

```javascript
app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id });
});
```

## Match Any Method

```javascript
app.all('/ping', (req, res) => {
  res.json({ method: req.method, ok: true });
});
```

## Route Builder

```javascript
app.route('/books')
  .get((req, res) => res.json({ items: [] }))
  .post(async (req, res) => {
    const body = await req.json();
    res.status(201).json({ created: body });
  })
  .put(async (req, res) => {
    const body = await req.json();
    res.json({ updated: body });
  });
```

## Multiple Handlers

Triva supports:

- variadic handlers
- arrays of handlers
- handlers that call `next()`

```javascript
const log = (req, res, next) => {
  req.logged = true;
  next();
};

app.get('/logged', log, (req, res) => {
  res.json({ logged: req.logged });
});
```

# Request

Triva wraps the native Node request with a request context that exposes routing and parsing helpers.

## Available Properties

- `req.params`
- `req.query`
- `req.pathname`
- `req.cookies`
- `req.headers`
- `req.method`
- `req.url`

## JSON Body Parsing

```javascript
app.post('/users', async (req, res) => {
  const body = await req.json();
  res.status(201).json({ created: body });
});
```

## Text Body Parsing

```javascript
app.post('/webhook/raw', async (req, res) => {
  const raw = await req.text();
  res.send(raw);
});
```

## Route Parameters

```javascript
app.get('/users/:id', (req, res) => {
  res.json({ userId: req.params.id });
});
```

## Query Strings

```javascript
app.get('/search', (req, res) => {
  res.json({
    query: req.query.q,
    page: req.query.page
  });
});
```

## Important Note

Treat `await req.json()` and `await req.text()` as the supported request-body API. Do not build examples around `req.body`.

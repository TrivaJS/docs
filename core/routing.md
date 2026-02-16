# Routing

## Basic Routes

```javascript
const Triva = require('triva');
const app = new Triva();

app.get('/', (req, res) => {
  res.send('GET request');
});

app.post('/data', (req, res) => {
  res.json({ received: req.body });
});

app.listen(3000);
```

## HTTP Methods

- `app.get(path, handler)` - GET
- `app.post(path, handler)` - POST
- `app.put(path, handler)` - PUT
- `app.delete(path, handler)` - DELETE
- `app.patch(path, handler)` - PATCH
- `app.all(path, handler)` - All methods

## Route Parameters

```javascript
app.get('/users/:id', (req, res) => {
  res.json({ userId: req.params.id });
});

app.get('/posts/:category/:id', (req, res) => {
  const { category, id } = req.params;
  res.json({ category, id });
});
```

## Query Parameters

```javascript
app.get('/search', (req, res) => {
  const { q, limit, page } = req.query;
  res.json({ query: q, limit: limit || 10 });
});
```

## Multiple Handlers

```javascript
const auth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.get('/protected', auth, (req, res) => {
  res.json({ message: 'Protected' });
});
```

## REST Pattern

```javascript
app.get('/api/posts', getAllPosts);
app.get('/api/posts/:id', getPost);
app.post('/api/posts', createPost);
app.put('/api/posts/:id', updatePost);
app.delete('/api/posts/:id', deletePost);
```

## Next Steps

- [Request Object](https://docs.trivajs.com/core/request)
- [Response Object](https://docs.trivajs.com/core/response)

# Request Object

## Properties

### req.method

HTTP method (GET, POST, etc.)

```javascript
app.all('/', (req, res) => {
  console.log(req.method);
});
```

### req.url

Request URL path

```javascript
app.get('*', (req, res) => {
  console.log(req.url);
});
```

### req.headers

Request headers object

```javascript
app.get('/', (req, res) => {
  const contentType = req.headers['content-type'];
  const auth = req.headers['authorization'];
  res.json({ contentType, auth });
});
```

### req.query

Query string parameters

```javascript
app.get('/search', (req, res) => {
  // /search?q=test&limit=10
  console.log(req.query.q);     // 'test'
  console.log(req.query.limit); // '10'
  res.json(req.query);
});
```

### req.params

Route parameters

```javascript
app.get('/users/:id', (req, res) => {
  // /users/123
  console.log(req.params.id); // '123'
});
```

### req.body

Parsed request body

```javascript
app.post('/users', (req, res) => {
  // POST with JSON body
  console.log(req.body.name);
  console.log(req.body.email);
  res.json(req.body);
});
```

## Common Patterns

### Validate Query

```javascript
app.get('/api/items', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  if (limit > 100) {
    return res.status(400).json({ error: 'Limit too high' });
  }
  
  res.json({ page, limit });
});
```

### Check Headers

```javascript
app.post('/api/data', (req, res) => {
  const contentType = req.headers['content-type'];
  
  if (!contentType || !contentType.includes('application/json')) {
    return res.status(400).json({ error: 'JSON required' });
  }
  
  res.json({ success: true });
});
```

### Parse Body

```javascript
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  
  res.status(201).json({ username, email });
});
```

## Next Steps

- [Response Object](https://docs.trivajs.com/core/response)
- [Routing](https://docs.trivajs.com/core/routing)

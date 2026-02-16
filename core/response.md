# Response Object

## Methods

### res.json(data)

Send JSON response

```javascript
app.get('/api/user', (req, res) => {
  res.json({ id: 1, name: 'Alice' });
});
```

### res.send(text)

Send text response

```javascript
app.get('/', (req, res) => {
  res.send('Hello World');
});
```

### res.status(code)

Set HTTP status code

```javascript
app.get('/not-found', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.post('/created', (req, res) => {
  res.status(201).json({ created: true });
});
```

### res.redirect(url)

Redirect to URL

```javascript
app.get('/old', (req, res) => {
  res.redirect('/new');
});
```

### res.setHeader(name, value)

Set response header

```javascript
app.get('/download', (req, res) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment');
  res.send(pdfData);
});
```

## Common Patterns

### Success Response

```javascript
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: users
  });
});
```

### Error Response

```javascript
app.get('/api/user/:id', (req, res) => {
  const user = findUser(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      error: 'User not found'
    });
  }
  
  res.json(user);
});
```

### Created Response

```javascript
app.post('/api/users', (req, res) => {
  const user = createUser(req.body);
  res.status(201).json(user);
});
```

## Status Codes

Common codes:
- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

```javascript
app.post('/api/action', (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: 'Bad Request' });
  }
  
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const result = processAction(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});
```

## Next Steps

- [Request Object](https://docs.trivajs.com/core/request)
- [Error Handling](https://docs.trivajs.com/core/error-handling)

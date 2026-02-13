# req.headers

HTTP request headers.

## Type

`object`

## Description

Object containing all HTTP request headers.

## Examples

### Access Headers

```javascript
get('/api/data', (req, res) => {
  console.log(req.headers['user-agent']);
  console.log(req.headers['content-type']);
  console.log(req.headers['authorization']);
  
  res.json({ headers: req.headers });
});
```

### Authentication

```javascript
get('/protected', (req, res) => {
  const auth = req.headers['authorization'];
  
  if (!auth) {
    return res.status(401).json({ 
      error: 'No authorization header' 
    });
  }
  
  const token = auth.split(' ')[1];
  res.json({ token });
});
```

### Content Type

```javascript
post('/api/data', async (req, res) => {
  const contentType = req.headers['content-type'];
  
  if (contentType?.includes('application/json')) {
    const data = await req.json();
    res.json({ data });
  } else {
    const text = await req.text();
    res.send(text);
  }
});
```

## Common Headers

- `user-agent` - Client identification
- `content-type` - Body format
- `authorization` - Auth credentials
- `accept` - Accepted response types
- `cookie` - Browser cookies

## Notes

- All header names lowercase
- Read-only object
- Case-insensitive access

## See Also

- [res.header()](../response/header.md) - Set response headers

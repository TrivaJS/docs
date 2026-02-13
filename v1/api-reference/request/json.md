# req.json()

Parse request body as JSON.

## Signature

```javascript
async req.json(): Promise<any>
```

## Returns

`Promise<any>` - Parsed JSON data

## Examples

### Basic Usage

```javascript
post('/api/users', async (req, res) => {
  const body = await req.json();
  
  console.log(body);
  // { name: 'John', email: 'john@example.com' }
  
  res.status(201).json({ user: body });
});
```

### With Error Handling

```javascript
post('/api/data', async (req, res) => {
  try {
    const data = await req.json();
    res.json({ data });
  } catch (error) {
    res.status(400).json({ 
      error: 'Invalid JSON' 
    });
  }
});
```

### With Validation

```javascript
post('/api/users', async (req, res) => {
  const body = await req.json();
  
  if (!body.email || !body.password) {
    return res.status(400).json({
      error: 'Email and password required'
    });
  }
  
  res.status(201).json({ user: body });
});
```

## Notes

- Only for POST, PUT, PATCH requests
- Throws error if JSON invalid
- Content-Type should be application/json
- Returns promise - must await

## See Also

- [req.text()](text.md) - Parse as text
- [Routing Guide](../../guides/routing.md)

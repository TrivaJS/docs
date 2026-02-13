# res.status()

Set HTTP status code.

## Signature

```javascript
res.status(code: number): Response
```

## Parameters

- `code` (number) - HTTP status code

## Returns

`Response` - Chainable response object

## Examples

### With json()

```javascript
post('/api/users', (req, res) => {
  res.status(201).json({ created: true });
});
```

### Error Codes

```javascript
get('/api/users/:id', (req, res) => {
  const user = findUser(req.params.id);
  
  if (!user) {
    return res.status(404).json({ 
      error: 'User not found' 
    });
  }
  
  res.json({ user });
});
```

### No Content

```javascript
del('/api/users/:id', (req, res) => {
  deleteUser(req.params.id);
  res.status(204).send();
});
```

## Common Status Codes

- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Notes

- Chainable method
- Default is 200
- Must be called before json()/send()

## See Also

- [res.json()](json.md)
- [res.send()](send.md)

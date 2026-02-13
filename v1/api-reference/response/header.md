# res.header()

Set response header.

## Signature

```javascript
res.header(name: string, value: string): Response
```

## Parameters

- `name` (string) - Header name
- `value` (string) - Header value

## Returns

`Response` - Chainable response object

## Examples

### Single Header

```javascript
get('/api/data', (req, res) => {
  res.header('X-Custom-Header', 'value');
  res.json({ data: [] });
});
```

### Multiple Headers

```javascript
get('/api/secure', (req, res) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.json({ secure: true });
});
```

### Cache Control

```javascript
get('/api/static', (req, res) => {
  res.header('Cache-Control', 'public, max-age=31536000');
  res.json({ data: 'static' });
});
```

## Notes

- Chainable method
- Call before json()/send()
- Case-insensitive header names

## See Also

- [req.headers](../request/headers.md) - Read headers

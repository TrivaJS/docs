# res.send()

Send text response.

## Signature

```javascript
res.send(data: string): void
```

## Parameters

- `data` (string) - Text to send

## Examples

### Basic Usage

```javascript
get('/health', (req, res) => {
  res.send('OK');
});
```

### HTML

```javascript
get('/', (req, res) => {
  res.send('<h1>Hello World</h1>');
});
```

### Plain Text

```javascript
get('/robots.txt', (req, res) => {
  res.send('User-agent: *\nDisallow: /admin/');
});
```

## Notes

- Sets Content-Type: text/plain by default
- Ends response automatically
- For JSON use res.json() instead

## See Also

- [res.json()](json.md) - Send JSON

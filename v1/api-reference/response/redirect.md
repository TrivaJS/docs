# res.redirect()

Redirect to another URL.

## Signature

```javascript
res.redirect(url: string): void
```

## Parameters

- `url` (string) - Destination URL

## Examples

### Basic Redirect

```javascript
get('/old-url', (req, res) => {
  res.redirect('/new-url');
});
```

### With Status Code

```javascript
get('/moved', (req, res) => {
  res.status(301).redirect('/new-location');
});
```

### External Redirect

```javascript
get('/external', (req, res) => {
  res.redirect('https://example.com');
});
```

## Status Codes

- `301` - Permanent redirect (cached)
- `302` - Temporary redirect (default)
- `307` - Temporary (preserves method)
- `308` - Permanent (preserves method)

## Notes

- Default status is 302
- Ends response automatically
- Chainable with status()

## See Also

- [Auto-Redirect Guide](../../middleware/auto-redirect.md)

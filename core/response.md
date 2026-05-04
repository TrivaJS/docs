# Response

Triva extends the native Node response with chainable helpers.

## Common Helpers

```javascript
app.get('/helpers', (req, res) => {
  res.status(200).json({ ok: true });
});
```

- `res.status(code)`
- `res.header(name, value)`
- `res.json(data)`
- `res.send(data)`
- `res.html(html)`
- `res.redirect(url, code?)`
- `res.sendFile(filepath, options?)`
- `res.download(filepath, filename?)`
- `res.cookie(name, value, options?)`
- `res.clearCookie(name, options?)`

## JSON

```javascript
app.get('/api/status', (req, res) => {
  res.json({ healthy: true, at: new Date().toISOString() });
});
```

## Plain Text or HTML

```javascript
app.get('/hello', (req, res) => {
  res.send('Hello from Triva');
});

app.get('/page', (req, res) => {
  res.html('<h1>Triva</h1>');
});
```

## Redirects

```javascript
app.get('/old-path', (req, res) => {
  res.redirect('/new-path', 301);
});
```

## Files

```javascript
app.get('/download', (req, res) => {
  res.sendFile('./reports/latest.json');
});
```

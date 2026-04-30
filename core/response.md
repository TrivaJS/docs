# Response Object

Triva attaches response helpers to the native Node.js response object before your route handler runs.

## `res.status(code)`

```javascript
app.get('/missing', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});
```

## `res.header(name, value)`

```javascript
app.get('/headers', (req, res) => {
  res.header('X-Trace-Id', 'abc123').json({ ok: true });
});
```

## `res.json(data)`

```javascript
app.get('/users', (req, res) => {
  res.json([{ id: 1, name: 'Alice' }]);
});
```

## `res.send(data)`

`res.send()` is convenient for plain text and also auto-detects simple HTML strings.

```javascript
app.get('/', (req, res) => {
  res.send('Hello from Triva');
});
```

## `res.html(html)`

```javascript
app.get('/landing', (req, res) => {
  res.html('<h1>Triva</h1>');
});
```

## `res.redirect(url, code?)`

Pass the status code as the second argument.

```javascript
app.get('/legacy', (req, res) => {
  res.redirect('/new-location', 301);
});
```

## `res.jsonp(data, callbackParam?)`

```javascript
app.get('/feed', (req, res) => {
  res.jsonp({ ok: true });
});
```

## `res.download(filepath, filename?)`

```javascript
app.get('/reports/latest', (req, res) => {
  res.download('./reports/latest.pdf');
});
```

## `res.sendFile(filepath, options?)`

```javascript
app.get('/docs', (req, res) => {
  res.sendFile('./public/index.html');
});
```

## `res.render(view, locals?, callback?)`

`res.render()` requires a registered engine and the related app settings.

```javascript
import ejs from 'ejs';

app.engine('ejs', ejs.renderFile);
app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});
```

## `res.end(data?)`

```javascript
app.get('/empty', (req, res) => {
  res.status(204).end();
});
```

## Common Patterns

### Created Resource

```javascript
app.post('/users', async (req, res) => {
  const body = await req.json();
  res.status(201).json({ id: Date.now(), ...body });
});
```

### Validation Failure

```javascript
app.post('/login', async (req, res) => {
  const body = await req.json();

  if (!body.email || !body.password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  res.json({ ok: true });
});
```

## Related Docs

- [Request Object](https://docs.trivajs.com/core/request)
- [Routing](https://docs.trivajs.com/core/routing)
- [API Reference](https://docs.trivajs.com/core/api)

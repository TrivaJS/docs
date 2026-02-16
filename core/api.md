# API Reference

## Application

### new Triva(options)

```javascript
const app = new Triva({ logging: { enabled: true } });
```

### app.listen(port, callback)

```javascript
app.listen(3000);
```

### app.use(middleware)

```javascript
app.use((req, res, next) => next());
```

## Routes

### app.get(path, ...handlers)
### app.post(path, ...handlers)
### app.put(path, ...handlers)
### app.delete(path, ...handlers)
### app.patch(path, ...handlers)
### app.all(path, ...handlers)

```javascript
app.get('/users', (req, res) => res.json([]));
app.post('/users', (req, res) => res.json(req.body));
```

## Request

- `req.method` - HTTP method
- `req.url` - URL path
- `req.headers` - Headers object
- `req.query` - Query parameters
- `req.params` - Route parameters
- `req.body` - Parsed body

[Request Details](https://docs.trivajs.com/core/request)

## Response

- `res.json(data)` - Send JSON
- `res.send(text)` - Send text
- `res.status(code)` - Set status
- `res.redirect(url)` - Redirect
- `res.setHeader(name, value)` - Set header

[Response Details](https://docs.trivajs.com/core/response)

## Cache

- `app.cache.set(key, value, ttl)`
- `app.cache.get(key)`
- `app.cache.delete(key)`
- `app.cache.clear()`
- `app.cache.keys(pattern)`

## Database

- `app.database.insert(collection, data)`
- `app.database.find(collection, query)`
- `app.database.update(collection, query, data)`
- `app.database.delete(collection, query)`

[Database Guide](https://docs.trivajs.com/database/overview)

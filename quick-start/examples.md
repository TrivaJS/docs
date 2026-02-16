# Quick Examples

## 1. Basic REST API

```javascript
const Triva = require('triva');
const app = new Triva();

let users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];

app.get('/api/users', (req, res) => res.json(users));
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  user ? res.json(user) : res.status(404).json({ error: 'Not found' });
});
app.post('/api/users', (req, res) => {
  const user = { id: users.length + 1, ...req.body };
  users.push(user);
  res.status(201).json(user);
});

app.listen(3000);
```

## 2. Middleware Chain

```javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/private', authMiddleware, (req, res) => {
  res.json({ message: 'Private data' });
});
```

## 3. Database Integration

```javascript
const app = new Triva({
  database: {
    adapter: 'mongodb',
    url: 'mongodb://localhost:27017/myapp'
  }
});

app.get('/api/posts', async (req, res) => {
  const posts = await app.database.find('posts', {});
  res.json(posts);
});
```

## 4. Caching

```javascript
const app = new Triva({
  cache: { adapter: 'redis' }
});

app.get('/api/data', async (req, res) => {
  const cached = await app.cache.get('key');
  if (cached) return res.json({ data: cached, cached: true });
  
  const data = { timestamp: Date.now() };
  await app.cache.set('key', data, 300);
  res.json({ data, cached: false });
});
```

## 5. HTTPS Server

```javascript
const fs = require('fs');
const app = new Triva({
  https: {
    enabled: true,
    key: fs.readFileSync('./ssl/key.pem'),
    cert: fs.readFileSync('./ssl/cert.pem')
  }
});

app.listen(443);
```

[More Examples](https://docs.trivajs.com/examples/rest-api)

# First Server Tutorial

Build your first Triva server step by step.

## Step 1: Create Project

```bash
mkdir my-triva-app
cd my-triva-app
npm init -y
npm install triva
```

## Step 2: Create Server File

Create `server.js`:

```javascript
const Triva = require('triva');
const app = new Triva();

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Triva!' });
});

app.listen(3000);
console.log('Server running on http://localhost:3000');
```

## Step 3: Run

```bash
node server.js
```

## Step 4: Add More Routes

```javascript
app.get('/', (req, res) => {
  res.json({ message: 'GET request' });
});

app.post('/data', (req, res) => {
  res.json({ body: req.body });
});

app.get('/users/:id', (req, res) => {
  res.json({ userId: req.params.id });
});
```

## Next Steps

- [Examples](https://docs.trivajs.com/quick-start/examples)
- [Routing](https://docs.trivajs.com/core/routing)

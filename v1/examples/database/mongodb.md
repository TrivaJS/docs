# MongoDB Example

Complete MongoDB integration with Triva.

## Installation

```bash
npm install mongodb
```

## Using Triva's MongoDB Adapter

```javascript
import { build, get, post, cache, listen } from 'triva';

await build({
  cache: {
    type: 'mongodb',
    database: {
      uri: 'mongodb://localhost:27017/triva'
    }
  }
});

// Use cache API
post('/api/data', async (req, res) => {
  const data = await req.json();
  await cache.set(`data:${data.id}`, data);
  res.status(201).json({ data });
});

get('/api/data/:id', async (req, res) => {
  const data = await cache.get(`data:${req.params.id}`);
  if (!data) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json({ data });
});

listen(3000);
```

## Direct MongoDB Usage

Complete CRUD API with MongoDB:

```javascript
import { build, get, post, put, del, listen } from 'triva';
import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient('mongodb://localhost:27017');
await client.connect();
const db = client.db('myapp');
const users = db.collection('users');

await build({ cache: { type: 'memory' } });

// CREATE
post('/api/users', async (req, res) => {
  const user = await req.json();
  const result = await users.insertOne({
    ...user,
    createdAt: new Date()
  });
  res.status(201).json({ id: result.insertedId, ...user });
});

// READ
get('/api/users', async (req, res) => {
  const userList = await users.find().toArray();
  res.json({ users: userList });
});

get('/api/users/:id', async (req, res) => {
  const user = await users.findOne({ _id: new ObjectId(req.params.id) });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// UPDATE
put('/api/users/:id', async (req, res) => {
  const updates = await req.json();
  const result = await users.findOneAndUpdate(
    { _id: new ObjectId(req.params.id) },
    { $set: updates },
    { returnDocument: 'after' }
  );
  if (!result.value) return res.status(404).json({ error: 'Not found' });
  res.json({ user: result.value });
});

// DELETE
del('/api/users/:id', async (req, res) => {
  const result = await users.deleteOne({ _id: new ObjectId(req.params.id) });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

listen(3000);
```

---

**[Back to Examples](../README.md)**

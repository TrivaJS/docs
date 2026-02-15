# PostgreSQL Example

PostgreSQL integration with Triva.

## Using Triva's PostgreSQL Adapter

```javascript
import { build, get, post, cache, listen } from 'triva';

await build({
  cache: {
    type: 'postgresql',
    database: {
      host: 'localhost',
      port: 5432,
      database: 'myapp',
      user: 'postgres',
      password: process.env.PG_PASSWORD
    }
  }
});

// Use cache API
post('/api/cache', async (req, res) => {
  const data = await req.json();
  await cache.set(data.key, data.value, 600000);
  res.json({ cached: true });
});

listen(3000);
```

## Direct PostgreSQL Usage

```javascript
import { build, get, post, listen } from 'triva';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  host: 'localhost',
  database: 'myapp',
  user: 'postgres',
  password: process.env.PG_PASSWORD
});

await build({ cache: { type: 'memory' } });

// CREATE
post('/api/users', async (req, res) => {
  const { name, email } = await req.json();
  
  const result = await pool.query(
    'INSERT INTO users (name, email, created_at) VALUES ($1, $2, NOW()) RETURNING *',
    [name, email]
  );
  
  res.status(201).json({ user: result.rows[0] });
});

// READ
get('/api/users', async (req, res) => {
  const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
  res.json({ users: result.rows });
});

get('/api/users/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({ user: result.rows[0] });
});

listen(3000);
```

---

**[Back to Examples](../README.md)**

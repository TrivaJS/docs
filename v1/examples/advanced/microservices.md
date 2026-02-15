# Microservices Example

Build a microservices architecture with Triva.

## Service Architecture

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│   Gateway   │───▶│ User Service │    │ Order Service│
│  (Port 3000)│    │ (Port 3001)  │    │ (Port 3002)  │
└─────────────┘    └──────────────┘    └──────────────┘
```

## Gateway Service

```javascript
// gateway.js
import { build, get, post, listen } from 'triva';

await build({ 
  cache: { 
    type: 'redis', 
    database: { host: 'localhost' } 
  } 
});

// Proxy to user service
get('/api/users/:id', async (req, res) => {
  const response = await fetch(`http://localhost:3001/users/${req.params.id}`);
  const data = await response.json();
  res.json(data);
});

// Proxy to order service
get('/api/orders/:id', async (req, res) => {
  const response = await fetch(`http://localhost:3002/orders/${req.params.id}`);
  const data = await response.json();
  res.json(data);
});

// Aggregate data from multiple services
get('/api/users/:id/complete', async (req, res) => {
  const [user, orders] = await Promise.all([
    fetch(`http://localhost:3001/users/${req.params.id}`).then(r => r.json()),
    fetch(`http://localhost:3002/orders/user/${req.params.id}`).then(r => r.json())
  ]);
  
  res.json({ user, orders });
});

listen(3000);
console.log('🌐 Gateway running on port 3000');
```

## User Service

```javascript
// user-service.js
import { build, get, post, put, del, listen, cache } from 'triva';

await build({ 
  cache: { 
    type: 'mongodb', 
    database: { uri: 'mongodb://localhost:27017/users' } 
  } 
});

// CREATE user
post('/users', async (req, res) => {
  const user = await req.json();
  const id = Date.now().toString();
  
  const newUser = {
    id,
    ...user,
    createdAt: new Date().toISOString()
  };
  
  await cache.set(`user:${id}`, newUser);
  res.status(201).json({ user: newUser });
});

// GET user
get('/users/:id', async (req, res) => {
  const user = await cache.get(`user:${req.params.id}`);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({ user });
});

// GET all users
get('/users', async (req, res) => {
  const keys = await cache.keys('user:*');
  const users = await Promise.all(keys.map(k => cache.get(k)));
  res.json({ users: users.filter(Boolean) });
});

// UPDATE user
put('/users/:id', async (req, res) => {
  const user = await cache.get(`user:${req.params.id}`);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const updates = await req.json();
  const updated = {
    ...user,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await cache.set(`user:${req.params.id}`, updated);
  res.json({ user: updated });
});

// DELETE user
del('/users/:id', async (req, res) => {
  await cache.delete(`user:${req.params.id}`);
  res.status(204).send();
});

listen(3001);
console.log('👤 User service running on port 3001');
```

## Order Service

```javascript
// order-service.js
import { build, get, post, listen, cache } from 'triva';

await build({ 
  cache: { 
    type: 'postgresql', 
    database: { 
      host: 'localhost',
      database: 'orders',
      user: 'postgres',
      password: process.env.PG_PASSWORD
    } 
  } 
});

// CREATE order
post('/orders', async (req, res) => {
  const order = await req.json();
  const id = Date.now().toString();
  
  const newOrder = {
    id,
    ...order,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  await cache.set(`order:${id}`, newOrder);
  await cache.set(`order:user:${order.userId}:${id}`, newOrder);
  
  res.status(201).json({ order: newOrder });
});

// GET order
get('/orders/:id', async (req, res) => {
  const order = await cache.get(`order:${req.params.id}`);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  res.json({ order });
});

// GET orders by user
get('/orders/user/:userId', async (req, res) => {
  const keys = await cache.keys(`order:user:${req.params.userId}:*`);
  const orders = await Promise.all(keys.map(k => cache.get(k)));
  res.json({ orders: orders.filter(Boolean) });
});

listen(3002);
console.log('📦 Order service running on port 3002');
```

## Run All Services

```bash
# Terminal 1 - User Service
node user-service.js

# Terminal 2 - Order Service
node order-service.js

# Terminal 3 - Gateway
node gateway.js
```

## Testing

```bash
# Create user via gateway
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# Create order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":"123","product":"Laptop","amount":999}'

# Get complete user data (aggregated)
curl http://localhost:3000/api/users/123/complete
```

## Service Discovery

```javascript
// service-registry.js
const services = new Map();

export function register(name, url) {
  services.set(name, url);
}

export function discover(name) {
  return services.get(name);
}

// In gateway
import { discover } from './service-registry.js';

get('/api/users/:id', async (req, res) => {
  const userServiceUrl = discover('users');
  const response = await fetch(`${userServiceUrl}/users/${req.params.id}`);
  const data = await response.json();
  res.json(data);
});
```

## Health Checks

```javascript
// In each service
get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'user-service',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// In gateway - check all services
get('/health/all', async (req, res) => {
  const checks = await Promise.all([
    fetch('http://localhost:3001/health').then(r => r.json()),
    fetch('http://localhost:3002/health').then(r => r.json())
  ]);
  
  res.json({
    gateway: 'healthy',
    services: checks
  });
});
```

## Error Handling

```javascript
// In gateway - handle service failures
get('/api/users/:id', async (req, res) => {
  try {
    const response = await fetch(`http://localhost:3001/users/${req.params.id}`);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: 'User service error' 
      });
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('User service unavailable:', error);
    res.status(503).json({ 
      error: 'User service unavailable',
      message: 'Please try again later'
    });
  }
});
```

---

**[Back to Examples](../README.md)**

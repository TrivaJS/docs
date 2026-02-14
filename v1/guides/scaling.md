# Scaling Guide

Horizontal and vertical scaling strategies for Triva applications.

## Table of Contents

- [Vertical Scaling](#vertical-scaling)
- [Horizontal Scaling](#horizontal-scaling)
- [Load Balancing](#load-balancing)
- [Database Scaling](#database-scaling)
- [Caching Strategy](#caching-strategy)

---

## Vertical Scaling

### Increase Resources

**CPU**:
```bash
# Use all available cores
node --max-old-space-size=4096 server.js
```

**Memory**:
```javascript
// Increase Node.js heap
node --max-old-space-size=8192 server.js  // 8GB
```

### Node.js Clustering

```javascript
import cluster from 'cluster';
import os from 'os';
import { build, get, listen } from 'triva';

if (cluster.isPrimary) {
  const cpus = os.cpus().length;
  console.log(`Master process ${process.pid} starting ${cpus} workers`);
  
  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died, starting new worker`);
    cluster.fork();
  });
} else {
  // Worker process
  await build({
    cache: {
      type: 'redis',  // Shared cache across workers
      database: {
        host: 'localhost',
        port: 6379
      }
    }
  });
  
  get('/', (req, res) => {
    res.json({ 
      worker: process.pid,
      message: 'Hello from worker'
    });
  });
  
  listen(3000);
  console.log(`Worker ${process.pid} started`);
}
```

---

## Horizontal Scaling

### Multiple Servers

Deploy identical instances:

```
┌─────────────┐
│Load Balancer│
└──────┬──────┘
       │
   ┌───┴───┬───────┬───────┐
   │       │       │       │
┌──▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐
│App 1│ │App 2│ │App 3│ │App 4│
└──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘
   │       │       │       │
   └───────┴───┬───┴───────┘
               │
         ┌─────▼─────┐
         │   Redis   │
         └───────────┘
```

### Session Management

**Use Redis for shared sessions**:

```javascript
import session from '@triva/session';

use(session({
  store: 'redis',
  redis: {
    host: process.env.REDIS_HOST,
    port: 6379
  }
}));
```

### Sticky Sessions

Configure load balancer for sticky sessions if needed:

**nginx**:
```nginx
upstream backend {
    ip_hash;  # Sticky sessions
    server app1.example.com:3000;
    server app2.example.com:3000;
    server app3.example.com:3000;
}
```

---

## Load Balancing

### nginx Configuration

```nginx
http {
    upstream triva_backend {
        least_conn;  # Load balancing method
        
        server app1.example.com:3000 weight=3;
        server app2.example.com:3000 weight=2;
        server app3.example.com:3000 weight=1;
        server app4.example.com:3000 backup;  # Failover
    }
    
    server {
        listen 80;
        server_name example.com;
        
        location / {
            proxy_pass http://triva_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_cache_bypass $http_upgrade;
        }
        
        # Health check
        location /health {
            proxy_pass http://triva_backend/health;
            access_log off;
        }
    }
}
```

### HAProxy Configuration

```
frontend http_front
    bind *:80
    default_backend triva_servers

backend triva_servers
    balance roundrobin
    option httpchk GET /health
    
    server app1 app1.example.com:3000 check
    server app2 app2.example.com:3000 check
    server app3 app3.example.com:3000 check
    server app4 app4.example.com:3000 check backup
```

---

## Database Scaling

### Read Replicas

```javascript
// Write to primary
const primaryDb = createConnection({
  host: 'primary.db.example.com',
  port: 5432
});

// Read from replicas
const replicaDb = createConnection({
  host: 'replica.db.example.com',
  port: 5432
});

// Write operations
post('/api/users', async (req, res) => {
  const user = await primaryDb.users.create(req.body);
  res.status(201).json({ user });
});

// Read operations
get('/api/users', async (req, res) => {
  const users = await replicaDb.users.findAll();
  res.json({ users });
});
```

### Database Connection Pooling

```javascript
await build({
  cache: {
    type: 'postgresql',
    database: {
      host: 'localhost',
      port: 5432,
      max: 20,              // Pool size
      min: 5,               // Min connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    }
  }
});
```

---

## Caching Strategy

### Multi-Level Cache

```javascript
// L1: Application memory (fastest)
const memCache = new Map();

// L2: Redis (fast, shared)
// L3: Database (slowest)

async function getData(key) {
  // Try L1
  if (memCache.has(key)) {
    return memCache.get(key);
  }
  
  // Try L2 (Redis)
  let data = await cache.get(key);
  
  if (!data) {
    // L3 - Database
    data = await db.query(key);
    
    // Populate L2
    await cache.set(key, data, 300000);
  }
  
  // Populate L1
  memCache.set(key, data);
  setTimeout(() => memCache.delete(key), 60000);
  
  return data;
}
```

### Cache Invalidation

```javascript
// Update data
post('/api/users/:id', async (req, res) => {
  const user = await db.users.update(req.params.id, req.body);
  
  // Invalidate cache
  await cache.delete(`user:${req.params.id}`);
  await cache.delete('users:all');
  
  res.json({ user });
});
```

---

## Monitoring at Scale

### Health Checks

```javascript
get('/health', async (req, res) => {
  const checks = {
    server: 'ok',
    cache: 'unknown',
    database: 'unknown'
  };
  
  try {
    await cache.set('health', '1', 1000);
    checks.cache = 'ok';
  } catch (e) {
    checks.cache = 'error';
  }
  
  try {
    await db.ping();
    checks.database = 'ok';
  } catch (e) {
    checks.database = 'error';
  }
  
  const allOk = Object.values(checks).every(v => v === 'ok');
  res.status(allOk ? 200 : 503).json(checks);
});
```

### Metrics Endpoint

```javascript
const metrics = {
  requests: 0,
  errors: 0,
  workers: cluster.isPrimary ? os.cpus().length : 1
};

get('/metrics', (req, res) => {
  res.json({
    ...metrics,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid
  });
});
```

---

## Auto-Scaling

### AWS Auto Scaling

**Launch Template**:
```yaml
Resources:
  LaunchTemplate:
    Type: AWS::EC2::LaunchTemplate
    Properties:
      LaunchTemplateName: triva-app
      LaunchTemplateData:
        ImageId: ami-xxxxx
        InstanceType: t3.medium
        UserData:
          Fn::Base64: !Sub |
            #!/bin/bash
            cd /app
            npm start
```

**Auto Scaling Group**:
```yaml
AutoScalingGroup:
  Type: AWS::AutoScaling::AutoScalingGroup
  Properties:
    MinSize: 2
    MaxSize: 10
    DesiredCapacity: 4
    TargetGroupARNs:
      - !Ref TargetGroup
    LaunchTemplate:
      LaunchTemplateId: !Ref LaunchTemplate
      Version: $Latest
```

---

## Best Practices

### 1. Use Distributed Cache

```javascript
// ✅ Good - Redis (shared across servers)
cache: { type: 'redis' }

// ❌ Bad - Memory (not shared)
cache: { type: 'memory' }
```

### 2. Stateless Application

```javascript
// ✅ Good - state in database/cache
const user = await cache.get(`session:${sessionId}`);

// ❌ Bad - state in memory
const sessions = {};  // Lost on restart
```

### 3. Health Checks

```javascript
// Implement proper health checks
get('/health', async (req, res) => {
  // Check dependencies
  const healthy = await checkDependencies();
  res.status(healthy ? 200 : 503).json({ healthy });
});
```

### 4. Graceful Shutdown

```javascript
const server = listen(3000);

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
```

---

**Next**: [Performance Guide](performance.md) | [Monitoring Guide](monitoring.md)

# Advanced Rate Limiting

Custom rate limiting strategies beyond built-in throttling.

## Per-User Rate Limiting

```javascript
import { build, get, use, listen, cache } from 'triva';

await build({ 
  cache: { 
    type: 'redis', 
    database: { host: 'localhost' } 
  } 
});

async function rateLimitByUser(req, res, next) {
  const userId = req.user?.id || 'anonymous';
  const key = `ratelimit:user:${userId}`;
  
  const count = await cache.get(key) || 0;
  const limit = userId === 'anonymous' ? 10 : 100;
  
  if (count >= limit) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      retryAfter: 60
    });
  }
  
  await cache.set(key, count + 1, 60000); // 1 minute window
  
  res.header('X-RateLimit-Limit', limit);
  res.header('X-RateLimit-Remaining', limit - count - 1);
  
  next();
}

use(rateLimitByUser);

get('/api/data', (req, res) => {
  res.json({ data: [] });
});

listen(3000);
```

## Token Bucket Algorithm

```javascript
import { cache } from 'triva';

class TokenBucket {
  constructor(capacity, refillRate, cacheKey) {
    this.capacity = capacity;
    this.refillRate = refillRate; // tokens per second
    this.cacheKey = cacheKey;
  }
  
  async consume(tokens = 1) {
    const bucket = await cache.get(this.cacheKey) || {
      tokens: this.capacity,
      lastRefill: Date.now()
    };
    
    await this.refill(bucket);
    
    if (bucket.tokens >= tokens) {
      bucket.tokens -= tokens;
      await cache.set(this.cacheKey, bucket, 3600000); // 1 hour
      return { allowed: true, remaining: bucket.tokens };
    }
    
    await cache.set(this.cacheKey, bucket, 3600000);
    return { allowed: false, remaining: bucket.tokens };
  }
  
  async refill(bucket) {
    const now = Date.now();
    const elapsed = (now - bucket.lastRefill) / 1000;
    const tokensToAdd = elapsed * this.refillRate;
    
    bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }
}

// Middleware
async function tokenBucketLimit(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const bucket = new TokenBucket(100, 10, `bucket:${ip}`); // 100 capacity, 10/sec refill
  
  const result = await bucket.consume(1);
  
  if (!result.allowed) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      remaining: Math.floor(result.remaining)
    });
  }
  
  res.header('X-RateLimit-Remaining', Math.floor(result.remaining));
  next();
}

use(tokenBucketLimit);
```

## Sliding Window Rate Limiter

```javascript
async function slidingWindowLimit(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const limit = 100;
  
  const key = `sliding:${ip}`;
  const requests = await cache.get(key) || [];
  
  // Remove old requests outside the window
  const validRequests = requests.filter(timestamp => 
    now - timestamp < windowMs
  );
  
  if (validRequests.length >= limit) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded' 
    });
  }
  
  // Add current request
  validRequests.push(now);
  await cache.set(key, validRequests, windowMs);
  
  res.header('X-RateLimit-Remaining', limit - validRequests.length);
  next();
}
```

## Endpoint-Specific Limits

```javascript
const limits = {
  '/api/search': { limit: 10, window: 60000 },
  '/api/upload': { limit: 5, window: 60000 },
  '/api/data': { limit: 100, window: 60000 }
};

async function endpointRateLimit(req, res, next) {
  const config = limits[req.pathname] || { limit: 50, window: 60000 };
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const key = `limit:${req.pathname}:${ip}`;
  
  const count = await cache.get(key) || 0;
  
  if (count >= config.limit) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded for this endpoint' 
    });
  }
  
  await cache.set(key, count + 1, config.window);
  
  res.header('X-RateLimit-Limit', config.limit);
  res.header('X-RateLimit-Remaining', config.limit - count - 1);
  
  next();
}

use(endpointRateLimit);
```

## Concurrent Request Limiting

```javascript
const activeRequests = new Map();

async function concurrentLimit(maxConcurrent = 10) {
  return async (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const count = activeRequests.get(ip) || 0;
    
    if (count >= maxConcurrent) {
      return res.status(429).json({ 
        error: 'Too many concurrent requests' 
      });
    }
    
    activeRequests.set(ip, count + 1);
    
    res.on('finish', () => {
      const current = activeRequests.get(ip) || 1;
      activeRequests.set(ip, current - 1);
      
      if (current - 1 === 0) {
        activeRequests.delete(ip);
      }
    });
    
    next();
  };
}

use(concurrentLimit(5)); // Max 5 concurrent requests per IP
```

## Cost-Based Rate Limiting

```javascript
// Different operations have different costs
const costs = {
  'GET /api/data': 1,
  'POST /api/data': 5,
  'POST /api/upload': 10,
  'GET /api/heavy-computation': 20
};

async function costBasedLimit(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const operation = `${req.method} ${req.pathname}`;
  const cost = costs[operation] || 1;
  const budget = 100; // Total budget per window
  const windowMs = 60000;
  
  const key = `cost:${ip}`;
  const spent = await cache.get(key) || 0;
  
  if (spent + cost > budget) {
    return res.status(429).json({ 
      error: 'Budget exceeded',
      spent,
      budget
    });
  }
  
  await cache.set(key, spent + cost, windowMs);
  
  res.header('X-Budget-Remaining', budget - spent - cost);
  next();
}

use(costBasedLimit);
```

## Distributed Rate Limiting

```javascript
import { cache } from 'triva';

class DistributedRateLimiter {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
  }
  
  async check(identifier) {
    const key = `ratelimit:${identifier}`;
    
    // Use Redis INCR for atomic increment
    const count = await cache.get(key) || 0;
    
    if (count >= this.limit) {
      return { 
        allowed: false, 
        remaining: 0,
        resetAt: await this.getResetTime(key)
      };
    }
    
    const newCount = count + 1;
    await cache.set(key, newCount, this.windowMs);
    
    return { 
      allowed: true, 
      remaining: this.limit - newCount,
      resetAt: await this.getResetTime(key)
    };
  }
  
  async getResetTime(key) {
    // This would need TTL support from the cache adapter
    return Date.now() + this.windowMs;
  }
}

const limiter = new DistributedRateLimiter(100, 60000);

use(async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const result = await limiter.check(ip);
  
  if (!result.allowed) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      resetAt: new Date(result.resetAt).toISOString()
    });
  }
  
  res.header('X-RateLimit-Remaining', result.remaining);
  res.header('X-RateLimit-Reset', result.resetAt);
  
  next();
});
```

## Adaptive Rate Limiting

```javascript
class AdaptiveRateLimiter {
  constructor() {
    this.baseLimit = 100;
    this.errorThreshold = 0.1; // 10% error rate
  }
  
  async check(identifier) {
    const key = `adaptive:${identifier}`;
    const stats = await cache.get(key) || {
      requests: 0,
      errors: 0,
      limit: this.baseLimit
    };
    
    // Calculate error rate
    const errorRate = stats.requests > 0 
      ? stats.errors / stats.requests 
      : 0;
    
    // Adjust limit based on error rate
    if (errorRate > this.errorThreshold) {
      stats.limit = Math.max(10, stats.limit * 0.5); // Reduce by 50%
    } else if (errorRate < this.errorThreshold / 2) {
      stats.limit = Math.min(this.baseLimit, stats.limit * 1.1); // Increase by 10%
    }
    
    if (stats.requests >= stats.limit) {
      return { allowed: false };
    }
    
    stats.requests++;
    await cache.set(key, stats, 60000);
    
    return { allowed: true, currentLimit: stats.limit };
  }
  
  async recordError(identifier) {
    const key = `adaptive:${identifier}`;
    const stats = await cache.get(key) || { requests: 0, errors: 0, limit: this.baseLimit };
    stats.errors++;
    await cache.set(key, stats, 60000);
  }
}
```

## Testing

```bash
# Test rate limit
for i in {1..110}; do
  curl http://localhost:3000/api/data
done

# Check headers
curl -I http://localhost:3000/api/data

# Expected headers:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 99
```

---

**[Back to Examples](../README.md)**

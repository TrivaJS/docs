# Throttling Middleware

Complete guide to Triva's rate limiting and DDoS protection system.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [How It Works](#how-it-works)
- [Advanced Usage](#advanced-usage)
- [Bot Detection](#bot-detection)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Overview

The throttling middleware provides:

- **Sliding Window Rate Limiting** - Smooth request distribution
- **Burst Protection** - Prevent sudden traffic spikes
- **Automatic IP Banning** - Block repeat offenders
- **Bot Detection** - Identify and handle automated traffic
- **Real-time Analytics** - Track violations and bans

### Why Rate Limiting?

```javascript
// Without throttling
❌ Server overwhelmed by requests
❌ Legitimate users affected
❌ High resource costs
❌ Service degradation

// With throttling
✅ Fair resource distribution
✅ DDoS protection
✅ Cost control
✅ Service stability
```

---

## Quick Start

### Basic Setup

```javascript
import { build } from 'triva';

await build({
  throttle: {
    limit: 100,              // Max 100 requests
    window_ms: 60000,        // Per 60 seconds (1 minute)
    burst_limit: 20,         // Max 20 requests in burst
    ban_threshold: 5,        // Ban after 5 violations
    ban_ms: 86400000        // 24 hour ban
  }
});
```

### Production Example

```javascript
await build({
  throttle: {
    // Basic limits
    limit: 1000,             // 1000 req/min for normal traffic
    window_ms: 60000,
    burst_limit: 50,         // Allow 50 req bursts

    // Advanced protection
    ban_threshold: 10,       // More lenient for production
    ban_ms: 3600000,        // 1 hour ban
    ban_penalty_multiplier: 2,  // Double ban time each violation

    // Resource limits
    max_violations: 100,     // Track last 100 violations
    cleanup_interval: 300000 // Cleanup every 5 minutes
  }
});
```

---

## Configuration

### All Options

```javascript
await build({
  throttle: {
    // === Request Limits ===
    limit: number,           // Max requests per window
    window_ms: number,       // Time window in milliseconds
    burst_limit: number,     // Max requests in short burst

    // === Ban Settings ===
    ban_threshold: number,   // Violations before ban
    ban_ms: number,         // Initial ban duration
    ban_penalty_multiplier: number,  // Ban time multiplier (default: 2)

    // === Resource Management ===
    max_violations: number,  // Max violations to track
    cleanup_interval: number, // Cleanup frequency (ms)

    // === Custom Rules ===
    whitelist: string[],     // IPs to never throttle
    blacklist: string[],     // IPs to always block

    // === Bot Handling ===
    bot_multiplier: number,  // Reduce limits for bots (default: 0.5)
  }
});
```

### Option Details

#### limit
Maximum requests allowed in the time window.

```javascript
limit: 100  // Max 100 requests per window
```

**Common values:**
- **Development:** 10-50
- **Production API:** 100-1000
- **Public website:** 1000-10000

#### window_ms
Time window for rate limiting in milliseconds.

```javascript
window_ms: 60000  // 1 minute

// Common windows
const ONE_MINUTE = 60 * 1000;
const FIVE_MINUTES = 5 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;
```

#### burst_limit
Maximum requests in a very short time (1-2 seconds).

```javascript
burst_limit: 20  // Max 20 requests in quick succession
```

Prevents:
- API hammering
- Rapid-fire bots
- Accidental loops

#### ban_threshold
Number of violations before IP is banned.

```javascript
ban_threshold: 5  // Ban after 5 violations
```

**Violations occur when:**
- Exceeding request limit
- Exceeding burst limit
- Already banned but still trying

#### ban_ms
Initial ban duration in milliseconds.

```javascript
ban_ms: 86400000  // 24 hours

// Common durations
const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
```

#### ban_penalty_multiplier
Multiplier for repeat offenders.

```javascript
ban_penalty_multiplier: 2  // Double ban time each offense

// Example progression:
// 1st ban: 1 hour
// 2nd ban: 2 hours
// 3rd ban: 4 hours
// 4th ban: 8 hours
```

---

## How It Works

### Sliding Window Algorithm

```javascript
// Time window: 60 seconds
// Limit: 100 requests

Request at t=0    → Allowed (1/100)
Request at t=30   → Allowed (2/100)
Request at t=60   → Allowed (3/100, first request expired)
Request at t=90   → Allowed (4/100, second request expired)
```

The window "slides" with each request, providing smooth rate limiting.

### Burst Detection

```javascript
// Burst limit: 20 requests

t=0: 20 requests in 1 second → Burst limit hit
t=1: Additional request → BLOCKED (burst exceeded)
t=10: Request → Allowed (burst window reset)
```

### Violation Tracking

```javascript
// Ban threshold: 5

Violation 1: Warning
Violation 2: Warning
Violation 3: Warning
Violation 4: Warning
Violation 5: BANNED (ban_ms duration)

// If banned and tries again:
Violation 6: Ban extended (× multiplier)
```

### IP Identification

```javascript
// Triva extracts IP from:
1. req.socket.remoteAddress
2. req.connection.remoteAddress
3. X-Forwarded-For header (behind proxy)
4. X-Real-IP header (behind load balancer)
```

---

## Advanced Usage

### Per-Route Throttling

```javascript
import { build, use, get } from 'triva';

// Global throttle
await build({
  throttle: {
    limit: 1000,
    window_ms: 60000
  }
});

// Stricter limits for specific routes
const strictThrottle = createCustomThrottle({
  limit: 10,
  window_ms: 60000
});

get('/api/sensitive', strictThrottle, (req, res) => {
  res.json({ data: 'sensitive' });
});
```

### Whitelist Important IPs

```javascript
await build({
  throttle: {
    limit: 100,
    window_ms: 60000,
    whitelist: [
      '192.168.1.1',        // Your office
      '10.0.0.0/8',         // Internal network
      '2001:db8::1'         // IPv6 address
    ]
  }
});
```

### Blacklist Known Attackers

```javascript
await build({
  throttle: {
    limit: 100,
    window_ms: 60000,
    blacklist: [
      '203.0.113.0',
      '198.51.100.0'
    ]
  }
});
```

### Different Limits for Bots

```javascript
await build({
  throttle: {
    limit: 1000,           // Human limit
    window_ms: 60000,
    bot_multiplier: 0.1    // Bots get 100 req/min (10% of human limit)
  }
});
```

### Custom Violation Handling

```javascript
import { cache } from 'triva';

// Track violations
async function checkViolations(ip) {
  const violations = await cache.get(`violations:${ip}`);
  if (violations && violations.count > 10) {
    // Custom action: notify admin
    await notifyAdmin({
      ip,
      violations: violations.count,
      timestamp: new Date()
    });
  }
}
```

---

## Bot Detection

### User-Agent Analysis

The throttle middleware automatically detects bots:

```javascript
// Detected bot User-Agents:
- Googlebot
- Bingbot
- DuckDuckBot
- Baiduspider
- YandexBot
- facebookexternalhit
- Twitterbot
- LinkedInBot
- Slackbot
- And 50+ more...
```

### Bot Behavior

```javascript
// When bot detected:
1. Applies bot_multiplier to limits
2. Logs as bot traffic
3. Can be redirected (see auto-redirect guide)
```

### Custom Bot Detection

```javascript
function isBot(userAgent) {
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i
  ];

  return botPatterns.some(pattern => pattern.test(userAgent));
}
```

---

## Monitoring

### Accessing Throttle Data

```javascript
import { cache } from 'triva';

// Get throttle status for IP
const status = await cache.get('throttle:192.168.1.1');
console.log(status);
/*
{
  hits: [timestamps...],
  burst: [timestamps...],
  violations: 3,
  last_violation: 1676234567890,
  banned_until: null
}
*/

// Get ban status
const ban = await cache.get('ban:192.168.1.1');
console.log(ban);
/*
{
  banned_until: 1676245678901,
  violation_count: 5
}
*/
```

### Real-Time Monitoring

```javascript
import { log } from 'triva';

// Monitor throttle events
setInterval(async () => {
  const logs = await log.filter({
    throttle: { restricted: true }
  });

  console.log(`Blocked requests: ${logs.length}`);

  // Group by IP
  const byIP = logs.reduce((acc, entry) => {
    acc[entry.ip] = (acc[entry.ip] || 0) + 1;
    return acc;
  }, {});

  console.log('Top offenders:', byIP);
}, 60000);  // Every minute
```

### Metrics Collection

```javascript
class ThrottleMetrics {
  constructor() {
    this.blocked = 0;
    this.allowed = 0;
    this.banned = 0;
  }

  track(result) {
    if (result.restricted) {
      this.blocked++;
      if (result.reason === 'banned') {
        this.banned++;
      }
    } else {
      this.allowed++;
    }
  }

  report() {
    const total = this.blocked + this.allowed;
    const blockRate = (this.blocked / total * 100).toFixed(2);

    return {
      total,
      allowed: this.allowed,
      blocked: this.blocked,
      banned: this.banned,
      blockRate: `${blockRate}%`
    };
  }
}

const metrics = new ThrottleMetrics();

// Track in middleware
use((req, res, next) => {
  if (req.triva?.throttle) {
    metrics.track(req.triva.throttle);
  }
  next();
});

// Report every hour
setInterval(() => {
  console.log('Throttle Report:', metrics.report());
}, 3600000);
```

---

## Troubleshooting

### Issue: Legitimate Users Getting Blocked

**Symptoms:**
- Real users reporting 429 errors
- High block rate for normal traffic

**Solutions:**

1. **Increase limits:**
```javascript
throttle: {
  limit: 1000,        // Increase from 100
  window_ms: 60000
}
```

2. **Increase burst limit:**
```javascript
throttle: {
  burst_limit: 50    // Allow more quick requests
}
```

3. **Whitelist known IPs:**
```javascript
throttle: {
  whitelist: ['user-ip-here']
}
```

### Issue: Bots Overwhelming Server

**Symptoms:**
- High bot traffic
- Slow response times
- Resource exhaustion

**Solutions:**

1. **Reduce bot limits:**
```javascript
throttle: {
  bot_multiplier: 0.1  // 10% of normal limit
}
```

2. **Enable auto-redirect:**
```javascript
redirects: {
  enabled: true,
  redirectBots: true,
  destination: '/robots.txt'
}
```

3. **Aggressive banning:**
```javascript
throttle: {
  ban_threshold: 3,      // Ban sooner
  ban_ms: 86400000,     // 24 hour ban
  ban_penalty_multiplier: 3  // Triple each time
}
```

### Issue: Ban List Growing Too Large

**Symptoms:**
- Memory usage increasing
- Slow throttle checks

**Solutions:**

1. **Shorter ban duration:**
```javascript
throttle: {
  ban_ms: 3600000  // 1 hour instead of 24
}
```

2. **Regular cleanup:**
```javascript
throttle: {
  cleanup_interval: 300000  // Every 5 minutes
}
```

3. **Limit tracked violations:**
```javascript
throttle: {
  max_violations: 50  // Track fewer violations
}
```

### Issue: False Positive Bot Detection

**Symptoms:**
- Legitimate services marked as bots
- Mobile apps detected as bots

**Solutions:**

1. **Whitelist User-Agents:**
```javascript
redirects: {
  whitelist: [
    'MyMobileApp/1.0',
    'MyService/2.0'
  ]
}
```

2. **Adjust bot multiplier:**
```javascript
throttle: {
  bot_multiplier: 0.5  // More lenient (50% of limit)
}
```

---

## Best Practices

### 1. Start Conservative

```javascript
// Development
throttle: {
  limit: 50,
  window_ms: 60000,
  ban_threshold: 10
}

// Gradually increase based on actual usage
```

### 2. Monitor and Adjust

```javascript
// Track metrics
const metrics = trackThrottleMetrics();

// Review weekly
if (metrics.blockRate > 10%) {
  // Too aggressive - increase limits
}

if (metrics.blockRate < 1%) {
  // Too lenient - might decrease
}
```

### 3. Different Limits per Endpoint

```javascript
// Public endpoints: generous
GET /api/public → 1000 req/min

// Private endpoints: moderate
GET /api/user → 100 req/min

// Sensitive endpoints: strict
POST /api/admin → 10 req/min
```

### 4. Inform Users

```javascript
// Add rate limit headers
res.header('X-RateLimit-Limit', '100');
res.header('X-RateLimit-Remaining', '87');
res.header('X-RateLimit-Reset', '1676234567');

// Return clear error messages
res.status(429).json({
  error: 'Rate limit exceeded',
  limit: 100,
  window: '1 minute',
  retryAfter: 30  // seconds
});
```

### 5. Use Redis in Production

```javascript
// Memory cache = single server only
// Redis = distributed rate limiting

await build({
  cache: {
    type: 'redis',  // Share throttle data across servers
    database: {
      host: process.env.REDIS_HOST,
      port: 6379
    }
  },
  throttle: {
    limit: 1000,
    window_ms: 60000
  }
});
```

---

## Examples

### E-commerce API

```javascript
await build({
  throttle: {
    limit: 500,           // 500 requests per minute
    window_ms: 60000,
    burst_limit: 30,      // 30 request bursts for page loads
    ban_threshold: 15,    // Lenient for customers
    ban_ms: 1800000      // 30 minute ban
  }
});
```

### Financial API

```javascript
await build({
  throttle: {
    limit: 100,          // Conservative limit
    window_ms: 60000,
    burst_limit: 10,     // Low burst tolerance
    ban_threshold: 3,    // Quick banning
    ban_ms: 86400000,   // 24 hour ban
    ban_penalty_multiplier: 3  // Harsh penalties
  }
});
```

### Public Content API

```javascript
await build({
  throttle: {
    limit: 5000,         // High limit for public access
    window_ms: 60000,
    burst_limit: 100,    // Allow page rendering bursts
    ban_threshold: 50,   // Very lenient
    ban_ms: 600000,     // 10 minute ban
    bot_multiplier: 0.2  // Bots get 1000 req/min
  }
});
```

---

## Next Steps

- **[Logging Guide](logging.md)** - Track throttle events
- **[Auto-Redirect Guide](auto-redirect.md)** - Route bot traffic
- **[Monitoring](monitoring.md)** - Advanced analytics
- **[Best Practices](best-practices.md)** - Production tips

---

**Need help?** Check [GitHub Issues](https://github.com/trivajs/triva/issues) or [Discord](https://discord.gg/triva).

# Auto-Redirect Middleware

Smart traffic routing for AI bots, search crawlers, and automated traffic.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Detection Patterns](#detection-patterns)
- [Custom Rules](#custom-rules)
- [Use Cases](#use-cases)

---

## Overview

The auto-redirect middleware intelligently routes different types of traffic based on User-Agent detection:

### Features

**65+ Detection Patterns** - AI, bots, crawlers automatically detected
**Smart Routing** - Different destinations per traffic type
**Whitelist Support** - Exceptions for trusted bots
**Custom Rules** - Build complex redirect logic
**Throttle Bypass** - Redirected traffic skips rate limits
**Dynamic Destinations** - Function-based routing

### Traffic Types

- **AI Traffic** - Claude, GPT, Gemini, Perplexity, etc.
- **Search Bots** - Googlebot, Bingbot, DuckDuckGo, etc.
- **Crawlers** - Archive.org, monitoring services, etc.
- **Social Bots** - Facebook, Twitter, LinkedIn scrapers
- **Custom** - Your own detection rules

---

## Quick Start

### Basic Setup

```javascript
import { build } from 'triva';

await build({
  redirects: {
    enabled: true,
    redirectAI: true,           // Redirect AI traffic
    redirectBots: true,         // Redirect search bots
    redirectCrawlers: true,     // Redirect crawlers
    destination: '/api-docs',   // Where to redirect
    statusCode: 302            // Temporary redirect
  }
});
```

### Redirect AI to Documentation

```javascript
await build({
  redirects: {
    enabled: true,
    redirectAI: true,
    destination: '/ai-friendly-docs',
    whitelist: []  // No exceptions
  }
});
```

### Allow Search Bots, Block Others

```javascript
await build({
  redirects: {
    enabled: true,
    redirectAI: true,
    redirectBots: false,        // Allow search bots
    redirectCrawlers: true,
    destination: '/blocked',
    whitelist: ['Googlebot', 'Bingbot']  // Always allow these
  }
});
```

---

## Configuration

### All Options

```javascript
await build({
  redirects: {
    // === Basic ===
    enabled: boolean,           // Enable/disable feature
    destination: string | Function,  // Where to redirect
    statusCode: number,         // 301, 302, 307, 308

    // === Traffic Types ===
    redirectAI: boolean,        // AI bots (Claude, GPT, etc.)
    redirectBots: boolean,      // Search bots
    redirectCrawlers: boolean,  // Archive/monitoring crawlers

    // === Exceptions ===
    whitelist: string[],        // Never redirect these

    // === Advanced ===
    customRules: Rule[],        // Custom redirect rules
    debug: boolean             // Log redirect decisions
  }
});
```

### Option Details

#### destination

Static string or function:

```javascript
// Static destination
destination: '/api-docs'

// Dynamic destination
destination: (req) => {
  if (req.url.startsWith('/api/')) {
    return '/api-docs';
  }
  return '/docs';
}
```

#### statusCode

HTTP redirect status codes:

```javascript
statusCode: 301  // Permanent redirect (cached)
statusCode: 302  // Temporary redirect (default)
statusCode: 307  // Temporary (preserves method)
statusCode: 308  // Permanent (preserves method)
```

#### whitelist

Never redirect these User-Agents:

```javascript
whitelist: [
  'Googlebot',
  'Bingbot',
  'MyMonitoringService'
]
```

---

## Detection Patterns

### AI Traffic (30+ patterns)

```javascript
// Detected AI User-Agents:
- Anthropic-AI (Claude)
- ChatGPT-User (OpenGPT)
- Google-Extended (Gemini)
- GPTBot (OpenAI)
- PerplexityBot
- ClaudeBot
- Applebot-Extended
- And 20+ more...
```

### Search Bots (20+ patterns)

```javascript
// Detected search bots:
- Googlebot
- Bingbot
- Baiduspider
- YandexBot
- DuckDuckBot
- Slurp (Yahoo)
- And 15+ more...
```

### Crawlers (15+ patterns)

```javascript
// Detected crawlers:
- archive.org_bot
- UptimeRobot
- StatusCake
- Pingdom
- Site24x7
- And 10+ more...
```

### Social Media Bots

```javascript
- facebookexternalhit
- Twitterbot
- LinkedInBot
- Slackbot
- TelegramBot
- WhatsApp
```

---

## Custom Rules

### Basic Custom Rule

```javascript
import { createRule } from 'triva';

const blockScrapers = createRule({
  condition: (req) => {
    const ua = req.headers['user-agent'] || '';
    return ua.includes('scraper') || ua.includes('spider');
  },
  destination: '/blocked',
  statusCode: 403
});

await build({
  redirects: {
    enabled: true,
    customRules: [blockScrapers]
  }
});
```

### Multiple Rules

```javascript
import { createRule } from 'triva';

// Rule 1: Redirect old API version
const oldApiRule = createRule({
  condition: (req) => req.url.startsWith('/v1/'),
  destination: (req) => req.url.replace('/v1/', '/v2/'),
  statusCode: 301
});

// Rule 2: Redirect mobile users to mobile site
const mobileRule = createRule({
  condition: (req) => {
    const ua = req.headers['user-agent'] || '';
    return /mobile|android|iphone/i.test(ua);
  },
  destination: 'https://m.example.com',
  statusCode: 302
});

// Rule 3: Block specific IPs
const blockIPRule = createRule({
  condition: (req) => {
    const ip = req.socket?.remoteAddress;
    return ip === '203.0.113.0';
  },
  destination: '/blocked',
  statusCode: 403
});

await build({
  redirects: {
    enabled: true,
    customRules: [oldApiRule, mobileRule, blockIPRule]
  }
});
```

### Geographic Routing

```javascript
const geoRule = createRule({
  condition: (req) => {
    // Using CloudFlare's CF-IPCountry header
    const country = req.headers['cf-ipcountry'];
    return country === 'CN';
  },
  destination: 'https://cn.example.com',
  statusCode: 302
});
```

### Time-Based Routing

```javascript
const maintenanceRule = createRule({
  condition: (req) => {
    const hour = new Date().getHours();
    // Redirect during maintenance window (2-4 AM)
    return hour >= 2 && hour < 4;
  },
  destination: '/maintenance',
  statusCode: 503
});
```

---

## Use Cases

### 1. AI-Friendly Documentation

```javascript
await build({
  redirects: {
    enabled: true,
    redirectAI: true,
    destination: '/ai-docs',  // Structured, complete API docs
    statusCode: 302
  }
});

// /ai-docs endpoint provides:
// - Complete API reference
// - All endpoints documented
// - Example requests/responses
// - No JavaScript required
```

### 2. Separate Bot API

```javascript
await build({
  redirects: {
    enabled: true,
    redirectBots: true,
    destination: (req) => {
      // Redirect bots to a read-only API
      return '/bot-api' + req.url;
    }
  }
});
```

### 3. Archive-Only Mode

```javascript
await build({
  redirects: {
    enabled: true,
    redirectCrawlers: true,
    destination: '/archive',
    whitelist: ['archive.org_bot']  // Allow archive.org only
  }
});
```

### 4. Block Scrapers

```javascript
const scraperRule = createRule({
  condition: (req) => {
    const ua = (req.headers['user-agent'] || '').toLowerCase();
    const suspicious = [
      'scraper', 'crawler', 'spider', 'harvest',
      'extract', 'parser', 'downloader'
    ];
    return suspicious.some(word => ua.includes(word));
  },
  destination: '/blocked',
  statusCode: 403
});

await build({
  redirects: {
    enabled: true,
    customRules: [scraperRule]
  }
});
```

### 5. Rate Limit Bypass for Monitoring

```javascript
// Whitelist monitoring services to bypass throttle
await build({
  redirects: {
    enabled: true,
    whitelist: [
      'UptimeRobot',
      'StatusCake',
      'Pingdom'
    ]
  },
  throttle: {
    limit: 100,
    window_ms: 60000
  }
});

// Whitelisted traffic bypasses throttling automatically
```

### 6. Regional Content Delivery

```javascript
const regionalRules = [
  createRule({
    condition: (req) => req.headers['cf-ipcountry'] === 'US',
    destination: 'https://us.example.com'
  }),
  createRule({
    condition: (req) => req.headers['cf-ipcountry'] === 'EU',
    destination: 'https://eu.example.com'
  }),
  createRule({
    condition: (req) => req.headers['cf-ipcountry'] === 'CN',
    destination: 'https://cn.example.com'
  })
];

await build({
  redirects: {
    enabled: true,
    customRules: regionalRules
  }
});
```

---

## Best Practices

### 1. Always Whitelist Search Engines

```javascript
await build({
  redirects: {
    enabled: true,
    redirectBots: false,  // Don't redirect search bots
    whitelist: ['Googlebot', 'Bingbot']  // Extra protection
  }
});
```

### 2. Use Temporary Redirects (302)

```javascript
// Unless you're certain the redirect is permanent
statusCode: 302  // Can change later
// vs
statusCode: 301  // Cached by browsers/bots
```

### 3. Provide Good Destinations

```javascript
// ✅ Good - helpful destination
destination: '/api-docs'

// ❌ Bad - unhelpful
destination: '/404'
```

### 4. Test Your Rules

```javascript
// Test with curl
curl -A "Googlebot" http://localhost:3000/
curl -A "ClaudeBot" http://localhost:3000/
curl -A "Mozilla/5.0" http://localhost:3000/
```

### 5. Monitor Redirects

```javascript
import { log } from 'triva';

setInterval(async () => {
  const logs = await log.getAll();
  const redirected = logs.filter(log =>
    log.statusCode >= 300 && log.statusCode < 400
  );

  console.log(`Redirected: ${redirected.length}/${logs.length}`);
}, 60000);
```

---

## Debugging

### Enable Debug Mode

```javascript
await build({
  redirects: {
    enabled: true,
    debug: true,  // Log all redirect decisions
    redirectAI: true
  }
});

// Console output:
// [Redirect] ClaudeBot detected → /api-docs (302)
// [Redirect] Regular traffic → no redirect
// [Redirect] Googlebot (whitelisted) → no redirect
```

### Test Detection

```javascript
import { parseUA } from 'triva';

const testUA = "Mozilla/5.0 AppleWebKit/537.36 ClaudeBot";
const parsed = parseUA(testUA);

console.log(parsed);
// {
//   browser: "ClaudeBot",
//   isBot: true,
//   ...
// }
```

---

## Next Steps

- **[Throttling Guide](throttling.md)** - Rate limiting integration
- **[Logging Guide](logging.md)** - Track redirected traffic
- **[Custom Middleware](custom-middleware.md)** - Build custom logic
- **[Best Practices](best-practices.md)** - Production patterns

---

**Questions?** [GitHub Issues](https://github.com/trivajs/triva/issues)

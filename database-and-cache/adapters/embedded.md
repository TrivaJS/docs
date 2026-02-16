# Embedded Adapter

Encrypted JSON file storage for small applications.

## Overview

The Embedded adapter stores data in an encrypted JSON file - perfect for small apps that need persistence without a database.

### When to Use

✅ **Small apps** - Low data volume  
✅ **Desktop apps** - Local data storage  
✅ **Prototypes** - Simple persistence  
✅ **Edge devices** - No database needed  
✅ **Encrypted** - Built-in encryption  

❌ **High performance** - File I/O slower than memory  
❌ **Large datasets** - Memory-intensive  
❌ **Distributed** - Single file, not shareable  

---

## Quick Start

```javascript
import { build, cache } from 'triva';

await build({
  cache: {
    type: 'embedded',
    database: {
      filepath: './cache.enc',
      key: process.env.ENCRYPTION_KEY  // 256-bit key
    }
  }
});

await cache.set('user:123', { name: 'John' });
```

---

## Configuration

### With Encryption

```javascript
import crypto from 'crypto';

// Generate key once
const key = crypto.randomBytes(32).toString('hex');
// Store in environment: ENCRYPTION_KEY=abc123...

await build({
  cache: {
    type: 'embedded',
    database: {
      filepath: './data/cache.enc',
      key: process.env.ENCRYPTION_KEY
    }
  }
});
```

### Without Encryption (Not Recommended)

```javascript
await build({
  cache: {
    type: 'embedded',
    database: {
      filepath: './cache.json'
      // No key = unencrypted
    }
  }
});
```

---

## Features

### Automatic Encryption

- AES-256-GCM encryption
- Key-based encryption
- Secure file storage

### File Structure

```json
{
  "user:123": {
    "value": {"name": "John"},
    "expireAt": 1676234567890
  },
  "session:abc": {
    "value": {"userId": 123},
    "expireAt": null
  }
}
```

### Automatic Cleanup

Expired keys removed on read/write operations.

---

## Best Practices

### 1. Secure Your Key

```javascript
// ✅ Good - environment variable
key: process.env.ENCRYPTION_KEY

// ❌ Bad - hardcoded
key: 'my-secret-key-123'
```

### 2. Regular Backups

```bash
cp cache.enc cache.enc.backup
```

### 3. Keep Files Small

```javascript
// Limit data size
const MAX_SIZE = 10 * 1024 * 1024;  // 10MB

setInterval(async () => {
  await cache.clear();  // Periodic cleanup
}, 86400000);  // Daily
```

---

**Next:** [Memory Adapter](memory.md) | [Performance Comparison](../performance.md)

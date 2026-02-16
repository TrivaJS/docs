# Better-SQLite3 Adapter

Faster synchronous SQLite for Node.js.

## Overview

Better-SQLite3 is a synchronous SQLite library that's faster than the async sqlite3 package.

### When to Use

✅ **Performance** - 2-3x faster than sqlite3  
✅ **Simplicity** - Synchronous API  
✅ **Single-server** - Embedded database  

---

## Installation

```bash
npm install better-sqlite3
```

## Quick Start

```javascript
import { build, cache } from 'triva';

await build({
  cache: {
    type: 'better-sqlite3',
    database: {
      filepath: './cache.db',
      tableName: 'cache'
    }
  }
});

await cache.set('user:123', { name: 'John' });
```

---

## Configuration

```javascript
await build({
  cache: {
    type: 'better-sqlite3',
    database: {
      filepath: './cache.db',
      tableName: 'cache',
      options: {
        readonly: false,
        fileMustExist: false,
        timeout: 5000
      }
    }
  }
});
```

---

## Features

- Synchronous operations (faster)
- Better performance than sqlite3
- Transaction support
- Prepared statements

---

**Next:** [Embedded](embedded.md) | [Performance Comparison](../performance.md)

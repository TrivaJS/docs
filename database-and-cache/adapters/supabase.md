# Supabase Adapter

Serverless PostgreSQL with real-time capabilities.

## Overview

Supabase is an open-source Firebase alternative built on PostgreSQL.

### When to Use

✅ **Serverless** - No infrastructure management  
✅ **JAMstack** - Modern web apps  
✅ **Real-time** - Built-in subscriptions  
✅ **Managed** - Automatic backups, scaling  

---

## Installation

```bash
npm install @supabase/supabase-js
```

## Quick Start

```javascript
import { build, cache } from 'triva';

await build({
  cache: {
    type: 'supabase',
    database: {
      url: process.env.SUPABASE_URL,
      key: process.env.SUPABASE_KEY,
      tableName: 'cache'
    }
  }
});

await cache.set('user:123', { name: 'John' });
```

---

## Configuration

### Project Setup

1. Create project at supabase.com
2. Get URL and anon key
3. Configure:

```javascript
await build({
  cache: {
    type: 'supabase',
    database: {
      url: 'https://xxxxx.supabase.co',
      key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      tableName: 'cache'
    }
  }
});
```

---

## Features

- PostgreSQL-backed
- Automatic API generation
- Real-time subscriptions
- Row-level security
- Automatic backups

---

## Table Setup

```sql
-- Create in Supabase SQL editor
CREATE TABLE cache (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  expire_at TIMESTAMPTZ
);

CREATE INDEX idx_cache_expire_at ON cache(expire_at);
```

---

**Next:** [Embedded](embedded.md) | [Cloud Deployment](../../guides/deployment.md)

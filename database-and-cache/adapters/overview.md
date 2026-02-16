# Database Adapters

Complete guides for all 9 Triva database adapters.

## Available Adapters

### Built-in (No Dependencies)
1. **[Memory](memory.md)** ✅ - In-memory cache for development
2. **[Embedded](embedded.md)** 📋 - Encrypted JSON file storage

### External (Requires npm install)
3. **[SQLite](sqlite.md)** 📋 - Serverless SQL database
4. **[Better-SQLite3](better-sqlite3.md)** 📋 - Faster synchronous SQLite
5. **[MongoDB](mongodb.md)** 📋 - NoSQL document database
6. **[Redis](redis.md)** ✅ - In-memory data store
7. **[PostgreSQL](postgresql.md)** 📋 - Enterprise SQL database
8. **[MySQL](mysql.md)** 📋 - Popular SQL database
9. **[Supabase](supabase.md)** 📋 - Serverless PostgreSQL

## Quick Comparison

| Adapter | Speed | Persistence | Distributed | Use Case |
|---------|-------|-------------|-------------|----------|
| **Memory** | ⚡⚡⚡⚡⚡ | ❌ | ❌ | Development, testing |
| **Embedded** | ⚡⚡⚡ | ✅ | ❌ | Small apps, local storage |
| **SQLite** | ⚡⚡⚡ | ✅ | ❌ | Single-server apps |
| **Better-SQLite3** | ⚡⚡⚡⚡ | ✅ | ❌ | Faster SQLite |
| **MongoDB** | ⚡⚡⚡ | ✅ | ✅ | Production, scalable |
| **Redis** | ⚡⚡⚡⚡ | ⚠️ | ✅ | High-performance cache |
| **PostgreSQL** | ⚡⚡ | ✅ | ✅ | Enterprise, ACID |
| **MySQL** | ⚡⚡ | ✅ | ✅ | Traditional SQL |
| **Supabase** | ⚡⚡⚡ | ✅ | ✅ | Serverless, managed |

## Installation Commands

```bash
# Memory (built-in)
# No installation needed

# Embedded (built-in)
# No installation needed

# SQLite
npm install sqlite3

# Better-SQLite3
npm install better-sqlite3

# MongoDB
npm install mongodb

# Redis
npm install redis

# PostgreSQL
npm install pg

# MySQL
npm install mysql2

# Supabase
npm install @supabase/supabase-js
```

## Quick Start Examples

See individual adapter guides for complete documentation.

✅ = Complete documentation available
📋 = Documentation in progress

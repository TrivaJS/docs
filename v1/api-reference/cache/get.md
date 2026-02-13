# cache.get()

Retrieve value from cache.

## Signature

```javascript
async cache.get(key: string): Promise<any | null>
```

## Parameters

- `key` (string) - Cache key

## Returns

`Promise<any | null>` - Cached value or null if not found/expired

## Examples

### Basic Usage

```javascript
import { cache } from 'triva';

const user = await cache.get('user:123');

if (user) {
  console.log('Found:', user);
} else {
  console.log('Not found or expired');
}
```

### Cache-Aside Pattern

```javascript
async function getUser(id) {
  // Try cache first
  let user = await cache.get(`user:${id}`);
  
  if (user) {
    return user;
  }
  
  // Cache miss - fetch from database
  user = await db.users.findById(id);
  
  // Store in cache
  await cache.set(`user:${id}`, user, 300000);
  
  return user;
}
```

## Notes

- Returns null if key not found
- Returns null if key expired
- Automatically deserializes JSON

## See Also

- [cache.set()](set.md) - Store value
- [cache.keys()](keys.md) - List keys

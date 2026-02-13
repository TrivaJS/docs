# cache.delete()

Delete key from cache.

## Signature

```javascript
async cache.delete(key: string): Promise<void>
```

## Parameters

- `key` (string) - Cache key to delete

## Examples

### Basic Usage

```javascript
import { cache } from 'triva';

await cache.delete('user:123');
```

### After Update

```javascript
async function updateUser(id, data) {
  // Update database
  await db.users.update(id, data);
  
  // Invalidate cache
  await cache.delete(`user:${id}`);
}
```

### Pattern Deletion

```javascript
// Delete all user keys
const keys = await cache.keys('user:*');
for (const key of keys) {
  await cache.delete(key);
}
```

## See Also

- [cache.clear()](clear.md) - Delete all keys
- [cache.keys()](keys.md) - List keys

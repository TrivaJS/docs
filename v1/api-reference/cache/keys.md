# cache.keys()

Get keys matching pattern.

## Signature

```javascript
async cache.keys(pattern: string): Promise<string[]>
```

## Parameters

- `pattern` (string) - Glob pattern (`*` for wildcard)

## Returns

`Promise<string[]>` - Array of matching keys

## Examples

### All Keys

```javascript
import { cache } from 'triva';

const allKeys = await cache.keys('*');
console.log(allKeys);
// ['user:1', 'user:2', 'session:abc']
```

### Pattern Match

```javascript
// All user keys
const userKeys = await cache.keys('user:*');
// ['user:1', 'user:2', 'user:3']

// All session keys
const sessions = await cache.keys('session:*');
// ['session:abc', 'session:def']
```

### Count Keys

```javascript
const count = (await cache.keys('*')).length;
console.log(`Total keys: ${count}`);
```

## Notes

- Uses glob patterns
- Returns empty array if no matches
- `*` matches any characters

## See Also

- [cache.delete()](delete.md) - Delete keys
- [Database Overview](../../database-and-cache/overview.md)

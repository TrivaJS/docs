# cache.set()

Store value in cache.

## Signature

```javascript
async cache.set(key: string, value: any, ttl?: number): Promise<void>
```

## Parameters

- `key` (string) - Cache key
- `value` (any) - Value to store
- `ttl` (number, optional) - Time to live in milliseconds

## Examples

### Without TTL

```javascript
import { cache } from 'triva';

await cache.set('user:123', { 
  name: 'John',
  email: 'john@example.com'
});
```

### With TTL

```javascript
// Expires in 5 minutes
await cache.set('session:abc', sessionData, 300000);

// Expires in 1 hour
await cache.set('token:xyz', token, 3600000);
```

### Complex Data

```javascript
await cache.set('config', {
  settings: { theme: 'dark' },
  features: ['feature1', 'feature2'],
  enabled: true
});
```

## Notes

- Automatically serializes to JSON
- TTL in milliseconds
- Overwrites existing key
- No TTL = persists until deleted

## See Also

- [cache.get()](get.md) - Retrieve value
- [cache.delete()](delete.md) - Remove key

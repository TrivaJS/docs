# cache.clear()

Clear all cache entries.

## Signature

```javascript
async cache.clear(): Promise<void>
```

## Examples

### Basic Usage

```javascript
import { cache } from 'triva';

await cache.clear();
console.log('Cache cleared');
```

### Periodic Cleanup

```javascript
// Clear cache daily
setInterval(async () => {
  await cache.clear();
  console.log('Daily cache cleanup complete');
}, 86400000);  // 24 hours
```

### Before Tests

```javascript
beforeEach(async () => {
  await cache.clear();
});
```

## Notes

- Removes all keys
- Irreversible operation
- No return value

## See Also

- [cache.delete()](delete.md) - Delete specific key
- [cache.keys()](keys.md) - List all keys

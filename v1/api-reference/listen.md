# listen()

Start the HTTP/HTTPS server.

## Signature

```javascript
listen(port: number, callback?: () => void): Server
```

## Parameters

- `port` (number) - Port number to listen on
- `callback` (function, optional) - Called when server starts

## Returns

`Server` - Node.js HTTP or HTTPS server instance

## Examples

### Basic Usage

```javascript
import { listen } from 'triva';

listen(3000);
// Server listening on port 3000
```

### With Callback

```javascript
listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Store Server Instance

```javascript
const server = listen(3000);

// Close server later
server.close(() => {
  console.log('Server closed');
});
```

### Environment Variable

```javascript
const PORT = process.env.PORT || 3000;

listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Graceful Shutdown

```javascript
const server = listen(3000);

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
```

## Notes

- Must call `build()` before `listen()`
- Returns native Node.js server instance
- Server type (HTTP/HTTPS) determined by `build()` config
- Can be called only once

## Complete Example

```javascript
import { build, get, listen } from 'triva';

await build({
  cache: { type: 'memory' }
});

get('/', (req, res) => {
  res.json({ status: 'ok' });
});

const server = listen(3000, () => {
  console.log('Server ready');
});
```

## See Also

- [build()](build.md)
- [Deployment Guide](../guides/deployment.md)

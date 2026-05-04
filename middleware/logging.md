# Logging

Triva exposes request logs through the exported `log` utility. Log retention is configured on the app with the `retention` option.

## Configure Retention

```javascript
const app = new build({
  retention: {
    enabled: true,
    maxEntries: 10000
  }
});
```

There is no separate `logging` constructor block in the current runtime API.

## Read Logs

```javascript
import { log } from 'triva';

const recent = await log.get({ limit: 50 });
const errors = await log.get({ status: [500, 502, 503], limit: 25 });
const stats = await log.getStats();
```

## Export Logs

```javascript
const exportResult = await log.export({ method: 'GET' }, 'request-logs.json');
console.log(exportResult.filepath);
```

## Clear Logs

```javascript
await log.clear();
```

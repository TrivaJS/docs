# File Upload Example

Triva gives you direct access to the raw request stream, which means you can build upload flows without a large middleware stack.

## Simple Binary Upload

```javascript
import { build } from 'triva';
import { writeFile } from 'fs/promises';

const app = new build({ env: 'production' });

app.post('/upload', async (req, res) => {
  const chunks = [];
  let size = 0;
  const maxSize = 5 * 1024 * 1024;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxSize) {
      return res.status(413).json({ error: 'File too large' });
    }
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  await writeFile(`./uploads/${Date.now()}.bin`, buffer);

  res.status(201).json({ uploaded: true, bytes: buffer.length });
});

app.listen(3000);
```

## Good Production Defaults

- enforce a maximum upload size
- validate content type and filename metadata
- write to durable storage instead of the local filesystem when you scale horizontally
- scan or quarantine untrusted uploads before serving them back

## Related Docs

- [Error Handling Example](https://docs.trivajs.com/examples/error-handling)
- [Production Deployment](https://docs.trivajs.com/deployment/production)

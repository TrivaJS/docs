# HTTPS Deployment

Triva can create an HTTPS server directly when you set `protocol: 'https'` and provide `ssl` credentials.

## Basic Setup

```javascript
import { build } from 'triva';
import { readFileSync } from 'fs';

const app = new build({
  env: 'production',
  protocol: 'https',
  ssl: {
    key: readFileSync('./ssl/key.pem'),
    cert: readFileSync('./ssl/cert.pem')
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', secure: true });
});

app.listen(443);
```

## Development Certificates

For local testing, generate self-signed certs with a command like:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj "/CN=localhost" -keyout localhost-key.pem -out localhost-cert.pem
```

## Reverse Proxy Guidance

If you already terminate TLS at Nginx, Caddy, a load balancer, or an ingress controller, keep Triva on HTTP behind that proxy and let the proxy handle certificates and redirects.

## Redirects

Triva's current constructor API does not expose an `autoRedirect` or `https.enabled` switch. If you want HTTP to HTTPS redirects, handle them at your proxy or with a separate lightweight HTTP listener.

## Related Docs

- [Production Deployment](https://docs.trivajs.com/deployment/production)
- [Configuration](https://docs.trivajs.com/core/configuration)

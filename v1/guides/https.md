# HTTPS Guide

Setting up secure HTTPS servers with Triva.

## Quick Start

```javascript
import { build, listen } from 'triva';
import fs from 'fs';

await build({
  protocol: 'https',
  ssl: {
    key: fs.readFileSync('./ssl/private.key'),
    cert: fs.readFileSync('./ssl/certificate.crt')
  }
});

listen(443);  // HTTPS default port
```

---

## Obtaining SSL Certificates

### Option 1: Let's Encrypt (Free)

**Install Certbot**:
```bash
sudo apt install certbot
```

**Generate Certificate**:
```bash
sudo certbot certonly --standalone -d yourdomain.com
```

**Use in Triva**:
```javascript
await build({
  protocol: 'https',
  ssl: {
    key: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/fullchain.pem')
  }
});
```

### Option 2: Self-Signed (Development)

```bash
openssl req -x509 -newkey rsa:4096 \
  -keyout key.pem -out cert.pem \
  -days 365 -nodes
```

**Use in Triva**:
```javascript
await build({
  protocol: 'https',
  ssl: {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
  }
});
```

---

## Certificate Authority

For intermediate certificates:

```javascript
await build({
  protocol: 'https',
  ssl: {
    key: fs.readFileSync('./private.key'),
    cert: fs.readFileSync('./certificate.crt'),
    ca: fs.readFileSync('./ca-bundle.crt')
  }
});
```

---

## HTTP to HTTPS Redirect

```javascript
import { build, use, listen } from 'triva';
import http from 'http';

// HTTP redirect server
const httpServer = http.createServer((req, res) => {
  res.writeHead(301, {
    Location: `https://${req.headers.host}${req.url}`
  });
  res.end();
});
httpServer.listen(80);

// HTTPS server
await build({
  protocol: 'https',
  ssl: { ... }
});

listen(443);
```

---

## Security Headers

```javascript
use((req, res, next) => {
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

---

## Production Checklist

- [ ] Valid SSL certificate
- [ ] Certificate auto-renewal
- [ ] HTTP to HTTPS redirect
- [ ] HSTS header enabled
- [ ] Strong cipher suites
- [ ] TLS 1.2+ only

---

**See Also**: [Deployment Guide](deployment.md)

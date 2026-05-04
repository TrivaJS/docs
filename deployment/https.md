# HTTPS

Triva can serve HTTPS directly by setting `protocol: 'https'` and supplying `ssl.key` plus `ssl.cert`.

## Basic HTTPS Server

```javascript
import fs from 'fs';
import { build } from 'triva';

const app = new build({
  env: 'production',
  protocol: 'https',
  ssl: {
    key: fs.readFileSync('./certs/localhost-key.pem'),
    cert: fs.readFileSync('./certs/localhost-cert.pem')
  }
});

app.get('/secure', (req, res) => {
  res.json({ secure: true });
});

app.listen(3443);
```

## Redirecting HTTP Yourself

Triva does not use the legacy `autoRedirect` docs shape. If you want an HTTP listener that redirects to HTTPS, run a second app and return a redirect explicitly.

```javascript
const httpApp = new build({ protocol: 'http' });

httpApp.get('*', (req, res) => {
  const host = req.headers.host.split(':')[0];
  res.redirect(`https://${host}:3443${req.url}`, 301);
});

httpApp.listen(3000);
```

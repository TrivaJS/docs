# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**DO NOT** report security vulnerabilities through public GitHub issues.

### How to Report

**Email:** contact@trivajs.com

**Include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

### Response Timeline

- **24 hours:** Initial acknowledgment
- **72 hours:** Preliminary assessment
- **7 days:** Detailed response with timeline
- **30 days:** Fix released (for critical issues)

### What to Expect

1. **Acknowledgment** - We confirm receipt
2. **Assessment** - We evaluate severity
3. **Fix Development** - We create a patch
4. **Disclosure** - Coordinated disclosure
5. **Credit** - You get credited (if desired)

## Security Best Practices

### For Developers Using Triva

#### 1. Always Use HTTPS in Production

```javascript
import { build } from 'triva';
import fs from 'fs';

await build({
  protocol: 'https',
  ssl: {
    key: fs.readFileSync('/path/to/private-key.pem'),
    cert: fs.readFileSync('/path/to/certificate.pem')
  }
});
```

#### 2. Implement Rate Limiting

```javascript
await build({
  throttle: {
    limit: 100,
    window_ms: 60000,
    ban_threshold: 5
  }
});
```

#### 3. Validate Input

```javascript
post('/api/users', async (req, res) => {
  const data = await req.json();
  
  // Validate before use
  if (!isValidEmail(data.email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  
  // Sanitize input
  const clean = sanitize(data);
});
```

#### 4. Use Environment Variables

```javascript
// ❌ DON'T hardcode credentials
const db = connect('mongodb://admin:password123@localhost');

// ✅ DO use environment variables
const db = connect(process.env.DATABASE_URL);
```

#### 5. Keep Dependencies Updated

```bash
npm audit
npm update
npm audit fix
```

### Common Vulnerabilities and Mitigations

#### SQL Injection

**Vulnerable:**
```javascript
// ❌ NEVER DO THIS
const query = `SELECT * FROM users WHERE id = ${userId}`;
```

**Secure:**
```javascript
// ✅ Use parameterized queries
const query = 'SELECT * FROM users WHERE id = ?';
db.execute(query, [userId]);
```

#### XSS (Cross-Site Scripting)

**Vulnerable:**
```javascript
// ❌ DON'T return user input directly
get('/search', (req, res) => {
  res.send(`Results for: ${req.query.term}`);
});
```

**Secure:**
```javascript
// ✅ Sanitize or use JSON
get('/search', (req, res) => {
  res.json({ term: req.query.term, results: [] });
});
```

#### CSRF (Cross-Site Request Forgery)

**Mitigation:**
```javascript
import { randomBytes } from 'crypto';

// Generate CSRF token
const csrfToken = randomBytes(32).toString('hex');

// Verify token
post('/api/action', async (req, res) => {
  const token = req.headers['x-csrf-token'];
  if (token !== storedToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
});
```

#### NoSQL Injection

**Vulnerable:**
```javascript
// ❌ DON'T pass user input directly
db.find({ username: req.body.username });
```

**Secure:**
```javascript
// ✅ Validate and sanitize
const username = String(req.body.username);
if (!/^[a-zA-Z0-9]+$/.test(username)) {
  return res.status(400).json({ error: 'Invalid username' });
}
db.find({ username });
```

## Security Headers

### Recommended Headers

```javascript
get('/*', (req, res, next) => {
  // Security headers
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.header('Content-Security-Policy', "default-src 'self'");
  next();
});
```

## Authentication & Authorization

### Don't Roll Your Own Crypto

Use established libraries:

```javascript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Hash passwords
const hash = await bcrypt.hash(password, 10);

// Verify passwords
const valid = await bcrypt.compare(password, hash);

// Generate tokens
const token = jwt.sign({ userId }, process.env.JWT_SECRET);
```

### Implement Proper Session Management

```javascript
import session from 'express-session';

use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,        // HTTPS only
    httpOnly: true,      // No JS access
    maxAge: 3600000,     // 1 hour
    sameSite: 'strict'   // CSRF protection
  }
}));
```

## Database Security

### Secure Connection Strings

```javascript
// ❌ DON'T expose credentials
const uri = 'mongodb://admin:password@localhost';

// ✅ DO use environment variables
const uri = process.env.MONGODB_URI;
```

### Use SSL/TLS for Databases

```javascript
await build({
  cache: {
    type: 'mongodb',
    database: {
      uri: process.env.MONGODB_URI,
      ssl: true,
      sslValidate: true
    }
  }
});
```

### Encrypt Sensitive Data

```javascript
import { createCipher, createDecipher } from 'crypto';

const algorithm = 'aes-256-cbc';
const key = process.env.ENCRYPTION_KEY;

function encrypt(text) {
  const cipher = createCipher(algorithm, key);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}
```

## Secrets Management

### Never Commit Secrets

```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo "*.pem" >> .gitignore
echo "*.key" >> .gitignore
echo "config/secrets.js" >> .gitignore
```

### Use Environment Variables

```javascript
// .env file (gitignored)
DATABASE_URL=mongodb://localhost/myapp
API_KEY=your-secret-key
JWT_SECRET=your-jwt-secret
```

```javascript
// Load in application
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL;
```

### Use Secrets Management Tools

- **HashiCorp Vault**
- **AWS Secrets Manager**
- **Azure Key Vault**
- **Google Cloud Secret Manager**

## Logging and Monitoring

### What to Log

✅ **DO log:**
- Authentication attempts
- Authorization failures
- Input validation failures
- Rate limit violations
- Server errors

❌ **DON'T log:**
- Passwords
- API keys
- Personal information
- Credit card numbers
- Session tokens

### Secure Logging

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ 
      filename: 'error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Log without sensitive data
logger.info('Login attempt', { 
  username: user.username,
  ip: req.ip,
  success: false
  // ❌ DON'T log password
});
```

## Deployment Security

### Use Process Managers

```bash
# PM2 with security
pm2 start server.js --name "app" --user "www-data"
```

### Run as Non-Root User

```dockerfile
# Dockerfile
FROM node:20-alpine
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs
```

### Keep Software Updated

```bash
# Regular updates
npm update
npm audit fix

# Check for vulnerabilities
npm audit
```

### Use Firewall Rules

```bash
# Allow only necessary ports
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

## Incident Response

### If You Discover a Breach

1. **Contain** - Stop the attack
2. **Assess** - Determine scope
3. **Notify** - Inform affected users
4. **Document** - Record everything
5. **Fix** - Patch vulnerabilities
6. **Review** - Prevent recurrence

### Breach Notification

Required by many laws (GDPR, CCPA):
- Notify users within 72 hours
- Explain what happened
- Detail what data was affected
- Describe mitigation steps

## Security Checklist

### Pre-Deployment

- [ ] HTTPS configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] Security headers set
- [ ] Secrets in environment variables
- [ ] Dependencies updated
- [ ] Security audit passed
- [ ] Logging configured
- [ ] Error handling complete
- [ ] Authentication tested

### Post-Deployment

- [ ] Monitor logs
- [ ] Track failed login attempts
- [ ] Review access patterns
- [ ] Update dependencies regularly
- [ ] Backup data
- [ ] Test disaster recovery
- [ ] Security audit quarterly

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [npm Security](https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities)

## Contact

**Security Issues:** contact@trivajs.com  
**General Questions:** contact@trivajs.com  
**GitHub:** https://github.com/trivajs/triva/security

---

*Security is a continuous process, not a one-time task. Stay vigilant!*

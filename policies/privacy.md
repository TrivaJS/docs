# Privacy Policy

**Last Updated:** February 11, 2026

## Introduction

This Privacy Policy explains how Triva ("we", "our", "the Software") handles data and privacy.

**Important:** Triva is open-source software that runs on YOUR infrastructure. We do not collect, store, or process any data from your use of the Software.

## Data Collection by Triva

### What We Collect

**NOTHING.** Triva does not collect any data:

❌ No telemetry  
❌ No analytics  
❌ No usage tracking  
❌ No crash reports  
❌ No user accounts  
❌ No registration required  
❌ No phone home  
❌ No cookies (from us)  

### Update Notifications

The optional update notification feature:
- Checks npm registry for latest version (public API)
- Makes HTTPS request to `registry.npmjs.org`
- Sends only: User-Agent header (standard HTTP)
- Does NOT send: usage data, system info, or personal information
- Can be disabled: Set `TRIVA_DISABLE_UPDATE_CHECK=true`

**Data Sent:**
```http
GET https://registry.npmjs.org/triva/latest
User-Agent: Triva-Update-Notifier
```

**Data Received:** Public package information (version, publish date)

## Your Responsibilities

### Applications Built with Triva

When YOU build applications using Triva:

**You are responsible for:**
- Creating your own privacy policy
- Collecting user consent
- Securing user data
- Complying with regulations (GDPR, CCPA, etc.)
- Implementing data protection measures

**Triva provides tools, YOU implement privacy.**

### Example Scenarios

#### Scenario 1: Simple API

```javascript
// You build a simple API
get('/api/data', (req, res) => {
  res.json({ message: 'Hello' });
});
```

**Privacy Impact:** Minimal - standard HTTP logs may capture IPs

**Your Responsibility:**
- Inform users if logging IP addresses
- Implement log rotation/deletion
- Secure log files

#### Scenario 2: User Database

```javascript
// You store user data
post('/api/users', async (req, res) => {
  const userData = await req.json();
  await db.save(userData);  // YOU store this data
});
```

**Privacy Impact:** High - storing personal information

**Your Responsibility:**
- Create privacy policy
- Obtain user consent
- Encrypt sensitive data
- Implement data deletion
- Follow GDPR/CCPA requirements
- Secure database access

#### Scenario 3: Authentication

```javascript
// You implement authentication
post('/login', async (req, res) => {
  const { email, password } = await req.json();
  // YOU handle credentials
});
```

**Privacy Impact:** Critical - handling credentials

**Your Responsibility:**
- Hash passwords (never store plaintext)
- Use HTTPS
- Implement secure session management
- Provide account deletion
- Enable 2FA
- Follow security best practices

## Third-Party Services

### Database Systems

If you use external databases with Triva:

**MongoDB, Redis, PostgreSQL, MySQL, Supabase:**
- Each has its own privacy policy
- They may collect connection/usage data
- Review their privacy policies
- Ensure compliance with their terms

### Hosting Providers

If you deploy Triva applications:

**AWS, Google Cloud, Azure, Heroku, Vercel, etc.:**
- Review their privacy policies
- Understand data location
- Know data retention policies
- Check compliance certifications

### npm Registry

When installing Triva:

**npm (npmjs.com):**
- May log download statistics
- See npm's privacy policy
- Installation data aggregated anonymously

## Cookies and Tracking

### Triva Software

Triva itself does NOT:
- Set cookies
- Use local storage
- Track users
- Implement analytics

### Your Application

If YOU implement cookies in your Triva app:

**You must:**
- Inform users about cookies
- Obtain consent where required
- Provide opt-out mechanism
- List cookie types and purposes
- Follow cookie laws (ePrivacy Directive, etc.)

**Example Cookie Notice:**
```javascript
get('/', (req, res) => {
  // YOU set cookies
  res.setHeader('Set-Cookie', 'session=abc123');
  
  // YOU must inform users
  res.json({
    message: 'This site uses cookies',
    policy: '/privacy-policy'
  });
});
```

## Data Security

### Triva's Role

Triva provides:
- HTTPS support (you must configure certificates)
- No built-in vulnerabilities (best effort)
- Open source code (transparent security)

Triva does NOT provide:
- Automatic encryption
- Built-in authentication
- Data protection (your responsibility)

### Your Responsibility

**You must implement:**
- HTTPS/TLS encryption
- Authentication systems
- Authorization controls
- Input validation
- SQL injection prevention
- XSS protection
- CSRF tokens
- Rate limiting
- Security headers
- Regular updates

## Compliance with Privacy Laws

### GDPR (EU)

If serving EU users, you must:
- Provide privacy policy
- Obtain explicit consent
- Allow data access requests
- Enable data deletion
- Report breaches (72 hours)
- Appoint DPO (if required)
- Document processing activities

### CCPA (California)

If serving California residents, you must:
- Disclose data collection
- Allow opt-out of data sales
- Provide data deletion
- Not discriminate against users who opt out

### Other Regulations

Be aware of:
- **PIPEDA** (Canada)
- **LGPD** (Brazil)
- **PDPA** (Singapore, Thailand)
- **Privacy Act** (Australia)
- Local regulations in your jurisdiction

**Triva does not make you compliant - you must implement compliance.**

## Children's Privacy

### COPPA (USA)

If targeting children under 13:
- Obtain parental consent
- Limit data collection
- Follow COPPA requirements

### GDPR (EU)

If targeting children under 16:
- Obtain parental consent
- Follow heightened protections

### Recommendation

**Do not collect data from children without legal review.**

## Data Retention

### Triva Software

- No data stored by Triva
- No retention periods
- No data deletion needed

### Your Application

Define and implement:
- Retention periods for each data type
- Automatic deletion policies
- User data export
- Account deletion procedures

## International Data Transfers

### Triva Software

- Runs on YOUR infrastructure
- Data stays where YOU deploy
- No cross-border transfers by Triva

### Your Application

If transferring data internationally:
- Understand legal requirements
- Implement Standard Contractual Clauses
- Use adequacy decisions where available
- Inform users of data location

## Your Rights (As a User)

### Using Triva

When using the Triva software:
- No account to delete
- No data to access
- No data to port
- No profiling to object to

### Using Apps Built With Triva

Contact the app developer for:
- Data access requests
- Data deletion requests
- Opt-out requests
- Privacy questions

**We (Triva authors) do not have access to data in apps built with Triva.**

## Updates to This Policy

### How We Notify

- Updates posted to GitHub repository
- "Last Updated" date changed
- Major changes announced in release notes

### Your Responsibility

- Review policy periodically
- Check for updates
- Update your own privacy policy accordingly

## Contact Us

### Privacy Questions

**Email:** contact@trivajs.com 
**GitHub:** https://github.com/trivajs/triva/issues

### Data Requests

We have no data to provide. Contact app developers directly.

### Security Issues

**Email:** contact@trivajs.com  
**Responsible Disclosure:** See [Security Policy](http://docs.trivajs.com/security)

## Key Takeaways

### For Developers

1. **Triva collects nothing** - you're in control
2. **You build the privacy policy** - not us
3. **Compliance is your responsibility** - we provide tools
4. **Security must be implemented** - no automatic protection
5. **Read third-party policies** - databases, hosting, etc.

### For End Users

1. **Contact the app developer** - not Triva
2. **We don't have your data** - apps do
3. **Review each app's policy** - don't rely on this one
4. **Exercise your rights** - with app developers

---

## Privacy-Friendly Development

### Best Practices with Triva

✅ **DO:**
- Minimize data collection
- Use HTTPS always
- Implement encryption
- Provide privacy controls
- Be transparent
- Follow privacy-by-design

❌ **DON'T:**
- Collect unnecessary data
- Store sensitive data without encryption
- Skip consent mechanisms
- Ignore security updates
- Use HTTP for sensitive data

### Example: Privacy-Focused API

```javascript
import { build, get, listen } from 'triva';
import fs from 'fs';

await build({
  protocol: 'https',  // Always use HTTPS
  ssl: {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  }
});

get('/api/data', (req, res) => {
  // Don't log sensitive data
  // Don't store unnecessary data
  // Minimal response
  res.json({ status: 'ok' });
});

listen(443);
```

---

*This privacy policy applies to Triva software. Applications built with Triva have their own privacy responsibilities.*

**Last Updated:** February 11, 2026

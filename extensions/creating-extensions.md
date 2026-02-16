# Creating Extensions

Complete guide to building Triva extensions.

## Table of Contents

- [Getting Started](#getting-started)
- [Extension Types](#extension-types)
- [Project Setup](#project-setup)
- [Development](#development)
- [Testing](#testing)
- [Documentation](#documentation)
- [Best Practices](#best-practices)

---

## Getting Started

### What is an Extension?

An extension is an npm package that adds functionality to Triva applications. Extensions can be:

- **Middleware** - Request/response processing
- **Database Adapters** - Additional cache backends
- **Utilities** - Helper functions and tools
- **Integrations** - Third-party service connections

### Prerequisites

- Node.js 18+
- Basic understanding of Triva
- JavaScript/TypeScript knowledge
- npm account (for publishing)

---

## Extension Types

### 1. Middleware Extensions

Most common type - adds request/response processing.

**Example:** CORS middleware

```javascript
// @triva/cors/index.js
export default function cors(options = {}) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE'],
    credentials = false
  } = options;
  
  return (req, res, next) => {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', methods.join(','));
    
    if (credentials) {
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    
    if (req.method === 'OPTIONS') {
      return res.status(204).send();
    }
    
    next();
  };
}
```

**Usage:**
```javascript
import { use } from 'triva';
import cors from '@triva/cors';

use(cors({ origin: 'https://example.com' }));
```

### 2. Database Adapter Extensions

Add support for additional databases.

**Example:** DynamoDB adapter

```javascript
// @triva/dynamodb/index.js
import { DatabaseAdapter } from 'triva';
import AWS from 'aws-sdk';

export class DynamoDBAdapter extends DatabaseAdapter {
  constructor(config) {
    super(config);
    this.client = new AWS.DynamoDB.DocumentClient({
      region: config.region
    });
    this.tableName = config.tableName || 'cache';
  }
  
  async set(key, value, ttl) {
    const params = {
      TableName: this.tableName,
      Item: {
        key,
        value: JSON.stringify(value),
        expireAt: ttl ? Date.now() + ttl : null
      }
    };
    
    await this.client.put(params).promise();
  }
  
  async get(key) {
    const params = {
      TableName: this.tableName,
      Key: { key }
    };
    
    const result = await this.client.get(params).promise();
    
    if (!result.Item) return null;
    if (result.Item.expireAt && result.Item.expireAt < Date.now()) {
      await this.delete(key);
      return null;
    }
    
    return JSON.parse(result.Item.value);
  }
  
  async delete(key) {
    const params = {
      TableName: this.tableName,
      Key: { key }
    };
    
    await this.client.delete(params).promise();
  }
  
  async clear() {
    // Implementation
  }
  
  async keys(pattern) {
    // Implementation
  }
}
```

### 3. Utility Extensions

Helper functions and tools.

**Example:** Email sender

```javascript
// @triva/email/index.js
import nodemailer from 'nodemailer';

export class EmailService {
  constructor(config) {
    this.transporter = nodemailer.createTransport(config);
  }
  
  async send({ to, subject, html, text }) {
    return await this.transporter.sendMail({
      from: this.config.from,
      to,
      subject,
      html,
      text
    });
  }
  
  async sendTemplate(template, data) {
    const html = renderTemplate(template, data);
    return await this.send({ ...data, html });
  }
}

export function createEmailService(config) {
  return new EmailService(config);
}
```

### 4. Integration Extensions

Connect to third-party services.

**Example:** Stripe integration

```javascript
// @triva/stripe/index.js
import Stripe from 'stripe';

export class StripeIntegration {
  constructor(apiKey) {
    this.stripe = new Stripe(apiKey);
  }
  
  async createPaymentIntent(amount, currency = 'usd') {
    return await this.stripe.paymentIntents.create({
      amount,
      currency
    });
  }
  
  middleware() {
    return (req, res, next) => {
      req.stripe = this.stripe;
      next();
    };
  }
}
```

---

## Project Setup

### 1. Initialize Project

```bash
mkdir triva-my-extension
cd triva-my-extension
npm init -y
```

### 2. Project Structure

```
triva-my-extension/
├── src/
│   ├── index.js          # Main export
│   ├── middleware.js     # Core logic
│   └── utils.js          # Helpers
├── test/
│   ├── index.test.js
│   └── integration.test.js
├── docs/
│   └── README.md
├── examples/
│   └── basic.js
├── package.json
├── .gitignore
├── LICENSE
├── CHANGELOG.md
└── README.md
```

### 3. package.json

```json
{
  "name": "@username/triva-extension-name",
  "version": "1.0.0",
  "description": "Extension description",
  "main": "src/index.js",
  "type": "module",
  "keywords": [
    "triva",
    "triva-extension",
    "middleware"
  ],
  "author": "Your Name",
  "license": "MIT",
  "peerDependencies": {
    "triva": "^1.0.0"
  },
  "devDependencies": {
    "triva": "^1.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/username/triva-extension-name"
  }
}
```

---

## Development

### Basic Extension Structure

```javascript
// src/index.js

/**
 * My Extension
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.key - API key
 * @param {boolean} options.enabled - Enable/disable
 * @returns {Function} Middleware function
 */
export default function myExtension(options = {}) {
  // Validate options
  validateOptions(options);
  
  // Setup (runs once)
  const config = {
    key: options.key,
    enabled: options.enabled ?? true
  };
  
  // Return middleware (runs per request)
  return (req, res, next) => {
    if (!config.enabled) {
      return next();
    }
    
    // Extension logic
    req.myFeature = 'value';
    
    next();
  };
}

function validateOptions(options) {
  if (!options.key) {
    throw new Error('API key is required');
  }
}
```

### With Multiple Exports

```javascript
// src/index.js

export function middleware(options) {
  return (req, res, next) => {
    // Middleware logic
    next();
  };
}

export function utility(param) {
  // Utility logic
  return result;
}

export class Service {
  constructor(config) {
    this.config = config;
  }
  
  async doSomething() {
    // Service logic
  }
}

// Default export
export default {
  middleware,
  utility,
  Service
};
```

### Async Initialization

```javascript
// src/index.js

export async function createExtension(options) {
  // Async setup
  const connection = await connectToService(options);
  
  // Return middleware
  return (req, res, next) => {
    req.service = connection;
    next();
  };
}
```

---

## Testing

### Test Setup

```bash
npm install --save-dev mocha chai
```

### Unit Tests

```javascript
// test/index.test.js
import assert from 'assert';
import myExtension from '../src/index.js';

describe('myExtension', () => {
  it('should export function', () => {
    assert.equal(typeof myExtension, 'function');
  });
  
  it('should return middleware', () => {
    const middleware = myExtension({ key: 'test' });
    assert.equal(typeof middleware, 'function');
  });
  
  it('should throw without required options', () => {
    assert.throws(() => {
      myExtension();
    }, /API key is required/);
  });
});
```

### Integration Tests

```javascript
// test/integration.test.js
import { build, get, use, listen } from 'triva';
import myExtension from '../src/index.js';

describe('Integration', () => {
  let server;
  
  before(async () => {
    await build({ cache: { type: 'memory' } });
    use(myExtension({ key: 'test' }));
    get('/test', (req, res) => {
      res.json({ feature: req.myFeature });
    });
    server = listen(9999);
  });
  
  after(() => {
    server.close();
  });
  
  it('should add feature to request', async () => {
    const res = await fetch('http://localhost:9999/test');
    const data = await res.json();
    assert.equal(data.feature, 'value');
  });
});
```

### Run Tests

```json
{
  "scripts": {
    "test": "mocha test/**/*.test.js"
  }
}
```

```bash
npm test
```

---

## Documentation

### README.md Template

```markdown
# @username/triva-extension-name

Description of your extension.

## Installation

\`\`\`bash
npm install @username/triva-extension-name
\`\`\`

## Usage

\`\`\`javascript
import { use } from 'triva';
import myExtension from '@username/triva-extension-name';

use(myExtension({
  key: 'your-api-key'
}));
\`\`\`

## Configuration

### Options

- `key` (string, required) - API key
- `enabled` (boolean) - Enable/disable (default: true)

## Examples

### Basic Example

\`\`\`javascript
// Example code
\`\`\`

## API

### myExtension(options)

Description

**Parameters:**
- options (object)

**Returns:**
- Middleware function

## License

MIT
```

### JSDoc Comments

```javascript
/**
 * Create extension middleware
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.key - API key for authentication
 * @param {boolean} [options.enabled=true] - Enable/disable middleware
 * @param {number} [options.timeout=5000] - Request timeout in ms
 * @returns {Function} Express/Triva middleware function
 * 
 * @example
 * import { use } from 'triva';
 * import myExtension from '@username/triva-extension';
 * 
 * use(myExtension({
 *   key: process.env.API_KEY,
 *   timeout: 10000
 * }));
 */
export default function myExtension(options = {}) {
  // Implementation
}
```

---

## Best Practices

### 1. Configuration First

Always export a configuration function:

```javascript
// ✅ Good
export default function myExtension(options = {}) {
  return (req, res, next) => {
    // Use options
    next();
  };
}

// ❌ Bad
export default (req, res, next) => {
  next();
};
```

### 2. Validate Options

```javascript
function validateOptions(options) {
  if (!options.apiKey) {
    throw new TypeError('apiKey is required');
  }
  
  if (typeof options.timeout !== 'number') {
    throw new TypeError('timeout must be a number');
  }
}
```

### 3. Provide Defaults

```javascript
export default function myExtension(options = {}) {
  const config = {
    enabled: true,
    timeout: 5000,
    retries: 3,
    ...options
  };
  
  // Use config
}
```

### 4. Error Handling

```javascript
export default function myExtension(options) {
  return async (req, res, next) => {
    try {
      await doSomething();
      next();
    } catch (error) {
      // Log error
      console.error('Extension error:', error);
      
      // Don't break the app
      next();
    }
  };
}
```

### 5. TypeScript Support

```javascript
// types/index.d.ts
export interface MyExtensionOptions {
  key: string;
  enabled?: boolean;
  timeout?: number;
}

export default function myExtension(
  options: MyExtensionOptions
): (req: any, res: any, next: () => void) => void;
```

### 6. Performance

```javascript
// ✅ Good - setup once
export default function myExtension(options) {
  const client = createClient(options);  // Once
  
  return (req, res, next) => {
    req.client = client;  // Reuse
    next();
  };
}

// ❌ Bad - setup every request
export default function myExtension(options) {
  return (req, res, next) => {
    const client = createClient(options);  // Every request!
    req.client = client;
    next();
  };
}
```

---

## Next Steps

- **[Publishing Extensions](publishing-extensions.md)** - Share your extension
- **[Extension Best Practices](extension-best-practices.md)** - Advanced tips
- **[Official Extensions](official/)** - Study examples

---

**Questions?** [GitHub Discussions](https://github.com/trivajs/triva/discussions)

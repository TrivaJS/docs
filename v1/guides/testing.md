# Testing Guide

Testing strategies for Triva applications.

## Table of Contents

- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Test Coverage](#test-coverage)

---

## Unit Testing

### Setup

```bash
npm install --save-dev mocha chai
```

**package.json**:
```json
{
  "scripts": {
    "test": "mocha test/**/*.test.js"
  }
}
```

### Testing Routes

```javascript
// test/routes.test.js
import assert from 'assert';
import { build, get } from 'triva';

describe('Routes', () => {
  before(async () => {
    await build({ cache: { type: 'memory' } });
    
    get('/api/data', (req, res) => {
      res.json({ data: [1, 2, 3] });
    });
  });
  
  it('should return data', async () => {
    const res = await fetch('http://localhost:3000/api/data');
    const json = await res.json();
    
    assert.deepEqual(json.data, [1, 2, 3]);
  });
});
```

### Testing Middleware

```javascript
// test/middleware.test.js
import assert from 'assert';

function createMocks() {
  const req = {
    headers: {},
    method: 'GET',
    url: '/'
  };
  
  const res = {
    statusCode: 200,
    headers: {},
    
    status(code) {
      this.statusCode = code;
      return this;
    },
    
    json(data) {
      this.body = data;
    }
  };
  
  let nextCalled = false;
  const next = () => { nextCalled = true; };
  
  return { req, res, next, nextCalled: () => nextCalled };
}

describe('Auth Middleware', () => {
  it('should reject without token', () => {
    const { req, res, next, nextCalled } = createMocks();
    
    authMiddleware(req, res, next);
    
    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled(), false);
  });
  
  it('should accept valid token', () => {
    const { req, res, next, nextCalled } = createMocks();
    req.headers.authorization = 'Bearer valid-token';
    
    authMiddleware(req, res, next);
    
    assert.equal(nextCalled(), true);
    assert.ok(req.user);
  });
});
```

---

## Integration Testing

### Testing Full Stack

```javascript
import assert from 'assert';
import { build, get, post, listen } from 'triva';

describe('Integration Tests', () => {
  let server;
  
  before(async () => {
    await build({ cache: { type: 'memory' } });
    
    get('/api/users', (req, res) => {
      res.json({ users: [] });
    });
    
    post('/api/users', async (req, res) => {
      const body = await req.json();
      res.status(201).json({ user: body });
    });
    
    server = listen(9999);
  });
  
  after(() => {
    server.close();
  });
  
  it('should get users', async () => {
    const res = await fetch('http://localhost:9999/api/users');
    const data = await res.json();
    
    assert.ok(Array.isArray(data.users));
  });
  
  it('should create user', async () => {
    const res = await fetch('http://localhost:9999/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'John' })
    });
    
    assert.equal(res.status, 201);
    
    const data = await res.json();
    assert.equal(data.user.name, 'John');
  });
});
```

### Testing Cache

```javascript
import { cache } from 'triva';

describe('Cache', () => {
  beforeEach(async () => {
    await cache.clear();
  });
  
  it('should set and get', async () => {
    await cache.set('test', 'value');
    const value = await cache.get('test');
    assert.equal(value, 'value');
  });
  
  it('should expire after TTL', async () => {
    await cache.set('test', 'value', 100);
    await new Promise(r => setTimeout(r, 150));
    const value = await cache.get('test');
    assert.equal(value, null);
  });
});
```

---

## End-to-End Testing

### Using Playwright

```bash
npm install --save-dev @playwright/test
```

```javascript
// e2e/api.spec.js
import { test, expect } from '@playwright/test';

test.describe('API Tests', () => {
  test('should create and retrieve user', async ({ request }) => {
    // Create user
    const createRes = await request.post('/api/users', {
      data: { name: 'John', email: 'john@example.com' }
    });
    
    expect(createRes.ok()).toBeTruthy();
    const { user } = await createRes.json();
    
    // Retrieve user
    const getRes = await request.get(`/api/users/${user.id}`);
    const retrieved = await getRes.json();
    
    expect(retrieved.user.name).toBe('John');
  });
});
```

---

## Test Coverage

### Setup Istanbul/NYC

```bash
npm install --save-dev nyc
```

**package.json**:
```json
{
  "scripts": {
    "test": "mocha test/**/*.test.js",
    "coverage": "nyc npm test"
  },
  "nyc": {
    "reporter": ["text", "html"],
    "exclude": ["test/**"]
  }
}
```

**Run**:
```bash
npm run coverage
```

---

## Best Practices

### 1. Test Isolation

```javascript
// ✅ Good - isolated tests
beforeEach(async () => {
  await cache.clear();
  await db.reset();
});

// ❌ Bad - shared state
let sharedUser;

test('create user', () => {
  sharedUser = createUser();  // Affects other tests
});
```

### 2. Mock External Services

```javascript
// Mock database
const mockDb = {
  users: {
    findById: async (id) => ({ id, name: 'John' })
  }
};

// Use in tests
const user = await mockDb.users.findById('123');
```

### 3. Test Error Cases

```javascript
it('should handle invalid input', async () => {
  const res = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({})
  });
  
  assert.equal(res.status, 400);
});
```

---

**Next**: [Scaling Guide](scaling.md) | [Security Best Practices](security-best-practices.md)

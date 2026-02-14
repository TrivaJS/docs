# Error Handling Guide

Robust error management strategies for Triva applications.

## Table of Contents

- [Error Types](#error-types)
- [Try-Catch Patterns](#try-catch-patterns)
- [Global Error Handler](#global-error-handler)
- [Custom Error Classes](#custom-error-classes)
- [Production Best Practices](#production-best-practices)

---

## Error Types

### 1. Validation Errors (400)

```javascript
post('/api/users', async (req, res) => {
  const { email, password } = await req.json();
  
  if (!email || !password) {
    return res.status(400).json({
      error: 'Validation failed',
      details: {
        email: !email ? 'Email is required' : null,
        password: !password ? 'Password is required' : null
      }
    });
  }
  
  // Continue...
});
```

### 2. Authentication Errors (401)

```javascript
get('/api/profile', (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'NO_AUTH'
    });
  }
  
  // Verify token...
});
```

### 3. Authorization Errors (403)

```javascript
get('/api/admin', (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }
  
  // Continue...
});
```

### 4. Not Found (404)

```javascript
get('/api/users/:id', async (req, res) => {
  const user = await db.users.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      error: 'Not found',
      message: 'User not found',
      code: 'USER_NOT_FOUND'
    });
  }
  
  res.json({ user });
});
```

### 5. Server Errors (500)

```javascript
get('/api/data', async (req, res) => {
  try {
    const data = await db.query();
    res.json({ data });
  } catch (error) {
    console.error('Database error:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      code: 'DATABASE_ERROR'
    });
  }
});
```

---

## Try-Catch Patterns

### Basic Try-Catch

```javascript
get('/api/data', async (req, res) => {
  try {
    const data = await fetchData();
    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});
```

### Async Wrapper

```javascript
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };
}

// Usage
get('/api/data', asyncHandler(async (req, res) => {
  const data = await fetchData();
  res.json({ data });
}));
```

### Multiple Error Types

```javascript
get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.users.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.name === 'DatabaseError') {
      return res.status(503).json({ error: 'Service unavailable' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

## Global Error Handler

### Basic Error Handler

```javascript
import { use } from 'triva';

// Must be LAST middleware
use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

### Production Error Handler

```javascript
use((err, req, res, next) => {
  // Log error details
  console.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  // Send sanitized error to client
  const statusCode = err.statusCode || 500;
  const message = statusCode < 500 
    ? err.message 
    : 'Internal server error';
  
  res.status(statusCode).json({
    error: message,
    code: err.code,
    requestId: req.id
  });
});
```

---

## Custom Error Classes

### Define Error Classes

```javascript
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, field) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.resource = resource;
  }
}

class DatabaseError extends AppError {
  constructor(message) {
    super(message, 503, 'DATABASE_ERROR');
  }
}
```

### Use Custom Errors

```javascript
get('/api/users/:id', async (req, res, next) => {
  try {
    const user = await db.users.findById(req.params.id);
    
    if (!user) {
      throw new NotFoundError('User');
    }
    
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Error handler
use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      ...(err.field && { field: err.field }),
      ...(err.resource && { resource: err.resource })
    });
  }
  
  // Unknown error
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});
```

---

## Production Best Practices

### 1. Never Expose Stack Traces

```javascript
// ❌ Bad - exposes internals
res.status(500).json({
  error: err.message,
  stack: err.stack
});

// ✅ Good - sanitized error
res.status(500).json({
  error: 'Internal server error',
  requestId: req.id
});
```

### 2. Log All Errors

```javascript
use((err, req, res, next) => {
  // Always log
  console.error({
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    user: req.user?.id
  });
  
  // Send response
  res.status(500).json({
    error: 'Internal server error',
    requestId: req.id
  });
});
```

### 3. Provide Error Codes

```javascript
// Client can programmatically handle errors
res.status(400).json({
  error: 'Validation failed',
  code: 'VALIDATION_ERROR',
  fields: {
    email: 'Invalid email format'
  }
});

// Client side:
if (error.code === 'VALIDATION_ERROR') {
  showValidationErrors(error.fields);
}
```

### 4. Use Request IDs

```javascript
use((req, res, next) => {
  req.id = crypto.randomUUID();
  next();
});

use((err, req, res, next) => {
  console.error(`[${req.id}]`, err);
  
  res.status(500).json({
    error: 'Internal server error',
    requestId: req.id  // Client can reference this
  });
});
```

### 5. Handle Async Errors

```javascript
// ✅ Always catch async errors
get('/api/data', async (req, res, next) => {
  try {
    const data = await fetchData();
    res.json({ data });
  } catch (error) {
    next(error);  // Pass to error handler
  }
});

// Or use async wrapper
get('/api/data', asyncHandler(async (req, res) => {
  const data = await fetchData();
  res.json({ data });
}));
```

---

## Error Response Format

### Standard Format

```javascript
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE",
  "details": { ... },
  "requestId": "uuid"
}
```

### Examples

**Validation Error**:
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format",
    "password": "Must be at least 8 characters"
  }
}
```

**Not Found**:
```json
{
  "error": "User not found",
  "code": "USER_NOT_FOUND",
  "requestId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Server Error**:
```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR",
  "requestId": "123e4567-e89b-12d3-a456-426614174000"
}
```

---

## Complete Example

```javascript
import { build, get, post, use } from 'triva';
import crypto from 'crypto';

// Custom errors
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

class ValidationError extends AppError {
  constructor(details) {
    super('Validation failed', 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

// Async wrapper
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Setup
await build({ cache: { type: 'memory' } });

// Request ID
use((req, res, next) => {
  req.id = crypto.randomUUID();
  next();
});

// Routes
post('/api/users', asyncHandler(async (req, res) => {
  const body = await req.json();
  
  const errors = {};
  if (!body.email) errors.email = 'Required';
  if (!body.password) errors.password = 'Required';
  
  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
  
  const user = await db.users.create(body);
  res.status(201).json({ user });
}));

// Error handler (must be last)
use((err, req, res, next) => {
  // Log
  console.error({
    requestId: req.id,
    error: err.message,
    stack: err.stack
  });
  
  // Respond
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      ...(err.details && { details: err.details }),
      requestId: req.id
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    requestId: req.id
  });
});

listen(3000);
```

---

**Next**: [Testing Guide](testing.md) | [Security Best Practices](security-best-practices.md)

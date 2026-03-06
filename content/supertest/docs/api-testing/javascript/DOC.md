---
name: api-testing
description: "Supertest HTTP assertion library for testing REST APIs - request building, response validation, authentication, and middleware testing"
metadata:
  languages: "javascript"
  versions: "7.0.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "supertest,api,testing,http,rest,express,node"
---

# Supertest API Testing Guidelines

## Installation

```bash
npm install -D supertest
npm install -D jest @types/jest    # or vitest, mocha
npm install -D @types/supertest    # TypeScript
```

## Quick Start

```javascript
const request = require('supertest');
const app = require('../app'); // Express app

describe('GET /api/users', () => {
  it('returns users list', async () => {
    const res = await request(app)
      .get('/api/users')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
```

## Request Methods

```javascript
// GET
await request(app).get('/api/users');

// POST with JSON body
await request(app)
  .post('/api/users')
  .send({ name: 'Alice', email: 'alice@test.com' })
  .set('Content-Type', 'application/json');

// PUT
await request(app)
  .put('/api/users/1')
  .send({ name: 'Updated' });

// PATCH
await request(app)
  .patch('/api/users/1')
  .send({ name: 'Patched' });

// DELETE
await request(app).delete('/api/users/1');
```

## Headers and Authentication

```javascript
// Set headers
await request(app)
  .get('/api/protected')
  .set('Authorization', 'Bearer token123')
  .set('X-Custom-Header', 'value');

// Multiple headers
await request(app)
  .get('/api/data')
  .set({
    'Authorization': 'Bearer token123',
    'Accept': 'application/json',
    'X-Request-ID': 'abc-123'
  });

// Basic auth
await request(app)
  .get('/api/protected')
  .auth('username', 'password');

// Bearer token helper
await request(app)
  .get('/api/protected')
  .auth('token123', { type: 'bearer' });
```

## Response Assertions

```javascript
// Status codes
await request(app).get('/api/users').expect(200);
await request(app).post('/api/users').send({}).expect(400);
await request(app).get('/api/missing').expect(404);

// Headers
await request(app)
  .get('/api/users')
  .expect('Content-Type', /json/)
  .expect('X-Powered-By', 'Express');

// Body assertions with expect callback
await request(app)
  .get('/api/users/1')
  .expect(200)
  .expect((res) => {
    if (!res.body.name) throw new Error('Missing name');
    if (res.body.id !== 1) throw new Error('Wrong id');
  });

// Chain with Jest matchers
const res = await request(app).get('/api/users').expect(200);
expect(res.body).toEqual(
  expect.arrayContaining([
    expect.objectContaining({ name: 'Alice' })
  ])
);

// Response structure validation
expect(res.body).toMatchObject({
  data: expect.any(Array),
  total: expect.any(Number),
  page: 1
});
```

## Query Parameters

```javascript
// Query string
await request(app)
  .get('/api/users')
  .query({ page: 1, limit: 10, sort: 'name' });

// Nested query
await request(app)
  .get('/api/search')
  .query({ filter: { status: 'active' }, fields: 'name,email' });
```

## File Upload

```javascript
// Single file
await request(app)
  .post('/api/upload')
  .attach('file', 'test/fixtures/sample.pdf')
  .expect(200);

// Multiple files
await request(app)
  .post('/api/upload')
  .attach('photos', 'test/fixtures/photo1.jpg')
  .attach('photos', 'test/fixtures/photo2.jpg')
  .field('description', 'Test upload');

// Buffer upload
const buffer = Buffer.from('file content');
await request(app)
  .post('/api/upload')
  .attach('file', buffer, 'test.txt');
```

## Form Data

```javascript
// URL-encoded form
await request(app)
  .post('/api/login')
  .type('form')
  .send({ username: 'alice', password: 'secret' });

// Multipart form
await request(app)
  .post('/api/submit')
  .field('name', 'Alice')
  .field('email', 'alice@test.com')
  .attach('avatar', 'test/fixtures/avatar.png');
```

## Testing with External Server URL

```javascript
// Test against running server (not Express app instance)
const request = require('supertest');

describe('External API', () => {
  const api = request('http://localhost:3000');

  it('fetches users', async () => {
    await api.get('/api/users').expect(200);
  });
});
```

## Reusable Agent (Persistent Cookies/Sessions)

```javascript
const agent = request.agent(app);

describe('Session-based auth', () => {
  it('logs in and accesses protected route', async () => {
    // Login — agent stores cookies
    await agent
      .post('/api/login')
      .send({ email: 'alice@test.com', password: 'secret' })
      .expect(200);

    // Subsequent requests carry session cookie
    await agent
      .get('/api/profile')
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe('alice@test.com');
      });
  });
});
```

## Error Response Testing

```javascript
// Validation errors
await request(app)
  .post('/api/users')
  .send({ name: '' })
  .expect(400)
  .expect((res) => {
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContainEqual(
      expect.objectContaining({ field: 'name' })
    );
  });

// Not found
await request(app)
  .get('/api/users/99999')
  .expect(404)
  .expect((res) => {
    expect(res.body.message).toMatch(/not found/i);
  });

// Unauthorized
await request(app)
  .get('/api/protected')
  .expect(401);

// Rate limiting
for (let i = 0; i < 100; i++) {
  await request(app).get('/api/data');
}
await request(app).get('/api/data').expect(429);
```

## Middleware Testing

```javascript
const express = require('express');

// Test middleware in isolation
function createTestApp(middleware) {
  const app = express();
  app.use(express.json());
  app.use(middleware);
  app.get('/test', (req, res) => res.json({ user: req.user }));
  return app;
}

it('auth middleware attaches user', async () => {
  const app = createTestApp(authMiddleware);
  const res = await request(app)
    .get('/test')
    .set('Authorization', 'Bearer valid-token')
    .expect(200);

  expect(res.body.user).toBeDefined();
  expect(res.body.user.id).toBe(1);
});

it('auth middleware rejects invalid token', async () => {
  const app = createTestApp(authMiddleware);
  await request(app)
    .get('/test')
    .set('Authorization', 'Bearer invalid')
    .expect(401);
});
```

## Redirect Testing

```javascript
// Follow redirects (default behavior)
await request(app)
  .get('/old-path')
  .expect(301)
  .expect('Location', '/new-path');

// Don't follow redirects
await request(app)
  .get('/old-path')
  .redirects(0)
  .expect(301);
```

## Timeout and Abort

```javascript
await request(app)
  .get('/api/slow-endpoint')
  .timeout({ response: 5000, deadline: 10000 })
  .expect(200);
```

## Common Patterns

### Auth helper

```javascript
function authenticatedRequest(app, token) {
  return {
    get: (url) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url) => request(app).post(url).set('Authorization', `Bearer ${token}`),
    put: (url) => request(app).put(url).set('Authorization', `Bearer ${token}`),
    delete: (url) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
  };
}

// Usage
const api = authenticatedRequest(app, userToken);
await api.get('/api/profile').expect(200);
```

### Database setup/teardown

```javascript
const { setupTestDb, teardownTestDb, seedUsers } = require('./helpers/db');

beforeAll(async () => { await setupTestDb(); });
afterAll(async () => { await teardownTestDb(); });
beforeEach(async () => { await seedUsers(); });
```

### Response time assertion

```javascript
it('responds within 200ms', async () => {
  const start = Date.now();
  await request(app).get('/api/health').expect(200);
  expect(Date.now() - start).toBeLessThan(200);
});
```

## Tips

- Pass the Express `app` instance directly — supertest handles server lifecycle (no need to `.listen()`)
- Use `request.agent(app)` for cookie/session persistence across requests
- Chain `.expect()` calls for multiple assertions in one request
- Use `.expect(fn)` callback for complex body assertions
- For TypeScript, import as `import request from 'supertest'`
- Always test both success and error paths for each endpoint

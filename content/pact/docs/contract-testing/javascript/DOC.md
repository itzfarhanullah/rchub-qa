---
name: contract-testing
description: "Pact consumer-driven contract testing - provider/consumer contracts, HTTP interactions, message pacts, and CI/CD verification"
metadata:
  languages: "javascript"
  versions: "13.2.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "pact,contract-testing,api,consumer-driven,microservices,testing"
---

# Pact Contract Testing Guidelines (JavaScript)

## Installation

```bash
npm install -D @pact-foundation/pact
```

## Core Concepts

- **Consumer** — service that makes API calls (frontend, downstream service)
- **Provider** — service that serves API responses (backend, upstream service)
- **Pact** — a contract (JSON file) recording expected interactions
- **Flow**: Consumer writes tests → generates pact → Provider verifies against pact

## Consumer Side: Writing Pact Tests

### Basic consumer test

```javascript
const { PactV4 } = require('@pact-foundation/pact');
const path = require('path');

const provider = new PactV4({
  consumer: 'UserUI',
  provider: 'UserService',
  dir: path.resolve(process.cwd(), 'pacts'),
});

describe('User API', () => {
  it('fetches a user by ID', async () => {
    await provider
      .addInteraction()
      .given('user 1 exists')
      .uponReceiving('a request for user 1')
      .withRequest('GET', '/api/users/1', (builder) => {
        builder.headers({ Accept: 'application/json' });
      })
      .willRespondWith(200, (builder) => {
        builder
          .headers({ 'Content-Type': 'application/json' })
          .jsonBody({
            id: 1,
            name: 'Alice',
            email: 'alice@test.com',
          });
      })
      .executeTest(async (mockServer) => {
        // Call your actual API client pointing to mock
        const res = await fetch(`${mockServer.url}/api/users/1`, {
          headers: { Accept: 'application/json' },
        });
        const user = await res.json();

        expect(user.id).toBe(1);
        expect(user.name).toBe('Alice');
      });
  });
});
```

### POST interaction

```javascript
it('creates a new user', async () => {
  await provider
    .addInteraction()
    .uponReceiving('a request to create a user')
    .withRequest('POST', '/api/users', (builder) => {
      builder
        .headers({ 'Content-Type': 'application/json' })
        .jsonBody({ name: 'Bob', email: 'bob@test.com' });
    })
    .willRespondWith(201, (builder) => {
      builder.jsonBody({
        id: 2,
        name: 'Bob',
        email: 'bob@test.com',
      });
    })
    .executeTest(async (mockServer) => {
      const res = await fetch(`${mockServer.url}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Bob', email: 'bob@test.com' }),
      });
      expect(res.status).toBe(201);
    });
});
```

### Matchers (flexible matching)

```javascript
const { like, eachLike, regex, integer, string, boolean, datetime } = require('@pact-foundation/pact').MatchersV3;

// like() — matches type, not exact value
builder.jsonBody({
  id: integer(1),
  name: string('Alice'),
  active: boolean(true),
  email: regex('alice@test.com', '^[\\w.]+@[\\w.]+$'),
  createdAt: datetime("2026-01-01T00:00:00Z", "yyyy-MM-dd'T'HH:mm:ss'Z'"),
});

// eachLike() — array where each element matches shape
builder.jsonBody(eachLike({
  id: integer(1),
  name: string('Alice'),
}));

// like() — object matches structure
builder.jsonBody(like({
  data: eachLike({ id: integer(), name: string() }),
  total: integer(10),
  page: integer(1),
}));
```

### Query parameters

```javascript
.withRequest('GET', '/api/users', (builder) => {
  builder.query({ page: '1', limit: '10', sort: 'name' });
})
```

### Error responses

```javascript
it('returns 404 for missing user', async () => {
  await provider
    .addInteraction()
    .given('user 999 does not exist')
    .uponReceiving('a request for non-existent user')
    .withRequest('GET', '/api/users/999')
    .willRespondWith(404, (builder) => {
      builder.jsonBody({ error: 'User not found' });
    })
    .executeTest(async (mockServer) => {
      const res = await fetch(`${mockServer.url}/api/users/999`);
      expect(res.status).toBe(404);
    });
});
```

## Provider Side: Verification

```javascript
const { Verifier } = require('@pact-foundation/pact');

describe('User Service Provider', () => {
  it('validates the contract', async () => {
    const verifier = new Verifier({
      providerBaseUrl: 'http://localhost:3000',
      pactUrls: [
        path.resolve(process.cwd(), 'pacts/UserUI-UserService.json'),
      ],
      stateHandlers: {
        'user 1 exists': async () => {
          // Set up state: seed database, mock dependencies
          await db.users.create({ id: 1, name: 'Alice', email: 'alice@test.com' });
        },
        'user 999 does not exist': async () => {
          await db.users.deleteAll();
        },
      },
    });

    await verifier.verifyProvider();
  });
});
```

### Verify from Pact Broker

```javascript
const verifier = new Verifier({
  providerBaseUrl: 'http://localhost:3000',
  pactBrokerUrl: 'https://your-broker.pactflow.io',
  pactBrokerToken: process.env.PACT_BROKER_TOKEN,
  provider: 'UserService',
  publishVerificationResult: true,
  providerVersion: process.env.GIT_SHA,
  stateHandlers: { /* ... */ },
});
```

## Pact Broker

```bash
# Publish pact to broker
npx pact-broker publish ./pacts \
  --consumer-app-version $GIT_SHA \
  --broker-base-url https://your-broker.pactflow.io \
  --broker-token $PACT_BROKER_TOKEN

# Can-I-Deploy check (safe to release?)
npx pact-broker can-i-deploy \
  --pacticipant UserUI \
  --version $GIT_SHA \
  --to-environment production
```

## Message Pact (Event-driven)

```javascript
// Consumer: expects a message
it('handles user created event', async () => {
  await provider
    .addInteraction()
    .expectsToReceive('a user created event')
    .withContent({
      userId: integer(1),
      name: string('Alice'),
      event: 'USER_CREATED',
    })
    .executeTest(async (message) => {
      // Pass message to your handler
      const result = handleUserCreated(message);
      expect(result.processed).toBe(true);
    });
});
```

## CI/CD Integration

```yaml
# GitHub Actions
consumer-test:
  steps:
    - run: npm test -- --testPathPattern=pact
    - run: npx pact-broker publish ./pacts --consumer-app-version $GITHUB_SHA

provider-verify:
  steps:
    - run: npm start &
    - run: npm test -- --testPathPattern=provider.pact
    - run: npx pact-broker can-i-deploy --pacticipant UserService --version $GITHUB_SHA --to-environment production
```

## Common Patterns

### Shared pact setup

```javascript
function createPact(consumer, provider) {
  return new PactV4({
    consumer,
    provider,
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'warn',
  });
}
```

### Auth header in interactions

```javascript
.withRequest('GET', '/api/protected', (builder) => {
  builder.headers({
    Authorization: regex('Bearer token123', '^Bearer .+$'),
    Accept: 'application/json',
  });
})
```

### Pagination contract

```javascript
.willRespondWith(200, (builder) => {
  builder.jsonBody(like({
    data: eachLike({ id: integer(), name: string() }),
    pagination: {
      page: integer(1),
      limit: integer(10),
      total: integer(100),
    },
  }));
})
```

## Tips

- Write consumer tests FIRST — they define the contract
- Use matchers (`like`, `eachLike`, `regex`) — don't hardcode exact values
- Provider state (`given()`) must match exactly in provider's `stateHandlers`
- Commit pact JSON files to version control OR use a Pact Broker
- Run `can-i-deploy` in CI before deploying — it's the safety gate
- Each consumer-provider pair produces one pact file
- Don't test business logic in pact tests — only test the contract shape
- Keep interactions minimal — test the API shape, not all edge cases

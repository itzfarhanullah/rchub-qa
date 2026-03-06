---
name: performance-testing
description: "k6 load testing - virtual users, scenarios, thresholds, checks, HTTP requests, and CI/CD integration"
metadata:
  languages: "javascript"
  versions: "0.54.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "k6,performance,load-testing,stress,soak,spike,benchmarking"
---

# k6 Performance Testing Guidelines

## Installation

```bash
# macOS
brew install k6

# Docker
docker run --rm -i grafana/k6 run - <script.js

# npm (k6 binary wrapper)
npm install -g k6
```

## Quick Start

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,           // 10 virtual users
  duration: '30s',   // run for 30 seconds
};

export default function () {
  const res = http.get('http://localhost:3000/api/users');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

```bash
k6 run load-test.js
```

## HTTP Requests

```javascript
import http from 'k6/http';

// GET
const res = http.get('http://localhost:3000/api/users');

// GET with params
const res = http.get('http://localhost:3000/api/users?page=1&limit=10');

// POST JSON
const payload = JSON.stringify({ name: 'Alice', email: 'alice@test.com' });
const params = { headers: { 'Content-Type': 'application/json' } };
const res = http.post('http://localhost:3000/api/users', payload, params);

// PUT
http.put('http://localhost:3000/api/users/1', JSON.stringify({ name: 'Updated' }), params);

// DELETE
http.del('http://localhost:3000/api/users/1');

// Form data
const res = http.post('http://localhost:3000/login', {
  username: 'alice',
  password: 'secret',
});

// Batch requests (parallel)
const responses = http.batch([
  ['GET', 'http://localhost:3000/api/users'],
  ['GET', 'http://localhost:3000/api/products'],
  ['GET', 'http://localhost:3000/api/orders'],
]);
```

## Checks (Assertions)

```javascript
import { check } from 'k6';

export default function () {
  const res = http.get('http://localhost:3000/api/users');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
    'body has users': (r) => JSON.parse(r.body).length > 0,
    'content-type is json': (r) => r.headers['Content-Type'].includes('application/json'),
    'body size < 10KB': (r) => r.body.length < 10240,
  });
}
```

## Thresholds (Pass/Fail Criteria)

```javascript
export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500'],           // 95% of requests < 500ms
    http_req_duration: ['p(99)<1000'],          // 99% < 1s
    http_req_failed: ['rate<0.01'],             // <1% errors
    http_reqs: ['rate>100'],                    // >100 RPS
    checks: ['rate>0.99'],                      // >99% checks pass
    'http_req_duration{name:login}': ['p(95)<300'],  // tagged threshold
  },
};
```

## Load Test Scenarios

### Constant load

```javascript
export const options = {
  vus: 50,
  duration: '5m',
};
```

### Ramp up/down (stages)

```javascript
export const options = {
  stages: [
    { duration: '2m', target: 50 },   // ramp up to 50 VUs
    { duration: '5m', target: 50 },   // hold at 50
    { duration: '2m', target: 0 },    // ramp down
  ],
};
```

### Spike test

```javascript
export const options = {
  stages: [
    { duration: '1m', target: 10 },    // baseline
    { duration: '30s', target: 200 },   // spike!
    { duration: '1m', target: 200 },    // hold spike
    { duration: '30s', target: 10 },    // recovery
    { duration: '2m', target: 10 },     // verify recovery
  ],
};
```

### Soak test

```javascript
export const options = {
  stages: [
    { duration: '5m', target: 100 },   // ramp up
    { duration: '4h', target: 100 },   // sustained load
    { duration: '5m', target: 0 },     // ramp down
  ],
};
```

### Multiple scenarios

```javascript
export const options = {
  scenarios: {
    browse: {
      executor: 'constant-vus',
      vus: 20,
      duration: '5m',
      exec: 'browseProducts',
    },
    purchase: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },
        { duration: '3m', target: 10 },
      ],
      exec: 'purchaseFlow',
    },
  },
};

export function browseProducts() {
  http.get('http://localhost:3000/products');
  sleep(2);
}

export function purchaseFlow() {
  http.post('http://localhost:3000/cart', JSON.stringify({ productId: 1 }));
  http.post('http://localhost:3000/checkout');
  sleep(3);
}
```

## Authentication

```javascript
import http from 'k6/http';

// Login once in setup, share token
export function setup() {
  const res = http.post('http://localhost:3000/api/login',
    JSON.stringify({ email: 'test@test.com', password: 'secret' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  return { token: JSON.parse(res.body).token };
}

export default function (data) {
  const params = {
    headers: { Authorization: `Bearer ${data.token}` },
  };
  http.get('http://localhost:3000/api/protected', params);
}
```

## Tags and Groups

```javascript
import { group } from 'k6';

export default function () {
  group('Login Flow', function () {
    http.get('http://localhost:3000/login');
    http.post('http://localhost:3000/login', { user: 'test', pass: 'test' });
  });

  group('Dashboard', function () {
    http.get('http://localhost:3000/dashboard');
    http.get('http://localhost:3000/api/stats');
  });
}

// Tags for filtering metrics
const res = http.get('http://localhost:3000/api/users', {
  tags: { name: 'GetUsers', type: 'api' },
});
```

## Custom Metrics

```javascript
import { Counter, Gauge, Rate, Trend } from 'k6/metrics';

const errorCount = new Counter('errors');
const responseTime = new Trend('custom_response_time');
const successRate = new Rate('success_rate');
const activeUsers = new Gauge('active_users');

export default function () {
  const res = http.get('http://localhost:3000/api/users');
  responseTime.add(res.timings.duration);

  if (res.status === 200) {
    successRate.add(1);
  } else {
    successRate.add(0);
    errorCount.add(1);
  }
}
```

## Data Parameterization

```javascript
import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

// Load CSV test data (shared across VUs, loaded once)
const users = new SharedArray('users', function () {
  return papaparse.parse(open('./test-data.csv'), { header: true }).data;
});

export default function () {
  const user = users[Math.floor(Math.random() * users.length)];
  http.post('http://localhost:3000/api/login',
    JSON.stringify({ email: user.email, password: user.password }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
```

## Lifecycle Hooks

```javascript
export function setup() {
  // Runs once before test — seed data, get tokens
  const res = http.post('http://localhost:3000/api/seed');
  return { seedId: JSON.parse(res.body).id };
}

export default function (data) {
  // Runs per VU iteration — the actual test
  http.get(`http://localhost:3000/api/data/${data.seedId}`);
}

export function teardown(data) {
  // Runs once after test — cleanup
  http.del(`http://localhost:3000/api/seed/${data.seedId}`);
}
```

## Output and Reporting

```bash
# JSON output
k6 run --out json=results.json script.js

# CSV output
k6 run --out csv=results.csv script.js

# InfluxDB (for Grafana dashboards)
k6 run --out influxdb=http://localhost:8086/k6 script.js

# Multiple outputs
k6 run --out json=results.json --out influxdb=http://localhost:8086/k6 script.js

# Summary export
k6 run --summary-export=summary.json script.js
```

## CI/CD Integration

```yaml
# GitHub Actions
- name: Run k6 load test
  uses: grafana/k6-action@v0.3.1
  with:
    filename: load-test.js
    flags: --out json=results.json
  env:
    BASE_URL: ${{ secrets.STAGING_URL }}
```

## Common Patterns

### API health check under load

```javascript
export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate==0'],
  },
};

export default function () {
  const res = http.get('http://localhost:3000/health');
  check(res, { 'healthy': (r) => r.status === 200 });
}
```

### Breakpoint testing (find max capacity)

```javascript
export const options = {
  scenarios: {
    breakpoint: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 500,
      stages: [
        { duration: '10m', target: 500 },  // ramp to 500 RPS
      ],
    },
  },
  thresholds: {
    http_req_failed: [{ threshold: 'rate<0.01', abortOnFail: true }],
  },
};
```

## Tips

- Use `setup()` for one-time auth, not in default function (avoid login per iteration)
- Use `SharedArray` for test data — loaded once, shared across VUs (memory efficient)
- Use `sleep()` between requests to simulate real user think time
- Use `group()` to organize requests into logical transactions
- Set `thresholds` to make tests pass/fail in CI — k6 exits with code 99 on threshold failure
- Use `http.batch()` for parallel requests within a single VU
- Tag requests with `{ tags: { name: 'endpoint' } }` for per-endpoint metrics

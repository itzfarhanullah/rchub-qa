---
name: testing
description: "Jest testing framework for JavaScript and TypeScript - matchers, mocks, snapshots, async testing, and code coverage"
metadata:
  languages: "javascript"
  versions: "30.0.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "jest,testing,javascript,typescript,unit-test,mocking"
---

# Jest Testing Guidelines

## Installation

```bash
npm install --save-dev jest

# TypeScript support
npm install --save-dev jest ts-jest @types/jest
npx ts-jest config:init    # creates jest.config.js for TS
```

## Configuration (jest.config.js)

```javascript
/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',              // or 'jsdom' for browser
  testMatch: ['**/__tests__/**/*.test.{js,ts}', '**/*.test.{js,ts}'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',           // TypeScript
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',     // path aliases
  },
  setupFilesAfterSetup: ['./jest.setup.js'],
  collectCoverageFrom: ['src/**/*.{js,ts}', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
};
```

Add to `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Test Structure

```javascript
describe('Calculator', () => {
  let calc;

  beforeAll(() => {
    // runs once before all tests in this describe
  });

  afterAll(() => {
    // runs once after all tests
  });

  beforeEach(() => {
    calc = new Calculator();
  });

  afterEach(() => {
    // cleanup after each test
  });

  test('adds two numbers', () => {
    expect(calc.add(1, 2)).toBe(3);
  });

  it('subtracts two numbers', () => {  // 'it' is alias for 'test'
    expect(calc.subtract(5, 3)).toBe(2);
  });

  describe('division', () => {
    test('divides correctly', () => {
      expect(calc.divide(10, 2)).toBe(5);
    });

    test('throws on divide by zero', () => {
      expect(() => calc.divide(1, 0)).toThrow('Division by zero');
    });
  });
});

// Skip / focus
test.skip('skipped test', () => {});
test.only('only this runs', () => {});   // use sparingly
test.todo('implement later');
```

## Matchers

### Equality

```javascript
expect(2 + 2).toBe(4);                          // strict equality (===)
expect({ a: 1 }).toEqual({ a: 1 });             // deep equality
expect({ a: 1, b: 2 }).toMatchObject({ a: 1 }); // partial match
expect(value).toStrictEqual(expected);            // deep + type checking
```

### Truthiness

```javascript
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();
expect(value).toBeNaN();
```

### Numbers

```javascript
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3);
expect(value).toBeLessThan(5);
expect(value).toBeLessThanOrEqual(5);
expect(0.1 + 0.2).toBeCloseTo(0.3, 5);          // floating point
```

### Strings

```javascript
expect(str).toMatch(/regex/);
expect(str).toMatch('substring');
expect(str).toContain('substring');
expect(str).toHaveLength(5);
```

### Arrays / Iterables

```javascript
expect(arr).toContain('item');
expect(arr).toContainEqual({ name: 'Alice' });    // deep match in array
expect(arr).toHaveLength(3);
expect(arr).toEqual(expect.arrayContaining([1, 2]));
```

### Objects

```javascript
expect(obj).toHaveProperty('name');
expect(obj).toHaveProperty('address.city', 'NYC');
expect(obj).toEqual(expect.objectContaining({ name: 'Alice' }));
```

### Exceptions

```javascript
expect(() => riskyFunction()).toThrow();
expect(() => riskyFunction()).toThrow('specific message');
expect(() => riskyFunction()).toThrow(TypeError);
expect(() => riskyFunction()).toThrow(/message pattern/);
```

### Negation

```javascript
expect(value).not.toBe(0);
expect(arr).not.toContain('missing');
```

### Custom matchers (expect.extend)

```javascript
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () => `expected ${received} to be within [${floor}, ${ceiling}]`,
    };
  },
});

test('custom matcher', () => {
  expect(100).toBeWithinRange(90, 110);
});
```

## Async Testing

### async/await

```javascript
test('fetches user', async () => {
  const user = await fetchUser('alice');
  expect(user.name).toBe('Alice');
});
```

### Resolves / Rejects

```javascript
test('resolves correctly', () => {
  return expect(fetchUser('alice')).resolves.toEqual({ name: 'Alice' });
});

test('rejects with error', () => {
  return expect(fetchUser('missing')).rejects.toThrow('Not found');
});
```

### Done callback (legacy)

```javascript
test('callback-based', (done) => {
  fetchData((data) => {
    expect(data).toBe('result');
    done();
  });
});
```

## Mock Functions

### jest.fn()

```javascript
const mockFn = jest.fn();
mockFn('arg1', 'arg2');

expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenLastCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenNthCalledWith(1, 'arg1', 'arg2');
expect(mockFn).toHaveReturned();

// Return values
const mock = jest.fn()
  .mockReturnValue('default')
  .mockReturnValueOnce('first call')
  .mockReturnValueOnce('second call');

// Implementation
const mock = jest.fn().mockImplementation((x) => x * 2);
const mock = jest.fn((x) => x * 2);     // shorthand

// Async
const mock = jest.fn()
  .mockResolvedValue({ data: 'result' })
  .mockResolvedValueOnce({ data: 'first' });

const mock = jest.fn().mockRejectedValue(new Error('fail'));

// Reset
mockFn.mockClear();           // clear call history
mockFn.mockReset();           // clear + remove implementations
mockFn.mockRestore();         // restore original (for spyOn)
```

## Module Mocking

### jest.mock()

```javascript
// Auto-mock entire module
jest.mock('./database');

const db = require('./database');
db.query.mockResolvedValue([{ id: 1, name: 'Alice' }]);

test('uses mocked db', async () => {
  const users = await db.query('SELECT * FROM users');
  expect(users).toHaveLength(1);
});
```

### Manual mock with factory

```javascript
jest.mock('./api', () => ({
  fetchUser: jest.fn().mockResolvedValue({ name: 'Alice' }),
  fetchPosts: jest.fn().mockResolvedValue([]),
}));

const { fetchUser } = require('./api');

test('returns mocked user', async () => {
  const user = await fetchUser('alice');
  expect(user.name).toBe('Alice');
});
```

### Partial mock

```javascript
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),     // keep real implementations
  formatDate: jest.fn(() => '2026-01-01'),  // mock only this
}));
```

### __mocks__ directory (manual mocks)

```
src/
  __mocks__/
    axios.js          # auto-used when jest.mock('axios')
  utils/
    __mocks__/
      api.js          # auto-used when jest.mock('./utils/api')
```

```javascript
// __mocks__/axios.js
module.exports = {
  get: jest.fn().mockResolvedValue({ data: {} }),
  post: jest.fn().mockResolvedValue({ data: {} }),
};
```

## Spying

```javascript
const obj = {
  method: (x) => x * 2,
};

const spy = jest.spyOn(obj, 'method');
obj.method(5);

expect(spy).toHaveBeenCalledWith(5);
expect(spy).toHaveReturnedWith(10);

// Override implementation
jest.spyOn(obj, 'method').mockReturnValue(42);

// Spy on module
jest.spyOn(console, 'log').mockImplementation(() => {});

// Restore
spy.mockRestore();
```

## Timer Mocking

```javascript
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test('debounce', () => {
  const callback = jest.fn();
  debounce(callback, 1000)();

  expect(callback).not.toHaveBeenCalled();

  jest.advanceTimersByTime(1000);
  expect(callback).toHaveBeenCalledTimes(1);
});

test('setTimeout', () => {
  const callback = jest.fn();
  setTimeout(callback, 5000);

  jest.runAllTimers();           // run all pending timers
  expect(callback).toHaveBeenCalled();
});

// Other timer controls
jest.advanceTimersByTime(3000);  // advance by ms
jest.runOnlyPendingTimers();     // run current timers only
jest.clearAllTimers();           // remove all timers
jest.now();                      // current fake time
jest.setSystemTime(new Date('2026-01-01'));  // set fake date
```

## Snapshot Testing

```javascript
test('renders correctly', () => {
  const tree = renderer.create(<Button label="Click" />).toJSON();
  expect(tree).toMatchSnapshot();
});

// Inline snapshot
test('serializes', () => {
  expect({ name: 'Alice', age: 30 }).toMatchInlineSnapshot(`
    {
      "age": 30,
      "name": "Alice",
    }
  `);
});

// Update snapshots: jest --updateSnapshot or jest -u
```

## Testing React Components

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';

test('submits login form', async () => {
  const onSubmit = jest.fn();
  render(<Login onSubmit={onSubmit} />);

  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'user@test.com' },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'password' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: 'password',
    });
  });
});

test('shows error message', () => {
  render(<Login error="Invalid credentials" />);
  expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
});
```

## Code Coverage

```bash
jest --coverage
jest --coverage --coverageReporters=text-summary
jest --coverage --collectCoverageFrom='src/**/*.{js,ts}'
```

## Running Tests

```bash
jest                                 # all tests
jest --watch                         # watch mode
jest --watchAll                      # watch all files
jest path/to/test.js                 # specific file
jest -t "test name"                  # filter by name
jest --verbose                       # detailed output
jest --bail                          # stop on first failure
jest --runInBand                     # sequential (no parallel)
jest --detectOpenHandles             # debug hanging tests
jest --forceExit                     # force exit after tests
jest --clearCache                    # clear cache
```

## Common Patterns

### Testing environment variables

```javascript
const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv, API_KEY: 'test-key' };
});

afterEach(() => {
  process.env = originalEnv;
});

test('uses env var', () => {
  expect(getApiKey()).toBe('test-key');
});
```

### Testing error boundaries

```javascript
jest.spyOn(console, 'error').mockImplementation(() => {});

test('error handler', () => {
  expect(() => riskyOperation()).toThrow();
  console.error.mockRestore();
});
```

### Shared test setup

```javascript
// jest.setup.js (referenced in jest.config.js setupFilesAfterSetup)
import '@testing-library/jest-dom';

global.fetch = jest.fn();

afterEach(() => {
  jest.clearAllMocks();
});
```

## Tips

- Use `jest.fn()` for callbacks, `jest.mock()` for modules, `jest.spyOn()` for existing methods
- Call `jest.clearAllMocks()` in `afterEach` to prevent test pollution
- Use `--watch` during development for fast feedback
- Use `toEqual` for objects/arrays, `toBe` for primitives
- Use `mockResolvedValue` / `mockRejectedValue` for async mocks
- Avoid snapshot testing for complex components — prefer explicit assertions
- Use `jest.useFakeTimers()` to test setTimeout/setInterval without real delays
- Use `--runInBand` to debug tests that fail only when run together

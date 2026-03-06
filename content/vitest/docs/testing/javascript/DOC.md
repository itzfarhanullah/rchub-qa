---
name: testing
description: "Vitest modern test runner - matchers, mocking, snapshots, concurrent tests, coverage, and Vite integration"
metadata:
  languages: "javascript"
  versions: "3.0.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "vitest,testing,unit,vite,typescript,mocking"
---

# Vitest Testing Guidelines

## Installation

```bash
npm install -D vitest
npm install -D @vitest/coverage-v8    # coverage
npm install -D @vitest/ui              # browser UI
```

## Quick Start

```typescript
// sum.test.ts
import { describe, it, expect } from 'vitest';
import { sum } from './sum';

describe('sum', () => {
  it('adds two numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });
});
```

```bash
npx vitest           # watch mode (default)
npx vitest run       # single run
npx vitest run --reporter=verbose
```

## Configuration

```typescript
// vitest.config.ts (or in vite.config.ts)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,                     // no need to import describe/it/expect
    environment: 'node',               // or 'jsdom', 'happy-dom'
    include: ['src/**/*.{test,spec}.{ts,js}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
      thresholds: { branches: 80, functions: 80, lines: 80, statements: 80 },
    },
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000,
    pool: 'threads',                   // 'threads' | 'forks' | 'vmThreads'
  },
});
```

## Test Structure

```typescript
import { describe, it, expect, beforeAll, beforeEach, afterAll, afterEach } from 'vitest';

describe('UserService', () => {
  beforeAll(async () => { /* once before all tests */ });
  afterAll(async () => { /* once after all tests */ });
  beforeEach(() => { /* before each test */ });
  afterEach(() => { /* after each test */ });

  it('creates a user', () => { /* ... */ });
  it.skip('pending test', () => { /* skipped */ });
  it.todo('not implemented yet');

  describe.concurrent('parallel tests', () => {
    it('test 1', async () => { /* runs in parallel */ });
    it('test 2', async () => { /* runs in parallel */ });
  });
});

// Conditional
it.skipIf(process.env.CI)('local only test', () => { /* ... */ });
it.runIf(process.env.CI)('CI only test', () => { /* ... */ });
```

## Matchers

```typescript
// Equality
expect(value).toBe(3);                          // strict ===
expect(obj).toEqual({ a: 1, b: 2 });            // deep equal
expect(obj).toStrictEqual({ a: 1 });             // deep equal + type check

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();
expect(value).toBeNaN();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3);
expect(value).toBeLessThan(10);
expect(value).toBeCloseTo(0.3, 5);              // floating point

// Strings
expect(str).toMatch(/pattern/);
expect(str).toContain('substring');
expect(str).toHaveLength(5);

// Arrays
expect(arr).toContain('item');
expect(arr).toContainEqual({ id: 1 });
expect(arr).toHaveLength(3);
expect(arr).toEqual(expect.arrayContaining([1, 2]));

// Objects
expect(obj).toHaveProperty('key');
expect(obj).toHaveProperty('nested.key', 'value');
expect(obj).toMatchObject({ name: 'Alice' });
expect(obj).toEqual(expect.objectContaining({ id: 1 }));

// Exceptions
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('message');
expect(() => fn()).toThrowError(/pattern/);
expect(async () => await asyncFn()).rejects.toThrow();

// Negation
expect(value).not.toBe(5);

// Asymmetric matchers
expect(fn).toHaveBeenCalledWith(expect.any(String), expect.anything());
expect(obj).toEqual({ id: expect.any(Number), name: expect.stringContaining('Al') });
```

## Async Testing

```typescript
// async/await
it('fetches data', async () => {
  const data = await fetchUser(1);
  expect(data.name).toBe('Alice');
});

// Resolves/rejects
it('resolves', async () => {
  await expect(fetchUser(1)).resolves.toEqual({ id: 1, name: 'Alice' });
});

it('rejects', async () => {
  await expect(fetchUser(-1)).rejects.toThrow('Not found');
});
```

## Mocking

### Function mocks

```typescript
import { vi } from 'vitest';

const fn = vi.fn();
fn('arg1');

expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledTimes(1);
expect(fn).toHaveBeenCalledWith('arg1');

// Return values
const fn = vi.fn()
  .mockReturnValue('default')
  .mockReturnValueOnce('first')
  .mockReturnValueOnce('second');

fn(); // 'first'
fn(); // 'second'
fn(); // 'default'

// Implementation
const fn = vi.fn().mockImplementation((x) => x * 2);
expect(fn(3)).toBe(6);

// Async mock
const fn = vi.fn().mockResolvedValue({ id: 1 });
await expect(fn()).resolves.toEqual({ id: 1 });
```

### Module mocking

```typescript
// Auto-mock entire module
vi.mock('./userService');

import { getUser } from './userService';
// getUser is now a vi.fn()

// Mock with implementation
vi.mock('./userService', () => ({
  getUser: vi.fn().mockResolvedValue({ id: 1, name: 'Alice' }),
  createUser: vi.fn().mockResolvedValue({ id: 2 }),
}));

// Partial mock (keep original, override some)
vi.mock('./utils', async (importOriginal) => {
  const original = await importOriginal<typeof import('./utils')>();
  return {
    ...original,
    formatDate: vi.fn().mockReturnValue('2026-01-01'),
  };
});
```

### Spying

```typescript
const obj = { method: (x: number) => x + 1 };
const spy = vi.spyOn(obj, 'method');

obj.method(5);
expect(spy).toHaveBeenCalledWith(5);
expect(spy).toHaveReturnedWith(6);

// Override implementation
vi.spyOn(obj, 'method').mockReturnValue(42);

// Restore
spy.mockRestore();
```

### Timer mocking

```typescript
import { vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

it('runs after delay', () => {
  const fn = vi.fn();
  setTimeout(fn, 1000);

  vi.advanceTimersByTime(1000);
  expect(fn).toHaveBeenCalled();
});

it('runs all pending timers', () => {
  const fn = vi.fn();
  setTimeout(fn, 5000);

  vi.runAllTimers();
  expect(fn).toHaveBeenCalled();
});

// Fake system time
vi.setSystemTime(new Date('2026-01-01'));
expect(new Date().getFullYear()).toBe(2026);
```

### Environment variable mocking

```typescript
it('reads env', () => {
  vi.stubEnv('API_KEY', 'test-key');
  expect(process.env.API_KEY).toBe('test-key');
  vi.unstubAllEnvs();
});
```

## Snapshots

```typescript
it('matches snapshot', () => {
  const result = renderComponent();
  expect(result).toMatchSnapshot();
});

// Inline snapshot
it('inline snapshot', () => {
  expect({ name: 'Alice' }).toMatchInlineSnapshot(`
    {
      "name": "Alice",
    }
  `);
});

// File snapshot
it('file snapshot', () => {
  expect(largeOutput).toMatchFileSnapshot('./snapshots/output.txt');
});
```

```bash
vitest run --update       # update snapshots
```

## Type Testing

```typescript
import { expectTypeOf } from 'vitest';

it('type checks', () => {
  expectTypeOf(fn).toBeFunction();
  expectTypeOf(fn).parameter(0).toBeString();
  expectTypeOf(fn).returns.toBeNumber();
  expectTypeOf<string>().toMatchTypeOf<string | number>();
});
```

## In-Source Testing

```typescript
// src/math.ts
export function add(a: number, b: number) {
  return a + b;
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('add', () => {
    expect(add(1, 2)).toBe(3);
  });
}
```

## Coverage

```bash
npx vitest run --coverage
npx vitest run --coverage --coverage.reporter=html
```

## Running Tests

```bash
vitest                          # watch mode
vitest run                      # single run
vitest run src/auth/            # specific directory
vitest run auth.test.ts         # specific file
vitest run -t "creates user"    # filter by test name
vitest --reporter=verbose       # detailed output
vitest --ui                     # browser UI
vitest --pool=forks             # process isolation
vitest bench                    # benchmarks
```

## Benchmarks

```typescript
import { bench, describe } from 'vitest';

describe('sort performance', () => {
  bench('Array.sort', () => {
    [3, 1, 2].sort();
  });

  bench('custom sort', () => {
    customSort([3, 1, 2]);
  });
});
```

## Common Patterns

### Test setup file

```typescript
// tests/setup.ts
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => { cleanup(); });
```

### Workspace (monorepo)

```typescript
// vitest.workspace.ts
export default [
  'packages/*/vitest.config.ts',
  { test: { name: 'unit', include: ['src/**/*.test.ts'] } },
  { test: { name: 'e2e', include: ['e2e/**/*.test.ts'] } },
];
```

## Tips

- Vitest uses the same config as Vite — if you have `vite.config.ts`, add `test` key there
- Watch mode is the default — use `vitest run` for CI
- `vi.mock()` is hoisted to top of file automatically (like Jest)
- Use `vi.importActual()` inside `vi.mock()` for partial mocks
- Use `pool: 'forks'` for tests that need process isolation (global state, env vars)
- Use `describe.concurrent()` for truly independent parallel tests
- Vitest is Jest-compatible — most Jest tests work with minimal changes
- Use `--reporter=junit` for CI systems that consume JUnit XML

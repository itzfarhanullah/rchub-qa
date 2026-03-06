---
name: testing
description: "Playwright browser automation and testing for web applications - navigation, selectors, assertions, network interception, and visual testing"
metadata:
  languages: "javascript"
  versions: "1.51.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "playwright,testing,browser,automation,e2e,web"
---

# Playwright JavaScript/TypeScript Testing Guidelines

## Installation

```bash
npm install -D @playwright/test
npx playwright install             # download browsers
npx playwright install chromium    # single browser
```

## Quick Start

```typescript
// tests/example.spec.ts
import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example/);
});
```

```bash
npx playwright test
npx playwright test --headed       # show browser
npx playwright test --ui           # UI mode
```

## Configuration (playwright.config.ts)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30000,
  expect: { timeout: 5000 },

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Navigation

```typescript
await page.goto('https://example.com');
await page.goto('/dashboard');                          // uses baseURL
await page.goto('/page', { waitUntil: 'networkidle' });

await page.goBack();
await page.goForward();
await page.reload();

await page.waitForURL('**/dashboard');
```

## Selectors (Locators)

```typescript
// Role-based (preferred)
page.getByRole('button', { name: 'Submit' });
page.getByRole('heading', { name: 'Welcome', level: 1 });
page.getByRole('link', { name: 'About' });
page.getByRole('textbox', { name: 'Email' });
page.getByRole('checkbox', { name: 'Remember me' });
page.getByRole('combobox', { name: 'Country' });

// Text, label, placeholder
page.getByText('Sign In');
page.getByText('Sign In', { exact: true });
page.getByLabel('Email');
page.getByPlaceholder('Enter email');
page.getByAltText('Logo');
page.getByTitle('Close');
page.getByTestId('submit-btn');    // matches data-testid

// CSS
page.locator('button.primary');
page.locator('#login-form');
page.locator('[data-testid="card"]');

// XPath
page.locator('xpath=//button[@type="submit"]');

// Filtering and chaining
page.locator('article').filter({ hasText: 'Playwright' });
page.locator('article').filter({ has: page.getByRole('button') });
page.locator('.card').first();
page.locator('.card').last();
page.locator('.card').nth(2);

// Within a parent
page.locator('.modal').getByRole('button', { name: 'OK' });

// Frame locator
page.frameLocator('#iframe').getByRole('button', { name: 'Submit' });
```

## Actions

```typescript
// Click
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('button', { name: 'Submit' }).dblclick();
await page.getByRole('button', { name: 'Submit' }).click({ button: 'right' });
await page.getByRole('button', { name: 'Submit' }).click({ force: true });

// Fill and type
await page.getByLabel('Email').fill('user@example.com');      // clears first
await page.getByLabel('Email').pressSequentially('user@example.com'); // key by key
await page.getByLabel('Email').press('Enter');
await page.getByLabel('Email').clear();

// Select dropdown
await page.getByLabel('Country').selectOption('US');
await page.getByLabel('Country').selectOption({ label: 'United States' });
await page.getByLabel('Country').selectOption({ index: 2 });

// Checkbox / radio
await page.getByRole('checkbox', { name: 'Agree' }).check();
await page.getByRole('checkbox', { name: 'Agree' }).uncheck();
await page.getByRole('checkbox', { name: 'Agree' }).setChecked(true);

// Hover
await page.getByRole('link', { name: 'Menu' }).hover();

// Drag and drop
await page.locator('#source').dragTo(page.locator('#target'));

// Focus
await page.getByLabel('Email').focus();
```

## Assertions

```typescript
// Page assertions
await expect(page).toHaveTitle('Dashboard');
await expect(page).toHaveTitle(/Dashboard/);
await expect(page).toHaveURL(/.*dashboard/);

// Element assertions
await expect(page.getByRole('button')).toBeVisible();
await expect(page.getByRole('button')).toBeEnabled();
await expect(page.getByRole('button')).toBeDisabled();
await expect(page.getByRole('button')).toHaveText('Submit');
await expect(page.getByRole('button')).toContainText('Sub');
await expect(page.getByLabel('Email')).toHaveValue('user@example.com');
await expect(page.getByLabel('Email')).toHaveAttribute('type', 'email');
await expect(page.locator('.item')).toHaveCount(5);
await expect(page.getByRole('checkbox')).toBeChecked();
await expect(page.locator('.card')).toHaveClass(/active/);
await expect(page.locator('.card')).toHaveCSS('color', 'rgb(0, 0, 0)');

// Negation
await expect(page.locator('.spinner')).not.toBeVisible();

// Custom timeout
await expect(page.locator('.loaded')).toBeVisible({ timeout: 10000 });

// Soft assertions (don't stop test)
await expect.soft(page.locator('.warning')).toBeVisible();
```

## Test Hooks and Fixtures

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test.afterEach(async ({ page }) => {
    // cleanup
  });

  test('valid login', async ({ page }) => {
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('pass');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  test('invalid login shows error', async ({ page }) => {
    await page.getByLabel('Email').fill('bad@test.com');
    await page.getByLabel('Password').fill('wrong');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.locator('.error')).toBeVisible();
  });
});

// Skip / annotate
test.skip('broken test', async ({ page }) => {});
test('conditional skip', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'Not supported in WebKit');
});
test.fixme('needs fixing', async ({ page }) => {});
```

## Custom Fixtures

```typescript
// fixtures.ts
import { test as base, expect } from '@playwright/test';

type MyFixtures = {
  adminPage: Page;
};

export const test = base.extend<MyFixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: 'admin-auth.json' });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect };
```

## Network Interception

```typescript
// Block images
await page.route('**/*.{png,jpg,jpeg,gif}', route => route.abort());

// Mock API
await page.route('**/api/users', route =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ name: 'Alice' }]),
  })
);

// Modify request headers
await page.route('**/api/**', route =>
  route.continue_({
    headers: { ...route.request().headers(), Authorization: 'Bearer token' },
  })
);

// Intercept and modify response
await page.route('**/api/data', async route => {
  const response = await route.fetch();
  const json = await response.json();
  json.modified = true;
  await route.fulfill({ response, body: JSON.stringify(json) });
});

// Wait for specific response
const responsePromise = page.waitForResponse('**/api/data');
await page.getByRole('button', { name: 'Load' }).click();
const response = await responsePromise;
const data = await response.json();
```

## API Testing

```typescript
import { test, expect } from '@playwright/test';

test('API test', async ({ request }) => {
  const response = await request.get('/api/users');
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);

  const users = await response.json();
  expect(users).toHaveLength(3);
});

test('POST request', async ({ request }) => {
  const response = await request.post('/api/users', {
    data: { name: 'Alice', email: 'alice@test.com' },
  });
  expect(response.ok()).toBeTruthy();
});
```

## Screenshots and Video

```typescript
// Full page screenshot
await page.screenshot({ path: 'screenshot.png', fullPage: true });

// Element screenshot
await page.locator('.chart').screenshot({ path: 'chart.png' });

// Visual comparison
await expect(page).toHaveScreenshot('homepage.png');
await expect(page.locator('.card')).toHaveScreenshot('card.png', {
  maxDiffPixelRatio: 0.05,
});

// Video: configure in playwright.config.ts use.video
```

## Tracing

```typescript
// In config: trace: 'on-first-retry'
// Or manually:
await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
// ... actions ...
await context.tracing.stop({ path: 'trace.zip' });
// npx playwright show-trace trace.zip
```

## Multiple Pages / Tabs

```typescript
const [newPage] = await Promise.all([
  context.waitForEvent('page'),
  page.getByRole('link', { name: 'Open' }).click(),
]);
await newPage.waitForLoadState();

// Create new page
const page2 = await context.newPage();
await page2.goto('https://example.com');
```

## Auth State Reuse

```typescript
// auth.setup.ts - run once, save state
import { test as setup, expect } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@test.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('**/dashboard');
  await page.context().storageState({ path: '.auth/user.json' });
});
```

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: { storageState: '.auth/user.json' },
    },
  ],
});
```

## Page Object Model

```typescript
// pages/login.page.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(private page: Page) {
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign In' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

// tests/login.spec.ts
test('login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@test.com', 'password');
  await expect(page).toHaveURL(/dashboard/);
});
```

## Running Tests

```bash
npx playwright test                       # all tests
npx playwright test tests/login.spec.ts   # specific file
npx playwright test -g "login"            # grep by title
npx playwright test --project=chromium    # specific browser
npx playwright test --headed              # show browser
npx playwright test --ui                  # interactive UI
npx playwright test --debug               # step-by-step debugger
npx playwright test --workers=4           # parallel workers
npx playwright show-report                # view HTML report
```

## Common Patterns

### Execute JavaScript

```typescript
const title = await page.evaluate(() => document.title);
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
const sum = await page.evaluate(([a, b]) => a + b, [1, 2]);
```

### Local storage / cookies

```typescript
await context.addCookies([{ name: 'token', value: 'abc', url: 'https://example.com' }]);
const cookies = await context.cookies();

await page.evaluate(() => localStorage.setItem('key', 'value'));
```

### File upload / download

```typescript
await page.getByLabel('Upload').setInputFiles('file.pdf');
await page.getByLabel('Upload').setInputFiles(['a.pdf', 'b.pdf']);
await page.getByLabel('Upload').setInputFiles([]);  // clear

const downloadPromise = page.waitForEvent('download');
await page.getByRole('link', { name: 'Download' }).click();
const download = await downloadPromise;
await download.saveAs('/tmp/file.pdf');
```

### Dialogs

```typescript
page.on('dialog', dialog => dialog.accept());
page.on('dialog', dialog => dialog.accept('my answer'));  // prompt
page.on('dialog', dialog => dialog.dismiss());
```

## Tips

- Prefer `getByRole`, `getByLabel`, `getByText` over CSS/XPath for resilient selectors
- Use `await expect()` assertions — they auto-retry until timeout
- Use `test.describe.configure({ mode: 'serial' })` for sequential tests
- Use `--ui` mode during development for the best debugging experience
- Set `PWDEBUG=1` for step-by-step execution
- Use `await page.pause()` to pause and inspect in headed mode

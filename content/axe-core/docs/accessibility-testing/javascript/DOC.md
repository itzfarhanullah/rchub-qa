---
name: accessibility-testing
description: "axe-core accessibility testing - WCAG compliance, automated a11y audits, Playwright/Cypress integration, and CI/CD checks"
metadata:
  languages: "javascript"
  versions: "4.10.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "axe-core,accessibility,a11y,wcag,aria,testing"
---

# axe-core Accessibility Testing Guidelines

## Installation

```bash
# Core library
npm install -D @axe-core/playwright    # Playwright integration
npm install -D axe-core                # standalone
npm install -D cypress-axe             # Cypress integration

# Optional
npm install -D @axe-core/cli           # CLI scanner
```

## Playwright + axe-core

### Setup

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage has no a11y violations', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
```

### Scan specific element

```typescript
test('navigation is accessible', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .include('nav')
    .analyze();

  expect(results.violations).toEqual([]);
});

// Exclude known problematic areas
test('page minus third-party widget', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .exclude('.third-party-widget')
    .analyze();

  expect(results.violations).toEqual([]);
});
```

### Filter by WCAG level

```typescript
// Only WCAG 2.1 AA (most common requirement)
test('WCAG 2.1 AA compliance', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});

// WCAG 2.2 AA
test('WCAG 2.2 AA', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});

// Best practices (superset of WCAG)
test('best practices', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['best-practice'])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

### Disable specific rules

```typescript
test('ignore color contrast', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .disableRules(['color-contrast'])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

### Detailed violation reporting

```typescript
test('accessible form', async ({ page }) => {
  await page.goto('/signup');

  const results = await new AxeBuilder({ page }).analyze();

  // Log detailed violations for debugging
  for (const violation of results.violations) {
    console.log(`Rule: ${violation.id}`);
    console.log(`Impact: ${violation.impact}`);
    console.log(`Description: ${violation.description}`);
    for (const node of violation.nodes) {
      console.log(`  Element: ${node.html}`);
      console.log(`  Fix: ${node.failureSummary}`);
    }
  }

  expect(results.violations).toEqual([]);
});
```

### Test after interaction

```typescript
test('modal is accessible when open', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open Menu' }).click();

  // Wait for modal to render
  await page.waitForSelector('[role="dialog"]');

  const results = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .analyze();

  expect(results.violations).toEqual([]);
});

test('dropdown is accessible when expanded', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('combobox').click();

  const results = await new AxeBuilder({ page })
    .include('[role="listbox"]')
    .analyze();

  expect(results.violations).toEqual([]);
});
```

## Cypress + axe-core

### Setup

```javascript
// cypress/support/e2e.js
import 'cypress-axe';
```

### Basic usage

```javascript
describe('Accessibility', () => {
  it('homepage has no a11y violations', () => {
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y();
  });

  it('login form is accessible', () => {
    cy.visit('/login');
    cy.injectAxe();
    cy.checkA11y('form');  // scope to form element
  });

  it('WCAG AA only', () => {
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y(null, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa'],
      },
    });
  });

  it('exclude third-party', () => {
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y(null, null, null, {
      exclude: ['.third-party-widget'],
    });
  });

  it('skip color-contrast rule', () => {
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y(null, {
      rules: { 'color-contrast': { enabled: false } },
    });
  });
});
```

### Custom violation logging

```javascript
function logA11yViolations(violations) {
  violations.forEach((v) => {
    const nodes = v.nodes.map((n) => n.html).join('\n');
    cy.log(`${v.impact} - ${v.id}: ${v.description}\n${nodes}`);
  });
}

it('logs violations', () => {
  cy.visit('/');
  cy.injectAxe();
  cy.checkA11y(null, null, logA11yViolations);
});
```

## Standalone axe-core (Node.js)

```javascript
const { JSDOM } = require('jsdom');
const axe = require('axe-core');

async function auditHtml(html) {
  const dom = new JSDOM(html);
  const results = await axe.run(dom.window.document);
  return results.violations;
}

// Usage in tests
it('rendered HTML is accessible', async () => {
  const html = renderComponent(<MyComponent />);
  const violations = await auditHtml(html);
  expect(violations).toHaveLength(0);
});
```

## axe CLI

```bash
# Scan a URL
npx @axe-core/cli https://example.com

# With specific rules
npx @axe-core/cli https://example.com --tags wcag2aa

# Output JSON
npx @axe-core/cli https://example.com --save results.json

# Multiple pages
npx @axe-core/cli https://example.com https://example.com/about
```

## Multi-Page Audit Pattern

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  '/',
  '/about',
  '/login',
  '/signup',
  '/dashboard',
  '/settings',
];

for (const path of pages) {
  test(`${path} has no a11y violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}
```

## Common WCAG Rules Checked

| Rule | What it checks |
|------|---------------|
| `color-contrast` | Text has sufficient contrast ratio (4.5:1 normal, 3:1 large) |
| `image-alt` | Images have alt text |
| `label` | Form elements have labels |
| `link-name` | Links have discernible text |
| `button-name` | Buttons have accessible names |
| `html-has-lang` | `<html>` has lang attribute |
| `landmark-one-main` | Page has exactly one `<main>` |
| `region` | All content is within landmarks |
| `aria-roles` | ARIA roles are valid |
| `aria-required-attr` | Required ARIA attributes present |
| `duplicate-id` | No duplicate IDs |
| `tabindex` | tabindex values are valid |

## CI/CD Integration

```yaml
# GitHub Actions
- name: Accessibility audit
  run: |
    npx playwright test tests/a11y/ --reporter=html
  env:
    BASE_URL: http://localhost:3000

# Fail build on critical/serious violations only
- name: A11y gate
  run: npx @axe-core/cli $BASE_URL --tags wcag2aa --exit
```

## Tips

- Run axe AFTER page is fully rendered — wait for dynamic content before scanning
- Use `.include()` to scope scans to the component under test, not the entire page
- Use `.withTags(['wcag2a', 'wcag2aa'])` for standard compliance — don't test everything
- Use `.disableRules()` sparingly — document WHY a rule is disabled
- Test interactive states (modals, dropdowns, expanded menus) — not just initial page load
- axe catches ~57% of WCAG issues automatically — manual testing still needed for:
  - Keyboard navigation flow
  - Screen reader announcements
  - Focus management
  - Logical reading order
- Run a11y tests in CI to catch regressions early

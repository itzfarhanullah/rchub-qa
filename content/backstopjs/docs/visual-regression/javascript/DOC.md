---
name: visual-regression
description: "BackstopJS visual regression testing - screenshot comparison, responsive testing, scenarios, and CI/CD integration"
metadata:
  languages: "javascript"
  versions: "6.3.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "backstopjs,visual-regression,screenshot,css,ui,testing"
---

# BackstopJS Visual Regression Testing Guidelines

## Installation

```bash
npm install -g backstopjs
# or local
npm install -D backstopjs
```

## Quick Start

```bash
# Initialize project
backstop init

# Creates:
# backstop.json         — config
# backstop_data/        — reference/test screenshots
```

## Configuration (backstop.json)

```json
{
  "id": "my-app",
  "viewports": [
    { "label": "phone", "width": 320, "height": 480 },
    { "label": "tablet", "width": 768, "height": 1024 },
    { "label": "desktop", "width": 1920, "height": 1080 }
  ],
  "scenarios": [
    {
      "label": "Homepage",
      "url": "http://localhost:3000",
      "selectors": ["document"],
      "delay": 500,
      "misMatchThreshold": 0.1
    },
    {
      "label": "Login Page",
      "url": "http://localhost:3000/login",
      "selectors": ["document"],
      "delay": 500
    }
  ],
  "paths": {
    "bitmaps_reference": "backstop_data/bitmaps_reference",
    "bitmaps_test": "backstop_data/bitmaps_test",
    "html_report": "backstop_data/html_report"
  },
  "engine": "playwright",
  "engineOptions": {
    "browser": "chromium",
    "args": ["--no-sandbox"]
  },
  "report": ["browser"],
  "debug": false
}
```

## Workflow

```bash
# 1. Capture reference screenshots (baseline)
backstop reference

# 2. Run test (compare against reference)
backstop test

# 3. Review visual diff in browser report
# Opens automatically after test

# 4. Approve changes (update reference)
backstop approve
```

## Scenarios

### Basic page

```json
{
  "label": "Product Page",
  "url": "http://localhost:3000/products/1",
  "selectors": ["document"],
  "delay": 1000
}
```

### Specific selectors

```json
{
  "label": "Navigation",
  "url": "http://localhost:3000",
  "selectors": ["nav.main-nav", ".hero-section", "footer"],
  "selectorExpansion": true
}
```

### Hover/click interactions

```json
{
  "label": "Dropdown menu open",
  "url": "http://localhost:3000",
  "hoverSelector": ".dropdown-trigger",
  "postInteractionWait": 500,
  "selectors": [".dropdown-menu"]
}
```

```json
{
  "label": "Modal open",
  "url": "http://localhost:3000",
  "clickSelector": ".open-modal-btn",
  "postInteractionWait": 1000,
  "selectors": [".modal"]
}
```

### Scroll to element

```json
{
  "label": "Footer section",
  "url": "http://localhost:3000",
  "scrollToSelector": "footer",
  "selectors": ["footer"]
}
```

### Login-required pages

```json
{
  "label": "Dashboard (authenticated)",
  "url": "http://localhost:3000/dashboard",
  "cookiePath": "backstop_data/cookies.json",
  "selectors": ["document"]
}
```

### Hide/remove elements

```json
{
  "label": "Page without ads",
  "url": "http://localhost:3000",
  "hideSelectors": [".ad-banner", ".cookie-popup"],
  "removeSelectors": [".dynamic-timestamp"],
  "selectors": ["document"]
}
```

### Keyboard input

```json
{
  "label": "Search results",
  "url": "http://localhost:3000",
  "keyPressSelectors": [
    { "selector": "input[name='search']", "keyPress": "test query" }
  ],
  "postInteractionWait": 2000,
  "selectors": [".search-results"]
}
```

## Custom Scripts (onBefore / onReady)

### onBefore — run before screenshot

```javascript
// backstop_data/engine_scripts/onBefore.js
module.exports = async (page, scenario, viewport, isReference, browserContext) => {
  // Set cookies, localStorage, etc.
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
  });
};
```

### onReady — run after page loads, before screenshot

```javascript
// backstop_data/engine_scripts/onReady.js
module.exports = async (page, scenario, viewport) => {
  // Wait for animations to complete
  await page.waitForTimeout(1000);

  // Dismiss popups
  const popup = await page.$('.cookie-banner .dismiss');
  if (popup) await popup.click();

  // Scroll to trigger lazy loading
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
};
```

### Per-scenario scripts

```json
{
  "label": "After login",
  "url": "http://localhost:3000/dashboard",
  "onBeforeScript": "login.js",
  "selectors": ["document"]
}
```

```javascript
// backstop_data/engine_scripts/login.js
module.exports = async (page, scenario) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', 'test@test.com');
  await page.fill('input[name="password"]', 'secret');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
};
```

## Mismatch Threshold

```json
{
  "label": "Fuzzy match page",
  "url": "http://localhost:3000",
  "misMatchThreshold": 0.5,
  "requireSameDimensions": true,
  "selectors": ["document"]
}
```

- `0.0` — pixel-perfect match
- `0.1` — default, allows tiny anti-aliasing differences
- `0.5` — looser match for dynamic content
- `5.0` — very loose (only catches major layout changes)

## Responsive Testing

```json
{
  "viewports": [
    { "label": "iPhone SE", "width": 375, "height": 667 },
    { "label": "iPad", "width": 768, "height": 1024 },
    { "label": "Desktop", "width": 1440, "height": 900 },
    { "label": "Ultrawide", "width": 2560, "height": 1080 }
  ]
}
```

Each scenario runs against ALL viewports — catches responsive breakpoint regressions.

## CI/CD Integration

```yaml
# GitHub Actions
- name: Visual regression test
  run: |
    npm start &                    # start app
    sleep 5
    npx backstop test --config=backstop.json
  continue-on-error: false

- name: Upload visual diff report
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: backstop-report
    path: backstop_data/html_report/
```

```bash
# Docker (consistent rendering)
docker run --rm -v $(pwd):/src backstopjs/backstopjs test --config=/src/backstop.json
```

## Common Patterns

### Dynamic content masking

```json
{
  "label": "Dashboard",
  "url": "http://localhost:3000/dashboard",
  "hideSelectors": [
    ".timestamp",
    ".user-avatar",
    ".random-banner"
  ],
  "selectors": ["document"]
}
```

### Multi-environment testing

```bash
# Test staging against production references
BACKSTOP_URL=https://staging.example.com backstop test

# In backstop.json, use env var
{
  "url": "${BACKSTOP_URL}/products"
}
```

### Component-level testing

```json
{
  "scenarios": [
    { "label": "Button - default", "url": "http://localhost:6006/iframe.html?id=button--default", "selectors": ["#storybook-root"] },
    { "label": "Button - hover", "url": "http://localhost:6006/iframe.html?id=button--default", "hoverSelector": "button", "selectors": ["#storybook-root"] },
    { "label": "Button - disabled", "url": "http://localhost:6006/iframe.html?id=button--disabled", "selectors": ["#storybook-root"] }
  ]
}
```

## Tips

- Use `hideSelectors` for dynamic content (timestamps, avatars, ads) to avoid false positives
- Use `delay` or `postInteractionWait` for animation-heavy pages
- Run in Docker for consistent cross-platform rendering
- Set `misMatchThreshold: 0.1` for most scenarios — pixel-perfect (0.0) causes too many false positives
- Use `selectorExpansion: true` to screenshot each selector individually
- Commit `backstop_data/bitmaps_reference/` to git — it IS your baseline
- Use `onReady` scripts to dismiss popups, wait for fonts, and trigger lazy loading
- Run `backstop approve` only after manual review of the diff report

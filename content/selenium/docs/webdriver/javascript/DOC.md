---
name: webdriver
description: "Selenium WebDriver for browser automation and testing - element interaction, waits, alerts, frames, and cross-browser testing"
metadata:
  languages: "javascript"
  versions: "4.28.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "selenium,webdriver,testing,browser,automation,e2e"
---

# Selenium WebDriver JavaScript Guidelines

## Installation

```bash
npm install selenium-webdriver
# No separate driver download needed - Selenium Manager handles it
```

## Quick Start

```javascript
const { Builder, By, until } = require('selenium-webdriver');

(async function example() {
  const driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get('https://example.com');
    console.log(await driver.getTitle());

    const heading = await driver.findElement(By.tagName('h1'));
    console.log(await heading.getText());
  } finally {
    await driver.quit();
  }
})();
```

## Browser Options

### Chrome

```javascript
const chrome = require('selenium-webdriver/chrome');

const options = new chrome.Options();
options.addArguments('--headless=new');
options.addArguments('--no-sandbox');
options.addArguments('--disable-dev-shm-usage');
options.addArguments('--window-size=1920,1080');

const driver = await new Builder()
  .forBrowser('chrome')
  .setChromeOptions(options)
  .build();
```

### Firefox

```javascript
const firefox = require('selenium-webdriver/firefox');

const options = new firefox.Options();
options.addArguments('--headless');

const driver = await new Builder()
  .forBrowser('firefox')
  .setFirefoxOptions(options)
  .build();
```

## Navigation

```javascript
await driver.get('https://example.com');
await driver.navigate().back();
await driver.navigate().forward();
await driver.navigate().refresh();

const url = await driver.getCurrentUrl();
const title = await driver.getTitle();
```

## Finding Elements

```javascript
const { By } = require('selenium-webdriver');

// By ID
await driver.findElement(By.id('username'));

// By CSS
await driver.findElement(By.css('button.submit'));
await driver.findElement(By.css('[data-testid="login"]'));

// By XPath
await driver.findElement(By.xpath('//button[@type="submit"]'));
await driver.findElement(By.xpath('//span[text()="Submit"]'));

// By class name
await driver.findElement(By.className('error-message'));

// By tag name
await driver.findElement(By.tagName('h1'));

// By link text
await driver.findElement(By.linkText('Click here'));
await driver.findElement(By.partialLinkText('Click'));

// By name
await driver.findElement(By.name('email'));

// Multiple elements
const items = await driver.findElements(By.css('.list-item'));
for (const item of items) {
  console.log(await item.getText());
}
```

## Element Interactions

```javascript
// Click
await driver.findElement(By.id('submit')).click();

// Type text
const input = await driver.findElement(By.id('email'));
await input.clear();
await input.sendKeys('user@example.com');

// Submit form
await input.submit();

// Get text and attributes
const text = await driver.findElement(By.id('message')).getText();
const href = await driver.findElement(By.tagName('a')).getAttribute('href');
const value = await driver.findElement(By.id('input')).getAttribute('value');

// Check state
await element.isDisplayed();
await element.isEnabled();
await element.isSelected();

// Get CSS property
const color = await element.getCssValue('color');
```

## Waits

### Implicit Wait

```javascript
await driver.manage().setTimeouts({ implicit: 10000 });
```

### Explicit Wait (preferred)

```javascript
const { until } = require('selenium-webdriver');

// Wait for element to be located
const el = await driver.wait(until.elementLocated(By.id('result')), 10000);

// Wait for element to be visible
await driver.wait(until.elementIsVisible(el), 10000);

// Wait for element to be enabled
await driver.wait(until.elementIsEnabled(el), 10000);

// Wait for title
await driver.wait(until.titleContains('Dashboard'), 10000);

// Wait for URL
await driver.wait(until.urlContains('/dashboard'), 10000);

// Wait for alert
await driver.wait(until.alertIsPresent(), 5000);

// Wait for element to become stale (removed from DOM)
await driver.wait(until.stalenessOf(element), 10000);

// Custom condition
await driver.wait(async () => {
  const text = await driver.findElement(By.id('count')).getText();
  return text === '5';
}, 10000);
```

## Actions API

```javascript
const { Key } = require('selenium-webdriver');

const actions = driver.actions({ async: true });

// Hover
await actions.move({ origin: element }).perform();

// Right-click
await actions.contextClick(element).perform();

// Double-click
await actions.doubleClick(element).perform();

// Drag and drop
await actions.dragAndDrop(source, target).perform();

// Key combinations
await actions.keyDown(Key.CONTROL).sendKeys('a').keyUp(Key.CONTROL).perform();

// Scroll
await actions.scroll(0, 0, 0, 500).perform();
await driver.actions().scroll(0, 0, 0, 0, element).perform();  // to element
```

## Keyboard Input

```javascript
const { Key } = require('selenium-webdriver');

await element.sendKeys('hello');
await element.sendKeys(Key.ENTER);
await element.sendKeys(Key.TAB);
await element.sendKeys(Key.ESCAPE);
await element.sendKeys(Key.BACK_SPACE);
await element.sendKeys(Key.CONTROL, 'a');   // Select all
```

## Alerts

```javascript
const alert = await driver.switchTo().alert();

// Get text
console.log(await alert.getText());

// Accept
await alert.accept();

// Dismiss
await alert.dismiss();

// Send text (prompt)
await alert.sendKeys('my input');
await alert.accept();
```

## Frames

```javascript
// By element
const iframe = await driver.findElement(By.tagName('iframe'));
await driver.switchTo().frame(iframe);

// By name/id
await driver.switchTo().frame('frame-name');

// By index
await driver.switchTo().frame(0);

// Back to main
await driver.switchTo().defaultContent();

// Parent frame
await driver.switchTo().parentFrame();
```

## Windows and Tabs

```javascript
// Current handle
const mainWindow = await driver.getWindowHandle();

// Open new tab
await driver.switchTo().newWindow('tab');

// Open new window
await driver.switchTo().newWindow('window');

// Switch between windows
const handles = await driver.getAllWindowHandles();
for (const handle of handles) {
  await driver.switchTo().window(handle);
  const title = await driver.getTitle();
  if (title.includes('target')) break;
}

// Close and switch back
await driver.close();
await driver.switchTo().window(mainWindow);
```

## JavaScript Execution

```javascript
// Execute script
await driver.executeScript('window.scrollTo(0, document.body.scrollHeight)');

// Return value
const title = await driver.executeScript('return document.title');

// Pass element
await driver.executeScript('arguments[0].scrollIntoView(true)', element);
await driver.executeScript('arguments[0].click()', element);

// Async script
const result = await driver.executeAsyncScript(`
  const callback = arguments[arguments.length - 1];
  setTimeout(() => callback('done'), 1000);
`);
```

## Screenshots

```javascript
// Full page as base64
const image = await driver.takeScreenshot();
require('fs').writeFileSync('screenshot.png', image, 'base64');

// Element screenshot (returns base64)
const elImage = await element.takeScreenshot();
```

## Cookies

```javascript
// Get all
const cookies = await driver.manage().getCookies();

// Get specific
const cookie = await driver.manage().getCookie('session_id');

// Add
await driver.manage().addCookie({
  name: 'token',
  value: 'abc123',
  domain: '.example.com',
});

// Delete
await driver.manage().deleteCookie('token');
await driver.manage().deleteAllCookies();
```

## File Upload

```javascript
const upload = await driver.findElement(By.css('input[type="file"]'));
await upload.sendKeys('/path/to/file.pdf');
```

## Window Management

```javascript
await driver.manage().window().maximize();
await driver.manage().window().minimize();
await driver.manage().window().setRect({ width: 1920, height: 1080, x: 0, y: 0 });
const rect = await driver.manage().window().getRect();
```

## Mocha/Jest Integration

### With Mocha

```javascript
const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

describe('Homepage', function () {
  this.timeout(30000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  it('should have correct title', async () => {
    await driver.get('https://example.com');
    const title = await driver.getTitle();
    assert.ok(title.includes('Example'));
  });
});
```

### With Jest

```javascript
const { Builder, By, until } = require('selenium-webdriver');

let driver;

beforeAll(async () => {
  driver = await new Builder().forBrowser('chrome').build();
}, 30000);

afterAll(async () => {
  await driver.quit();
});

test('homepage has title', async () => {
  await driver.get('https://example.com');
  const title = await driver.getTitle();
  expect(title).toContain('Example');
}, 15000);
```

## Common Patterns

### Wait for page load

```javascript
await driver.wait(async () => {
  const state = await driver.executeScript('return document.readyState');
  return state === 'complete';
}, 30000);
```

### Page Object Model

```javascript
class LoginPage {
  constructor(driver) {
    this.driver = driver;
    this.url = 'https://example.com/login';
  }

  async open() {
    await this.driver.get(this.url);
  }

  async login(email, password) {
    await this.driver.findElement(By.id('email')).sendKeys(email);
    await this.driver.findElement(By.id('password')).sendKeys(password);
    await this.driver.findElement(By.css('button[type="submit"]')).click();
  }
}
```

## Tips

- Always use explicit waits (`driver.wait`) over `setTimeout` or implicit waits
- Use `findElements` (plural) to check existence without throwing
- Always `await driver.quit()` in cleanup to prevent zombie browser processes
- Use `--headless=new` for Chrome headless mode
- Set page load timeout: `await driver.manage().setTimeouts({ pageLoad: 30000 })`
- Use CSS selectors over XPath when possible for better performance

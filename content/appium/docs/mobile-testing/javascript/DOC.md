---
name: mobile-testing
description: "Appium mobile automation for iOS and Android testing - element interaction, gestures, device capabilities, and hybrid app testing"
metadata:
  languages: "javascript"
  versions: "3.7.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "appium,mobile,testing,automation,ios,android"
---

# Appium JavaScript (WebdriverIO) Guidelines

## Installation

```bash
npm install webdriverio
npm install -g appium
appium driver install uiautomator2    # Android
appium driver install xcuitest        # iOS
```

## Quick Start

```javascript
const { remote } = require('webdriverio');

(async () => {
  const driver = await remote({
    hostname: 'localhost',
    port: 4723,
    path: '/',
    capabilities: {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'emulator-5554',
      'appium:app': '/path/to/app.apk',
    },
  });

  const el = await driver.$('~loginButton');  // accessibility id
  await el.click();

  await driver.deleteSession();
})();
```

## Android Capabilities

```javascript
const driver = await remote({
  hostname: 'localhost',
  port: 4723,
  path: '/',
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:platformVersion': '14',
    'appium:deviceName': 'emulator-5554',
    'appium:app': '/path/to/app.apk',
    'appium:noReset': true,
    'appium:autoGrantPermissions': true,
    'appium:newCommandTimeout': 300,
    // For installed app (no .apk)
    // 'appium:appPackage': 'com.example.app',
    // 'appium:appActivity': 'com.example.app.MainActivity',
  },
});
```

## iOS Capabilities

```javascript
const driver = await remote({
  hostname: 'localhost',
  port: 4723,
  path: '/',
  capabilities: {
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:platformVersion': '17.0',
    'appium:deviceName': 'iPhone 15',
    'appium:app': '/path/to/app.ipa',
    'appium:noReset': true,
    'appium:autoAcceptAlerts': true,
    // For installed app
    // 'appium:bundleId': 'com.example.app',
  },
});
```

## Finding Elements

```javascript
// Accessibility ID (preferred - cross-platform)
const el = await driver.$('~loginButton');
const els = await driver.$$('~listItem');

// ID (resource-id on Android)
await driver.$('id=com.example.app:id/username');

// XPath
await driver.$('//android.widget.Button[@text="Login"]');
await driver.$('//XCUIElementTypeButton[@name="Login"]');

// Class name
await driver.$('android.widget.EditText');
await driver.$('XCUIElementTypeTextField');

// Android UIAutomator
await driver.$('android=new UiSelector().text("Login")');
await driver.$('android=new UiSelector().resourceId("com.example.app:id/btn")');

// iOS predicate
await driver.$('-ios predicate string:label == "Login" AND type == "XCUIElementTypeButton"');

// iOS class chain
await driver.$('-ios class chain:**/XCUIElementTypeButton[`label == "Login"`]');

// Multiple elements
const buttons = await driver.$$('android.widget.Button');
for (const btn of buttons) {
  console.log(await btn.getText());
}
```

## Element Interactions

```javascript
// Tap
await element.click();

// Type text
await element.setValue('hello@example.com');

// Clear
await element.clearValue();

// Get text
const text = await element.getText();

// Get attribute
const value = await element.getAttribute('text');        // Android
const label = await element.getAttribute('value');       // iOS
const enabled = await element.getAttribute('enabled');

// Check state
await element.isDisplayed();
await element.isEnabled();
await element.isExisting();

// Location and size
const location = await element.getLocation();   // { x, y }
const size = await element.getSize();           // { width, height }
```

## Gestures and Touch Actions

### Mobile Gesture Commands (recommended)

Use `driver.execute('mobile: <gesture>', {...})` for reliable gestures. Preferred over deprecated `touchPerform`.

```javascript
// Tap at coordinates (Android)
await driver.execute('mobile: clickGesture', { x: 500, y: 500 });

// Tap element
await driver.execute('mobile: clickGesture', { elementId: element.elementId });

// Double tap
await driver.execute('mobile: doubleClickGesture', { elementId: element.elementId });

// Drag and drop
await driver.execute('mobile: dragGesture', {
  elementId: element.elementId, endX: 500, endY: 500,
});
```

### Swipe

```javascript
// Mobile gesture (recommended, Android)
await driver.execute('mobile: swipeGesture', {
  left: 100, top: 100, width: 200, height: 200,
  direction: 'up', percent: 0.75,
});

// Swipe up (scroll down) using touchPerform (fallback)
const { width, height } = await driver.getWindowSize();
await driver.touchPerform([
  { action: 'press', options: { x: width / 2, y: height * 0.75 } },
  { action: 'wait', options: { ms: 500 } },
  { action: 'moveTo', options: { x: width / 2, y: height * 0.25 } },
  { action: 'release' },
]);
```

### Long Press

```javascript
// Android
await driver.execute('mobile: longClickGesture', {
  elementId: element.elementId,
  duration: 2000,
});
```

### Scroll (Android)

```javascript
// UiScrollable via selector
await driver.$('android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text("Target"))');

// Mobile gesture
await driver.execute('mobile: scrollGesture', {
  left: 100, top: 100, width: 200, height: 200,
  direction: 'down', percent: 3.0,
});
```

### Scroll (iOS)

```javascript
await driver.execute('mobile: scroll', {
  direction: 'down',
  elementId: element.elementId,
});
```

### Pinch and Zoom (Android)

```javascript
await driver.execute('mobile: pinchOpenGesture', {
  elementId: element.elementId,
  percent: 0.75,
});

await driver.execute('mobile: pinchCloseGesture', {
  elementId: element.elementId,
  percent: 0.75,
});
```

## Waiting

```javascript
// Wait for element to exist
const el = await driver.$('~welcome');
await el.waitForExist({ timeout: 10000 });

// Wait for displayed
await el.waitForDisplayed({ timeout: 10000 });

// Wait for enabled
await el.waitForEnabled({ timeout: 5000 });

// Wait until not displayed
await el.waitForDisplayed({ timeout: 5000, reverse: true });

// Custom wait
await driver.waitUntil(
  async () => (await driver.$('~status').getText()) === 'Ready',
  { timeout: 10000, timeoutMsg: 'Status not ready' }
);
```

## Hybrid Apps (WebView)

```javascript
// List contexts
const contexts = await driver.getContexts();
// ['NATIVE_APP', 'WEBVIEW_com.example.app']

// Switch to webview
await driver.switchContext('WEBVIEW_com.example.app');

// Use web selectors
await driver.$('#login-form input[name="email"]').setValue('user@test.com');

// Switch back
await driver.switchContext('NATIVE_APP');

// Current context
const ctx = await driver.getContext();
```

## Device Actions

### Orientation

```javascript
await driver.setOrientation('LANDSCAPE');
await driver.setOrientation('PORTRAIT');
const orientation = await driver.getOrientation();
```

### Keyboard

```javascript
await driver.hideKeyboard();
const shown = await driver.isKeyboardShown();

// Press key (Android)
await driver.pressKeyCode(4);   // Back
await driver.pressKeyCode(3);   // Home
await driver.pressKeyCode(66);  // Enter
```

### App Management

```javascript
// Background
await driver.background(5);  // seconds

// Terminate and activate
await driver.terminateApp('com.example.app');
await driver.activateApp('com.example.app');

// App state
const state = await driver.queryAppState('com.example.app');
// 0=not installed, 1=not running, 3=background, 4=foreground

// Install / remove
await driver.installApp('/path/to/app.apk');
await driver.removeApp('com.example.app');
const installed = await driver.isAppInstalled('com.example.app');
```

### Notifications (Android)

```javascript
await driver.openNotifications();
const notification = await driver.$('//android.widget.TextView[@text="Title"]');
await notification.click();
```

## Screenshots and Recording

```javascript
// Screenshot
await driver.saveScreenshot('./screen.png');
const base64 = await driver.takeScreenshot();

// Element screenshot
const elBase64 = await element.takeScreenshot();

// Screen recording
await driver.startRecordingScreen();
// ... actions ...
const video = await driver.stopRecordingScreen();
require('fs').writeFileSync('recording.mp4', video, 'base64');
```

## File Operations

```javascript
// Push file
const data = Buffer.from('file content').toString('base64');
await driver.pushFile('/sdcard/test.txt', data);

// Pull file
const fileBase64 = await driver.pullFile('/sdcard/test.txt');
const content = Buffer.from(fileBase64, 'base64').toString();
```

## Mocha Integration

```javascript
const { remote } = require('webdriverio');

describe('App Tests', function () {
  this.timeout(60000);
  let driver;

  before(async () => {
    driver = await remote({
      hostname: 'localhost',
      port: 4723,
      path: '/',
      capabilities: {
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': 'emulator-5554',
        'appium:app': '/path/to/app.apk',
        'appium:autoGrantPermissions': true,
      },
    });
  });

  after(async () => {
    await driver.deleteSession();
  });

  it('should login successfully', async () => {
    await driver.$('~email').setValue('user@test.com');
    await driver.$('~password').setValue('pass123');
    await driver.$('~loginButton').click();

    const welcome = await driver.$('~welcomeMessage');
    await welcome.waitForDisplayed({ timeout: 10000 });
    const text = await welcome.getText();
    expect(text).to.include('Welcome');
  });
});
```

## Common Patterns

### Handle permission dialogs (Android)

```javascript
// Set autoGrantPermissions in capabilities
// Or handle manually:
try {
  const allow = await driver.$('id=com.android.permissioncontroller:id/permission_allow_button');
  if (await allow.isExisting()) {
    await allow.click();
  }
} catch (e) {
  // No dialog
}
```

### Handle iOS alerts

```javascript
// Set autoAcceptAlerts in capabilities
// Or handle manually:
try {
  await driver.acceptAlert();
} catch (e) {
  // No alert
}
```

### Wait for app ready

```javascript
async function waitForAppReady(driver, timeout = 30000) {
  const home = await driver.$('~homeScreen');
  await home.waitForDisplayed({ timeout });
}
```

## Tips

- Use accessibility ID (`~`) as primary locator — works cross-platform
- Use `autoGrantPermissions` (Android) and `autoAcceptAlerts` (iOS) for system dialogs
- Set `newCommandTimeout` high enough for long test suites
- Use `noReset: true` to speed up tests by keeping app state
- For Android scrolling, `UiScrollable` selectors are most reliable
- Use `await driver.getPageSource()` to inspect element tree for debugging
- Keep Appium and drivers updated: `appium driver update uiautomator2`

---
name: mobile-testing
description: "Appium mobile automation for iOS and Android testing - element interaction, gestures, device capabilities, and hybrid app testing"
metadata:
  languages: "python"
  versions: "4.5.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "appium,mobile,testing,automation,ios,android"
---

# Appium Python Client Guidelines

## Installation

```bash
pip install Appium-Python-Client

# Appium server (install separately)
npm install -g appium
appium driver install uiautomator2    # Android
appium driver install xcuitest        # iOS

# Start server
appium
```

## Quick Start

```python
from appium import webdriver
from appium.options import UiAutomator2Options  # Android
# from appium.options import XCUITestOptions     # iOS

options = UiAutomator2Options()
options.platform_name = "Android"
options.device_name = "emulator-5554"
options.app = "/path/to/app.apk"

driver = webdriver.Remote("http://localhost:4723", options=options)

# Find and interact with elements
el = driver.find_element(by="accessibility id", value="Login")
el.click()

driver.quit()
```

## Android Capabilities (UiAutomator2)

```python
from appium.options import UiAutomator2Options

options = UiAutomator2Options()
options.platform_name = "Android"
options.platform_version = "14"
options.device_name = "emulator-5554"
options.app = "/path/to/app.apk"
options.automation_name = "UiAutomator2"

# Common options
options.no_reset = True              # don't reset app state
options.full_reset = False           # don't uninstall app
options.auto_grant_permissions = True
options.new_command_timeout = 300

# For installed app (no .apk)
options.app_package = "com.example.app"
options.app_activity = "com.example.app.MainActivity"

driver = webdriver.Remote("http://localhost:4723", options=options)
```

## iOS Capabilities (XCUITest)

```python
from appium.options import XCUITestOptions

options = XCUITestOptions()
options.platform_name = "iOS"
options.platform_version = "17.0"
options.device_name = "iPhone 15"
options.app = "/path/to/app.ipa"
options.automation_name = "XCUITest"

# Common options
options.no_reset = True
options.auto_accept_alerts = True
options.use_new_wda = False

# For installed app
options.bundle_id = "com.example.app"

driver = webdriver.Remote("http://localhost:4723", options=options)
```

## Finding Elements

```python
from appium.webdriver.common.appiumby import AppiumBy

# Accessibility ID (preferred - works on both platforms)
driver.find_element(AppiumBy.ACCESSIBILITY_ID, "loginButton")

# XPath
driver.find_element(AppiumBy.XPATH, "//android.widget.Button[@text='Login']")
driver.find_element(AppiumBy.XPATH, "//XCUIElementTypeButton[@name='Login']")

# Class name
driver.find_element(AppiumBy.CLASS_NAME, "android.widget.EditText")
driver.find_element(AppiumBy.CLASS_NAME, "XCUIElementTypeTextField")

# ID (resource-id on Android)
driver.find_element(AppiumBy.ID, "com.example.app:id/username")

# Android UIAutomator2 selector (powerful, Android only)
driver.find_element(AppiumBy.ANDROID_UIAUTOMATOR,
    'new UiSelector().text("Login")')
driver.find_element(AppiumBy.ANDROID_UIAUTOMATOR,
    'new UiSelector().resourceId("com.example.app:id/username")')
driver.find_element(AppiumBy.ANDROID_UIAUTOMATOR,
    'new UiSelector().className("android.widget.Button").instance(0)')
driver.find_element(AppiumBy.ANDROID_UIAUTOMATOR,
    'new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text("Target"))')

# iOS predicate string (iOS only)
driver.find_element(AppiumBy.IOS_PREDICATE,
    'label == "Login" AND type == "XCUIElementTypeButton"')
driver.find_element(AppiumBy.IOS_PREDICATE,
    'name BEGINSWITH "user"')

# iOS class chain (iOS only)
driver.find_element(AppiumBy.IOS_CLASS_CHAIN,
    '**/XCUIElementTypeButton[`label == "Login"`]')

# Find multiple
elements = driver.find_elements(AppiumBy.CLASS_NAME, "android.widget.Button")
```

## Element Interactions

```python
# Tap/click
element.click()

# Type text
element.send_keys("hello@example.com")

# Clear text
element.clear()

# Get text
text = element.text

# Get attribute
value = element.get_attribute("text")         # Android
value = element.get_attribute("value")        # iOS
enabled = element.get_attribute("enabled")
checked = element.get_attribute("checked")    # Android

# Check state
element.is_displayed()
element.is_enabled()
element.is_selected()

# Get location and size
loc = element.location     # {'x': 100, 'y': 200}
size = element.size        # {'width': 300, 'height': 50}
rect = element.rect        # combined
```

## Touch Actions and Gestures

### Mobile Gesture Commands (recommended)

Use `driver.execute_script('mobile: <gesture>', {...})` for reliable cross-platform gestures. These are Appium's built-in gesture commands and the preferred approach over raw W3C actions.

```python
# Tap at coordinates (Android)
driver.execute_script('mobile: clickGesture', {'x': 500, 'y': 500})

# Tap element
driver.execute_script('mobile: clickGesture', {'elementId': element.id})

# Double tap
driver.execute_script('mobile: doubleClickGesture', {'elementId': element.id})

# Drag and drop
driver.execute_script('mobile: dragGesture', {
    'elementId': element.id,
    'endX': 500,
    'endY': 500,
})

# Fling (fast swipe, Android)
driver.execute_script('mobile: flingGesture', {
    'left': 100, 'top': 200, 'width': 800, 'height': 1000,
    'direction': 'down', 'speed': 5000,
})
```

### W3C Actions (low-level, for custom gestures)

```python
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.actions.pointer_input import PointerInput
from selenium.webdriver.common.actions import interaction

# Custom tap at coordinates using W3C pointer actions
actions = ActionChains(driver)
finger = actions.w3c_actions.add_pointer_input("touch", "finger")
finger.create_pointer_move(x=500, y=500)
finger.create_pointer_down()
finger.create_pause(0.1)
finger.create_pointer_up()
actions.perform()

# Custom swipe using W3C actions
actions = ActionChains(driver)
finger = actions.w3c_actions.add_pointer_input("touch", "finger")
finger.create_pointer_move(x=500, y=1500)
finger.create_pointer_down()
finger.create_pause(0.05)
finger.create_pointer_move(x=500, y=500, duration=250)
finger.create_pointer_up()
actions.perform()
```

> Prefer `mobile: <gesture>` commands for standard gestures. Use W3C actions only when you need fine-grained multi-touch control (e.g., two-finger rotation).

### Swipe

```python
def swipe(driver, start_x, start_y, end_x, end_y, duration=800):
    """Swipe from one point to another."""
    driver.swipe(start_x, start_y, end_x, end_y, duration)

# Swipe up (scroll down)
size = driver.get_window_size()
swipe(driver, size['width']//2, size['height']*3//4,
      size['width']//2, size['height']//4)

# Swipe down (scroll up)
swipe(driver, size['width']//2, size['height']//4,
      size['width']//2, size['height']*3//4)

# Swipe left
swipe(driver, size['width']*3//4, size['height']//2,
      size['width']//4, size['height']//2)

# Swipe right
swipe(driver, size['width']//4, size['height']//2,
      size['width']*3//4, size['height']//2)
```

### Long Press

```python
# Using mobile: gesture command (recommended)
driver.execute_script('mobile: longClickGesture', {
    'elementId': element.id,
    'duration': 2000
})
```

### Scroll (Android UiScrollable)

```python
# Scroll to element by text (Android)
driver.find_element(AppiumBy.ANDROID_UIAUTOMATOR,
    'new UiScrollable(new UiSelector().scrollable(true))'
    '.scrollIntoView(new UiSelector().text("Target Item"))')

# iOS scroll
driver.execute_script('mobile: scroll', {
    'direction': 'down',
    'elementId': element.id
})
```

### Pinch and Zoom

```python
# Android
driver.execute_script('mobile: pinchOpenGesture', {
    'elementId': element.id,
    'percent': 0.75
})

driver.execute_script('mobile: pinchCloseGesture', {
    'elementId': element.id,
    'percent': 0.75
})
```

## Waiting Strategies

```python
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from appium.webdriver.common.appiumby import AppiumBy

wait = WebDriverWait(driver, 20)

# Wait for element visible
element = wait.until(
    EC.visibility_of_element_located((AppiumBy.ACCESSIBILITY_ID, "welcome"))
)

# Wait for element clickable
element = wait.until(
    EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "submit"))
)

# Wait for element to disappear
wait.until(
    EC.invisibility_of_element_located((AppiumBy.ACCESSIBILITY_ID, "spinner"))
)

# Custom condition
wait.until(lambda d: d.find_element(AppiumBy.ID, "status").text == "Ready")
```

## Hybrid Apps (WebView)

```python
# List available contexts
contexts = driver.contexts
# e.g., ['NATIVE_APP', 'WEBVIEW_com.example.app']

# Switch to webview
driver.switch_to.context('WEBVIEW_com.example.app')

# Now use web selectors
driver.find_element(By.CSS_SELECTOR, "#login-form input[name='email']")

# Switch back to native
driver.switch_to.context('NATIVE_APP')

# Current context
print(driver.current_context)
```

## Device Actions

### Orientation

```python
driver.orientation = "LANDSCAPE"
driver.orientation = "PORTRAIT"
print(driver.orientation)
```

### Keyboard

```python
# Hide keyboard
driver.hide_keyboard()

# Check if keyboard shown
driver.is_keyboard_shown()

# Press key (Android)
driver.press_keycode(4)   # Back button
driver.press_keycode(3)   # Home button
driver.press_keycode(66)  # Enter
```

### Notifications (Android)

```python
driver.open_notifications()
# Interact with notification elements
driver.find_element(AppiumBy.XPATH, "//android.widget.TextView[@text='Notification Title']").click()
```

### App Management

```python
# Background app
driver.background_app(5)  # seconds, -1 = indefinite

# Terminate and activate
driver.terminate_app("com.example.app")
driver.activate_app("com.example.app")

# App state
state = driver.query_app_state("com.example.app")
# 0=not installed, 1=not running, 3=background, 4=foreground

# Install / remove
driver.install_app("/path/to/app.apk")
driver.remove_app("com.example.app")
driver.is_app_installed("com.example.app")
```

## File Operations

```python
# Push file to device
import base64
data = base64.b64encode(b"file content").decode("utf-8")
driver.push_file("/sdcard/test.txt", data)

# Pull file from device
file_base64 = driver.pull_file("/sdcard/test.txt")
content = base64.b64decode(file_base64)
```

## Screenshots and Recording

```python
# Screenshot
driver.save_screenshot("screen.png")
png_base64 = driver.get_screenshot_as_base64()

# Element screenshot
element.screenshot("element.png")

# Screen recording
driver.start_recording_screen()
# ... perform actions ...
video_base64 = driver.stop_recording_screen()
with open("recording.mp4", "wb") as f:
    f.write(base64.b64decode(video_base64))
```

## Pytest Integration

```python
import pytest
from appium import webdriver
from appium.options import UiAutomator2Options

@pytest.fixture(scope="session")
def driver():
    options = UiAutomator2Options()
    options.platform_name = "Android"
    options.device_name = "emulator-5554"
    options.app = "/path/to/app.apk"
    options.auto_grant_permissions = True

    driver = webdriver.Remote("http://localhost:4723", options=options)
    yield driver
    driver.quit()

@pytest.fixture(autouse=True)
def reset_app(driver):
    """Reset to main screen before each test."""
    driver.activate_app("com.example.app")
    yield
    driver.terminate_app("com.example.app")

def test_login(driver):
    driver.find_element(AppiumBy.ACCESSIBILITY_ID, "email").send_keys("user@test.com")
    driver.find_element(AppiumBy.ACCESSIBILITY_ID, "password").send_keys("pass")
    driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login").click()

    wait = WebDriverWait(driver, 10)
    welcome = wait.until(
        EC.visibility_of_element_located((AppiumBy.ACCESSIBILITY_ID, "welcome"))
    )
    assert "Welcome" in welcome.text
```

## Common Patterns

### Handle permission dialogs (Android)

```python
# Set auto_grant_permissions = True in capabilities
# Or handle manually:
try:
    allow_btn = WebDriverWait(driver, 5).until(
        EC.element_to_be_clickable((AppiumBy.ID, "com.android.permissioncontroller:id/permission_allow_button"))
    )
    allow_btn.click()
except:
    pass  # No dialog appeared
```

### Handle iOS alerts

```python
# Set auto_accept_alerts = True in capabilities
# Or handle manually:
try:
    alert = driver.switch_to.alert
    alert.accept()
except:
    pass
```

### Wait for app to load

```python
def wait_for_app_ready(driver, timeout=30):
    WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "home_screen"))
    )
```

## Tips

- Use `accessibility id` as the primary locator strategy — it works on both platforms
- Use `auto_grant_permissions` (Android) and `auto_accept_alerts` (iOS) to handle system dialogs
- Set `new_command_timeout` high enough for long test suites (default is 60s)
- Use `no_reset: True` to speed up tests by preserving app state between sessions
- For Android scrolling, use `UiScrollable` — it's the most reliable method
- Use `driver.page_source` to inspect the current screen's element tree for debugging
- Keep Appium server and drivers updated: `appium driver update uiautomator2`

---
name: webdriver
description: "Selenium WebDriver for browser automation and testing - element interaction, waits, alerts, frames, and cross-browser testing"
metadata:
  languages: "python"
  versions: "4.28.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "selenium,webdriver,testing,browser,automation,e2e"
---

# Selenium WebDriver Python Guidelines

## Installation

```bash
pip install selenium
# No separate driver download needed - Selenium Manager handles it automatically
```

## Quick Start

```python
from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.get("https://example.com")
print(driver.title)

element = driver.find_element(By.TAG_NAME, "h1")
print(element.text)

driver.quit()
```

## Browser Options

### Chrome

```python
from selenium.webdriver.chrome.options import Options

options = Options()
options.add_argument("--headless=new")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--window-size=1920,1080")
options.add_argument("--disable-gpu")
options.add_experimental_option("excludeSwitches", ["enable-logging"])

driver = webdriver.Chrome(options=options)
```

### Firefox

```python
from selenium.webdriver.firefox.options import Options

options = Options()
options.add_argument("--headless")
options.set_preference("browser.download.folderList", 2)
options.set_preference("browser.download.dir", "/tmp/downloads")

driver = webdriver.Firefox(options=options)
```

### Edge

```python
from selenium.webdriver.edge.options import Options

options = Options()
options.add_argument("--headless=new")
driver = webdriver.Edge(options=options)
```

## Navigation

```python
driver.get("https://example.com")
driver.back()
driver.forward()
driver.refresh()

print(driver.current_url)
print(driver.title)
```

## Finding Elements

```python
from selenium.webdriver.common.by import By

# By ID
driver.find_element(By.ID, "username")

# By CSS selector
driver.find_element(By.CSS_SELECTOR, "button.submit")
driver.find_element(By.CSS_SELECTOR, "[data-testid='login']")
driver.find_element(By.CSS_SELECTOR, "#form > input:first-child")

# By XPath
driver.find_element(By.XPATH, "//button[@type='submit']")
driver.find_element(By.XPATH, "//span[text()='Submit']")
driver.find_element(By.XPATH, "//div[contains(@class, 'active')]")

# By class name
driver.find_element(By.CLASS_NAME, "error-message")

# By tag name
driver.find_element(By.TAG_NAME, "h1")

# By link text
driver.find_element(By.LINK_TEXT, "Click here")
driver.find_element(By.PARTIAL_LINK_TEXT, "Click")

# By name attribute
driver.find_element(By.NAME, "email")

# Find multiple elements
items = driver.find_elements(By.CSS_SELECTOR, ".list-item")
for item in items:
    print(item.text)
```

## Element Interactions

```python
# Click
driver.find_element(By.ID, "submit-btn").click()

# Type text
element = driver.find_element(By.ID, "email")
element.clear()
element.send_keys("user@example.com")

# Submit form
element.submit()

# Get text and attributes
text = driver.find_element(By.ID, "message").text
href = driver.find_element(By.TAG_NAME, "a").get_attribute("href")
classes = driver.find_element(By.ID, "box").get_attribute("class")
value = driver.find_element(By.ID, "input").get_attribute("value")

# Check state
element.is_displayed()
element.is_enabled()
element.is_selected()

# Get CSS property
color = element.value_of_css_property("color")
```

### Select Dropdowns

```python
from selenium.webdriver.support.ui import Select

select = Select(driver.find_element(By.ID, "country"))
select.select_by_visible_text("United States")
select.select_by_value("US")
select.select_by_index(2)

# Get selected option
print(select.first_selected_option.text)

# Get all options
for option in select.options:
    print(option.text)
```

## Waits

### Implicit Wait

```python
driver.implicitly_wait(10)  # seconds, applies to all find_element calls
```

### Explicit Wait (preferred)

```python
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

wait = WebDriverWait(driver, 10)

# Wait for element to be visible
element = wait.until(EC.visibility_of_element_located((By.ID, "result")))

# Wait for element to be clickable
element = wait.until(EC.element_to_be_clickable((By.ID, "submit")))

# Wait for element to be present in DOM
element = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".loaded")))

# Wait for text to be present
wait.until(EC.text_to_be_present_in_element((By.ID, "status"), "Complete"))

# Wait for element to disappear
wait.until(EC.invisibility_of_element_located((By.ID, "spinner")))

# Wait for title
wait.until(EC.title_contains("Dashboard"))

# Wait for URL
wait.until(EC.url_contains("/dashboard"))

# Wait for alert
wait.until(EC.alert_is_present())

# Wait for number of windows
wait.until(EC.number_of_windows_to_be(2))

# Custom condition
wait.until(lambda d: d.find_element(By.ID, "count").text == "5")
```

### Fluent Wait

```python
from selenium.common.exceptions import NoSuchElementException

wait = WebDriverWait(
    driver,
    timeout=30,
    poll_frequency=2,
    ignored_exceptions=[NoSuchElementException]
)
element = wait.until(EC.visibility_of_element_located((By.ID, "result")))
```

## Action Chains

```python
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys

actions = ActionChains(driver)

# Hover
actions.move_to_element(element).perform()

# Right-click
actions.context_click(element).perform()

# Double-click
actions.double_click(element).perform()

# Drag and drop
actions.drag_and_drop(source, target).perform()

# Key combinations
actions.key_down(Keys.CONTROL).send_keys("a").key_up(Keys.CONTROL).perform()
actions.key_down(Keys.SHIFT).click(element).key_up(Keys.SHIFT).perform()

# Chain multiple actions
actions.move_to_element(menu).click().move_to_element(submenu).click().perform()

# Scroll to element
actions.scroll_to_element(element).perform()

# Scroll by amount
actions.scroll_by_amount(0, 500).perform()
```

## Keyboard Input

```python
from selenium.webdriver.common.keys import Keys

element.send_keys("hello")
element.send_keys(Keys.ENTER)
element.send_keys(Keys.TAB)
element.send_keys(Keys.ESCAPE)
element.send_keys(Keys.BACKSPACE)
element.send_keys(Keys.CONTROL, "a")    # Select all
element.send_keys(Keys.CONTROL, "c")    # Copy
```

## Alerts and Prompts

```python
# Switch to alert
alert = driver.switch_to.alert

# Get text
print(alert.text)

# Accept (OK)
alert.accept()

# Dismiss (Cancel)
alert.dismiss()

# Send text to prompt
alert.send_keys("my input")
alert.accept()
```

## Frames and iFrames

```python
# Switch to frame by element
iframe = driver.find_element(By.TAG_NAME, "iframe")
driver.switch_to.frame(iframe)

# Switch to frame by name/id
driver.switch_to.frame("frame-name")

# Switch to frame by index
driver.switch_to.frame(0)

# Switch back to main content
driver.switch_to.default_content()

# Switch to parent frame
driver.switch_to.parent_frame()
```

## Windows and Tabs

```python
# Get current window handle
main_window = driver.current_window_handle

# Open new tab
driver.switch_to.new_window("tab")

# Open new window
driver.switch_to.new_window("window")

# Switch between windows
for handle in driver.window_handles:
    driver.switch_to.window(handle)
    if "target" in driver.title:
        break

# Close current tab/window and switch back
driver.close()
driver.switch_to.window(main_window)
```

## JavaScript Execution

```python
# Execute script
driver.execute_script("window.scrollTo(0, document.body.scrollHeight)")

# Return value
title = driver.execute_script("return document.title")

# Pass element as argument
driver.execute_script("arguments[0].scrollIntoView(true);", element)
driver.execute_script("arguments[0].click();", element)

# Async script
driver.execute_async_script("""
    var callback = arguments[arguments.length - 1];
    setTimeout(function() { callback('done'); }, 1000);
""")

# Remove element attribute
driver.execute_script("arguments[0].removeAttribute('disabled')", element)

# Modify value directly
driver.execute_script("arguments[0].value = 'new value'", element)
```

## Screenshots

```python
# Full page
driver.save_screenshot("screenshot.png")

# As bytes
png = driver.get_screenshot_as_png()

# Element screenshot
element.screenshot("element.png")
```

## Cookies

```python
# Get all cookies
cookies = driver.get_cookies()

# Get specific cookie
cookie = driver.get_cookie("session_id")

# Add cookie
driver.add_cookie({"name": "token", "value": "abc123", "domain": ".example.com"})

# Delete cookies
driver.delete_cookie("token")
driver.delete_all_cookies()
```

## File Upload

```python
upload = driver.find_element(By.CSS_SELECTOR, "input[type='file']")
upload.send_keys("/path/to/file.pdf")
```

## Window Management

```python
driver.maximize_window()
driver.minimize_window()
driver.set_window_size(1920, 1080)
driver.set_window_position(0, 0)

size = driver.get_window_size()
position = driver.get_window_position()
```

## Pytest Integration

```python
import pytest
from selenium import webdriver

@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(10)
    yield driver
    driver.quit()

def test_homepage(driver):
    driver.get("https://example.com")
    assert "Example" in driver.title

def test_search(driver):
    driver.get("https://example.com/search")
    search_box = driver.find_element(By.NAME, "q")
    search_box.send_keys("test")
    search_box.submit()
    results = driver.find_elements(By.CSS_SELECTOR, ".result")
    assert len(results) > 0
```

## Common Patterns

### Page Object Model

```python
class LoginPage:
    def __init__(self, driver):
        self.driver = driver
        self.url = "https://example.com/login"

    @property
    def email_input(self):
        return self.driver.find_element(By.ID, "email")

    @property
    def password_input(self):
        return self.driver.find_element(By.ID, "password")

    @property
    def submit_button(self):
        return self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")

    def open(self):
        self.driver.get(self.url)
        return self

    def login(self, email, password):
        self.email_input.send_keys(email)
        self.password_input.send_keys(password)
        self.submit_button.click()
```

### Wait for page load

```python
def wait_for_page_load(driver, timeout=30):
    WebDriverWait(driver, timeout).until(
        lambda d: d.execute_script("return document.readyState") == "complete"
    )
```

### Retry on stale element

```python
from selenium.common.exceptions import StaleElementReferenceException

def click_with_retry(driver, locator, retries=3):
    for i in range(retries):
        try:
            driver.find_element(*locator).click()
            return
        except StaleElementReferenceException:
            if i == retries - 1:
                raise
```

## Tips

- Always use explicit waits (`WebDriverWait`) over `time.sleep()` or implicit waits
- Use `find_elements` (plural) to check existence without raising exceptions
- Use CSS selectors over XPath when possible — they're faster
- Always call `driver.quit()` in cleanup (not just `driver.close()`)
- Use `--headless=new` for Chrome (the new headless mode is more compatible)
- Set page load timeout: `driver.set_page_load_timeout(30)`

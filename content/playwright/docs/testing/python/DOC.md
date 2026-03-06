---
name: testing
description: "Playwright browser automation and testing for web applications - navigation, selectors, assertions, network interception, and visual testing"
metadata:
  languages: "python"
  versions: "1.51.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "playwright,testing,browser,automation,e2e,web"
---

# Playwright Python SDK Guidelines

## Installation

```bash
pip install playwright
playwright install              # downloads browser binaries
playwright install chromium     # single browser only
```

## Quick Start (Sync API)

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("https://example.com")
    print(page.title())
    browser.close()
```

## Quick Start (Async API)

```python
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("https://example.com")
        print(await page.title())
        await browser.close()

asyncio.run(main())
```

## Browser Launch Options

```python
# Headed mode (visible browser)
browser = p.chromium.launch(headless=False)

# Slow motion for debugging
browser = p.chromium.launch(headless=False, slow_mo=500)

# Firefox / WebKit
browser = p.firefox.launch()
browser = p.webkit.launch()

# Custom args
browser = p.chromium.launch(args=["--disable-gpu", "--no-sandbox"])

# Browser context with viewport and locale
context = browser.new_context(
    viewport={"width": 1280, "height": 720},
    locale="en-US",
    timezone_id="America/New_York",
    user_agent="custom-agent",
    ignore_https_errors=True,
)
page = context.new_page()
```

## Navigation

```python
page.goto("https://example.com")
page.goto("https://example.com", wait_until="domcontentloaded")
page.goto("https://example.com", wait_until="networkidle")

page.go_back()
page.go_forward()
page.reload()

# Wait for URL
page.wait_for_url("**/dashboard")
```

## Selectors

```python
# CSS selectors
page.locator("button.submit")
page.locator("#email")
page.locator("[data-testid='login-btn']")

# Text selectors
page.locator("text=Sign In")
page.get_by_text("Sign In")
page.get_by_text("Sign In", exact=True)

# Role-based selectors (preferred)
page.get_by_role("button", name="Submit")
page.get_by_role("heading", name="Welcome")
page.get_by_role("link", name="About")
page.get_by_role("textbox", name="Email")
page.get_by_role("checkbox", name="Remember me")

# Label, placeholder, alt text
page.get_by_label("Email")
page.get_by_placeholder("Enter your email")
page.get_by_alt_text("Company logo")
page.get_by_title("Close dialog")
page.get_by_test_id("submit-button")   # matches data-testid

# XPath
page.locator("xpath=//button[@type='submit']")

# Chaining and filtering
page.locator("article").filter(has_text="Playwright")
page.locator("article").filter(has=page.get_by_role("button", name="Read more"))
page.locator(".card").first
page.locator(".card").last
page.locator(".card").nth(2)

# Within a parent
page.locator(".modal").get_by_role("button", name="OK")
```

## Actions

```python
# Click
page.get_by_role("button", name="Submit").click()
page.get_by_role("button", name="Submit").dblclick()
page.get_by_role("button", name="Submit").click(button="right")
page.get_by_role("button", name="Submit").click(force=True)

# Type and fill
page.get_by_label("Email").fill("user@example.com")      # clears first
page.get_by_label("Email").type("user@example.com")      # keystroke by keystroke
page.get_by_label("Email").press("Enter")
page.get_by_label("Email").clear()

# Select dropdown
page.get_by_label("Country").select_option("US")
page.get_by_label("Country").select_option(label="United States")
page.get_by_label("Country").select_option(index=2)

# Checkboxes and radio buttons
page.get_by_role("checkbox", name="Agree").check()
page.get_by_role("checkbox", name="Agree").uncheck()
page.get_by_role("checkbox", name="Agree").set_checked(True)

# Hover
page.get_by_role("link", name="Menu").hover()

# Drag and drop
page.locator("#source").drag_to(page.locator("#target"))

# Focus
page.get_by_label("Email").focus()
```

## Assertions (expect API)

```python
from playwright.sync_api import expect

# Page assertions
expect(page).to_have_title("Dashboard")
expect(page).to_have_title(re.compile(r"Dashboard.*"))
expect(page).to_have_url("https://example.com/dashboard")
expect(page).to_have_url(re.compile(r".*/dashboard"))

# Element assertions
expect(page.get_by_role("button", name="Submit")).to_be_visible()
expect(page.get_by_role("button", name="Submit")).to_be_enabled()
expect(page.get_by_role("button", name="Submit")).to_be_disabled()
expect(page.get_by_role("button", name="Submit")).to_have_text("Submit")
expect(page.get_by_role("button", name="Submit")).to_contain_text("Sub")
expect(page.get_by_label("Email")).to_have_value("user@example.com")
expect(page.get_by_label("Email")).to_have_attribute("type", "email")
expect(page.locator(".error")).to_have_count(0)
expect(page.get_by_role("checkbox")).to_be_checked()
expect(page.locator(".item")).to_have_count(5)
expect(page.locator(".card")).to_have_class(re.compile(r"active"))

# Negation
expect(page.locator(".spinner")).not_to_be_visible()

# Custom timeout
expect(page.locator(".loaded")).to_be_visible(timeout=10000)
```

## Waiting

```python
# Wait for element
page.locator(".result").wait_for(state="visible")
page.locator(".result").wait_for(state="hidden")
page.locator(".result").wait_for(state="attached")

# Wait for navigation
with page.expect_navigation():
    page.get_by_role("link", name="Next").click()

# Wait for load state
page.wait_for_load_state("networkidle")
page.wait_for_load_state("domcontentloaded")

# Wait for function
page.wait_for_function("document.querySelector('.loaded') !== null")

# Wait for response
with page.expect_response("**/api/data") as response_info:
    page.get_by_role("button", name="Load").click()
response = response_info.value

# Wait for request
with page.expect_request("**/api/submit") as request_info:
    page.get_by_role("button", name="Submit").click()
request = request_info.value

# Timeout
page.wait_for_timeout(1000)  # avoid in tests, use for debugging only
```

## Dialogs (Alerts, Confirms, Prompts)

```python
page.on("dialog", lambda dialog: dialog.accept())

# With custom response
def handle_dialog(dialog):
    if dialog.type == "prompt":
        dialog.accept("my answer")
    else:
        dialog.accept()

page.on("dialog", handle_dialog)
```

## File Upload

```python
page.get_by_label("Upload").set_input_files("file.pdf")
page.get_by_label("Upload").set_input_files(["file1.pdf", "file2.pdf"])
page.get_by_label("Upload").set_input_files([])  # clear

# Non-input upload (filechooser event)
with page.expect_file_chooser() as fc_info:
    page.get_by_role("button", name="Upload").click()
file_chooser = fc_info.value
file_chooser.set_files("file.pdf")
```

## Downloads

```python
with page.expect_download() as download_info:
    page.get_by_role("link", name="Download").click()
download = download_info.value
download.save_as("/tmp/file.pdf")
print(download.suggested_filename)
```

## Network Interception

```python
# Block images
page.route("**/*.{png,jpg,jpeg,gif}", lambda route: route.abort())

# Mock API response
page.route("**/api/users", lambda route: route.fulfill(
    status=200,
    content_type="application/json",
    body='[{"name": "Alice"}]'
))

# Modify request
def handle_route(route):
    headers = {**route.request.headers, "Authorization": "Bearer token123"}
    route.continue_(headers=headers)

page.route("**/api/**", handle_route)

# Intercept and modify response
def modify_response(route):
    response = route.fetch()
    body = response.json()
    body["modified"] = True
    route.fulfill(response=response, body=json.dumps(body))

page.route("**/api/data", modify_response)

# Remove route
page.unroute("**/api/users")
```

## Screenshots and Video

```python
# Full page screenshot
page.screenshot(path="screenshot.png", full_page=True)

# Element screenshot
page.locator(".chart").screenshot(path="chart.png")

# Video recording (set on context)
context = browser.new_context(record_video_dir="videos/")
page = context.new_page()
# ... do stuff ...
context.close()  # video saved on close
page.video.path()
```

## Multiple Pages and Tabs

```python
# New tab from click
with context.expect_page() as new_page_info:
    page.get_by_role("link", name="Open").click()
new_page = new_page_info.value
new_page.wait_for_load_state()

# Create new page manually
page2 = context.new_page()
page2.goto("https://example.com")

# List all pages
for p in context.pages:
    print(p.url)
```

## Tracing (Debugging)

```python
context = browser.new_context()
context.tracing.start(screenshots=True, snapshots=True, sources=True)

page = context.new_page()
page.goto("https://example.com")
# ... perform actions ...

context.tracing.stop(path="trace.zip")
# View: playwright show-trace trace.zip
```

## Mobile Emulation

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    iphone = p.devices["iPhone 14"]
    browser = p.chromium.launch()
    context = browser.new_context(**iphone)
    page = context.new_page()
    page.goto("https://example.com")
```

## Pytest Integration (pytest-playwright)

```bash
pip install pytest-playwright
```

```python
# conftest.py - no setup needed, fixtures are auto-registered

# test_example.py
import re
from playwright.sync_api import Page, expect

def test_homepage(page: Page):
    page.goto("https://example.com")
    expect(page).to_have_title(re.compile("Example"))

def test_login(page: Page):
    page.goto("https://example.com/login")
    page.get_by_label("Email").fill("user@test.com")
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Sign In").click()
    expect(page).to_have_url(re.compile(r".*/dashboard"))
```

```bash
pytest --headed                  # show browser
pytest --browser firefox         # specific browser
pytest --browser-channel msedge  # branded browser
pytest --slowmo 500              # slow motion
```

### Auth State Reuse

```python
# conftest.py
import pytest

@pytest.fixture(scope="session")
def auth_state(browser_type):
    browser = browser_type.launch()
    context = browser.new_context()
    page = context.new_page()
    page.goto("https://example.com/login")
    page.get_by_label("Email").fill("user@test.com")
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Sign In").click()
    page.wait_for_url("**/dashboard")
    state = context.storage_state(path="auth.json")
    browser.close()
    return state

@pytest.fixture
def authenticated_page(browser, auth_state):
    context = browser.new_context(storage_state="auth.json")
    page = context.new_page()
    yield page
    context.close()
```

## Common Patterns

### Retry on failure

```python
# Playwright auto-retries assertions until timeout (default 5s)
# Increase default:
expect.set_options(timeout=10000)
```

### Handle iframes

```python
frame = page.frame_locator("#my-iframe")
frame.get_by_role("button", name="Submit").click()
```

### Execute JavaScript

```python
result = page.evaluate("document.title")
result = page.evaluate("([a, b]) => a + b", [1, 2])
page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
```

### Local storage / cookies

```python
# Cookies
cookies = context.cookies()
context.add_cookies([{"name": "token", "value": "abc", "url": "https://example.com"}])

# Local storage via JS
page.evaluate("localStorage.setItem('key', 'value')")
value = page.evaluate("localStorage.getItem('key')")
```

## Tips

- Prefer `get_by_role`, `get_by_label`, `get_by_text` over CSS/XPath for resilient selectors
- Use `expect()` assertions — they auto-retry until timeout
- Use `networkidle` wait sparingly; prefer waiting for specific elements
- Use tracing for debugging flaky tests: `context.tracing.start()`
- Use `page.pause()` in headed mode to open Playwright Inspector
- Set `PWDEBUG=1` environment variable for step-by-step debugging

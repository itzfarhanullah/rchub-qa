---
name: accessibility-testing
description: "Accessibility testing with axe-core and Playwright Python - WCAG audits, automated a11y checks, and pytest integration"
metadata:
  languages: "python"
  versions: "4.10.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "axe-core,accessibility,a11y,wcag,playwright,python"
---

# Accessibility Testing with Python Guidelines

## Installation

```bash
pip install playwright axe-playwright-python pytest-playwright
playwright install
```

## Quick Start

```python
from playwright.sync_api import Page
from axe_playwright_python.sync_playwright import Axe

def test_homepage_accessible(page: Page):
    page.goto("http://localhost:3000")
    axe = Axe()
    results = axe.run(page)
    assert results.violations_count == 0, results.generate_report()
```

## Basic Scanning

```python
from axe_playwright_python.sync_playwright import Axe

axe = Axe()

# Full page scan
results = axe.run(page)

# Check results
print(f"Violations: {results.violations_count}")
print(f"Passes: {results.passes_count}")
print(results.generate_report())  # human-readable report

# Assert no violations
assert results.violations_count == 0, results.generate_report()
```

## Scoped Scans

```python
# Scan specific element by selector
results = axe.run(page, context="nav")
results = axe.run(page, context="form#login")
results = axe.run(page, context=".main-content")

# Include/exclude
results = axe.run(page, context={
    "include": [["main"]],
    "exclude": [[".third-party-widget"]]
})
```

## WCAG Level Filtering

```python
# WCAG 2.1 AA (most common requirement)
results = axe.run(page, options={
    "runOnly": {
        "type": "tag",
        "values": ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]
    }
})
assert results.violations_count == 0

# Best practices only
results = axe.run(page, options={
    "runOnly": {"type": "tag", "values": ["best-practice"]}
})

# Specific rules only
results = axe.run(page, options={
    "runOnly": {"type": "rule", "values": ["color-contrast", "image-alt", "label"]}
})
```

## Disable Specific Rules

```python
results = axe.run(page, options={
    "rules": {
        "color-contrast": {"enabled": False},
        "region": {"enabled": False},
    }
})
```

## Detailed Violation Inspection

```python
def test_with_detailed_report(page: Page):
    page.goto("http://localhost:3000")
    axe = Axe()
    results = axe.run(page)

    for violation in results.response["violations"]:
        print(f"\nRule: {violation['id']}")
        print(f"Impact: {violation['impact']}")
        print(f"Description: {violation['description']}")
        print(f"Help: {violation['helpUrl']}")
        for node in violation["nodes"]:
            print(f"  Element: {node['html']}")
            print(f"  Fix: {node['failureSummary']}")

    assert results.violations_count == 0
```

## Testing Interactive States

```python
def test_modal_accessible(page: Page):
    page.goto("http://localhost:3000")
    page.get_by_role("button", name="Open Menu").click()
    page.wait_for_selector("[role='dialog']")

    axe = Axe()
    results = axe.run(page, context="[role='dialog']")
    assert results.violations_count == 0, results.generate_report()

def test_dropdown_accessible(page: Page):
    page.goto("http://localhost:3000")
    page.get_by_role("combobox").click()

    axe = Axe()
    results = axe.run(page, context="[role='listbox']")
    assert results.violations_count == 0, results.generate_report()
```

## Multi-Page Audit

```python
import pytest

PAGES = ["/", "/about", "/login", "/signup", "/dashboard", "/settings"]

@pytest.mark.parametrize("path", PAGES)
def test_page_accessible(page: Page, path: str):
    page.goto(f"http://localhost:3000{path}")
    axe = Axe()
    results = axe.run(page, options={
        "runOnly": {"type": "tag", "values": ["wcag2a", "wcag2aa"]}
    })
    assert results.violations_count == 0, f"{path}: {results.generate_report()}"
```

## Pytest Fixtures

```python
import pytest
from playwright.sync_api import Page
from axe_playwright_python.sync_playwright import Axe

@pytest.fixture
def axe():
    return Axe()

@pytest.fixture
def wcag_aa_options():
    return {
        "runOnly": {
            "type": "tag",
            "values": ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]
        }
    }

def test_homepage(page: Page, axe, wcag_aa_options):
    page.goto("http://localhost:3000")
    results = axe.run(page, options=wcag_aa_options)
    assert results.violations_count == 0, results.generate_report()
```

## Save Reports

```python
import json

def test_with_saved_report(page: Page):
    page.goto("http://localhost:3000")
    axe = Axe()
    results = axe.run(page)

    # Save JSON report
    with open("a11y-report.json", "w") as f:
        json.dump(results.response, f, indent=2)

    # Save readable report
    with open("a11y-report.txt", "w") as f:
        f.write(results.generate_report())

    assert results.violations_count == 0
```

## Manual Accessibility Checks with Playwright

```python
def test_keyboard_navigation(page: Page):
    """axe can't test this — manual keyboard nav check"""
    page.goto("http://localhost:3000")

    # Tab through interactive elements
    page.keyboard.press("Tab")
    focused = page.evaluate("document.activeElement.tagName")
    assert focused in ["A", "BUTTON", "INPUT"]

    # Check focus is visible
    focused_el = page.evaluate("document.activeElement")
    outline = page.evaluate("getComputedStyle(document.activeElement).outline")
    assert outline != "none"

def test_skip_link(page: Page):
    page.goto("http://localhost:3000")
    page.keyboard.press("Tab")
    skip_link = page.locator("a:has-text('Skip to content')")
    assert skip_link.is_visible()

def test_aria_live_region(page: Page):
    page.goto("http://localhost:3000/form")
    page.get_by_role("button", name="Submit").click()
    error_region = page.locator("[aria-live='polite']")
    assert error_region.is_visible()
    assert error_region.text_content() != ""
```

## Common WCAG Rules

| Rule | What it checks |
|------|---------------|
| `color-contrast` | Text contrast ratio (4.5:1 normal, 3:1 large) |
| `image-alt` | Images have alt text |
| `label` | Form elements have labels |
| `link-name` | Links have discernible text |
| `button-name` | Buttons have accessible names |
| `html-has-lang` | `<html>` has lang attribute |
| `landmark-one-main` | Page has one `<main>` |
| `aria-roles` | ARIA roles are valid |

## Tips

- Run axe AFTER page is fully rendered — use `page.wait_for_load_state("networkidle")` first
- Use `context=` to scope scans to the component under test
- Use WCAG 2.1 AA tags for standard compliance checks
- axe catches ~57% of WCAG issues automatically — supplement with manual keyboard and screen reader tests
- Test interactive states: modals open, dropdowns expanded, form errors showing
- Save JSON reports for CI artifact storage and trend tracking
- Disable rules sparingly and document the reason in a comment

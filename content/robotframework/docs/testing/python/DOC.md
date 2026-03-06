---
name: testing
description: "Robot Framework keyword-driven testing - test suites, variables, libraries, Browser/Selenium integration, API testing, and CI/CD"
metadata:
  languages: "python"
  versions: "7.2.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "robotframework,testing,keyword-driven,acceptance,bdd,automation,python"
---

# Robot Framework Testing Guidelines

## Installation

```bash
pip install robotframework
pip install robotframework-browser     # Playwright-based browser lib
pip install robotframework-requests    # API testing
pip install robotframework-seleniumlibrary   # Selenium-based browser lib
pip install robotframework-datadriver  # data-driven testing
```

```bash
# Initialize Browser library (downloads Playwright browsers)
rfbrowser init
```

## Quick Start

```robot
*** Settings ***
Library    Browser

*** Test Cases ***
User Can Login
    New Browser    chromium    headless=true
    New Page       http://localhost:3000/login
    Fill Text      id=email       test@test.com
    Fill Text      id=password    secret
    Click          button >> text=Sign In
    Get Url        ==    http://localhost:3000/dashboard
    Close Browser
```

```bash
robot tests/
robot --outputdir results tests/login.robot
```

## Test Structure

```robot
*** Settings ***
Library           Browser
Library           Collections
Suite Setup       Open Application
Suite Teardown    Close Application
Test Setup        Go To Login Page
Test Teardown     Clear Session

*** Variables ***
${BASE_URL}       http://localhost:3000
${BROWSER}        chromium
${VALID_EMAIL}    test@test.com
${VALID_PASS}     secret

*** Test Cases ***
Valid Login
    [Documentation]    Verify successful login with valid credentials
    [Tags]    smoke    auth
    Fill Text    id=email       ${VALID_EMAIL}
    Fill Text    id=password    ${VALID_PASS}
    Click        button >> text=Sign In
    Get Url      ==    ${BASE_URL}/dashboard

Invalid Login Shows Error
    [Tags]    auth    negative
    Fill Text    id=email       wrong@test.com
    Fill Text    id=password    wrong
    Click        button >> text=Sign In
    Get Text     .error-message    ==    Invalid credentials

*** Keywords ***
Open Application
    New Browser    ${BROWSER}    headless=true
    New Context
    New Page       ${BASE_URL}

Close Application
    Close Browser

Go To Login Page
    Go To    ${BASE_URL}/login

Clear Session
    Evaluate JavaScript    *    document.cookie = ''
```

## Variables

```robot
*** Variables ***
# Scalar
${URL}            http://localhost:3000
${TIMEOUT}        10s

# List
@{BROWSERS}       chromium    firefox    webkit

# Dictionary
&{USER}           name=Alice    email=alice@test.com    role=admin

# Environment variable
${API_KEY}        %{API_KEY}    # reads from env, fails if missing
${API_KEY}        %{API_KEY=default_key}    # with default

*** Test Cases ***
Use Variables
    Log    URL is ${URL}
    Log    First browser is ${BROWSERS}[0]
    Log    User name is ${USER}[name]
```

### Variable files

```python
# variables.py
BASE_URL = "http://localhost:3000"
USERS = [
    {"name": "Alice", "role": "admin"},
    {"name": "Bob", "role": "user"},
]
```

```robot
*** Settings ***
Variables    variables.py
```

## Browser Library (Playwright-based)

### Navigation

```robot
New Browser    chromium    headless=true
New Context    viewport={'width': 1920, 'height': 1080}
New Page       ${BASE_URL}
Go To          ${BASE_URL}/products
Go Back
Go Forward
Reload
```

### Selectors

```robot
# CSS
Click    button.submit
Click    #login-form >> input[type=email]

# Text
Click    text=Sign In
Click    button >> text=Submit

# Role-based
Click    role=button[name="Submit"]

# XPath
Click    xpath=//button[@type='submit']

# Chaining
Click    .form >> button >> text=Submit
```

### Actions

```robot
# Click
Click    button >> text=Submit
Click    .menu-item    button=right    # right click
Click    .item    clickCount=2          # double click

# Type/Fill
Fill Text      input[name=email]    test@test.com
Type Text      input[name=search]   query    delay=50ms    # types key by key
Clear Text     input[name=search]

# Select
Select Options By    select#country    value    us
Select Options By    select#country    label    United States

# Checkbox
Check Checkbox       input#agree
Uncheck Checkbox     input#newsletter

# Keyboard
Keyboard Key    press    Enter
Keyboard Key    press    Control+a
Keyboard Input    type    Hello World

# File upload
Upload File By Selector    input[type=file]    ${CURDIR}/test.pdf
```

### Assertions

```robot
# URL
Get Url    ==    ${BASE_URL}/dashboard
Get Url    contains    dashboard

# Text
Get Text    h1             ==    Welcome
Get Text    .message       contains    Success
Get Text    .count         ==    42    # auto-converts

# Element state
Get Element State    .modal       visible    ==    true
Get Element State    button#sub   enabled    ==    true
Get Element Count    .list-item   ==    5

# Attribute
Get Attribute    input#email    value    ==    test@test.com

# Page title
Get Title    ==    My App

# Screenshot
Take Screenshot    filename=error    fullPage=true
```

### Waiting

```robot
Wait For Elements State    .modal       visible    timeout=10s
Wait For Elements State    .spinner     detached   timeout=30s
Wait For Navigation        ${BASE_URL}/success
Wait For Response          /api/users
```

### Network interception

```robot
*** Test Cases ***
Mock API Response
    ${route}=    New Page    ${BASE_URL}
    Mock Route    /api/users    body=[{"id":1,"name":"Mock User"}]    status=200
    Go To    ${BASE_URL}/users
    Get Text    .user-name    ==    Mock User
```

## API Testing (RequestsLibrary)

```robot
*** Settings ***
Library    RequestsLibrary
Library    Collections

*** Variables ***
${API_URL}    http://localhost:3000/api

*** Test Cases ***
GET Users
    ${res}=    GET    ${API_URL}/users    expected_status=200
    ${body}=    Set Variable    ${res.json()}
    Length Should Be    ${body}    5

POST Create User
    ${payload}=    Create Dictionary    name=Alice    email=alice@test.com
    ${res}=    POST    ${API_URL}/users    json=${payload}    expected_status=201
    Should Be Equal    ${res.json()}[name]    Alice

PUT Update User
    ${payload}=    Create Dictionary    name=Updated
    PUT    ${API_URL}/users/1    json=${payload}    expected_status=200

DELETE User
    DELETE    ${API_URL}/users/1    expected_status=204

Authenticated Request
    ${headers}=    Create Dictionary    Authorization=Bearer token123
    ${res}=    GET    ${API_URL}/protected    headers=${headers}    expected_status=200
```

### Session-based API testing

```robot
*** Test Cases ***
API Session
    Create Session    api    ${API_URL}    verify=true
    ${res}=    GET On Session    api    /users    expected_status=200
    ${res}=    POST On Session   api    /users    json=${payload}    expected_status=201
    Delete All Sessions
```

## Custom Keywords (Python)

```python
# CustomLibrary.py
from robot.api.deco import keyword

class CustomLibrary:
    @keyword
    def generate_test_email(self, prefix="test"):
        import uuid
        return f"{prefix}-{uuid.uuid4().hex[:8]}@test.com"

    @keyword
    def verify_json_schema(self, response, schema):
        from jsonschema import validate
        validate(instance=response, schema=schema)
```

```robot
*** Settings ***
Library    CustomLibrary.py

*** Test Cases ***
Use Custom Keywords
    ${email}=    Generate Test Email    user
    Log    Generated: ${email}
```

## Data-Driven Testing

```robot
*** Settings ***
Library    DataDriver    file=test_data.csv    dialect=unix

*** Test Cases ***
Login With ${email} and ${password} Expects ${expected}
    Fill Text    id=email       ${email}
    Fill Text    id=password    ${password}
    Click        button >> text=Sign In
    Get Url      contains    ${expected}
```

```csv
# test_data.csv
email,password,expected
admin@test.com,admin123,dashboard
user@test.com,user123,dashboard
wrong@test.com,wrong,login
```

## Tags and Filtering

```robot
*** Test Cases ***
Smoke Test
    [Tags]    smoke    p1
    # ...

Regression Test
    [Tags]    regression    p2
    # ...
```

```bash
robot --include smoke tests/              # run only smoke
robot --exclude slow tests/               # skip slow
robot --include p1 --include p2 tests/    # run p1 OR p2
robot --include smokeANDauth tests/       # run smoke AND auth
```

## Output and Reporting

```bash
robot --outputdir results tests/          # all output to results/
robot --log NONE --report NONE tests/     # no HTML reports
robot --loglevel DEBUG tests/             # verbose logging

# Merge outputs from parallel runs
rebot --merge results1/output.xml results2/output.xml

# Re-run failed only
robot --rerunfailed results/output.xml tests/
```

## CI/CD Integration

```yaml
# GitHub Actions
- name: Run Robot Framework tests
  run: |
    pip install robotframework robotframework-browser
    rfbrowser init
    robot --outputdir results --loglevel INFO tests/

- name: Upload test report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: robot-results
    path: results/
```

## Common Patterns

### Page Object Keywords

```robot
*** Keywords ***
Login As
    [Arguments]    ${email}    ${password}
    Go To          ${BASE_URL}/login
    Fill Text      id=email       ${email}
    Fill Text      id=password    ${password}
    Click          button >> text=Sign In
    Wait For Navigation    ${BASE_URL}/dashboard

Create User Via API
    [Arguments]    ${name}    ${email}
    ${payload}=    Create Dictionary    name=${name}    email=${email}
    ${res}=    POST    ${API_URL}/users    json=${payload}    expected_status=201
    RETURN    ${res.json()}
```

### Template tests (parameterized)

```robot
*** Test Cases ***
Login Attempts
    [Template]    Attempt Login
    admin@test.com     admin123     dashboard
    user@test.com      user123      dashboard
    wrong@test.com     wrong        login

*** Keywords ***
Attempt Login
    [Arguments]    ${email}    ${password}    ${expected_page}
    Go To          ${BASE_URL}/login
    Fill Text      id=email       ${email}
    Fill Text      id=password    ${password}
    Click          button >> text=Sign In
    Get Url        contains    ${expected_page}
```

## Tips

- Use Browser library (Playwright-based) over SeleniumLibrary for new projects
- Use `rfbrowser init` after installing robotframework-browser
- Use `[Tags]` for test categorization and selective execution
- Use `*** Keywords ***` section to create reusable, readable test steps
- Use `${CURDIR}` for paths relative to current test file
- Use `--rerunfailed` to re-execute only failed tests (fast CI feedback)
- Use `Create Dictionary` for building payloads in API tests
- Robot files use `.robot` extension — Python keyword files use `.py`
- Variable syntax: `${scalar}`, `@{list}`, `&{dict}`, `%{env}`

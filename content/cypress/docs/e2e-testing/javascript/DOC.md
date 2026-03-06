---
name: e2e-testing
description: "Cypress end-to-end testing framework for web applications - DOM queries, assertions, network stubbing, component testing, and visual testing"
metadata:
  languages: "javascript"
  versions: "14.3.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "cypress,testing,e2e,browser,automation,web"
---

# Cypress E2E Testing Guidelines

## Installation

```bash
npm install -D cypress
npx cypress open       # interactive mode (first run creates config)
npx cypress run        # headless mode
```

## Configuration (cypress.config.js)

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    video: true,
    screenshotOnRunFailure: true,
    retries: { runMode: 2, openMode: 0 },
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',

    setupNodeEvents(on, config) {
      // plugins here
    },
  },
});
```

## Test Structure

```javascript
// cypress/e2e/login.cy.js
describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  afterEach(() => {
    // cleanup if needed
  });

  it('should login with valid credentials', () => {
    cy.get('[data-cy="email"]').type('user@test.com');
    cy.get('[data-cy="password"]').type('password123');
    cy.get('[data-cy="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should show error for invalid credentials', () => {
    cy.get('[data-cy="email"]').type('bad@test.com');
    cy.get('[data-cy="password"]').type('wrong');
    cy.get('[data-cy="submit"]').click();
    cy.get('.error-message').should('be.visible');
  });

  context('when already logged in', () => {
    beforeEach(() => {
      // setup logged in state
    });

    it('should redirect to dashboard', () => {
      cy.visit('/login');
      cy.url().should('include', '/dashboard');
    });
  });
});
```

## Navigation

```javascript
cy.visit('/');
cy.visit('/page', { timeout: 30000 });
cy.visit('https://example.com');

cy.url().should('include', '/dashboard');
cy.url().should('eq', 'http://localhost:3000/dashboard');
cy.location('pathname').should('eq', '/dashboard');
cy.location('search').should('include', 'q=test');

cy.go('back');
cy.go('forward');
cy.reload();
```

## Querying DOM

```javascript
// By CSS selector
cy.get('button.submit');
cy.get('#email');
cy.get('[data-cy="login-btn"]');      // recommended: data-cy attributes
cy.get('[data-testid="card"]');

// By text content
cy.contains('Sign In');
cy.contains('button', 'Submit');       // element type + text
cy.contains('.card', 'Welcome');       // within selector

// Find within element
cy.get('.modal').find('button');
cy.get('.modal').within(() => {
  cy.get('input').type('hello');
  cy.get('button').click();
});

// Traversal
cy.get('li').first();
cy.get('li').last();
cy.get('li').eq(2);                    // zero-indexed
cy.get('.item').parent();
cy.get('.item').parents('.container');
cy.get('.item').children();
cy.get('.item').siblings();
cy.get('.item').next();
cy.get('.item').prev();
cy.get('.item').closest('.wrapper');
cy.get('.item').filter('.active');
cy.get('.item').not('.disabled');
```

## Actions

```javascript
// Click
cy.get('button').click();
cy.get('button').dblclick();
cy.get('button').rightclick();
cy.get('button').click({ force: true });      // bypass visibility check
cy.get('button').click({ multiple: true });   // click all matching

// Type
cy.get('input').type('hello');
cy.get('input').type('hello{enter}');
cy.get('input').type('{selectall}{backspace}');
cy.get('input').type('{ctrl+a}');
cy.get('input').type('slow typing', { delay: 100 });

// Clear
cy.get('input').clear();
cy.get('input').clear().type('new value');

// Select dropdown
cy.get('select').select('Option 1');           // by visible text
cy.get('select').select('opt1');               // by value
cy.get('select').select([1, 3]);               // multiple

// Checkbox / radio
cy.get('[type="checkbox"]').check();
cy.get('[type="checkbox"]').uncheck();
cy.get('[type="radio"]').check('value1');

// Scroll
cy.get('.element').scrollIntoView();
cy.scrollTo('bottom');
cy.scrollTo(0, 500);
cy.get('.container').scrollTo('top');

// Trigger events
cy.get('.dropzone').trigger('dragenter');
cy.get('.item').trigger('mouseover');
cy.get('.input').trigger('change');

// Focus / blur
cy.get('input').focus();
cy.get('input').blur();
```

## Assertions

```javascript
// Should (chainable)
cy.get('.items').should('have.length', 5);
cy.get('.item').should('be.visible');
cy.get('.item').should('not.be.visible');
cy.get('.item').should('exist');
cy.get('.item').should('not.exist');
cy.get('button').should('be.enabled');
cy.get('button').should('be.disabled');
cy.get('[type="checkbox"]').should('be.checked');
cy.get('input').should('have.value', 'hello');
cy.get('.title').should('have.text', 'Welcome');
cy.get('.title').should('contain', 'Welcome');
cy.get('.card').should('have.class', 'active');
cy.get('.card').should('have.css', 'color', 'rgb(0, 0, 0)');
cy.get('a').should('have.attr', 'href', '/about');
cy.get('.item').should('include.text', 'partial');

// Chain multiple
cy.get('button')
  .should('be.visible')
  .and('be.enabled')
  .and('contain', 'Submit');

// Should with callback
cy.get('.price').should(($el) => {
  const price = parseFloat($el.text().replace('$', ''));
  expect(price).to.be.greaterThan(0);
});

// Expect (BDD)
cy.get('.count').then(($el) => {
  expect($el.text()).to.equal('5');
});

// Implicit assertions (cy.get auto-retries until found)
cy.get('.loaded-content');  // asserts element exists
```

## Aliasing

```javascript
// Alias elements
cy.get('[data-cy="user-list"]').as('userList');
cy.get('@userList').should('have.length', 5);

// Alias intercepts
cy.intercept('GET', '/api/users').as('getUsers');
cy.visit('/users');
cy.wait('@getUsers').its('response.statusCode').should('eq', 200);

// Alias values
cy.get('.total').invoke('text').as('totalText');
cy.get('@totalText').then((text) => {
  // use text
});

// Wrap values
cy.wrap({ name: 'Alice' }).its('name').should('eq', 'Alice');
```

## Network Interception (cy.intercept)

```javascript
// Stub response
cy.intercept('GET', '/api/users', { fixture: 'users.json' });
cy.intercept('GET', '/api/users', {
  statusCode: 200,
  body: [{ name: 'Alice' }, { name: 'Bob' }],
});

// Stub with delay
cy.intercept('GET', '/api/data', {
  body: { result: 'ok' },
  delay: 2000,
});

// Stub error
cy.intercept('GET', '/api/users', { statusCode: 500, body: 'Server Error' });

// Wait for request
cy.intercept('POST', '/api/login').as('login');
cy.get('[data-cy="submit"]').click();
cy.wait('@login').then((interception) => {
  expect(interception.request.body).to.have.property('email');
  expect(interception.response.statusCode).to.eq(200);
});

// Modify request
cy.intercept('GET', '/api/**', (req) => {
  req.headers['Authorization'] = 'Bearer token123';
});

// Modify response
cy.intercept('GET', '/api/users', (req) => {
  req.reply((res) => {
    res.body.push({ name: 'Injected' });
    res.send();
  });
});

// Pattern matching
cy.intercept({ method: 'GET', url: '/api/users*', query: { page: '1' } }, { fixture: 'page1.json' });

// Spy without stubbing
cy.intercept('GET', '/api/users').as('getUsers');
```

## Fixtures

```json
// cypress/fixtures/users.json
[
  { "id": 1, "name": "Alice", "email": "alice@test.com" },
  { "id": 2, "name": "Bob", "email": "bob@test.com" }
]
```

```javascript
// Use in test
cy.fixture('users.json').then((users) => {
  // use users data
});

// With intercept
cy.intercept('GET', '/api/users', { fixture: 'users.json' });
```

## Custom Commands

```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-cy="email"]').type(email);
  cy.get('[data-cy="password"]').type(password);
  cy.get('[data-cy="submit"]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('apiLogin', (email, password) => {
  cy.request('POST', '/api/login', { email, password }).then((resp) => {
    window.localStorage.setItem('token', resp.body.token);
  });
});

// Use in test
cy.login('user@test.com', 'password');
cy.apiLogin('user@test.com', 'password');
```

## File Upload

```javascript
// Cypress has built-in selectFile
cy.get('input[type="file"]').selectFile('cypress/fixtures/test.pdf');
cy.get('input[type="file"]').selectFile(['file1.pdf', 'file2.pdf']);

// Drag and drop
cy.get('.dropzone').selectFile('cypress/fixtures/test.pdf', {
  action: 'drag-drop',
});
```

## File Download

```javascript
// Configure downloads dir in cypress.config.js
// downloadsFolder: 'cypress/downloads'

cy.get('[data-cy="download"]').click();
cy.readFile('cypress/downloads/report.pdf').should('exist');
```

## Screenshots and Video

```javascript
// Manual screenshot
cy.screenshot('my-screenshot');
cy.get('.chart').screenshot('chart-only');

// Automatic: screenshots on failure (default)
// Video: recorded in headless mode (video: true in config)
```

## Environment Variables

```javascript
// cypress.config.js
module.exports = defineConfig({
  env: {
    apiUrl: 'http://localhost:3001',
    username: 'testuser',
  },
});

// In test
const apiUrl = Cypress.env('apiUrl');

// CLI override
// npx cypress run --env apiUrl=http://staging.example.com

// cypress.env.json (gitignored)
{
  "apiKey": "secret123"
}
```

## Working with iframes

```javascript
// Get iframe body
cy.get('iframe#my-frame')
  .its('0.contentDocument.body')
  .should('not.be.empty')
  .then(cy.wrap)
  .find('button')
  .click();
```

## Local Storage and Cookies

```javascript
// Local storage
cy.window().then((win) => {
  win.localStorage.setItem('token', 'abc123');
});
cy.window().its('localStorage.token').should('eq', 'abc123');

// Cookies
cy.setCookie('session', 'abc123');
cy.getCookie('session').should('have.property', 'value', 'abc123');
cy.clearCookies();

// Preserve cookies between tests
Cypress.Cookies.preserveOnce('session');
```

## Component Testing

```javascript
// cypress.config.js
module.exports = defineConfig({
  component: {
    devServer: {
      framework: 'react',        // or 'vue', 'angular', etc.
      bundler: 'vite',           // or 'webpack'
    },
  },
});

// cypress/component/Button.cy.jsx
import Button from '../../src/components/Button';

describe('Button', () => {
  it('renders with text', () => {
    cy.mount(<Button label="Click me" />);
    cy.get('button').should('contain', 'Click me');
  });

  it('calls onClick handler', () => {
    const onClick = cy.stub().as('click');
    cy.mount(<Button label="Click" onClick={onClick} />);
    cy.get('button').click();
    cy.get('@click').should('have.been.calledOnce');
  });
});
```

```bash
npx cypress run --component
```

## Running Tests

```bash
npx cypress open                               # interactive
npx cypress run                                # headless
npx cypress run --spec "cypress/e2e/login.cy.js"  # specific file
npx cypress run --browser chrome               # specific browser
npx cypress run --headed                       # headed mode
npx cypress run --env apiUrl=http://staging    # env vars
npx cypress run --record --key <key>           # dashboard recording
npx cypress run --tag "smoke"                  # tags
```

## Common Patterns

### API-based login (fast, skip UI)

```javascript
Cypress.Commands.add('loginViaApi', () => {
  cy.request({
    method: 'POST',
    url: '/api/login',
    body: { email: 'user@test.com', password: 'pass' },
  }).then((resp) => {
    cy.setCookie('session', resp.body.sessionId);
  });
});

// In test
beforeEach(() => {
  cy.loginViaApi();
  cy.visit('/dashboard');
});
```

### Test data attributes

Use `data-cy` attributes for selectors — they survive CSS/class changes:

```html
<button data-cy="submit-order">Place Order</button>
```

```javascript
cy.get('[data-cy="submit-order"]').click();
```

### Conditional testing

```javascript
cy.get('body').then(($body) => {
  if ($body.find('.modal').length > 0) {
    cy.get('.modal .close').click();
  }
});
```

## Tips

- Use `data-cy` attributes for test selectors — they're explicit and resilient
- Use `cy.intercept()` to stub APIs for predictable, fast tests
- Avoid `cy.wait(ms)` — use `cy.intercept().as('alias')` + `cy.wait('@alias')` instead
- Cypress auto-retries assertions by default — leverage this instead of manual waits
- Use `cy.request()` for API-based setup/teardown — much faster than UI interactions
- Don't assign return values: Cypress commands are chainable, not sync
- Each test starts with a clean state — use `beforeEach` for shared setup

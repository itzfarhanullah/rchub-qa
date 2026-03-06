---
name: testing
description: "Testing Library for DOM and React component testing - queries, user events, async utilities, and accessibility-first testing"
metadata:
  languages: "javascript"
  versions: "16.1.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "testing-library,react,dom,component,accessibility,user-events"
---

# Testing Library Guidelines

## Installation

```bash
# React
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# DOM only
npm install -D @testing-library/dom @testing-library/jest-dom

# Vue
npm install -D @testing-library/vue

# Svelte
npm install -D @testing-library/svelte
```

## Quick Start

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { LoginForm } from './LoginForm';

test('submits login form', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();

  render(<LoginForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText('Email'), 'alice@test.com');
  await user.type(screen.getByLabelText('Password'), 'secret');
  await user.click(screen.getByRole('button', { name: 'Sign In' }));

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'alice@test.com',
    password: 'secret',
  });
});
```

## Queries

### Priority order (use top-to-bottom)

| Priority | Query | When to use |
|----------|-------|-------------|
| 1 | `getByRole` | Accessible role (button, heading, textbox) |
| 2 | `getByLabelText` | Form fields with labels |
| 3 | `getByPlaceholderText` | Input placeholders |
| 4 | `getByText` | Non-interactive text content |
| 5 | `getByDisplayValue` | Current input value |
| 6 | `getByAltText` | Images with alt text |
| 7 | `getByTitle` | Title attribute |
| 8 | `getByTestId` | Last resort — data-testid |

### getByRole (preferred)

```typescript
// Buttons
screen.getByRole('button', { name: 'Submit' });
screen.getByRole('button', { name: /submit/i });

// Links
screen.getByRole('link', { name: 'Home' });

// Headings
screen.getByRole('heading', { name: 'Welcome', level: 1 });

// Form elements
screen.getByRole('textbox', { name: 'Email' });
screen.getByRole('checkbox', { name: 'Agree' });
screen.getByRole('combobox', { name: 'Country' });
screen.getByRole('radio', { name: 'Option A' });
screen.getByRole('spinbutton', { name: 'Quantity' });

// Navigation
screen.getByRole('navigation');
screen.getByRole('main');
screen.getByRole('dialog');

// Table
screen.getByRole('table');
screen.getByRole('row');
screen.getByRole('cell', { name: 'Alice' });
```

### Other queries

```typescript
// Label text (form fields)
screen.getByLabelText('Email');
screen.getByLabelText(/email/i);

// Text content
screen.getByText('Welcome');
screen.getByText(/welcome/i);
screen.getByText((content, element) => content.startsWith('Hello'));

// Placeholder
screen.getByPlaceholderText('Search...');

// Display value (current input value)
screen.getByDisplayValue('alice@test.com');

// Alt text (images)
screen.getByAltText('User avatar');

// Test ID (last resort)
screen.getByTestId('submit-btn');
```

### Query variants

```typescript
// getBy — throws if not found (use for elements that MUST exist)
screen.getByRole('button', { name: 'Submit' });

// queryBy — returns null if not found (use for asserting absence)
expect(screen.queryByText('Error')).not.toBeInTheDocument();

// findBy — async, waits for element to appear (use for async content)
const message = await screen.findByText('Success');

// getAllBy — returns array (use when multiple matches expected)
const items = screen.getAllByRole('listitem');
expect(items).toHaveLength(3);

// queryAllBy — returns empty array if not found
expect(screen.queryAllByRole('alert')).toHaveLength(0);

// findAllBy — async version of getAllBy
const rows = await screen.findAllByRole('row');
```

## User Events

```typescript
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();

// Click
await user.click(screen.getByRole('button', { name: 'Submit' }));
await user.dblClick(element);
await user.tripleClick(element);   // select all text in input

// Type
await user.type(screen.getByLabelText('Email'), 'alice@test.com');

// Clear and type
await user.clear(screen.getByLabelText('Email'));
await user.type(screen.getByLabelText('Email'), 'new@test.com');

// Keyboard
await user.keyboard('{Enter}');
await user.keyboard('{Shift>}A{/Shift}');   // Shift+A
await user.keyboard('{Control>}a{/Control}'); // Ctrl+A

// Tab
await user.tab();
await user.tab({ shift: true });

// Select option
await user.selectOptions(screen.getByRole('combobox'), 'option-value');
await user.selectOptions(screen.getByRole('combobox'), ['opt1', 'opt2']); // multi

// Checkbox/Radio
await user.click(screen.getByRole('checkbox', { name: 'Agree' }));

// Upload file
const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
await user.upload(screen.getByLabelText('Upload'), file);

// Hover
await user.hover(element);
await user.unhover(element);

// Paste
await user.click(screen.getByLabelText('Email'));
await user.paste('pasted@test.com');

// Pointer (drag)
await user.pointer([
  { keys: '[MouseLeft>]', target: source },
  { target: destination },
  { keys: '[/MouseLeft]' },
]);
```

## Assertions (jest-dom)

```typescript
import '@testing-library/jest-dom';

// Presence
expect(element).toBeInTheDocument();
expect(element).not.toBeInTheDocument();

// Visibility
expect(element).toBeVisible();
expect(element).not.toBeVisible();

// Text
expect(element).toHaveTextContent('Hello');
expect(element).toHaveTextContent(/hello/i);

// Form state
expect(input).toHaveValue('alice@test.com');
expect(input).toHaveDisplayValue('alice@test.com');
expect(checkbox).toBeChecked();
expect(input).toBeRequired();
expect(input).toBeDisabled();
expect(input).toBeEnabled();
expect(input).toHaveAttribute('type', 'email');
expect(input).toBeInvalid();
expect(input).toBeValid();

// CSS
expect(element).toHaveClass('active');
expect(element).toHaveStyle({ color: 'red', display: 'flex' });

// Accessibility
expect(element).toHaveAccessibleName('Submit form');
expect(element).toHaveAccessibleDescription('Click to submit');
expect(element).toHaveRole('button');

// Focus
expect(input).toHaveFocus();

// Container
expect(container).toContainElement(child);
expect(container).toContainHTML('<span>text</span>');
expect(container).toBeEmptyDOMElement();
```

## Async Utilities

```typescript
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';

// waitFor — retry until assertion passes
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// waitFor with options
await waitFor(() => {
  expect(screen.getByText('Data')).toBeVisible();
}, { timeout: 5000, interval: 100 });

// findBy — shorthand for waitFor + getBy
const element = await screen.findByText('Loaded');

// waitForElementToBeRemoved
await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));
```

## Rendering

```typescript
import { render, screen, cleanup } from '@testing-library/react';

// Basic render
const { container, unmount, rerender } = render(<MyComponent />);

// With props
render(<UserCard name="Alice" role="admin" />);

// Rerender with new props
const { rerender } = render(<Counter count={0} />);
rerender(<Counter count={1} />);
expect(screen.getByText('1')).toBeInTheDocument();

// With providers (context, router, etc.)
function renderWithProviders(ui, options = {}) {
  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider theme="dark">
        <AuthProvider user={options.user}>
          {children}
        </AuthProvider>
      </ThemeProvider>
    ),
    ...options,
  });
}

renderWithProviders(<Dashboard />, { user: { name: 'Alice' } });

// Cleanup (automatic with Jest/Vitest afterEach, but manual if needed)
cleanup();
```

## Testing Patterns

### Form submission

```typescript
test('submits form with validation', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<SignupForm onSubmit={onSubmit} />);

  // Submit empty — shows errors
  await user.click(screen.getByRole('button', { name: 'Sign Up' }));
  expect(screen.getByText('Email is required')).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();

  // Fill and submit
  await user.type(screen.getByLabelText('Email'), 'alice@test.com');
  await user.type(screen.getByLabelText('Password'), 'secret123');
  await user.click(screen.getByRole('button', { name: 'Sign Up' }));

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'alice@test.com',
    password: 'secret123',
  });
});
```

### Async data loading

```typescript
test('loads and displays users', async () => {
  render(<UserList />);

  // Loading state
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  // Wait for data
  const users = await screen.findAllByRole('listitem');
  expect(users).toHaveLength(3);

  // Loading gone
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});
```

### Modal dialog

```typescript
test('opens and closes modal', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: 'Open Settings' }));

  const dialog = screen.getByRole('dialog');
  expect(dialog).toBeVisible();
  expect(within(dialog).getByRole('heading')).toHaveTextContent('Settings');

  await user.click(within(dialog).getByRole('button', { name: 'Close' }));

  await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
});
```

### within (scoped queries)

```typescript
import { within } from '@testing-library/react';

const nav = screen.getByRole('navigation');
within(nav).getByRole('link', { name: 'Home' });

const row = screen.getAllByRole('row')[1];
within(row).getByRole('cell', { name: 'Alice' });
```

### Error boundary

```typescript
test('shows error fallback', () => {
  const BrokenComponent = () => { throw new Error('Oops'); };

  render(
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <BrokenComponent />
    </ErrorBoundary>
  );

  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
});
```

## Setup File

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',  // or 'happy-dom'
    setupFiles: ['./tests/setup.ts'],
  },
});
```

## Tips

- **Use `getByRole` first** — it tests what users and assistive tech see, not implementation details
- **Use `userEvent` over `fireEvent`** — `userEvent` simulates real browser behavior (focus, blur, keyboard events)
- **Always `await` user events** — they're async in `userEvent.setup()` mode
- **Use `queryBy` for absence assertions** — `getBy` throws when element is missing
- **Use `findBy` for async content** — it retries until timeout
- **Use `within()` for scoped queries** — avoids ambiguous matches
- **Don't test implementation details** — test what users see, not state/props/classNames
- **Don't use container.querySelector** — use Testing Library queries instead
- **Use `screen`** — it's the default container and works without destructuring render
- `@testing-library/jest-dom` works with both Jest and Vitest

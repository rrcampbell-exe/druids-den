# The Druids Den

The online hub for The Druids Den in Vilas County, Wisconsin.

## Testing Guide

This project uses [Vitest](https://vitest.dev/) for unit testing React components and utilities.

### Running Tests

```bash
# Run tests in watch mode (interactive)
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

Test files are organized in a dedicated `__tests__` directory, separated by functionality:

```
__tests__/
├── api/
│   └── verify-passcode.test.js
├── components/
│   ├── Awen.test.jsx
│   ├── CaptionedImage.test.jsx
│   ├── Coelbren.test.jsx
│   ├── Flower.test.jsx
│   ├── Leaf.test.jsx
│   ├── PageNav.test.jsx
│   ├── PasscodePrompt.test.jsx
│   ├── ProtectedRoute.test.jsx
│   └── Weather.test.jsx
├── pages/
│   ├── Landing.test.jsx
│   ├── Spooktoberfest.test.jsx
│   └── WhatToExpect.test.jsx
└── utils/
    └── coelbrenify.test.js
```

### Test Coverage

The test suite includes comprehensive coverage for:

#### API Functions (22 tests)
- **verify-passcode**: HTTP method validation, environment configuration, passcode validation, token generation, security checks

#### Utilities (8 tests)
- **coelbrenify**: Character mapping function with edge cases

#### Components (77 tests)
- **Simple Components**: Awen, Flower, Leaf, Coelbren
- **CaptionedImage**: Lazy loading with IntersectionObserver
- **Weather**: API integration, loading states, error handling
- **PageNav**: Navigation, dropdowns, mobile menu, active states
- **PasscodePrompt**: Form handling, validation, async submission
- **ProtectedRoute**: Authentication logic, token validation

#### Pages (24 tests)
- **Landing**: Conditional rendering, date-based visibility, image loading, snapshots
- **Spooktoberfest**: Page structure, navigation items, snapshots
- **WhatToExpect**: Page structure, content sections, snapshots

### Testing Tools

- **Vitest**: Fast unit test framework
- **@testing-library/react**: React component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Extended matchers
- **jsdom**: DOM environment for testing
- **@vitest/coverage-v8**: Code coverage reporting

### Coverage Reporting

The project is configured with code coverage tracking. Coverage reports are generated in multiple formats:

- **Text**: Console output showing coverage summary
- **HTML**: Interactive browser-based report in `coverage/` directory
- **JSON**: Machine-readable coverage data
- **LCOV**: Compatible with CI/CD tools and code quality platforms

**Coverage Thresholds:**
- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

To view the HTML coverage report after running tests:
```bash
npm run test:coverage
open coverage/index.html
```

### Mocks

Global mocks are configured in [src/setupTests.js](src/setupTests.js):
- IntersectionObserver
- localStorage
- fetch API
- Jest-DOM matchers

### Writing Tests

Example test structure:

```javascript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Best Practices

1. **Test user behavior**, not implementation details
2. **Use semantic queries** (`getByRole`, `getByLabelText`, `getByText`)
3. **Mock external dependencies** (API calls, browser APIs)
4. **Test edge cases** (empty states, errors, loading)
5. **Keep tests simple and focused** on one behavior at a time

## CI/CD Integration

Tests can be integrated into your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm run test:run
```

### Troubleshooting

#### Tests timing out
- Increase timeout in `waitFor` options
- Check for unresolved promises

#### Mock not working
- Ensure mocks are cleared with `vi.clearAllMocks()` in `beforeEach`
- Check mock setup in setupTests.js

#### Act warnings
- Wrap state updates in `await waitFor()`
- Use `userEvent` instead of `fireEvent` for interactions

# Testing

The project uses Vitest 4, Testing Library, and `jsdom`. Test files live under `__tests__/` and mirror the source surfaces they exercise: `api/`, `components/`, `hooks/`, `pages/`, and `utils/`.

## Commands

```sh
npm test
npm run test:run
npm run test:ui
npm run lint
npm run build
```

`npm test` runs coverage. `npm run test:run` is the non-interactive full suite and is the preferred baseline check during development. Coverage is generated in `coverage/` with text, JSON, HTML, and LCOV reports.

Current coverage thresholds are 80% for lines, functions, and statements, and 75% for branches. Coverage includes `src/**/*.{js,jsx}` and `api/**/*.js`, excluding setup, entry-point, test, coverage, and build files as configured in `vite.config.js`.

## Shared Test Environment

`src/setupTests.js` provides Clerk component/hook mocks, Vercel Analytics and Speed Insights mocks, Testing Library cleanup, `IntersectionObserver`, `localStorage`, and `fetch`. Tests that need different authentication, storage, or request behavior should reset or override these mocks locally without changing global expectations for unrelated tests.

API tests invoke handlers directly and mock external dependencies such as Prisma, Clerk, email delivery, and analytics. Do not rely on a shared production-like database for unit tests.

## Choosing Checks

| Change | First check |
| --- | --- |
| Utility or component | Its focused test file. |
| API handler or shared server helper | Its focused API test file, including authorization and error paths. |
| Route, auth, or reservation behavior | Focused tests, then `npm run test:run`. |
| Styles or public copy | `npm run lint`, `npm run build`, and mobile/desktop browser inspection. |
| Documentation only | `git diff --check` and link/reference review. |

Run `npm run lint`, `npm run test:run`, and `npm run build` before merging a behavior change. Add or update tests for changed authorization, input validation, privacy boundaries, endpoint contracts, and user-visible error states.

## Test Data Safety

Use synthetic names, addresses, contact details, and dates. Never add live credentials, guest data, property access information, or real private location details to fixtures, snapshots, recorded responses, or coverage artifacts.
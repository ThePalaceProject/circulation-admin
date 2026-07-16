# Jest Unit Tests

This directory holds the project's unit tests. The structure mirrors the `src` tree, and each test file is named `*.test.ts` / `*.test.tsx` — jest's `testMatch` only looks here, so a test placed elsewhere will not run.

```bash
npm test                                        # the whole suite
npm run test-jest-file tests/jest/path/My.test.tsx   # a single file
npx jest --testPathPattern='components/My\.test'     # or by pattern
```

Components are tested with React Testing Library. Two conventions worth knowing before you add a test:

- **Render the connected default export**, not the unconnected named export. `mapStateToProps` and `mapDispatchToProps` only run when the connected component mounts, so testing the bare component leaves that wiring uncovered.
- **Let on-mount fetches settle.** Stub the network and `await` a `findBy*` query; an unhandled rejection escaping the test will fail the run.

## Layout

Most directories here (`components/`, `reducers/`, `api/`, `features/`, `utils/`, …) mirror their counterpart in `src`. Three do not:

- `testUtils/` — `renderWithProviders()` / `componentWithProviders()` (Redux + app context + QueryClient), `renderWithContext()` (app context only), and `installFormDataShim()` for tests that submit the reusable `<Form>`.
- `fixtures/` — shared test data (`genreData`, `classificationsData`).
- `jest-setup.ts` — registers `@testing-library/jest-dom` matchers for every test.

Config lives in `jest.config.js` at the repo root; `CLAUDE.md` explains the environment settings and coverage constraints.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Admin interface for The Palace Project Circulation Manager. A React/Redux single-page application built with TypeScript that manages library circulation systems—collections, lanes, custom lists, patron management, and book metadata. Published to npm as `@thepalaceproject/circulation-admin` and consumed by the Circulation Manager backend (Python).

Built on `@thepalaceproject/web-opds-client` which provides the base OPDS catalog React component.

## Build & Development Commands

```bash
npm run dev                    # Watch build (for use with local Circulation Manager)
npm run dev-server -- --env=backend=https://your-cm-url  # Dev server against remote backend
npm run prod                   # Production build
npm run lint                   # Run ESLint (lint:js) + sass-lint
npm run lint:js                # Run ESLint over the whole tree (eslint . --max-warnings 0)
npm test                       # Full jest suite
npm run test-jest-file <path>  # Single test: npm run test-jest-file tests/jest/components/MyTest.test.tsx
npm run coverage               # Test suite with coverage (what CI runs); writes coverage/jest/lcov.info
npm run dev-test-axe           # Dev build with react-axe accessibility checking (output in browser console)
```

Run a single file with `npx jest --testPathPattern='components/MyTest\.test'`.

The dev server can also read the backend URL from `.env` or `.env.local` with `BACKEND=https://...`.

## Architecture

### State Management (Dual System)

**Legacy Redux (majority of app):** `src/reducers/` contains ~30+ reducers combined in `src/reducers/index.ts`. Most follow the `createFetchEditReducer` factory pattern (`src/reducers/createFetchEditReducer.ts`) which generates standard CRUD state: `isFetching`, `isEditing`, `fetchError`, `formError`, `isLoaded` with `REQUEST/SUCCESS/FAILURE/LOAD/CLEAR` action types. Action creators are in `src/actions.ts`, extending `ActionCreator` from web-opds-client.

**Modern RTK (newer code):** `src/features/` uses Redux Toolkit slices and RTK Query. The API base is `src/features/api/apiSlice.ts`. The store (`src/store.ts`) combines both systems:

- `editor` — legacy reducers
- `catalog` — web-opds-client reducers
- `bookEditor` — RTK slice
- `api` — RTK Query

**React Query:** `@tanstack/react-query` is also used for server state in some newer components.

### App Context

`src/context/appContext.ts` provides configuration via React Context. Key hooks: `useAppContext()`, `useCsrfToken()`, `useAppAdmin()`, `useAppFeatureFlags()`. The context carries CSRF tokens, admin user info, feature flags, and support contact configuration.

### Component Patterns

- Mix of class components (legacy) and functional components (newer)
- React Router v3 (`react-router@^3.2.0`) — uses older API style
- React 16.8 — hooks are available but many components predate hooks
- Bootstrap 3 via react-bootstrap for UI primitives
- SCSS stylesheets in `src/stylesheets/`

### Key Entry Points

- `src/index.tsx` — Main entry, `CirculationAdmin` class that sets up all providers (Redux, Router, Context, QueryClient)
- `src/store.ts` — Redux store configuration
- `src/actions.ts` — All legacy action creators
- `src/interfaces.ts` — Core TypeScript types
- `src/reducers/index.ts` — Root reducer

## Testing

Every test runs under one jest config (`jest.config.js`). Tests live in `tests/jest/`, mirroring the `src/` tree, and are named `*.test.{ts,tsx}` — `testMatch` only picks up that directory, so `src/` holds no test code. Shared fixture data (`genreData`, `classificationsData`) is in `tests/jest/fixtures/`.

Tests are written with React Testing Library (+ `@testing-library/user-event`); `@testing-library/jest-dom` matchers are registered globally in `tests/jest/jest-setup.ts`. For API mocking the tree uses both MSW and `fetch-mock-jest` — `fetch-mock-jest` is the more common choice, MSW mainly where a request handler is clearer. Follow whichever the neighboring tests use.

Helpers in `tests/jest/testUtils/`:

- `withProviders.tsx` — `renderWithProviders()` and `componentWithProviders()` wrap a component in Redux, app Context, and QueryClient. Use these for anything touching the store.
- `renderWithContext.tsx` — lighter: app Context only.
- `formDataShim.ts` — `installFormDataShim()`; the reusable `<Form>` submit path needs it because undici's `FormData` rejects form elements.

**Writing tests — the traps that actually bite:**

- Render the **connected default export**, not the unconnected named export, or `mapStateToProps`/`mapDispatchToProps` never run and their coverage is lost. Mocking a connected child in a parent's test drops that child's wiring the same way — cover the child in its own test.
- Unhandled rejections fail the run: stub `fetch` and `await` a `findBy*` so on-mount fetches settle before the test ends.
- `EditableInput` renders label and input as siblings with no `htmlFor`, so reach for `getByText`, not `getByLabelText`.
- Mock react-router's `Link` as a `<div>`, not an `<a>` (jsx-a11y). Mock default exports as `{__esModule: true, default: ...}`.

**Environment:** `jest-fixed-jsdom` restores Node's `fetch`/`Response` globals so MSW can intercept them; `jest.polyfills.js` runs first via `setupFiles`. `testEnvironmentOptions.customExportConditions: [""]` keeps jsdom's default `["browser"]` condition from resolving ESM-only dependency bundles that ts-jest cannot transform. `moduleNameMapper` stubs asset, style, and markdown imports out to `tests/__mocks__/`.

**Coverage:** `npm run coverage` writes `coverage/jest/lcov.info`, uploaded to Codecov under the `jest` flag (`threshold: 0.2%`). There is no local coverage gate — Codecov and review are the enforcement. Two config constraints, both of which silently inflate the number if broken:

- `collectCoverageFrom` must stay at the _top level_ of `jest.config.js`; jest reads it off the global config, so nesting it leaves it globally undefined and every executed file gets instrumented, `tests/` helpers included.
- `roots` must keep `<rootDir>/src` so `collectCoverageFrom` can discover source files no test imports. Otherwise they are omitted from the report rather than counted as uncovered.

**End-to-end:** Nightwatch/selenium tests live in `tests/browser/` (config: `nightwatch.json`, run via `npm run test-browser`). They need credentials and a selenium install, are not part of `npm test`, and do not run in CI; see `tests/browser/README.md`.

## Code Style

- Prettier: double quotes, semicolons, trailing commas (es5), 80 char width
- ESLint (flat config, `eslint.config.mjs`) with `jsx-a11y/strict` — runs on the whole tree in CI via `npm run lint:js` (`eslint . --max-warnings 0`, so warnings fail the build) and on staged files via the husky pre-commit hook. `npm run lint` runs ESLint (`lint:js`) followed by sass-lint.
- `@typescript-eslint/no-explicit-any` is disabled (any is allowed)
- Prefer template literals over string concatenation for building strings with variables
- When an arrow function only passes its arguments through to another function with the same signature, pass the function directly instead of wrapping it (e.g., `onClick: this.handleClick` not `onClick: (e) => this.handleClick(e)`)
- Husky pre-commit hooks run eslint and prettier on staged files

## Output

Webpack builds to `dist/circulation-admin.js` (UMD library, global `CirculationAdmin`) and `dist/circulation-admin.css`. Node.js 24 required (>=24.0.0 <25.0.0).

## Code Conventions

- **Component names should reflect DOM role.** If a component renders an `<li>`, name it `FooListItem`, not `Foo`. The name should hint at what it produces in the DOM.
- **Put the component definition at the top of the file** (after imports and interfaces). Helper functions (`renderDetails`, `renderValue`, etc.) go below. This makes the component's shape immediately visible when opening the file.
- **Extract closure helpers into standalone functions** that take explicit parameters rather than closing over component variables. This makes data flow clear and keeps the component body concise.
- **Handle empty states with user-facing feedback.** When a list/collection can legitimately be empty in production (e.g., a library with no auth integrations), show a helpful alert or message rather than rendering a blank or empty form.
- **Keep type guards consistent with actual types.** Don't check for `undefined` when the type union doesn't include it — only guard against values the type actually allows.

## Pull Requests

When creating a PR, use the repository's PR template at `.github/pull_request_template.md`. Fill in all sections: Description, Motivation and Context, How Has This Been Tested, and the Checklist.

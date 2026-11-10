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
npm run typecheck              # Check types with tsc (Vitest does not check types)
npm test                       # Full Vitest suite
npm run test-file <path>       # Single test: npm run test-file tests/unit/components/MyTest.test.tsx
npm run coverage               # Test suite with coverage (what CI runs); writes coverage/unit/lcov.info
npm run dev-test-axe           # Dev build with react-axe accessibility checking (output in browser console)
```

Run a single file with `npx vitest run tests/unit/components/MyTest.test.tsx`.

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
- React Router 7 (`react-router@^7`), declarative mode. React Router 8 needs React 19.
  - `src/components/AppRoutes.tsx` maps each path to a page. It passes each page the `params` and `location` props that react-router v3 gave, so the pages did not change.
  - `src/components/LegacyRouterBridge.tsx` provides a v3-style `router` object through legacy context. Some class components read it there and use `push` and `getCurrentLocation`. web-opds-client also reads it, because web-opds-client still uses its own copy of react-router v3, whose `Link` also needs `createHref` and `isActive`. Use the React Router hooks in new code.
  - `<BrowserRouter useTransitions={false}>` updates on navigation at once, as v3 did, instead of in a React transition. Our class components, with their `UNSAFE_componentWillReceiveProps`, expect that.
- React 18.3 (mounted with `createRoot`)
  - Hooks are available but many components predate hooks.
  - Updates are batched, so don't read Redux-derived props right after an awaited dispatch; use the thunk's resolved value or `componentDidUpdate`.
- Bootstrap 3 via react-bootstrap for UI primitives
- SCSS stylesheets in `src/stylesheets/`

### Key Entry Points

- `src/index.tsx` — Main entry, `CirculationAdmin` class that sets up all providers (Redux, Router, Context, QueryClient)
- `src/store.ts` — Redux store configuration
- `src/actions.ts` — All legacy action creators
- `src/interfaces.ts` — Core TypeScript types
- `src/reducers/index.ts` — Root reducer

## Testing

Every test runs under one Vitest config (`vitest.config.mts`). Tests live in `tests/unit/`, mirroring the `src/` tree, and are named `*.test.{ts,tsx}` — `include` only picks up that directory, so `src/` holds no test code. Shared fixture data (`genreData`, `classificationsData`) is in `tests/unit/fixtures/`. The `tests/unit/testUtils/mswServerFixtures/*.fixture.ts` files are not data. They are test files that only `mswServer.test.ts` runs (see `mswServer.ts` below).

Tests are written with React Testing Library (+ `@testing-library/user-event`); `@testing-library/jest-dom` matchers are registered globally in `tests/unit/vitest-setup.ts`. Mock the network with MSW through `setupMswServer()` (below). Do not stub `fetch` by hand.

Helpers in `tests/unit/testUtils/`:

- `withProviders.tsx` — `renderWithProviders()` and `componentWithProviders()` wrap a component in Redux, app Context, and QueryClient. Use these for anything touching the store. Pass `route` (for example `{ route: "/admin/web" }`) to also render inside a React Router `MemoryRouter` with `LegacyRouterBridge`, so links and navigation work.
- `renderWithContext.tsx` — lighter: app Context only.
- `mswServer.ts` — `setupMswServer(...handlers)` starts an MSW server and returns `{ server, requests }`. `requests` holds a copy of each request the current test sent, so assert on its URL, method, headers, and body. Add per-test handlers with `server.use()`. A request with no matching handler fails the test, even if the app catches the rejected `fetch`. The helper sends `fetch(null)` as a request for the relative path "null" (`GET http://localhost/null` in tests), as a browser does, so a request built from a missing URL fails as unhandled instead of being hidden. Call it once per file, at the top level or in sibling `describe` blocks. Do not nest the calls, because two servers at once each treat the other's handlers as unhandled. Match each endpoint by path. A `"*"` catch-all matches every request, so it turns off the unhandled-request check. Use one only inside a single test, for example to hold the page in its loading state. The helper's own test, `mswServer.test.ts`, runs the files in `mswServerFixtures/` in a separate Vitest process. Some of them fail on purpose, so they end in `.fixture.ts` and the main run skips them. Do not rename them to `.test.ts`.
- `formDataShim.ts` — `installFormDataShim()`; install it in a test that submits the reusable `<Form>`. It sends only the form's successful controls, as a browser does, and leaves out file inputs. For a file input, jsdom's own FormData puts a jsdom `File` in the payload, and Node's `fetch` rejects that object. The shim returns a real `FormData`, so MSW can read the submitted fields.

**Writing tests — the traps that actually bite:**

- Render the **connected default export**, not the unconnected named export, or `mapStateToProps`/`mapDispatchToProps` never run and their coverage is lost. Mocking a connected child in a parent's test drops that child's wiring the same way — cover the child in its own test.
- Unhandled rejections fail the run: add an MSW handler for each request and `await` a `findBy*` so on-mount fetches settle before the test ends.
- Query form fields by their accessible label, as a screen reader would: `getByRole("textbox", { name: /Label/i })` or `getByLabelText(/Label/i)`. The role follows what `EditableInput` renders: `elementType="select"` is a `combobox`, and `type="checkbox"` or `"radio"` are those roles. A passing query proves the field is labeled. `EditableInput` nests the input inside its `<label>`, so both work, but use a regex: a required field's label text includes "Required". An `EditableInput` with no `label` prop may still have an accessible name through `aria-label`. If it has no accessible name, treat that as an accessibility bug in the component, not something to work around in the test.
- To test links, use a real router, not a mocked `Link`. Then assert the real `href`, click it, and check where it went. A mocked `Link` hides what React Router does with its target: for example, React Router 7 turns `to={null}` into a link to the current page, and a click on it throws. Pick the router this way:
  - Use the `route` option of `renderWithProviders` for a component that reads the legacy `router` context: web-opds-client's `CatalogLink`, the tab containers, and `Header`. It includes `LegacyRouterBridge`. Without the bridge, `CatalogLink` throws `router.createHref is not a function`.
  - Use a bare `MemoryRouter` wrapper only for a component that renders just React Router's own `Link`, such as `Lane`.
  - A mock of `react-router` does not reach `CatalogLink`, because it uses web-opds-client's own react-router v3.
- If you must mock `Link`, mock it as a `<div>`, not an `<a>` (jsx-a11y). Mock a default export as `{ default: ... }`. A `vi.mock` factory needs the `default` key, and Vitest does not need `__esModule`.

**Environment:** tests run in jsdom, with `describe`, `it`, `expect`, and `vi` as globals. `tests/unit/vitest-polyfills.js` runs first. It makes `Request` resolve a relative URL against the page URL, as a browser does, because RTK Query builds requests from relative URLs. `resolve.alias` in `vitest.config.mts` stubs asset and markdown imports out to `tests/__mocks__/fileMock.js`. `jsdom` is on 26 on purpose: a later version loses the space before a `<span>` in the accessible names that `getByRole` matches, and that needs test changes.

**Vitest differences that matter here:**

- Vitest does not check types. Run `npm run typecheck`; CI runs it too.
- `vi.mock` calls run before the rest of the file, so a factory cannot use a `const` from the file. Use a function declaration or `vi.hoisted`.
- `vi.spyOn` works on an export of our own `src/` modules, not on an export of a package. Use `vi.mock` for a package.
- In `src/`, use `import`, not `require`, for anything a test mocks and for assets. `vi.mock` and `resolve.alias` do not apply to `require`. Do not write `import React = require("react")` in a `.tsx` file: the import is removed as unused and `React` is undefined at run time.
- `sequence.hooks` is `"list"`, so `afterEach` and `afterAll` hooks run in the order they are defined, as in Jest.

**Coverage:** `npm run coverage` writes `coverage/unit/lcov.info`, uploaded to Codecov under the `unit` flag (`threshold: 0.2%`). There is no local coverage gate — Codecov and review are the enforcement. `coverage.include` in `vitest.config.mts` must keep listing `src`, so that source files no test imports are counted as uncovered instead of being left out of the report.

**End-to-end:** Nightwatch/selenium tests live in `tests/browser/` (config: `nightwatch.json`, run via `npm run test-browser`). They need credentials and a selenium install, are not part of `npm test`, and do not run in CI; see `tests/browser/README.md`.

## Code Style

- Prettier (double quotes, semicolons, trailing commas (es5), printWidth 80) and ESLint are authoritative for formatting and style. The husky pre-commit hook auto-formats staged files with Prettier, and CI runs ESLint (`npm run lint:js`), so do not flag or hand-verify formatting. printWidth is a soft target, not a hard limit; lines Prettier leaves longer than 80 (e.g., interface `extends` clauses) are fine, and there is no ESLint max-len rule.
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

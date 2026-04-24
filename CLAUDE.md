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
npm run lint                   # Run tslint + sass-lint
npm test                       # Full test suite (mocha legacy + jest)
npm run test-jest              # Jest tests only
npm run test-jest-file <path>  # Single jest test: npm run test-jest-file tests/jest/components/MyTest.test.tsx
npm run test-file-ts <path>    # Single mocha test: npm run test-file-ts src/components/__tests__/MyTest-test.tsx
npm run dev-test-axe           # Dev build with react-axe accessibility checking (output in browser console)
```

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

**Two test systems coexist:**

1. **Jest** (for all new tests): Tests in `tests/jest/` mirroring `src/` structure. Uses React Testing Library, jest-dom, and MSW for API mocking. Test utilities in `tests/jest/testUtils/withProviders.tsx` provide `renderWithProviders()` and `componentWithProviders()` to wrap components with Redux, Context, and QueryClient.

2. **Mocha** (legacy): Tests in `src/*/__tests__/` directories. Uses Enzyme with React 16 adapter. Do not add new mocha tests.

## Code Style

- Prettier: double quotes, semicolons, trailing commas (es5), 80 char width
- ESLint with `jsx-a11y/strict` — accessibility rules are enforced via the husky pre-commit hook (not `npm run lint`, which runs tslint + sass-lint)
- `@typescript-eslint/no-explicit-any` is disabled (any is allowed)
- Prefer template literals over string concatenation for building strings with variables
- When an arrow function only passes its arguments through to another function with the same signature, pass the function directly instead of wrapping it (e.g., `onClick: this.handleClick` not `onClick: (e) => this.handleClick(e)`)
- Husky pre-commit hooks run eslint and prettier on staged files

## Output

Webpack builds to `dist/circulation-admin.js` (UMD library, global `CirculationAdmin`) and `dist/circulation-admin.css`. Node.js 20+ required.

## Code Conventions

- **Component names should reflect DOM role.** If a component renders an `<li>`, name it `FooListItem`, not `Foo`. The name should hint at what it produces in the DOM.
- **Put the component definition at the top of the file** (after imports and interfaces). Helper functions (`renderDetails`, `renderValue`, etc.) go below. This makes the component's shape immediately visible when opening the file.
- **Extract closure helpers into standalone functions** that take explicit parameters rather than closing over component variables. This makes data flow clear and keeps the component body concise.
- **Handle empty states with user-facing feedback.** When a list/collection can legitimately be empty in production (e.g., a library with no auth integrations), show a helpful alert or message rather than rendering a blank or empty form.
- **Keep type guards consistent with actual types.** Don't check for `undefined` when the type union doesn't include it — only guard against values the type actually allows.

## Pull Requests

When creating a PR, use the repository's PR template at `.github/pull_request_template.md`. Fill in all sections: Description, Motivation and Context, How Has This Been Tested, and the Checklist.

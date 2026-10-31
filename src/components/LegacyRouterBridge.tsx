import * as React from "react";
import { createPath, Location, useLocation, useNavigate } from "react-router";
import RouterProvider, {
  RouterContextProps,
} from "@thepalaceproject/web-opds-client/lib/components/context/RouterContext";

/** A location in the form react-router v3's `router.push` accepted. */
export type LegacyLocation =
  | string
  | { pathname: string; search?: string; hash?: string; state?: unknown };

/** The react-router v3 `router` methods that this app and web-opds-client use. */
export interface LegacyRouter {
  push: (location: LegacyLocation) => void;
  createHref: (location: LegacyLocation) => string;
  getCurrentLocation: () => Location;
  isActive: () => boolean;
}

// web-opds-client's props type predates React 18, which dropped the implicit
// `children` prop.
const LegacyRouterProvider = RouterProvider as React.ComponentType<
  RouterContextProps & { children?: React.ReactNode }
>;

/**
 * Provides a react-router v3 style `router` object, built from React Router 7,
 * through legacy context. Some of our class components, and web-opds-client
 * (which still uses its own react-router v3 `Link`), read `router` from there.
 * Remove this when nothing reads the legacy `router` context.
 *
 * Unlike v3:
 * - `push` does nothing while the app first mounts, for example from a
 *   `componentDidMount` on the first page load. React Router 7 ignores
 *   navigation until its own setup is done, and only logs a warning. Push from
 *   an event handler or a later update (as TroubleshootingTabContainer does
 *   from `UNSAFE_componentWillReceiveProps`), not during the first mount.
 * - The location changes only when React renders again. So a second `push`
 *   in the same event handler compares with the location from before the
 *   first one. Do not push more than once in one event handler.
 */
const LegacyRouterBridge = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Read the newest values from a ref. Set the ref during render, not in an
  // effect, so that a component which calls `getCurrentLocation()` while it
  // renders (as Header does) sees the location being rendered.
  const latest = React.useRef<LatestValues>({ navigate, location });
  latest.current = { navigate, location };

  // `useState`, not `useMemo`: React may drop a memoized value, and v3 had one
  // `router` object for the life of the app.
  const [router] = React.useState(() => createLegacyRouter(latest));

  return (
    <LegacyRouterProvider router={router}>{children}</LegacyRouterProvider>
  );
};

export default LegacyRouterBridge;

type LatestValues = {
  navigate: ReturnType<typeof useNavigate>;
  location: Location;
};

const toPath = (location: LegacyLocation): string =>
  typeof location === "string"
    ? location
    : `${location.pathname}${location.search ?? ""}${location.hash ?? ""}`;

// v3 compared state by value. Location state here is plain data (for example
// `{ bookTitle }`), so comparing the JSON is enough.
const sameState = (a: unknown, b: unknown): boolean =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

const createLegacyRouter = (
  latest: React.MutableRefObject<LatestValues>
): LegacyRouter => ({
  push: (location) => {
    const path = toPath(location);
    const state = typeof location === "string" ? undefined : location.state;
    const current = latest.current.location;
    void latest.current.navigate(path, {
      // Like v3, replace the history entry instead of adding a copy when the
      // path and the state are the current ones.
      replace: path === createPath(current) && sameState(state, current.state),
      state,
    });
  },
  createHref: toPath,
  getCurrentLocation: () => latest.current.location,
  // The v3 `Link` requires this, but calls it only for active link styles.
  // This always says "not active", so do not give a v3 `Link` an
  // `activeClassName` or `activeStyle`.
  isActive: () => false,
});

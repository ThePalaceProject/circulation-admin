// Helpers shared by the config pages whose "Libraries" sections resolve
// associated-library short names against the sitewide library list kept in
// state.editor.libraries.

import ActionCreator from "../actions";
import { LibraryData } from "../interfaces";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";

/**
 * Returns the sitewide library list once its request has settled, or an
 * empty object while the request is still pending. A failed request settles
 * to an empty list plus the error. Consumers can therefore tell "still
 * loading" (allLibraries undefined) apart from "no libraries" ([]), and can
 * report a failure. A retry after a failure also counts as settled (the
 * reducer keeps the old failure as lastFetchError), so the previous error
 * stays visible while the retry runs.
 *
 * Merge the result into the `data` prop built by a config page's
 * mapStateToProps.
 */
export function settledAllLibraries(state): {
  allLibraries?: LibraryData[];
  allLibrariesError?: FetchErrorData;
} {
  const libraries = state.editor.libraries;
  if (
    !libraries?.isLoaded &&
    !libraries?.fetchError &&
    !libraries?.lastFetchError
  ) {
    return {};
  }
  // With a loaded list in hand, a failure recorded by a concurrent or
  // later request is not worth blocking the UI over; show the list.
  const loaded = libraries.data?.libraries;
  return {
    allLibraries: loaded ?? [],
    allLibrariesError: loaded
      ? undefined
      : (libraries.fetchError ?? libraries.lastFetchError ?? undefined),
  };
}

/**
 * Fetches the sitewide library list unless a copy is already loaded or a
 * request is already in flight (the app header also fetches it on mount).
 * A previously failed request is retried. A failure lands in Redux state;
 * the catch only avoids an unhandled rejection.
 */
export function fetchLibrariesIfNeeded(dispatch, actions: ActionCreator): void {
  dispatch((thunkDispatch, getState) => {
    const libraries = getState().editor.libraries;
    const inFlight = libraries?.isFetching;
    const settledCleanly = libraries?.isLoaded && !libraries.fetchError;
    if (!inFlight && !settledCleanly) {
      thunkDispatch(actions.fetchLibraries()).catch(() => {});
    }
  });
}

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
 * report a failure.
 *
 * Merge the result into the `data` prop built by a config page's
 * mapStateToProps.
 */
export function settledAllLibraries(state): {
  allLibraries?: LibraryData[];
  allLibrariesError?: FetchErrorData;
} {
  const libraries = state.editor.libraries;
  if (!libraries?.data && !libraries?.isLoaded) {
    return {};
  }
  return {
    allLibraries: libraries.data?.libraries ?? [],
    allLibrariesError: libraries.fetchError ?? undefined,
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
    if (
      !libraries?.isFetching &&
      (!libraries?.isLoaded || libraries?.fetchError)
    ) {
      thunkDispatch(actions.fetchLibraries()).catch(() => {});
    }
  });
}

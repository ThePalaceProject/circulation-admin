// Helpers shared by the config pages whose "Libraries" sections resolve
// associated-library short names against the sitewide library list kept in
// state.editor.libraries.

import ActionCreator from "../actions";
import { AllLibrariesData } from "../interfaces";
import { LibrariesState } from "../reducers/libraries";

/**
 * Returns the sitewide library list once its request has settled, or an
 * empty object while the request is still pending. A failed request settles
 * to an empty list plus the error. Consumers can therefore tell "still
 * loading" (allLibraries undefined) apart from "no libraries" ([]), and can
 * report a failure. A retry after a failure also counts as settled (the
 * reducer keeps the old failure as lastFetchError), so the previous error
 * stays visible while the retry runs.
 *
 * A failure with no list at all is blocking (allLibrariesError). A failure
 * beside the retained copy of the list means the copy may be out of date
 * (allLibrariesRefreshError). A failure beside a current list is reported
 * as neither: the list on screen is up to date, and concurrent requests
 * with mixed outcomes must not degrade a working page.
 *
 * Merge the result into the `data` prop built by a config page's
 * mapStateToProps.
 */
export function settledAllLibraries(state): AllLibrariesData {
  const libraries = state.editor.libraries;
  const current = currentLibraries(libraries);
  const loaded = retainedLibraries(libraries);
  const error = retainedError(libraries);
  if (!loaded && !error) {
    return {};
  }
  return {
    allLibraries: loaded ?? [],
    allLibrariesError: loaded ? undefined : error,
    allLibrariesRefreshError: loaded && !current ? error : undefined,
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
    const settledCleanly =
      !!retainedLibraries(libraries) && !retainedError(libraries);
    if (!inFlight && !settledCleanly) {
      thunkDispatch(actions.fetchLibraries()).catch(() => {});
    }
  });
}

// The predicates settled-ness is derived from, feeding both functions
// above. The two deliberately differ on one state: a failure beside a
// current list is nothing to report for settledAllLibraries, while
// fetchLibrariesIfNeeded still retries it to clear the stray fetchError.
// isLoaded is deliberately not consulted: actions from the shared
// EDIT_LIBRARY prefix can clear fetchError while leaving isLoaded true,
// and isLoaded alone proves neither a list nor an error worth showing.

/** The current list, from data. */
const currentLibraries = (libraries?: LibrariesState) =>
  libraries?.data?.libraries;

/** The list in hand: the current one, or the copy retained during a refetch. */
const retainedLibraries = (libraries?: LibrariesState) =>
  currentLibraries(libraries) ?? libraries?.lastData?.libraries;

/** The failure in hand: the current one, or the one a retry is retrying. */
const retainedError = (libraries?: LibrariesState) =>
  libraries?.fetchError ?? libraries?.lastFetchError ?? undefined;

import { LibrariesData } from "../interfaces";
import { RequestError } from "@thepalaceproject/web-opds-client/lib/DataFetcher";
import ActionCreator from "../actions";
import createFetchEditReducer, {
  FetchEditState,
} from "./createFetchEditReducer";

export interface LibrariesState extends FetchEditState<LibrariesData> {
  /**
   * The failure that a retry now in flight is retrying. Kept under its own
   * key so that fetchError keeps meaning "the current request failed" for
   * direct consumers (e.g. the Libraries config page); consumers that want
   * to keep showing the old failure during the retry read this instead.
   * Cleared when the retry settles (FAILURE or LOAD).
   */
  lastFetchError?: RequestError | null;
  /**
   * The last loaded list while a refetch is in flight. Kept under its own
   * key so that data keeps its normal request lifecycle for the Libraries
   * config page (whose edit form must unmount during the post-save
   * refetch); settledAllLibraries serves this copy so the other config
   * tabs do not flip back to "loading". Kept through a FAILURE so a stale
   * copy stays available; cleared when a fresh list LOADs.
   */
  lastData?: LibrariesData | null;
}

const fetchEditReducer = createFetchEditReducer<LibrariesData>(
  ActionCreator.LIBRARIES,
  ActionCreator.EDIT_LIBRARY
);

const librariesAction = (action: string) =>
  `${ActionCreator.LIBRARIES}_${action}`;

const editLibraryAction = (action: string) =>
  `${ActionCreator.EDIT_LIBRARY}_${action}`;

export default (state: LibrariesState | undefined, action): LibrariesState => {
  const next: LibrariesState = fetchEditReducer(state, action);
  if (action.type === librariesAction(ActionCreator.REQUEST)) {
    // Fall back to the already-retained copies so that a second request
    // starting before the first settles (e.g. the header's fetch and the
    // Libraries tab's fetch overlap) does not discard them. A failure
    // recorded beside current data is dropped, not retained: consumers
    // already ignore it (see settledAllLibraries), so carrying it would
    // resurface it against the retained copy during the refetch.
    return {
      ...next,
      lastData: state?.data ?? state?.lastData ?? null,
      lastFetchError: state?.data
        ? null
        : (state?.fetchError ?? state?.lastFetchError ?? null),
    };
  }
  if (action.type === librariesAction(ActionCreator.FAILURE)) {
    // fetchError now carries the new failure; lastData rides along in
    // `next` so consumers can keep serving the stale list.
    return { ...next, lastFetchError: null };
  }
  if (action.type === librariesAction(ActionCreator.LOAD)) {
    return { ...next, lastData: null, lastFetchError: null };
  }
  if (
    action.type === editLibraryAction(ActionCreator.REQUEST) ||
    action.type === editLibraryAction(ActionCreator.SUCCESS)
  ) {
    // The base reducer clears fetchError when a library form submit starts
    // or succeeds; keep a pending list-fetch failure as lastFetchError so
    // consumers do not mistake the state for a cleanly loaded list. As in
    // the LIBRARIES_REQUEST branch, a failure beside current data is
    // dropped, since consumers ignore it.
    return {
      ...next,
      lastFetchError: state?.data
        ? null
        : (state?.fetchError ?? state?.lastFetchError ?? null),
    };
  }
  return next;
};

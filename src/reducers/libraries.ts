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
}

const fetchEditReducer = createFetchEditReducer<LibrariesData>(
  ActionCreator.LIBRARIES,
  ActionCreator.EDIT_LIBRARY
);

const librariesAction = (action: string) =>
  `${ActionCreator.LIBRARIES}_${action}`;

export default (state: LibrariesState | undefined, action): LibrariesState => {
  const next: LibrariesState = fetchEditReducer(state, action);
  if (action.type === librariesAction(ActionCreator.REQUEST)) {
    // Keep the already-loaded list visible while a refetch is in flight
    // (the Libraries tab refetches on every config-page mount and after
    // every save), so consumers do not flip back to "loading". Also fall
    // back to the already-retained failure so that a second request
    // starting before the first settles (e.g. the header's fetch and the
    // Libraries tab's fetch overlap) does not discard it.
    return {
      ...next,
      data: state?.data ?? null,
      isLoaded: !!state?.data,
      lastFetchError: state?.fetchError ?? state?.lastFetchError ?? null,
    };
  }
  if (
    action.type === librariesAction(ActionCreator.FAILURE) ||
    action.type === librariesAction(ActionCreator.LOAD)
  ) {
    return { ...next, lastFetchError: null };
  }
  return next;
};

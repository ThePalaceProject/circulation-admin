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
    return { ...next, lastFetchError: state?.fetchError ?? null };
  }
  if (
    action.type === librariesAction(ActionCreator.FAILURE) ||
    action.type === librariesAction(ActionCreator.LOAD)
  ) {
    return { ...next, lastFetchError: null };
  }
  return next;
};

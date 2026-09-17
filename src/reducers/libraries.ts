import { LibrariesData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer, {
  FetchEditState,
} from "./createFetchEditReducer";

const fetchEditReducer = createFetchEditReducer<LibrariesData>(
  ActionCreator.LIBRARIES,
  ActionCreator.EDIT_LIBRARY
);

/**
 * The standard fetch-edit reducer, except that a refetch after a failure
 * keeps the failed state (fetchError, isLoaded) visible while the retry is
 * in flight. The plain REQUEST handler clears both, which would flip
 * consumers from "failed" back to "loading" on every retry.
 */
export default (
  state: FetchEditState<LibrariesData> | undefined,
  action
): FetchEditState<LibrariesData> => {
  const next = fetchEditReducer(state, action);
  if (
    action.type === `${ActionCreator.LIBRARIES}_${ActionCreator.REQUEST}` &&
    state?.fetchError
  ) {
    return { ...next, fetchError: state.fetchError, isLoaded: state.isLoaded };
  }
  return next;
};

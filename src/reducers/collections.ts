import { CollectionsData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

// This is only to update a specific collection's self test results property.
const loadCB = (state, action) => {
  const data = JSON.parse(JSON.stringify(state.data));
  if (!data.collections.length) {
    return {};
  }

  data.collections.forEach(collection => {
    if (collection.id === action.data.collection.id) {
      collection.self_test_results = action.data.collection.self_test_results;
    }
  });

  return Object.assign({}, state, {
    data: data,
    isFetching: false,
    isLoaded: true,
  });
};

const extraActions = {
  [`${ActionCreator.GET_SELF_TESTS}_${ActionCreator.LOAD}`]: loadCB,
};

export default createFetchEditReducer<CollectionsData>(
  ActionCreator.COLLECTIONS,
  ActionCreator.EDIT_COLLECTION,
  extraActions,
);

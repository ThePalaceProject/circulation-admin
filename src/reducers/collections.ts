import { CollectionsData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

// This is only to update a specific collection's self test results property.
const manipulateData = (data, action) => {
  if (!data.collections.length) {
    return {};
  }

  data.collections.forEach(collection => {
    if (collection.id === action.data.collection.id) {
      collection.self_test_results = action.data.collection.self_test_results;
    }
  });

  return data;
};

export default createFetchEditReducer<CollectionsData>(
  ActionCreator.COLLECTIONS,
  ActionCreator.EDIT_COLLECTION,
  ActionCreator.GET_SELF_TESTS,
  manipulateData
);

import { SearchServicesData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

// This is only to update a specific search service's self test results property.
const loadCB = (state, action) => {
  const data = JSON.parse(JSON.stringify(state.data));

  if (!data.search_services.length) {
    return {};
  }

  data.search_services.forEach(search_service => {
    if (search_service.id === action.data.self_test_results.id) {
      search_service.self_test_results = action.data.self_test_results.self_test_results;
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

export default createFetchEditReducer<SearchServicesData>(
  ActionCreator.SEARCH_SERVICES,
  ActionCreator.EDIT_SEARCH_SERVICE,
  extraActions
);

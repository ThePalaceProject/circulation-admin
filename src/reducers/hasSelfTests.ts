import ActionCreator from "../actions";

// This updates a specific search service or collection's self test results property.

const loadCB = (state, action) => {
  const data = JSON.parse(JSON.stringify(state.data));
  let dataType = Object.keys(data)[0];

  if (!data[dataType].length) {
    return {};
  }

  data[dataType].forEach(x => {
    if (x.id === action.data.self_test_results.id) {
      x.self_test_results = action.data.self_test_results.self_test_results;
    }
  });

  return Object.assign({}, state, {
    data: data,
    isFetching: false,
    isLoaded: true,
  });
};

export const extraActions = {
  [`${ActionCreator.GET_SELF_TESTS}_${ActionCreator.LOAD}`]: loadCB,
};

interface ComplaintsState {
  url: string;
  data: ComplaintsData;
  isFetching: boolean;
  fetchError: AsyncError;
  postError: AsyncError;
}

const initialState: ComplaintsState = {
  url: null,
  data: null,
  isFetching: false,
  fetchError: null,
  postError: null
};

export default (state: ComplaintsState = initialState, action) => {
  switch (action.type) {
    case "POST_COMPLAINT_REQUEST":
    case "FETCH_COMPLAINTS_REQUEST":
      return Object.assign({}, state, {
        url: action.url,
        isFetching: true,
        fetchError: null
      });

    case "FETCH_COMPLAINTS_FAILURE":
      return Object.assign({}, state, {
        fetchError: action.error,
        isFetching: false
      });

    case "POST_COMPLAINT_FAILURE":
      return Object.assign({}, state, {
        postError: action.error,
        isFetching: false
      });

    case "LOAD_COMPLAINTS":
      return Object.assign({}, state, {
        data: action.data,
        isFetching: false
      });

    default:
      return state;
  }
};
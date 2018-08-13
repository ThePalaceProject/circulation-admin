import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";
import { ServiceData } from "../interfaces";

const requestCB = (state, action) => {
  return Object.assign({}, state, {
    data: state.data,
    isLoaded: false,
    isFetching: true,
    fetchError: null,
  });
};

const successCB = (state, action) => {
  return Object.assign({}, state, {
    fetchError: null,
    isFetching: false,
  });
};

const loadCB = (state, action) => {
  return {};
};

const extraActions = {
  [`${ActionCreator.GET_SELF_TESTS}_${ActionCreator.REQUEST}`]: requestCB,
  [`${ActionCreator.GET_SELF_TESTS}_${ActionCreator.SUCCESS}`]: successCB,
  [`${ActionCreator.GET_SELF_TESTS}_${ActionCreator.LOAD}`]: loadCB,
};

export default createFetchEditReducer<ServiceData>(
  ActionCreator.RUN_SELF_TESTS,
  ActionCreator.GET_SELF_TESTS,
  extraActions,
);
